-- Ajuste da loja já publicada à regra de três provas diárias para novos catálogos.
update public.pl_catalog_stores set limite_diario = 3 where slug = 'opticamillena';
