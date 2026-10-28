// Provou Catálogo — vitrine no visual "App" (27/10/2026, Lucas).
// Mesmo desenho do tema App da prévia (catalogo-opcoes/c-app.html): perfil, banner em carrossel,
// categorias em bolinhas, busca com filtros, chamada do provador, Top 10 mais provados, grade e
// barra de navegação. Liga por loja com tema.layout = 'app'. Os dados e as ações (abrir produto,
// provar, WhatsApp) vêm do app.js por PLVitrineApp.render(ctx) — aqui é só a vitrine.
(function () {
  'use strict';
  var CSS = [
    'html.layout-app #app{max-width:560px}',
    'html.layout-app #screen-catalog{padding:0 0 92px}',
    'html.layout-app #screen-catalog>.store-head,html.layout-app #screen-catalog>.catalogo-painel{display:none!important}',
    'html.layout-app #screen-catalog>.admin-cta{margin:12px 16px 0}',
    'html.layout-app #screen-catalog>.powered-by{margin-top:28px}',
    '.va{font-family:"Hanken Grotesk",system-ui,sans-serif;color:#111827;background:#fff}',
    '.va *{box-sizing:border-box}.va img{display:block;max-width:100%}.va button{font:inherit;cursor:pointer}',
    '.va-perfil{position:relative;padding:18px 16px 12px;display:flex;gap:14px;align-items:center}',
    '.va-av{flex:0 0 74px;width:74px;height:74px;border-radius:50%;padding:3px;background:linear-gradient(45deg,var(--brand-dark),var(--brand))}',
    '.va-av img{width:100%;height:100%;border-radius:50%;object-fit:contain;background:#fff;border:3px solid #fff}',
    '.va-perfil h1{font-family:"Bricolage Grotesque",sans-serif;font-size:19px;margin:0;padding-right:70px;line-height:1.2}',
    '.va-perfil p{margin:3px 0 0;font-size:12.5px;color:#6b7280}',
    '.va-acoes{position:absolute;top:12px;right:10px;display:flex;gap:2px}',
    '.va-acoes a,.va-acoes button{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;color:#6b7280;border:0;background:none;padding:0}',
    '.va-acoes a:hover,.va-acoes button:hover{background:#f3f4f6;color:#111827}.va-acoes svg{width:16px;height:16px}',
    '.va-banner{position:relative;margin:4px 16px 8px;border-radius:18px;overflow:hidden;aspect-ratio:3/1;background:#f6f7f9}',
    '.va-trilho{display:flex;height:100%;transition:transform .5s ease}',
    '.va-slide{flex:0 0 100%;height:100%;display:flex;align-items:center;gap:10px;padding:0 16px;color:#fff;background:linear-gradient(120deg,var(--brand-dark),var(--brand))}',
    '.va-slide .t{flex:1;min-width:0}.va-slide b{display:block;font-family:"Bricolage Grotesque",sans-serif;font-size:17px;line-height:1.15}.va-slide small{opacity:.88;font-size:12px}',
    '.va-slide .fs{display:flex;gap:6px}.va-slide .fs img{width:60px;height:60px;border-radius:12px;object-fit:cover;background:#fff;box-shadow:0 4px 10px rgba(0,0,0,.2)}',
    '.va-slide.img{padding:0}.va-slide.img img{width:100%;height:100%;object-fit:cover}',
    '.va-pts{position:absolute;bottom:7px;left:0;right:0;display:flex;justify-content:center;gap:5px}.va-pts i{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.5)}.va-pts i.on{background:#fff;width:16px;border-radius:6px}',
    '.va-stories{display:flex;gap:14px;overflow-x:auto;padding:6px 16px 14px;scrollbar-width:none;border-bottom:1px solid #eef0f3}.va-stories::-webkit-scrollbar{display:none}',
    '.va-stories button{flex:0 0 auto;border:0;background:none;display:flex;flex-direction:column;align-items:center;gap:6px;font-size:11.5px;font-weight:600;width:68px;padding:0;color:#111827}',
    '.va-stories button span{max-width:68px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.va-stories .r{width:64px;height:64px;border-radius:50%;padding:2.5px;background:linear-gradient(45deg,var(--brand-dark),var(--brand))}',
    '.va-stories .r img{width:100%;height:100%;border-radius:50%;object-fit:cover;border:2.5px solid #fff;background:#fff}',
    '.va-stories button.on .r{background:#111827}.va-stories button.on{font-weight:800}',
    '.va-busca{position:sticky;top:0;z-index:10;background:#fff;padding:10px 16px;border-bottom:1px solid #eef0f3}',
    '.va-busca input{width:100%;border:0;background:#f3f4f6 no-repeat 13px center/17px url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239ca3af\' stroke-width=\'2\' stroke-linecap=\'round\'%3E%3Ccircle cx=\'11\' cy=\'11\' r=\'8\'/%3E%3Cpath d=\'m21 21-4.3-4.3\'/%3E%3C/svg%3E");border-radius:12px;padding:12px 14px 12px 38px;font:inherit;font-size:14px;outline:0;color:#111827}',
    '.va-chips{display:flex;gap:8px;overflow-x:auto;margin-top:10px;scrollbar-width:none}.va-chips::-webkit-scrollbar{display:none}',
    '.va-chips button{border:0;background:#f3f4f6;border-radius:999px;padding:8px 14px;font-size:13px;font-weight:600;white-space:nowrap;color:#111827}',
    '.va-chips button.on{background:#111827;color:#fff}',
    '.va-dest{margin:14px 16px 0;border-radius:18px;background:linear-gradient(135deg,var(--brand-dark),var(--brand));color:#fff;padding:16px;display:flex;gap:12px;align-items:center;cursor:pointer}',
    '.va-dest img{flex:0 0 84px;width:84px;height:84px;border-radius:14px;object-fit:cover;background:#fff}.va-dest b{font-size:16px;display:flex;align-items:center;gap:6px}.va-dest small{opacity:.88;font-size:12.5px;display:block;margin-top:2px}',
    '.va-dest span.bt{display:inline-block;margin-top:8px;background:#fff;color:var(--brand-dark);border-radius:999px;padding:7px 12px;font-size:12.5px;font-weight:800}',
    '.va-sec{padding:20px 16px 4px}.va-sec h2{font-family:"Bricolage Grotesque",sans-serif;font-size:17px;margin:0 0 12px;display:flex;justify-content:space-between;align-items:center;gap:8px}',
    '.va-sec h2 span{display:flex;align-items:center;gap:6px}.va-sec h2 small{font-family:"Hanken Grotesk",sans-serif;font-size:12px;color:#6b7280;font-weight:600}',
    '.va-rank{display:grid;grid-auto-flow:column;grid-auto-columns:42%;gap:10px;overflow-x:auto;scrollbar-width:none;padding-bottom:6px}.va-rank::-webkit-scrollbar{display:none}',
    '.va-grade{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
    '.va-card{border:0;background:#fff;padding:0;text-align:left;border-radius:16px;overflow:hidden;box-shadow:0 0 0 1px #eef0f3;color:#111827;display:flex;flex-direction:column}',
    '.va-card .ft{position:relative;aspect-ratio:1;min-height:0;flex:0 0 auto;overflow:hidden;background:#f6f7f9}.va-card .ft img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}',
    '.va-card .pos{position:absolute;left:8px;top:8px;background:#111827;color:#fff;font-size:12px;font-weight:800;border-radius:8px;padding:3px 8px}',
    '.va-card .fire{position:absolute;left:8px;bottom:8px;background:rgba(17,24,39,.75);color:#fff;font-size:11px;font-weight:700;border-radius:999px;padding:4px 8px;display:flex;align-items:center;gap:4px}',
    '.va-card .off{position:absolute;right:8px;top:8px;background:#ef4444;color:#fff;font-size:11px;font-weight:800;border-radius:8px;padding:3px 7px}',
    '.va-card .in{padding:10px;display:flex;flex-direction:column;flex:1}.va-card .nm{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.va-card .pr{font-weight:800;font-size:15px;margin-top:3px}.va-card .de{font-size:11.5px;color:#6b7280;text-decoration:line-through;font-weight:500;margin-left:4px}',
    '.va-card .bt{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:auto;width:100%;line-height:1.2;border:0;background:var(--brand-soft);color:var(--brand);border-radius:10px;padding:8px;font-size:12.5px;font-weight:800}',
    '.va-card .in .bt{margin-top:8px}',
    '.va-vazio{grid-column:1/-1;text-align:center;color:#6b7280;font-size:14px;padding:30px 0}',
    '.va-tab{position:fixed;left:50%;transform:translateX(-50%);bottom:0;width:min(560px,100%);background:#fff;border-top:1px solid #eef0f3;display:grid;grid-template-columns:repeat(4,1fr);padding:8px 6px calc(8px + env(safe-area-inset-bottom));z-index:30}',
    '.va-tab a{text-align:center;text-decoration:none;color:#6b7280;font-size:11px;font-weight:600;cursor:pointer}.va-tab a.on{color:var(--brand)}',
    '.va-tab a svg{width:22px;height:22px;display:block;margin:2px auto 1px}',
    '.va-tab a.wa i{display:block;background:#25d366;border-radius:50%;width:34px;height:34px;margin:0 auto}.va-tab a.wa svg{width:18px;height:18px;margin:0 auto;position:relative;top:8px;fill:#fff}',
    'html.layout-app body:not(.va-na-vitrine) .va-tab{display:none}',
    '.va svg.i{width:1.05em;height:1.05em;flex-shrink:0}',
    // ── modo computador (27/10, Lucas) ──
    '.va-zap{display:none}',
    '@media(min-width:900px){',
    'html.layout-app #app{max-width:1240px}',
    'html.layout-app #screen-catalog{padding-bottom:40px}',
    'html.layout-app .screen:not(#screen-catalog):not(#screen-product){max-width:560px;margin-left:auto;margin-right:auto}',
    '.va-perfil{padding:28px 32px 18px;gap:18px}.va-av{flex-basis:92px;width:92px;height:92px}.va-perfil h1{font-size:26px}.va-perfil p{font-size:14px}.va-acoes{top:26px;right:28px}',
    '.va-banner{margin:4px 32px 14px;aspect-ratio:auto;height:240px}.va-slide{padding:0 48px;gap:24px}.va-slide b{font-size:34px}.va-slide small{font-size:16px}.va-slide .fs{gap:12px}.va-slide .fs img{width:150px;height:150px;border-radius:18px}',
    '.va-stories{gap:22px;padding:10px 32px 20px}.va-stories button{width:84px}.va-stories button span{max-width:84px;font-size:12.5px}.va-stories .r{width:80px;height:80px}',
    '.va-busca{padding:14px 32px;display:flex;gap:16px;align-items:center}.va-busca input{flex:0 0 340px;width:340px}.va-chips{margin-top:0;flex:1;min-width:0}',
    '.va-dest{margin:22px 32px 0;padding:22px 28px}.va-dest img{flex-basis:110px;width:110px;height:110px}.va-dest b{font-size:20px}.va-dest small{font-size:14px}',
    '.va-sec{padding:28px 32px 6px}.va-sec h2{font-size:22px}',
    '.va-rank{grid-auto-columns:220px;gap:14px}',
    '.va-grade{grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:16px}',
    '.va-card{transition:transform .15s,box-shadow .2s}.va-card:hover{transform:translateY(-3px);box-shadow:0 0 0 1px #e5e7eb,0 10px 24px rgba(0,0,0,.08)}',
    '.va-card .nm{font-size:14px}.va-card .pr{font-size:16.5px}.va-card .bt{padding:10px;font-size:13.5px}.va-card .bt:hover{background:var(--brand);color:#fff}',
    '.va-tab{display:none!important}',
    '.va-zap{display:flex;position:fixed;right:28px;bottom:28px;z-index:30;align-items:center;gap:8px;background:#25d366;color:#fff;border-radius:999px;padding:13px 18px;font-weight:800;font-size:14px;text-decoration:none;box-shadow:0 8px 24px rgba(0,0,0,.18)}',
    '.va-zap svg{width:20px;height:20px;fill:#fff}',
    'html.layout-app body:not(.va-na-vitrine) .va-zap{display:none}',
    'html.layout-app #screen-product{padding:24px 32px 48px}',
    'html.layout-app .product-view{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:0 48px;align-items:start}',
    'html.layout-app .product-view>.product-photo,html.layout-app .product-view>.p-variant-title,html.layout-app .product-view>.p-thumbs{grid-column:1}',
    'html.layout-app .product-view>.product-info{grid-column:2;grid-row:1/span 3;padding-top:8px}',
    'html.layout-app #p-name{font-size:32px}html.layout-app .p-price{font-size:34px}',
    '}'
  ].join('\n');
  var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

  var I = function (d, fill) { return '<svg class="i" viewBox="0 0 24 24" fill="' + (fill ? 'currentColor' : 'none') + '" stroke="' + (fill ? 'none' : 'currentColor') + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; };
  var IC = {
    spark: I('<path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0l1.58 6.14a2 2 0 0 0 1.44 1.44l6.14 1.58a.5.5 0 0 1 0 .96l-6.14 1.58a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z"/>'),
    trend: I('<path d="M22 7 13.5 15.5 8.5 10.5 2 17"/><path d="M16 7h6v6"/>'),
    home: I('<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .71-1.53l7-6a2 2 0 0 1 2.58 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
    busca: I('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
    gear: I('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'),
    wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8zm8.4-18.2A11.8 11.8 0 0 0 1.7 17.8L0 24l6.3-1.7a11.8 11.8 0 0 0 5.7 1.5c6.5 0 11.8-5.3 11.8-11.8 0-3.2-1.2-6.1-3.4-8.4z"/></svg>'
  };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var norm = function (t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); };

  var X = null;          // contexto vindo do app.js
  var root = null, estado = { cat: '', q: '' }, contagem = null, contagemDe = '', ban = { i: 0, n: 1, t: null };

  function desconto(p) { if (!X.temOferta(p)) return 0; var d = Math.round((1 - X.preco(p) / Number(p.originalPrice)) * 100); return d > 0 && d <= 85 ? d : 0; }
  function provas(p) { return (contagem && contagem[p.id]) || 0; }
  function maisProvados() {
    var l = X.catalog.filter(function (p) { return p.img; });
    if (contagem) l = l.filter(provas).sort(function (a, b) { return provas(b) - provas(a); });
    return l.slice(0, 10);
  }
  function novidades() { return X.catalog.filter(function (p) { return p.img; }).slice().sort(function (a, b) { return (a.createdAt < b.createdAt) ? 1 : -1; }).slice(0, 10); }
  function promo() { return X.catalog.filter(function (p) { return p.img && desconto(p); }).sort(function (a, b) { return desconto(b) - desconto(a); }).slice(0, 10); }
  function lista() {
    var q = norm(estado.q);
    return X.catalog.filter(function (p) {
      if (estado.cat === '__promo') { if (!desconto(p)) return false; }
      else if (estado.cat === '__novos') { if (novidades().indexOf(p) < 0) return false; }
      else if (estado.cat === '__alta') { if (maisProvados().indexOf(p) < 0) return false; }
      else if (estado.cat && !X.temCat(p, estado.cat)) return false;
      return !q || norm(p.name).indexOf(q) >= 0 || (p.cats || []).some(function (c) { return norm(c).indexOf(q) >= 0; });
    });
  }
  function titulo() { return { '': 'Todas', __promo: 'Promoções', __novos: 'Novidades', __alta: 'Em alta' }[estado.cat] || estado.cat; }

  function card(p, i) {
    var d = desconto(p), n = provas(p);
    return '<button class="va-card" data-p="' + esc(p.id) + '"><div class="ft"><img loading="lazy" src="' + esc(p.img) + '" alt="">' +
      (i != null ? '<span class="pos">#' + (i + 1) + '</span>' : '') + (d ? '<span class="off">-' + d + '%</span>' : '') +
      (n >= 3 ? '<span class="fire">' + IC.trend + ' ' + n + ' provaram</span>' : '') + '</div>' +
      '<div class="in"><div class="nm">' + esc(p.name) + '</div><div class="pr">' + X.brl(X.preco(p)) + (d ? '<span class="de">' + X.brl(p.originalPrice) + '</span>' : '') + '</div>' +
      '<span class="bt" data-provar="' + esc(p.id) + '">' + IC.spark + ' ' + (X.ehKit(p) ? 'Ver o kit' : 'Provar') + '</span></div></button>';
  }

  function slides() {
    var t = (X.tema && Array.isArray(X.tema.slides) && X.tema.slides.length) ? X.tema.slides : null;
    if (t) return t;
    var l = [{ tipo: 'texto', titulo: 'Prove antes de comprar', sub: 'Veja a armação no seu rosto em segundos', auto: 'mais' },
             { tipo: 'texto', titulo: 'Novidades na loja', sub: X.catalog.length + ' armações para provar', auto: 'novos', fundo: 'linear-gradient(120deg,#111,var(--brand-dark))' }];
    var pr = promo(); if (pr.length) l.push({ tipo: 'texto', titulo: 'Até ' + desconto(pr[0]) + '% off', sub: 'Aproveite as promoções', auto: 'promo', fundo: 'linear-gradient(120deg,#b91c1c,#ef4444)' });
    return l;
  }
  function slideHTML(x) {
    if (x.tipo === 'img') return x.img ? '<div class="va-slide img"><img src="' + esc(x.img) + '" alt=""></div>' : '';
    var fotos = (x.auto === 'novos' ? novidades() : x.auto === 'promo' ? promo() : maisProvados()).slice(0, 2);
    var lado = x.img ? '<div class="fs"><img src="' + esc(x.img) + '" alt="" style="width:72px;height:72px"></div>' : '<div class="fs">' + fotos.map(function (p) { return '<img src="' + esc(p.img) + '" alt="">'; }).join('') + '</div>';
    return '<div class="va-slide"' + (x.fundo ? ' style="background:' + esc(x.fundo) + '"' : '') + '><div class="t"><b>' + esc(x.titulo) + '</b><small>' + esc(x.sub) + '</small></div>' + lado + '</div>';
  }
  function vaiBanner(i) {
    var tri = root.querySelector('.va-trilho'), pts = root.querySelector('.va-pts'); if (!tri) return;
    ban.i = (i + ban.n) % ban.n; tri.style.transform = 'translateX(-' + ban.i * 100 + '%)';
    pts.innerHTML = Array.apply(null, { length: ban.n }).map(function (_, j) { return '<i class="' + (j === ban.i ? 'on' : '') + '"></i>'; }).join('');
  }

  function monta() {
    var L = X.loja, wa = L.whatsapp ? 'https://wa.me/' + String(L.whatsapp).replace(/\D/g, '') + '?text=' + encodeURIComponent('Olá! Vim pelo catálogo da ' + L.nome + '.') : '';
    var sl = slides().map(slideHTML).filter(Boolean); ban.n = Math.max(sl.length, 1);
    var topo = maisProvados()[0] || X.catalog[0];
    root.innerHTML =
      '<div class="va-perfil"><div class="va-av">' + (L.logo ? '<img src="' + esc(L.logo) + '" alt="">' : '') + '</div><div><h1>' + esc(L.nome) + '</h1>' + (L.bio && norm(L.bio) !== norm(L.nome) ? '<p>' + esc(L.bio) + '</p>' : '') + '</div>' +
        '<div class="va-acoes">' + (wa ? '<a href="' + esc(wa) + '" target="_blank" rel="noopener" aria-label="WhatsApp da loja">' + IC.wa.replace('<svg', '<svg fill="currentColor"') + '</a>' : '') +
        '<button type="button" data-acao="admin" aria-label="Gerenciar catálogo" title="Gerenciar catálogo">' + IC.gear + '</button></div></div>' +
      (sl.length ? '<div class="va-banner"><div class="va-trilho">' + sl.join('') + '</div><div class="va-pts"></div></div>' : '') +
      '<div class="va-stories"></div>' +
      '<div class="va-busca"><input type="search" placeholder="Buscar armação" aria-label="Buscar armação" autocomplete="off"><div class="va-chips"></div></div>' +
      (topo ? '<div class="va-dest" data-p="' + esc(topo.id) + '"><img src="' + esc(topo.img) + '" alt=""><div><b>' + IC.spark + ' Prove no seu rosto</b><small>Tire uma selfie e veja a armação em você em segundos.</small><span class="bt">Experimentar agora</span></div></div>' : '') +
      '<div class="va-sec va-top"><h2><span>' + IC.trend + ' Top 10 mais provados</span><small>últimos 30 dias</small></h2><div class="va-rank"></div></div>' +
      '<div class="va-sec"><h2><span class="va-tit">Todas</span><small class="va-n"></small></h2><div class="va-grade"></div></div>' +
      '<nav class="va-tab"><a class="on" data-acao="inicio">' + IC.home + 'Início</a><a data-acao="busca">' + IC.busca + 'Buscar</a><a data-acao="alta">' + IC.trend + 'Em alta</a>' +
        (wa ? '<a class="wa" href="' + esc(wa) + '" target="_blank" rel="noopener"><i>' + IC.wa + '</i>WhatsApp</a>' : '<a data-acao="inicio"></a>') + '</nav>' +
      (wa ? '<a class="va-zap" href="' + esc(wa) + '" target="_blank" rel="noopener">' + IC.wa + ' Fale com a loja</a>' : '');
    root.querySelector('.va-busca input').value = estado.q;
    root.querySelector('.va-busca input').addEventListener('input', function () { estado.q = this.value; pintaGrade(); });
    root.addEventListener('click', clique);
    vaiBanner(0); clearInterval(ban.t); if (ban.n > 1) ban.t = setInterval(function () { vaiBanner(ban.i + 1); }, 4000);
    pintaStories(); pintaRank(); pintaGrade(); ligaArrastar();
  }
  function pintaStories() {
    var a = maisProvados(), n = novidades(), pr = promo();
    var itens = [['__alta', 'Em alta', a[0] && a[0].img], ['__novos', 'Novidades', n[0] && n[0].img], ['__promo', 'Promoções', pr[0] && pr[0].img]]
      .concat(X.cats.map(function (c) { return [c, c, X.icone(c)]; })).filter(function (s) { return s[2]; });
    root.querySelector('.va-stories').innerHTML = itens.map(function (s) {
      return '<button type="button" class="' + (estado.cat === s[0] ? 'on' : '') + '" data-cat="' + esc(s[0]) + '"><i class="r"><img src="' + esc(s[2]) + '" alt=""></i><span>' + esc(s[1]) + '</span></button>';
    }).join('');
  }
  function pintaRank() {
    var l = maisProvados(), box = root.querySelector('.va-top');
    box.hidden = l.length < 3;
    box.querySelector('.va-rank').innerHTML = l.map(card).join('');
  }
  function pintaGrade() {
    var l = lista();
    root.querySelector('.va-grade').innerHTML = l.length ? l.map(function (p) { return card(p); }).join('') : '<p class="va-vazio">Nenhuma armação encontrada.</p>';
    root.querySelector('.va-n').textContent = l.length + (l.length === 1 ? ' item' : ' itens');
    root.querySelector('.va-tit').textContent = titulo();
    root.querySelector('.va-chips').innerHTML = [''].concat(X.cats).map(function (c) {
      return '<button type="button" class="' + (c === estado.cat ? 'on' : '') + '" data-cat="' + esc(c) + '">' + esc(c || 'Todas') + '</button>';
    }).join('');
    [].forEach.call(root.querySelectorAll('.va-stories button'), function (b) { b.classList.toggle('on', b.getAttribute('data-cat') === estado.cat); });
  }
  function produto(id) { return X.catalog.find(function (p) { return String(p.id) === String(id); }); }
  function clique(ev) {
    var el = ev.target.closest('[data-provar],[data-p],[data-cat],[data-acao]'); if (!el || !root.contains(el)) return;
    if (el.hasAttribute('data-provar')) { ev.preventDefault(); ev.stopPropagation(); var pp = produto(el.getAttribute('data-provar')); if (pp) X.provar(pp); return; }
    if (el.hasAttribute('data-p')) { var p = produto(el.getAttribute('data-p')); if (p) X.abrir(p); return; }
    if (el.hasAttribute('data-cat')) {
      estado.cat = el.getAttribute('data-cat');
      if (estado.cat.indexOf('__') !== 0) X.mudouCategoria(estado.cat);
      pintaGrade(); root.querySelector('.va-grade').closest('.va-sec').scrollIntoView({ behavior: 'smooth', block: 'start' }); return;
    }
    var a = el.getAttribute('data-acao');
    if (a === 'admin') X.admin();
    else if (a === 'inicio') { estado.cat = ''; estado.q = ''; root.querySelector('.va-busca input').value = ''; pintaGrade(); window.scrollTo({ top: 0, behavior: 'smooth' }); document.getElementById('app').scrollTop = 0; }
    else if (a === 'busca') { var inp = root.querySelector('.va-busca input'); inp.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(function () { inp.focus(); }, 300); }
    else if (a === 'alta') { var t = root.querySelector('.va-top'); if (!t.hidden) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); else { estado.cat = '__alta'; pintaGrade(); } }
  }

  function buscaContagem() {
    if (contagemDe === X.loja.slug) return;
    contagemDe = X.loja.slug;
    fetch(X.sb.url + '/rest/v1/rpc/pl_catalog_mais_provados', {
      method: 'POST', headers: { apikey: X.sb.key, Authorization: 'Bearer ' + X.sb.key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_slug: X.loja.slug, p_dias: 30 })
    }).then(function (r) { return r.ok ? r.json() : []; }).then(function (rows) {
      contagem = {}; (rows || []).forEach(function (r) { contagem[r.product_id] = Number(r.provas) || 0; });
      if (root && X) { pintaStories(); pintaRank(); pintaGrade(); }
    }).catch(function () {});
  }

  window.PLVitrineApp = {
    render: function (ctx) {
      X = ctx;
      var tela = document.getElementById('screen-catalog'); if (!tela) return;
      if (!root) { root = document.createElement('div'); root.className = 'va'; root.id = 'vitrine-app'; tela.insertBefore(root, tela.firstChild); }
      if (ctx.catInicial && X.cats.indexOf(ctx.catInicial) >= 0 && !estado.tocou) estado.cat = ctx.catInicial;
      estado.tocou = true;
      monta(); buscaContagem();
    },
    remove: function () { if (root) { root.remove(); root = null; } clearInterval(ban.t); }
  };
  // a barra de baixo só aparece na vitrine (some no produto, na prova e no painel)
  // No computador não tem dedo: as faixas que rolam de lado (categorias, filtros, Top 10)
  // passam a ser arrastadas com o mouse. Arrastou = não conta como clique no item.
  function arrastavel(el) {
    if (!el || el._arr) return; el._arr = true;
    var x0 = 0, s0 = 0, ativo = false, moveu = false;
    el.style.cursor = 'grab';
    el.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse' || e.button !== 0) return; ativo = true; moveu = false; x0 = e.clientX; s0 = el.scrollLeft; });
    window.addEventListener('pointermove', function (e) {
      if (!ativo) return; var dx = e.clientX - x0;
      if (!moveu && Math.abs(dx) > 5) { moveu = true; el.style.cursor = 'grabbing'; el.style.scrollBehavior = 'auto'; el.style.userSelect = 'none'; }
      if (moveu) { el.scrollLeft = s0 - dx; e.preventDefault(); }
    });
    window.addEventListener('pointerup', function () { if (!ativo) return; ativo = false; el.style.cursor = 'grab'; el.style.userSelect = ''; });
    el.addEventListener('click', function (e) { if (moveu) { e.preventDefault(); e.stopPropagation(); moveu = false; } }, true);
    el.addEventListener('dragstart', function (e) { e.preventDefault(); });
  }
  function ligaArrastar() { ['.va-stories', '.va-chips', '.va-rank'].forEach(function (s) { arrastavel(root && root.querySelector(s)); }); }

  var olhaTela = function () { var c = document.getElementById('screen-catalog'); document.body.classList.toggle('va-na-vitrine', !!(c && c.classList.contains('active'))); };
  var appEl = document.getElementById('app');
  if (appEl) new MutationObserver(olhaTela).observe(appEl, { subtree: true, attributes: true, attributeFilter: ['class'] });
  olhaTela();
})();
