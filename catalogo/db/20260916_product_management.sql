
BEGIN;
ALTER TABLE public.pl_catalog_products ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

ALTER TABLE public.pl_catalog_products DROP CONSTRAINT IF EXISTS pl_catalog_products_has_price;
ALTER TABLE public.pl_catalog_products ADD CONSTRAINT pl_catalog_products_has_price CHECK
 (NOT is_active OR price IS NOT NULL OR original_price IS NOT NULL);

CREATE OR REPLACE FUNCTION public.pl_catalog_manage(p_store_id uuid, p_action text, p_data jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $fn$
DECLARE
  pid uuid; source_row public.pl_catalog_products; item jsonb; image_ids uuid[] := '{}';
  ids uuid[]; cats text[]; result jsonb; idx integer := 0; active_value boolean;
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.pl_catalog_stores s JOIN auth.users u ON u.id=auth.uid()
    WHERE s.id=p_store_id AND
    (lower(s.owner_email)=lower(u.email) OR u.raw_app_meta_data->>'pl_catalog_admin'='true')
  ) THEN RAISE EXCEPTION 'Acesso não autorizado'; END IF;

  IF p_action='list' THEN
    SELECT coalesce(jsonb_agg(to_jsonb(p) || jsonb_build_object('pl_catalog_product_images',
      (SELECT coalesce(jsonb_agg(to_jsonb(i) ORDER BY i.is_primary DESC, i.position, i.created_at),'[]'::jsonb)
       FROM public.pl_catalog_product_images i WHERE i.product_id=p.id))
      ORDER BY p.created_at DESC),'[]'::jsonb) INTO result
    FROM public.pl_catalog_products p WHERE p.store_id=p_store_id;
    RETURN result;
  END IF;

  IF p_action IN ('stage','duplicate') THEN
    IF nullif(p_data->>'request_id','') IS NULL THEN RAISE EXCEPTION 'Identificador obrigatório'; END IF;
    PERFORM pg_advisory_xact_lock(hashtextextended(p_store_id::text || (p_data->>'request_id'),0));
    SELECT id INTO pid FROM public.pl_catalog_products
      WHERE store_id=p_store_id AND client_request_id=p_data->>'request_id';
    IF pid IS NOT NULL THEN RETURN jsonb_build_object('id',pid); END IF;
    IF p_action='duplicate' THEN
      SELECT * INTO source_row FROM public.pl_catalog_products WHERE id=(p_data->>'id')::uuid AND store_id=p_store_id;
      IF NOT FOUND THEN RAISE EXCEPTION 'Produto não encontrado'; END IF;
      INSERT INTO public.pl_catalog_products(store_id,name,description,price,original_price,parcelas,installment_interest_rate,
        categoria,categoria_vitrine,categorias_vitrine,is_active,is_featured,client_request_id)
      VALUES(p_store_id,source_row.name||' (cópia)',source_row.description,source_row.price,source_row.original_price,
        source_row.parcelas,source_row.installment_interest_rate,source_row.categoria,source_row.categoria_vitrine,
        source_row.categorias_vitrine,false,source_row.is_featured,p_data->>'request_id') RETURNING id INTO pid;
      INSERT INTO public.pl_catalog_product_images(product_id,url,thumb_url,medium_url,position,is_primary,variant_name)
      SELECT pid,url,thumb_url,medium_url,position,is_primary,variant_name
        FROM public.pl_catalog_product_images WHERE product_id=source_row.id;
    ELSE
      INSERT INTO public.pl_catalog_products(store_id,name,is_active,categoria,client_request_id)
      VALUES(p_store_id,coalesce(nullif(trim(p_data->>'name'),''),'Produto sem nome'),false,'oculos',p_data->>'request_id')
      RETURNING id INTO pid;
    END IF;
    RETURN jsonb_build_object('id',pid);
  END IF;

  IF p_action='save' THEN
    pid=(p_data->>'id')::uuid;
    PERFORM 1 FROM public.pl_catalog_products WHERE id=pid AND store_id=p_store_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Produto não encontrado'; END IF;
    active_value=coalesce((p_data->>'is_active')::boolean,false);
    IF jsonb_array_length(coalesce(p_data->'images','[]'::jsonb))>5 THEN RAISE EXCEPTION 'Limite de 5 fotos'; END IF;
    FOR item IN SELECT value FROM jsonb_array_elements(coalesce(p_data->'images','[]'::jsonb)) LOOP
      IF NOT EXISTS(SELECT 1 FROM public.pl_catalog_product_images WHERE id=(item->>'id')::uuid AND product_id=pid)
         OR item->>'id' IS NULL OR (item->>'id')::uuid=ANY(image_ids) THEN
        RAISE EXCEPTION 'Foto inválida';
      END IF;
      image_ids=array_append(image_ids,(item->>'id')::uuid);
      UPDATE public.pl_catalog_product_images SET position=idx+1,is_primary=(idx=0),
        variant_name=nullif(left(trim(item->>'variant_name'),50),'') WHERE id=(item->>'id')::uuid AND product_id=pid;
      idx=idx+1;
    END LOOP;
    IF active_value AND (nullif(trim(p_data->>'name'),'') IS NULL OR idx=0 OR
      coalesce((p_data->>'price')::numeric,(p_data->>'original_price')::numeric,0)<=0)
      THEN RAISE EXCEPTION 'Para publicar, informe nome, preço e foto'; END IF;
    IF (p_data->>'price')::numeric<=0 OR (p_data->>'original_price')::numeric<=0
      OR ((p_data->>'price')::numeric IS NOT NULL AND (p_data->>'original_price')::numeric IS NOT NULL
          AND (p_data->>'price')::numeric >= (p_data->>'original_price')::numeric)
      THEN RAISE EXCEPTION 'Preços inválidos'; END IF;
    IF coalesce((p_data->>'installment_interest_rate')::numeric,0)<0 OR
       coalesce((p_data->>'installment_interest_rate')::numeric,0)>20 THEN RAISE EXCEPTION 'Juros inválidos'; END IF;
    SELECT coalesce(array_agg(value),'{}') INTO cats FROM jsonb_array_elements_text(coalesce(p_data->'categories','[]'::jsonb));
    UPDATE public.pl_catalog_products SET name=coalesce(nullif(trim(p_data->>'name'),''),'Produto sem nome'),
      price=(p_data->>'price')::numeric,original_price=(p_data->>'original_price')::numeric,
      description=nullif(p_data->>'description',''),parcelas=(p_data->>'parcelas')::smallint,
      installment_interest_rate=(p_data->>'installment_interest_rate')::numeric,
      categoria_vitrine=cats[1],categorias_vitrine=cats,is_active=active_value,
      is_featured=coalesce((p_data->>'is_featured')::boolean,false),updated_at=now()
      WHERE id=pid AND store_id=p_store_id;
    DELETE FROM public.pl_catalog_product_images WHERE product_id=pid AND NOT(id=ANY(image_ids));
    RETURN jsonb_build_object('id',pid);
  END IF;

  IF p_action='bulk' THEN
    SELECT array_agg(DISTINCT value::uuid) INTO ids FROM jsonb_array_elements_text(p_data->'ids');
    IF coalesce(cardinality(ids),0)=0 OR cardinality(ids)>500 THEN RAISE EXCEPTION 'Selecione de 1 a 500 produtos'; END IF;
    IF (SELECT count(*) FROM public.pl_catalog_products WHERE store_id=p_store_id AND id=ANY(ids))<>cardinality(ids)
      THEN RAISE EXCEPTION 'Seleção inválida'; END IF;
    PERFORM 1 FROM public.pl_catalog_products WHERE id=ANY(ids) ORDER BY id FOR UPDATE;
    IF p_data ? 'original_price' AND (p_data->>'original_price')::numeric<=0 THEN RAISE EXCEPTION 'Preço inválido'; END IF;
    IF p_data ? 'price' AND (p_data->>'price')::numeric<=0 THEN RAISE EXCEPTION 'Preço inválido'; END IF;
    SELECT coalesce(array_agg(value),'{}') INTO cats FROM jsonb_array_elements_text(coalesce(p_data->'categories','[]'::jsonb));
    UPDATE public.pl_catalog_products SET
      original_price=CASE WHEN p_data ? 'original_price' THEN (p_data->>'original_price')::numeric ELSE original_price END,
      price=CASE WHEN p_data ? 'price' THEN (p_data->>'price')::numeric ELSE price END,
      is_active=CASE WHEN p_data ? 'is_active' THEN (p_data->>'is_active')::boolean ELSE is_active END,
      is_featured=CASE WHEN p_data ? 'is_featured' THEN (p_data->>'is_featured')::boolean ELSE is_featured END,
      categorias_vitrine=CASE WHEN p_data ? 'categories' THEN cats ELSE categorias_vitrine END,
      categoria_vitrine=CASE WHEN p_data ? 'categories' THEN cats[1] ELSE categoria_vitrine END,updated_at=now()
      WHERE store_id=p_store_id AND id=ANY(ids);
    IF EXISTS(SELECT 1 FROM public.pl_catalog_products p WHERE id=ANY(ids) AND
      ((price IS NOT NULL AND original_price IS NOT NULL AND price>=original_price)
        OR (is_active AND (coalesce(price,original_price,0)<=0 OR name='Produto sem nome' OR
          NOT EXISTS(SELECT 1 FROM public.pl_catalog_product_images i WHERE i.product_id=p.id)))))
      THEN RAISE EXCEPTION 'Há produtos sem nome, preço ou foto, ou com promoção inválida. Nenhuma alteração aplicada.'; END IF;
    RETURN jsonb_build_object('count',cardinality(ids));
  END IF;
  RAISE EXCEPTION 'Ação inválida';
END;
$fn$;
REVOKE ALL ON FUNCTION public.pl_catalog_manage(uuid,text,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.pl_catalog_manage(uuid,text,jsonb) TO authenticated;
NOTIFY pgrst,'reload schema';
COMMIT;
