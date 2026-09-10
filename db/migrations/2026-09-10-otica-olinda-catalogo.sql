-- Provou Levou & Ótica Olinda: catálogo, gerador e teste grátis no CRM.
insert into public.pl_catalog_stores
  (slug,display_name,logo_url,whatsapp,bio,primary_color,store_api_key,owner_email,plan,is_active,tema,limite_diario)
select
  'oticaolinda','Provou Levou & Ótica Olinda',null,'5511971319233','Provou Levou & Ótica Olinda',
  '#6D28D9','pl_cat_'||encode(gen_random_bytes(32),'hex'),'opticalionda@gmail.com','basic',true,
  '{"bg":"#F7F5FF","card":"#FFFFFF","line":"#E4DDF8","brand":"#6D28D9","dark":"#4C1D95","soft":"rgba(109,40,217,.11)","on":"#FFFFFF","cta":"#6D28D9","ctaDark":"#4C1D95","onCta":"#FFFFFF"}'::jsonb,
  5
where not exists (
  select 1 from public.pl_catalog_stores
  where slug='oticaolinda' or lower(owner_email)='opticalionda@gmail.com'
);

insert into public.provou_levou_stores
  (name,domain,email,active,company,phone,plan,status,api_key_hash,api_key_prefix,api_key_last4,api_key_created_at,api_key_active,platform,categoria)
select c.display_name,'https://provoulevou.com.br/catalogo/?loja='||c.slug,c.owner_email,true,
       c.display_name,c.whatsapp,'Teste Grátis — Catálogo','Teste Gratuito',
       encode(digest(c.store_api_key,'sha256'),'hex'),
       left(encode(digest(c.store_api_key,'sha256'),'hex'),15),right(c.store_api_key,4),
       now(),true,'catalogo','Óculos'
from public.pl_catalog_stores c
where c.slug='oticaolinda'
  and not exists (
    select 1 from public.provou_levou_stores p
    where p.api_key_hash=encode(digest(c.store_api_key,'sha256'),'hex')
  );

update public.leads
set nome_loja='Provou Levou & Ótica Olinda',status='testando',
    email='opticalionda@gmail.com',telefone='5511971319233',whatsapp='5511971319233',updated_at=now()
where instagram='whatsapp_5511971319233'
   or regexp_replace(coalesce(telefone,''),'\D','','g') in ('11971319233','5511971319233')
   or regexp_replace(coalesce(whatsapp,''),'\D','','g') in ('11971319233','5511971319233');

insert into public.crm_lead_etapas (lead_id,status,updated_at)
select id,'teste_catalogo_7_dias',now()
from public.leads
where instagram='whatsapp_5511971319233'
   or regexp_replace(coalesce(telefone,''),'\D','','g') in ('11971319233','5511971319233')
   or regexp_replace(coalesce(whatsapp,''),'\D','','g') in ('11971319233','5511971319233')
on conflict (lead_id) do update set status=excluded.status,updated_at=excluded.updated_at;

insert into public.interacoes (lead_id,tipo,conteudo,created_at)
select l.id,'nota','Catálogo da Provou Levou & Ótica Olinda criado e lead movido para o teste grátis de 7 dias.',now()
from public.leads l
where (l.instagram='whatsapp_5511971319233'
    or regexp_replace(coalesce(l.telefone,''),'\D','','g') in ('11971319233','5511971319233')
    or regexp_replace(coalesce(l.whatsapp,''),'\D','','g') in ('11971319233','5511971319233'))
  and not exists (
    select 1 from public.interacoes i
    where i.lead_id=l.id
      and i.conteudo='Catálogo da Provou Levou & Ótica Olinda criado e lead movido para o teste grátis de 7 dias.'
  );
