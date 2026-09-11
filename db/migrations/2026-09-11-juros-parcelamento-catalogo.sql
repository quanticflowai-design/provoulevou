-- Taxa opcional definida pelo lojista para cada parcela no cartão.
alter table public.pl_catalog_products
  add column if not exists installment_interest_rate numeric(6,3);

alter table public.pl_catalog_products
  drop constraint if exists pl_catalog_products_installment_interest_rate_range;

alter table public.pl_catalog_products
  add constraint pl_catalog_products_installment_interest_rate_range
  check (installment_interest_rate is null or
         (installment_interest_rate > 0 and installment_interest_rate <= 20));

comment on column public.pl_catalog_products.installment_interest_rate is
  'Percentual de juros aplicado por parcela. Nulo significa parcelamento sem juros.';
