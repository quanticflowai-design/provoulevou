create or replace function public.pl_catalog_remove_category(p_slug text, p_category text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  loja public.pl_catalog_stores%rowtype;
  email_usuario text;
  administrador boolean;
  v_categoria text := lower(trim(p_category));
begin
  if auth.uid() is null then raise exception 'Login necessário' using errcode = '42501'; end if;
  select email, coalesce((raw_app_meta_data->>'pl_catalog_admin')::boolean, false)
    into email_usuario, administrador from auth.users where id = auth.uid();
  select * into loja from public.pl_catalog_stores where slug = p_slug for update;
  if loja.id is null or not coalesce(administrador or lower(loja.owner_email) = lower(email_usuario), false)
    then raise exception 'Sem permissão para este catálogo' using errcode = '42501'; end if;
  if v_categoria is null or v_categoria = '' then raise exception 'Categoria inválida'; end if;
  update public.pl_catalog_products p set
    categorias_vitrine = array(select c from unnest(p.categorias_vitrine) c where lower(trim(c)) <> v_categoria),
    categoria_vitrine = case when lower(trim(p.categoria_vitrine)) = v_categoria
      then (select c from unnest(p.categorias_vitrine) c where lower(trim(c)) <> v_categoria limit 1)
      else p.categoria_vitrine end,
    updated_at = now()
  where p.store_id = loja.id and (lower(trim(p.categoria_vitrine)) = v_categoria
    or exists(select 1 from unnest(p.categorias_vitrine) c where lower(trim(c)) = v_categoria));
  update public.pl_catalog_stores set categorias_ordem =
    array(select c from unnest(categorias_ordem) c where lower(trim(c)) <> v_categoria), updated_at = now()
    where id = loja.id;
  return jsonb_build_object('ok', true);
end;
$$;
revoke all on function public.pl_catalog_remove_category(text, text) from public, anon;
grant execute on function public.pl_catalog_remove_category(text, text) to authenticated;
