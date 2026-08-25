-- pl_catalog_check_limit v2: a franquia da loja no banco (pl_catalog_stores.
-- limite_diario) passa a ser autoritativa — era só o argumento p_limite, que o
-- gerador fixava em 3 e o browser podia inventar. NULL em limite_diario = SEM
-- limite (caso Satika). Loja com valor (ruby=1, demais=3) segue igual a hoje.
--
-- COMO RODAR: colar inteiro no SQL editor do Supabase (DDL não passa pelo REST).

-- NULL passa a significar "sem limite" — a coluna nasceu NOT NULL default 3.
alter table public.pl_catalog_stores alter column limite_diario drop not null;

-- Satika: sem limite de provas (pedido de 25/08/2026).
update public.pl_catalog_stores set limite_diario = null where slug = 'satika';
create or replace function public.pl_catalog_check_limit(
  p_slug   text,
  p_phone  text,
  p_limite int default 3
)
returns jsonb
language plpgsql
stable
security definer
set search_path to 'public'
as $function$
declare
  v_store     uuid;
  v_lim_loja  int;
  v_tem_lim   boolean;
  v_ilimitado boolean := false;
  v_key       text;
  v_ip        text;
  v_inicio    timestamptz;
  v_usadas    int := 0;
  v_ip_usadas int := 0;
begin
  if p_limite is null or p_limite < 1 or p_limite > 50 then
    p_limite := 3;
  end if;

  v_inicio := date_trunc('day', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo';

  select id, limite_diario, true into v_store, v_lim_loja, v_tem_lim
    from pl_catalog_stores where slug = p_slug limit 1;
  if v_store is null then
    return jsonb_build_object(
      'erro', 'loja_nao_encontrada', 'limite', p_limite,
      'usadas', 0, 'restantes', p_limite, 'limited', false, 'ip_usadas', 0
    );
  end if;

  -- franquia da loja: NULL = ilimitado; >=1 vence o p_limite vindo do cliente
  if v_lim_loja is null then
    v_ilimitado := true;
  elsif v_lim_loja >= 1 then
    p_limite := least(v_lim_loja, 1000);
  end if;

  v_key := public.pl_catalog_tel_key(p_phone);
  if length(coalesce(v_key, '')) < 10 then
    return jsonb_build_object(
      'erro', 'telefone_invalido',
      'limite', case when v_ilimitado then null else p_limite end,
      'ilimitado', v_ilimitado,
      'usadas', 0,
      'restantes', case when v_ilimitado then null else p_limite end,
      'limited', false, 'ip_usadas', 0
    );
  end if;

  select count(*) into v_usadas
    from public.geracoes_provou_levou g
   where g.catalog_store_id = v_store
     and g.created_at >= v_inicio
     and public.pl_catalog_tel_key(g.telefone_cliente::bigint::text) = v_key;

  begin
    v_ip := nullif(split_part(coalesce(
      (nullif(current_setting('request.headers', true), '')::json ->> 'x-forwarded-for'), ''), ',', 1), '');
  exception when others then
    v_ip := null;
  end;
  if v_ip is not null then
    select count(*) into v_ip_usadas
      from public.geracoes_provou_levou g
     where g.catalog_store_id = v_store
       and g.created_at >= v_inicio
       and g.ip_address = v_ip;
  end if;

  return jsonb_build_object(
    'limite',    case when v_ilimitado then null else p_limite end,
    'ilimitado', v_ilimitado,
    'usadas',    v_usadas,
    'restantes', case when v_ilimitado then null else greatest(0, p_limite - v_usadas) end,
    'limited',   (not v_ilimitado) and v_usadas >= p_limite,
    'ip_usadas', v_ip_usadas,
    'dia',       (v_inicio at time zone 'America/Sao_Paulo')::date
  );
end;
$function$;
