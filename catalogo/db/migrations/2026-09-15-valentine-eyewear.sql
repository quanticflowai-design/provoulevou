-- A chave é criada somente no banco; o gerador recebe apenas seu hash.
do $$
declare
  v_slug constant text := 'valentineeyewear';
  v_email constant text := 'dianatorresdasilva@hotmail.com';
  v_phone constant text := '5584996737792';
  v_domain constant text := 'https://provoulevou.com.br/catalogo/?loja=valentineeyewear';
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
  values (v_slug,'Valentine Eyewear','https://provoulevou.com.br/catalogo/assets/logo-valentine-eyewear.webp',v_phone,v_email,
    'basic',true,'#D2AF6C',
    '{"bg":"#090909","card":"#151515","line":"#3C3324","brand":"#D2AF6C","dark":"#B48B42","soft":"#292318","on":"#090909","cta":"#D2AF6C","ctaDark":"#B48B42","onCta":"#090909"}'::jsonb,
    3,v_key);
  insert into public.provou_levou_stores
    (name,domain,email,company,phone,plan,status,active,api_key_hash,api_key_active,platform,categoria,store_id)
  values ('Valentine Eyewear',v_domain,v_email,'Valentine Eyewear',v_phone,'basic','Teste Gratuito',true,
    encode(digest(v_key,'sha256'),'hex'),true,'catalogo','oculos',v_slug);
  select id into v_lead from public.leads
    where lower(coalesce(email,''))=v_email
      or regexp_replace(coalesce(telefone,''),'[^0-9]','','g') in ('84996737792',v_phone)
      or instagram='catalogo:valentineeyewear'
    order by created_at desc limit 1;
  if v_lead is null then
    insert into public.leads
      (instagram,nome_loja,telefone,whatsapp,email,status,fonte_oportunidade,plataforma,teste_gratis_em,notas)
    values ('catalogo:valentineeyewear','Valentine Eyewear',v_phone,v_phone,v_email,'testando','catalogo','catalogo',current_date,
      'Lead criado pelo cadastro do catálogo; Instagram não informado.')
    returning id into v_lead;
  else
    update public.leads set status='testando',email=v_email,updated_at=now(),
      teste_gratis_em=coalesce(teste_gratis_em,current_date)
      where id=v_lead;
  end if;
  insert into public.crm_lead_etapas(lead_id,status) values (v_lead,'teste_catalogo_7_dias')
    on conflict (lead_id) do update set status=excluded.status,updated_at=now();
  insert into public.interacoes(lead_id,tipo,conteudo)
    select v_lead,'nota','Catálogo Valentine Eyewear criado; teste grátis de 7 dias iniciado.'
    where not exists (select 1 from public.interacoes where lead_id=v_lead and tipo='nota'
      and conteudo='Catálogo Valentine Eyewear criado; teste grátis de 7 dias iniciado.');
end $$;
