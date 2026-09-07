-- Precision Prime: cinco provas por dia. O limite é aplicado por loja e o
-- consumo considerado é o maior entre o telefone e o IP do cliente.

update public.pl_catalog_stores
   set limite_diario = 5
 where slug = 'precisionprime';

create or replace function public.pl_catalog_check_limit(
  p_slug text,
  p_phone text,
  p_limite integer default null
)
returns json
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_store     uuid;
  v_lim       int;
  v_digits    text;
  v_ph        numeric;
  v_ip        text;
  v_phone_cnt int := 0;
  v_ip_cnt    int := 0;
  v_usadas    int;
  v_ini       timestamptz := date_trunc('day', now() at time zone 'America/Sao_Paulo')
                             at time zone 'America/Sao_Paulo';
begin
  select id, coalesce(limite_diario, 3)
    into v_store, v_lim
    from pl_catalog_stores
   where slug = p_slug and is_active
   limit 1;

  if v_store is null then
    return json_build_object('erro', 'loja nao encontrada');
  end if;

  v_digits := nullif(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), '');
  if v_digits is not null then
    if length(v_digits) > 11 and left(v_digits, 2) = '55' then
      v_digits := substring(v_digits from 3);
    end if;
    v_ph := v_digits::numeric;
  end if;

  v_ip := nullif(btrim(split_part(
            coalesce(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ''),
            ',', 1)), '');

  select
    count(*) filter (where v_ph is not null and g.telefone_cliente = v_ph),
    count(*) filter (where v_ip is not null and g.ip_address = v_ip)
    into v_phone_cnt, v_ip_cnt
    from geracoes_provou_levou g
   where g.created_at >= v_ini
     and (g.catalog_store_id = v_store
          or g.origin ilike '%/catalogo/' || p_slug || '%');

  v_usadas := greatest(v_phone_cnt, v_ip_cnt);

  return json_build_object(
    'dia',       to_char(v_ini at time zone 'America/Sao_Paulo', 'YYYY-MM-DD'),
    'limite',    v_lim,
    'usadas',    v_phone_cnt,
    'ip_usadas', v_ip_cnt,
    'restantes', greatest(0, v_lim - v_usadas),
    'limited',   v_usadas >= v_lim
  );
end;
$function$;
