-- ═══════════════════════════════════════════════════════════════════════════
-- Limite de provas por cliente no Provou Catálogo (pl_catalog_*)
--
-- O catálogo não tinha limite nenhum: o mesmo WhatsApp provava a vitrine
-- inteira e cada prova custa geração pro lojista. A contagem tem que morar no
-- servidor — o catálogo é uma página pública, e o que ele guarda no navegador
-- o cliente apaga.
--
-- Como o anon NÃO lê geracoes_provou_levou (RLS), quem responde é esta função
-- SECURITY DEFINER. Ela devolve só CONTAGEM (nunca telefone, nunca linha da
-- tabela), então pode ser chamada direto do browser com a chave anon.
--
-- Quem deve chamar:
--   1. catalogo/app.js  — para avisar o cliente ANTES de gastar a geração;
--   2. o gerador no n8n — para RECUSAR de fato. O item 1 é aviso; sem o 2,
--      quem chamar o webhook na mão continua passando.
--
--   select public.pl_catalog_check_limit('saintpierre', '5511988887777');
--   -> {"limite":3,"usadas":1,"restantes":2,"limited":false,"ip_usadas":1,...}
-- ═══════════════════════════════════════════════════════════════════════════

-- Chave de comparação do telefone: DDD + últimos 8 dígitos.
-- O nono dígito entra e sai do jeito que o cliente digita, então ele não pode
-- fazer parte da chave. O DDD, sim: o pl_norm_phone() existente devolve só os
-- 9 últimos e juntaria clientes de estados diferentes no mesmo contador.
create or replace function public.pl_catalog_tel_key(p text)
returns text
language sql
immutable
as $function$
  with a as (select regexp_replace(coalesce(p, ''), '\D', '', 'g') n),
       b as (select case when n like '55%' and length(n) > 11 then substr(n, 3) else n end n from a),
       c as (select case when n like '0%' then substr(n, 2) else n end n from b)
  select case when length(n) >= 10 then left(n, 2) || right(n, 8) else n end from c;
$function$;

-- A contagem filtra por loja + dia. Sem este índice ela varre as 210k linhas
-- da tabela inteira a cada tecla digitada no campo de WhatsApp.
create index if not exists ix_geracoes_catalog_store_created
  on public.geracoes_provou_levou (catalog_store_id, created_at)
  where catalog_store_id is not null;

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
  v_key       text;
  v_ip        text;
  v_inicio    timestamptz;
  v_usadas    int := 0;
  v_ip_usadas int := 0;
begin
  -- p_limite vem do cliente (é o browser que chama): não confia, só aceita
  -- um número de gente. Fora da faixa, vale a regra da casa.
  if p_limite is null or p_limite < 1 or p_limite > 50 then
    p_limite := 3;
  end if;

  -- Dia do lojista, não o dia UTC: às 21h de Brasília o UTC já virou e o
  -- cliente ganharia 3 provas novas antes da meia-noite dele.
  v_inicio := date_trunc('day', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo';

  select id into v_store from pl_catalog_stores where slug = p_slug limit 1;
  if v_store is null then
    -- Loja desconhecida não é motivo pra travar o cliente: devolve saldo cheio
    -- e deixa o gerador decidir (ele já recusa chave inválida).
    return jsonb_build_object(
      'erro', 'loja_nao_encontrada', 'limite', p_limite,
      'usadas', 0, 'restantes', p_limite, 'limited', false, 'ip_usadas', 0
    );
  end if;

  v_key := public.pl_catalog_tel_key(p_phone);
  if length(coalesce(v_key, '')) < 10 then
    -- Telefone incompleto não identifica cliente — contar por ele daria saldo
    -- novo a cada dígito apagado.
    return jsonb_build_object(
      'erro', 'telefone_invalido', 'limite', p_limite,
      'usadas', 0, 'restantes', p_limite, 'limited', false, 'ip_usadas', 0
    );
  end if;

  select count(*) into v_usadas
    from public.geracoes_provou_levou g
   where g.catalog_store_id = v_store
     and g.created_at >= v_inicio
     and public.pl_catalog_tel_key(g.telefone_cliente::bigint::text) = v_key;

  -- IP de quem chamou (o PostgREST repassa os headers). Não bloqueia nada:
  -- vai junto pra dar pro n8n a chance de ver o mesmo aparelho trocando de
  -- número. Wi-Fi de shopping é um IP só, então travar por IP travaria gente
  -- que nunca provou.
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
    'limite',    p_limite,
    'usadas',    v_usadas,
    'restantes', greatest(0, p_limite - v_usadas),
    'limited',   v_usadas >= p_limite,
    'ip_usadas', v_ip_usadas,
    'dia',       (v_inicio at time zone 'America/Sao_Paulo')::date
  );
end;
$function$;

-- Só o EXECUTE, e só destas duas funções: a tabela continua fechada pro anon.
revoke all on function public.pl_catalog_check_limit(text, text, int) from public;
grant execute on function public.pl_catalog_check_limit(text, text, int) to anon, authenticated, service_role;
grant execute on function public.pl_catalog_tel_key(text) to anon, authenticated, service_role;
