-- Nome opcional da cor/variacao representada por cada foto do produto.
-- Nulo preserva o comportamento dos catalogos ja publicados.
alter table public.pl_catalog_product_images
  add column if not exists variant_name text;

alter table public.pl_catalog_product_images
  drop constraint if exists pl_catalog_product_images_variant_name_length;

alter table public.pl_catalog_product_images
  add constraint pl_catalog_product_images_variant_name_length
  check (variant_name is null or char_length(variant_name) <= 50);

comment on column public.pl_catalog_product_images.variant_name is
  'Nome opcional da cor ou variacao exibida ao cliente para esta foto.';
