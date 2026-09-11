alter table public.pl_catalog_products
  drop constraint if exists pl_catalog_products_original_price_positive;

alter table public.pl_catalog_products
  drop constraint if exists pl_catalog_products_price_positive,
  drop constraint if exists pl_catalog_products_has_price,
  drop constraint if exists pl_catalog_products_original_above_promotional;

alter table public.pl_catalog_products
  add constraint pl_catalog_products_price_positive
    check (price is null or price > 0),
  add constraint pl_catalog_products_original_price_positive
    check (original_price is null or original_price > 0),
  add constraint pl_catalog_products_has_price
    check (price is not null or original_price is not null),
  add constraint pl_catalog_products_original_above_promotional
    check (price is null or original_price is null or original_price > price);
