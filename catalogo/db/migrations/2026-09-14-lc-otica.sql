-- A chave é gerada no banco e só seu hash é usado pelo gerador.
do $$
declare
  v_slug constant text := 'lcotica';
  v_email constant text := 'lc.oticamovel@gmail.com';
  v_phone constant text := '5591992459735';
  v_domain constant text := 'https://provoulevou.com.br/catalogo/?loja=lcotica';
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
  values (v_slug,'LC Ótica Móvel','https://provoulevou.com.br/catalogo/assets/logo-lc-otica.webp',v_phone,v_email,
    'basic',true,'#C71925',
    '{"bg":"#FAF9FC","card":"#FFFFFF","line":"#E9D8DD","brand":"#C71925","dark":"#990F1A","soft":"#FDEDEF","on":"#FFFFFF","cta":"#C71925","ctaDark":"#990F1A","onCta":"#FFFFFF"}'::jsonb,
    3,v_key);
  insert into public.provou_levou_stores
    (name,domain,email,company,phone,plan,status,active,api_key_hash,api_key_active,platform,categoria,store_id)
  values ('LC Ótica Móvel',v_domain,v_email,'LC Ótica Móvel',v_phone,'basic','Teste Gratuito',true,
    encode(digest(v_key,'sha256'),'hex'),true,'catalogo','oculos',v_slug);
  select id into v_lead from public.leads
    where lower(coalesce(email,''))=v_email
      or regexp_replace(coalesce(telefone,''),'[^0-9]','','g') in ('91992459735',v_phone)
      or instagram='catalogo:lcotica'
    order by created_at desc limit 1;
  if v_lead is null then
    insert into public.leads
      (instagram,nome_loja,telefone,whatsapp,email,status,fonte_oportunidade,plataforma,teste_gratis_em,notas)
    values ('catalogo:lcotica','LC Ótica Móvel',v_phone,v_phone,v_email,'testando','catalogo','catalogo',current_date,
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
    select v_lead,'nota','Catálogo LC Ótica Móvel criado; teste grátis de 7 dias iniciado.'
    where not exists (select 1 from public.interacoes where lead_id=v_lead and tipo='nota'
      and conteudo='Catálogo LC Ótica Móvel criado; teste grátis de 7 dias iniciado.');
end $$;
