-- Ótica Visualmix: catálogo, ativação do gerador e etapa do CRM.

insert into public.pl_catalog_stores (
  slug, display_name, logo_url, whatsapp, bio, primary_color,
  store_api_key, owner_email, plan, is_active, tema, limite_diario
)
select
  'visualmix', 'Ótica Visualmix',
  'https://provoulevou.com.br/catalogo/assets/logo-visualmix.webp',
  '5543991134595', 'Ótica Visualmix', '#7A4030',
  'pl_cat_' || encode(gen_random_bytes(32), 'hex'),
  'imprensa.pmjapira@hotmail.com', 'basic', true,
  '{"bg":"#ffffff","card":"#ffffff","brand":"#7A4030","cta":"#7A4030","onCta":"#ffffff"}'::jsonb,
  3
where not exists (
  select 1 from public.pl_catalog_stores where slug = 'visualmix'
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
where c.slug = 'visualmix'
  and not exists (
    select 1 from public.provou_levou_stores p
     where p.api_key_hash = encode(digest(c.store_api_key, 'sha256'), 'hex')
  );

insert into public.leads (
  instagram, nome_loja, seguidores, tem_provador, status, notas,
  idioma, ponto_positivo, fonte_oportunidade, telefone, categoria,
  pais, plataforma
)
select
  'whatsapp_5543991134595', 'Ótica Visualmix', 0, false, 'testando',
  'Registrado pelo deploy do Provou Catálogo. Catálogo criado para teste grátis de 7 dias.',
  'pt', true, 'WhatsApp', '5543991134595', 'oculos', 'BR', 'instagram'
where not exists (
  select 1 from public.leads where instagram = 'whatsapp_5543991134595'
);

insert into public.crm_lead_etapas (lead_id, status, updated_at)
select id, 'teste_catalogo_7_dias', now()
  from public.leads
 where instagram = 'whatsapp_5543991134595'
on conflict (lead_id) do update
set status = excluded.status, updated_at = excluded.updated_at;
