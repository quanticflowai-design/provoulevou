-- Nova identidade da Óptica Vitória.
update public.pl_catalog_stores
set logo_url='https://cdn.jsdelivr.net/gh/quanticflowai-design/provoulevou@c69df47/catalogo/assets/logo-opticavitoria.webp',
    primary_color='#65108E',
    tema='{"bg":"#FBF7FF","card":"#FFFFFF","line":"#E8D7F0","brand":"#65108E","dark":"#430762","soft":"rgba(101,16,142,.12)","on":"#FFFFFF","cta":"#C99A43","ctaDark":"#9D732A","onCta":"#241207"}'::jsonb
where slug='opticavitoria';

-- Ótica Ponto de Visão e Genya: catálogo e autenticação do gerador.
with lojas(slug,nome,logo,whatsapp,email,cor,tema) as (values
  ('oticapontodevisao','Ótica Ponto de Visão','https://cdn.jsdelivr.net/gh/quanticflowai-design/provoulevou@c69df47/catalogo/assets/logo-oticapontodevisao.webp','5575998295703','poliannafsa@hotmail.com','#00A854','{"bg":"#F3FBF6","card":"#FFFFFF","line":"#CFEBDD","brand":"#00A854","dark":"#00783C","soft":"rgba(0,168,84,.11)","on":"#FFFFFF","cta":"#00A854","ctaDark":"#00783C","onCta":"#FFFFFF"}'::jsonb),
  ('genya','Genya','https://cdn.jsdelivr.net/gh/quanticflowai-design/provoulevou@c69df47/catalogo/assets/logo-genya.webp','5522988478554','jenyferjk@icloud.com','#1B151B','{"bg":"#FAF8FA","card":"#FFFFFF","line":"#E7E0E6","brand":"#1B151B","dark":"#000000","soft":"rgba(27,21,27,.09)","on":"#FFFFFF","cta":"#1B151B","ctaDark":"#000000","onCta":"#FFFFFF"}'::jsonb)
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
where c.slug in ('oticapontodevisao','genya')
  and not exists (
    select 1 from public.provou_levou_stores p
    where p.api_key_hash=encode(digest(c.store_api_key,'sha256'),'hex')
  );

with novos(instagram,nome,telefone,email) as (values
  ('whatsapp_5575998295703','Ótica Ponto de Visão','5575998295703','poliannafsa@hotmail.com'),
  ('whatsapp_5522988478554','Genya','5522988478554','jenyferjk@icloud.com')
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
where instagram in ('whatsapp_5575998295703','whatsapp_5522988478554');

insert into public.crm_lead_etapas (lead_id,status,updated_at)
select id,'teste_catalogo_7_dias',now()
from public.leads
where instagram in ('whatsapp_5575998295703','whatsapp_5522988478554')
on conflict (lead_id) do update set status=excluded.status,updated_at=excluded.updated_at;

insert into public.interacoes (lead_id,tipo,conteudo,created_at)
select l.id,'nota','Catálogo de '||l.nome_loja||' criado e lead movido para o teste grátis de 7 dias.',now()
from public.leads l
where l.instagram in ('whatsapp_5575998295703','whatsapp_5522988478554')
  and not exists (
    select 1 from public.interacoes i
    where i.lead_id=l.id
      and i.conteudo='Catálogo de '||l.nome_loja||' criado e lead movido para o teste grátis de 7 dias.'
  );
