-- ═══════════════════════════════════════════════════════════════════════════
-- ROLLBACK — query do nó "Valida Limite Diario" COMO ERA antes de 09/08/2026
--
-- Guardada aqui pra dar pra voltar atrás sem depender de backup de ninguém.
-- Era idêntica nos dois geradores. Pra reverter: cola isto no campo Query do
-- nó, nos dois fluxos. O catálogo volta a não ter limite nenhum.
--
-- ATENÇÃO: isto NÃO roda no SQL editor do Supabase. Os {{ }} são expressões
-- do n8n, avaliadas só dentro do campo Query do nó Postgres. Colado num
-- cliente SQL comum, o Postgres lê $('Webhook') como código e dá
-- "syntax error at or near Webhook".
-- ═══════════════════════════════════════════════════════════════════════════

WITH req AS (
  SELECT regexp_replace(COALESCE('{{ $('Webhook').item.json.body.whatsapp }}',''),'\D','','g') AS raw,
         lower(COALESCE('{{ $('Webhook').item.json.headers.origin }}',''))                      AS org,
         COALESCE('{{ ($('Webhook').item.json.headers['x-forwarded-for'] || '').split(',')[0].trim() }}','')                                 AS ip,
         NULLIF(COALESCE('{{ $('Webhook').item.json.body.pix_payment_id || '' }}',''),'')                   AS pixid
),
p AS (SELECT CASE WHEN length(raw)>11 AND left(raw,2)='55' THEN substring(raw from 3) ELSE raw END AS tel,
             org, ip, pixid FROM req),
dia AS (SELECT date_trunc('day', now() AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'America/Sao_Paulo' AS d),
mapa(chave,lim) AS (VALUES ('acessoriostyle',3),('amazoni',3),('arantz',3),('arcsunglasses',3),('barcheyewear',3),('brechodooculos',3),('cacife',4),('califa',3),('ciciaeyewear',3),('dayonestore',3),('duoari',3),('fortuna',4),('fosseyewear',3),('koros',3),('lafoliebrand',3),('lahtref',3),('legrady-select',3),('liuzzieyewear',3),('luzzistore',3),('madui',2),('mahosunglasses',3),('maxilook',3),('meninaflor',3),('merlinmoore',3),('millushop',5),('mitani',4),('mozaik',3),('mpottica',3),('ncconceito',3),('oclinhos',3),('oculosemfoco',3),('oculoslindamenina',3),('oculosves',3),('ossglasses',3),('oticasmarina',3),('parislondon',3),('programmoda',3),('santi',3),('soucet',3),('suarmacao',5),('umut',3),('usecand',3)),
loja AS (SELECT m.chave, m.lim FROM mapa m, p WHERE p.org LIKE '%'||m.chave||'%'
         ORDER BY length(m.chave) DESC LIMIT 1),
tn AS (SELECT CASE WHEN p.tel ~ '^[0-9]{10,11}$' THEN p.tel::numeric END AS n FROM p),
comm AS (SELECT count(*)::int c FROM geracoes_provou_levou g, loja, dia, tn
         WHERE tn.n IS NOT NULL AND g.origin ILIKE '%'||loja.chave||'%'
           AND g.telefone_cliente = tn.n AND g.created_at >= dia.d),
pixn AS (SELECT CASE WHEN length(regexp_replace(px.telefone::text,'\D','','g'))>11
                       AND left(regexp_replace(px.telefone::text,'\D','','g'),2)='55'
                     THEN substring(regexp_replace(px.telefone::text,'\D','','g') from 3)
                     ELSE regexp_replace(px.telefone::text,'\D','','g') END AS tel,
                px.payment_id, px.status, px.approved_at FROM provou_levou_pix_extras px),
pix AS (SELECT count(*)::int c FROM pixn, p
        WHERE pixn.status='approved' AND pixn.tel = p.tel
          AND pixn.approved_at >= now() - interval '30 days'
          AND NOT EXISTS (SELECT 1 FROM geracoes_provou_levou gg
                          WHERE gg.pix_payment_id::text = pixn.payment_id::text)),
pago AS (SELECT count(*)::int c FROM pixn, p
         WHERE p.pixid IS NOT NULL AND pixn.payment_id::text = p.pixid AND pixn.status='approved')
SELECT
  (SELECT chave FROM loja)                       AS loja,
  (SELECT lim   FROM loja)                       AS limite_base,
  COALESCE((SELECT c FROM pix),0)                AS pix_hoje,
  COALESCE((SELECT c FROM comm),0)               AS provas_hoje,
  (SELECT tel FROM p)                            AS telefone,
  CASE
    WHEN NOT EXISTS (SELECT 1 FROM loja)                       THEN 'loja sem limite configurado'
    WHEN (SELECT ip FROM p) IN ('186.214.70.227','177.95.35.192','177.76.68.249','177.144.90.44','177.198.64.209')                       THEN 'bypass de teste (IP)'
    WHEN (SELECT tel FROM p) IN ('11930901274','11991336685','22999194355')                     THEN 'bypass de teste (telefone)'
    WHEN COALESCE((SELECT c FROM pago),0) > 0                  THEN 'prova paga via PIX'
    WHEN (SELECT n FROM tn) IS NULL                            THEN 'telefone invalido'
    WHEN COALESCE((SELECT c FROM comm),0) <
         ((SELECT lim FROM loja) + COALESCE((SELECT c FROM pix),0)) THEN 'dentro do limite'
    ELSE 'LIMITE ATINGIDO'
  END AS motivo,
  CASE
    WHEN NOT EXISTS (SELECT 1 FROM loja) THEN true
    WHEN (SELECT ip FROM p) IN ('186.214.70.227','177.95.35.192','177.76.68.249','177.144.90.44','177.198.64.209') THEN true
    WHEN (SELECT tel FROM p) IN ('11930901274','11991336685','22999194355') THEN true
    WHEN COALESCE((SELECT c FROM pago),0) > 0 THEN true
    WHEN (SELECT n FROM tn) IS NULL THEN true
    ELSE COALESCE((SELECT c FROM comm),0) < ((SELECT lim FROM loja) + COALESCE((SELECT c FROM pix),0))
  END AS pode
