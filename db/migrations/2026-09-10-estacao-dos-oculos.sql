-- Estação dos Óculos: catálogo, gerador e teste grátis no CRM.
insert into public.pl_catalog_stores
  (slug,display_name,logo_url,whatsapp,bio,primary_color,store_api_key,owner_email,plan,is_active,tema,limite_diario)
select 'estacaodosoculos','Estação dos Óculos',
       'https://cdn.jsdelivr.net/gh/quanticflowai-design/provoulevou@1dbd1bf/catalogo/assets/logo-estacaodosoculos.webp',
       '5531990622301','Estação dos Óculos','#5B1D20','pl_cat_'||encode(gen_random_bytes(32),'hex'),
       'estacaodosoculosadm@gmail.com','basic',true,
       '{"bg":"#5B1D20","card":"#682629","line":"rgba(216,206,134,.30)","brand":"#FFFFFF","dark":"#E7E4E1","soft":"rgba(255,255,255,.10)","on":"#5B1D20","cta":"#D8CE86","ctaDark":"#B7AA62","onCta":"#321012"}'::jsonb,5
where not exists (
  select 1 from public.pl_catalog_stores
  where slug='estacaodosoculos' or lower(owner_email)='estacaodosoculosadm@gmail.com'
);

insert into public.provou_levou_stores
  (name,domain,email,active,company,phone,plan,status,api_key_hash,api_key_prefix,api_key_last4,api_key_created_at,api_key_active,platform,categoria)
select c.display_name,'https://provoulevou.com.br/catalogo/?loja='||c.slug,c.owner_email,true,c.display_name,c.whatsapp,
       'Teste Grátis — Catálogo','Teste Gratuito',encode(digest(c.store_api_key,'sha256'),'hex'),
       left(encode(digest(c.store_api_key,'sha256'),'hex'),15),right(c.store_api_key,4),now(),true,'catalogo','Óculos'
from public.pl_catalog_stores c
where c.slug='estacaodosoculos'
  and not exists (
    select 1 from public.provou_levou_stores p
    where p.api_key_hash=encode(digest(c.store_api_key,'sha256'),'hex')
  );

insert into public.leads
  (instagram,nome_loja,seguidores,tem_provador,status,notas,idioma,ponto_positivo,fonte_oportunidade,telefone,email,whatsapp,categoria,pais,plataforma)
select 'whatsapp_5531990622301','Estação dos Óculos',0,false,'testando',
       'Registrado pelo deploy do Provou Catálogo. Catálogo criado para teste grátis de 7 dias.',
       'pt',true,'WhatsApp','5531990622301','estacaodosoculosadm@gmail.com','5531990622301','oculos','BR','instagram'
where not exists (
  select 1 from public.leads
  where instagram='whatsapp_5531990622301'
     or regexp_replace(coalesce(telefone,''),'\D','','g') in ('31990622301','5531990622301')
     or regexp_replace(coalesce(whatsapp,''),'\D','','g') in ('31990622301','5531990622301')
);

update public.leads
set status='testando',email=coalesce(email,'estacaodosoculosadm@gmail.com'),
    whatsapp=coalesce(whatsapp,'5531990622301'),updated_at=now()
where instagram='whatsapp_5531990622301';

insert into public.crm_lead_etapas (lead_id,status,updated_at)
select id,'teste_catalogo_7_dias',now()
from public.leads where instagram='whatsapp_5531990622301'
on conflict (lead_id) do update set status=excluded.status,updated_at=excluded.updated_at;

insert into public.interacoes (lead_id,tipo,conteudo,created_at)
select l.id,'nota','Catálogo da Estação dos Óculos criado e lead movido para o teste grátis de 7 dias.',now()
from public.leads l
where l.instagram='whatsapp_5531990622301'
  and not exists (
    select 1 from public.interacoes i
    where i.lead_id=l.id
      and i.conteudo='Catálogo da Estação dos Óculos criado e lead movido para o teste grátis de 7 dias.'
  );
