BEGIN;
DO $create$
DECLARE v_key text;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.leads WHERE id='17921848-450f-4c63-8bdc-edaa62f3c071'::uuid AND telefone='5511981613930') THEN RAISE EXCEPTION 'Lead não confirmado'; END IF;
 IF EXISTS(SELECT 1 FROM public.pl_catalog_stores WHERE slug='prevedelloacessorios') THEN RETURN; END IF;
 IF EXISTS(SELECT 1 FROM public.pl_catalog_stores WHERE lower(owner_email)='prevedelloacessorios@gmail.com') THEN RAISE EXCEPTION 'Email já possui catálogo'; END IF;
 v_key:=encode(gen_random_bytes(32),'hex');
 INSERT INTO public.pl_catalog_stores(slug,display_name,logo_url,whatsapp,owner_email,plan,is_active,primary_color,tema,limite_diario,store_api_key)
 VALUES('prevedelloacessorios','Prevedello Acessórios','https://provoulevou.com.br/catalogo/assets/logo-prevedelloacessorios.webp','5511960698884','prevedelloacessorios@gmail.com','basic',true,'#136575','{"bg": "#F0FCFE", "card": "#FFFFFF", "brand": "#136575", "cta": "#136575", "onCta": "#FFFFFF", "line": "#C7E7EB"}'::jsonb,3,v_key);
 INSERT INTO public.provou_levou_stores(name,domain,email,company,phone,plan,status,active,api_key_hash,api_key_active,platform,categoria,store_id)
 VALUES('Prevedello Acessórios','https://provoulevou.com.br/catalogo/?loja=prevedelloacessorios','prevedelloacessorios@gmail.com','Prevedello Acessórios','5511960698884','basic','Teste Gratuito',true,encode(digest(v_key,'sha256'),'hex'),true,'catalogo','roupa','prevedelloacessorios');
 UPDATE public.leads SET status='testando',email='prevedelloacessorios@gmail.com',teste_gratis_em=current_date,updated_at=now() WHERE id='17921848-450f-4c63-8bdc-edaa62f3c071'::uuid;
 INSERT INTO public.crm_lead_etapas(lead_id,status) VALUES('17921848-450f-4c63-8bdc-edaa62f3c071'::uuid,'teste_catalogo_7_dias') ON CONFLICT(lead_id) DO UPDATE SET status=excluded.status,updated_at=now();
 INSERT INTO public.interacoes(lead_id,tipo,conteudo) VALUES('17921848-450f-4c63-8bdc-edaa62f3c071'::uuid,'nota','Catálogo Prevedello Acessórios criado com dados e logo da conversa com Dione. Teste grátis de 7 dias; 3 provas/dia. Aguardando cadastro de produtos pelo lojista.');
END $create$;
DO $create$
DECLARE v_key text;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.leads WHERE id='cda1483b-1c5f-466c-870c-c7c3ea47eab6'::uuid AND telefone='558488655736') THEN RAISE EXCEPTION 'Lead não confirmado'; END IF;
 IF EXISTS(SELECT 1 FROM public.pl_catalog_stores WHERE slug='eleganceclassic') THEN RETURN; END IF;
 IF EXISTS(SELECT 1 FROM public.pl_catalog_stores WHERE lower(owner_email)='otica_eleganceclassic@hotmail.com') THEN RAISE EXCEPTION 'Email já possui catálogo'; END IF;
 v_key:=encode(gen_random_bytes(32),'hex');
 INSERT INTO public.pl_catalog_stores(slug,display_name,logo_url,whatsapp,owner_email,plan,is_active,primary_color,tema,limite_diario,store_api_key)
 VALUES('eleganceclassic','Ótica Elegance Classic','https://provoulevou.com.br/catalogo/assets/logo-eleganceclassic.webp','5584991747728','otica_eleganceclassic@hotmail.com','basic',true,'#171717','{"bg": "#FAFAFA", "card": "#FFFFFF", "brand": "#171717", "cta": "#171717", "onCta": "#FFFFFF", "line": "#DEDEDE"}'::jsonb,3,v_key);
 INSERT INTO public.provou_levou_stores(name,domain,email,company,phone,plan,status,active,api_key_hash,api_key_active,platform,categoria,store_id)
 VALUES('Ótica Elegance Classic','https://provoulevou.com.br/catalogo/?loja=eleganceclassic','otica_eleganceclassic@hotmail.com','Ótica Elegance Classic','5584991747728','basic','Teste Gratuito',true,encode(digest(v_key,'sha256'),'hex'),true,'catalogo','oculos','eleganceclassic');
 UPDATE public.leads SET status='testando',email='otica_eleganceclassic@hotmail.com',teste_gratis_em=current_date,updated_at=now() WHERE id='cda1483b-1c5f-466c-870c-c7c3ea47eab6'::uuid;
 INSERT INTO public.crm_lead_etapas(lead_id,status) VALUES('cda1483b-1c5f-466c-870c-c7c3ea47eab6'::uuid,'teste_catalogo_7_dias') ON CONFLICT(lead_id) DO UPDATE SET status=excluded.status,updated_at=now();
 INSERT INTO public.interacoes(lead_id,tipo,conteudo) VALUES('cda1483b-1c5f-466c-870c-c7c3ea47eab6'::uuid,'nota','Catálogo Ótica Elegance Classic criado com dados e logo da conversa com Dione. Teste grátis de 7 dias; 3 provas/dia. Aguardando cadastro de produtos pelo lojista.');
