-- Federal Ótica, JB Ótica, Ótica Essência, Óptica Vitória e Óptica Ágata Queiroz.
-- Catálogos, ativação do gerador e entrada no teste grátis do CRM.
with lojas(slug,nome,logo,whatsapp,email,cor,tema) as (values
  ('federalotica','Federal Ótica','https://cdn.jsdelivr.net/gh/quanticflowai-design/provoulevou@fc1cb7d/catalogo/assets/logo-federalotica.webp','559192505932','federaloticaoficial@gmail.com','#197BB5','{"bg":"#F5FAFD","card":"#FFFFFF","line":"#D7EAF5","brand":"#197BB5","dark":"#125B87","soft":"rgba(25,123,181,.12)","on":"#FFFFFF","cta":"#E96E24","ctaDark":"#BD5418","onCta":"#FFFFFF"}'::jsonb),
  ('jbotica','JB Ótica','https://cdn.jsdelivr.net/gh/quanticflowai-design/provoulevou@fc1cb7d/catalogo/assets/logo-jbotica.webp','5585997595545','julianosb0727@gmail.com','#C9944B','{"bg":"#0C0B0A","card":"#17130F","line":"rgba(211,161,90,.28)","brand":"#D3A15A","dark":"#A97838","soft":"rgba(211,161,90,.14)","on":"#111111","cta":"#D3A15A","ctaDark":"#B98540","onCta":"#111111"}'::jsonb),
  ('oticaessencia','Ótica Essência','https://cdn.jsdelivr.net/gh/quanticflowai-design/provoulevou@fc1cb7d/catalogo/assets/logo-oticaessencia.webp','5512996639217','oticasessencia@gmail.com','#D7071D','{"bg":"#D7071D","card":"#B90619","line":"rgba(255,244,232,.30)","brand":"#FFF4E8","dark":"#E7D5C1","soft":"rgba(255,244,232,.14)","on":"#A80517","cta":"#FFF4E8","ctaDark":"#E7D5C1","onCta":"#A80517"}'::jsonb),
  ('opticavitoria','Óptica Vitória',null,'5569999284986','charleschavesdasilva@gmail.com','#1E3A5F','{"bg":"#F5F8FC","card":"#FFFFFF","line":"#DCE5EF","brand":"#1E3A5F","dark":"#13263F","soft":"rgba(30,58,95,.11)","on":"#FFFFFF","cta":"#1E3A5F","ctaDark":"#13263F","onCta":"#FFFFFF"}'::jsonb),
  ('opticaagataqueiroz','Óptica Ágata Queiroz','https://cdn.jsdelivr.net/gh/quanticflowai-design/provoulevou@fc1cb7d/catalogo/assets/logo-opticaagataqueiroz.webp','5585991758574','ana.agata.carla@gmail.com','#1111D8','{"bg":"#F4F5FF","card":"#FFFFFF","line":"#D8DAFF","brand":"#1111D8","dark":"#08089A","soft":"rgba(17,17,216,.11)","on":"#FFFFFF","cta":"#1111D8","ctaDark":"#08089A","onCta":"#FFFFFF"}'::jsonb)
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
where c.slug in ('federalotica','jbotica','oticaessencia','opticavitoria','opticaagataqueiroz')
  and not exists (
    select 1 from public.provou_levou_stores p
    where p.api_key_hash=encode(digest(c.store_api_key,'sha256'),'hex')
  );

with leads_novos(instagram,nome,telefone,email) as (values
  ('whatsapp_559192505932','Federal Ótica','559192505932','federaloticaoficial@gmail.com'),
  ('whatsapp_5585997595545','JB Ótica','5585997595545','julianosb0727@gmail.com'),
  ('whatsapp_5512996639217','Ótica Essência','5512996639217','oticasessencia@gmail.com'),
  ('whatsapp_5569999284986','Óptica Vitória','5569999284986','charleschavesdasilva@gmail.com'),
  ('whatsapp_5585991758574','Óptica Ágata Queiroz','5585991758574','ana.agata.carla@gmail.com')
)
insert into public.leads
  (instagram,nome_loja,seguidores,tem_provador,status,notas,idioma,ponto_positivo,fonte_oportunidade,telefone,email,whatsapp,categoria,pais,plataforma)
select instagram,nome,0,false,'testando','Registrado pelo deploy do Provou Catálogo. Catálogo criado para teste grátis de 7 dias.',
       'pt',true,'WhatsApp',telefone,email,telefone,'oculos','BR','instagram'
from leads_novos n
where not exists (
  select 1 from public.leads l
  where l.instagram=n.instagram
     or regexp_replace(coalesce(l.telefone,''),'\D','','g') in (n.telefone,substring(n.telefone from 3))
     or regexp_replace(coalesce(l.whatsapp,''),'\D','','g') in (n.telefone,substring(n.telefone from 3))
);

update public.leads l
set status='testando',updated_at=now()
where l.instagram in (
  'whatsapp_559192505932','whatsapp_5585997595545','whatsapp_5512996639217',
  'whatsapp_5569999284986','whatsapp_5585991758574'
);

insert into public.crm_lead_etapas (lead_id,status,updated_at)
select id,'teste_catalogo_7_dias',now()
from public.leads
where instagram in (
  'whatsapp_559192505932','whatsapp_5585997595545','whatsapp_5512996639217',
  'whatsapp_5569999284986','whatsapp_5585991758574'
)
on conflict (lead_id) do update set status=excluded.status,updated_at=excluded.updated_at;

insert into public.interacoes (lead_id,tipo,conteudo,created_at)
select l.id,'nota','Catálogo de '||l.nome_loja||' criado e lead movido para o teste grátis de 7 dias.',now()
from public.leads l
where l.instagram in (
  'whatsapp_559192505932','whatsapp_5585997595545','whatsapp_5512996639217',
  'whatsapp_5569999284986','whatsapp_5585991758574'
)
and not exists (
  select 1 from public.interacoes i
  where i.lead_id=l.id and i.conteudo='Catálogo de '||l.nome_loja||' criado e lead movido para o teste grátis de 7 dias.'
);
