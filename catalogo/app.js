/* ══════════════ Provou Catálogo — protótipo (fluxo fake, self-contained) ══════════════ */
(function () {
  'use strict';

  // ─────────── Catálogo seed (lojista demo: Acessórios Style) ───────────
  const SEED = [
    { id: 'p1', name: 'Óculos de Sol Madrid Preto', price: 189.90, img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80' },
    { id: 'p2', name: 'Óculos de Grau Jasmine Rosé', price: 149.90, img: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=500&q=80' },
    { id: 'p3', name: 'Óculos de Sol Race Dourado', price: 219.90, img: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=500&q=80' },
    { id: 'p4', name: 'Colar Prata Minimal', price: 89.90, img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&q=80' },
    { id: 'p5', name: 'Brinco Argola Gold', price: 59.90, img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80' },
    { id: 'p6', name: 'Relógio Slim Rosé', price: 259.90, img: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&q=80' }
  ];
  // Nome neutro: o padrão nunca pode ser o de uma loja real, senão a marca dela
  // aparece no catálogo das outras enquanto a loja certa não carrega.
  const STORE = { name: 'Catálogo' };
  const KEY = 'pc_catalog_v1';

  // ─────────── Backend (Supabase + n8n) ───────────
  // Leitura: direto no Supabase com a chave ANON (pública, só lê).
  // Escrita: SEMPRE via webhook n8n — o service_role fica no servidor, nunca aqui.
  const SB_URL = 'https://quantic-supabase.k5jwra.easypanel.host';
  const SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.pCFnSnrlSUM2EwXi9gxAegpoC-9U0Mjx3iAtROR-E20';
  const WH_ADD_PRODUCT = 'https://n8n.segredosdodrop.com/webhook/pl-catalog-product';
  const WH_DEL_PRODUCT = 'https://n8n.segredosdodrop.com/webhook/pl-catalog-product-delete';
  // slug da loja: ?loja=<slug> na URL (cada lojista tem o seu link)
  const STORE_SLUG = (new URLSearchParams(location.search).get('loja') || 'lojateste').trim();
  // Gancho de CSS por loja: o app é um só, então ajuste que vale pra UMA loja
  // (e não pro tema claro/escuro inteiro) precisa de um seletor pra se prender.
  document.documentElement.classList.add('loja-' + STORE_SLUG.replace(/[^a-z0-9-]/gi, ''));
  const MAX_UPLOAD_PX = 1280;   // reduz foto de celular antes de subir (custo/velocidade)
  const JPEG_QUALITY = 0.85;

  // ─────────── Estado ───────────
  let storeRow = null;      // linha de pl_catalog_stores
  let catalog = load();
  let current = null;       // produto selecionado
  let userPhoto = '';       // dataURL da foto do cliente
  let payMethod = 'pix';
  let pixTimer = null;

  // ─────────── Helpers ───────────
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const brl = n => 'R$ ' + Number(n).toFixed(2).replace('.', ',');

  // Cache local só para a primeira pintura da tela (evita catálogo em branco
  // enquanto o fetch não volta). A fonte da verdade é o Supabase.
  function load() {
    try { const v = JSON.parse(localStorage.getItem(cacheKey())); if (Array.isArray(v) && v.length) return v; } catch (e) {}
    return SEED.slice();
  }
  function cacheKey() { return KEY + ':' + STORE_SLUG; }
  function save() { try { localStorage.setItem(cacheKey(), JSON.stringify(catalog)); } catch (e) {} }

  // ─────────── Carga do backend ───────────
  function sbGet(path) {
    return fetch(SB_URL + '/rest/v1/' + path, {
      headers: { apikey: SB_ANON, Authorization: 'Bearer ' + SB_ANON }
    }).then(r => r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status)));
  }

  async function loadStore() {
    // store_api_key entra no select: e ela que autentica a loja nos geradores.
    // Fica exposta no browser, igual a api_key dos widgets das outras lojas — o
    // gerador so aceita se o Origin bater com o domain registrado.
    const rows = await sbGet('pl_catalog_stores?slug=eq.' + encodeURIComponent(STORE_SLUG) +
      '&select=id,slug,display_name,logo_url,whatsapp,bio,primary_color,is_active,store_api_key,owner_email&limit=1');
    storeRow = (rows && rows[0]) || null;
    if (storeRow) {
      STORE.name = storeRow.display_name || STORE.name;
      aplicaTema(storeRow.primary_color);
      // O logo nasce escondido e sem src (ver index.html): só entra em cena o da
      // loja de verdade. Sem logo cadastrado, mostra o nome em texto — melhor que
      // um placeholder genérico ou a marca de outra loja.
      const lg = $('#brand-logo');
      const nomeTxt = $('#brand-name');
      if (lg) {
        if (storeRow.logo_url) {
          lg.alt = STORE.name;
          lg.onerror = function () { lg.onerror = null; lg.hidden = true; if (nomeTxt) nomeTxt.hidden = false; };
          lg.onload = function () { lg.hidden = false; if (nomeTxt) nomeTxt.hidden = true; };
          lg.src = storeRow.logo_url;
        } else {
          lg.hidden = true;
          if (nomeTxt) nomeTxt.hidden = false;
        }
      }
      if (nomeTxt) nomeTxt.textContent = STORE.name;
    }
    return storeRow;
  }

  // Luminância percebida (0 = preto, 255 = branco).
  function luminancia(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
    if (!m) return null;
    const n = parseInt(m[1], 16);
    return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  }

  // A cor da loja também escolhe o TEMA. Loja que define uma cor bem escura
  // (Saint Pierre = #0B0B0B) quer identidade preta: fundo preto, texto branco e
  // botões brancos — usar aquele preto como cor de botão deixaria tudo invisível.
  function aplicaTema(cor) {
    const el = document.documentElement;
    const lum = luminancia(cor);
    const escuro = lum !== null && lum < 60;
    el.classList.toggle('tema-escuro', escuro);
    if (escuro) {
      el.style.setProperty('--brand', '#ffffff');
      el.style.setProperty('--brand-dark', '#e6e6e6');
      el.style.setProperty('--brand-soft', 'rgba(255,255,255,.10)');
    } else if (cor) {
      el.style.setProperty('--brand', cor);
    }
  }

  async function loadCatalog() {
    if (!storeRow) return catalog;
    const rows = await sbGet('pl_catalog_products?store_id=eq.' + storeRow.id +
      '&is_active=eq.true&select=*,pl_catalog_product_images(url,is_primary,position)' +
      '&order=position.asc,created_at.desc');
    catalog = (rows || []).map(r => {
      const imgs = (r.pl_catalog_product_images || [])
        .slice().sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || (a.position || 0) - (b.position || 0));
      return {
        id: r.id, name: r.name, price: Number(r.price), img: (imgs[0] || {}).url || '',
        categoria: categoriaDe(r)
      };
    });
    save();
    return catalog;
  }

  let cargaInicial = null;   // promessa da 1a carga: o login espera por ela

  async function refreshFromServer() {
    try {
      await loadStore();
      await loadCatalog();
      renderStore(); renderCatalog();
      aplicaPermissoes();   // owner_email so chega com a loja carregada
    } catch (e) {
      console.warn('[Provou Catálogo] falha ao carregar do servidor:', e);
      toast('Não consegui carregar o catálogo');
    }
  }

  // Reduz a foto antes de subir: celular manda 4MB+, o catálogo não precisa disso.
  function compressImage(file) {
    return new Promise(resolve => {
      try {
        const img = new Image();
        const u = URL.createObjectURL(file);
        img.onload = function () {
          URL.revokeObjectURL(u);
          const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
          if (!w || !h) { resolve(null); return; }
          const sc = Math.min(1, MAX_UPLOAD_PX / Math.max(w, h));
          const c = document.createElement('canvas');
          c.width = Math.round(w * sc); c.height = Math.round(h * sc);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          resolve(c.toDataURL('image/jpeg', JPEG_QUALITY).split(',')[1]);
        };
        img.onerror = function () { URL.revokeObjectURL(u); resolve(null); };
        img.src = u;
      } catch (e) { resolve(null); }
    });
  }

  // fallback SVG quando a imagem externa falha
  function fallbackSvg(label) {
    const t = encodeURIComponent((label || '?').slice(0, 14));
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%236d3bef'/><stop offset='1' stop-color='%23a06bff'/></linearGradient></defs><rect width='400' height='400' fill='url(%23g)'/><text x='50%' y='52%' font-family='Hanken Grotesk, sans-serif' font-size='26' fill='white' text-anchor='middle' opacity='.9'>${t}</text></svg>`;
    return "data:image/svg+xml;charset=utf-8," + svg;
  }
  function bindImg(imgEl, src, label) {
    imgEl.onerror = function () { imgEl.onerror = null; imgEl.src = fallbackSvg(label); };
    imgEl.src = src || fallbackSvg(label);
  }

  let toastTimer;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 1900);
  }

  // ─────────── Router ───────────
  function show(name) {
    $$('.screen').forEach(s => s.classList.toggle('active', s.dataset.screen === name));
    document.getElementById('app').scrollTop = 0;
    window.scrollTo(0, 0);
  }

  // ─────────── Catálogo ───────────
  function renderStore() {
    const ss = $('#s-store'); if (ss) ss.textContent = STORE.name;
  }
  function renderCatalog() {
    const grid = $('#catalog-grid');
    grid.innerHTML = '';
    catalog.forEach(p => {
      // DOM seguro: nome do produto vem do lojista, nunca concatenar em HTML.
      const card = document.createElement('div');
      card.className = 'prod-card';
      const thumb = document.createElement('img');
      thumb.className = 'thumb'; thumb.alt = '';
      const body = document.createElement('div'); body.className = 'pc-body';
      const nome = document.createElement('div'); nome.className = 'pc-name'; nome.textContent = p.name;
      const preco = document.createElement('div'); preco.className = 'pc-price'; preco.textContent = brl(p.price);
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'pc-try'; btn.textContent = '👓 Provar virtualmente';
      body.append(nome, preco, btn);
      card.append(thumb, body);
      bindImg(thumb, p.img, p.name);
      // Botão leva DIRETO pra prova (menos um passo pro cliente).
      card.querySelector('.pc-try').addEventListener('click', ev => {
        ev.stopPropagation();
        startTryOn(p);
      });
      // Resto do card abre a página do produto (detalhe e compra).
      card.addEventListener('click', () => openProduct(p));
      grid.appendChild(card);
    });
    const vazio = $('#catalog-empty');
    if (vazio) vazio.hidden = catalog.length > 0;
    grid.hidden = catalog.length === 0;
  }

  // Abre a prova virtual já com o produto escolhido
  function startTryOn(p) {
    openProduct(p);       // popula os dados do produto nas telas seguintes
    resetUploader();
    show('tryon');
  }

  // ─────────── Produto ───────────
  function openProduct(p) {
    current = p;
    bindImg($('#p-img'), p.img, p.name);
    $('#p-name').textContent = p.name;
    $('#p-price').textContent = brl(p.price);
    $('#p-install').textContent = 'ou 12x de ' + brl(p.price / 12);
    show('product');
  }

  // ─────────── Try-on: upload ───────────
  function resetUploader() {
    userPhoto = '';
    $('#uploader-preview').hidden = true;
    $('#uploader-empty').style.display = '';
    $('#btn-generate').disabled = true;
    $('#photo-input').value = '';
    const g = $('#photo-gallery'); if (g) g.value = '';
  }
  function recebeFoto(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      userPhoto = reader.result;
      const prev = $('#uploader-preview');
      prev.src = userPhoto; prev.hidden = false;
      $('#uploader-empty').style.display = 'none';
      atualizaBotaoProvar();   // só libera com foto, WhatsApp e aceite
    };
    reader.readAsDataURL(file);
  }
  $('#photo-input').addEventListener('change', recebeFoto);
  {
    // Câmera e galeria são inputs distintos; cada gatilho abre o seu. Sem
    // preventDefault: os inputs estão fora da área clicável, então nada aqui
    // cancela a abertura do seletor de arquivo.
    const cam = $('#photo-input'), gal = $('#photo-gallery');
    if (gal) gal.addEventListener('change', recebeFoto);
    const btnCam = $('#btn-tirar-foto'), btnGal = $('#btn-galeria');
    if (btnCam && cam) btnCam.addEventListener('click', () => cam.click());
    if (btnGal) btnGal.addEventListener('click', () => (gal || cam).click());
    const area = $('#uploader');
    if (area) {
      const abre = () => (gal || cam).click();
      area.addEventListener('click', abre);
      // a área virou <div>, então o teclado precisa ser ligado na mão
      area.addEventListener('keydown', ev => {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); abre(); }
      });
    }
  }

  // ─────────── Geração (REAL) ───────────
  // Os dois geradores de produção da frota. Ambos autenticam pelo SHA256 da
  // api_key contra provou_levou_stores e devolvem a IMAGEM no corpo da resposta.
  const WH_GER_OCULOS = 'https://n8n.segredosdodrop.com/webhook/gerador-oculos';
  const WH_GER_ROUPA = 'https://n8n.segredosdodrop.com/webhook/quantic-materialize';

  // Categoria do produto. Quando a coluna `categoria` existir em
  // pl_catalog_products ela manda; enquanto não existir, deduz pelo nome —
  // errar aqui só troca o gerador, e o de roupa aceita óculos (só fica pior).
  function categoriaDe(row) {
    const c = String(row && row.categoria || '').toLowerCase().trim();
    if (c === 'oculos' || c === 'óculos' || c === 'roupa') return c === 'óculos' ? 'oculos' : c;
    const t = ((row && row.name) || '') + ' ' + ((row && row.description) || '');
    return /[óo]culos|armaç|armac|lente|solar|clip[- ]?on|grau/i.test(t) ? 'oculos' : 'roupa';
  }

  function soDigitos(v) { return String(v || '').replace(/\D/g, ''); }

  function telefoneValido(nums) {
    const err = $('#phone-error');
    const set = m => { if (err) { err.textContent = m; err.hidden = !m; } };
    if (nums.length < 10) { set('Informe DDD + número'); return false; }
    if (nums.length > 11) { set('Número longo demais'); return false; }
    if (!/^[1-9][1-9]/.test(nums)) { set('DDD inválido'); return false; }
    if (nums.length === 11 && nums[2] !== '9') { set('Celular deve começar com 9 após o DDD'); return false; }
    set('');
    return true;
  }

  // dataURL -> Blob sem passar por fetch() (evita CSP e é síncrono)
  function dataUrlParaBlob(d) {
    const [cab, b64] = String(d).split(',');
    const mime = (cab.match(/data:([^;]+)/) || [, 'image/jpeg'])[1];
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }

  let _gerando = false;

  async function runGeneration() {
    if (_gerando) return;               // trava contra clique duplo (custa prova e dinheiro)
    const tel = soDigitos($('#phone-input') && $('#phone-input').value);
    if (!telefoneValido(tel)) { $('#phone-input').focus(); return; }
    if (!userPhoto) return;

    // O catálogo renderiza do cache do localStorage, então a tela funciona mesmo
    // quando a leitura da loja falha — e aí storeRow fica nulo e a prova morria com
    // "loja sem chave". Antes de desistir, tenta buscar a loja de novo.
    let chave = storeRow && storeRow.store_api_key;
    if (!chave) {
      try { await loadStore(); } catch (e) {}
      chave = storeRow && storeRow.store_api_key;
    }
    if (!chave) { toast('Não consegui falar com o servidor. Tente de novo.'); return; }

    _gerando = true;
    show('loading');
    const bar = $('#progress-bar');
    let i = 0; bar.style.width = '8%';
    const iv = setInterval(() => {
      i++;
      bar.style.width = Math.min(92, 8 + i * 7) + '%';
    }, 1800);

    try {
      // Recalcula na hora em vez de confiar no campo: o catálogo pode ter vindo do
      // cache do localStorage gravado por uma versão anterior, sem `categoria` —
      // e aí "Oculos 2" caía no gerador de roupa por causa do fallback.
      const cat = categoriaDe(current);
      const url = cat === 'oculos' ? WH_GER_OCULOS : WH_GER_ROUPA;

      const fd = new FormData();
      fd.append('person_image', dataUrlParaBlob(userPhoto), 'pessoa.jpg');
      // a foto do produto vem do nosso proprio Storage, entao o fetch passa
      const prodBlob = await fetch(current.img).then(r => r.blob());
      fd.append('product_image', prodBlob, 'produto.jpg');
      fd.append('whatsapp', '55' + tel);
      fd.append('phone_raw', $('#phone-input').value);
      fd.append('product_name', current.name);
      fd.append('product_type', cat);
      fd.append('api_key', chave);

      const res = await fetch(url, { method: 'POST', body: fd });
      const ct = res.headers.get('content-type') || '';

      if (!ct.startsWith('image/')) {
        // limite diario e chave invalida voltam como JSON, nao como imagem
        let msg = 'Não consegui gerar sua prova agora. Tente de novo em instantes.';
        try {
          const j = await res.json();
          if (j.error === 'limite_diario') msg = 'Você já usou suas provas de hoje. Volte amanhã!';
        } catch (e) {}
        throw new Error(msg);
      }

      const blob = await res.blob();
      clearInterval(iv); bar.style.width = '100%';
      showResult(URL.createObjectURL(blob));
    } catch (e) {
      clearInterval(iv);
      toast((e && e.message) || 'Não consegui gerar sua prova agora.');
      show('tryon');
    } finally {
      _gerando = false;
    }
  }

  function showResult(urlProva) {
    const img = $('#result-img');
    img.onerror = null;
    img.src = urlProva || userPhoto || fallbackSvg('Sua prova');
    bindImg($('#result-thumb'), current.img, current.name);
    $('#result-name').textContent = current.name;
    $('#result-price').textContent = brl(current.price);
    show('result');
  }

  // ─────────── Checkout ───────────
  function openCheckout() {
    bindImg($('#co-thumb'), current.img, current.name);
    $('#co-name').textContent = current.name;
    $('#co-price').textContent = brl(current.price);
    show('checkout');
  }
  $$('.pay-method').forEach(b => b.addEventListener('click', () => {
    payMethod = b.dataset.pay;
    if (payMethod === 'pix') openPix(); else openCard();
  }));

  // ─────────── PIX (fake) ───────────
  function openPix() {
    $('#qr-wrap').innerHTML = fakeQr(current.id + '|' + current.price);
    $('#pix-amount').textContent = brl(current.price);
    const st = $('#pix-status');
    st.classList.remove('ok');
    st.innerHTML = '<span class="dot-pulse"></span> Aguardando pagamento…';
    show('pix');
    clearTimeout(pixTimer);
    pixTimer = setTimeout(() => confirmPixPaid(), 4000); // "pagamento" cai sozinho em 4s
  }
  function confirmPixPaid() {
    clearTimeout(pixTimer);
    const st = $('#pix-status');
    st.classList.add('ok');
    st.innerHTML = '<span class="dot-pulse"></span> Pagamento aprovado!';
    setTimeout(() => success('via PIX'), 900);
  }
  $('#btn-fake-pay-pix').addEventListener('click', confirmPixPaid);
  $('#btn-copy-pix').addEventListener('click', () => {
    const inp = $('#pix-code'); inp.select();
    try { navigator.clipboard.writeText(inp.value); } catch (e) {}
    toast('Código PIX copiado');
  });

  // QR fake: grid pseudo-aleatório determinístico + 3 finder patterns
  function fakeQr(seed) {
    const N = 25, cell = 8, pad = 0;
    let h = 0; for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffffffff;
    const rnd = () => { h = (h * 1103515245 + 12345) & 0x7fffffff; return h / 0x7fffffff; };
    let rects = '';
    const finder = (ox, oy) => {
      for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
        const edge = x === 0 || y === 0 || x === 6 || y === 6;
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        if (edge || core) rects += `<rect x="${(ox + x) * cell}" y="${(oy + y) * cell}" width="${cell}" height="${cell}"/>`;
      }
    };
    const inFinder = (x, y) => (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      if (inFinder(x, y)) continue;
      if (rnd() > 0.52) rects += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}"/>`;
    }
    finder(0, 0); finder(N - 7, 0); finder(0, N - 7);
    const sz = N * cell;
    return `<svg viewBox="0 0 ${sz} ${sz}" xmlns="http://www.w3.org/2000/svg" fill="#14121a">${rects}</svg>`;
  }

  // ─────────── Cartão (fake) ───────────
  function buildInstallments() {
    const sel = $('#f-install'); sel.innerHTML = '';
    for (let n = 1; n <= 12; n++) {
      const opt = document.createElement('option');
      opt.value = n;
      opt.textContent = n + 'x de ' + brl(current.price / n) + (n === 1 ? ' à vista' : ' sem juros');
      sel.appendChild(opt);
    }
  }
  function openCard() {
    buildInstallments();
    $('#card-form').reset();
    $('#cv-number').textContent = '•••• •••• •••• ••••';
    $('#cv-name').textContent = 'NOME NO CARTÃO';
    $('#cv-exp').textContent = 'MM/AA';
    $('#card-amount').textContent = brl(current.price);
    show('card');
  }
  $('#f-number').addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 16);
    e.target.value = v.replace(/(.{4})/g, '$1 ').trim();
    $('#cv-number').textContent = (e.target.value || '•••• •••• •••• ••••').padEnd(19, '•');
  });
  $('#f-name').addEventListener('input', e => {
    $('#cv-name').textContent = (e.target.value || 'NOME NO CARTÃO').toUpperCase();
  });
  $('#f-exp').addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
    e.target.value = v;
    $('#cv-exp').textContent = v || 'MM/AA';
  });
  $('#f-cvv').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4); });

  $('#card-form').addEventListener('submit', e => {
    e.preventDefault();
    const num = $('#f-number').value.replace(/\s/g, '');
    if (num.length < 16 || !$('#f-name').value.trim() || $('#f-exp').value.length < 5 || $('#f-cvv').value.length < 3) {
      toast('Preencha os dados do cartão');
      return;
    }
    show('processing');
    $('#processing-title').textContent = 'Processando pagamento…';
    setTimeout(() => success('via Cartão de crédito'), 2200);
  });

  // ─────────── Sucesso ───────────
  function success(payLabel) {
    bindImg($('#s-thumb'), current.img, current.name);
    $('#s-name').textContent = current.name;
    $('#s-price').textContent = brl(current.price);
    $('#s-pay').textContent = payLabel;
    show('success');
  }

  // ─────────── Admin (lojista) ───────────
  let adminPhoto = '';
  function renderAdmin() {
    $('#admin-count').textContent = catalog.length + ' produto' + (catalog.length === 1 ? '' : 's') + ' no catálogo';
    const list = $('#admin-list'); list.innerHTML = '';
    catalog.forEach(p => {
      const item = document.createElement('div');
      item.className = 'admin-item';
      const foto = document.createElement('img'); foto.alt = '';
      const nome = document.createElement('span'); nome.className = 'ai-name'; nome.textContent = p.name;
      const preco = document.createElement('span'); preco.className = 'ai-price'; preco.textContent = brl(p.price);
      const del = document.createElement('button');
      del.type = 'button'; del.className = 'ai-del';
      del.title = 'Excluir produto'; del.setAttribute('aria-label', 'Excluir ' + p.name);
      const tpl = $('#tpl-lixeira');
      if (tpl) del.appendChild(tpl.content.cloneNode(true));
      else del.textContent = '✕';   // guard: HTML em cache sem o template
      item.append(foto, nome, preco, del);
      bindImg(foto, p.img, p.name);
      del.addEventListener('click', () => { removeProduct(p.id); });
      list.appendChild(item);
    });
  }
  async function removeProduct(id) {
    const antes = catalog.slice();
    catalog = catalog.filter(p => p.id !== id); save();
    renderAdmin(); renderCatalog();
    try {
      const r = await fetch(WH_DEL_PRODUCT, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store_slug: STORE_SLUG, product_id: id })
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      toast('Produto removido');
    } catch (e) {
      // desfaz: se o servidor não removeu, o produto volta no próximo reload de qualquer jeito
      console.warn('[Provou Catálogo] erro ao remover:', e);
      catalog = antes; save(); renderAdmin(); renderCatalog();
      toast('Não consegui remover. Tente de novo.');
    }
  }
  let adminPhotoB64 = '';   // base64 já comprimido, pronto pra subir
  $('#admin-photo').addEventListener('change', async e => {
    const file = e.target.files && e.target.files[0]; if (!file) return;
    const b64 = await compressImage(file);
    if (!b64) { toast('Não consegui ler essa imagem'); return; }
    adminPhotoB64 = b64;
    adminPhoto = 'data:image/jpeg;base64,' + b64;
    const prev = $('#admin-up-preview'); prev.src = adminPhoto; prev.hidden = false;
    $('#admin-up-empty').style.display = 'none';
  });
  $('#btn-add-product').addEventListener('click', async () => {
    const btn = $('#btn-add-product');
    const name = $('#admin-name').value.trim();
    const priceRaw = $('#admin-price').value.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
    const price = parseFloat(priceRaw);
    if (!name) { toast('Dê um nome ao produto'); return; }
    if (!price || price <= 0) { toast('Informe um preço válido'); return; }
    if (!adminPhotoB64) { toast('Envie a foto do produto'); return; }
    if (!storeRow) { toast('Loja não encontrada — recarregue a página'); return; }

    const txt = btn.textContent;
    btn.disabled = true; btn.textContent = 'Enviando foto...';
    try {
      const r = await fetch(WH_ADD_PRODUCT, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store_slug: STORE_SLUG, name, price, mime: 'image/jpeg', image_b64: adminPhotoB64 })
      });
      const data = await r.json().catch(() => null);
      if (!r.ok || !data || !data.ok) throw new Error('falha no upload');

      await loadCatalog();
      renderAdmin(); renderCatalog();
      $('#admin-name').value = ''; $('#admin-price').value = '';
      adminPhoto = ''; adminPhotoB64 = '';
      $('#admin-up-preview').hidden = true; $('#admin-up-empty').style.display = ''; $('#admin-photo').value = '';
      toast('Produto adicionado ✓');
    } catch (err) {
      console.warn('[Provou Catálogo] erro ao adicionar produto:', err);
      toast('Não consegui enviar. Tente de novo.');
    } finally {
      btn.disabled = false; btn.textContent = txt;
    }
  });

  // ─────────── Navegação (botões fixos) ───────────
  // ─────────── Login do lojista ───────────
  // Antes, o botão de gerenciar e o "Cadastrar novo produto" apareciam para
  // QUALQUER visitante do catálogo — ou seja, o cliente da loja podia editar o
  // catálogo dela. Agora a área do lojista fica atrás do login, e só abre para
  // quem entrar com o e-mail dono da loja (pl_catalog_stores.owner_email).
  const SESSAO = 'pc_sess_v1';
  let sessao = null;
  try { sessao = JSON.parse(localStorage.getItem(SESSAO) || 'null'); } catch (e) { sessao = null; }

  function ehDono() {
    const dono = String((storeRow && storeRow.owner_email) || '').trim().toLowerCase();
    const logado = String((sessao && sessao.email) || '').trim().toLowerCase();
    return !!dono && !!logado && dono === logado;
  }

  function temSessao() { return !!(sessao && sessao.email); }

  // Sem sessão a área do lojista nem aparece — não adianta esconder só o botão
  // se o elemento continua clicável por quem inspeciona a página.
  // Com sessão a engrenagem aparece MESMO na loja errada: quem abre o catálogo
  // sem o ?loja= cai na loja default, deixa de ser dono e ficava sem nenhuma
  // porta pro painel — "a engrenagem sumiu". Nesse caso ela leva pro painel,
  // que resolve a loja certa pelo e-mail. Editar continua exigindo ser dono.
  function aplicaPermissoes() {
    const podeEditar = ehDono();
    const bAdmin = $('#btn-admin');
    const bNovo = $('#btn-new-product');
    if (bAdmin) bAdmin.hidden = !(podeEditar || temSessao());
    if (bNovo) bNovo.hidden = !podeEditar;
    document.documentElement.classList.toggle('is-lojista', podeEditar);
  }

  // O submit do login mora em painel/painel.js — o catalogo publico nao
  // autentica ninguem, so le a sessao que o painel deixou no localStorage.

  function sair() {
    sessao = null;
    try { localStorage.removeItem(SESSAO); } catch (e) {}
    aplicaPermissoes();
    show('catalog');
    toast('Você saiu do painel.');
  }
  const btnSair = $('#btn-logout');
  if (btnSair) btnSair.addEventListener('click', sair);

  $('#btn-admin').addEventListener('click', () => {
    if (!ehDono()) { location.href = 'painel/'; return; }
    renderAdmin(); show('admin');
  });
  // guard: se o HTML em cache for antigo, não derruba o resto do app
  const btnNovo = $('#btn-new-product');
  if (btnNovo) btnNovo.addEventListener('click', () => {
    renderAdmin(); show('admin');
    setTimeout(() => { const el = $('#admin-uploader'); if (el) el.focus(); }, 120);
  });
  $('#btn-try').addEventListener('click', () => { resetUploader(); show('tryon'); });
  $('#btn-generate').addEventListener('click', runGeneration);

  // Máscara do WhatsApp + habilita o botão só com foto E telefone preenchidos.
  (function ligaCampoTelefone() {
    const inp = $('#phone-input');
    if (!inp) return;
    inp.addEventListener('input', () => {
      const n = soDigitos(inp.value).slice(0, 11);
      inp.value = n.length <= 2 ? n
        : n.length <= 6 ? '(' + n.slice(0, 2) + ') ' + n.slice(2)
          : n.length <= 10 ? '(' + n.slice(0, 2) + ') ' + n.slice(2, 6) + '-' + n.slice(6)
            : '(' + n.slice(0, 2) + ') ' + n.slice(2, 7) + '-' + n.slice(7);
      const err = $('#phone-error'); if (err) err.hidden = true;
      atualizaBotaoProvar();
    });
  })();

  function atualizaBotaoProvar() {
    const temFoto = !!userPhoto;
    const temTel = soDigitos($('#phone-input') && $('#phone-input').value).length >= 10;
    const ok = $('#accept-terms');
    const aceitou = !ok || ok.checked;   // guard: HTML em cache sem o checkbox
    const b = $('#btn-generate');
    if (b) b.disabled = !(temFoto && temTel && aceitou);
  }
  {
    const ok = $('#accept-terms');
    if (ok) ok.addEventListener('change', atualizaBotaoProvar);
  }
  // Loja de catalogo nao tem carrinho: quem quer comprar fala com o lojista, ja
  // com o modelo provado no texto. So cai no checkout se a loja nao tiver WhatsApp.
  function comprarNoWhatsapp() {
    const tel = String((storeRow && storeRow.whatsapp) || '').replace(/\D/g, '');
    if (!tel) { openCheckout(); return; }
    const num = tel.length <= 11 ? '55' + tel : tel;
    const txt = 'Oi! Provei o ' + (current && current.name || 'produto') +
      (current && current.price ? ' (' + brl(current.price) + ')' : '') +
      ' no provador virtual da ' + STORE.name + ' e quero comprar.';
    window.open('https://wa.me/' + num + '?text=' + encodeURIComponent(txt), '_blank');
  }
  $('#btn-buy').addEventListener('click', comprarNoWhatsapp);
  $('#btn-tryother').addEventListener('click', () => show('catalog'));
  $('#btn-back-catalog').addEventListener('click', () => { clearTimeout(pixTimer); show('catalog'); });
  $$('[data-back]').forEach(b => b.addEventListener('click', () => { clearTimeout(pixTimer); show(b.dataset.back); }));

  // ─────────── Modo demo: loop da animação de geração (?#gen) ───────────
  function demoLoadingLoop() {
    show('loading');
    const bar = $('#progress-bar');
    let i = 0;
    if (window.__genDemo) clearInterval(window.__genDemo);
    window.__genDemo = setInterval(() => {
      bar.style.width = Math.min(100, (i % 5) * 26) + '%';
      i++;
    }, 650);
  }

  // ─────────── Init ───────────
  aplicaPermissoes();   // esconde a area do lojista antes de pintar a tela
  renderStore();
  renderCatalog();          // pinta na hora com o cache
  cargaInicial = refreshFromServer();   // e busca o catálogo real do Supabase
  if (location.hash === '#gen') demoLoadingLoop();
  // Volta do painel unico: /catalogo/painel/ manda pra ca com #admin depois de
  // autenticar. Se a sessao nao servir pra esta loja, devolve pro painel em vez
  // de mostrar um catalogo publico sem explicacao.
  else if (location.hash === '#admin' || location.hash === '#login') {
    if (ehDono()) { renderAdmin(); show('admin'); }
    else if (cargaInicial) cargaInicial.then(() => {
      if (ehDono()) { renderAdmin(); show('admin'); }
      else location.href = 'painel/';
    });
    else location.href = 'painel/';
  }
  else show('catalog');
})();
