-- Um produto pode aparecer em varias categorias, e cada loja controla a ordem
-- em que os filtros dessas categorias aparecem para o cliente.
alter table public.pl_catalog_products
  add column if not exists categorias_vitrine text[];

alter table public.pl_catalog_stores
  add column if not exists categorias_ordem text[];

update public.pl_catalog_products
set categorias_vitrine = array[btrim(categoria_vitrine)]
where coalesce(btrim(categoria_vitrine), '') <> ''
  and coalesce(cardinality(categorias_vitrine), 0) = 0;

alter table public.pl_catalog_products
  drop constraint if exists pl_catalog_products_categorias_vitrine_limit;

alter table public.pl_catalog_products
  add constraint pl_catalog_products_categorias_vitrine_limit
  check (categorias_vitrine is null or cardinality(categorias_vitrine) <= 20);

alter table public.pl_catalog_stores
  drop constraint if exists pl_catalog_stores_categorias_ordem_limit;

alter table public.pl_catalog_stores
  add constraint pl_catalog_stores_categorias_ordem_limit
  check (categorias_ordem is null or cardinality(categorias_ordem) <= 50);

comment on column public.pl_catalog_products.categorias_vitrine is
  'Categorias em que o produto aparece. categoria_vitrine guarda a primeira para compatibilidade.';

comment on column public.pl_catalog_stores.categorias_ordem is
  'Ordem escolhida pela loja para os filtros de categoria no catalogo.';
