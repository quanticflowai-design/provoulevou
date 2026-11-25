/* ══════════ Provou Catálogo — login único do lojista ══════════
   Uma porta só pra todos os lojistas de catálogo, no mesmo espírito do
   dashboard das lojas. O catálogo público não tem mais tela de login: quem
   gerencia entra por aqui, e a loja sai do owner_email da conta — nunca da URL. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);

  const SB_URL = 'https://quantic-supabase.k5jwra.easypanel.host';
  const SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.pCFnSnrlSUM2EwXi9gxAegpoC-9U0Mjx3iAtROR-E20';
  // Mesma chave do catálogo: mesma origem, então a sessão criada aqui já vale lá.
  const SESSAO = 'pc_sess_v1';

  function toast(msg) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2600);
  }

  function sbGet(path) {
    return fetch(SB_URL + '/rest/v1/' + path, {
      headers: { apikey: SB_ANON, Authorization: 'Bearer ' + SB_ANON }
    }).then(r => r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status)));
  }

  async function entrar(email, senha) {
    const r = await fetch(SB_URL + '/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: { apikey: SB_ANON, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: senha })
    });
    const j = await r.json().catch(() => null);
    if (!r.ok || !j || !j.access_token) {
      const e = new Error((j && (j.error_description || j.msg)) || 'E-mail ou senha inválidos.');
      e.credenciais = true;
      throw e;
    }
    return {
      email: (j.user && j.user.email) || email,
      token: j.access_token,
      refresh: j.refresh_token || '',   // 25/11/2026: o catálogo renova o token com isto (vence em 1 h)
      admin: !!(j.user && j.user.app_metadata && j.user.app_metadata.pl_catalog_admin),
      em: Date.now()
    };
  }

  async function validarSessao(s) {
    if (!s || !s.token) throw new Error('Sessão inválida');
    // token vencido + refresh guardado: renova antes de checar (senão o lojista cai no login a cada hora)
    try {
      const exp = JSON.parse(atob(String(s.token).split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).exp * 1000;
      if (s.refresh && exp - Date.now() < 120000) {
        const rr = await fetch(SB_URL + '/auth/v1/token?grant_type=refresh_token', { method: 'POST', headers: { apikey: SB_ANON, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: s.refresh }) });
        const jj = await rr.json().catch(() => null);
        if (rr.ok && jj && jj.access_token) { s.token = jj.access_token; if (jj.refresh_token) s.refresh = jj.refresh_token; }
      }
    } catch (e) {}
    const r = await fetch(SB_URL + '/auth/v1/user', {
      headers: { apikey: SB_ANON, Authorization: 'Bearer ' + s.token }
    });
    const user = await r.json().catch(() => null);
    if (!r.ok || !user || !user.email) throw new Error('Sessão expirada');
    return {
      email: user.email,
      token: s.token,
      refresh: s.refresh || '',
      admin: !!(user.app_metadata && user.app_metadata.pl_catalog_admin),
      em: s.em || Date.now()
    };
  }

  // 23/11/2026: a lista vem do banco pela conta logada (rpc pl_catalog_minhas) —
  // o e-mail do dono não é mais lido pela API pública.
  async function minhasLojas(s) {
    const r = await fetch(SB_URL + '/rest/v1/rpc/pl_catalog_minhas', {
      method: 'POST', headers: { apikey: SB_ANON, Authorization: 'Bearer ' + s.token, 'Content-Type': 'application/json' }, body: '{}'
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }

  function irPara(slug) { location.href = '../?loja=' + encodeURIComponent(slug) + '#admin'; }

  // ══ 23/11/2026: painel de controle (Lucas) ══
  // Conta com mais de um catálogo (ou o time) cai aqui: o login some e aparece
  // um painel com resumo, busca, filtros e a lista paginada — antes era uma
  // lista infinita embaixo do formulário, que continuava na tela.
  const POR_PAGINA = 25;
  const FILTROS = [
    ['todos', 'Todos'], ['pagando', 'Pagando'], ['teste', 'Em teste'],
    ['pausado', 'Pausados'], ['semproduto', 'Sem produto'], ['semprova', 'Sem prova em 30 dias']
  ];
  const cp = { lojas: [], filtro: 'todos', busca: '', ordem: 'nome', pagina: 1 };
  try { const f = localStorage.getItem('pc_cp_filtro'); if (f) cp.filtro = f; const o = localStorage.getItem('pc_cp_ordem'); if (o) cp.ordem = o; } catch (e) {}

  const semAcento = t => String(t || '').toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[̀-ͯ]/g, '');
  const fmt = n => Number(n || 0).toLocaleString('pt-BR');

  function situacao(l) {
    if (l.pausado) return ['pausado', 'Pausado'];
    if (l.status === 'Ativo') return ['pagando', 'Pagando'];
    if (l.status === 'Teste Gratuito') return ['teste', 'Em teste'];
    return ['inativo', l.status || 'Sem cadastro'];
  }
  // "2026-11-13 00:33:45+00" (Postgres) e ISO viram Date em qualquer navegador
  function paraData(v) { return new Date(String(v).replace(' ', 'T').replace(/([+-]\d{2})$/, '$1:00')); }
  function quando(ts) {
    if (!ts) return '—';
    const d = paraData(ts);
    if (isNaN(d)) return '—';
    const min = Math.round((Date.now() - d) / 60000);
    if (min < 60) return 'há ' + Math.max(1, min) + ' min';
    const h = Math.round(min / 60);
    if (h < 24) return 'há ' + h + ' h';
    const dias = Math.round(h / 24);
    return dias === 1 ? 'ontem' : 'há ' + dias + ' dias';
  }
  function passa(l, f) {
    if (f === 'todos') return true;
    if (f === 'semproduto') return !l.produtos;
    if (f === 'semprova') return !l.provas_30d;
    return situacao(l)[0] === f;
  }

  function el(tag, cls, txt) { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  function desenhaResumo() {
    const L = cp.lojas, box = $('#cp-resumo');
    const itens = [
      [L.length, 'catálogos ativos'],
      [L.filter(l => situacao(l)[0] === 'pagando').length, 'pagando'],
      [L.filter(l => situacao(l)[0] === 'teste').length, 'em teste'],
      [L.filter(l => l.pausado).length, 'pausados'],
      [L.reduce((s, l) => s + (l.provas_hoje || 0), 0), 'provas hoje'],
      [L.reduce((s, l) => s + (l.provas_30d || 0), 0), 'provas em 30 dias']
    ];
    box.textContent = '';
    itens.forEach(([n, t]) => { const d = el('div', 'cp-res'); d.appendChild(el('b', '', fmt(n))); d.appendChild(el('span', '', t)); box.appendChild(d); });
  }

  // ── receita (só o time) ──
  const CORES = { pagando: '#17a86b', teste: '#6d3bef', pausado: '#e08a2c', inativo: '#b9b4c4' };
  const brl = v => 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const MES = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  function desenhaDash(rec) {
    const box = $('#cp-dash'), row2 = $('#cp-row2');
    if (!rec) { box.hidden = true; row2.hidden = true; $('#cp-pagantes').hidden = true; return; }
    box.hidden = false; row2.hidden = false;
    $('.cp-h1').textContent = 'Painel de controle';
    $('#cp-sub').textContent = 'MRR do provador e dos catálogos, lojas pagantes e a lista de catálogos.';
    $('#cp-sec-cat').hidden = false;
    const v = $('#cp-mrr-v'); v.textContent = brl(rec.mrr); v.appendChild(el('em', '', '/mês'));
    $('#cp-mrr-s').textContent = fmt(rec.pagantes) + ' lojas pagantes · ticket médio ' + brl((rec.mrr || 0) / Math.max(1, rec.pagantes));
    $('#cp-k-prov').textContent = brl(rec.mrr_prov);
    $('#cp-k-prov-s').textContent = fmt(rec.pag_prov) + ' lojas · ' + Math.round((rec.mrr_prov || 0) / Math.max(1, rec.mrr) * 100) + '% do MRR';
    $('#cp-k-cat').textContent = brl(rec.mrr_cat);
    $('#cp-k-cat-s').textContent = fmt(rec.pag_cat) + ' catálogos · ' + Math.round((rec.mrr_cat || 0) / Math.max(1, rec.mrr) * 100) + '% do MRR';
    $('#cp-k-atr').textContent = brl(rec.atrasado);
    $('#cp-k-atr-s').textContent = fmt(rec.n_atrasadas) + (rec.n_atrasadas === 1 ? ' loja com vencimento passado' : ' lojas com vencimento passado');

    const ms = $('#cp-meses'), mx = $('#cp-meses-x'); ms.textContent = ''; mx.textContent = '';
    const meses = rec.meses || [];
    const tot = m => (Number(m.prov) || 0) + (Number(m.cat) || 0);
    const max = Math.max(1, ...meses.map(tot));
    const hoje = new Date(), atual = hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0');
    const ALT = 170;
    meses.forEach(m => {
      const d = el('div', 'cp-mes' + (m.m === atual ? ' atual' : ''));
      d.title = 'Provador ' + brl(m.prov) + ' · Catálogos ' + brl(m.cat) + (m.extra ? ' · excedentes ' + brl(m.extra) + ' (fora do MRR)' : '') + (m.m === atual ? ' — mês em andamento' : '');
      d.appendChild(el('span', 'cp-mes-v', brl(tot(m))));
      const b = el('div', 'cp-mes-bar'); b.style.height = Math.max(3, Math.round(tot(m) / max * ALT)) + 'px';
      const ip = el('i'); ip.style.background = 'var(--brand)'; ip.style.height = (tot(m) ? (Number(m.prov) || 0) / tot(m) * 100 : 0) + '%';
      const ic = el('i'); ic.style.background = '#17a86b'; ic.style.height = (tot(m) ? (Number(m.cat) || 0) / tot(m) * 100 : 0) + '%';
      b.appendChild(ip); b.appendChild(ic); d.appendChild(b); ms.appendChild(d);
      mx.appendChild(el('span', '', (MES[Number(m.m.slice(5)) - 1] || m.m) + (m.m === atual ? ' *' : '')));
    });
    const cur = meses.find(m => m.m === atual);
    $('#cp-meses-nota').textContent = (cur ? '* ' + (MES[hoje.getMonth()]) + ' ainda em andamento. ' : '') + 'Excedentes não entram (passe o mouse na barra para ver).';

    const pl = $('#cp-planos'); pl.textContent = '';
    const planos = (rec.planos || []).slice(0, 7), maxp = Math.max(1, ...planos.map(p => p.n));
    planos.forEach(p => {
      const d = el('div'); const t = el('div', 'cp-pl-top');
      t.appendChild(el('b', '', p.plano)); t.appendChild(el('span', '', fmt(p.n) + (p.n === 1 ? ' loja · ' : ' lojas · ') + brl(p.receita)));
      const bar = el('div', 'cp-pl-bar'), i = el('i'); i.style.width = Math.round(p.n / maxp * 100) + '%'; bar.appendChild(i);
      d.appendChild(t); d.appendChild(bar); pl.appendChild(d);
    });
    pg.lojas = rec.lojas || [];
    $('#cp-pagantes').hidden = false;
    desenhaPagantes();
  }

  // ── lojas pagantes ──
  const pg = { lojas: [], filtro: 'todas', busca: '', pagina: 1 };
  const PG_FILTROS = [['todas', 'Todas'], ['provador', 'Provador'], ['catalogo', 'Catálogos'], ['vence', 'Vencem em 5 dias'], ['atrasada', 'Atrasadas'], ['sem_pagamento', 'Sem pagamento lançado']];
  const pgPassa = (l, f) => f === 'todas' ? true : (f === 'provador' || f === 'catalogo') ? l.tipo === f : l.sit === f;
  const dataBr = d => d ? String(d).slice(8, 10) + '/' + String(d).slice(5, 7) : '—';
  function desenhaPagantes() {
    const chips = $('#cp-pag-chips'); chips.textContent = '';
    PG_FILTROS.forEach(([k, t]) => {
      const n = pg.lojas.filter(l => pgPassa(l, k)).length;
      if (!n && k !== 'todas') return;
      const b = el('button', 'cp-chip', t); b.type = 'button'; b.setAttribute('aria-pressed', String(pg.filtro === k));
      b.appendChild(el('i', '', fmt(n)));
      b.onclick = () => { pg.filtro = k; pg.pagina = 1; desenhaPagantes(); };
      chips.appendChild(b);
    });
    const termo = semAcento(pg.busca.trim());
    const L = pg.lojas.filter(l => pgPassa(l, pg.filtro) && (!termo || semAcento(l.nome + ' ' + l.dominio).includes(termo)));
    const soma = L.reduce((s, l) => s + (Number(l.valor) || 0), 0);
    $('#cp-pag-sub').textContent = fmt(L.length) + (L.length === 1 ? ' loja · ' : ' lojas · ') + brl(soma) + '/mês';
    const box = $('#cp-pag-lista'), pag = $('#cp-pag-pag'); box.textContent = '';
    if (!L.length) { box.appendChild(el('div', 'cp-vazio', 'Nenhuma loja neste filtro.')); pag.hidden = true; return; }
    const POR = 15, paginas = Math.ceil(L.length / POR);
    pg.pagina = Math.min(Math.max(1, pg.pagina), paginas);
    const ini = (pg.pagina - 1) * POR, fatia = L.slice(ini, ini + POR);
    const t = el('table', 'cp-tabela'), th = el('thead'), hr = el('tr');
    [['Loja', ''], ['Tipo', ''], ['Plano', ''], ['Mensalidade', 'cp-num'], ['Vencimento', ''], ['Situação', '']].forEach(([n, c]) => hr.appendChild(el('th', c, n)));
    th.appendChild(hr); t.appendChild(th);
    const tb = el('tbody');
    const SIT = { em_dia: ['pagando', 'Em dia'], vence: ['vence', 'Vence logo'], atrasada: ['atrasada', 'Atrasada'], sem_pagamento: ['inativo', 'Sem pagamento'] };
    fatia.forEach(l => {
      const tr = el('tr'); tr.style.cursor = 'default';
      const host = String(l.dominio || '').replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
      const td = el('td'); td.appendChild(el('div', 'cp-nome', l.nome)); td.appendChild(el('div', 'cp-slug', host)); tr.appendChild(td);
      tr.appendChild(el('td', '', '')).appendChild(el('span', 'cp-tipo' + (l.tipo === 'catalogo' ? ' cat' : ''), l.tipo === 'catalogo' ? 'Catálogo' : 'Provador'));
      tr.appendChild(el('td', '', l.plano || '—'));
      tr.appendChild(el('td', 'cp-num', l.valor != null ? 'R$ ' + Number(l.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'));
      const tv = el('td', 'cp-venc', dataBr(l.venc));
      const d = Number(l.dias);
      if (l.venc) tv.appendChild(el('small', '', d < 0 ? 'há ' + (-d) + (d === -1 ? ' dia' : ' dias') : d === 0 ? 'hoje' : 'em ' + d + (d === 1 ? ' dia' : ' dias')));
      tr.appendChild(tv);
      const [c, txt] = SIT[l.sit] || ['inativo', l.sit];
      tr.appendChild(el('td', '', '')).appendChild(el('span', 'cp-pill st-' + c, txt));
      tb.appendChild(tr);
    });
    t.appendChild(tb); box.appendChild(t);
    pag.hidden = paginas <= 1; pag.textContent = '';
    if (paginas > 1) {
      pag.appendChild(el('span', '', 'Mostrando ' + (ini + 1) + '–' + (ini + fatia.length) + ' de ' + fmt(L.length)));
      const bt = el('div', 'cp-pag-bt');
      for (let p = 1; p <= paginas; p++) { const b = el('button', '', String(p)); b.type = 'button'; if (p === pg.pagina) b.setAttribute('aria-current', 'page'); b.onclick = () => { pg.pagina = p; desenhaPagantes(); }; bt.appendChild(b); }
      pag.appendChild(bt);
    }
  }
  $('#cp-pag-busca').addEventListener('input', ev => { pg.busca = ev.target.value; pg.pagina = 1; desenhaPagantes(); });

  function desenhaSituacao() {
    const st = $('#cp-stack'), lg = $('#cp-leg'); if (!st) return;
    const grupos = [['pagando', 'Pagando'], ['teste', 'Em teste'], ['pausado', 'Pausados'], ['inativo', 'Sem cadastro']];
    const tot = cp.lojas.length || 1;
    lg.textContent = '';
    const NS = 'http://www.w3.org/2000/svg', R = 50, C = 2 * Math.PI * R;
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 128 128');
    let acum = 0; const partes = [];
    grupos.forEach(([k, t]) => {
      const n = cp.lojas.filter(l => situacao(l)[0] === k).length;
      partes.push(t + ': ' + n);
      if (n) {
        const fr = n / tot, c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', 64); c.setAttribute('cy', 64); c.setAttribute('r', R);
        c.setAttribute('stroke', CORES[k]);
        const gap = grupos.filter(([kk]) => cp.lojas.some(l => situacao(l)[0] === kk)).length > 1 ? 2 : 0;
        c.setAttribute('stroke-dasharray', Math.max(0, fr * C - gap) + ' ' + C);
        c.setAttribute('stroke-dashoffset', -acum * C);
        const tt = document.createElementNS(NS, 'title'); tt.textContent = t + ': ' + n + ' (' + Math.round(fr * 100) + '%)'; c.appendChild(tt);
        svg.appendChild(c); acum += fr;
      }
      if (!n && k === 'inativo') return;
      const b = el('button'); b.type = 'button';
      const i = el('i'); i.style.background = CORES[k];
      b.appendChild(i); const sp = el('span', '', t); sp.appendChild(el('small', '', Math.round(n / tot * 100) + '%')); b.appendChild(sp); b.appendChild(el('b', '', fmt(n)));
      if (k !== 'inativo') b.onclick = () => { cp.filtro = k; cp.pagina = 1; desenhaChips(); desenhaLista(); $('#cp-busca').scrollIntoView({ behavior: 'smooth', block: 'start' }); };
      lg.appendChild(b);
    });
    st.textContent = ''; st.appendChild(svg);
    const c = el('div', 'cp-pizza-c'); c.appendChild(el('b', '', fmt(cp.lojas.length))); c.appendChild(el('span', '', 'catálogos')); st.appendChild(c);
    st.setAttribute('aria-label', 'Catálogos por situação: ' + partes.join(', '));
  }

  async function carregaReceita(s) {
    try {
      const r = await fetch(SB_URL + '/rest/v1/rpc/pl_mrr_painel', {
        method: 'POST', headers: { apikey: SB_ANON, Authorization: 'Bearer ' + s.token, 'Content-Type': 'application/json' }, body: '{}'
      });
      if (!r.ok) return null;
      return await r.json();
    } catch (e) { return null; }
  }

  function desenhaChips() {
    const box = $('#cp-chips'); box.textContent = '';
    FILTROS.forEach(([k, t]) => {
      const b = el('button', 'cp-chip', t); b.type = 'button';
      b.setAttribute('aria-pressed', String(cp.filtro === k));
      b.appendChild(el('i', '', fmt(cp.lojas.filter(l => passa(l, k)).length)));
      b.onclick = () => { cp.filtro = k; cp.pagina = 1; try { localStorage.setItem('pc_cp_filtro', k); } catch (e) {} desenhaChips(); desenhaLista(); };
      box.appendChild(b);
    });
  }

  function linha(l) {
    const [cls, txt] = situacao(l);
    const tr = document.createElement('tr');
    tr.addEventListener('click', ev => { if (!ev.target.closest('a,button')) irPara(l.slug); });

    const tdL = el('td'); const wrap = el('div', 'cp-loja');
    const logo = el('div', 'cp-logo');
    if (l.logo) logo.style.backgroundImage = 'url("' + String(l.logo).replace(/"/g, '%22') + '")';
    else { logo.textContent = (l.nome || l.slug || '?').trim().charAt(0).toUpperCase(); logo.style.background = l.cor || 'var(--brand)'; }
    const tx = el('div'); tx.appendChild(el('div', 'cp-nome', l.nome || l.slug)); tx.appendChild(el('div', 'cp-slug', '/' + l.slug));
    wrap.appendChild(logo); wrap.appendChild(tx); tdL.appendChild(wrap); tr.appendChild(tdL);

    const tdS = el('td'); tdS.appendChild(el('span', 'cp-pill st-' + cls, txt)); tr.appendChild(tdS);
    const num = (v, extra) => { const td = el('td', 'cp-num c-num' + (v ? '' : ' cp-zero'), extra != null ? extra : fmt(v)); tr.appendChild(td); };
    num(l.produtos); num(l.provas_hoje); num(l.provas_30d);
    num(l.ultima_prova ? 1 : 0, quando(l.ultima_prova));

    // no celular as colunas de número viram uma linha de texto
    tr.appendChild(el('td', 'c-resumo', fmt(l.produtos) + ' produtos · ' + fmt(l.provas_30d) + ' provas em 30 dias · última ' + quando(l.ultima_prova)));

    const tdA = el('td', 'c-acoes'); const ac = el('div', 'cp-acoes');
    const ver = el('a', 'cp-btn sec', 'Ver catálogo'); ver.href = '../' + encodeURIComponent(l.slug); ver.target = '_blank'; ver.rel = 'noopener';
    const ger = el('button', 'cp-btn pri', 'Gerenciar'); ger.type = 'button'; ger.onclick = () => irPara(l.slug);
    ac.appendChild(ver); ac.appendChild(ger); tdA.appendChild(ac); tr.appendChild(tdA);
    return tr;
  }

  function desenhaLista() {
    const termo = semAcento(cp.busca.trim());
    let L = cp.lojas.filter(l => passa(l, cp.filtro) && (!termo || semAcento(l.nome + ' ' + l.slug).includes(termo)));
    const tsv = v => v ? (paraData(v).getTime() || 0) : 0;
    if (cp.ordem === 'provas') L.sort((a, b) => (b.provas_30d || 0) - (a.provas_30d || 0));
    else if (cp.ordem === 'recente') L.sort((a, b) => tsv(b.ultima_prova) - tsv(a.ultima_prova));
    else if (cp.ordem === 'novos') L.sort((a, b) => String(b.criado || '').localeCompare(String(a.criado || '')));
    else L.sort((a, b) => semAcento(a.nome).localeCompare(semAcento(b.nome)));

    const box = $('#cp-lista'), pag = $('#cp-pag');
    box.textContent = '';
    if (!L.length) { box.appendChild(el('div', 'cp-vazio', 'Nenhum catálogo encontrado com esse filtro.')); pag.hidden = true; return; }

    const paginas = Math.ceil(L.length / POR_PAGINA);
    cp.pagina = Math.min(Math.max(1, cp.pagina), paginas);
    const ini = (cp.pagina - 1) * POR_PAGINA, fatia = L.slice(ini, ini + POR_PAGINA);

    const t = el('table', 'cp-tabela'), th = el('thead'), hr = el('tr');
    [['Catálogo', ''], ['Situação', ''], ['Produtos', 'cp-num'], ['Provas hoje', 'cp-num'], ['30 dias', 'cp-num'], ['Última prova', 'cp-num'], ['', '']]
      .forEach(([n, c]) => hr.appendChild(el('th', c, n)));
    th.appendChild(hr); t.appendChild(th);
    const tb = el('tbody'); fatia.forEach(l => tb.appendChild(linha(l))); t.appendChild(tb);
    box.appendChild(t);

    pag.hidden = paginas <= 1 && L.length <= POR_PAGINA;
    pag.textContent = '';
    pag.appendChild(el('span', '', 'Mostrando ' + (ini + 1) + '–' + (ini + fatia.length) + ' de ' + fmt(L.length)));
    if (paginas > 1) {
      const bt = el('div', 'cp-pag-bt');
      const vai = p => { cp.pagina = p; desenhaLista(); $('#cp-busca').scrollIntoView({ block: 'nearest' }); window.scrollTo({ top: 0 }); };
      const ant = el('button', '', '‹'); ant.type = 'button'; ant.setAttribute('aria-label', 'Página anterior'); ant.disabled = cp.pagina === 1; ant.onclick = () => vai(cp.pagina - 1); bt.appendChild(ant);
      for (let p = 1; p <= paginas; p++) {
        if (paginas > 7 && p !== 1 && p !== paginas && Math.abs(p - cp.pagina) > 1) { if (Math.abs(p - cp.pagina) === 2) bt.appendChild(el('span', '', '…')); continue; }
        const b = el('button', '', String(p)); b.type = 'button'; if (p === cp.pagina) b.setAttribute('aria-current', 'page'); b.onclick = () => vai(p); bt.appendChild(b);
      }
      const prox = el('button', '', '›'); prox.type = 'button'; prox.setAttribute('aria-label', 'Próxima página'); prox.disabled = cp.pagina === paginas; prox.onclick = () => vai(cp.pagina + 1); bt.appendChild(prox);
      pag.appendChild(bt);
    }
  }

  async function carregaControle(s, basicas) {
    // dados completos (produtos, provas, situação) vêm da RPC; se falhar, mostra ao menos a lista básica
    try {
      const r = await fetch(SB_URL + '/rest/v1/rpc/pl_catalog_controle', {
        method: 'POST', headers: { apikey: SB_ANON, Authorization: 'Bearer ' + s.token, 'Content-Type': 'application/json' }, body: '{}'
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json();
      if (Array.isArray(j) && j.length) return j;
    } catch (e) {}
    return (basicas || []).map(l => ({ slug: l.slug, nome: l.display_name || l.slug }));
  }

  async function abrePainel(s, basicas) {
    document.documentElement.classList.remove('pc-checando');
    document.body.classList.add('cp-on');
    $('#screen-login').classList.remove('active');
    $('#screen-controle').hidden = false;
    $('#cp-user').textContent = s.email;
    $('#cp-ordem').value = cp.ordem;
    cp.lojas = basicas.map(l => ({ slug: l.slug, nome: l.display_name || l.slug }));
    desenhaResumo(); desenhaChips(); desenhaLista();
    const [lojas, rec] = await Promise.all([carregaControle(s, basicas), carregaReceita(s)]);
    cp.lojas = lojas;
    desenhaResumo(); desenhaChips(); desenhaLista(); desenhaSituacao(); desenhaDash(rec);
    const busca = $('#cp-busca');
    if (cp.lojas.length > 8 && matchMedia('(min-width: 761px)').matches) busca.focus();
  }

  $('#cp-busca').addEventListener('input', ev => { cp.busca = ev.target.value; cp.pagina = 1; desenhaLista(); });
  $('#cp-ordem').addEventListener('change', ev => { cp.ordem = ev.target.value; cp.pagina = 1; try { localStorage.setItem('pc_cp_ordem', cp.ordem); } catch (e) {} desenhaLista(); });
  document.addEventListener('keydown', ev => {
    if (ev.key === '/' && !$('#screen-controle').hidden && document.activeElement !== $('#cp-busca') && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { ev.preventDefault(); $('#cp-busca').focus(); }
  });
  $('#cp-sair').addEventListener('click', () => {
    try { localStorage.removeItem(SESSAO); } catch (e) {}
    location.reload();
  });

  const form = $('#login-form');
  form.addEventListener('submit', async ev => {
    ev.preventDefault();
    const err = $('#login-error'), btn = $('#btn-login');
    const set = m => { err.textContent = m; err.hidden = !m; };
    set('');
    btn.disabled = true; btn.textContent = 'Entrando…';
    try {
      const s = await entrar($('#login-email').value.trim(), $('#login-pass').value);
      const lojas = await minhasLojas(s);
      if (!lojas || !lojas.length) {
        // Autenticou, mas nenhuma loja aponta pra esse e-mail. É config nossa
        // faltando (owner_email), não senha errada — a mensagem tem que dizer isso.
        set('Esta conta não tem nenhum catálogo. Fale com a Provou Levou.');
        return;
      }
      try { localStorage.setItem(SESSAO, JSON.stringify(s)); } catch (e) {}
      $('#login-pass').value = '';
      if (lojas.length === 1) irPara(lojas[0].slug);
      else abrePainel(s, lojas);
    } catch (e) {
      set(e && e.credenciais ? e.message : 'Não consegui entrar agora. Tente de novo.');
    } finally {
      btn.disabled = false; btn.textContent = 'Entrar';
    }
  });

  // `ilike` e não `eq` acima: o e-mail pode ter sido cadastrado com maiúscula
  // (Oticaforeyesja@gmail.com) enquanto a sessão devolve tudo minúsculo — com
  // `eq` o lojista logava e ouvia "esta conta não tem nenhum catálogo".

  // Já logado? Não faz sentido pedir senha de novo — vai direto pro catálogo dele.
  (async () => {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(SESSAO) || 'null'); } catch (e) {}
    // sem sessão (ou se der errado) o formulário aparece; com sessão ele fica escondido até redirecionar
    const mostraLogin = () => document.documentElement.classList.remove('pc-checando');
    if (!s || !s.email) { mostraLogin(); return; }
    try {
      s = await validarSessao(s);
      try { localStorage.setItem(SESSAO, JSON.stringify(s)); } catch (e) {}
      const lojas = await minhasLojas(s);
      if (lojas && lojas.length === 1) irPara(lojas[0].slug);
      else if (lojas && lojas.length > 1) abrePainel(s, lojas);
      else mostraLogin();
    } catch (e) { mostraLogin(); toast('Não consegui carregar seus catálogos'); }
  })();
})();
