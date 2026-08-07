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
    return { email: (j.user && j.user.email) || email, token: j.access_token, em: Date.now() };
  }

  function irPara(slug) { location.href = '../?loja=' + encodeURIComponent(slug) + '#admin'; }

  // Uma conta pode ser dona de mais de um catálogo — aí ela escolhe.
  function pedeEscolha(lojas) {
    const box = $('#escolha-loja'), lista = $('#lista-lojas');
    lista.textContent = '';
    lojas.forEach(l => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'escolha-item';
      const nome = document.createElement('span');
      nome.textContent = l.display_name || l.slug;
      b.appendChild(nome);
      b.addEventListener('click', () => irPara(l.slug));
      lista.appendChild(b);
    });
    $('#login-form').hidden = true;
    box.hidden = false;
  }

  const form = $('#login-form');
  form.addEventListener('submit', async ev => {
    ev.preventDefault();
    const err = $('#login-error'), btn = $('#btn-login');
    const set = m => { err.textContent = m; err.hidden = !m; };
    set('');
    btn.disabled = true; btn.textContent = 'Entrando…';
    try {
      const s = await entrar($('#login-email').value.trim(), $('#login-pass').value);
      const lojas = await sbGet('pl_catalog_stores?owner_email=eq.' +
        encodeURIComponent(s.email.toLowerCase()) +
        '&is_active=eq.true&select=slug,display_name&order=display_name.asc');
      if (!lojas || !lojas.length) {
        // Autenticou, mas nenhuma loja aponta pra esse e-mail. É config nossa
        // faltando (owner_email), não senha errada — a mensagem tem que dizer isso.
        set('Esta conta não tem nenhum catálogo. Fale com a Provou Levou.');
        return;
      }
      try { localStorage.setItem(SESSAO, JSON.stringify(s)); } catch (e) {}
      $('#login-pass').value = '';
      if (lojas.length === 1) irPara(lojas[0].slug);
      else pedeEscolha(lojas);
    } catch (e) {
      set(e && e.credenciais ? e.message : 'Não consegui entrar agora. Tente de novo.');
    } finally {
      btn.disabled = false; btn.textContent = 'Entrar';
    }
  });

  // Já logado? Não faz sentido pedir senha de novo — vai direto pro catálogo dele.
  (async () => {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(SESSAO) || 'null'); } catch (e) {}
    if (!s || !s.email) return;
    try {
      const lojas = await sbGet('pl_catalog_stores?owner_email=eq.' +
        encodeURIComponent(String(s.email).toLowerCase()) +
        '&is_active=eq.true&select=slug,display_name&order=display_name.asc');
      if (lojas && lojas.length === 1) irPara(lojas[0].slug);
      else if (lojas && lojas.length > 1) pedeEscolha(lojas);
    } catch (e) { toast('Não consegui carregar seus catálogos'); }
  })();
})();
