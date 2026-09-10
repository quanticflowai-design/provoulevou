-- Ótica VB e Óticas Prime Magrini: catálogo, gerador e teste grátis no CRM.
with lojas(slug,nome,logo,whatsapp,email,cor,tema) as (values
  ('oticavb','Ótica VB','https://cdn.jsdelivr.net/gh/quanticflowai-design/provoulevou@e8d11ab/catalogo/assets/logo-oticavb.webp','5532991270293','jne1714@gmail.com','#202324','{"bg":"#202324","card":"#2B2E30","line":"rgba(255,255,255,.20)","brand":"#FFFFFF","dark":"#E4E4E4","soft":"rgba(255,255,255,.10)","on":"#202324","cta":"#FFFFFF","ctaDark":"#D8D8D8","onCta":"#202324"}'::jsonb),
  ('oticasprimemagrini','Óticas Prime Magrini','https://cdn.jsdelivr.net/gh/quanticflowai-design/provoulevou@e8d11ab/catalogo/assets/logo-oticasprimemagrini.webp','5519982970010','oticasprimemagrini@gmail.com','#22345F','{"bg":"#22345F","card":"#2A3D6B","line":"rgba(223,180,0,.30)","brand":"#FFFFFF","dark":"#E9E9E9","soft":"rgba(255,255,255,.10)","on":"#22345F","cta":"#DFB400","ctaDark":"#B79200","onCta":"#17213E"}'::jsonb)
)
insert into public.pl_catalog_stores
  (slug,display_name,logo_url,whatsapp,bio,primary_color,store_api_key,owner_email,plan,is_active,tema,limite_diario)
select slug,nome,logo,whatsapp,nome,cor,'pl_cat_'||encode(gen_random_bytes(32),'hex'),email,'basic',true,tema,5
from lojas l
where not exists (
  select 1 from public.pl_catalog_stores c
  where c.slug=l.slug or lower(c.owner_email)=lower(l.email)
);

insert into public.provou_levou_stores
  (name,domain,email,active,company,phone,plan,status,api_key_hash,api_key_prefix,api_key_last4,api_key_created_at,api_key_active,platform,categoria)
select c.display_name,'https://provoulevou.com.br/catalogo/?loja='||c.slug,c.owner_email,true,c.display_name,c.whatsapp,
       'Teste Grátis — Catálogo','Teste Gratuito',encode(digest(c.store_api_key,'sha256'),'hex'),
       left(encode(digest(c.store_api_key,'sha256'),'hex'),15),right(c.store_api_key,4),now(),true,'catalogo','Óculos'
from public.pl_catalog_stores c
where c.slug in ('oticavb','oticasprimemagrini')
  and not exists (
    select 1 from public.provou_levou_stores p
    where p.api_key_hash=encode(digest(c.store_api_key,'sha256'),'hex')
  );

with novos(instagram,nome,telefone,email) as (values
  ('whatsapp_5532991270293','Ótica VB','5532991270293','jne1714@gmail.com'),
  ('whatsapp_5519982970010','Óticas Prime Magrini','5519982970010','oticasprimemagrini@gmail.com')
)
insert into public.leads
  (instagram,nome_loja,seguidores,tem_provador,status,notas,idioma,ponto_positivo,fonte_oportunidade,telefone,email,whatsapp,categoria,pais,plataforma)
select instagram,nome,0,false,'testando','Registrado pelo deploy do Provou Catálogo. Catálogo criado para teste grátis de 7 dias.',
       'pt',true,'WhatsApp',telefone,email,telefone,'oculos','BR','instagram'
from novos n
where not exists (
  select 1 from public.leads l
  where l.instagram=n.instagram
     or regexp_replace(coalesce(l.telefone,''),'\D','','g') in (n.telefone,substring(n.telefone from 3))
     or regexp_replace(coalesce(l.whatsapp,''),'\D','','g') in (n.telefone,substring(n.telefone from 3))
);

update public.leads
set status='testando',updated_at=now()
where instagram in ('whatsapp_5532991270293','whatsapp_5519982970010');

insert into public.crm_lead_etapas (lead_id,status,updated_at)
select id,'teste_catalogo_7_dias',now()
from public.leads
where instagram in ('whatsapp_5532991270293','whatsapp_5519982970010')
on conflict (lead_id) do update set status=excluded.status,updated_at=excluded.updated_at;

insert into public.interacoes (lead_id,tipo,conteudo,created_at)
select l.id,'nota','Catálogo de '||l.nome_loja||' criado e lead movido para o teste grátis de 7 dias.',now()
from public.leads l
where l.instagram in ('whatsapp_5532991270293','whatsapp_5519982970010')
  and not exists (
    select 1 from public.interacoes i
    where i.lead_id=l.id
      and i.conteudo='Catálogo de '||l.nome_loja||' criado e lead movido para o teste grátis de 7 dias.'
  );
