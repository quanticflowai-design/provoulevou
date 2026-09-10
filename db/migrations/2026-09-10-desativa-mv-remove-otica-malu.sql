-- MV Ótica: catálogo fora do ar, com cadastro, produtos e login preservados.
update public.pl_catalog_stores
set is_active = false
where slug = 'mvotica';

update public.provou_levou_stores
set active = false,
    api_key_active = false,
    status = 'Inativo'
where id = '5f42702a-e01b-45e5-b211-8239e2815848';

-- Ótica Malu: remoção integral do cadastro remanescente e do lead no CRM.
delete from public.crm_lead_etapas
where lead_id = '797732d5-8eb0-4eea-b6da-deec39614e6f';

delete from public.interacoes
where lead_id = '797732d5-8eb0-4eea-b6da-deec39614e6f';

delete from public.leads
where id = '797732d5-8eb0-4eea-b6da-deec39614e6f';

delete from public.provou_levou_stores
where id = '7fa472db-1b0d-4e07-adbf-a0e7aa601b65';
