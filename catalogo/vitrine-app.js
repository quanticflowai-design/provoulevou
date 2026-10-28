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
    '.va{font-family:"Plus Jakarta Sans","Hanken Grotesk",system-ui,sans-serif;color:#111827;background:#fff}',
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
    '.va-trilho{display:flex;height:100%;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;scrollbar-width:none;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;cursor:grab}.va-trilho::-webkit-scrollbar{display:none}.va-trilho.arrastando{scroll-snap-type:none;cursor:grabbing;user-select:none}',
    '.va-slide{flex:0 0 100%;height:100%;scroll-snap-align:start;scroll-snap-stop:always;display:flex;align-items:center;gap:10px;padding:0 16px;color:#fff;background:linear-gradient(120deg,var(--brand-dark),var(--brand))}',
    '.va-slide .t{flex:1;min-width:0}.va-slide b{display:block;font-family:"Bricolage Grotesque",sans-serif;font-size:17px;line-height:1.15}.va-slide small{opacity:.88;font-size:12px}',
    '.va-slide .fs{display:flex;gap:6px}.va-slide .fs img{width:60px;height:60px;border-radius:12px;object-fit:cover;background:#fff;box-shadow:0 4px 10px rgba(0,0,0,.2)}',
    '.va-slide.img{padding:0}.va-slide.img img{width:100%;height:100%;object-fit:cover}',
    '.va-banner img{-webkit-user-drag:none;user-select:none;pointer-events:none}.va-pts i{cursor:pointer}',
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
    '.va-top{margin:14px 16px 0;border-radius:18px;background:linear-gradient(135deg,var(--brand-dark),var(--brand));color:#fff;padding:16px 0 14px;overflow:hidden}',
    '.va-top h2{font-family:"Plus Jakarta Sans",sans-serif;font-size:17px;margin:0 16px 12px;display:flex;justify-content:space-between;align-items:center;gap:8px}.va-top h2 span{display:flex;align-items:center;gap:6px}.va-top h2 small{font-size:12px;font-weight:600;opacity:.85}',
    '.va-top .va-rank{padding:0 16px 2px;scroll-padding:0 16px}.va-top .va-card{box-shadow:none}',
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
    '.va-tab a svg,.va .va-tab a svg.i{width:22px;height:22px;display:block;margin:2px auto 1px}',
    '.va-tab a.wa i{display:block;background:#25d366;border-radius:50%;width:34px;height:34px;margin:0 auto}.va-tab a.wa svg{width:18px;height:18px;margin:0 auto;position:relative;top:8px;fill:#fff}',
    'html.layout-app body:not(.va-na-vitrine) .va-tab{display:none}',
    '.va svg.i{width:1.05em;height:1.05em;flex-shrink:0}',
    // selo "Provador Virtual" (o mesmo das lojas) sobre as fotos
    '@keyframes va-tremida{0%,50%,100%{transform:rotate(0)}10%,30%{transform:rotate(-10deg)}20%,40%{transform:rotate(10deg)}}',
    '.va-selo{position:absolute;right:7px;bottom:7px;width:40px;height:40px;z-index:2;pointer-events:none;filter:drop-shadow(0 2px 6px rgba(0,0,0,.25))}',
    '.va-selo img{width:100%;height:100%;object-fit:contain}',
    '.vp-selo-pv{position:absolute;right:12px;top:12px;width:72px;height:72px;z-index:3;border:0;background:none;padding:0;cursor:pointer;filter:drop-shadow(0 3px 10px rgba(0,0,0,.22));animation:va-tremida 3s infinite}',
    '.vp-selo-pv img{width:100%;height:100%;object-fit:contain}',
    '@media(min-width:900px){.va-selo{width:46px;height:46px}.vp-selo-pv{width:84px;height:84px;right:16px;top:16px}}',
    '.va-oculto{display:none!important}body.va-ed .va-oculto{display:block!important;opacity:.35}body.va-ed .va-stories.va-oculto{display:flex!important}body.va-ed .va-busca.va-oculto{display:block!important}',
    '.va-ed-btn{position:fixed;right:max(14px,calc(50% - 266px));bottom:calc(84px + env(safe-area-inset-bottom));z-index:31;border:0;background:#111;color:#fff;border-radius:999px;padding:10px 15px;font:700 13px/1 "Plus Jakarta Sans",system-ui,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.25);display:flex;align-items:center;gap:7px}',
    // só aparece pro dono logado (o app.js marca html.is-lojista quando valida a sessão)
    'html:not(.is-lojista) .va-ed-btn,html.layout-app body:not(.va-na-vitrine) .va-ed-btn,body.va-ed .va-ed-btn{display:none!important}',
    'body.va-ed .va-tab,body.va-ed .va-zap{display:none!important}body.va-ed #screen-catalog{padding-top:56px}body.va-ed .va-busca{position:static}',
    '.va-ed-bar{position:fixed;top:0;left:0;right:0;z-index:70;display:flex;align-items:center;gap:10px;background:#111;color:#fff;padding:10px 14px;font:13px/1.3 "Plus Jakarta Sans",system-ui,sans-serif}',
    '.va-ed-bar span{flex:1;opacity:.75;font-size:12.5px}.va-ed-bar button{border:0;border-radius:999px;padding:8px 13px;font:700 12.5px/1 inherit;background:rgba(255,255,255,.15);color:#fff;cursor:pointer}.va-ed-bar .ok{background:#22c55e}',
    '@media(max-width:600px){.va-ed-bar span{display:none}}',
    '.va-edt{display:flex;align-items:center;gap:6px;margin:14px 16px 4px;padding:7px 8px 7px 12px;border:1px dashed #c7c9d9;border-radius:12px;background:#fafafa;font-size:12.5px;font-weight:700}',
    '.va-edt .nm{flex:1;min-width:0}.va-edt em{font-style:normal;font-weight:600;color:#ef4444}',
    '.va-edt button{display:flex;align-items:center;gap:5px;border:1px solid #e5e7eb;background:#fff;border-radius:8px;height:30px;min-width:30px;justify-content:center;padding:0 8px;font-size:12px;font-weight:700;color:#374151}',
    '.va-edt button svg.i{width:15px;height:15px}.va-edt.oc .olho{border-color:var(--brand);color:var(--brand)}',
    // faixas que rolam de lado: somem num degradê na borda em vez de cortar o item seco
    '.va-stories.mais-dir,.va-chips.mais-dir,.va-rank.mais-dir{-webkit-mask-image:linear-gradient(to right,#000 calc(100% - 56px),transparent);mask-image:linear-gradient(to right,#000 calc(100% - 56px),transparent)}',
    '.va-stories.mais-esq.mais-dir,.va-chips.mais-esq.mais-dir,.va-rank.mais-esq.mais-dir{-webkit-mask-image:linear-gradient(to right,transparent,#000 56px,#000 calc(100% - 56px),transparent);mask-image:linear-gradient(to right,transparent,#000 56px,#000 calc(100% - 56px),transparent)}',
    '.va-stories.mais-esq:not(.mais-dir),.va-chips.mais-esq:not(.mais-dir),.va-rank.mais-esq:not(.mais-dir){-webkit-mask-image:linear-gradient(to right,transparent,#000 56px);mask-image:linear-gradient(to right,transparent,#000 56px)}',
    // ── página do produto (igual à prévia) ──
    'html.layout-app #screen-product.va-pg{padding:0}',
    // a animação de entrada da tela deixa um transform que prende as barras fixas dentro dela
    'html.layout-app #screen-product.va-pg,html.layout-app #screen-catalog{animation:none;transform:none}',
    'html.layout-app #screen-product.va-pg>:not(#va-produto){display:none!important}',
    '.vp{font-family:"Plus Jakarta Sans","Hanken Grotesk",system-ui,sans-serif;color:#111827;background:#fff;min-height:100dvh}',
    '.vp *{box-sizing:border-box}.vp img{display:block;max-width:100%}.vp button{font:inherit;cursor:pointer}',
    '.vp-topo{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:10px;padding:10px 16px;background:rgba(255,255,255,.92);border-bottom:1px solid #eef0f3;backdrop-filter:blur(10px)}',
    '.vp-volta{display:flex;align-items:center;gap:4px;border:0;background:none;font-weight:700;font-size:14px;padding:6px 2px;color:inherit}.vp-volta svg{width:20px;height:20px}',
    '.vp-topo img{height:30px;width:auto;margin-left:auto}',
    '.vp-corpo{max-width:1120px;margin:0 auto}',
    '.vp-trilha{font-size:12.5px;color:#6b7280;padding:12px 16px 0}.vp-trilha a{color:inherit;text-decoration:none;cursor:pointer}.vp-trilha span{margin:0 6px;opacity:.6}',
    '.vp-gal{padding:12px 16px 0}.vp-principal{position:relative;border-radius:18px;overflow:hidden;background:#f6f7f9}',
    '.vp-principal img{width:100%;aspect-ratio:1;object-fit:cover}',
    '.vp-selo{position:absolute;left:12px;top:12px;background:#ef4444;color:#fff;font-weight:800;font-size:12.5px;border-radius:8px;padding:4px 9px}',
    '.vp-thumbs{display:flex;gap:8px;margin-top:10px;overflow-x:auto;scrollbar-width:none}.vp-thumbs button{flex:0 0 64px;border:2px solid transparent;border-radius:12px;overflow:hidden;padding:0;background:none;opacity:.7}',
    '.vp-thumbs button.on{border-color:var(--brand);opacity:1}.vp-thumbs img{width:100%;height:64px;object-fit:cover}.vp-thumbs small{display:block;font-size:10.5px;font-weight:700;padding:3px 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.vp-dir{padding:18px 16px 0}',
    '.vp-cat{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--brand)}',
    '.vp-dir h1{font-size:24px;line-height:1.2;margin:6px 0 8px;font-weight:800}',
    '.vp-prova{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;color:#6b7280;background:#f6f7f9;border-radius:999px;padding:5px 10px}.vp-prova svg{width:14px;height:14px}',
    '.vp-precos{margin:16px 0 4px;display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}.vp-p{font-size:30px;font-weight:800;letter-spacing:-.01em}',
    '.vp-d{font-size:15px;color:#6b7280;text-decoration:line-through}.vp-eco{font-size:12.5px;font-weight:800;color:#16a34a;background:#dcfce7;border-radius:6px;padding:3px 7px}',
    '.vp-parc{font-size:14px;color:#6b7280;margin-bottom:18px}.vp-parc b{color:#111827}',
    '.vp-provar{width:100%;border:0;background:linear-gradient(135deg,var(--brand),#7c3aed);color:#fff;border-radius:14px;padding:16px;font-size:16px;font-weight:800;display:flex;align-items:center;justify-content:center;gap:8px}.vp-provar svg{width:18px;height:18px}',
    '.vp-wa{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-top:10px;border:0;background:#25d366;color:#fff;border-radius:14px;padding:14px;font-weight:800;font-size:15px}',
    '.vp-gar{display:grid;gap:10px;margin:20px 0 4px;padding:14px;border:1px solid #eef0f3;border-radius:14px}',
    '.vp-gar div{display:flex;gap:10px;align-items:flex-start;font-size:13px;color:#6b7280;line-height:1.35}.vp-gar b{display:block;color:#111827;font-size:13.5px}',
    '.vp-gar svg{flex:0 0 20px;width:20px;height:20px;color:var(--brand);margin-top:1px}',
    '.vp-sec{border-top:1px solid #eef0f3;margin-top:18px}.vp-sec summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;padding:16px 0;font-weight:800;font-size:15px}',
    '.vp-sec summary::-webkit-details-marker{display:none}.vp-sec summary:after{content:"+";font-size:20px;font-weight:400;color:#6b7280}.vp-sec[open] summary:after{content:"−"}',
    '.vp-txt{font-size:14px;line-height:1.6;color:#4b5563;white-space:pre-line;padding-bottom:14px}',
    '.vp-tab{width:100%;border-collapse:collapse;font-size:13.5px;margin-bottom:14px}.vp-tab td{padding:9px 0;border-bottom:1px solid #eef0f3}.vp-tab td:first-child{color:#6b7280;width:45%}',
    '.vp-passos{display:grid;gap:12px;padding-bottom:14px}.vp-passos div{display:flex;gap:12px;align-items:center;font-size:13.5px;color:#4b5563}',
    '.vp-passos i{flex:0 0 28px;height:28px;border-radius:50%;background:var(--brand);color:#fff;font-style:normal;font-weight:800;display:flex;align-items:center;justify-content:center;font-size:13px}',
    '.vp-relw{max-width:1120px;margin:0 auto;padding:8px 16px 110px}.vp-relw h3{font-size:18px;margin:18px 0 12px}',
    '.vp-relg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}',
    '.vp-relg button{border:1px solid #eef0f3;background:#fff;border-radius:14px;overflow:hidden;padding:0;text-align:left;color:inherit}',
    '.vp-relg img{width:100%;aspect-ratio:1;object-fit:cover}.vp-relg span{display:block;padding:8px 10px 0;font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.vp-relg b{display:block;padding:2px 10px 10px;font-size:14px}',
    '.vp-barra{position:fixed;left:50%;transform:translateX(-50%);width:min(560px,100%);bottom:0;z-index:6;display:flex;align-items:center;gap:12px;padding:10px 16px calc(10px + env(safe-area-inset-bottom));background:#fff;border-top:1px solid #eef0f3;box-shadow:0 -6px 20px rgba(0,0,0,.06)}',
    '.vp-barra div{flex:1;min-width:0}.vp-barra small{display:block;font-size:11.5px;color:#6b7280}.vp-barra b{font-size:18px}',
    '.vp-barra .vp-provar{width:auto;flex:0 0 auto;padding:13px 18px}',
    'html.layout-app body:not(.va-no-produto) .vp-barra{display:none}',
    // ── modo computador (27/10, Lucas) ──
    '.va-zap{display:none}',
    '@media(min-width:900px){',
    'html.layout-app #app{max-width:1240px}',
    'html.layout-app #screen-catalog{padding-bottom:40px}',
    'html.layout-app .screen:not(#screen-catalog):not(#screen-product){max-width:560px;margin-left:auto;margin-right:auto}',
    '.va-perfil{padding:28px 32px 18px;gap:18px}.va-av{flex-basis:92px;width:92px;height:92px}.va-perfil h1{font-size:26px}.va-perfil p{font-size:14px}.va-acoes{top:26px;right:28px}',
    '.va-banner{margin:4px 32px 14px}.va-slide{padding:0 48px;gap:24px}.va-slide b{font-size:34px}.va-slide small{font-size:16px}.va-slide .fs{gap:12px}.va-slide .fs img{width:150px;height:150px;border-radius:18px}',
    '.va-stories{gap:22px;padding:10px 0 20px;margin:0 32px}.va-stories button{width:84px}.va-stories button span{max-width:84px;font-size:12.5px}.va-stories .r{width:80px;height:80px}',
    '.va-busca{padding:14px 32px;display:flex;gap:16px;align-items:center}.va-busca input{flex:0 0 340px;width:340px}.va-chips{margin-top:0;flex:1;min-width:0}',
    '.va-top{margin:22px 32px 0;padding:22px 0 18px}.va-top h2{font-size:22px;margin:0 24px 14px}.va-top .va-rank{padding:0 24px 2px}',
    '.va-sec{padding:28px 32px 6px}.va-sec h2{font-size:22px}',
    '.va-rank{grid-auto-columns:220px;gap:14px}',
    '.va-grade{grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:16px}',
    '.va-card{transition:transform .15s,box-shadow .2s}.va-card:hover{transform:translateY(-3px);box-shadow:0 0 0 1px #e5e7eb,0 10px 24px rgba(0,0,0,.08)}',
    '.va-card .nm{font-size:14px}.va-card .pr{font-size:16.5px}.va-card .bt{padding:10px;font-size:13.5px}.va-card .bt:hover{background:var(--brand);color:#fff}',
    '.va-tab{display:none!important}',
    '.va-zap{display:flex;position:fixed;right:28px;bottom:28px;z-index:30;align-items:center;gap:8px;background:#25d366;color:#fff;border-radius:999px;padding:13px 18px;font-weight:800;font-size:14px;text-decoration:none;box-shadow:0 8px 24px rgba(0,0,0,.18)}',
    '.va-zap svg{width:20px;height:20px;fill:#fff}',
    '.va-ed-btn{right:28px;bottom:92px}.va-edt{margin:18px 32px 4px}',
    'html.layout-app body:not(.va-na-vitrine) .va-zap{display:none}',
    '.vp-corpo{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:44px;padding:8px 24px 40px;align-items:start}',
    '.vp-trilha{grid-column:1/-1;padding:16px 0 0}.vp-gal{padding:0;position:sticky;top:70px}.vp-dir{padding:0}.vp-dir h1{font-size:30px}',
    '.vp-relw{padding:0 24px 60px}.vp-relg{grid-template-columns:repeat(4,minmax(0,1fr))}.vp-barra{display:none!important}',
    '}'
  ].join('\n');
  var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  // fonte do tema App (a da prévia)
  var fn = document.createElement('link'); fn.rel = 'stylesheet'; fn.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'; document.head.appendChild(fn);

  var I = function (d, fill) { return '<svg class="i" viewBox="0 0 24 24" fill="' + (fill ? 'currentColor' : 'none') + '" stroke="' + (fill ? 'none' : 'currentColor') + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; };
  var IC = {
    spark: I('<path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0l1.58 6.14a2 2 0 0 0 1.44 1.44l6.14 1.58a.5.5 0 0 1 0 .96l-6.14 1.58a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z"/>'),
    trend: I('<path d="M22 7 13.5 15.5 8.5 10.5 2 17"/><path d="M16 7h6v6"/>'),
    home: I('<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .71-1.53l7-6a2 2 0 0 1 2.58 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
    lapis: I('<path d="M21.17 6.81a1 1 0 0 0-3.98-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z"/>'),
    olho: I('<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/>'),
    olhoX: I('<path d="M10.73 5.08a10.74 10.74 0 0 1 11.2 6.57 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-1.44 2.49"/><path d="M14.08 14.16a3 3 0 0 1-4.24-4.24"/><path d="M17.48 17.5a10.75 10.75 0 0 1-15.42-5.15 1 1 0 0 1 0-.7 10.75 10.75 0 0 1 4.45-5.14"/><path d="m2 2 20 20"/>'),
    cima: I('<path d="m18 15-6-6-6 6"/>'), baixo: I('<path d="m6 9 6 6 6-6"/>'),
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

  var SELO = 'selo-provador.png?v=1';
  var SELO_MINI = '<span class="va-selo"><img src="' + SELO + '" alt="Provador virtual" loading="lazy"></span>';
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
  // Banner = faixa com rolagem lateral nativa e "encaixe" (scroll-snap): no celular o dedo desliza como
  // em qualquer carrossel, sem depender de evento de toque (o arrasto por pointer falhava no iPhone).
  function pintaPts() {
    var pts = root.querySelector('.va-pts'); if (!pts) return;
    pts.innerHTML = Array.apply(null, { length: ban.n }).map(function (_, j) { return '<i class="' + (j === ban.i ? 'on' : '') + '"></i>'; }).join('');
  }
  function vaiBanner(i, instantaneo) {
    var tri = root.querySelector('.va-trilho'); if (!tri) return;
    ban.i = (i + ban.n) % ban.n;
    tri.scrollTo({ left: ban.i * tri.clientWidth, behavior: instantaneo ? 'auto' : 'smooth' });
    pintaPts();
  }
  function autoBanner() { clearInterval(ban.t); if (ban.n > 1 && !ED.on) ban.t = setInterval(function () { vaiBanner(ban.i + 1); }, 4500); }
  function arrastaBanner() {
    var b = root.querySelector('.va-banner'), tri = b && b.querySelector('.va-trilho'); if (!b) return;
    var fim = null;
    // dedo ou rolagem: atualiza a bolinha e pausa a troca automática enquanto a pessoa mexe
    tri.addEventListener('scroll', function () {
      var i = Math.round(tri.scrollLeft / Math.max(1, tri.clientWidth));
      if (i !== ban.i && i >= 0 && i < ban.n) { ban.i = i; pintaPts(); }
      clearTimeout(fim); fim = setTimeout(autoBanner, 600);
    }, { passive: true });
    tri.addEventListener('touchstart', function () { clearInterval(ban.t); }, { passive: true });
    window.addEventListener('resize', function () { vaiBanner(ban.i, true); });
    // mouse (computador): arrasta e solta encaixando no slide mais perto
    var x0 = 0, s0 = 0, ativo = false, moveu = false;
    tri.addEventListener('mousedown', function (e) { if (e.button !== 0) return; ativo = true; moveu = false; x0 = e.clientX; s0 = tri.scrollLeft; clearInterval(ban.t); e.preventDefault(); });
    window.addEventListener('mousemove', function (e) {
      if (!ativo) return; var dx = e.clientX - x0;
      if (!moveu && Math.abs(dx) > 5) { moveu = true; tri.classList.add('arrastando'); }
      if (moveu) tri.scrollLeft = s0 - dx;
    });
    window.addEventListener('mouseup', function (e) {
      if (!ativo) return; ativo = false; tri.classList.remove('arrastando');
      if (moveu) { var dx = e.clientX - x0, w = tri.clientWidth; vaiBanner(Math.abs(dx) > Math.min(60, w * 0.15) ? ban.i + (dx < 0 ? 1 : -1) : ban.i); }
      autoBanner();
    });
    b.querySelector('.va-pts').addEventListener('click', function (e) { var i = [].indexOf.call(this.children, e.target); if (i >= 0) { vaiBanner(i); autoBanner(); } });
  }
  function monta() {
    var L = X.loja, wa = L.whatsapp ? 'https://wa.me/' + String(L.whatsapp).replace(/\D/g, '') + '?text=' + encodeURIComponent('Olá! Vim pelo catálogo da ' + L.nome + '.') : '';
    var sl = slides().map(slideHTML).filter(Boolean); ban.n = Math.max(sl.length, 1);
    var topo = maisProvados()[0] || X.catalog[0];
    root.innerHTML =
      '<div class="va-blocos">' +
      '<div class="va-perfil" data-bl="perfil"><div class="va-av">' + (L.logo ? '<img src="' + esc(L.logo) + '" alt="">' : '') + '</div><div><h1>' + esc(L.nome) + '</h1>' + (L.bio && norm(L.bio) !== norm(L.nome) ? '<p>' + esc(L.bio) + '</p>' : '') + '</div>' +
        '<div class="va-acoes">' + (wa ? '<a href="' + esc(wa) + '" target="_blank" rel="noopener" aria-label="WhatsApp da loja">' + IC.wa.replace('<svg', '<svg fill="currentColor"') + '</a>' : '') +
        '<button type="button" data-acao="admin" aria-label="Gerenciar catálogo" title="Gerenciar catálogo">' + IC.gear + '</button></div></div>' +
      (sl.length ? '<div class="va-banner" data-bl="banner"><div class="va-trilho">' + sl.join('') + '</div><div class="va-pts"></div></div>' : '') +
      '<div class="va-stories" data-bl="categorias"></div>' +
      '<div class="va-busca" data-bl="busca"><input type="search" placeholder="Buscar armação" aria-label="Buscar armação" autocomplete="off"><div class="va-chips"></div></div>' +
      '<div class="va-top" data-bl="top"><h2><span>' + IC.trend + ' Top 10 mais provados</span><small>últimos 30 dias</small></h2><div class="va-rank"></div></div>' +
      '<div class="va-sec" data-bl="grade"><h2><span class="va-tit">Todas</span><small class="va-n"></small></h2><div class="va-grade"></div></div>' +
      '</div>' +
      '<nav class="va-tab"><a class="on" data-acao="inicio">' + IC.home + 'Início</a><a data-acao="busca">' + IC.busca + 'Buscar</a><a data-acao="alta">' + IC.trend + 'Em alta</a>' +
        (wa ? '<a class="wa" href="' + esc(wa) + '" target="_blank" rel="noopener"><i>' + IC.wa + '</i>WhatsApp</a>' : '<a data-acao="inicio"></a>') + '</nav>' +
      (wa ? '<a class="va-zap" href="' + esc(wa) + '" target="_blank" rel="noopener">' + IC.wa + ' Fale com a loja</a>' : '') +
      '<button type="button" class="va-ed-btn" data-acao="editar">' + IC.lapis + ' Personalizar</button>';
    root.querySelector('.va-busca input').value = estado.q;
    root.querySelector('.va-busca input').addEventListener('input', function () { estado.q = this.value; pintaGrade(); });
    root.addEventListener('click', clique);
    vaiBanner(0, true); autoBanner(); arrastaBanner();
    pintaStories(); pintaRank(); pintaGrade(); ligaArrastar();
    aplicaBlocos(); if (ED.on) ferramentas();
  }
  // Foto da bolinha: ícone escolhido pra loja (tema.catImgs) ou, sem ele, a armação DAQUELA categoria
  // mais provada nos últimos 30 dias (sem provas, a primeira da vitrine).
  function capaCategoria(c) {
    var m = (X.tema && X.tema.catImgs) || {};
    var k = Object.keys(m).find(function (x) { return norm(x) === norm(c); });
    if (k) return m[k];
    var l = X.catalog.filter(function (p) { return p.img && X.temCat(p, c); });
    if (!l.length) return '';
    return l.slice().sort(function (a, b) { return provas(b) - provas(a); })[0].img;
  }
  function pintaStories() {
    var a = maisProvados(), n = novidades(), pr = promo();
    var itens = [['__alta', 'Em alta', a[0] && a[0].img], ['__novos', 'Novidades', n[0] && n[0].img], ['__promo', 'Promoções', pr[0] && pr[0].img]]
      .concat(X.cats.map(function (c) { return [c, c, capaCategoria(c)]; })).filter(function (s) { return s[2]; });
    root.querySelector('.va-stories').innerHTML = itens.map(function (s) {
      return '<button type="button" class="' + (estado.cat === s[0] ? 'on' : '') + '" data-cat="' + esc(s[0]) + '"><i class="r"><img src="' + esc(s[2]) + '" alt=""></i><span>' + esc(s[1]) + '</span></button>';
    }).join('');
  }
  function pintaRank() {
    var l = maisProvados(), box = root.querySelector('.va-top');
    box.hidden = l.length < 3;
    box.querySelector('.va-rank').innerHTML = l.map(card).join('');
    bordas(box.querySelector('.va-rank'));
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
    bordas(root.querySelector('.va-chips'));
  }
  // ─────────── Personalizar (só o dono da loja) ───────────
  // 27/10/2026 (Lucas): seção nunca é apagada — só escondida (olho) e reordenada (setas).
  // Fica salvo na loja em tema.blocos = { ordem: [...], ocultos: [...] }.
  var BLOCOS = [['perfil', 'Perfil da loja'], ['banner', 'Banner'], ['categorias', 'Categorias'], ['busca', 'Busca e filtros'], ['top', 'Top 10 mais provados'], ['grade', 'Todas as armações']];
  var ED = { on: false, cfg: null };
  function cfgBlocos() {
    if (ED.cfg) return ED.cfg;
    var b = (X.tema && X.tema.blocos) || {};
    var ordem = (b.ordem || []).filter(function (id) { return BLOCOS.some(function (x) { return x[0] === id; }); });
    BLOCOS.forEach(function (x) { if (ordem.indexOf(x[0]) < 0) ordem.push(x[0]); });
    return { ordem: ordem, ocultos: (b.ocultos || []).slice() };
  }
  function aplicaBlocos() {
    var box = root && root.querySelector('.va-blocos'); if (!box) return;
    var c = cfgBlocos();
    c.ordem.forEach(function (id) { var s = box.querySelector(':scope > [data-bl="' + id + '"]'); if (s) box.appendChild(s); });
    [].forEach.call(box.querySelectorAll(':scope > [data-bl]'), function (s) { s.classList.toggle('va-oculto', c.ocultos.indexOf(s.getAttribute('data-bl')) >= 0); });
  }
  function ferramentas() {
    var box = root.querySelector('.va-blocos'); if (!box) return;
    [].forEach.call(box.querySelectorAll('.va-edt'), function (e) { e.remove(); });
    var c = cfgBlocos();
    [].forEach.call(box.querySelectorAll(':scope > [data-bl]'), function (s) {
      var id = s.getAttribute('data-bl'), nome = (BLOCOS.find(function (x) { return x[0] === id; }) || [id, id])[1], oculto = c.ocultos.indexOf(id) >= 0;
      var t = document.createElement('div'); t.className = 'va-edt' + (oculto ? ' oc' : '');
      t.innerHTML = '<span class="nm">' + esc(nome) + (oculto ? ' <em>· escondida para os clientes</em>' : '') + '</span>' +
        '<button type="button" data-acao="ed-sobe" data-id="' + id + '" title="Subir">' + IC.cima + '</button>' +
        '<button type="button" data-acao="ed-desce" data-id="' + id + '" title="Descer">' + IC.baixo + '</button>' +
        '<button type="button" class="olho" data-acao="ed-olho" data-id="' + id + '" title="' + (oculto ? 'Mostrar' : 'Esconder') + '">' + (oculto ? IC.olhoX + ' Mostrar' : IC.olho + ' Esconder') + '</button>';
      box.insertBefore(t, s);
    });
  }
  function ligaEdicao(on) {
    ED.on = on; if (on) ED.cfg = cfgBlocos();
    document.body.classList.toggle('va-ed', on);
    var bar = document.getElementById('va-ed-bar');
    if (on && !bar) {
      bar = document.createElement('div'); bar.id = 'va-ed-bar'; bar.className = 'va-ed-bar';
      bar.innerHTML = '<b>Personalizar</b><span>Use as setas para mudar a ordem e o olho para esconder uma seção.</span><button type="button" data-acao="ed-cancelar">Cancelar</button><button type="button" class="ok" data-acao="ed-salvar">Salvar</button>';
      bar.addEventListener('click', clique); document.body.appendChild(bar);
    } else if (!on && bar) bar.remove();
    if (on) { ferramentas(); window.scrollTo({ top: 0 }); var a = document.getElementById('app'); if (a) a.scrollTop = 0; }
    else [].forEach.call(root.querySelectorAll('.va-edt'), function (e) { e.remove(); });
    autoBanner();
  }
  function moveBloco(id, d) {
    var o = ED.cfg.ordem, i = o.indexOf(id), j = i + d; if (i < 0 || j < 0 || j >= o.length) return;
    o.splice(i, 1); o.splice(j, 0, id); aplicaBlocos(); ferramentas();
    var s = root.querySelector('.va-blocos > [data-bl="' + id + '"]'); if (s && s.previousElementSibling) s.previousElementSibling.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function olhoBloco(id) {
    var oc = ED.cfg.ocultos, i = oc.indexOf(id);
    if (i >= 0) oc.splice(i, 1); else oc.push(id);
    aplicaBlocos(); ferramentas();
  }
  function salvaEdicao() {
    var cfg = { ordem: ED.cfg.ordem.slice(), ocultos: ED.cfg.ocultos.slice() };
    var b = document.querySelector('#va-ed-bar .ok'); if (b) { b.disabled = true; b.textContent = 'Salvando…'; }
    Promise.resolve(X.salvarBlocos(cfg)).then(function () {
      X.tema = Object.assign({}, X.tema, { blocos: cfg }); ED.cfg = null; ligaEdicao(false); aplicaBlocos(); X.aviso('Catálogo salvo ✓');
    }).catch(function () { if (b) { b.disabled = false; b.textContent = 'Salvar'; } X.aviso('Não consegui salvar. Tente de novo.'); });
  }

  function produto(id) { return X.catalog.find(function (p) { return String(p.id) === String(id); }); }
  function clique(ev) {
    var el = ev.target.closest('[data-provar],[data-p],[data-cat],[data-acao]'); if (!el || !(root.contains(el) || el.closest('#va-ed-bar'))) return;
    if (ED.on && !/^(ed-|editar)/.test(el.getAttribute('data-acao') || '')) { ev.preventDefault(); return; }
    if (el.hasAttribute('data-provar')) { ev.preventDefault(); ev.stopPropagation(); var pp = produto(el.getAttribute('data-provar')); if (pp) X.provar(pp); return; }
    if (el.hasAttribute('data-p')) { var p = produto(el.getAttribute('data-p')); if (p) X.abrir(p); return; }
    if (el.hasAttribute('data-cat')) {
      estado.cat = el.getAttribute('data-cat');
      if (estado.cat.indexOf('__') !== 0) X.mudouCategoria(estado.cat);
      pintaGrade(); root.querySelector('.va-grade').closest('.va-sec').scrollIntoView({ behavior: 'smooth', block: 'start' }); return;
    }
    var a = el.getAttribute('data-acao');
    if (a === 'admin') X.admin();
    else if (a === 'editar') { if (document.documentElement.classList.contains('is-lojista')) ligaEdicao(true); }
    else if (a === 'ed-sobe' || a === 'ed-desce') moveBloco(el.getAttribute('data-id'), a === 'ed-sobe' ? -1 : 1);
    else if (a === 'ed-olho') olhoBloco(el.getAttribute('data-id'));
    else if (a === 'ed-salvar') salvaEdicao();
    else if (a === 'ed-cancelar') { ED.cfg = null; ligaEdicao(false); monta(); }
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

  // ─────────── Página do produto (igual à prévia) ───────────
  var IP = {
    volta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
    olho: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    balao: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-4-1L3 20l1.2-4.6A8.4 8.4 0 1 1 21 11.5z"/></svg>',
    escudo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
  };
  var PG = null;   // { p, el, ctx }
  function produtoPagina(p, ctx) {
    if (!X) return false;
    var tela = document.getElementById('screen-product'); if (!tela) return false;
    var el = document.getElementById('va-produto');
    if (!el) { el = document.createElement('div'); el.id = 'va-produto'; el.className = 'vp'; tela.appendChild(el); el.addEventListener('click', cliqueProduto); }
    tela.classList.add('va-pg');
    PG = { p: p, el: el, ctx: ctx };
    var L = X.loja, d = desconto(p), n = provas(p);
    var fotos = (p.imageMeta && p.imageMeta.length ? p.imageMeta : (p.imgs && p.imgs.length ? p.imgs : [p.img]).map(function (u) { return { url: u, variantName: '' }; })).filter(function (f) { return f.url; });
    var temVar = fotos.some(function (f) { return f.variantName; });
    var cat = (p.cats && p.cats[0]) || p.cat || '';
    var par = Number(p.parcelas) || 0, juros = Number(p.installmentInterestRate) || 0;
    var parcTxt = par > 1 ? 'ou <b>' + par + 'x de ' + X.brl(ctx.valorParcela(p, par)) + '</b> ' + (juros ? 'com juros' : 'sem juros') : (par === 1 ? 'à vista' : '&nbsp;');
    var rel = X.catalog.filter(function (x) { return x.id !== p.id && x.img && cat && X.temCat(x, cat); }).slice(0, 8);
    if (rel.length < 4) rel = rel.concat(X.catalog.filter(function (x) { return x.id !== p.id && x.img && rel.indexOf(x) < 0; }).slice(0, 8 - rel.length));
    var GAR = [[IP.olho, 'Prove antes de comprar', 'Veja a armação no seu rosto com uma foto, sem sair de casa.'],
               [IP.balao, 'Atendimento pelo WhatsApp', 'Tire dúvidas de medida, lente e entrega direto com a ótica.'],
               [IP.escudo, 'Compra direto com a ' + esc(L.nome), 'Você combina pagamento e entrega com a própria loja.']];
    el.innerHTML =
      '<div class="vp-topo"><button type="button" class="vp-volta" data-vp="volta">' + IP.volta + ' Voltar</button>' + (L.logo ? '<img src="' + esc(L.logo) + '" alt="' + esc(L.nome) + '">' : '') + '</div>' +
      '<div class="vp-corpo">' +
        '<div class="vp-trilha"><a data-vp="volta">Início</a>' + (cat ? '<span>›</span><a data-vp="cat">' + esc(cat) + '</a>' : '') + '<span>›</span>' + esc(p.name) + '</div>' +
        '<div class="vp-gal"><div class="vp-principal"><img class="vp-foto" src="' + esc(fotos[0] ? fotos[0].url : p.img) + '" alt="' + esc(p.name) + '">' + (d ? '<span class="vp-selo">-' + d + '%</span>' : '') + '<button type="button" class="vp-selo-pv" data-vp="provar" aria-label="Abrir o provador virtual"><img src="' + SELO + '" alt="Provador virtual"></button></div>' +
          (fotos.length > 1 || temVar ? '<div class="vp-thumbs">' + fotos.map(function (f, i) { return '<button type="button" class="' + (i ? '' : 'on') + '" data-foto="' + i + '"><img src="' + esc(f.url) + '" alt="">' + (temVar ? '<small>' + esc(f.variantName || ('Foto ' + (i + 1))) + '</small>' : '') + '</button>'; }).join('') + '</div>' : '') +
        '</div>' +
        '<div class="vp-dir">' + (cat ? '<div class="vp-cat">' + esc(cat) + '</div>' : '') + '<h1>' + esc(p.name) + '</h1>' +
          (n ? '<span class="vp-prova">' + IC.trend + ' ' + n + (n === 1 ? ' pessoa já provou' : ' pessoas já provaram') + '</span>' : '') +
          '<div class="vp-precos"><span class="vp-p">' + X.brl(X.preco(p)) + '</span>' + (d ? '<span class="vp-d">' + X.brl(p.originalPrice) + '</span><span class="vp-eco">Economize ' + X.brl(Number(p.originalPrice) - X.preco(p)) + '</span>' : '') + '</div>' +
          '<div class="vp-parc">' + parcTxt + '</div>' +
          '<button type="button" class="vp-provar" data-vp="provar">' + IC.spark + ' Provar no meu rosto</button>' +
          (L.whatsapp ? '<button type="button" class="vp-wa" data-vp="comprar">Comprar pelo WhatsApp</button>' : '') +
          '<div class="vp-gar">' + GAR.map(function (g) { return '<div>' + g[0] + '<span><b>' + g[1] + '</b>' + g[2] + '</span></div>'; }).join('') + '</div>' +
          (p.desc ? '<details class="vp-sec" open><summary>Descrição</summary><div class="vp-txt">' + esc(p.desc) + '</div></details>' : '') +
          '<details class="vp-sec"' + (p.desc ? '' : ' open') + '><summary>Detalhes do produto</summary><table class="vp-tab">' +
            (cat ? '<tr><td>Categoria</td><td>' + esc((p.cats && p.cats.length ? p.cats : [cat]).join(', ')) + '</td></tr>' : '') +
            '<tr><td>Preço</td><td>' + X.brl(X.preco(p)) + '</td></tr>' +
            (par > 1 ? '<tr><td>Parcelamento</td><td>até ' + par + 'x ' + (juros ? 'com juros' : 'sem juros') + '</td></tr>' : '') +
            (p.unit ? '<tr><td>Unidade</td><td>' + esc(p.unit) + '</td></tr>' : '') +
            '<tr><td>Vendido por</td><td>' + esc(L.nome) + '</td></tr></table></details>' +
          '<details class="vp-sec"><summary>Como funciona a prova virtual</summary><div class="vp-passos">' +
            '<div><i>1</i>Toque em “Provar no meu rosto”.</div><div><i>2</i>Tire ou envie uma foto de frente.</div><div><i>3</i>Veja a armação em você e chame a loja no WhatsApp.</div></div></details>' +
        '</div>' +
      '</div>' +
      (rel.length ? '<div class="vp-relw"><h3>Você também pode gostar</h3><div class="vp-relg">' + rel.map(function (r) {
        return '<button type="button" data-rel="' + esc(r.id) + '"><img src="' + esc(r.img) + '" alt="" loading="lazy"><span>' + esc(r.name) + '</span><b>' + X.brl(X.preco(r)) + '</b></button>';
      }).join('') + '</div></div>' : '') +
      '<div class="vp-barra"><div><small>' + (par > 1 ? par + 'x de ' + X.brl(ctx.valorParcela(p, par)) : esc(p.name)) + '</small><b>' + X.brl(X.preco(p)) + '</b></div><button type="button" class="vp-provar" data-vp="provar">' + IC.spark + ' Provar</button></div>';
    el.scrollTop = 0;
    return true;
  }
  function cliqueProduto(ev) {
    if (!PG) return;
    var el = ev.target.closest('[data-vp],[data-foto],[data-rel]'); if (!el) return;
    if (el.hasAttribute('data-foto')) {
      var i = Number(el.getAttribute('data-foto'));
      PG.ctx.setFoto(i);
      PG.el.querySelector('.vp-foto').src = el.querySelector('img').src;
      [].forEach.call(PG.el.querySelectorAll('.vp-thumbs button'), function (b, j) { b.classList.toggle('on', j === i); });
      return;
    }
    if (el.hasAttribute('data-rel')) { var r = produto(el.getAttribute('data-rel')); if (r) X.abrir(r); return; }
    var a = el.getAttribute('data-vp');
    if (a === 'provar') PG.ctx.provar();
    else if (a === 'comprar') PG.ctx.comprar();
    else if (a === 'volta') PG.ctx.voltar();
    else if (a === 'cat') { var c = (PG.p.cats && PG.p.cats[0]) || PG.p.cat; estado.cat = c; X.mudouCategoria(c); PG.ctx.voltar(true); if (root) { pintaGrade(); setTimeout(function () { root.querySelector('.va-grade').closest('.va-sec').scrollIntoView({ block: 'start' }); }, 50); } }
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
    produto: produtoPagina,
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
  function bordas(el) {
    if (!el) return;
    var f = function () { el.classList.toggle('mais-esq', el.scrollLeft > 4); el.classList.toggle('mais-dir', el.scrollLeft + el.clientWidth < el.scrollWidth - 4); };
    if (!el._bd) { el._bd = true; el.addEventListener('scroll', f, { passive: true }); window.addEventListener('resize', f); }
    f(); setTimeout(f, 300);
  }
  function ligaArrastar() { ['.va-stories', '.va-chips', '.va-rank'].forEach(function (s) { var el = root && root.querySelector(s); arrastavel(el); bordas(el); }); }

  var olhaTela = function () {
    var c = document.getElementById('screen-catalog'), pr = document.getElementById('screen-product');
    document.body.classList.toggle('va-na-vitrine', !!(c && c.classList.contains('active')));
    document.body.classList.toggle('va-no-produto', !!(pr && pr.classList.contains('active') && pr.classList.contains('va-pg')));
  };
  var appEl = document.getElementById('app');
  if (appEl) new MutationObserver(olhaTela).observe(appEl, { subtree: true, attributes: true, attributeFilter: ['class'] });
  olhaTela();
})();
