-- Studio Visual: catálogo, ativação do gerador e etapa do CRM.
-- Também aponta os logos ativos para os WebP locais otimizados.

insert into public.pl_catalog_stores (
  slug, display_name, logo_url, whatsapp, bio, primary_color,
  store_api_key, owner_email, plan, is_active, tema, limite_diario
)
select
  'studiovisual', 'Ótica Studio Visual',
  'https://provoulevou.com.br/catalogo/assets/logo-studiovisual.webp',
  '5521992984688', 'Ótica Studio Visual', '#C5161D',
  'pl_cat_' || encode(gen_random_bytes(32), 'hex'),
  'studiovisualotica@gmail.com', 'basic', true,
  '{"bg":"#ffffff","card":"#ffffff","brand":"#C5161D","cta":"#9F1016","onCta":"#ffffff"}'::jsonb,
  3
where not exists (
  select 1 from public.pl_catalog_stores where slug = 'studiovisual'
);

insert into public.provou_levou_stores (
  name, domain, email, active, company, phone, plan, status,
  api_key_hash, api_key_prefix, api_key_last4, api_key_created_at,
  api_key_active, platform, categoria
)
select
  c.display_name,
  'https://provoulevou.com.br/catalogo/?loja=' || c.slug,
  c.owner_email, true, c.display_name, c.whatsapp,
  'Teste Grátis — Catálogo', 'Teste Gratuito',
  encode(digest(c.store_api_key, 'sha256'), 'hex'),
  left(encode(digest(c.store_api_key, 'sha256'), 'hex'), 15),
  right(c.store_api_key, 4), now(), true, 'catalogo', 'Óculos'
from public.pl_catalog_stores c
where c.slug = 'studiovisual'
  and not exists (
    select 1 from public.provou_levou_stores p
     where p.api_key_hash = encode(digest(c.store_api_key, 'sha256'), 'hex')
  );

update public.leads
   set status = 'testando', updated_at = now()
 where id = '05950900-f6cd-47de-8d3d-4d431a126bc0';

insert into public.crm_lead_etapas (lead_id, status, updated_at)
values ('05950900-f6cd-47de-8d3d-4d431a126bc0', 'teste_catalogo_7_dias', now())
on conflict (lead_id) do update
set status = excluded.status, updated_at = excluded.updated_at;

insert into public.interacoes (lead_id, tipo, conteudo, created_at)
select '05950900-f6cd-47de-8d3d-4d431a126bc0', 'nota',
       'Catálogo Studio Visual criado e lead movido para o teste grátis de 7 dias.', now()
where not exists (
  select 1 from public.interacoes
   where lead_id = '05950900-f6cd-47de-8d3d-4d431a126bc0'
     and conteudo = 'Catálogo Studio Visual criado e lead movido para o teste grátis de 7 dias.'
);

update public.pl_catalog_stores
   set logo_url = 'https://provoulevou.com.br/catalogo/assets/logo-' || slug || '.webp'
 where slug in (
   'carone', 'catglass', 'dafflon', 'diamond', 'florao', 'foreyes',
   'gcstore', 'goulart', 'mendonca', 'millu', 'mvotica', 'oticadebora',
   'oticamatheus', 'oticamoderna', 'oticapopular', 'oticasocial',
   'paranhos', 'precisionprime', 'provoulevou', 'ruby', 'satika', 'stilus',
   'studiovisual', 'valterotica', 'visaodf', 'visualmix', 'vyre'
 );
