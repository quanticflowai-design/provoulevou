-- Ótica Cerejeira Prime: catálogo, autenticação do gerador e teste grátis.
begin;

insert into public.pl_catalog_stores (
  slug, display_name, logo_url, whatsapp, bio, primary_color,
  store_api_key, owner_email, plan, is_active, tema, limite_diario
)
select
  'oticacerejeiraprime', 'Ótica Cerejeira Prime',
  'https://provoulevou.com.br/catalogo/assets/logo-oticacerejeiraprime.webp',
  '556793413357', 'Ótica Cerejeira Prime', '#79C9E8',
  'pl_cat_' || encode(gen_random_bytes(32), 'hex'),
  'oticacerejeiraprime@gmail.com', 'basic', true,
  '{"bg":"#F5FCFF","card":"#FFFFFF","brand":"#2A91BC","cta":"#2A91BC","onCta":"#FFFFFF"}'::jsonb,
  3
where not exists (
  select 1 from public.pl_catalog_stores
  where slug = 'oticacerejeiraprime'
     or lower(owner_email) = 'oticacerejeiraprime@gmail.com'
);

insert into public.provou_levou_stores (
  name, domain, email, active, company, phone, plan, status,
  api_key_hash, api_key_prefix, api_key_last4, api_key_created_at,
  api_key_active, platform, categoria
)
select
  display_name, 'https://provoulevou.com.br/catalogo/?loja=' || slug,
  owner_email, true, display_name, whatsapp,
  'Teste Grátis — Catálogo', 'Teste Gratuito',
  encode(digest(store_api_key, 'sha256'), 'hex'),
  left(encode(digest(store_api_key, 'sha256'), 'hex'), 15),
  right(store_api_key, 4), now(), true, 'catalogo', 'oculos'
from public.pl_catalog_stores c
where c.slug = 'oticacerejeiraprime'
  and not exists (
    select 1 from public.provou_levou_stores p
    where lower(p.email) = lower(c.owner_email)
       or p.api_key_hash = encode(digest(c.store_api_key, 'sha256'), 'hex')
  );

commit;
