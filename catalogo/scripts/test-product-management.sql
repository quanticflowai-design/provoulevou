
-- Integration checks are rolled back; no products or images remain.
BEGIN;
DO $test$
DECLARE sid uuid; uid uuid; other_sid uuid; pid uuid; copyid uuid; img1 uuid; img2 uuid; result jsonb;
BEGIN
 SELECT s.id,u.id INTO sid,uid FROM pl_catalog_stores s JOIN auth.users u ON lower(s.owner_email)=lower(u.email)
 WHERE coalesce(u.raw_app_meta_data->>'pl_catalog_admin','false')<>'true' LIMIT 1;
 IF sid IS NULL THEN RAISE EXCEPTION 'No owner fixture'; END IF;
 PERFORM set_config('request.jwt.claim.sub',uid::text,true);
 result=pl_catalog_manage(sid,'stage','{"name":"QA transactional draft","request_id":"qa-product-management"}');
 pid=(result->>'id')::uuid;
 IF (SELECT is_active FROM pl_catalog_products WHERE id=pid) THEN RAISE EXCEPTION 'Draft published'; END IF;
 IF (pl_catalog_manage(sid,'stage','{"request_id":"qa-product-management"}')->>'id')::uuid<>pid THEN RAISE EXCEPTION 'Not idempotent'; END IF;
 BEGIN
   PERFORM pl_catalog_manage(sid,'save',jsonb_build_object('id',pid,'name','QA','is_active',true,'images','[]'::jsonb));
   RAISE EXCEPTION 'Publication without fields allowed';
 EXCEPTION WHEN raise_exception THEN
   IF SQLERRM='Publication without fields allowed' THEN RAISE; END IF;
 END;
 INSERT INTO pl_catalog_product_images(product_id,url,position,is_primary,variant_name) VALUES(pid,'https://example.invalid/one.jpg',1,true,'Preto') RETURNING id INTO img1;
 INSERT INTO pl_catalog_product_images(product_id,url,position,is_primary,variant_name) VALUES(pid,'https://example.invalid/two.jpg',2,false,'Azul') RETURNING id INTO img2;
 result=pl_catalog_manage(sid,'save',jsonb_build_object('id',pid,'name','QA','unit_name','Centro','original_price',100,'is_active',true,'is_featured',true,
   'images',jsonb_build_array(jsonb_build_object('id',img2,'variant_name','Azul'),jsonb_build_object('id',img1,'variant_name','Preto'))));
 IF NOT(SELECT is_primary AND position=1 FROM pl_catalog_product_images WHERE id=img2) THEN RAISE EXCEPTION 'Cover order failed'; END IF;
 copyid=(pl_catalog_manage(sid,'duplicate',jsonb_build_object('id',pid,'request_id','qa-duplicate'))->>'id')::uuid;
 IF (SELECT is_active FROM pl_catalog_products WHERE id=copyid) OR (SELECT count(*) FROM pl_catalog_product_images WHERE product_id=copyid)<>2 THEN RAISE EXCEPTION 'Clone failed'; END IF;
 IF (SELECT unit_name FROM pl_catalog_products WHERE id=copyid) IS DISTINCT FROM 'Centro' THEN RAISE EXCEPTION 'Unit clone failed'; END IF;
 PERFORM pl_catalog_manage(sid,'bulk',jsonb_build_object('ids',jsonb_build_array(pid,copyid),'original_price',120,'is_featured',false));
 IF (SELECT count(*) FROM pl_catalog_products WHERE id IN(pid,copyid) AND original_price=120 AND NOT is_featured)<>2 THEN RAISE EXCEPTION 'Bulk failed'; END IF;
 BEGIN
   PERFORM pl_catalog_manage(sid,'bulk',jsonb_build_object('ids',jsonb_build_array(pid,copyid),'price',200));
   RAISE EXCEPTION 'Bad price allowed';
 EXCEPTION WHEN raise_exception OR check_violation THEN IF SQLERRM='Bad price allowed' THEN RAISE; END IF; END;
 IF EXISTS(SELECT 1 FROM pl_catalog_products WHERE id IN(pid,copyid) AND price=200) THEN RAISE EXCEPTION 'Bulk partial write'; END IF;
 SELECT id INTO other_sid FROM pl_catalog_stores WHERE owner_email<>(SELECT email FROM auth.users WHERE id=uid) LIMIT 1;
 BEGIN
   PERFORM pl_catalog_manage(other_sid,'list');
   RAISE EXCEPTION 'Cross-store access allowed';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM='Cross-store access allowed' THEN RAISE; END IF; END;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(pl_catalog_manage(sid,'list')) j WHERE j->>'id'=copyid::text AND (j->>'is_active')::boolean) THEN RAISE EXCEPTION 'Draft state lost'; END IF;
 PERFORM set_config('qa.draft_id',copyid::text,true);
 RAISE NOTICE 'PASS: draft, idempotency, publish validation, cover, clone, bulk atomicity, tenant isolation';
END;
$test$;
SET LOCAL ROLE anon;
DO $test$
BEGIN
 IF EXISTS(SELECT 1 FROM public.pl_catalog_products WHERE id=current_setting('qa.draft_id')::uuid) THEN RAISE EXCEPTION 'Draft visible anonymously'; END IF;
 IF has_function_privilege('anon','public.pl_catalog_manage(uuid,text,jsonb)','EXECUTE') THEN RAISE EXCEPTION 'Anonymous write allowed'; END IF;
 RAISE NOTICE 'PASS: draft hidden from public and anonymous RPC denied';
END;
$test$;
ROLLBACK;
