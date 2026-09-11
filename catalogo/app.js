/* ══════════════ Provou Catálogo — protótipo (fluxo fake, self-contained) ══════════════ */
(function () {
  'use strict';

  // ─────────── Catálogo seed (lojista demo: Acessórios Style) ───────────
  // NÃO existe catálogo padrão. Havia um SEED de 6 produtos de banco de
  // imagens aqui, e ele aparecia por instantes em TODA loja antes do fetch
  // voltar — o cliente da Saint Pierre via o catálogo de outra pessoa.
  // Enquanto o servidor não responde, a tela mostra esqueleto.
  // Nome neutro: o padrão nunca pode ser o de uma loja real, senão a marca dela
  // aparece no catálogo das outras enquanto a loja certa não carrega.
  const STORE = { name: 'Catálogo' };
  // v2: o v1 ficou envenenado. A versão antiga do app tinha um catálogo de
  // demonstração e o `save()` gravava ELE no localStorage — então quem abriu o
  // catálogo antes da correção tem 6 produtos de outra loja guardados no
  // navegador, e continua vendo o flash mesmo com o código novo. Trocar a chave
  // abandona esses caches de uma vez; o v1 é apagado logo abaixo.
  const KEY = 'pc_catalog_v2';
  try {
    Object.keys(localStorage)
      .filter(k => k.indexOf('pc_catalog_v1') === 0)
      .forEach(k => localStorage.removeItem(k));
  } catch (e) {}

  // ─────────── Backend (Supabase + n8n) ───────────
  // Leitura: direto no Supabase com a chave ANON (pública, só lê).
  // Escrita: SEMPRE via webhook n8n — o service_role fica no servidor, nunca aqui.
  const SB_URL = 'https://quantic-supabase.k5jwra.easypanel.host';
  const SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.pCFnSnrlSUM2EwXi9gxAegpoC-9U0Mjx3iAtROR-E20';
  const WH_ADD_PRODUCT = 'https://n8n.segredosdodrop.com/webhook/pl-catalog-product';
  const WH_DEL_PRODUCT = 'https://n8n.segredosdodrop.com/webhook/pl-catalog-product-delete';
  const WH_EDIT_PRODUCT = 'https://n8n.segredosdodrop.com/webhook/pl-catalog-product-update';
  const WH_ADD_IMAGE = 'https://n8n.segredosdodrop.com/webhook/pl-catalog-product-image';
  const WH_THEME = 'https://n8n.segredosdodrop.com/webhook/pl-catalog-theme';
  const MAX_FOTOS_PRODUTO = 5;   // teto: além disso o cadastro fica lento e o ganho some
  // slug da loja: ?loja=<slug> na URL (cada lojista tem o seu link)
  const STORE_SLUG = (new URLSearchParams(location.search).get('loja') || 'lojateste').trim();
  // Gancho de CSS por loja: o app é um só, então ajuste que vale pra UMA loja
  // (e não pro tema claro/escuro inteiro) precisa de um seletor pra se prender.
  document.documentElement.classList.add('loja-' + STORE_SLUG.replace(/[^a-z0-9-]/gi, ''));
  const MAX_UPLOAD_PX = 1024;   // suficiente para a prova e muito mais leve no 4G
  const JPEG_QUALITY = 0.80;
  // Cada cliente (WhatsApp) tem N provas por dia neste catálogo. O catálogo não
  // tinha limite nenhum: o mesmo número provava o catálogo inteiro e cada prova
  // custa geração pro lojista.
  // Loja que pediu limite diferente do padrão entra aqui. (O ideal é coluna na
  // loja, pra mudar sem deploy — hoje é DDL, que só passa pelo SQL Editor.)
  const LIMITE_POR_LOJA = { ruby: 1, precisionprime: 5, rever: 5 };
  // Vale enquanto o servidor nao responde. Quem manda e a franquia da loja no
  // banco: assim da pra mudar o limite sem deploy, e o navegador nao decide
  // quantas provas ele mesmo pode fazer.
  let MAX_PROVAS_DIA = LIMITE_POR_LOJA[STORE_SLUG] || 3;
  // "suas 1 provas de hoje" fica errado; com limite 1 o texto muda junto
  function provasTxt() {
    if (!isFinite(MAX_PROVAS_DIA)) return 'suas provas de hoje';
    return MAX_PROVAS_DIA === 1 ? 'sua prova de hoje'
                                : 'suas ' + MAX_PROVAS_DIA + ' provas de hoje';
  }
  const PROVAS_KEY = 'pc_provas_v1';

  // ─────────── Estado ───────────
  let storeRow = null;      // linha de pl_catalog_stores
  let carregou = false;     // o servidor já respondeu ao menos uma vez?
  let catalog = load();
  let current = null;       // produto selecionado
  let fotoSel = 0;          // foto escolhida na galeria — a prova sai DELA (cores diferentes por foto, caso For Eyes)
  // A foto que o cliente está vendo/escolheu — resultado, checkout e prova usam ela.
  function fotoAtual() {
    if (!current) return '';
    const fotos = (current.imgs && current.imgs.length ? current.imgs : [current.img]).filter(Boolean);
    return fotos[Math.min(Math.max(0, fotoSel), fotos.length - 1)] || current.img || '';
  }
  function variacaoAtual() {
    if (!current || !current.imageMeta || !current.imageMeta.length) return '';
    const item = current.imageMeta[Math.min(Math.max(0, fotoSel), current.imageMeta.length - 1)];
    return (item && item.variantName) || '';
  }
  function nomeProdutoAtual() {
    const nome = (current && current.name) || 'produto';
    const variacao = variacaoAtual();
    return variacao ? nome + ' — ' + variacao : nome;
  }
  let userPhoto = '';       // dataURL da foto do cliente
  let payMethod = 'pix';
  let pixTimer = null;

  // ─────────── Helpers ───────────
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const brl = n => 'R$ ' + Number(n).toFixed(2).replace('.', ',');
  const temOferta = p => !!(p && p.originalPrice && p.originalPrice > p.price);
  const precoAtualTxt = p => (temOferta(p) ? 'POR: ' : '') + brl(p.price);
  const precoOriginalTxt = p => temOferta(p) ? 'DE ' + brl(p.originalPrice) : '';

  function valorParcela(p, parcelas) {
    const n = Math.max(1, Number(parcelas) || 1);
    const juros = Math.max(0, Number(p && p.installmentInterestRate) || 0);
    if (n === 1 || !juros) return Number(p.price) / n;
    return Number(p.price) * (1 + (juros / 100) * n) / n;
  }
  const espera = ms => new Promise(resolve => setTimeout(resolve, ms));

  function novoRequestId() {
    if (self.crypto && typeof self.crypto.randomUUID === 'function') return self.crypto.randomUUID();
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2) + '-' + Math.random().toString(36).slice(2);
  }

  // No 4G o servidor pode concluir a gravação e a resposta se perder no caminho.
  // O mesmo request_id acompanha a repetição, então o backend devolve o registro
  // existente em vez de criar um produto ou uma foto duplicados.
  async function postJsonComRetry(url, body, tentativas) {
    let ultimoErro;
    for (let tentativa = 1; tentativa <= (tentativas || 2); tentativa++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 18000);
        let r;
        try {
          r = await fetch(url, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body), signal: controller.signal
          });
        } finally {
          clearTimeout(timer);
        }
        const data = await r.json().catch(() => null);
        if (r.ok && data && data.ok) return data;
        const e = new Error('HTTP ' + r.status);
        e.retryable = r.status === 408 || r.status === 429 || r.status >= 500;
        throw e;
      } catch (e) {
        ultimoErro = e;
        if (tentativa >= (tentativas || 2) || e.retryable === false) break;
        await espera(1200 * tentativa);
      }
    }
    throw ultimoErro || new Error('Falha no envio');
  }

  // Cache local só para a primeira pintura da tela (evita catálogo em branco
  // enquanto o fetch não volta). A fonte da verdade é o Supabase.
  function load() {
    try { const v = JSON.parse(localStorage.getItem(cacheKey())); if (Array.isArray(v) && v.length) return v; } catch (e) {}
    return [];
  }
  function cacheKey() { return KEY + ':' + STORE_SLUG; }
  function save() { try { localStorage.setItem(cacheKey(), JSON.stringify(catalog)); } catch (e) {} }

  // ─────────── Carga do backend ───────────
  async function sbGet(path) {
    let erro;
    for (let tentativa = 1; tentativa <= 2; tentativa++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);
      try {
        const r = await fetch(SB_URL + '/rest/v1/' + path, {
          headers: { apikey: SB_ANON, Authorization: 'Bearer ' + SB_ANON },
          signal: controller.signal
        });
        if (!r.ok) throw Object.assign(new Error('HTTP ' + r.status), { retryable: r.status >= 500 || r.status === 429 });
        return await r.json();
      } catch (e) {
        erro = e;
        if (tentativa === 2 || e.retryable === false) break;
        await espera(500);
      } finally { clearTimeout(timer); }
    }
    throw erro || new Error('Falha ao carregar');
  }

  async function loadStore() {
    // store_api_key entra no select: e ela que autentica a loja nos geradores.
    // Fica exposta no browser, igual a api_key dos widgets das outras lojas — o
    // gerador so aceita se o Origin bater com o domain registrado.
    const rows = await sbGet('pl_catalog_stores?slug=eq.' + encodeURIComponent(STORE_SLUG) +
      '&is_active=eq.true&select=id,slug,display_name,logo_url,whatsapp,bio,primary_color,tema,is_active,store_api_key,owner_email,categorias_ordem&limit=1');
    storeRow = (rows && rows[0]) || null;
    if (!storeRow) {
      document.title = 'Catálogo indisponível';
      document.body.innerHTML = '<main style="min-height:100vh;display:grid;place-items:center;padding:24px;text-align:center;font-family:Inter,system-ui,sans-serif;background:#f7f7f8;color:#17171b"><section><h1 style="margin:0 0 10px;font-size:28px">Catálogo indisponível</h1><p style="margin:0;color:#666">Este catálogo não está disponível no momento.</p></section></main>';
      return null;
    }
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
      configuraBotoesCompra();
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
  // Lojas com DUAS cores de marca. `primary_color` guarda uma só e define o
  // tema; quem tem cor de destaque (a Vyre é marinho + dourado) precisa dizer
  // qual é, senão o tema escuro pinta tudo de branco e o dourado some.
  // Fica aqui porque pl_catalog_stores não tem coluna de acento — quando tiver,
  // isto vira leitura do banco.
  const ACENTOS = {
    // MV Ótica: dourado e BRANCO — o fundo padrão do app é lilás, então ele
    // também entra aqui. O dourado do botão é mais fechado que o do logo pra
    // o texto branco em cima dele continuar legível (contraste 4,8 : 1).
    // Diamond Óculos: preto e dourado. Logo em fundo preto chapado, como o da
    // Stilus e o da CatGlass — fundo preto puro pra a arte encaixar na página.
    // No botão o texto é o próprio preto: 13:1 e o dourado da marca preservado.
    diamond: { bg: '#000000', card: '#101010', line: 'rgba(242,205,124,.30)',
               brand: '#F2CD7C', dark: '#D9B265', soft: 'rgba(242,205,124,.15)', on: '#0A0A0A' },
    // Óticas Carone: magenta e preto sobre branco. O magenta do logo (#E40677)
    // fica em 4,57 com texto branco — passa raspando, então fechei um pouco.
    carone: { bg: '#FFFFFF', card: '#FFFFFF', line: '#F6E1EC',
              brand: '#D1056D', dark: '#A80457', soft: 'rgba(209,5,109,.10)', on: '#ffffff' },
    // Óculos Sunrise: manuscrito preto com a armacao rosa, sobre transparente.
    // O rosa do logo (#D875A3) da so 3,0:1 com texto branco — fechado ate 5,0
    // pro botao ser legivel; ao lado do logo a diferenca nao aparece.
    sunrise: { bg: '#FFFFFF', card: '#FFFFFF', line: '#F2E4EC',
               brand: '#A2577A', dark: '#864763', soft: 'rgba(162,87,122,.10)', on: '#ffffff' },
    // For Eyes: logo grafite com armacao magenta, sobre transparente — feito pra
    // fundo claro. O magenta da armacao vira a cor de acao (5,9:1 com branco).
    // For Eyes: a lojista pediu fundo cinza claro, preco rosa e botao cinza
    // escuro. Por isso o `cta` -- e a unica loja que separa a cor do botao da
    // cor da marca.
    foreyes: { bg: '#EDEDEE', card: '#FFFFFF', line: '#E3E3E5',
               brand: '#B2326B', dark: '#8E2755', soft: 'rgba(178,50,107,.10)', on: '#ffffff',
               cta: '#3F4448', ctaDark: '#2E3235', onCta: '#ffffff' },
    // Óptica Ruby: o logo é grafite com o rubi vermelho, feito pra fundo claro.
    // O vermelho da pedra vira a cor de ação, um tom mais fechado pro texto
    // branco ler em cima (5,2 -> 5,9:1).
    ruby: { bg: '#FFFFFF', card: '#FFFFFF', line: '#EFE3E3',
            brand: '#C22125', dark: '#9E1B1E', soft: 'rgba(194,33,37,.10)', on: '#ffffff' },
    // Florão Óculos: creme e dourado, direto do selo deles. O fundo acompanha o
    // creme do anel externo pra a logo nao virar um adesivo colado na pagina; o
    // dourado do botao e mais fechado que o do desenho, senao o texto branco em
    // cima nao le (3,9:1 -> 4,7:1).
    florao: { bg: '#FBF3E8', card: '#FFFFFF', line: '#EADDC7',
              brand: '#956C26', dark: '#7C5A1F', soft: 'rgba(149,108,38,.12)', on: '#ffffff' },
    // Ótica CatGlass: preto e roxo. O logo deles ja vem em fundo preto, entao o
    // catalogo tambem — o selo circular encaixa sem virar quadrado na pagina.
    // Ótica CatGlass: o fundo é o lilás EXATO do logo (#E6C4FF) porque o arquivo
    // é JPEG e carrega esse fundo chapado — em qualquer outro tom ele apareceria
    // como um retângulo colado na página. As letras do logo são pretas, então
    // tema escuro está fora de questão.
    catglass: { bg: '#E6C4FF', card: '#FFFFFF', line: 'rgba(116,15,217,.20)',
                brand: '#740FD9', dark: '#5E0BB0', soft: 'rgba(116,15,217,.10)', on: '#ffffff' },
    // Ótica Paranhos: azul e amarelo, como a Aqui Lentes — mas o azul deles é
    // mais violeta (#283796), então o fundo acompanha esse tom pra não parecer
    // a mesma loja.
    paranhos: { bg: '#151B63', card: '#1D247A', line: 'rgba(254,238,5,.30)',
                brand: '#FEEE05', dark: '#E2D400', soft: 'rgba(254,238,5,.15)', on: '#151B63' },
    // Ótica Stilus Prime: preto e dourado. O logo deles já vem com fundo preto
    // chapado, então o fundo do catálogo é preto puro pra imagem encaixar sem
    // virar um retângulo dentro da página.
    stilus: { bg: '#000000', card: '#0D0D0D', line: 'rgba(212,166,60,.30)',
              brand: '#D4A63C', dark: '#B88C2C', soft: 'rgba(212,166,60,.16)', on: '#000000' },
    // Valter Ótica: o logo é vermelho sobre branco, então o fundo lilás padrão
    // não combina. Vermelho da própria marca, que já passa contraste (7,6:1).
    valterotica: { bg: '#ffffff', card: '#ffffff', line: '#F0E2E1',
                   brand: '#AC0300', dark: '#8A0200', soft: 'rgba(172,3,0,.09)', on: '#ffffff' },
    mvotica: { bg: '#ffffff', card: '#ffffff', line: '#EFE6D2',
               brand: '#8F6D2E', dark: '#75581F', soft: 'rgba(143,109,46,.12)', on: '#ffffff' },
    vyre: { bg: '#08132B', card: '#0E1D3D', line: 'rgba(199,162,74,.28)',
            brand: '#C7A24A', dark: '#A9863A', soft: 'rgba(199,162,74,.16)', on: '#08132B' },
    // Ótica Matheus: o laranja do logo é o #FF7100 puro. Texto do botão vai
    // preto — laranja com branco por cima dá 2,9:1 e some no sol.
    oticamatheus: { bg: '#000000', card: '#0D0D0D', line: 'rgba(255,113,0,.30)',
                    brand: '#FF7100', dark: '#E06200', soft: 'rgba(255,113,0,.15)', on: '#0A0A0A' },
    // Ótica Popular: azul-marinho do logo; o amarelo e o verde ficam só na arte,
    // como no original — viram ruído se usados em botão.
    oticapopular: { bg: '#FFFFFF', card: '#FFFFFF', line: '#E2E8F1',
                    brand: '#184678', dark: '#123353', soft: 'rgba(24,70,120,.10)', on: '#ffffff' },
    // Ótica Moderna: preto e amarelo. O amarelo do logo é #FFFF00 puro — como
    // cor de botão daria 1,07:1 com texto branco, ilegível. Então o preto do
    // logo é que vira a marca, e o amarelo fica no traço e nos realces.
    oticamoderna: { bg: '#FFFFFF', card: '#FFFFFF', line: '#EDE7BC',
                    brand: '#111111', dark: '#000000', soft: 'rgba(255,255,0,.20)', on: '#ffffff' },
    // Ótica Mendonça: o vinho é o fundo EXATO do logo (JPEG, fundo chapado), e o
    // laranja do olho vira o botão. Texto do botão em preto: com branco o
    // laranja dá 2,4:1.
    mendonca: { bg: '#87000E', card: '#9B0714', line: 'rgba(248,147,31,.30)',
                brand: '#F8931F', dark: '#DE7F14', soft: 'rgba(248,147,31,.15)', on: '#111111' },
    // Ótica Goulart: logo preto em traço fino sobre transparente — fundo branco
    // e preto como marca, igual à Ronaldo Óculos.
    goulart: { bg: '#ffffff', card: '#ffffff', line: '#E8E8EA',
               brand: '#111111', dark: '#000000', soft: 'rgba(17,17,17,.07)', on: '#ffffff' },
    // GC Store: o dourado do logo (#C49837) da 2,7:1 com texto branco no botao.
    // Fechei o tom ate 4,6:1 -- ao lado do logo a diferenca nao se nota, a
    // ilegibilidade no sol sim.
    gcstore: { bg: '#ffffff', card: '#ffffff', line: '#EFE4CC',
               brand: '#96701F', dark: '#7C5E1C', soft: 'rgba(196,152,55,.14)', on: '#ffffff' },
    // Otica Millu: o rosa do logo (#E0457F) da 3,8:1 com texto branco. Fechei
    // pra 5,0:1; ao lado do logo a diferenca nao aparece.
    millu: { bg: '#ffffff', card: '#ffffff', line: '#F5DDE8',
             brand: '#C43A72', dark: '#A32E5E', soft: 'rgba(224,69,127,.12)', on: '#ffffff' },
    // Satika: vermelho do logo (#B02828) da 6,6:1 com texto branco — usado puro.
    satika: { bg: '#ffffff', card: '#ffffff', line: '#F0DBDB',
              brand: '#B02828', dark: '#962222', soft: 'rgba(176,40,40,.10)', on: '#ffffff' },
    // Otica Debora: circulo turquesa do logo solto no fundo branco. O turquesa
    // puro (#1AADB7) da 2,7:1 com texto branco; fechei pra #137884 (5,2:1).
    oticadebora: { bg: '#ffffff', card: '#ffffff', line: '#D6ECEF',
                   brand: '#137884', dark: '#0F5F69', soft: 'rgba(26,173,183,.12)', on: '#ffffff' },
    // Ótica Dafflon: logo branco em fundo preto chapado. O catálogo acompanha
    // o preto da arte para o JPEG não aparecer como um retângulo colado.
    dafflon: { bg: '#000000', card: '#101010', line: '#2A2A2A',
               brand: '#FFFFFF', dark: '#D9D9D9', soft: 'rgba(255,255,255,.12)', on: '#000000' },
    // Precision Prime: azul do lettering e fundo cinza claro da própria arte.
    // O catálogo acompanha essa base para o retângulo do logo se integrar à página.
    precisionprime: { bg: '#F3F3F3', card: '#FFFFFF', line: '#DCE4EA',
                      brand: '#2F5F86', dark: '#244A69', soft: 'rgba(47,95,134,.12)', on: '#FFFFFF' },
    // Ótica Social: identidade monocromática sobre fundo transparente.
    oticasocial: { bg: '#FFFFFF', card: '#FFFFFF', line: '#E6E6E6',
                   brand: '#111111', dark: '#000000', soft: 'rgba(17,17,17,.08)', on: '#FFFFFF' },
    // Ótica Visão Solidária: verde-petróleo para manter a leitura do logo em fundo claro.
    visaodf: { bg: '#FFFFFF', card: '#FFFFFF', line: '#D9E9E9',
               brand: '#0B6B6E', dark: '#075356', soft: 'rgba(11,107,110,.10)', on: '#FFFFFF' },
    // Ótica Visualmix: cobre do logo sobre branco, com o botão escurecido para contraste.
    visualmix: { bg: '#FFFFFF', card: '#FFFFFF', line: '#EADDD8',
                  brand: '#7A4030', dark: '#603124', soft: 'rgba(122,64,48,.10)', on: '#FFFFFF' },
    // Studio Visual: vermelho do arco do logo, escurecido no CTA para contraste.
    studiovisual: { bg: '#FFFFFF', card: '#FFFFFF', line: '#F2D7D7',
                    brand: '#C5161D', dark: '#9F1016', soft: 'rgba(197,22,29,.10)', on: '#FFFFFF' },
    // Ótica Rever: azul do lettering sobre fundo transparente e claro.
    rever: { bg: '#FFFFFF', card: '#FFFFFF', line: '#D9E7F7',
             brand: '#0868C9', dark: '#0754A1', soft: 'rgba(8,104,201,.10)', on: '#FFFFFF' },
    bamboo: { bg: '#FFFFFF', card: '#FFFFFF', line: '#E6DADC',
              brand: '#B30B20', dark: '#8E0919', soft: 'rgba(179,11,32,.10)', on: '#FFFFFF' },
    // Sabrina Ótica Design: identidade preta e branca do logo.
    sabrina: { bg: '#FFFFFF', card: '#FFFFFF', line: '#E6E6E6',
               brand: '#1F1B1C', dark: '#000000', soft: 'rgba(31,27,28,.08)', on: '#FFFFFF' },
    // Club dos Óculos: laranja quente do fundo do logo, com CTA mais escuro.
    clubdosoculos: { bg: '#FFF8F0', card: '#FFFFFF', line: '#F0D8BF',
                     brand: '#D96F0C', dark: '#A94E05', soft: 'rgba(217,111,12,.12)', on: '#FFFFFF' },
    // Óptica Santa Efigênia: laranja do logo sobre uma base clara e quente.
    santaefigenia: { bg: '#FFF8F3', card: '#FFFFFF', line: '#F2D8CC',
                     brand: '#F15A24', dark: '#C74316', soft: 'rgba(241,90,36,.11)', on: '#FFFFFF' },
    // Óticas Rufins: amarelo e grafite presentes no logo.
    oticasrufins: { bg: '#FFFDF4', card: '#FFFFFF', line: '#EEE4B8',
                    brand: '#E0B900', dark: '#3F3F43', soft: 'rgba(224,185,0,.13)', on: '#FFFFFF' },
    // Ótica Salvador: turquesa do símbolo com contraste em fundo claro.
    oticasalvador: { bg: '#F5FCFC', card: '#FFFFFF', line: '#CFE9E7',
                     brand: '#55BDB8', dark: '#287F7B', soft: 'rgba(85,189,184,.12)', on: '#FFFFFF' },
    // Ótica Olho D'Gatto: violeta e laranja vibrantes do símbolo.
    olhodgatto: { bg: '#FCF8FF', card: '#FFFFFF', line: '#E8D7F5',
                  brand: '#7A16C7', dark: '#4E0B8A', soft: 'rgba(122,22,199,.11)', on: '#FFFFFF' },
    // Lume Sunglasses: marrom profundo do logo sobre tons quentes e claros.
    lumesunglasses: { bg: '#FFF9F4', card: '#FFFFFF', line: '#EAD9CC',
                      brand: '#54240D', dark: '#321205', soft: 'rgba(84,36,13,.10)', on: '#FFFFFF' },
    // Carola Óculos: grafite monocromático do logo.
    carolaoculos: { bg: '#F8F8F9', card: '#FFFFFF', line: '#DEDEE2',
                    brand: '#414044', dark: '#222124', soft: 'rgba(65,64,68,.09)', on: '#FFFFFF' },
    // Ótica Kadima: azul-marinho e azul vivo presentes na marca.
    oticakadima: { bg: '#F5F9FD', card: '#FFFFFF', line: '#D4E2F0',
                   brand: '#123C70', dark: '#082447', soft: 'rgba(18,60,112,.11)', on: '#FFFFFF' },
    // Óticas Porto: azul profundo do nome com o verde-água do símbolo.
    oticasporto: { bg: '#F4FCFA', card: '#FFFFFF', line: '#CDEBE4',
                   brand: '#111064', dark: '#08073F', soft: 'rgba(45,207,167,.13)', on: '#FFFFFF' }
  };

  // ─────────── Tema ───────────
  // O lojista escolhe 5 cores; as outras (hover, borda, transparencias) saem
  // daqui. Pedir 10 cores a quem so quer "azul e amarelo" nao termina bem.
  function hexRgb(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
    if (!m) return null;
    const n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function escurece(hex, fator) {
    const c = hexRgb(hex);
    if (!c) return hex;
    return '#' + c.map(v => Math.max(0, Math.round(v * (1 - fator)))
      .toString(16).padStart(2, '0')).join('');
  }
  function comAlfa(hex, a) {
    const c = hexRgb(hex);
    return c ? 'rgba(' + c.join(',') + ',' + a + ')' : hex;
  }
  // contraste WCAG: e o que diz se o texto do botao vai ser legivel
  function contraste(a, b) {
    const rel = hex => {
      const c = hexRgb(hex);
      if (!c) return null;
      const l = c.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); });
      return .2126 * l[0] + .7152 * l[1] + .0722 * l[2];
    };
    const x = rel(a), y = rel(b);
    if (x === null || y === null) return null;
    return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
  }

  // Padrao da loja (codigo) + o que o lojista salvou (banco). O banco manda.
  // Cores padrao do app (as mesmas do :root). Servem de base pra loja que nao
  // tem paleta propria no codigo: sem isto, loja nova ficava sem a secao de
  // aparencia justamente por nunca ter sido personalizada.
  const TEMA_PADRAO = { bg: '#f6f4fb', card: '#ffffff', line: '#ece9f1',
                        brand: '#6d3bef', dark: '#4d24bd', soft: '#f1ecfe', on: '#ffffff' };

  function temaEfetivo() {
    const base = ACENTOS[STORE_SLUG] || TEMA_PADRAO;
    const salvo = (storeRow && storeRow.tema) || null;
    const t = Object.assign({}, base, salvo || {});
    if (!t.bg || !t.card || !t.brand) return base;
    // derivados: so recalcula o que o lojista nao definiu explicitamente
    const cta = t.cta || t.brand;
    return {
      bg: t.bg, card: t.card,
      line: t.line || comAlfa(t.brand, .22),
      brand: t.brand,
      dark: t.dark || escurece(t.brand, .18),
      soft: t.soft || comAlfa(t.brand, .12),
      on: t.on || '#ffffff',
      cta: cta,
      ctaDark: t.ctaDark || escurece(cta, .18),
      onCta: t.onCta || t.on || '#ffffff'
    };
  }

  function aplicaTema(cor) {
    const el = document.documentElement;
    const ac0 = temaEfetivo();
    // Quem manda no tema é o FUNDO, não a cor da marca. O vermelho da Valter é
    // escuro, mas o catálogo dela é branco — sem isto entrava o tema escuro e,
    // com ele, borda branca em fundo branco e o logo do rodapé sumindo.
    const lum = luminancia(ac0 ? ac0.bg : cor);
    const escuro = lum !== null && lum < 60;
    el.classList.toggle('tema-escuro', escuro);
    if (escuro) {
      el.style.setProperty('--brand', '#ffffff');
      el.style.setProperty('--brand-dark', '#e6e6e6');
      el.style.setProperty('--brand-soft', 'rgba(255,255,255,.10)');
    } else if (cor) {
      el.style.setProperty('--brand', cor);
    }
    const ac = ac0;
    if (ac) {
      // depois do tema, porque sobrescreve o que ele acabou de definir
      el.style.setProperty('--brand', ac.brand);
      el.style.setProperty('--brand-dark', ac.dark);
      el.style.setProperty('--brand-soft', ac.soft);
      el.style.setProperty('--on-brand', ac.on);
      el.style.setProperty('--bg', ac.bg);
      el.style.setProperty('--card', ac.card);
      el.style.setProperty('--line', ac.line);
      // loja sem `cta` nao define a variavel: o CSS cai no --brand sozinho
      if (ac.cta) {
        el.style.setProperty('--cta', ac.cta);
        el.style.setProperty('--cta-dark', ac.ctaDark || ac.cta);
        el.style.setProperty('--on-cta', ac.onCta || '#ffffff');
      } else {
        // loja que tirou a cor propria do botao volta a seguir a marca
        el.style.removeProperty('--cta');
        el.style.removeProperty('--cta-dark');
        el.style.removeProperty('--on-cta');
      }
      document.body.style.background = ac.bg;
    }
  }

  async function loadCatalog() {
    if (!storeRow) return catalog;
    const rows = await sbGet('pl_catalog_products?store_id=eq.' + storeRow.id +
      '&is_active=eq.true&select=*,pl_catalog_product_images(id,url,is_primary,position,variant_name)' +
      '&order=position.asc,created_at.desc');
    carregou = true;
    catalog = (rows || []).map(r => {
      const imgs = (r.pl_catalog_product_images || [])
        .slice().sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || (a.position || 0) - (b.position || 0));
      const urls = imgs.map(x => x.url).filter(Boolean);
      const cats = normalizaCategorias(Array.isArray(r.categorias_vitrine) && r.categorias_vitrine.length
        ? r.categorias_vitrine : [r.categoria_vitrine]);
      return {
        id: r.id, name: r.name, price: Number(r.price),
        originalPrice: r.original_price == null ? null : Number(r.original_price), img: urls[0] || '',
        imgs: urls,                       // a galeria e as referências da prova saem daqui
        imgIds: imgs.map(x => x.id).filter(Boolean),   // quais apagar quando trocar a foto
        imageMeta: imgs.map(x => ({ id: x.id, url: x.url, variantName: (x.variant_name || '').trim() })),
        desc: r.description || '',
        cat: cats[0] || '',                 // compatibilidade com caches e links antigos
        cats: cats,                         // o produto pode aparecer em varias categorias
        parcelas: Number(r.parcelas) || 0,
        installmentInterestRate: Number(r.installment_interest_rate) || 0,
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
      if (!storeRow) return;
      await loadCatalog();
      renderStore(); renderCatalog();
      aplicaPermissoes();   // owner_email so chega com a loja carregada
      atualizaLimite();     // o whatsapp da loja (CTA do limite) so chega agora
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
        img.decoding = 'async';
        const u = URL.createObjectURL(file);
        img.onload = function () {
          URL.revokeObjectURL(u);
          const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
          if (!w || !h) { resolve(null); return; }
          const sc = Math.min(1, MAX_UPLOAD_PX / Math.max(w, h));
          const c = document.createElement('canvas');
          c.width = Math.round(w * sc); c.height = Math.round(h * sc);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          c.toBlob(blob => {
            if (!blob) { resolve(null); return; }
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || '').split(',')[1] || null);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
          }, 'image/jpeg', JPEG_QUALITY);
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
    // sair do produto tira o ?p= da URL: senão o lojista copia da barra achando
    // que é o link do catálogo e manda o cliente pra um modelo só
    if (name === 'catalog' && new URLSearchParams(location.search).get('p')) {
      try { history.pushState({}, '', linkCategoria(catFiltro)); } catch (e) {}
    }
    $$('.screen').forEach(s => s.classList.toggle('active', s.dataset.screen === name));
    document.getElementById('app').scrollTop = 0;
    window.scrollTo(0, 0);
  }

  // ─────────── Catálogo ───────────
  function renderStore() {
    const ss = $('#s-store'); if (ss) ss.textContent = STORE.name;
  }
  // Categoria escolhida no filtro ('' = todas). Não vai pro localStorage de
  // propósito: quem volta ao catálogo espera ver a vitrine inteira.
  let catFiltro = '';
  let buscaProduto = '';
  let adminCategoriasSelecionadas = [];

  function textoBusca(valor) {
    return String(valor || '').trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function normalizaCategorias(valores) {
    const saida = [];
    (Array.isArray(valores) ? valores : []).forEach(valor => {
      const nome = String(valor || '').trim().replace(/\s+/g, ' ').slice(0, 50);
      if (!nome || saida.some(x => x.localeCompare(nome, 'pt-BR', { sensitivity: 'base' }) === 0)) return;
      if (saida.length < 20) saida.push(nome);
    });
    return saida;
  }

  function produtoTemCategoria(produto, categoria) {
    const cats = produto.cats && produto.cats.length ? produto.cats : [produto.cat];
    return cats.some(c => String(c).localeCompare(categoria, 'pt-BR', { sensitivity: 'base' }) === 0);
  }

  function categoriasDaLoja() {
    const vistas = normalizaCategorias(catalog.flatMap(p => p.cats && p.cats.length ? p.cats : [p.cat]));
    const salvas = normalizaCategorias(storeRow && storeRow.categorias_ordem);
    const ordenadas = [];
    salvas.forEach(nome => {
      const real = vistas.find(c => c.localeCompare(nome, 'pt-BR', { sensitivity: 'base' }) === 0);
      if (real && ordenadas.indexOf(real) === -1) ordenadas.push(real);
    });
    vistas.filter(c => ordenadas.indexOf(c) === -1)
      .sort((a, b) => a.localeCompare(b, 'pt-BR')).forEach(c => ordenadas.push(c));
    return ordenadas;
  }

  function renderFiltros() {
    const box = $('#cat-filtros');
    if (!box) return;
    const cats = categoriasDaLoja();
    // uma categoria só não é filtro: não há o que separar
    if (cats.length < 2) { box.hidden = true; box.textContent = ''; return; }
    if (cats.indexOf(catFiltro) === -1) catFiltro = '';
    box.hidden = false;
    box.textContent = '';
    [''].concat(cats).forEach(c => {
      const b = document.createElement('button');
      b.className = 'cat-chip' + (c === catFiltro ? ' sel' : '');
      b.textContent = c || 'Todos';
      b.addEventListener('click', () => {
        catFiltro = c;
        try { history.pushState({ cat: c }, '', linkCategoria(c)); } catch (e) {}
        renderCatalog();
      });
      box.appendChild(b);
    });
  }

  function renderCatalog() {
    const grid = $('#catalog-grid');
    grid.innerHTML = '';
    const termo = textoBusca(buscaProduto);
    const visiveis = catalog.filter(p =>
      (!catFiltro || produtoTemCategoria(p, catFiltro)) &&
      (!termo || textoBusca(p.name).includes(termo))
    );
    visiveis.forEach(p => {
      // DOM seguro: nome do produto vem do lojista, nunca concatenar em HTML.
      const card = document.createElement('div');
      card.className = 'prod-card';
      const thumb = document.createElement('img');
      thumb.className = 'thumb'; thumb.alt = '';
      const body = document.createElement('div'); body.className = 'pc-body';
      const nome = document.createElement('div'); nome.className = 'pc-name'; nome.textContent = p.name;
      const precos = document.createElement('div'); precos.className = 'pc-prices';
      if (temOferta(p)) {
        const original = document.createElement('span'); original.className = 'pc-old-price'; original.textContent = precoOriginalTxt(p);
        precos.appendChild(original);
      }
      const preco = document.createElement('span'); preco.className = 'pc-price' + (temOferta(p) ? ' offer' : ''); preco.textContent = precoAtualTxt(p);
      precos.appendChild(preco);
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'pc-try'; btn.textContent = 'Provar virtualmente';
      body.append(nome, precos, btn);
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
    // "Seu catálogo está vazio" só depois que o servidor respondeu: antes disso
    // não se sabe se está vazio ou ainda carregando.
    const vazio = $('#catalog-empty');
    const buscaBox = $('#catalog-search');
    const buscaVazia = $('#catalog-search-empty');
    if (!catalog.length && !carregou) {
      for (let i = 0; i < 4; i++) {
        const sk = document.createElement('div');
        sk.className = 'prod-card esqueleto';
        sk.appendChild(document.createElement('div')).className = 'thumb';
        grid.appendChild(sk);
      }
    }
    if (vazio) vazio.hidden = !(carregou && catalog.length === 0);
    if (buscaBox) buscaBox.hidden = !catalog.length;
    if (buscaVazia) buscaVazia.hidden = !(carregou && catalog.length > 0 && visiveis.length === 0);
    grid.hidden = carregou && (catalog.length === 0 || visiveis.length === 0);
    // um só ponto redesenha chips e sugestões: quem chama renderCatalog não
    // precisa lembrar de nada
    renderFiltros();
    renderSugestoesCategoria();
    renderLinksCategoria();
  }

  {
    const campoBusca = $('#catalog-search-input');
    if (campoBusca) campoBusca.addEventListener('input', () => {
      buscaProduto = campoBusca.value;
      renderCatalog();
    });
  }

  // ─────────── Aparência (painel do lojista) ───────────
  const CAMPOS_TEMA = [['#tema-bg', 'bg'], ['#tema-card', 'card'], ['#tema-brand', 'brand'],
                       ['#tema-cta', 'cta'], ['#tema-oncta', 'onCta']];

  function temaDosCampos() {
    const t = {};
    CAMPOS_TEMA.forEach(([sel, chave]) => {
      const el = $(sel);
      if (el && el.value) t[chave] = el.value;
    });
    return t;
  }

  // Preenche os seletores com o que está valendo hoje.
  function renderTema() {
    const box = $('#tema-box');
    if (!box) return;
    const t = temaEfetivo();
    if (!t) { box.hidden = true; return; }
    box.hidden = false;
    CAMPOS_TEMA.forEach(([sel, chave]) => {
      const el = $(sel);
      if (el && t[chave]) el.value = t[chave];
    });
    avisaContraste();
  }

  // Aviso, não bloqueio: a decisão é do lojista. Mas texto claro em botão claro
  // é o erro que mais aparece, e no celular sob sol vira botão invisível.
  function avisaContraste() {
    const av = $('#tema-alerta');
    if (!av) return;
    const t = temaDosCampos();
    const problemas = [];
    const cBotao = contraste(t.cta, t.onCta);
    if (cBotao !== null && cBotao < 4.5)
      problemas.push('o texto do botão quase some no fundo dele' +
                     ' (' + cBotao.toFixed(1) + ':1, o mínimo legível é 4,5:1)');
    const cPreco = contraste(t.brand, t.card);
    if (cPreco !== null && cPreco < 3)
      problemas.push('o preço fica difícil de ler sobre o cartão (' + cPreco.toFixed(1) + ':1)');
    av.hidden = problemas.length === 0;
    av.textContent = problemas.length ? 'Atenção: ' + problemas.join('; ') + '.' : '';
  }

  // Prévia ao vivo: pinta a tela inteira sem salvar nada.
  function previaTema() {
    const el = document.documentElement;
    const t = temaDosCampos();
    const cheio = Object.assign({}, temaEfetivo() || {}, t);
    el.style.setProperty('--bg', cheio.bg);
    el.style.setProperty('--card', cheio.card);
    el.style.setProperty('--brand', cheio.brand);
    el.style.setProperty('--brand-dark', escurece(cheio.brand, .18));
    el.style.setProperty('--brand-soft', comAlfa(cheio.brand, .12));
    el.style.setProperty('--line', comAlfa(cheio.brand, .22));
    el.style.setProperty('--cta', cheio.cta);
    el.style.setProperty('--cta-dark', escurece(cheio.cta, .18));
    el.style.setProperty('--on-cta', cheio.onCta);
    document.body.style.background = cheio.bg;
    // fundo escuro troca o tema inteiro, senão borda branca some em branco
    const l = luminancia(cheio.bg);
    el.classList.toggle('tema-escuro', l !== null && l < 60);
    avisaContraste();
  }

  CAMPOS_TEMA.forEach(([sel]) => {
    const el = $(sel);
    if (el) el.addEventListener('input', previaTema);
  });

  {
    const bs = $('#btn-tema-salvar');
    if (bs) bs.addEventListener('click', async () => {
      const txt = bs.textContent;
      bs.disabled = true; bs.textContent = 'Salvando…';
      try {
        const tema = temaDosCampos();
        const r = await fetch(WH_THEME, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ store_slug: STORE_SLUG, tema })
        });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        if (storeRow) storeRow.tema = tema;
        aplicaTema(storeRow && storeRow.primary_color);
        toast('Aparência salva ✓');
      } catch (e) {
        console.warn('[Provou Catálogo] erro ao salvar tema:', e);
        toast('Não consegui salvar. Tente de novo.');
      } finally {
        bs.disabled = false; bs.textContent = txt;
      }
    });

    const br = $('#btn-tema-reset');
    if (br) br.addEventListener('click', async () => {
      const txt = br.textContent;
      br.disabled = true; br.textContent = 'Restaurando…';
      try {
        const r = await fetch(WH_THEME, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ store_slug: STORE_SLUG, tema: null })
        });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        if (storeRow) storeRow.tema = null;
        aplicaTema(storeRow && storeRow.primary_color);
        renderTema();
        toast('Aparência restaurada ✓');
      } catch (e) {
        console.warn('[Provou Catálogo] erro ao restaurar tema:', e);
        toast('Não consegui restaurar. Tente de novo.');
      } finally {
        br.disabled = false; br.textContent = txt;
      }
    });
  }

  function renderLinksCategoria() {
    const box = $('#cat-links'), lista = $('#cat-links-lista');
    if (!box || !lista) return;
    const cats = categoriasDaLoja();
    box.hidden = cats.length === 0;
    lista.textContent = '';
    cats.forEach(c => {
      const item = document.createElement('div'); item.className = 'cat-link-item';
      const nome = document.createElement('span'); nome.className = 'cat-link-nome'; nome.textContent = c;
      const qtd = document.createElement('span'); qtd.className = 'cat-link-qtd';
      const n = catalog.filter(x => produtoTemCategoria(x, c)).length;
      qtd.textContent = n + (n > 1 ? ' produtos' : ' produto');
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'cat-link-btn';
      btn.title = 'Copiar link de ' + c;
      btn.setAttribute('aria-label', 'Copiar link da categoria ' + c);
      const tpl = $('#tpl-link');
      if (tpl) btn.appendChild(tpl.content.cloneNode(true)); else btn.textContent = '🔗';
      btn.addEventListener('click', async () => {
        const url = linkCategoria(c);
        try { await navigator.clipboard.writeText(url); toast('Link copiado ✓'); }
        catch (e) {
          const i = document.createElement('input');
          i.value = url; document.body.appendChild(i); i.select();
          try { document.execCommand('copy'); toast('Link copiado ✓'); }
          catch (_) { toast('Copie: ' + url); }
          i.remove();
        }
      });
      item.append(nome, qtd, btn);
      lista.appendChild(item);
    });
  }

  function renderAdminCategorias() {
    const box = $('#admin-categorias-opcoes');
    if (!box) return;
    const disponiveis = normalizaCategorias(categoriasDaLoja().concat(adminCategoriasSelecionadas));
    box.textContent = '';
    if (!disponiveis.length) {
      const vazio = document.createElement('span');
      vazio.className = 'admin-categorias-vazio';
      vazio.textContent = 'Nenhuma categoria criada ainda.';
      box.appendChild(vazio);
      return;
    }
    disponiveis.forEach(categoria => {
      const selecionada = adminCategoriasSelecionadas.some(c => c.localeCompare(categoria, 'pt-BR', { sensitivity: 'base' }) === 0);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'admin-cat-chip' + (selecionada ? ' sel' : '');
      btn.textContent = categoria;
      btn.setAttribute('aria-pressed', selecionada ? 'true' : 'false');
      btn.addEventListener('click', () => {
        if (selecionada) adminCategoriasSelecionadas = adminCategoriasSelecionadas.filter(c => c.localeCompare(categoria, 'pt-BR', { sensitivity: 'base' }) !== 0);
        else adminCategoriasSelecionadas = normalizaCategorias(adminCategoriasSelecionadas.concat(categoria));
        renderAdminCategorias();
      });
      box.appendChild(btn);
    });
  }

  function adicionaCategoriaDigitada() {
    const campo = $('#admin-categoria');
    const nome = String(campo && campo.value || '').trim();
    if (!nome) return;
    adminCategoriasSelecionadas = normalizaCategorias(adminCategoriasSelecionadas.concat(nome));
    campo.value = '';
    renderAdminCategorias();
  }

  {
    const btn = $('#btn-add-categoria');
    if (btn) btn.addEventListener('click', adicionaCategoriaDigitada);
    const campo = $('#admin-categoria');
    if (campo) campo.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); adicionaCategoriaDigitada(); }
    });
  }

  function renderOrdemCategorias() {
    const box = $('#cat-order'), lista = $('#cat-order-lista');
    if (!box || !lista) return;
    const cats = categoriasDaLoja();
    box.hidden = cats.length < 2;
    lista.textContent = '';
    cats.forEach((categoria, indice) => {
      const linha = document.createElement('div');
      linha.className = 'cat-order-item';
      const nome = document.createElement('span');
      nome.textContent = categoria;
      const cima = document.createElement('button');
      cima.type = 'button'; cima.className = 'cat-order-btn'; cima.textContent = '↑'; cima.title = 'Mover para cima'; cima.disabled = indice === 0;
      const baixo = document.createElement('button');
      baixo.type = 'button'; baixo.className = 'cat-order-btn'; baixo.textContent = '↓'; baixo.title = 'Mover para baixo'; baixo.disabled = indice === cats.length - 1;
      const mover = direcao => {
        const ordem = cats.slice();
        const destino = indice + direcao;
        [ordem[indice], ordem[destino]] = [ordem[destino], ordem[indice]];
        if (storeRow) storeRow.categorias_ordem = ordem;
        renderOrdemCategorias(); renderFiltros(); renderLinksCategoria();
      };
      cima.addEventListener('click', () => mover(-1));
      baixo.addEventListener('click', () => mover(1));
      linha.append(nome, cima, baixo);
      lista.appendChild(linha);
    });
  }

  {
    const salvar = $('#btn-save-cat-order');
    if (salvar) salvar.addEventListener('click', async () => {
      const texto = salvar.textContent;
      salvar.disabled = true; salvar.textContent = 'Salvando…';
      try {
        const ordem = categoriasDaLoja();
        const r = await fetch(WH_THEME, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ store_slug: STORE_SLUG, categorias_ordem: ordem })
        });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        if (storeRow) storeRow.categorias_ordem = ordem;
        toast('Ordem das categorias salva ✓');
      } catch (e) {
        console.warn('[Provou Catálogo] erro ao salvar categorias:', e);
        toast('Não consegui salvar a ordem. Tente de novo.');
      } finally {
        salvar.disabled = false; salvar.textContent = texto;
      }
    });
  }

  // Atualiza as categorias disponíveis no cadastro e a área de ordenação.
  function renderSugestoesCategoria() {
    renderAdminCategorias();
    renderOrdemCategorias();
  }

  // Abre a prova virtual já com o produto escolhido
  function startTryOn(p) {
    openProduct(p);       // popula os dados do produto nas telas seguintes
    resetUploader();
    show('tryon');
  }

  // ─────────── Produto ───────────
  // Cada foto pode representar uma cor/variação. Produtos antigos, sem nomes,
  // continuam usando a galeria simples que já existia.
  function montaMiniaturas(p) {
    const box = $('#p-thumbs');
    if (!box) return;
    box.textContent = '';
    const fotos = (p.imgs && p.imgs.length ? p.imgs : [p.img]).filter(Boolean);
    const meta = (p.imageMeta && p.imageMeta.length ? p.imageMeta : fotos.map(u => ({ url: u, variantName: '' })));
    const temVariacoes = meta.some(x => x.variantName);
    const titulo = $('#p-variant-title');
    if (titulo) titulo.hidden = !temVariacoes;
    box.classList.toggle('com-variacoes', temVariacoes);
    box.hidden = fotos.length < 2 && !temVariacoes;
    if (box.hidden) return;
    fotos.forEach((u, i) => {
      const t = document.createElement('button');
      t.type = 'button';
      t.className = 'p-thumb';
      const img = document.createElement('img');
      img.alt = (meta[i] && meta[i].variantName) || '';
      bindImg(img, u, p.name);
      t.appendChild(img);
      if (temVariacoes) {
        const nome = document.createElement('span');
        nome.textContent = (meta[i] && meta[i].variantName) || ('Foto ' + (i + 1));
        t.appendChild(nome);
      }
      if (i === 0) t.classList.add('sel');
      t.addEventListener('click', () => {
        fotoSel = i;   // a prova respeita a foto escolhida (ex.: outra cor do modelo)
        bindImg($('#p-img'), u, p.name);
        box.querySelectorAll('.p-thumb').forEach(x => x.classList.remove('sel'));
        t.classList.add('sel');
      });
      box.appendChild(t);
    });
  }

  // Link de UM produto: o lojista manda direto pro cliente e ele cai na página
  // daquele modelo, não no catálogo inteiro. É só isso que o `p` na URL faz.
  function linkProduto(prod) {
    return location.origin + location.pathname +
      '?loja=' + encodeURIComponent(STORE_SLUG) + '&p=' + encodeURIComponent(prod.id);
  }

  // Link de UMA categoria: o lojista manda "so os femininos" pra quem pediu
  // isso, em vez do catalogo inteiro.
  function linkCategoria(cat) {
    const base = location.origin + location.pathname + '?loja=' + encodeURIComponent(STORE_SLUG);
    return cat ? base + '&cat=' + encodeURIComponent(cat) : base;
  }

  function openProduct(p, semHistorico) {
    current = p;
    fotoSel = 0;   // produto novo, galeria volta pra primeira foto
    bindImg($('#p-img'), p.img, p.name);
    $('#p-name').textContent = p.name;
    const precoOriginal = $('#p-old-price');
    precoOriginal.textContent = precoOriginalTxt(p);
    precoOriginal.hidden = !precoOriginal.textContent;
    $('#p-price').textContent = precoAtualTxt(p);
    $('#p-price').classList.toggle('offer', temOferta(p));
    // sem parcelamento informado o campo some, em vez de anunciar 12x que a
    // loja talvez não pratique
    const par = Number(p.parcelas) || 0;
    const juros = Number(p.installmentInterestRate) || 0;
    $('#p-install').textContent = par > 1 ? 'ou até ' + par + 'x de ' + brl(valorParcela(p, par)) +
                                  (juros ? ' com ' + String(juros).replace('.', ',') + '% de juros por parcela' : ' sem juros')
                                : (par === 1 ? 'à vista' : '');
    $('#p-desc').textContent = p.desc || '';
    montaMiniaturas(p);
    show('product');
    // troca a URL sem recarregar, pra quem chegou pelo catálogo poder copiar da
    // barra de endereço e o "voltar" do navegador funcionar
    if (!semHistorico) {
      try { history.pushState({ p: p.id }, '', linkProduto(p)); } catch (e) {}
    }
  }

  // voltar do navegador: sai do produto pro catálogo em vez de sair do site
  window.addEventListener('popstate', ev => {
    const id = ev.state && ev.state.p;
    const prod = id && catalog.find(x => String(x.id) === String(id));
    if (prod) { openProduct(prod, true); return; }
    catFiltro = achaCategoria(new URLSearchParams(location.search).get('cat'));
    renderCatalog();
    show('catalog');
  });

  // Casa o que veio na URL com o que a loja tem, sem exigir acento e caixa
  // identicos: link com "feminino" tem que achar a categoria "Feminino".
  function achaCategoria(bruta) {
    if (!bruta) return '';
    const norm = t => String(t).trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const alvo = norm(bruta);
    return categoriasDaLoja().find(c => norm(c) === alvo) || '';
  }

  // ─────────── Try-on: upload ───────────
  function resetUploader() {
    userPhoto = '';
    $('#uploader-preview').hidden = true;
    $('#uploader-empty').style.display = '';
    $('#btn-generate').disabled = true;
    $('#photo-input').value = '';
    const g = $('#photo-gallery'); if (g) g.value = '';
    // O telefone continua digitado entre uma prova e outra, então o saldo tem
    // que ser repintado toda vez que a tela abre — inclusive na 4a tentativa.
    atualizaLimite();
    agendaConsultaLimite();
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
  // O NOME manda quando ele diz "óculos". A coluna `categoria` tem default
  // 'roupa' no banco e o cadastro não pergunta nada, então confiar nela primeiro
  // mandava "Óculos de sol Alcázar" pro gerador de ROUPA — que não põe armação
  // no rosto. Só quando o texto não decide é que o valor gravado vale.
  const RE_OCULOS = /[óo]culos|armaç|armac|lente|solar|clip[- ]?on|de grau/i;
  // Deduzir pelo nome não basta: a For Eyes batizou os 45 produtos dela de
  // "Britney C2", "Madona Bordô", "Hexagonal Prata" — nenhum diz "óculos", e os
  // 45 foram parar no gerador de ROUPA, que vestia o cliente em vez de pôr a
  // armação no rosto. Toda loja do catálogo hoje é ótica, então o padrão é
  // óculos e a exceção é declarada. Quando entrar uma loja de roupa, o slug
  // dela entra aqui — até existir coluna de categoria na loja (é DDL).
  const LOJAS_ROUPA = ['lojateste', 'provoulevou'];
  function categoriaDe(row) {
    const t = ((row && row.name) || '') + ' ' + ((row && row.description) || '');
    if (RE_OCULOS.test(t)) return 'oculos';
    const c = String(row && row.categoria || '').toLowerCase().trim();
    if (c === 'oculos' || c === 'óculos') return 'oculos';
    if (c === 'roupa' && LOJAS_ROUPA.indexOf(STORE_SLUG) === -1) return 'oculos';
    return 'roupa';
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

  // ─────────── Limite de provas por cliente ───────────
  // Quem conta de verdade é o BANCO: pl_catalog_check_limit(slug, telefone)
  // devolve quantas provas aquele WhatsApp já fez nesta loja hoje. É uma função
  // SECURITY DEFINER que responde só CONTAGEM, então a chave ANON pode chamar
  // sem abrir geracoes_provou_levou (que continua fechada).
  //
  // O localStorage abaixo não sumiu: ele cobre a janela entre gerar a prova e o
  // servidor contá-la, e mantém o limite de pé quando a rede cai no meio. Onde
  // os dois discordam, vale o MAIOR — saldo a mais é prova que o lojista paga.
  function provasKey() { return PROVAS_KEY + ':' + STORE_SLUG; }
  // Data LOCAL do aparelho: toISOString() é UTC e viraria o dia às 21h no Brasil.
  function hojeStr() {
    const d = new Date();
    const p = n => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }
  function lerProvas() {
    let o = null;
    try { o = JSON.parse(localStorage.getItem(provasKey()) || 'null'); } catch (e) {}
    if (!o || typeof o !== 'object' || o.dia !== hojeStr() || !o.tel || typeof o.tel !== 'object') {
      o = { dia: hojeStr(), tel: {} };   // virou o dia (ou nunca existiu): zera
    }
    return o;
  }
  function salvarProvas(o) {
    try { localStorage.setItem(provasKey(), JSON.stringify(o)); } catch (e) {}
  }
  function provasLocais(tel) {
    if (!tel) return 0;
    return Number(lerProvas().tel[tel]) || 0;
  }

  // O contador do navegador é a marca d'água do dia: ele SÓ SOBE, e a resposta
  // do banco o empurra pra cima quando vem maior. Nunca puxa pra baixo — o
  // banco pode responder antes de gravar a prova que acabou de sair, e aceitar
  // esse número devolveria ao cliente uma prova que ele já usou.
  function absorveServidor(tel, usadas) {
    if (!tel || !(usadas > provasLocais(tel))) return;
    const o = lerProvas();
    o.tel[tel] = usadas;
    salvarProvas(o);
  }
  function provasUsadas(tel) { return provasLocais(tel); }
  function provasRestantes(tel) { return Math.max(0, MAX_PROVAS_DIA - provasUsadas(tel)); }

  // Pergunta ao banco. Devolve o número de provas usadas, ou null se não deu
  // pra saber (rede fora, função ausente) — null NÃO é zero.
  async function consultaServidor(tel) {
    if (!tel) return null;
    try {
      const r = await fetch(SB_URL + '/rest/v1/rpc/pl_catalog_check_limit', {
        method: 'POST',
        headers: { apikey: SB_ANON, Authorization: 'Bearer ' + SB_ANON, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_slug: STORE_SLUG, p_phone: tel, p_limite: MAX_PROVAS_DIA })
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const d = await r.json();
      // Telefone/loja que a função não reconheceu não zera o contador local.
      if (!d || d.erro) return null;
      // franquia definida no banco (por loja) vence a constante local.
      // ilimitado=true (limite_diario NULL na loja) = sem teto — Satika foi a 1ª.
      if (d.ilimitado === true) MAX_PROVAS_DIA = Infinity;
      else if (Number(d.limite) > 0) MAX_PROVAS_DIA = Number(d.limite);
      // o servidor tambem conta por IP: trocar um digito do telefone nao zera
      const usadas = Math.max(Number(d.usadas) || 0, Number(d.ip_usadas) || 0);
      absorveServidor(tel, usadas);
      return usadas;
    } catch (e) {
      console.warn('[Provou Catálogo] check de limite indisponível:', e);
      return null;
    }
  }

  // Consulta em segundo plano enquanto o cliente digita, pra que o saldo na
  // tela já esteja certo antes de ele mandar a foto.
  let _limiteDebounce, _ultimoTelConsultado = '';
  function agendaConsultaLimite() {
    const tel = telAtual();
    if (!tel || tel === _ultimoTelConsultado) return;
    clearTimeout(_limiteDebounce);
    _limiteDebounce = setTimeout(async () => {
      _ultimoTelConsultado = tel;
      const usadas = await consultaServidor(tel);
      if (usadas === null) { _ultimoTelConsultado = ''; return; }   // deu erro: tenta de novo depois
      if (telAtual() === tel) atualizaBotaoProvar();                // o campo pode ter mudado no meio
    }, 500);
  }
  function registraProva(tel) {
    if (!tel) return;
    const o = lerProvas();
    o.tel[tel] = (Number(o.tel[tel]) || 0) + 1;
    salvarProvas(o);
    _ultimoTelConsultado = '';   // o banco tem uma prova a mais: vale perguntar de novo
  }
  // O servidor recusou por limite: zera o saldo deste número aqui também, senão
  // a tela continua oferecendo provas que o gerador não vai entregar.
  function marcaLimite(tel) {
    if (!tel || !isFinite(MAX_PROVAS_DIA)) return;
    const o = lerProvas();
    o.tel[tel] = MAX_PROVAS_DIA;
    salvarProvas(o);
    _ultimoTelConsultado = '';
  }

  // Telefone do campo, no formato usado como chave (55 + DDD + número).
  // Só devolve algo quando o número está completo — número pela metade não é
  // cliente identificado, e contar por ele daria saldo grátis a cada dígito.
  function telAtual() {
    const n = soDigitos($('#phone-input') && $('#phone-input').value);
    if (n.length < 10 || n.length > 11) return '';
    return '55' + n;
  }

  // Mostra saldo/limite e devolve se o cliente ainda pode provar.
  function atualizaLimite() {
    const tel = telAtual();
    const msg = $('#provas-restantes');
    const box = $('#limite-box');
    const btnW = $('#btn-limite-whats');
    const restantes = tel ? provasRestantes(tel) : MAX_PROVAS_DIA;
    const bloqueado = !!tel && restantes <= 0;

    if (msg) {
      // loja sem teto: não há saldo a mostrar (Infinity no texto assustaria)
      if (tel && !bloqueado && isFinite(restantes)) {
        msg.textContent = restantes + (restantes === 1 ? ' prova restante hoje' : ' provas restantes hoje');
        msg.classList.toggle('is-warn', restantes === 1);
        msg.hidden = false;
      } else {
        msg.textContent = '';
        msg.classList.remove('is-warn');
        msg.hidden = true;
      }
    }
    if (box) {
      box.hidden = !bloqueado;
      const tit = $('#limite-titulo');
      if (tit) tit.textContent = 'Você já usou ' + provasTxt();
      const t = $('#limite-texto');
      if (t) {
        t.textContent = 'Volte amanhã para provar outras peças' +
          (temWhatsappLoja() ? ' — ou chame a loja para tirar dúvidas.' : '.');
      }
      if (btnW) btnW.hidden = !temWhatsappLoja();
    }
    return !bloqueado;
  }

  function temWhatsappLoja() {
    return !!String((storeRow && storeRow.whatsapp) || '').replace(/\D/g, '');
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

  // Tela de limite: repinta, avisa e leva o olho até o aviso.
  function mostraLimite() {
    atualizaBotaoProvar();
    toast('Você já usou ' + provasTxt());
    const box = $('#limite-box');
    if (box && box.scrollIntoView) { try { box.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {} }
  }

  async function runGeneration() {
    if (_gerando) return;               // trava contra clique duplo (custa prova e dinheiro)
    const tel = soDigitos($('#phone-input') && $('#phone-input').value);
    if (!telefoneValido(tel)) { $('#phone-input').focus(); return; }
    if (!userPhoto) return;
    const telKey = '55' + tel;
    // Trava antes de gastar geração: o cliente já usou as 3 provas do dia.
    if (!atualizaLimite()) { mostraLimite(); return; }

    // Marca ANTES do await: o check no banco leva uns milissegundos, e sem isso
    // dois cliques rápidos passavam os dois pela verificação.
    _gerando = true;
    try {
      // Palavra final é do banco — este navegador pode ter sido limpo.
      // Se ele não responder, segue com a contagem local: rede caída não pode
      // impedir de provar quem ainda tem saldo.
      await consultaServidor(telKey);
      if (provasUsadas(telKey) >= MAX_PROVAS_DIA) { mostraLimite(); return; }

      // O catálogo renderiza do cache do localStorage, então a tela funciona mesmo
      // quando a leitura da loja falha — e aí storeRow fica nulo e a prova morria com
      // "loja sem chave". Antes de desistir, tenta buscar a loja de novo.
      let chave = storeRow && storeRow.store_api_key;
      if (!chave) {
        try { await loadStore(); } catch (e) {}
        chave = storeRow && storeRow.store_api_key;
      }
      if (!chave) { toast('Não consegui falar com o servidor. Tente de novo.'); return; }
      await geraProva(tel, chave);
    } finally {
      _gerando = false;
      atualizaBotaoProvar();   // repinta saldo/limite com a contagem já atualizada
    }
  }

  async function geraProva(tel, chave) {
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
      // Vai SÓ a foto que o cliente deixou selecionada na galeria. No catálogo as
      // fotos do mesmo produto costumam ser CORES diferentes (caso For Eyes), e
      // mandar as outras como referência fazia a IA misturar as cores na prova.
      const prodBlob = await fetch(fotoAtual() || current.img).then(r => r.blob());
      fd.append('product_image', prodBlob, 'produto.jpg');
      fd.append('whatsapp', '55' + tel);
      fd.append('phone_raw', $('#phone-input').value);
      fd.append('product_name', nomeProdutoAtual());
      fd.append('product_type', cat);
      fd.append('api_key', chave);
      // Sem isto toda prova de catálogo grava origin 'https://provoulevou.com.br',
      // igual pra todas as lojas — impossível saber de quem cobrar depois.
      fd.append('catalog_slug', STORE_SLUG);
      if (storeRow && storeRow.id) fd.append('catalog_store_id', storeRow.id);
      if (current && current.id) fd.append('catalog_product_id', current.id);

      const res = await fetch(url, { method: 'POST', body: fd });
      const ct = res.headers.get('content-type') || '';

      if (!ct.startsWith('image/')) {
        // limite diario e chave invalida voltam como JSON, nao como imagem
        let msg = 'Não consegui gerar sua prova agora. Tente de novo em instantes.';
        try {
          const j = await res.json();
          if (j.error === 'limite_diario' || j.error === 'limite_atingido' || j.limited) {
            msg = 'Você já usou suas provas de hoje. Volte amanhã!';
            marcaLimite('55' + tel);   // o servidor mandou parar: a tela para também
          }
        } catch (e) {}
        throw new Error(msg);
      }

      const blob = await res.blob();
      // Só conta o que o gerador entregou: prova que falhou não foi usada.
      registraProva('55' + tel);
      clearInterval(iv); bar.style.width = '100%';
      showResult(URL.createObjectURL(blob));
    } catch (e) {
      clearInterval(iv);
      toast((e && e.message) || 'Não consegui gerar sua prova agora.');
      show('tryon');
    }
  }

  function showResult(urlProva) {
    const img = $('#result-img');
    img.onerror = null;
    img.src = urlProva || userPhoto || fallbackSvg('Sua prova');
    bindImg($('#result-thumb'), fotoAtual() || current.img, current.name);
    $('#result-name').textContent = nomeProdutoAtual();
    const precoOriginal = $('#result-old-price');
    precoOriginal.textContent = precoOriginalTxt(current);
    precoOriginal.hidden = !precoOriginal.textContent;
    $('#result-price').textContent = precoAtualTxt(current);
    $('#result-price').classList.toggle('offer', temOferta(current));
    show('result');
  }

  // ─────────── Checkout ───────────
  function openCheckout() {
    bindImg($('#co-thumb'), fotoAtual() || current.img, current.name);
    $('#co-name').textContent = nomeProdutoAtual();
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
    const max = Math.max(1, Number(current.parcelas) || 1);
    const juros = Number(current.installmentInterestRate) || 0;
    for (let n = 1; n <= max; n++) {
      const opt = document.createElement('option');
      opt.value = n;
      opt.textContent = n + 'x de ' + brl(valorParcela(current, n)) +
        (n === 1 ? ' à vista' : (juros ? ' com juros' : ' sem juros'));
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
  $('#f-install').addEventListener('change', e => {
    const n = Math.max(1, Number(e.target.value) || 1);
    $('#card-amount').textContent = brl(valorParcela(current, n) * n);
  });
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
    bindImg($('#s-thumb'), fotoAtual() || current.img, current.name);
    $('#s-name').textContent = nomeProdutoAtual();
    $('#s-price').textContent = brl(current.price);
    $('#s-pay').textContent = payLabel;
    show('success');
  }

  // ─────────── Admin (lojista) ───────────
  let adminPhoto = '';
  function renderAdmin() {
    renderTema();
    renderAdminCategorias();
    renderOrdemCategorias();
    $('#admin-count').textContent = catalog.length + ' produto' + (catalog.length === 1 ? '' : 's') + ' no catálogo';
    const list = $('#admin-list'); list.innerHTML = '';
    catalog.forEach(p => {
      const item = document.createElement('div');
      item.className = 'admin-item';
      item.dataset.pid = p.id;
      const foto = document.createElement('img'); foto.alt = '';
      const nome = document.createElement('span'); nome.className = 'ai-name'; nome.textContent = p.name;
      const preco = document.createElement('span'); preco.className = 'ai-price'; preco.textContent = brl(p.price);
      const editar = document.createElement('button');
      editar.type = 'button'; editar.className = 'ai-edit';
      editar.title = 'Editar produto';
      editar.setAttribute('aria-label', 'Editar ' + p.name);
      const tplLapis = $('#tpl-lapis');
      if (tplLapis) editar.appendChild(tplLapis.content.cloneNode(true)); else editar.textContent = '✎';
      editar.addEventListener('click', () => entraEdicao(p));
      const copiar = document.createElement('button');
      copiar.type = 'button'; copiar.className = 'ai-link';
      copiar.title = 'Copiar link deste produto';
      copiar.setAttribute('aria-label', 'Copiar link de ' + p.name);
      const tplLink = $('#tpl-link');
      if (tplLink) copiar.appendChild(tplLink.content.cloneNode(true)); else copiar.textContent = '🔗';
      copiar.addEventListener('click', async () => {
        const url = linkProduto(p);
        try { await navigator.clipboard.writeText(url); toast('Link copiado ✓'); }
        catch (e) {
          // clipboard bloqueado (http, permissão): seleciona pra copiar na mão
          const i = document.createElement('input');
          i.value = url; document.body.appendChild(i); i.select();
          try { document.execCommand('copy'); toast('Link copiado ✓'); }
          catch (_) { toast('Copie: ' + url); }
          i.remove();
        }
      });
      const del = document.createElement('button');
      del.type = 'button'; del.className = 'ai-del';
      del.title = 'Excluir produto'; del.setAttribute('aria-label', 'Excluir ' + p.name);
      const tpl = $('#tpl-lixeira');
      if (tpl) del.appendChild(tpl.content.cloneNode(true));
      else del.textContent = '✕';   // guard: HTML em cache sem o template
      item.append(foto, nome, preco, editar, copiar, del);
      bindImg(foto, p.img, p.name);
      del.addEventListener('click', () => { del.disabled = true; removeProduct(p.id); });
      list.appendChild(item);
    });
  }
  async function removeProduct(id) {
    const antes = catalog.slice();
    const linha = $('#admin-list') && $('#admin-list').querySelector('[data-pid="' + id + '"]');
    if (linha) linha.classList.add('enviando');   // some só quando o servidor confirmar
    toast('Removendo…');
    try {
      const r = await fetch(WH_DEL_PRODUCT, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store_slug: STORE_SLUG, product_id: id })
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      catalog = catalog.filter(p => p.id !== id); save();
      renderAdmin(); renderCatalog();
      toast('Produto removido ✓');
    } catch (e) {
      console.warn('[Provou Catálogo] erro ao remover:', e);
      catalog = antes; save(); renderAdmin(); renderCatalog();
      toast('Não consegui remover. Tente de novo.');
    }
  }
  let adminPhotoB64 = '';   // base64 já comprimido, pronto pra subir
  let adminFotosB64 = [];   // todas as fotos escolhidas; a 1ª é a de capa
  let adminFotosPreview = [];
  let adminUploadRequestId = ''; // persiste se o lojista tocar novamente após uma falha
  let editando = null;      // produto em edição (null = cadastrando um novo)

  function atualizaCampoJuros() {
    const comJuros = $('#admin-interest-type').value === 'interest';
    $('#admin-interest-wrap').hidden = !comJuros;
    if (!comJuros) $('#admin-interest-rate').value = '';
  }
  $('#admin-interest-type').addEventListener('change', atualizaCampoJuros);

  function renderAdminVariacoes(fotos) {
    const box = $('#admin-variacoes');
    const lista = $('#admin-variacoes-lista');
    if (!box || !lista) return;
    lista.textContent = '';
    box.hidden = !fotos.length;
    fotos.forEach((foto, i) => {
      const linha = document.createElement('label');
      linha.className = 'admin-variacao';
      const img = document.createElement('img');
      img.alt = '';
      img.src = foto.url;
      const campo = document.createElement('input');
      campo.type = 'text';
      campo.maxLength = 50;
      campo.placeholder = 'Cor ou variação (ex.: Preto)';
      campo.value = foto.variantName || '';
      campo.dataset.imageId = foto.id || '';
      campo.dataset.index = String(i);
      linha.append(img, campo);
      lista.appendChild(linha);
    });
  }

  function variacoesDigitadas() {
    return $$('#admin-variacoes-lista input').map(campo => ({
      id: campo.dataset.imageId || null,
      variant_name: campo.value.trim().slice(0, 50)
    }));
  }

  // Editar reaproveita o formulário de cadastro em vez de abrir outra tela: é o
  // mesmo par nome+preço, e o lojista já sabe onde ficam os campos.
  function entraEdicao(p) {
    editando = p;
    adminPhoto = ''; adminPhotoB64 = ''; adminFotosB64 = []; adminFotosPreview = [];
    adminUploadRequestId = '';
    const fi = $('#admin-photo'); if (fi) fi.value = '';
    const cc = $('#admin-up-conta'); if (cc) cc.hidden = true;
    $('#admin-name').value = p.name;
    $('#admin-price').value = Number(p.price).toFixed(2).replace('.', ',');
    $('#admin-original-price').value = p.originalPrice && p.originalPrice > p.price
      ? Number(p.originalPrice).toFixed(2).replace('.', ',') : '';
    $('#admin-desc').value = p.desc || '';
    $('#admin-parcelas').value = p.parcelas ? String(p.parcelas) : '';
    $('#admin-interest-type').value = p.installmentInterestRate > 0 ? 'interest' : 'none';
    $('#admin-interest-rate').value = p.installmentInterestRate > 0
      ? String(p.installmentInterestRate).replace('.', ',') : '';
    atualizaCampoJuros();
    adminCategoriasSelecionadas = normalizaCategorias(p.cats && p.cats.length ? p.cats : [p.cat]);
    $('#admin-categoria').value = '';
    renderAdminCategorias();
    const prev = $('#admin-up-preview');
    if (p.img) { prev.src = p.img; prev.hidden = false; $('#admin-up-empty').style.display = 'none'; }
    renderAdminVariacoes((p.imageMeta || []).map(x => ({ id: x.id, url: x.url, variantName: x.variantName })));
    $('#btn-add-product').textContent = 'Salvar alterações';
    $('#btn-cancel-edit').hidden = false;
    $('#admin-name').focus();
    $('#admin-name').scrollIntoView({ block: 'center', behavior: 'smooth' });
    toast('Editando ' + p.name);
  }

  function saiEdicao() {
    editando = null;
    $('#admin-name').value = ''; $('#admin-price').value = ''; $('#admin-original-price').value = '';
    $('#admin-desc').value = ''; $('#admin-parcelas').value = '';
    $('#admin-interest-type').value = 'none'; $('#admin-interest-rate').value = '';
    atualizaCampoJuros();
    $('#admin-categoria').value = '';
    adminCategoriasSelecionadas = [];
    renderAdminCategorias();
    adminPhoto = ''; adminPhotoB64 = ''; adminFotosB64 = []; adminFotosPreview = [];
    adminUploadRequestId = '';
    renderAdminVariacoes([]);
    $('#admin-up-preview').hidden = true; $('#admin-up-empty').style.display = '';
    const cc0 = $('#admin-up-conta'); if (cc0) cc0.hidden = true;
    const f = $('#admin-photo'); if (f) f.value = '';
    $('#btn-add-product').textContent = 'Adicionar ao catálogo';
    $('#btn-cancel-edit').hidden = true;
  }
  {
    const c = $('#btn-cancel-edit');
    if (c) c.addEventListener('click', saiEdicao);
  }
  $('#admin-photo').addEventListener('change', async e => {
    const files = Array.from(e.target.files || []).slice(0, MAX_FOTOS_PRODUTO);
    if (!files.length) return;
    const btn = $('#btn-add-product');
    const txt0 = btn.textContent;
    btn.disabled = true; btn.textContent = 'Otimizando fotos…';
    const lidas = [];
    for (let i = 0; i < files.length; i++) {
      btn.textContent = 'Otimizando foto ' + (i + 1) + ' de ' + files.length + '…';
      const b64 = await compressImage(files[i]);
      if (b64) lidas.push(b64);
      await espera(0); // devolve a tela ao navegador entre fotos grandes
    }
    btn.disabled = false; btn.textContent = txt0;
    if (!lidas.length) { toast('Não consegui ler essas imagens'); return; }
    adminFotosB64 = lidas;
    adminUploadRequestId = novoRequestId();
    adminFotosPreview = lidas.map(b64 => ({ url: 'data:image/jpeg;base64,' + b64, variantName: '' }));
    renderAdminVariacoes(adminFotosPreview);
    adminPhotoB64 = lidas[0];
    adminPhoto = 'data:image/jpeg;base64,' + lidas[0];
    const prev = $('#admin-up-preview'); prev.src = adminPhoto; prev.hidden = false;
    $('#admin-up-empty').style.display = 'none';
    const conta = $('#admin-up-conta');
    if (conta) { conta.textContent = lidas.length + ' foto' + (lidas.length > 1 ? 's' : ''); conta.hidden = lidas.length < 2; }
    if ((e.target.files || []).length > lidas.length)
      toast('Usei as ' + lidas.length + ' primeiras fotos');
  });
  $('#btn-add-product').addEventListener('click', async () => {
    const btn = $('#btn-add-product');
    const name = $('#admin-name').value.trim();
    const priceRaw = $('#admin-price').value.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
    const price = parseFloat(priceRaw);
    const originalPriceRaw = $('#admin-original-price').value.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
    const originalPrice = originalPriceRaw ? parseFloat(originalPriceRaw) : null;
    const interestRateRaw = $('#admin-interest-rate').value.replace(',', '.').replace(/[^\d.]/g, '');
    const interestRate = $('#admin-interest-type').value === 'interest' ? parseFloat(interestRateRaw) : null;
    const parcelas = Number($('#admin-parcelas').value) || null;
    // Se a categoria nova ainda estiver digitada, inclui antes de salvar.
    if ($('#admin-categoria').value.trim()) adicionaCategoriaDigitada();
    const categorias = normalizaCategorias(adminCategoriasSelecionadas);
    if (!name) { toast('Dê um nome ao produto'); return; }
    if (!price || price <= 0) { toast('Informe um preço válido'); return; }
    if (originalPrice !== null && (!originalPrice || originalPrice <= price)) {
      toast('O preço original deve ser maior que o promocional'); return;
    }
    if ($('#admin-interest-type').value === 'interest' && (!interestRate || interestRate <= 0 || interestRate > 20)) {
      toast('Informe os juros por parcela entre 0,01% e 20%'); return;
    }
    if ($('#admin-interest-type').value === 'interest' && (!parcelas || parcelas < 2)) {
      toast('Escolha em quantas vezes será o parcelamento'); return;
    }
    // no cadastro a foto é obrigatória; na edição, só se o lojista escolher outra
    if (!editando && !adminPhotoB64) { toast('Envie a foto do produto'); return; }
    if (!storeRow) { toast('Loja não encontrada — recarregue a página'); return; }

    if (editando) {
      const txt0 = btn.textContent;
      btn.disabled = true; btn.textContent = 'Salvando…';
      try {
        // Sobe as fotos novas ANTES de mandar apagar as velhas. Se o upload
        // falhar no meio, o produto continua com as fotos antigas em vez de
        // ficar sem nenhuma.
        const trocouFoto = adminFotosB64.length > 0;
        const variacoes = variacoesDigitadas();
        const uploadBaseId = adminUploadRequestId || (adminUploadRequestId = novoRequestId());
        if (trocouFoto) {
          btn.textContent = adminFotosB64.length > 1
            ? 'Enviando ' + adminFotosB64.length + ' fotos…' : 'Enviando foto…';
          await Promise.all(adminFotosB64.map(async (foto, i) => {
            await postJsonComRetry(WH_ADD_IMAGE, {
              // position 1-based: o n8n faz `position || 1` e trataria o 0 como
              // ausente, jogando a 1a e a 2a foto na mesma posicao — e a capa
              // sai justamente da menor posicao
              store_slug: STORE_SLUG, product_id: editando.id,
              request_id: uploadBaseId + '-' + i,
              mime: 'image/jpeg', image_b64: foto, position: i + 1,
              variant_name: (variacoes[i] && variacoes[i].variant_name) || null
            });
          }));
        }
        btn.textContent = 'Salvando…';
        await postJsonComRetry(WH_EDIT_PRODUCT, {
          product_id: editando.id, name, price, original_price: originalPrice,
          installment_interest_rate: interestRate,
          description: $('#admin-desc').value.trim() || null,
          parcelas,
          categoria_vitrine: categorias[0] || null,
          categorias_vitrine: categorias.length ? categorias : null,
          image_variants: trocouFoto ? [] : variacoes.filter(x => x.id),
          remove_image_ids: trocouFoto ? (editando.imgIds || []) : []
        });
        await loadCatalog();
        renderAdmin(); renderCatalog();
        saiEdicao();
        toast('Produto atualizado ✓');
      } catch (e) {
        console.warn('[Provou Catálogo] erro ao editar:', e);
        toast('Não consegui salvar. Tente de novo.');
      } finally {
        btn.disabled = false; btn.textContent = editando ? txt0 : 'Adicionar ao catálogo';
      }
      return;
    }

    // Espera a confirmação de propósito: produto que "aparece" sem ter subido
    // dá ao lojista a certeza errada de que o catálogo está publicado. Ele fica
    // aqui até o servidor responder, e o botão diz em que passo está.
    const txt = btn.textContent;
    btn.disabled = true; btn.textContent = 'Enviando foto…';
    try {
      const variacoes = variacoesDigitadas();
      const requestId = adminUploadRequestId || (adminUploadRequestId = novoRequestId());
      const data = await postJsonComRetry(WH_ADD_PRODUCT, {
        store_slug: STORE_SLUG, name, price, original_price: originalPrice,
        installment_interest_rate: interestRate,
        request_id: requestId, descricao_e_parcelas: 1,
        description: $('#admin-desc').value.trim() || null,
        parcelas,
        categoria_vitrine: categorias[0] || null,
        categorias_vitrine: categorias.length ? categorias : null,
        mime: 'image/jpeg', image_b64: adminPhotoB64,
        variant_name: (variacoes[0] && variacoes[0].variant_name) || null
      });

      const pid = data.product && data.product.id;
      if (!pid) throw new Error('Servidor não devolveu o produto');

      // A foto principal já tornou o produto publicável. Atualiza a tela agora,
      // sem esperar uma segunda consulta ao banco nem as fotos adicionais.
      // Isso elimina a sensação de travamento depois que o servidor já concluiu.
      const capa = data.image_url || adminPhoto;
      const novo = {
        id: pid, name, price, originalPrice, img: capa, imgs: [capa], imgIds: [],
        imageMeta: [{ id: null, url: capa, variantName: (variacoes[0] && variacoes[0].variant_name) || '' }],
        desc: $('#admin-desc').value.trim(), cat: categorias[0] || '', cats: categorias,
        parcelas: parcelas || 0, installmentInterestRate: interestRate || 0,
        categoria: 'oculos'
      };
      catalog = [novo].concat(catalog.filter(p => p.id !== pid));
      save(); renderAdmin(); renderCatalog();

      // Cópias locais: o formulário pode ser limpo enquanto as fotos restantes
      // continuam em segundo plano com seus IDs seguros contra duplicação.
      const fotosRestantes = adminFotosB64.slice(1);
      const variacoesRestantes = variacoes.slice(1);
      const enviaRestantes = Promise.allSettled(fotosRestantes.map(async (foto, offset) => {
        const i = offset + 1;
        await postJsonComRetry(WH_ADD_IMAGE, {
          store_slug: STORE_SLUG, product_id: pid, request_id: requestId + '-' + i,
          mime: 'image/jpeg', image_b64: foto, position: i,
          variant_name: (variacoesRestantes[offset] && variacoesRestantes[offset].variant_name) || null
        });
      }));
      $('#admin-name').value = ''; $('#admin-price').value = ''; $('#admin-original-price').value = '';
      $('#admin-desc').value = ''; $('#admin-parcelas').value = '';
      $('#admin-interest-type').value = 'none'; $('#admin-interest-rate').value = '';
      atualizaCampoJuros();
      $('#admin-categoria').value = '';
      adminCategoriasSelecionadas = [];
      renderAdminCategorias();
      adminPhoto = ''; adminPhotoB64 = ''; adminFotosB64 = []; adminFotosPreview = [];
      adminUploadRequestId = '';
      renderAdminVariacoes([]);
      $('#admin-up-preview').hidden = true; $('#admin-up-empty').style.display = ''; $('#admin-photo').value = '';
      const cc = $('#admin-up-conta'); if (cc) cc.hidden = true;
      toast(name + ' publicado ✓');

      // Sincroniza IDs e URLs das imagens sem bloquear o próximo cadastro.
      enviaRestantes.then(resultados => {
        const falhas = resultados.filter(x => x.status === 'rejected').length;
        loadCatalog().then(() => { renderAdmin(); renderCatalog(); }).catch(e =>
          console.warn('[Provou Catálogo] atualização em segundo plano falhou:', e));
        if (falhas) toast('Produto publicado; ' + falhas + ' foto(s) não foram enviadas');
      });
    } catch (err) {
      // nada entrou na lista, então não há o que desfazer: os campos e a foto
      // continuam preenchidos pra ele só tentar de novo
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
      agendaConsultaLimite();   // saldo real do banco enquanto ele ainda digita
    });
  })();

  function atualizaBotaoProvar() {
    const temFoto = !!userPhoto;
    const temTel = soDigitos($('#phone-input') && $('#phone-input').value).length >= 10;
    const ok = $('#accept-terms');
    const aceitou = !ok || ok.checked;   // guard: HTML em cache sem o checkbox
    const podeProvar = atualizaLimite();
    const b = $('#btn-generate');
    if (b) b.disabled = !(temFoto && temTel && aceitou && podeProvar);
  }
  {
    const ok = $('#accept-terms');
    if (ok) ok.addEventListener('change', atualizaBotaoProvar);
  }
  // Loja de catalogo nao tem carrinho: quem quer comprar fala com o lojista, ja
  // com o modelo provado no texto. So cai no checkout se a loja nao tiver WhatsApp.
  const LOJAS_COMPRA_WHATSAPP = {
    oticakadima: [
      { rotulo: 'Loja Várzea Paulista' },
      { rotulo: 'Campo Limpo Paulista', telefone: '5511942329445' }
    ]
  };

  function configuraBotoesCompra() {
    const principal = $('#btn-buy'), secundario = $('#btn-buy-secondary');
    const labelPrincipal = $('#btn-buy-label'), labelSecundario = $('#btn-buy-secondary-label');
    if (!principal || !secundario) return;
    const lojas = LOJAS_COMPRA_WHATSAPP[STORE_SLUG] || [];
    principal.dataset.telefone = lojas[0] && lojas[0].telefone || '';
    if (labelPrincipal) labelPrincipal.textContent = lojas.length
      ? 'Comprar — ' + lojas[0].rotulo : 'Comprar no WhatsApp';
    if (lojas.length > 1) {
      secundario.dataset.telefone = lojas[1].telefone || '';
      if (labelSecundario) labelSecundario.textContent = 'Comprar — ' + lojas[1].rotulo;
      secundario.hidden = false;
    } else {
      secundario.dataset.telefone = '';
      secundario.hidden = true;
    }
  }

  function comprarNoWhatsapp(telefone) {
    const tel = String(telefone || (storeRow && storeRow.whatsapp) || '').replace(/\D/g, '');
    if (!tel) { openCheckout(); return; }
    const num = tel.length <= 11 ? '55' + tel : tel;
    const txt = 'Oi! Provei o ' + nomeProdutoAtual() +
      (current && current.price ? ' (' + brl(current.price) + ')' : '') +
      ' no provador virtual da ' + STORE.name + ' e quero comprar.';
    window.open('https://wa.me/' + num + '?text=' + encodeURIComponent(txt), '_blank');
  }
  $('#btn-buy').addEventListener('click', e => comprarNoWhatsapp(e.currentTarget.dataset.telefone));
  $('#btn-buy-secondary').addEventListener('click', e => comprarNoWhatsapp(e.currentTarget.dataset.telefone));
  // Limite atingido: a conversa com a loja é a única saída hoje, então o texto
  // já vai pronto — sem isso o cliente sai da página e não volta.
  {
    const bw = $('#btn-limite-whats');
    if (bw) bw.addEventListener('click', () => {
      const tel = String((storeRow && storeRow.whatsapp) || '').replace(/\D/g, '');
      if (!tel) return;
      const num = tel.length <= 11 ? '55' + tel : tel;
      const txt = 'Oi! Usei minhas provas de hoje no provador virtual da ' + STORE.name +
        (current && current.name ? ' e fiquei interessado no ' + nomeProdutoAtual() : '') + '.';
      window.open('https://wa.me/' + num + '?text=' + encodeURIComponent(txt), '_blank');
    });
  }
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
  const pedido = (location.hash === '#admin' || location.hash === '#login')
    ? null : new URLSearchParams(location.search).get('p');
  // lido aqui em cima pelo mesmo motivo do `pedido`: o show('catalog') do init
  // reescreve a URL e o ?cat= ja teria sumido
  const catPedida = new URLSearchParams(location.search).get('cat');
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

  // Chegou por um link de produto: espera o catálogo carregar e abre nele.
  // `pedido` é lido lá em cima, ANTES de qualquer show(): o show('catalog') do
  // init limpa o ?p= da URL, e lendo aqui ele já teria sumido.
  // Chegou por um link de categoria: aplica o filtro assim que o catalogo carrega.
  if (catPedida) {
    const filtra = () => {
      catFiltro = achaCategoria(catPedida);
      if (!catFiltro) { toast('Essa categoria nao existe mais'); return; }
      renderCatalog();
      try { history.replaceState({ cat: catFiltro }, '', linkCategoria(catFiltro)); } catch (e) {}
    };
    if (cargaInicial) cargaInicial.then(filtra); else filtra();
  }

  if (pedido) {
    const abre = () => {
      const prod = catalog.find(x => String(x.id) === String(pedido));
      if (prod) openProduct(prod, true);
      else toast('Esse produto não está mais disponível');
    };
    if (cargaInicial) cargaInicial.then(abre); else abre();
  }
})();
