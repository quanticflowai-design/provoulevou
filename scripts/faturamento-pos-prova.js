#!/usr/bin/env node
// Faturamento pós-prova de TODOS os clientes (lojistas), replicando a regra da
// dashboard (login/index.html):
//   - provas: tabela do lojista (ex. geracoes_provou_levou) filtrada por origin ilike %origem%
//   - pedidos: tabela_pedidos com status pago (valores_status_pago), não cancelado,
//     desde a 1ª prova, deduplicados por chave composta (telefone|timestamp|total)
//   - pós-prova: telefone do pedido (normalizado, últimos 9 dígitos) provou ANTES do pedido
//
// A RLS bloqueia a chave anon — rode com UMA das credenciais:
//   SUPABASE_SERVICE_KEY=<service_role>  node scripts/faturamento-pos-prova.js
//   PL_EMAIL=<email master> PL_PASSWORD=<senha>  node scripts/faturamento-pos-prova.js
//
// Filtros opcionais de período (data do pedido):
//   DATE_FROM=2026-08-01 DATE_TO=2026-08-31  node scripts/faturamento-pos-prova.js

const fs = require('fs');
const path = require('path');

const envJs = fs.readFileSync(path.join(__dirname, '..', 'env.js'), 'utf8');
const SUPABASE_URL = envJs.match(/SUPABASE_URL:\s*'([^']+)'/)[1];
const ANON_KEY = envJs.match(/SUPABASE_KEY:\s*'([^']+)'/)[1];

const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const PL_EMAIL = process.env.PL_EMAIL || '';
const PL_PASSWORD = process.env.PL_PASSWORD || '';
const DATE_FROM = process.env.DATE_FROM || '';
const DATE_TO = process.env.DATE_TO || '';

let HEADERS = null;

async function authHeaders() {
    if (SERVICE_KEY) {
        return { apikey: SERVICE_KEY, Authorization: 'Bearer ' + SERVICE_KEY };
    }
    if (PL_EMAIL && PL_PASSWORD) {
        const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: PL_EMAIL, password: PL_PASSWORD })
        });
        const body = await r.json();
        if (!r.ok || !body.access_token) {
            throw new Error('Login falhou (' + r.status + '): ' + JSON.stringify(body).slice(0, 200));
        }
        return { apikey: ANON_KEY, Authorization: 'Bearer ' + body.access_token };
    }
    throw new Error('Defina SUPABASE_SERVICE_KEY ou PL_EMAIL+PL_PASSWORD (a chave anon é bloqueada pela RLS).');
}

