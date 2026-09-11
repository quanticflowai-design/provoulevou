-- Oferta opcional e identificadores que tornam os uploads repetiveis sem
-- duplicar produtos quando o celular perde a resposta do primeiro envio.
alter table public.pl_catalog_products
  add column if not exists original_price numeric(12,2),
  add column if not exists client_request_id text;

alter table public.pl_catalog_product_images
  add column if not exists client_request_id text;

alter table public.pl_catalog_products
  drop constraint if exists pl_catalog_products_original_price_positive;

alter table public.pl_catalog_products
  add constraint pl_catalog_products_original_price_positive
  check (original_price is null or original_price > price);

create unique index if not exists pl_catalog_products_request_unique
  on public.pl_catalog_products (store_id, client_request_id);

create unique index if not exists pl_catalog_product_images_request_unique
  on public.pl_catalog_product_images (client_request_id);

comment on column public.pl_catalog_products.original_price is
  'Preco anterior opcional, exibido riscado quando maior que o preco atual.';

comment on column public.pl_catalog_products.client_request_id is
  'Identificador do envio no navegador; impede duplicacao em repeticoes automaticas.';

comment on column public.pl_catalog_product_images.client_request_id is
  'Identificador do upload no navegador; impede duplicacao em repeticoes automaticas.';
