-- Óticas Séculos e AV Óculos: catálogos, gerador e teste grátis no CRM.

insert into public.pl_catalog_stores (slug, display_name, logo_url, whatsapp, bio, primary_color, store_api_key, owner_email, plan, is_active, tema, limite_diario)
select 'oticaseculos', 'Óticas Séculos', 'https://cdn.jsdelivr.net/gh/quanticflowai-design/provoulevou@4d05e0c/catalogo/assets/logo-oticaseculos.webp', '5512988307183', 'Óticas Séculos', '#F2C21A',
       'pl_cat_' || encode(gen_random_bytes(32), 'hex'), 'tarianecpaula@gmail.com', 'basic', true, '{"bg":"#101010","card":"#1C1C1C","brand":"#F2C21A","cta":"#F2C21A","onCta":"#111111"}'::jsonb, 3
where not exists (select 1 from public.pl_catalog_stores where slug='oticaseculos' or lower(owner_email)='tarianecpaula@gmail.com');

insert into public.provou_levou_stores (name, domain, email, active, company, phone, plan, status, api_key_hash, api_key_prefix, api_key_last4, api_key_created_at, api_key_active, platform, categoria)
select c.display_name, 'https://provoulevou.com.br/catalogo/?loja='||c.slug, c.owner_email, true, c.display_name, c.whatsapp,
       'Teste Grátis — Catálogo', 'Teste Gratuito', encode(digest(c.store_api_key,'sha256'),'hex'),
       left(encode(digest(c.store_api_key,'sha256'),'hex'),15), right(c.store_api_key,4), now(), true, 'catalogo', 'Óculos'
from public.pl_catalog_stores c where c.slug='oticaseculos'
and not exists (select 1 from public.provou_levou_stores p where p.api_key_hash=encode(digest(c.store_api_key,'sha256'),'hex'));

insert into public.leads (instagram,nome_loja,seguidores,tem_provador,status,notas,idioma,ponto_positivo,fonte_oportunidade,telefone,email,whatsapp,categoria,pais,plataforma)
select 'whatsapp_5512988307183','Óticas Séculos',0,false,'testando','Registrado pelo deploy do Provou Catálogo. Catálogo criado para teste grátis de 7 dias.','pt',true,'WhatsApp','5512988307183','tarianecpaula@gmail.com','5512988307183','oculos','BR','instagram'
where not exists (select 1 from public.leads where instagram='whatsapp_5512988307183' or regexp_replace(coalesce(telefone,''),'\D','','g') in ('12988307183','5512988307183') or regexp_replace(coalesce(whatsapp,''),'\D','','g') in ('12988307183','5512988307183'));

update public.leads set status='testando', email=coalesce(email,'tarianecpaula@gmail.com'), whatsapp=coalesce(whatsapp,'5512988307183'), updated_at=now()
where instagram='whatsapp_5512988307183' or regexp_replace(coalesce(telefone,''),'\D','','g') in ('12988307183','5512988307183') or regexp_replace(coalesce(whatsapp,''),'\D','','g') in ('12988307183','5512988307183');

insert into public.crm_lead_etapas (lead_id,status,updated_at)
select id,'teste_catalogo_7_dias',now() from public.leads where instagram='whatsapp_5512988307183' or regexp_replace(coalesce(telefone,''),'\D','','g') in ('12988307183','5512988307183') or regexp_replace(coalesce(whatsapp,''),'\D','','g') in ('12988307183','5512988307183')
on conflict (lead_id) do update set status=excluded.status,updated_at=excluded.updated_at;

insert into public.interacoes (lead_id,tipo,conteudo,created_at)
select l.id,'nota','Catálogo da Óticas Séculos criado e lead movido para o teste grátis de 7 dias.',now() from public.leads l
where (l.instagram='whatsapp_5512988307183' or regexp_replace(coalesce(l.telefone,''),'\D','','g') in ('12988307183','5512988307183') or regexp_replace(coalesce(l.whatsapp,''),'\D','','g') in ('12988307183','5512988307183'))
and not exists (select 1 from public.interacoes i where i.lead_id=l.id and i.conteudo='Catálogo da Óticas Séculos criado e lead movido para o teste grátis de 7 dias.');

