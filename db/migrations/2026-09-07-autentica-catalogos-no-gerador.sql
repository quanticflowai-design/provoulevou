-- Registra os catálogos criados hoje na autenticação usada pelo gerador.
-- A chave continua armazenada em texto apenas na tabela privada do catálogo;
-- o gerador recebe somente o SHA-256 em provou_levou_stores.

insert into public.provou_levou_stores (
  name,
  domain,
  email,
  active,
  company,
  phone,
  plan,
  status,
  api_key_hash,
  api_key_prefix,
  api_key_last4,
  api_key_created_at,
  api_key_active,
  platform,
  categoria
)
select
  c.display_name,
  'https://provoulevou.com.br/catalogo/?loja=' || c.slug,
  c.owner_email,
  true,
  c.display_name,
  c.whatsapp,
  'Teste Grátis — Catálogo',
  'Teste Gratuito',
  encode(digest(c.store_api_key, 'sha256'), 'hex'),
  left(encode(digest(c.store_api_key, 'sha256'), 'hex'), 15),
  right(c.store_api_key, 4),
  now(),
  true,
  'catalogo',
  'Óculos'
from public.pl_catalog_stores c
where c.slug in ('precisionprime', 'dafflon')
  and not exists (
    select 1
      from public.provou_levou_stores p
     where p.api_key_hash = encode(digest(c.store_api_key, 'sha256'), 'hex')
  );
