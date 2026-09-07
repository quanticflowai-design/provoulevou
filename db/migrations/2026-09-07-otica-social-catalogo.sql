-- Ótica Social: catálogo de teste, autenticação do gerador e lead no CRM.

insert into public.pl_catalog_stores (
  slug, display_name, logo_url, whatsapp, bio, primary_color,
  store_api_key, owner_email, plan, is_active, tema, limite_diario
)
select
  'oticasocial', 'Ótica Social',
  'https://i.ibb.co/9k7MPLJW/644b5106-e04d-4211-9570-1f658c78717f-1-removebg-preview.png',
  '5565984451308', 'Ótica Social', '#111111',
  'pl_cat_' || encode(gen_random_bytes(32), 'hex'),
  'sadi_os@yahoo.com.br', 'basic', true,
  '{"bg":"#ffffff","card":"#ffffff","brand":"#111111","cta":"#111111","onCta":"#ffffff"}'::jsonb,
  3
where not exists (
  select 1 from public.pl_catalog_stores where slug = 'oticasocial'
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
where c.slug = 'oticasocial'
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
  'whatsapp_5565984451308', 'Ótica Social', 0, false, 'testando',
  'Registrado pelo deploy do Provou Catálogo. Catálogo criado para teste grátis de 7 dias.',
  'pt', true, 'WhatsApp', '5565984451308', 'oculos', 'BR', 'instagram'
where not exists (
  select 1 from public.leads where instagram = 'whatsapp_5565984451308'
);

insert into public.crm_lead_etapas (lead_id, status, updated_at)
select id, 'teste_catalogo_7_dias', now()
  from public.leads
 where instagram = 'whatsapp_5565984451308'
on conflict (lead_id) do update
set status = excluded.status, updated_at = excluded.updated_at;
