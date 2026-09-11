-- Ótica Santo Antônio: catálogo, gerador e teste grátis no CRM.
insert into public.pl_catalog_stores
  (slug,display_name,logo_url,whatsapp,bio,primary_color,store_api_key,owner_email,plan,is_active,tema,limite_diario)
select 'oticasantoantonio','Ótica Santo Antônio',
       'https://cdn.jsdelivr.net/gh/quanticflowai-design/provoulevou@20be877/catalogo/assets/logo-oticasantoantonio.webp',
       '5575988275137','Ótica Santo Antônio','#082A76','pl_cat_'||encode(gen_random_bytes(32),'hex'),
       'oticasantoantoniobering@gmail.com','basic',true,
       '{"bg":"#F7FDD9","card":"#FFFFFF","line":"#DDE9A6","brand":"#082A76","dark":"#041C52","soft":"rgba(8,42,118,.10)","on":"#FFFFFF","cta":"#CDEA0B","ctaDark":"#A7C000","onCta":"#082A76"}'::jsonb,5
where not exists (
  select 1 from public.pl_catalog_stores
  where slug='oticasantoantonio' or lower(owner_email)='oticasantoantoniobering@gmail.com'
);

insert into public.provou_levou_stores
  (name,domain,email,active,company,phone,plan,status,api_key_hash,api_key_prefix,api_key_last4,api_key_created_at,api_key_active,platform,categoria)
select c.display_name,'https://provoulevou.com.br/catalogo/?loja='||c.slug,c.owner_email,true,c.display_name,c.whatsapp,
       'Teste Grátis — Catálogo','Teste Gratuito',encode(digest(c.store_api_key,'sha256'),'hex'),
       left(encode(digest(c.store_api_key,'sha256'),'hex'),15),right(c.store_api_key,4),now(),true,'catalogo','Óculos'
from public.pl_catalog_stores c
where c.slug='oticasantoantonio'
  and not exists (
    select 1 from public.provou_levou_stores p
    where p.api_key_hash=encode(digest(c.store_api_key,'sha256'),'hex')
  );

insert into public.leads
  (instagram,nome_loja,seguidores,tem_provador,status,notas,idioma,ponto_positivo,fonte_oportunidade,telefone,email,whatsapp,categoria,pais,plataforma)
select 'whatsapp_5575988275137','Ótica Santo Antônio',0,false,'testando',
       'Registrado pelo deploy do Provou Catálogo. Catálogo criado para teste grátis de 7 dias.',
       'pt',true,'WhatsApp','5575988275137','oticasantoantoniobering@gmail.com','5575988275137','oculos','BR','instagram'
where not exists (
  select 1 from public.leads
  where instagram='whatsapp_5575988275137'
     or regexp_replace(coalesce(telefone,''),'\D','','g') in ('75988275137','5575988275137')
     or regexp_replace(coalesce(whatsapp,''),'\D','','g') in ('75988275137','5575988275137')
);

update public.leads
set status='testando',email=coalesce(email,'oticasantoantoniobering@gmail.com'),
    whatsapp=coalesce(whatsapp,'5575988275137'),updated_at=now()
where instagram='whatsapp_5575988275137';

insert into public.crm_lead_etapas (lead_id,status,updated_at)
select id,'teste_catalogo_7_dias',now()
from public.leads where instagram='whatsapp_5575988275137'
on conflict (lead_id) do update set status=excluded.status,updated_at=excluded.updated_at;

insert into public.interacoes (lead_id,tipo,conteudo,created_at)
select l.id,'nota','Catálogo da Ótica Santo Antônio criado e lead movido para o teste grátis de 7 dias.',now()
from public.leads l
where l.instagram='whatsapp_5575988275137'
  and not exists (
    select 1 from public.interacoes i
    where i.lead_id=l.id
      and i.conteudo='Catálogo da Ótica Santo Antônio criado e lead movido para o teste grátis de 7 dias.'
  );