insert into public.pl_catalog_stores (slug, display_name, logo_url, whatsapp, bio, primary_color, store_api_key, owner_email, plan, is_active, tema, limite_diario)
select 'avoculos', 'AV Óculos', 'https://cdn.jsdelivr.net/gh/quanticflowai-design/provoulevou@4d05e0c/catalogo/assets/logo-avoculos.webp', '555198531740', 'AV Óculos', '#B88A18',
       'pl_cat_' || encode(gen_random_bytes(32), 'hex'), 'anavsquintana@hotmail.com', 'basic', true, '{"bg":"#F8F4E8","card":"#FFFFFF","brand":"#9A7010","cta":"#151515","onCta":"#FFFFFF"}'::jsonb, 3
where not exists (select 1 from public.pl_catalog_stores where slug='avoculos' or lower(owner_email)='anavsquintana@hotmail.com');

insert into public.provou_levou_stores (name, domain, email, active, company, phone, plan, status, api_key_hash, api_key_prefix, api_key_last4, api_key_created_at, api_key_active, platform, categoria)
select c.display_name, 'https://provoulevou.com.br/catalogo/?loja='||c.slug, c.owner_email, true, c.display_name, c.whatsapp,
       'Teste Grátis — Catálogo', 'Teste Gratuito', encode(digest(c.store_api_key,'sha256'),'hex'),
       left(encode(digest(c.store_api_key,'sha256'),'hex'),15), right(c.store_api_key,4), now(), true, 'catalogo', 'Óculos'
from public.pl_catalog_stores c where c.slug='avoculos'
and not exists (select 1 from public.provou_levou_stores p where p.api_key_hash=encode(digest(c.store_api_key,'sha256'),'hex'));

insert into public.leads (instagram,nome_loja,seguidores,tem_provador,status,notas,idioma,ponto_positivo,fonte_oportunidade,telefone,email,whatsapp,categoria,pais,plataforma)
select 'whatsapp_555198531740','AV Óculos',0,false,'testando','Registrado pelo deploy do Provou Catálogo. Catálogo criado para teste grátis de 7 dias.','pt',true,'WhatsApp','555198531740','anavsquintana@hotmail.com','555198531740','oculos','BR','instagram'
where not exists (select 1 from public.leads where instagram='whatsapp_555198531740' or regexp_replace(coalesce(telefone,''),'\D','','g') in ('5198531740','555198531740') or regexp_replace(coalesce(whatsapp,''),'\D','','g') in ('5198531740','555198531740'));

update public.leads set status='testando', email=coalesce(email,'anavsquintana@hotmail.com'), whatsapp=coalesce(whatsapp,'555198531740'), updated_at=now()
where instagram='whatsapp_555198531740' or regexp_replace(coalesce(telefone,''),'\D','','g') in ('5198531740','555198531740') or regexp_replace(coalesce(whatsapp,''),'\D','','g') in ('5198531740','555198531740');

insert into public.crm_lead_etapas (lead_id,status,updated_at)
select id,'teste_catalogo_7_dias',now() from public.leads where instagram='whatsapp_555198531740' or regexp_replace(coalesce(telefone,''),'\D','','g') in ('5198531740','555198531740') or regexp_replace(coalesce(whatsapp,''),'\D','','g') in ('5198531740','555198531740')
on conflict (lead_id) do update set status=excluded.status,updated_at=excluded.updated_at;

insert into public.interacoes (lead_id,tipo,conteudo,created_at)
select l.id,'nota','Catálogo da AV Óculos criado e lead movido para o teste grátis de 7 dias.',now() from public.leads l
where (l.instagram='whatsapp_555198531740' or regexp_replace(coalesce(l.telefone,''),'\D','','g') in ('5198531740','555198531740') or regexp_replace(coalesce(l.whatsapp,''),'\D','','g') in ('5198531740','555198531740'))
and not exists (select 1 from public.interacoes i where i.lead_id=l.id and i.conteudo='Catálogo da AV Óculos criado e lead movido para o teste grátis de 7 dias.');
