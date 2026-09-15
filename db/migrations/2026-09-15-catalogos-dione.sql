-- Cinco catálogos solicitados em 15/09; chaves geradas apenas no banco.
BEGIN;
WITH lojas(slug,nome,email,telefone,logo,cor,tema) AS (VALUES
('oticasclayeali','Óticas Clay & Ali','claytondavid8@gmail.com','5514999021739','https://provoulevou.com.br/catalogo/assets/logo-oticasclayeali.webp','#637A37','{"bg": "#F6F8F1", "card": "#FFFFFF", "brand": "#637A37", "cta": "#637A37", "onCta": "#FFFFFF"}'::jsonb),
('oculosok','Óculos OK','oculosok@gmail.com','5522992616869','https://provoulevou.com.br/catalogo/assets/logo-oculosok.webp','#1466C3','{"bg": "#F5F7FC", "card": "#FFFFFF", "brand": "#1466C3", "cta": "#1466C3", "onCta": "#FFFFFF"}'::jsonb),
('bellavi','Bellavi','marciaantunes.ntf@gmail.com','5551996739517','https://provoulevou.com.br/catalogo/assets/logo-bellavi.webp','#826624','{"bg": "#FBF9F3", "card": "#FFFFFF", "brand": "#826624", "cta": "#826624", "onCta": "#FFFFFF"}'::jsonb),
('oticascarolsantaluzia','Óticas Carol - Santa Luzia','bguidialano@gmail.com','5548996063048','https://provoulevou.com.br/catalogo/assets/logo-oticascarolsantaluzia.webp','#07467F','{"bg": "#F3F7FC", "card": "#FFFFFF", "brand": "#07467F", "cta": "#07467F", "onCta": "#FFFFFF"}'::jsonb),
('folieotica','Folie Ótica Exclusiva','oficialfolie@gmail.com','5541991956892','https://provoulevou.com.br/catalogo/assets/logo-folieotica.webp','#80525C','{"bg": "#FCF6F7", "card": "#FFFFFF", "brand": "#80525C", "cta": "#80525C", "onCta": "#FFFFFF"}'::jsonb))
INSERT INTO public.pl_catalog_stores(slug,display_name,owner_email,whatsapp,logo_url,primary_color,tema,bio,plan,is_active,limite_diario,store_api_key)
SELECT slug,nome,email,telefone,logo,cor,tema,nome,'basic',true,3,'pl_cat_'||encode(gen_random_bytes(32),'hex') FROM lojas l
WHERE NOT EXISTS(SELECT 1 FROM public.pl_catalog_stores c WHERE c.slug=l.slug OR lower(c.owner_email)=lower(l.email));
INSERT INTO public.provou_levou_stores(name,company,email,phone,domain,active,api_key_active,api_key_hash,platform,categoria,plan,status)
SELECT c.display_name,c.display_name,c.owner_email,c.whatsapp,'https://provoulevou.com.br/catalogo/?loja='||c.slug,true,true,encode(digest(c.store_api_key,'sha256'),'hex'),'catalogo','oculos','Teste Grátis — Catálogo','Teste Gratuito'
FROM public.pl_catalog_stores c WHERE c.slug IN ('oticasclayeali','oculosok','bellavi','oticascarolsantaluzia','folieotica') AND NOT EXISTS(SELECT 1 FROM public.provou_levou_stores p WHERE lower(p.email)=lower(c.owner_email));
COMMIT;
