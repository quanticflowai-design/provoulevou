BEGIN;
CREATE TABLE IF NOT EXISTS public.pl_catalog_phone_exceptions (
  store_id uuid NOT NULL REFERENCES public.pl_catalog_stores(id) ON DELETE CASCADE,
  phone text NOT NULL CHECK (phone ~ '^[0-9]{10,11}$'),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (store_id,phone)
);
ALTER TABLE public.pl_catalog_phone_exceptions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.pl_catalog_phone_exceptions FROM anon, authenticated;
GRANT ALL ON public.pl_catalog_phone_exceptions TO service_role;
CREATE OR REPLACE FUNCTION public.pl_catalog_check_limit(p_slug text, p_phone text, p_limite integer DEFAULT NULL::integer)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_store     uuid;
  v_lim       int;
  v_digits    text;
  v_ph        numeric;
  v_ip        text;
  v_phone_cnt int := 0;
  v_ip_cnt    int := 0;
  v_usadas    int;
  v_ini       timestamptz := date_trunc('day', now() at time zone 'America/Sao_Paulo')
                             at time zone 'America/Sao_Paulo';
begin
  select id, coalesce(limite_diario, 3)
    into v_store, v_lim
    from pl_catalog_stores
   where slug = p_slug and is_active
   limit 1;

  if v_store is null then
    return json_build_object('erro', 'loja nao encontrada');
  end if;

  v_digits := nullif(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), '');
  if v_digits is not null then
    if length(v_digits) > 11 and left(v_digits, 2) = '55' then
      v_digits := substring(v_digits from 3);
    end if;
    v_ph := v_digits::numeric;
  end if;

  v_ip := nullif(btrim(split_part(
            coalesce(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ''),
            ',', 1)), '');

  select
    count(*) filter (where v_ph is not null and g.telefone_cliente = v_ph),
    count(*) filter (where v_ip is not null and g.ip_address = v_ip)
    into v_phone_cnt, v_ip_cnt
    from geracoes_provou_levou g
   where g.created_at >= v_ini
     and (g.catalog_store_id = v_store
          or g.origin ilike '%/catalogo/' || p_slug || '%');

  v_usadas := greatest(v_phone_cnt, v_ip_cnt);

  if exists (
    select 1 from public.pl_catalog_phone_exceptions e
    where e.store_id = v_store and e.phone = v_digits and e.is_active
  ) then
    return json_build_object(
      'dia', to_char(v_ini at time zone 'America/Sao_Paulo', 'YYYY-MM-DD'),
      'limite', null, 'usadas', v_phone_cnt, 'ip_usadas', v_ip_cnt,
      'restantes', null, 'limited', false, 'ilimitado', true
    );
  end if;


  return json_build_object(
    'dia',       to_char(v_ini at time zone 'America/Sao_Paulo', 'YYYY-MM-DD'),
    'limite',    v_lim,
    'usadas',    v_phone_cnt,
    'ip_usadas', v_ip_cnt,
    'restantes', greatest(0, v_lim - v_usadas),
    'limited',   v_usadas >= v_lim
  );
end;
$function$;
NOTIFY pgrst, 'reload schema';
COMMIT;