async function get(pathAndQuery, extraHeaders) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${pathAndQuery}`, {
        headers: Object.assign({}, HEADERS, extraHeaders || {})
    });
    const text = await r.text();
    if (!r.ok && r.status !== 206) throw new Error(`GET ${pathAndQuery.split('?')[0]} → ${r.status}: ${text.slice(0, 200)}`);
    return JSON.parse(text);
}

// Paginação completa (PostgREST limita 1000 linhas por resposta)
async function getAll(pathAndQuery) {
    const pageSize = 1000;
    const out = [];
    for (let from = 0; ; from += pageSize) {
        const rows = await get(pathAndQuery, { Range: `${from}-${from + pageSize - 1}` });
        out.push(...rows);
        if (rows.length < pageSize) break;
    }
    return out;
}

// ===== Mesmas regras da dashboard =====
const normalizeFull = p => {
    let n = String(p || '').replace(/\D/g, '');
    if (n.startsWith('55') && n.length > 11) n = n.slice(2);
    if (n.startsWith('0')) n = n.slice(1);
    return n;
};
const normalize = p => {
    const n = normalizeFull(p);
    return n.length >= 9 ? n.slice(-9) : n;
};

const CANCELADOS = ['cancelled', 'canceled', 'cancelado'];
const pedidoValido = o => CANCELADOS.indexOf(String((o && o.status) || '').toLowerCase()) === -1;

async function tabelaTemColuna(tabela, coluna) {
    try {
        await get(`${tabela}?select=${coluna}&limit=1`);
        return true;
    } catch (e) { return false; }
}

function isOrderAfterProva(orderTs, phone, provaMinDateMap, provaMinTsMap) {
    const provaDate = provaMinDateMap[phone];
    if (!provaDate) return false;
    const orderDate = (orderTs || '').slice(0, 10);
    const hasRealTime = orderTs && orderTs.includes('T') && !orderTs.includes('T00:00:00');
    if (hasRealTime) {
        const provaTs = provaMinTsMap[phone] || '';
        const oMs = new Date(orderTs).getTime();
        const pMs = new Date(provaTs).getTime();
        if (!isNaN(oMs) && !isNaN(pMs)) return oMs >= pMs;
        return orderTs >= provaTs;
    }
    return orderDate >= provaDate;
}

const brl = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

async function processaLojista(lj) {
    const fPhone = lj.campo_telefone_pedido || 'customer_phone';
    const fTotal = lj.campo_total_pedido || 'total';
    const fStatus = lj.campo_status_pedido || 'payment_status';
    const fStatusValues = lj.valores_status_pago || ['paid', 'Confirmado'];
    const fData = lj.campo_data_pedido || null;
    const dateField = fData || 'created_at';

    // 1) Provas do lojista
    const gens = await getAll(
        `${lj.tabela}?select=telefone_cliente,created_at` +
        `&origin=ilike.${encodeURIComponent('*' + lj.origem + '*')}` +
        `&order=created_at.asc`
    );
    const generationPhones = new Set(gens.map(r => normalize(r.telefone_cliente)).filter(Boolean));
    const provaMinDateMap = {}, provaMinTsMap = {};
    for (const r of gens) {
        const ph = normalize(r.telefone_cliente);
        if (!ph) continue;
        const ts = r.created_at || '';
        const d = ts.slice(0, 10);
        if (!provaMinDateMap[ph] || d < provaMinDateMap[ph]) provaMinDateMap[ph] = d;
        if (!provaMinTsMap[ph] || ts < provaMinTsMap[ph]) provaMinTsMap[ph] = ts;
    }
    const earliestProva = Object.values(provaMinDateMap).sort()[0] || '';

    const base = {
        loja: lj.nome_loja || lj.origem || lj.email,
        email: lj.email,
        provas: gens.length,
        provadores: generationPhones.size,
        primeiraProva: earliestProva || '—',
    };
    if (!generationPhones.size) return Object.assign(base, { pedidos: 0, fat: 0, unicos: 0, fatTotal: 0 });

    // 2) Pedidos pagos desde a 1ª prova (com coluna status só se existir)
    const temStatus = await tabelaTemColuna(lj.tabela_pedidos, 'status');
    const campos = [fPhone, fTotal, 'created_at', fData].filter(Boolean);
    if (temStatus && campos.indexOf('status') === -1) campos.push('status');
    const inList = fStatusValues.map(v => `"${v}"`).join(',');
    let q = `${lj.tabela_pedidos}?select=${encodeURIComponent([...new Set(campos)].join(','))}` +
        `&${fStatus}=in.(${encodeURIComponent(inList)})` +
        `&order=created_at.asc`;
    if (earliestProva) q += `&${dateField}=gte.${encodeURIComponent(earliestProva + 'T00:00:00-03:00')}`;
    if (lj.canal_provador) q += `&channel=eq.${encodeURIComponent(lj.canal_provador)}`;

    const raw = (await getAll(q)).filter(pedidoValido);

    // Dedup composta (telefone bruto | timestamp s/ tz | total) — igual à dashboard
    const seen = new Set();
    const orders = [];
    for (const o of raw) {
        const phRaw = String(o[fPhone] || '').replace(/\D/g, '');
        const ts = String(o[dateField] || o.created_at || '').slice(0, 19);
        const tot = (parseFloat(o[fTotal]) || 0).toFixed(2);
        if (phRaw && ts) {
            const k = `${phRaw}|${ts}|${tot}`;
            if (seen.has(k)) continue;
            seen.add(k);
        }
        orders.push(o);
    }

    // 3) Atribuição pós-prova + faturamento total da loja no mesmo recorte
    let pedidos = 0, fat = 0, fatTotal = 0;
    const unicos = new Set();
    for (const o of orders) {
        const orderTs = (fData && o[fData]) || o.created_at || '';
        const d = orderTs.slice(0, 10);
        if (DATE_FROM && d < DATE_FROM) continue;
        if (DATE_TO && d > DATE_TO) continue;
        const v = parseFloat(o[fTotal]) || 0;
        if (v > 0) fatTotal += v;
        const ph = normalize(o[fPhone]);
        if (!ph || !generationPhones.has(ph)) continue;
        if (!isOrderAfterProva(orderTs, ph, provaMinDateMap, provaMinTsMap)) continue;
        pedidos += 1;
        fat += v;
        unicos.add(ph);
    }
    return Object.assign(base, { pedidos, fat, unicos: unicos.size, fatTotal });
}

(async () => {
    HEADERS = await authHeaders();

    const lojistas = (await get(
        'lojistas?select=email,nome_loja,origem,tabela,tabela_pedidos,campo_telefone_pedido,' +
        'campo_total_pedido,campo_status_pedido,valores_status_pago,campo_data_pedido,canal_provador' +
        '&order=email.asc'
    )).filter(l => l.email && !l.email.endsWith('@fake.com') && l.tabela_pedidos && l.tabela);

    if (!lojistas.length) {
        console.error('Nenhum lojista visível — a credencial usada provavelmente não passa na RLS.');
        process.exit(1);
    }

    const periodo = (DATE_FROM || DATE_TO)
        ? `período ${DATE_FROM || 'início'} → ${DATE_TO || 'hoje'}`
        : 'todo o período (desde a 1ª prova de cada loja)';
    console.log(`Faturamento pós-prova — ${lojistas.length} clientes — ${periodo}\n`);

    const rows = [];
    for (const lj of lojistas) {
        try {
            const r = await processaLojista(lj);
            rows.push(r);
            console.log(`✓ ${r.loja}: ${brl(r.fat)} (${r.pedidos} pedidos, ${r.unicos} compradores)`);
        } catch (e) {
            console.error(`✗ ${lj.nome_loja || lj.email}: ${e.message}`);
        }
    }

    rows.sort((a, b) => b.fat - a.fat);
    console.log('\n| Loja | 1ª prova | Provadores | Compradores | Pedidos pós-prova | Faturamento pós-prova | Fat. total da loja* | % via provador |');
    console.log('|---|---|---|---|---|---|---|---|');
    let tFat = 0, tPed = 0, tUni = 0, tTot = 0;
    for (const r of rows) {
        const pct = r.fatTotal > 0 ? (r.fat / r.fatTotal * 100).toFixed(1) + '%' : '—';
        console.log(`| ${r.loja} | ${r.primeiraProva} | ${r.provadores} | ${r.unicos} | ${r.pedidos} | ${brl(r.fat)} | ${brl(r.fatTotal)} | ${pct} |`);
        tFat += r.fat; tPed += r.pedidos; tUni += r.unicos; tTot += r.fatTotal;
    }
    console.log(`| **TOTAL** |  |  | ${tUni} | ${tPed} | **${brl(tFat)}** | ${brl(tTot)} | ${tTot > 0 ? (tFat / tTot * 100).toFixed(1) + '%' : '—'} |`);
    console.log('\n* Fat. total da loja = pedidos pagos desde a 1ª prova (mesmo recorte da dashboard).');
})().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
