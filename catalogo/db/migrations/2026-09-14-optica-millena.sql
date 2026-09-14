-- A chave é gerada no banco e nunca aparece nesta migração ou no Git.
do $$
declare
  v_slug constant text := 'opticamillena';
  v_email constant text := 'milenaguerreiro271@gmail.com';
  v_phone constant text := '5551989561378';
  v_domain constant text := 'https://provoulevou.com.br/catalogo/?loja=opticamillena';
  v_key text;
  v_lead uuid;
begin
  if exists (select 1 from public.pl_catalog_stores where slug=v_slug) then
    raise notice 'Catálogo já cadastrado: %',v_slug;
    return;
  end if;
  if exists (select 1 from public.pl_catalog_stores where lower(owner_email)=v_email) then
    raise exception 'Este e-mail já possui catálogo; revisar identidade antes de criar';
  end if;
  v_key := encode(gen_random_bytes(32),'hex');
  insert into public.pl_catalog_stores
    (slug,display_name,logo_url,whatsapp,owner_email,plan,is_active,primary_color,tema,limite_diario,store_api_key)
  values (v_slug,'Optica Millena',null,v_phone,v_email,'basic',true,'#24323D',
    '{"bg":"#F7F8F7","card":"#FFFFFF","brand":"#24323D","cta":"#24323D","onCta":"#FFFFFF"}'::jsonb,
    5,v_key);
  insert into public.provou_levou_stores
    (name,domain,email,company,phone,plan,status,active,api_key_hash,api_key_active,platform,categoria,store_id)
  values ('Optica Millena',v_domain,v_email,'Optica Millena',v_phone,'basic','Teste Gratuito',true,
    encode(digest(v_key,'sha256'),'hex'),true,'catalogo','oculos',v_slug);
  select id into v_lead from public.leads where regexp_replace(coalesce(telefone,''),'[^0-9]','','g')=v_phone
    order by created_at desc limit 1;
  if v_lead is not null then
    update public.leads set status='testando',email=v_email,updated_at=now(),teste_gratis_em=current_date where id=v_lead;
    insert into public.crm_lead_etapas(lead_id,status) values (v_lead,'teste_catalogo_7_dias')
      on conflict (lead_id) do update set status=excluded.status,updated_at=now();
    insert into public.interacoes(lead_id,tipo,conteudo)
      values (v_lead,'nota','Catálogo Optica Millena criado; teste grátis de 7 dias iniciado.');
  end if;
end $$;
