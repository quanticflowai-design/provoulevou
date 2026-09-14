-- Chave da loja criada no banco e armazenada no gerador apenas como hash.
do $$
declare
  v_slug constant text := 'vedsu';
  v_email constant text := 'vedsuotica@gmail.com';
  v_phone constant text := '5511914181442';
  v_domain constant text := 'https://provoulevou.com.br/catalogo/?loja=vedsu';
  v_lead constant uuid := 'efc4a2ba-2dd2-47a3-99b8-08fa4e83f7ae';
  v_key text;
begin
  if exists (select 1 from public.pl_catalog_stores where slug=v_slug) then
    raise notice 'Catálogo já cadastrado: %',v_slug;
    return;
  end if;
  if exists (select 1 from public.pl_catalog_stores where lower(owner_email)=v_email) then
    raise exception 'Este e-mail já possui catálogo; revisar identidade antes de criar';
  end if;
  if not exists (select 1 from public.leads where id=v_lead and nome_loja='Vedsu Otica') then
    raise exception 'Lead da Vedsu não confirmado';
  end if;
  v_key := encode(gen_random_bytes(32),'hex');
  insert into public.pl_catalog_stores
    (slug,display_name,logo_url,whatsapp,owner_email,plan,is_active,primary_color,tema,limite_diario,store_api_key)
  values (v_slug,'Vedsu Ótica','https://provoulevou.com.br/catalogo/assets/logo-vedsu.webp',v_phone,v_email,
    'basic',true,'#B91369',
    '{"bg":"#FFF5FA","card":"#FFFFFF","line":"#F2CEE1","brand":"#B91369","dark":"#8C0F4F","soft":"#FFE6F3","on":"#FFFFFF","cta":"#B91369","ctaDark":"#8C0F4F","onCta":"#FFFFFF"}'::jsonb,
    3,v_key);
  insert into public.provou_levou_stores
    (name,domain,email,company,phone,plan,status,active,api_key_hash,api_key_active,platform,categoria,store_id)
  values ('Vedsu Ótica',v_domain,v_email,'Vedsu Ótica',v_phone,'basic','Teste Gratuito',true,
    encode(digest(v_key,'sha256'),'hex'),true,'catalogo','oculos',v_slug);
  update public.leads set status='testando',email=v_email,updated_at=now(),
    teste_gratis_em=coalesce(teste_gratis_em,current_date)
    where id=v_lead;
  insert into public.crm_lead_etapas(lead_id,status) values (v_lead,'teste_catalogo_7_dias')
    on conflict (lead_id) do update set status=excluded.status,updated_at=now();
  insert into public.interacoes(lead_id,tipo,conteudo)
    select v_lead,'nota','Catálogo Vedsu criado; teste grátis de 7 dias iniciado.'
    where not exists (select 1 from public.interacoes where lead_id=v_lead and tipo='nota'
      and conteudo='Catálogo Vedsu criado; teste grátis de 7 dias iniciado.');
end $$;