END $create$;
DO $create$
DECLARE v_key text;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.leads WHERE id='0fac8cb3-ff25-4535-a171-adfba5f649a9'::uuid AND telefone='554196639062') THEN RAISE EXCEPTION 'Lead não confirmado'; END IF;
 IF EXISTS(SELECT 1 FROM public.pl_catalog_stores WHERE slug='oticasmarine') THEN RETURN; END IF;
 IF EXISTS(SELECT 1 FROM public.pl_catalog_stores WHERE lower(owner_email)='marineportao@gmail.com') THEN RAISE EXCEPTION 'Email já possui catálogo'; END IF;
 v_key:=encode(gen_random_bytes(32),'hex');
 INSERT INTO public.pl_catalog_stores(slug,display_name,logo_url,whatsapp,owner_email,plan,is_active,primary_color,tema,limite_diario,store_api_key)
 VALUES('oticasmarine','Óticas Marine','https://provoulevou.com.br/catalogo/assets/logo-oticasmarine.webp','5541996639062','marineportao@gmail.com','basic',true,'#243F85','{"bg": "#F5F8FF", "card": "#FFFFFF", "brand": "#243F85", "cta": "#243F85", "onCta": "#FFFFFF", "line": "#D6E0F5"}'::jsonb,3,v_key);
 INSERT INTO public.provou_levou_stores(name,domain,email,company,phone,plan,status,active,api_key_hash,api_key_active,platform,categoria,store_id)
 VALUES('Óticas Marine','https://provoulevou.com.br/catalogo/?loja=oticasmarine','marineportao@gmail.com','Óticas Marine','5541996639062','basic','Teste Gratuito',true,encode(digest(v_key,'sha256'),'hex'),true,'catalogo','oculos','oticasmarine');
 UPDATE public.leads SET status='testando',email='marineportao@gmail.com',teste_gratis_em=current_date,updated_at=now() WHERE id='0fac8cb3-ff25-4535-a171-adfba5f649a9'::uuid;
 INSERT INTO public.crm_lead_etapas(lead_id,status) VALUES('0fac8cb3-ff25-4535-a171-adfba5f649a9'::uuid,'teste_catalogo_7_dias') ON CONFLICT(lead_id) DO UPDATE SET status=excluded.status,updated_at=now();
 INSERT INTO public.interacoes(lead_id,tipo,conteudo) VALUES('0fac8cb3-ff25-4535-a171-adfba5f649a9'::uuid,'nota','Catálogo Óticas Marine criado com dados e logo da conversa com Dione. Teste grátis de 7 dias; 3 provas/dia. Aguardando cadastro de produtos pelo lojista.');
END $create$;
DO $create$
DECLARE v_key text;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.leads WHERE id='21b0c64b-474f-4623-bc3c-aee8d493bd40'::uuid AND telefone='558191354198') THEN RAISE EXCEPTION 'Lead não confirmado'; END IF;
 IF EXISTS(SELECT 1 FROM public.pl_catalog_stores WHERE slug='oticadigital') THEN RETURN; END IF;
 IF EXISTS(SELECT 1 FROM public.pl_catalog_stores WHERE lower(owner_email)='oticasdgt.com@gmail.com') THEN RAISE EXCEPTION 'Email já possui catálogo'; END IF;
 v_key:=encode(gen_random_bytes(32),'hex');
 INSERT INTO public.pl_catalog_stores(slug,display_name,logo_url,whatsapp,owner_email,plan,is_active,primary_color,tema,limite_diario,store_api_key)
 VALUES('oticadigital','Ótica Digital','https://provoulevou.com.br/catalogo/assets/logo-oticadigital.webp','5581998281876','oticasdgt.com@gmail.com','basic',true,'#076BAA','{"bg": "#F4FAFF", "card": "#FFFFFF", "brand": "#076BAA", "cta": "#076BAA", "onCta": "#FFFFFF", "line": "#CDE5F5"}'::jsonb,3,v_key);
 INSERT INTO public.provou_levou_stores(name,domain,email,company,phone,plan,status,active,api_key_hash,api_key_active,platform,categoria,store_id)
 VALUES('Ótica Digital','https://provoulevou.com.br/catalogo/?loja=oticadigital','oticasdgt.com@gmail.com','Ótica Digital','5581998281876','basic','Teste Gratuito',true,encode(digest(v_key,'sha256'),'hex'),true,'catalogo','oculos','oticadigital');
 UPDATE public.leads SET status='testando',email='oticasdgt.com@gmail.com',teste_gratis_em=current_date,updated_at=now() WHERE id='21b0c64b-474f-4623-bc3c-aee8d493bd40'::uuid;
 INSERT INTO public.crm_lead_etapas(lead_id,status) VALUES('21b0c64b-474f-4623-bc3c-aee8d493bd40'::uuid,'teste_catalogo_7_dias') ON CONFLICT(lead_id) DO UPDATE SET status=excluded.status,updated_at=now();
 INSERT INTO public.interacoes(lead_id,tipo,conteudo) VALUES('21b0c64b-474f-4623-bc3c-aee8d493bd40'::uuid,'nota','Catálogo Ótica Digital criado com dados e logo da conversa com Dione. Teste grátis de 7 dias; 3 provas/dia. Aguardando cadastro de produtos pelo lojista.');
END $create$;
COMMIT;
