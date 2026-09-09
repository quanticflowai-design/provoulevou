-- Remove o limite prático de provas diárias do catálogo Nyll Ótica.
-- O valor 999 segue o padrão de catálogo ilimitado já usado em produção.
update public.pl_catalog_stores
   set limite_diario = 999,
       updated_at = now()
 where slug = 'nyllotica';
