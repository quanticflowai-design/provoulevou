-- ═══════════════════════════════════════════════════════════════════════════
-- Nó "Valida Limite Diario" — versão que enxerga o Provou Catálogo
--
-- ONDE COLAR: n8n → os DOIS geradores → nó Postgres "Valida Limite Diario" →
-- campo Query. Substitui a query inteira.
--   • [EP] Quantic Materialize - Gerador Óculos   (id 5gFK9kGn0SHGz594)
--   • [EP] [Quantic Materialize]                  (id fLrWzI8O5BJHS3Xe)
--
-- POR QUE: a query já limitava provas por telefone/dia, mas descobria a loja
-- casando o header Origin contra o mapa de chaves lá embaixo. Toda prova de
-- catálogo chega com Origin https://provoulevou.com.br, que não bate com
-- chave nenhuma — então caía em "loja sem limite configurado" e passava
-- livre. Foram 23 provas de 16 clientes em 7 dias sem nenhum teto.
--
-- O QUE MUDOU (5 pontos, todos aditivos):
--   1. catalog_slug entra no CTE `req`, higienizado NA EXPRESSÃO do n8n — o
--      valor é concatenado dentro de aspas, então aspa vinda do cliente seria
--      injeção de SQL. Só [a-z0-9-] sobrevive;
--   2. CTEs `cat` e `catchk`: quem decide é a pl_catalog_check_limit, a MESMA
--      função que o catalogo/app.js chama. Duas cópias da regra divergiriam
--      no primeiro ajuste;
--   3. `loja`, `limite_base` e `provas_hoje` passam a falar de catálogo — é
--      o que o nó "Respond Limite" devolve pro cliente;
--   4. o ramo do catálogo entra DEPOIS dos bypasses de teste (os telefones de
--      vocês continuam livres no catálogo) e ANTES de "loja sem limite
--      configurado", que era o buraco;
--   5. os bypasses subiram no CASE. Pra quem não é catálogo isso não muda
--      nada: os dois ramos devolviam pode=true de qualquer jeito.
--
-- TESTADO contra o banco de produção, velha vs nova, mesmo cenário:
--   widget koros / linda menina (cliente já barrado) / loja fora do mapa /
--   bypass por telefone  → resultado IDÊNTICO ao de hoje;
--   catálogo com 2 provas → passa, usadas=2, limite=3;
--   catálogo no limite    → pode=false, motivo "LIMITE ATINGIDO (catalogo)";
--   catálogo + telefone de teste → bypass vence, como deve;
--   catalog_slug com "'; drop table..." → neutralizado.
-- ═══════════════════════════════════════════════════════════════════════════

WITH req AS (
  SELECT regexp_replace(COALESCE('{{ $('Webhook').item.json.body.whatsapp }}',''),'\D','','g') AS raw,
         lower(COALESCE('{{ $('Webhook').item.json.headers.origin }}',''))                      AS org,
         COALESCE('{{ ($('Webhook').item.json.headers['x-forwarded-for'] || '').split(',')[0].trim() }}','')                                 AS ip,
         NULLIF(COALESCE('{{ $('Webhook').item.json.body.pix_payment_id || '' }}',''),'')                   AS pixid
       , lower(COALESCE('{{ String($('Webhook').item.json.body.catalog_slug || '').replace(/[^a-z0-9-]/gi,'') }}',''))            AS catslug
),
p AS (SELECT CASE WHEN length(raw)>11 AND left(raw,2)='55' THEN substring(raw from 3) ELSE raw END AS tel,
             org, ip, pixid, catslug FROM req),
dia AS (SELECT date_trunc('day', now() AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'America/Sao_Paulo' AS d),
cat AS (SELECT NULLIF(catslug,'') AS s FROM p),
catchk AS (SELECT public.pl_catalog_check_limit((SELECT s FROM cat), (SELECT tel FROM p), 3) AS j
           WHERE (SELECT s FROM cat) IS NOT NULL),
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
  COALESCE((SELECT 'catalogo:'||s FROM cat), (SELECT chave FROM loja))  AS loja,
  COALESCE((SELECT (j->>'limite')::int FROM catchk), (SELECT lim FROM loja))  AS limite_base,
  COALESCE((SELECT c FROM pix),0)                AS pix_hoje,
  COALESCE((SELECT (j->>'usadas')::int FROM catchk), (SELECT c FROM comm), 0)  AS provas_hoje,
  (SELECT tel FROM p)                            AS telefone,
  CASE
    WHEN (SELECT ip FROM p) IN ('186.214.70.227','177.95.35.192','177.76.68.249','177.144.90.44','177.198.64.209')                       THEN 'bypass de teste (IP)'
    WHEN (SELECT tel FROM p) IN ('11930901274','11991336685','22999194355')                     THEN 'bypass de teste (telefone)'
    WHEN COALESCE((SELECT c FROM pago),0) > 0                  THEN 'prova paga via PIX'
    WHEN (SELECT s FROM cat) IS NOT NULL THEN
         CASE WHEN COALESCE((SELECT (j->>'limited')::boolean FROM catchk), false)
              THEN 'LIMITE ATINGIDO (catalogo)' ELSE 'dentro do limite (catalogo)' END
    WHEN NOT EXISTS (SELECT 1 FROM loja)                       THEN 'loja sem limite configurado'
    WHEN (SELECT n FROM tn) IS NULL                            THEN 'telefone invalido'
    WHEN COALESCE((SELECT c FROM comm),0) <
         ((SELECT lim FROM loja) + COALESCE((SELECT c FROM pix),0)) THEN 'dentro do limite'
    ELSE 'LIMITE ATINGIDO'
  END AS motivo,
  CASE
    WHEN (SELECT ip FROM p) IN ('186.214.70.227','177.95.35.192','177.76.68.249','177.144.90.44','177.198.64.209') THEN true
    WHEN (SELECT tel FROM p) IN ('11930901274','11991336685','22999194355') THEN true
    WHEN COALESCE((SELECT c FROM pago),0) > 0 THEN true
    WHEN (SELECT s FROM cat) IS NOT NULL THEN NOT COALESCE((SELECT (j->>'limited')::boolean FROM catchk), false)
    WHEN NOT EXISTS (SELECT 1 FROM loja) THEN true
    WHEN (SELECT n FROM tn) IS NULL THEN true
    ELSE COALESCE((SELECT c FROM comm),0) < ((SELECT lim FROM loja) + COALESCE((SELECT c FROM pix),0))
  END AS pode
