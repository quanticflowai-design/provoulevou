update auth.users
set
  raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
    || jsonb_build_object('pl_catalog_admin', true),
  updated_at = now()
where lower(email) = lower('lucasdecamargo2015@gmail.com');
