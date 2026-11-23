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
      admin: !!(j.user && j.user.app_metadata && j.user.app_metadata.pl_catalog_admin),
      em: Date.now()
    };
  }

  async function validarSessao(s) {
    if (!s || !s.token) throw new Error('Sessão inválida');
    const r = await fetch(SB_URL + '/auth/v1/user', {
      headers: { apikey: SB_ANON, Authorization: 'Bearer ' + s.token }
    });
    const user = await r.json().catch(() => null);
    if (!r.ok || !user || !user.email) throw new Error('Sessão expirada');
    return {
      email: user.email,
      token: s.token,
      admin: !!(user.app_metadata && user.app_metadata.pl_catalog_admin),
      em: s.em || Date.now()
    };
  }

  function caminhoLojas(s) {
    const filtro = s && s.admin ? '' : 'owner_email=ilike.' +
      encodeURIComponent(String(s && s.email || '').toLowerCase()) + '&';
    return 'pl_catalog_stores?' + filtro +
      'is_active=eq.true&select=slug,display_name&order=display_name.asc';
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
    cp.lojas = await carregaControle(s, basicas);
    desenhaResumo(); desenhaChips(); desenhaLista();
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
      const lojas = await sbGet(caminhoLojas(s));
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
      const lojas = await sbGet(caminhoLojas(s));
      if (lojas && lojas.length === 1) irPara(lojas[0].slug);
      else if (lojas && lojas.length > 1) abrePainel(s, lojas);
      else mostraLogin();
    } catch (e) { mostraLogin(); toast('Não consegui carregar seus catálogos'); }
  })();
})();
