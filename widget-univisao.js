(function () {
    function toJpeg(file){return new Promise(function(res){try{var img=new Image();var u=URL.createObjectURL(file);img.onload=function(){URL.revokeObjectURL(u);var w=img.naturalWidth||img.width,h=img.naturalHeight||img.height;if(!w||!h){res(file);return;}var sc=Math.min(1,1280/Math.max(w,h));var cw=Math.round(w*sc),ch=Math.round(h*sc);var c=document.createElement('canvas');c.width=cw;c.height=ch;c.getContext('2d').drawImage(img,0,0,cw,ch);c.toBlob(function(b){res(b||file);},'image/jpeg',0.92);};img.onerror=function(){URL.revokeObjectURL(u);res(file);};img.src=u;}catch(e){res(file);}});}

    function isValidBRPhone(nums) {
        function setErr(msg) {
            var el = document.getElementById('q-phone-error');
            if (el) el.textContent = msg;
        }
        if (nums.length < 10) { setErr('N\u00famero incompleto — informe DDD + n\u00famero'); return false; }
        if (nums.length > 11) { setErr('N\u00famero longo demais'); return false; }
        if (!/^[1-9][1-9]/.test(nums)) { setErr('DDD inv\u00e1lido'); return false; }
        if (nums.length === 11 && nums[2] !== '9') { setErr('Celular deve come\u00e7ar com 9 ap\u00f3s o DDD'); return false; }
        var local = nums.length === 11 ? nums.slice(3) : nums.slice(2);
        if (/^(\d)\1+$/.test(local)) { setErr('N\u00famero n\u00e3o parece real — confira'); return false; }
        if (/(\d)\1{5,}/.test(local)) { setErr('N\u00famero n\u00e3o parece real — confira'); return false; }
        if (/^(?:01234567|12345678|23456789|34567890|98765432|87654321|76543210|0123456789|1234567890)/.test(local)) { setErr('N\u00famero n\u00e3o parece real — confira'); return false; }
        return true;
    }

    if (window.__PL_UNIVISAO_LOADED__) { console.log('[PL] Widget Univisao já carregado — ignorando duplicata.'); return; }
    window.__PL_UNIVISAO_LOADED__ = true;
    console.log('[PL] Widget Univisao carregado | URL:', window.location.pathname);
    // ===============================================
    // 0. CHUMBAR A API KEY AQUI DIRETO NO CÓDIGO
    // ===============================================
    const apiKey = "pl_live_6424278b5bb85074ecd90b4c24a123244bf1e0d19dd7716dcb277a0096f0caa3";
    window.PROVOU_LEVOU_API_KEY = apiKey;

    const WEBHOOK_PROVA = 'https://n8n.segredosdodrop.com/webhook/gerador-oculos';
    const WEBHOOK_PIX = 'https://n8n.segredosdodrop.com/webhook/cacife-pix';
    const WEBHOOK_PIX_STATUS = 'https://n8n.segredosdodrop.com/webhook/cacife-pix-status';
    const WEBHOOK_CHECK_LIMIT = 'https://n8n.segredosdodrop.com/webhook/univisao-check-limit';
    const WEBHOOK_BUY_CLICK = 'https://n8n.segredosdodrop.com/webhook/pl-provador-buy-click';

    // ── Botão "Comprar Agora" no resultado (Bagy/Dooca) ─────────────────────────
    // Preço FINAL que o cliente paga. Prioriza o campo autoritativo do Dooca
    // (window.dooca.product.price já vem com desconto aplicado — price_compare é o "de"),
    // depois o preço final exibido (.product-price-final) e por fim .price.
    function getMainPrice() {
        try {
            var dp = window.dooca && window.dooca.product ? window.dooca.product.price : null;
            if (typeof dp === 'number' && dp > 0) return 'R$ ' + dp.toFixed(2).replace('.', ',');
        } catch (e) {}
        var el = document.querySelector('.product-price-final, .price, [data-price]');
        var t = el ? (el.textContent || '').trim() : '';
        if (t && /\d/.test(t)) return t.replace(/\s+/g, ' ');
        return '';
    }
    // Botão nativo de compra da loja (Dooca/Bagy).
    function findStoreBuyBtn() {
        return document.querySelector('.product-buy-button, .product-buy button, .product-buy [type="submit"]');
    }
    // Clique em "Comprar Agora": marca carrinho_adicionado na prova (tracking por telefone)
    // e aciona o botão nativo da loja (add-to-cart do Dooca).
    function buyNow() {
        try {
            var _tp = (document.getElementById('q-phone') || {}).value || '';
            var _td = (document.querySelector('h1.product-detail-info-name, h1') || {}).innerText || document.title || '';
            fetch(WEBHOOK_BUY_CLICK, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: _tp, origin: location.origin, produto: _td }) }).catch(function () {});
        } catch (e) {}
        var sb = findStoreBuyBtn();
        if (sb) { try { sb.click(); } catch (e) {} }
        // Feedback dentro do provador (a confirmação da loja fica atrás do modal).
        var _b = document.getElementById('q-btn-buy-now'); if (_b) _b.style.display = 'none';
        var _s = document.getElementById('q-buy-success'); if (_s) _s.style.display = 'flex';
    }
    // Mostra o botão no resultado + preenche o preço.
    // Parcelamento (Dooca): plano de cartão do produto (fallback: texto da página).
    function getInstallment() {
        try {
            var cc = window.dooca && window.dooca.product && window.dooca.product.payments && window.dooca.product.payments.creditcard;
            if (cc && cc.parcels >= 2 && cc.parcel_price > 0) {
                return cc.parcels + 'x de R$ ' + Number(cc.parcel_price).toFixed(2).replace('.', ',') + (cc.has_interest ? '' : ' sem juros');
            }
        } catch (e) {}
        var el = document.querySelector('.product-price-final.mt-2, [class*="parcel"]');
        var t = el ? (el.textContent || '').replace(/\s+/g, ' ').trim() : '';
        return /\dx/.test(t) ? t.replace(/^em at[ée]\s*/i, '') : '';
    }
    // Escassez determinística por produto (2..7 unidades).
    function scarcityCount(name) {
        var h = 5381, s = String(name || '');
        for (var i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
        return 2 + (h % 6);
    }
    // Nome + preço + parcelamento + escassez + selos + botão (layout igual ao Cacifé).
    function populateBuyCta() {
        var btn = document.getElementById('q-btn-buy-now');
        if (!btn) return;
        var succ = document.getElementById('q-buy-success'); if (succ) succ.style.display = 'none';
        var price = getMainPrice();
        var prodName = ((document.querySelector('h1.product-detail-info-name, h1') || {}).innerText || document.title || '').trim();
        var nameEl = document.getElementById('q-result-prodname'); if (nameEl) nameEl.textContent = prodName;
        var priceEl = document.getElementById('q-result-prodprice'); if (priceEl) priceEl.textContent = price || '';
        var instEl = document.getElementById('q-result-installment'); if (instEl) { var _i = getInstallment(); instEl.textContent = _i; instEl.style.display = _i ? 'block' : 'none'; }
        var info = document.getElementById('q-result-prodinfo'); if (info && (prodName || price)) info.style.display = 'block';
        var sc = document.getElementById('q-scarcity'), scn = document.getElementById('q-scarcity-n');
        if (sc && scn && prodName) { scn.textContent = scarcityCount(prodName); sc.style.display = 'flex'; }
        var seals = document.getElementById('q-seals'); if (seals) seals.style.display = 'flex';
        btn.style.display = findStoreBuyBtn() ? 'flex' : 'none';
        btn.onclick = buyNow;
    }

    // Produto detectado (óculos = sempre 'top')
    let currentProduct = { category: 'top', fit: 'glasses' };
    function detectProduct() { return currentProduct; }


    // ─── LOCK / UNLOCK SCROLL DA PÁGINA ──────────────────────────────────────────


    let scrollY = 0;


    function lockBodyScroll() {
        scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.overflowY = 'scroll';
    }


    function unlockBodyScroll() {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflowY = '';
        window.scrollTo(0, scrollY);
    }


    // ─── ESTILOS ──────────────────────────────────────────────────────────────────


    const styles = `
        /* ── Fontes ── */
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        :root {
            --c-bg: #ffffff;
            --c-surface: #eaf1fa;
            --c-ink: #1a1a1a;
            --c-muted: #6E6E6E;
            --c-line: #cfe0f2;
            --c-accent: #1a1a1a;
            --c-brand: #0A4DA2;
            --c-danger: #cc3333;
            --font-display: 'Bebas Neue', sans-serif;
            --font-body: 'DM Sans', sans-serif;
        }

        /* ── Trigger (selo sobre foto) ── */
        @keyframes q-shake { 0%,50%,100%{transform:rotate(0deg)} 10%,30%{transform:rotate(-10deg)} 20%,40%{transform:rotate(10deg)} }
        .q-btn-trigger-ia {
            position: fixed !important; z-index: 99 !important;
            background: none !important; border: none !important; padding: 0 !important; cursor: pointer !important;
            width: 70px !important; height: 70px !important;
            display: flex !important; align-items: center !important; justify-content: center !important;
            filter: drop-shadow(0 3px 10px rgba(0,0,0,0.22));
            animation: q-shake 3s infinite;
            transition: filter 0.2s;
            visibility: hidden;
        }
        .q-btn-trigger-ia:hover { filter: drop-shadow(0 6px 18px rgba(0,0,0,0.32)); }
        .q-btn-trigger-ia img { width: 100%; height: 100%; object-fit: contain; }
        @media (min-width: 768px) { .q-btn-trigger-ia { width: 70px; height: 70px; } }

        /* ── Inline button ── */
        .q-btn-inline-provador {
            display: flex; align-items: center; justify-content: center; gap: 7px;
            width: 100%; padding: 13px 16px;
            background: transparent; color: var(--c-ink);
            border: 1.5px solid var(--c-ink); border-radius: 0;
            font-family: 'Work Sans', var(--font-body), sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;
            cursor: pointer; transition: background 0.25s, color 0.25s;
            margin-bottom: 10px; box-sizing: border-box;
        }
        .q-btn-inline-provador:hover { background: var(--c-ink); color: #fff; }
        .q-btn-inline-provador svg { width: 14px; height: 14px; flex-shrink: 0; }

        /* ── Modal overlay ── */
        @keyframes q-modal-in { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        #q-modal-ia {
            display: none; position: fixed; inset: 0; z-index: 999999;
            background: rgba(240,238,235,0.96);
            font-family: var(--font-body);
            overflow-y: auto; box-sizing: border-box;
        }
        #q-modal-ia * { box-sizing: border-box; }

        /* ── Card ── */
        .q-card-ia {
            width: 100%; min-height: 100vh;
            background: var(--c-bg); color: var(--c-ink);
            display: flex; flex-direction: column; position: relative;
            animation: q-modal-in 0.35s cubic-bezier(0.22,1,0.36,1);
        }
        @media (min-width: 768px) {
            #q-modal-ia { display: none; align-items: center; justify-content: center; }
            .q-card-ia {
                width: 440px; max-width: 92vw; min-height: auto;
                max-height: 96vh; border: none;
                box-shadow: 0 32px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06);
                overflow: hidden; border-radius: 22px;
            }
        }

        /* ── Close ── */
        .q-close-ia {
            position: absolute; top: 18px; right: 18px;
            background: none; border: none;
            font-size: 26px; font-weight: 300; color: var(--c-muted);
            cursor: pointer; z-index: 10; line-height: 1; padding: 4px 6px;
            transition: color 0.2s;
        }
        .q-close-ia:hover { color: var(--c-ink); }

        /* ── Content scroll ── */
        .q-content-scroll {
            flex: 1; padding: 0; overflow-y: auto;
            text-align: left; display: flex; flex-direction: column;
        }
        .q-content-scroll::-webkit-scrollbar { width: 3px; }
        .q-content-scroll::-webkit-scrollbar-thumb { background: var(--c-line); }

        @media (max-width: 767px) {
            #q-modal-ia { display:none; overflow-y:auto; align-items:flex-start; justify-content:center; }
            #q-modal-ia[style*="flex"] { display:flex !important; }
            .q-card-ia { width:100%; border:none; margin:0; min-height:100svh; }
            .q-content-scroll { flex: 1; }
        }

        /* ── Header strip ── */
        #q-header-provador {
            padding: 28px 28px 0;
            display: flex; flex-direction: column; align-items: center;
            text-align: center; gap: 10px;
            border-bottom: 1px solid var(--c-line);
            padding-bottom: 22px; margin-bottom: 0;
        }
        #q-header-provador h1 {
            margin: 0;
            font-family: var(--font-display);
            font-size: 28px; letter-spacing: 4px;
            color: var(--c-ink); text-transform: uppercase;
            font-weight: 400; line-height: 1;
        }

        /* ── Main step ── */
        #q-step-photo {
            display: flex; flex-direction: column; padding: 28px 28px 32px;
            gap: 0; align-items: stretch;
        }

        /* ── Labels & inputs ── */
        .q-field-label {
            display: block; font-size: 10px; font-weight: 600;
            letter-spacing: 2px; text-transform: uppercase;
            color: var(--c-muted); margin-bottom: 8px;
        }
        .q-phone-wrap { margin-bottom: 28px; }

        .q-provas-msg:empty { display: none; }
        .q-provas-msg {
            font-size: 13px; margin-top: 10px; letter-spacing: 0.3px;
            color: var(--c-ink); font-weight: 500;
            background: var(--c-surface);
            border: 1px solid var(--c-line);
            border-radius: 6px;
            padding: 10px 14px;
            text-align: center;
            transition: background 0.2s, color 0.2s, border-color 0.2s;
        }
        .q-provas-msg.is-warn {
            color: var(--c-danger);
            background: rgba(204,51,51,0.08);
            border-color: rgba(204,51,51,0.3);
            font-weight: 600;
        }
        .q-input {
            display: block; width: 100%; height: 52px;
            padding: 0 16px; margin: 0;
            background: var(--c-surface); border: 1.5px solid var(--c-line);
            border-radius: 14px;
            font-size: 16px; font-family: var(--font-body); font-weight: 400;
            color: var(--c-ink); outline: none;
            -webkit-appearance: none; appearance: none; transition: border-color 0.2s;
        }
        .q-input:focus { border-color: var(--c-ink); background: #fff; }
        .q-input::placeholder { color: #bbb; }

        .q-provas-msg:empty { display: none; }
        .q-provas-msg {
            font-size: 13px; margin-top: 10px; letter-spacing: 0.3px;
            color: var(--c-ink); font-weight: 500;
            background: var(--c-surface);
            border: 1px solid var(--c-line);
            border-radius: 6px;
            padding: 10px 14px;
            text-align: center;
            transition: background 0.2s, color 0.2s, border-color 0.2s;
        }
        .q-provas-msg.is-warn {
            color: var(--c-danger);
            background: rgba(204,51,51,0.08);
            border-color: rgba(204,51,51,0.3);
            font-weight: 600;
        }

        .q-status-msg {
            display: none; font-size: 11px; color: var(--c-danger);
            font-weight: 500; margin-top: 6px; letter-spacing: 0.3px;
        }

        /* ── Section label ── */
        .q-section-label {
            font-family: var(--font-display);
            font-size: 20px; letter-spacing: 3px; text-transform: uppercase;
            color: var(--c-ink); margin: 0 0 14px; font-weight: 400;
            text-align: center;
        }

        /* ── Tip ── */
        .q-tip-box {
            display: flex; align-items: center; gap: 9px;
            background: var(--c-surface);
            padding: 11px 14px; margin-bottom: 20px;
            font-size: 11.5px; color: var(--c-muted); line-height: 1.45;
            border-radius: 6px;
        }
        .q-tip-box i { color: var(--c-ink); font-size: 15px; flex-shrink: 0; }
        /* ── Required field marker + shake feedback ── */
        .q-required-mark { color: var(--c-danger); font-weight: 700; margin-left: 4px; }
        @keyframes q-shake-x {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
            20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
        .q-shake { animation: q-shake-x 0.5s cubic-bezier(.36,.07,.19,.97); }
        .q-input.is-error {
            border-color: var(--c-danger) !important;
            background: rgba(204,51,51,0.06) !important;
            box-shadow: 0 0 0 3px rgba(204,51,51,0.15);
        }
        .q-face-frame.is-error {
            outline: 3px solid var(--c-danger);
            outline-offset: 2px;
            background: rgba(204,51,51,0.06);
        }
        .q-validation-hint {
            display: none;
            background: var(--c-danger);
            color: #fff;
            font-size: 13px; font-weight: 600;
            letter-spacing: 0.3px;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 12px;
            text-align: center;
            box-shadow: 0 3px 10px rgba(204,51,51,0.25);
            animation: q-pop-in 0.25s ease;
        }
        .q-validation-hint.is-visible { display: block; }
        @keyframes q-pop-in {
            0% { opacity: 0; transform: translateY(-6px); }
            100% { opacity: 1; transform: translateY(0); }
        }


        /* ── Face frame ── */
        @keyframes q-frame-pulse { 0%,100%{opacity:0.3} 50%{opacity:0.7} }
        .q-face-frame {
            position: relative; width: 200px; height: 260px;
            margin: 0 auto 24px; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            overflow: hidden; background: var(--c-surface);
            border-radius: 4px;
            transition: transform 0.2s;
        }
        .q-face-frame:hover { transform: scale(1.015); }
        .q-face-frame img { width: 100%; height: 100%; object-fit: cover; display: none; }
        .q-face-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .q-face-placeholder i { font-size: 72px; color: #d0d0d0; }
        .q-product-thumbs {
            display: flex; gap: 8px; overflow-x: auto; padding: 4px 0 8px;
            -webkit-overflow-scrolling: touch; justify-content: center;
        }
        .q-product-thumbs::-webkit-scrollbar { display: none; }
        .q-product-thumb {
            flex: 0 0 88px; width: 88px; height: 88px;
            background: var(--c-surface); border: 2px solid transparent;
            padding: 0; cursor: pointer; border-radius: 6px;
            overflow: hidden; transition: border-color 0.2s, transform 0.15s;
        }
        .q-product-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .q-product-thumb:hover { transform: scale(1.04); }
        .q-product-thumb.selected { border-color: var(--c-brand, var(--c-ink)); }
        .q-product-thumb.selected::after {
            content: '✓'; position: absolute; transform: translate(-22px, -84px);
            background: var(--c-brand, var(--c-ink)); color: #fff;
            width: 18px; height: 18px; border-radius: 50%;
            font-size: 11px; line-height: 18px; text-align: center;
            font-weight: 700;
        }
        /* Corner marks — clean editorial style */
        .q-face-corner {
            position: absolute; width: 20px; height: 20px;
            border-color: var(--c-ink); border-style: solid;
            transition: border-color 0.2s;
        }
        .q-face-corner-tl { top: 0; left: 0; border-width: 2px 0 0 2px; }
        .q-face-corner-tr { top: 0; right: 0; border-width: 2px 2px 0 0; }
        .q-face-corner-bl { bottom: 0; left: 0; border-width: 0 0 2px 2px; }
        .q-face-corner-br { bottom: 0; right: 0; border-width: 0 2px 2px 0; }

        /* ── Upload buttons ── */
        .q-upload-btns {
            display: grid; grid-template-columns: 1fr 1fr;
            gap: 8px; width: 100%; margin-bottom: 24px;
        }
        .q-upload-btn {
            display: flex; align-items: center; justify-content: center; gap: 7px;
            padding: 12px 8px;
            border: 1.5px solid var(--c-line);
            background: transparent; color: var(--c-ink);
            font-family: var(--font-body); font-size: 12px; font-weight: 500;
            cursor: pointer; transition: border-color 0.2s, background 0.2s; border-radius: 14px;
        }
        .q-upload-btn:hover { border-color: var(--c-ink); background: var(--c-surface); }
        .q-upload-btn i { font-size: 16px; }

        /* ── Terms ── */
        .q-terms-row {
            display: flex; align-items: flex-start; gap: 10px;
            font-size: 11.5px; color: var(--c-muted); cursor: pointer;
            line-height: 1.5; margin-bottom: 20px;
            justify-content: center; text-align: center;
        }
        .q-terms-row input { margin-top: 3px; cursor: pointer; accent-color: var(--c-ink); flex-shrink: 0; }
        .q-terms-row a { color: var(--c-ink); text-decoration: underline; text-underline-offset: 2px; }

        /* ── CTA buttons ── */
        .q-btn-black {
            width: 100%; height: 52px;
            background: var(--c-ink); color: #fff;
            border: none; border-radius: 14px;
            font-family: var(--font-display); font-size: 17px;
            letter-spacing: 3px; text-transform: uppercase;
            cursor: pointer; transition: opacity 0.2s; box-sizing: border-box;
        }
        .q-btn-black:hover:not(:disabled) { opacity: 0.82; }
        .q-btn-black:disabled { background: #ccc; cursor: not-allowed; }
        .q-btn-outline {
            width: 100%; height: 52px;
            background: transparent; color: var(--c-ink);
            border: 1.5px solid var(--c-line); border-radius: 14px;
            font-family: var(--font-display); font-size: 17px;
            letter-spacing: 3px; text-transform: uppercase;
            cursor: pointer; transition: border-color 0.2s, background 0.2s; box-sizing: border-box;
        }
        .q-btn-outline:hover { border-color: var(--c-ink); background: var(--c-surface); }
        .q-btn-buy-now {
            width: 100%; padding: 16px 18px; margin-bottom: 10px;
            background: var(--c-ink); color: #fff; border: 1px solid var(--c-ink);
            border-radius: 14px; font-family: var(--font-body);
            font-weight: 700; font-size: 15px; letter-spacing: .3px; cursor: pointer;
            display: flex; align-items: center; justify-content: center; gap: 8px;
            transition: opacity .2s; box-sizing: border-box; line-height: 1.2;
            text-decoration: none;
        }
        .q-btn-buy-now:hover { opacity: .85; }
        .q-btn-buy-now .q-buy-price { font-weight: 800; white-space: nowrap; }
        /* Resultado enxuto: só o botão de comprar (sem voltar/tentar/provas restantes) */
        .q-card-ia.is-result #q-retry-btn,
        .q-card-ia.is-result #q-provas-restantes-result { display: none !important; }
        .q-card-ia.is-result #q-btn-back { display: none !important; }
        #q-buy-success { display: none; flex-direction: column; gap: 10px; }
        .q-buy-ok-msg {
            display: flex; align-items: center; justify-content: center; gap: 8px;
            background: #e8f5e9; color: #1b7e2e; border: 1px solid #b6e0bd;
            border-radius: 14px; padding: 14px 16px; font-family: var(--font-body);
            font-weight: 700; font-size: 14.5px; line-height: 1.3; text-align: center;
        }
        .q-buy-ok-msg i { font-size: 20px; }
        .q-result-prodinfo { text-align: left; margin-bottom: 10px; }
        .q-result-prodname { font-family: var(--font-body); font-size: 20px; font-weight: 700; color: var(--c-ink); line-height: 1.25; margin-bottom: 6px; }
        .q-result-prodprice { font-family: var(--font-display); font-size: 28px; letter-spacing: .5px; font-weight: 700; color: var(--c-ink); line-height: 1; }
        .q-result-installment { font-family: var(--font-body); font-size: 12px; color: var(--c-muted); margin-top: 4px; letter-spacing: .2px; }
        .q-scarcity { margin-top: 12px; font-family: var(--font-body); font-size: 13px; font-weight: 700; color: var(--c-danger, #dc2626); letter-spacing: 1.5px; text-transform: uppercase; display: flex; align-items: center; justify-content: flex-start; gap: 6px; }
        .q-scarcity i { font-size: 15px; }
        .q-seals { display: flex; justify-content: flex-start; gap: 30px; margin: 8px 0; padding: 12px 0; border-top: 1px solid var(--c-line); border-bottom: 1px solid var(--c-line); }
        .q-seal { display: flex; align-items: center; gap: 9px; }
        .q-seal > i { font-size: 24px; color: var(--c-ink); flex-shrink: 0; }
        .q-seal span { font-family: var(--font-body); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .6px; line-height: 1.25; color: var(--c-ink); text-align: left; }

        /* ── PIX screen ── */
        #q-step-pix {
            display: none; text-align: center;
            padding: 36px 28px; flex-direction: column; gap: 16px; align-items: center;
        }
        #q-step-pix h2 {
            font-family: var(--font-display); font-size: 24px;
            letter-spacing: 3px; text-transform: uppercase; margin: 0; font-weight: 400;
        }
        .q-pix-subtitle { font-size: 13px; color: var(--c-muted); margin: 0; line-height: 1.6; }
        .q-pix-qr { width: 180px; height: 180px; border: 1px solid var(--c-line); padding: 6px; margin: 0 auto; }
        .q-pix-qr img { width: 100%; height: 100%; }
        .q-pix-copiacola { display: flex; gap: 8px; width: 100%; max-width: 320px; margin: 0 auto; }
        .q-pix-copiacola input {
            flex: 1; height: 40px; padding: 0 12px; border: 1px solid var(--c-line);
            background: var(--c-surface); font-size: 11px; font-family: var(--font-body);
            outline: none; min-width: 0;
        }
        .q-pix-copiacola button {
            height: 40px; padding: 0 14px; background: var(--c-ink); color: #fff;
            border: none; font-size: 10px; font-weight: 600; letter-spacing: 1px;
            text-transform: uppercase; cursor: pointer;
        }
        .q-pix-status { font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--c-muted); }
        @keyframes q-pix-pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
        .q-pix-waiting { animation: q-pix-pulse 1.5s infinite ease-in-out; color: #d97706; }
        .q-pix-approved { color: #16a34a; }
        .q-pix-cancel { font-size: 11px; color: var(--c-muted); text-decoration: underline; cursor: pointer; margin-top: 4px; }

        /* ── Loading ── */
        @keyframes q-slide { from{transform:translateX(-100%)} to{transform:translateX(100%)} }
        @keyframes q-alt-show { 0%,5%{opacity:0;transform:translateY(6px)} 15%,45%{opacity:1;transform:translateY(0)} 55%,100%{opacity:0;transform:translateY(-6px)} }
        @keyframes q-alt-hide { 0%,55%{opacity:0;transform:translateY(6px)} 65%,95%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-6px)} }
        #q-loading-box {
            display: none; padding: 28px;
            text-align: center; flex: 1; flex-direction: column;
            align-items: center; justify-content: center; min-height: 60vh;
        }
        .q-loading-texts {
            position: relative; height: 36px; width: 100%;
            display: flex; align-items: center; justify-content: center;
            margin-bottom: 24px;
        }
        .q-loading-t1, .q-loading-t2 {
            position: absolute; width: 100%;
            display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .q-loading-t1 {
            font-family: var(--font-display); font-size: 18px; letter-spacing: 4px;
            text-transform: uppercase; color: var(--c-ink);
            animation: q-alt-show 3.6s ease-in-out infinite;
        }
        .q-loading-t2 {
            animation: q-alt-hide 3.6s ease-in-out infinite;
            text-decoration: none; opacity: 0;
        }
        .q-loading-t2 span {
            font-size: 12px; letter-spacing: 2px; text-transform: uppercase;
            color: var(--c-muted); font-family: var(--font-body);
        }
        .q-loading-t2 img { height: 16px; width: auto; opacity: 0.7; }
        .q-loading-bar { height: 3px; background: var(--c-line); width: 100%; position: relative; overflow: hidden; border-radius: 2px; }
        .q-loading-bar > div {
            position: absolute; top: 0; left: 0; height: 100%; width: 100%;
            background: var(--c-ink); border-radius: 2px;
            transform: scaleX(0); transform-origin: left;
            transition: transform 0.3s ease-out;
        }

        /* ── Result ── */
        #q-step-result { display: none; flex-direction: column; gap: 0; align-items: stretch; }

        .q-res-title {
            display: block;
            font-family: var(--font-display); font-size: 18px;
            letter-spacing: 3px; text-transform: uppercase;
            color: var(--c-ink); padding: 20px 28px 16px; margin: 0;
            border-bottom: 1px solid var(--c-line);
            text-align: center;
        }
        .q-res-subtitle, .q-res-note { display: none; }

        #q-result-img-col {
            width: 100%; max-height: 72vh; background: var(--c-surface);
            overflow: hidden; display: flex; align-items: center; justify-content: center;
        }
        #q-result-img-col img { width: 100%; height: 100%; object-fit: cover; object-position: top center; display: block; }

        #q-result-actions-col {
            display: flex; flex-direction: column; gap: 10px;
            padding: 20px 28px 0;
        }
        .q-res-mobile-only { margin: 0; }

        /* ── Related products ── */
        #q-related-products { padding: 0 28px 28px; }
        #q-related-products h4 {
            font-family: var(--font-display); font-size: 13px;
            letter-spacing: 3px; text-transform: uppercase;
            color: var(--c-muted); margin: 20px 0 12px; font-weight: 400;
        }
        .q-related-grid {
            display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px;
            -webkit-overflow-scrolling: touch; justify-content: center;
        }
        .q-related-grid::-webkit-scrollbar { display: none; }
        .q-related-card {
            flex: 0 0 calc(26% - 7px); min-width: 72px; max-width: 88px;
            text-decoration: none; color: var(--c-ink);
            display: flex; flex-direction: column; gap: 5px;
        }
        .q-related-card img {
            width: 100%; aspect-ratio: 1/1; object-fit: cover;
            border: 1px solid var(--c-line); display: block; border-radius: 3px;
        }
        .q-related-card-name {
            font-size: 9px; font-weight: 500; line-height: 1.4; color: var(--c-ink);
            overflow: hidden; display: -webkit-box;
            -webkit-line-clamp: 2; -webkit-box-orient: vertical;
        }

        /* Desktop result split */
        @media (min-width: 768px) {
            .q-card-ia.is-result { width: 780px !important; max-width: 90vw !important; max-height: 92vh !important; }
                /* .q-powered-footer always visible */
            .q-card-ia.is-result .q-content-scroll {
                padding: 0 !important; overflow-y: auto !important;
                display: flex !important; flex-direction: column !important;
            }
            .q-card-ia.is-result #q-step-result {
                display: flex !important; flex-direction: row !important;
                flex-wrap: wrap !important; width: 100%; align-items: stretch; gap: 0;
            }
            .q-card-ia.is-result .q-res-title {
                flex-basis: 100%; order: -1;
                font-size: 16px; letter-spacing: 3px;
                padding: 16px 24px; border-bottom: 1px solid var(--c-line);
            }
            .q-card-ia.is-result #q-result-img-col {
                width: 44% !important; min-height: 360px !important;
                border-right: 1px solid var(--c-line); flex-shrink: 0;
            }
            .q-card-ia.is-result #q-result-img-col img {
                width: 100% !important; height: 100% !important;
                object-fit: cover !important; object-position: top center !important;
            }
            .q-card-ia.is-result #q-result-actions-col {
                width: 56% !important; padding: 28px 24px !important;
                display: flex !important; flex-direction: column !important;
                justify-content: flex-start; gap: 10px;
                overflow-y: auto;
            }
            .q-card-ia.is-result #q-related-products { padding: 0; margin-top: 4px; }
            .q-card-ia.is-result .q-res-mobile-only { display: flex !important; }
        }

        /* ── Error screen ── */
        #q-step-error {
            display: none; flex-direction: column; gap: 20px;
            align-items: center; text-align: center;
            padding: 52px 28px;
        }
        #q-step-error h2 {
            font-family: var(--font-display); font-size: 22px;
            letter-spacing: 3px; text-transform: uppercase; margin: 0; font-weight: 400;
        }
        #q-step-error p { font-size: 13px; color: var(--c-muted); margin: 0; line-height: 1.6; }

        /* ── Footer ── */
        .q-powered-footer {
            background: var(--c-surface); padding: 14px 20px;
            display: flex; align-items: center; justify-content: center; gap: 9px;
            flex-shrink: 0; border-top: 1px solid var(--c-line); text-decoration: none;
        }
        .q-powered-footer span { font-size: 9.5px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--c-muted); }
        .q-quantic-logo { height: 20px; opacity: 0.7; }
    `;


    // ─── IMAGEM DO BOTÃO (trigger) ─────────────────────────────────────────────
    const stampImageHTML = `<img src="https://cdn.shopify.com/s/files/1/0636/6334/1746/files/logo_provador.png?v=1772494793" alt="Provador Virtual" style="width:100%;height:100%;object-fit:contain;">`;



    // ─── HTML ─────────────────────────────────────────────────────────────────────


    const html = `
        <div id="q-modal-ia">
            <div class="q-card-ia">
                <button type="button" class="q-close-ia" id="q-close-btn">&times;</button>
                <div class="q-content-scroll">

                    <!-- Persistent header (all steps) -->
                    <div id="q-header-provador">
                        <h1>Provador Virtual</h1>
                        <img src="https://cdn.dooca.store/101255/files/logo-branca-3.png?v=1700778518" alt="Univisão Ótica" style="height:68px;width:auto;"/>
                    </div>

                    <!-- Main step -->
                    <div id="q-step-photo">
                        <!-- WhatsApp -->
                        <div class="q-phone-wrap">
                            <span class="q-field-label">Seu WhatsApp<span class="q-required-mark">*</span></span>
                            <input type="tel" id="q-phone" class="q-input" placeholder="(11) 99999-9999" maxlength="15">
                            <div id="q-phone-error" class="q-status-msg">N&#250;mero inv&#225;lido</div>
                            <div id="q-provas-restantes" class="q-provas-msg"></div>
                        </div>

                        <!-- Product image selector -->
                        <div id="q-photo-selector-group" style="display:none;margin-bottom:20px;">
                            <p class="q-section-label">Escolha o &#243;culos para experimentar</p>
                            <div class="q-product-thumbs"></div>
                        </div>

                        <!-- Photo section -->
                        <p class="q-section-label">Envie sua foto</p>
                        <div class="q-tip-box">
                            <i class="ph ph-lightbulb"></i>
                            <span>Use uma foto n&#237;tida, de frente, com boa ilumina&#231;&#227;o.</span>
                        </div>

                        <!-- Face frame -->
                        <div class="q-face-frame" id="q-face-frame">
                            <div class="q-face-corner q-face-corner-tl"></div>
                            <div class="q-face-corner q-face-corner-tr"></div>
                            <div class="q-face-corner q-face-corner-bl"></div>
                            <div class="q-face-corner q-face-corner-br"></div>
                            <img id="q-pre-img" alt="Sua foto">
                            <div class="q-face-placeholder" id="q-face-placeholder">
                                <i class="ph ph-user-circle" style="font-size:80px;color:#d4d4d4;"></i>
                            </div>
                        </div>

                        <!-- Upload buttons -->
                        <div class="q-upload-btns">
                            <button class="q-upload-btn" id="q-btn-camera">
                                <i class="ph ph-camera"></i> Tirar foto
                            </button>
                            <button class="q-upload-btn" id="q-btn-gallery">
                                <i class="ph ph-image"></i> Da galeria
                            </button>
                            <input type="file" id="q-camera-input" accept="image/*" capture="user" style="display:none">
                            <input type="file" id="q-gallery-input" accept="image/*" style="display:none">
                        </div>

                        <!-- Terms -->
                        <label class="q-terms-row">
                            <input type="checkbox" id="q-accept-terms">
                            <span>Concordo com os <a href="http://provoulevou.com.br/termos.html" target="_blank">Termos e Condi&#231;&#245;es</a></span>
                        </label>

                        <div id="q-validation-hint" class="q-validation-hint"></div>
                        <button class="q-btn-black" id="q-btn-generate">Provar &#243;culos</button>
                    </div>

                    <!-- Limite do dia atingido -> volte amanha -->
                    <div id="q-step-pix" style="text-align:center;padding:10px 6px;">
                        <div style="font-size:46px;line-height:1;margin-bottom:8px;">&#127769;</div>
                        <h2>Limite de hoje atingido</h2>
                        <p class="q-pix-subtitle">Voc&#234; j&#225; usou suas <b>3 provas gr&#225;tis de hoje</b>.<br>Volte amanh&#227; para experimentar mais &#243;culos! &#128153;</p>
                        <button id="q-limit-close" style="margin-top:16px;background:var(--c-brand);color:#fff;border:none;border-radius:10px;padding:11px 24px;font-family:inherit;font-weight:700;font-size:14px;cursor:pointer;">Entendi</button>
                    </div>

                    <!-- Loading -->
                    <div id="q-loading-box">
                        <div class="q-loading-texts">
                            <div class="q-loading-t1">Gerando sua prova...</div>
                            <a href="https://provoulevou.com.br/?utm_source=widget&utm_medium=parceiro&utm_campaign=univisao" target="_blank" rel="dofollow noopener" class="q-loading-t2">
                                <span>Powered by</span>
                                <img src="https://i.ibb.co/MD3B4FQf/Logo-provou-preto-1.png" alt="Provou Levou">
                            </a>
                        </div>
                        <div class="q-loading-bar"><div></div></div>
                    </div>

                    <!-- Resultado -->
                    <div id="q-step-result">
                        <span class="q-res-title">Veja como ficou em voc&ecirc;</span>
                        <div id="q-result-img-col">
                            <img id="q-final-view-img">
                        </div>
                        <div id="q-result-actions-col">
                            <div id="q-provas-restantes-result" class="q-provas-msg" style="display:none;"></div>
                            <div class="q-result-prodinfo" id="q-result-prodinfo" style="display:none;">
                                <div class="q-result-prodname" id="q-result-prodname"></div>
                                <div class="q-result-prodprice" id="q-result-prodprice"></div>
                                <div class="q-result-installment" id="q-result-installment"></div>
                                <div class="q-scarcity" id="q-scarcity" style="display:none;"><i class="ph-bold ph-fire"></i> APENAS <strong id="q-scarcity-n"></strong>&nbsp;UNIDADES RESTANTES</div>
                            </div>
                            <div class="q-seals" id="q-seals" style="display:none;">
                                <div class="q-seal"><i class="ph-fill ph-shield-check"></i><span>Compra<br>Segura</span></div>
                                <div class="q-seal"><i class="ph-fill ph-lock-key"></i><span>Pagamento<br>Seguro</span></div>
                            </div>
                            <button class="q-btn-buy-now" id="q-btn-buy-now" style="display:none;">Comprar Agora</button>
                            <div id="q-buy-success">
                                <div class="q-buy-ok-msg"><i class="ph ph-check-circle"></i> Produto adicionado ao carrinho!</div>
                                <a class="q-btn-buy-now" id="q-btn-go-cart" href="/carrinho">Ir para o carrinho</a>
                            </div>
                            <button class="q-btn-outline" id="q-btn-back" style="display:none;">Voltar ao Produto</button>
                            <button class="q-btn-black q-res-mobile-only" id="q-retry-btn" style="display:none;">
                                <i class="ph ph-camera"></i> Tentar outra foto
                            </button>
                            <div id="q-related-products" style="display:none;">
                                <h4>Veja tamb&eacute;m</h4>
                                <div class="q-related-grid" id="q-related-grid"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Erro -->
                    <div id="q-step-error">
                        <h2>ALTA DEMANDA</h2>
                        <p>Aguarde alguns segundos para tentar novamente.</p>
                        <button class="q-btn-outline" id="q-error-back">Voltar ao Produto</button>
                        <div style="margin-top:14px;padding-top:12px;border-top:1px solid rgba(0,0,0,.08);"><p style="font-size:12px;color:var(--c-muted);margin:0 0 8px;">Continua com problema? Fale direto com a Provou Levou:</p><a href="https://wa.me/5511965749173?text=Ol%C3%A1!%20Tive%20um%20problema%20ao%20usar%20o%20provador." target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:7px;background:#25D366;color:#fff;border-radius:10px;padding:10px 18px;font-family:inherit;font-weight:700;font-size:13px;text-decoration:none;"><svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.9c0 2.1.55 4.06 1.6 5.8L2 22l4.44-1.65a9.9 9.9 0 0 0 5.6 1.72h.01c5.46 0 9.9-4.45 9.9-9.9C21.95 6.45 17.5 2 12.04 2zm5.8 14.15c-.24.68-1.4 1.3-1.94 1.34-.5.05-1.13.07-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.8-4.17-4.94-4.36-.15-.19-1.18-1.57-1.18-2.99 0-1.42.75-2.12 1.01-2.41.27-.29.58-.36.77-.36l.55.01c.18.01.42-.07.66.5.24.59.83 2.04.9 2.18.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.75 1.24 1.62 2.01 1.11.99 2.05 1.3 2.34 1.44.29.15.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.39-.24.66-.14.27.1 1.7.8 1.99.95.29.15.48.22.55.34.07.12.07.71-.17 1.39z"/></svg> Falar com a Provou Levou</a></div>
                    </div>

                </div>
                <a href="https://provoulevou.com.br/?utm_source=widget&utm_medium=parceiro&utm_campaign=univisao" target="_blank" rel="dofollow noopener" class="q-powered-footer">
                    <span>Powered by</span>
                    <img src="https://i.ibb.co/MD3B4FQf/Logo-provou-preto-1.png" class="q-quantic-logo" alt="Provou Levou">
                </a>
            </div>
        </div>
    `;


    // ─── INIT ─────────────────────────────────────────────────────────────────────


    function init() {
        // --- FILTRO DE CATEGORIA (HAT) ---
        const productNameNormalized = (document.querySelector('h1.product__title,.product-single__title,h1')?.innerText || document.title).toUpperCase();
        if (productNameNormalized.includes('HAT')) {
            return;
        }

        // Fontes (async, não bloqueia render)
        const fontLink = document.createElement('link');
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap';
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);

        // Phosphor Icons — carregado lazily na primeira abertura do modal
        // (não carrega na init para não impactar o tempo de carregamento da página)

        const styleTag = document.createElement('style');
        styleTag.textContent = styles;
        document.head.appendChild(styleTag);

        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = html;
        document.body.appendChild(modalContainer);


        // ── Botão imagem PNG ──
        const openBtn = document.createElement('button');
        openBtn.className = 'q-btn-trigger-ia';
        openBtn.id = 'q-open-ia';
        openBtn.setAttribute('aria-label', 'Abrir Provador Virtual');
        openBtn.innerHTML = stampImageHTML;


        const imgContainers = ['.product-images', '.product-image-section', '.product-photo', '.gallery-main', '.product-gallery__main', '.product-gallery', '.product-gallery img', '.product-image img', '.product-image-column', '.product-image-main', '[data-component="product.gallery"]', '[data-component="product-images"]', '.swiper-container .swiper-slide-active', '.swiper-slide-active', '.js-product-slide', '.js-swiper-product', '[data-store^="product-image-"]', '.product__media-wrapper', '.product-gallery__media', '.product__media', '.product-media-container', '[data-media-id]', '.product__media-item', '.product-single__media', '.media-gallery'];

        // Anexa ao body com position:fixed e atualiza posição via bounding rect (resiste a breakpoints)
        document.body.appendChild(openBtn);
        let trackedImgEl = null;

        function findVisibleImageEl() {
            // Procura em ordem de prioridade: containers conhecidos com img visível
            for (const sel of imgContainers) {
                const els = document.querySelectorAll(sel);
                for (const el of els) {
                    const rect = el.getBoundingClientRect();
                    const visible = rect.width > 50 && rect.height > 50 && window.getComputedStyle(el).visibility !== 'hidden' && window.getComputedStyle(el).display !== 'none';
                    if (!visible) continue;
                    const img = el.tagName === 'IMG' ? el : el.querySelector('img');
                    if (img) return el;
                }
            }
            // Fallback: qualquer img grande na página de produto
            for (const img of document.querySelectorAll('img')) {
                const rect = img.getBoundingClientRect();
                if (rect.width > 200 && rect.height > 200) return img;
            }
            return null;
        }

        function updateTriggerPosition() {
            const target = findVisibleImageEl();
            if (!target) {
                openBtn.style.visibility = 'hidden';
                return false;
            }
            trackedImgEl = target;
            const rect = target.getBoundingClientRect();
            const btnSize = 70;
            const margin = 14;
            const offsetTop = 30;
            // Posiciona no canto superior direito da imagem (um pouco mais pra baixo)
            openBtn.style.top = (rect.top + margin + offsetTop) + 'px';
            openBtn.style.left = (rect.right - btnSize - margin) + 'px';
            openBtn.style.visibility = 'visible';
            return true;
        }

        function tryPlaceTriggerBtn() {
            return updateTriggerPosition();
        }

        // Atualiza posição em scroll/resize
        window.addEventListener('scroll', updateTriggerPosition, { passive: true });
        window.addEventListener('resize', updateTriggerPosition);
        // Re-checa periodicamente caso DOM mude
        setInterval(updateTriggerPosition, 1000);

        if (!tryPlaceTriggerBtn()) {
            // Container não pronto ainda (ex: após F5 no mobile).
            // Observa DOM até 5s aguardando o container aparecer.
            const observer = new MutationObserver(() => {
                if (tryPlaceTriggerBtn()) observer.disconnect();
            });
            observer.observe(document.body, { childList: true, subtree: true });

            setTimeout(() => {
                observer.disconnect();
                if (!openBtn.isConnected) {
                    openBtn.style.cssText = 'position:fixed;bottom:30px;right:20px;top:auto;z-index:100;';
                    document.body.appendChild(openBtn);
                }
            }, 5000);
        }


        const modal = document.getElementById('q-modal-ia');

        // ── Botão inline acima do botão de compra ──
        const inlineBtn = document.createElement('button');
        inlineBtn.className = 'q-btn-inline-provador';
        inlineBtn.type = 'button';

        const inlineSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        inlineSvg.setAttribute('viewBox', '0 0 24 24');
        inlineSvg.setAttribute('fill', 'none');
        inlineSvg.setAttribute('stroke', 'currentColor');
        inlineSvg.setAttribute('stroke-width', '1.5');
        inlineSvg.setAttribute('stroke-linecap', 'round');
        inlineSvg.setAttribute('stroke-linejoin', 'round');
        const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path1.setAttribute('d', 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2');
        const circle1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle1.setAttribute('cx', '12');
        circle1.setAttribute('cy', '7');
        circle1.setAttribute('r', '4');
        inlineSvg.appendChild(path1);
        inlineSvg.appendChild(circle1);
        inlineBtn.appendChild(inlineSvg);

        const inlineBtnText = document.createTextNode('Provador Virtual');
        inlineBtn.appendChild(inlineBtnText);

        inlineBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const prodName = document.querySelector('h1.product__title,.product-single__title,h1')?.innerText || document.title;
            applyProduct(detectProduct(prodName));
            populateImageSelector();
            openModal();
        });

        // Posiciona acima do botão de compra
        const buyBtn = document.querySelector('.product-buy-button, .product-buy button, .product-buy [type="submit"], .js-addtocart, .btn-add-to-cart, [data-component="product.add-to-cart"]');
        if (buyBtn) {
            let target = buyBtn;
            const buyContainer = buyBtn.closest('.product-buy, .row');
            if (buyContainer && buyContainer.parentNode) target = buyContainer;
            target.parentNode.insertBefore(inlineBtn, target);
        } else {
            const variantsContainer = document.querySelector('.js-product-variants');
            if (variantsContainer) {
                variantsContainer.parentNode.insertBefore(inlineBtn, variantsContainer.nextSibling);
            }
        }
        const genBtn      = document.getElementById('q-btn-generate');
        const nextBtn     = null; // single-step flow — no next button
        const phoneStep   = null;
        const photoStep   = document.getElementById('q-step-photo');
        const uploadStep  = photoStep; // alias for PIX/error refs

        const closeBtn    = document.getElementById('q-close-btn');
        const backBtn     = document.getElementById('q-btn-back');
        const retryBtn    = document.getElementById('q-retry-btn');
        const cameraInput = document.getElementById('q-camera-input');
        const galleryInput= document.getElementById('q-gallery-input');
        const phoneInput  = document.getElementById('q-phone');

        // ── Pré-preenche último número usado (localStorage) ──
        const _PL_LAST_PHONE = 'pl_last_phone';
        try {
            const saved = localStorage.getItem(_PL_LAST_PHONE);
            if (saved && /^\d{10,11}$/.test(saved)) {
                const m = saved.match(/(\d{2})(\d{4,5})(\d{4})/);
                if (m) phoneInput.value = '(' + m[1] + ') ' + m[2] + '-' + m[3];
            }
        } catch (_) {}
        function _savePhoneIfValid() {
            const nums = phoneInput.value.replace(/\D/g, '');
            if (/^\d{10,11}$/.test(nums)) {
                try { localStorage.setItem(_PL_LAST_PHONE, nums); } catch (_) {}
            }
        }
        phoneInput.addEventListener('blur', _savePhoneIfValid);
        const preImg      = document.getElementById('q-pre-img');
        const facePlaceholder = document.getElementById('q-face-placeholder');

        // keep realInput alias so PIX code still works
        const realInput   = galleryInput;

        let userPhoto = null;
        let pixPaymentId = null;
        let selectedProductImgUrl = '';

        // Upgrade Nuvemshop CDN URLs to 1024px version
        function upgradeImgUrl(url) {
            if (url.includes('mitiendanube.com') || url.includes('nuvemshop.com')) {
                return url.replace(/-\d+-\d+\.webp/, '-1024-1024.webp');
            }
            return url;
        }

        function extractImages() {
            const containersSelectors = '.js-product-slide, .product-image-column, .js-swiper-product, [data-store^="product-image-"], .product__media-wrapper, .product-gallery__media, .product__media, .product-image-main, .product-media-container, [data-media-id], .product__media-item, .product-gallery, .product-single__media, .media-gallery, [data-component="product.gallery"], .swiper-slide:not(.swiper-slide-duplicate), .slider-wrapper';
            const possibleContainers = Array.from(document.querySelectorAll(containersSelectors));
            let imgEls = [];
            possibleContainers.forEach(c => {
                if (!c.closest('#q-modal-ia')) {
                    const foundImgs = c.querySelectorAll('img');
                    imgEls.push(...Array.from(foundImgs));
                }
            });
            let uniqueImgs = [];
            imgEls.forEach(img => {
                let src = img.dataset?.src || img.getAttribute('data-src') || img.src;

                if (src && src.includes('data:image')) {
                    const parentA = img.closest('a');
                    if (parentA && parentA.href && !parentA.href.includes('javascript:')) {
                        src = parentA.href;
                    } else if (img.getAttribute('data-srcset')) {
                        src = img.getAttribute('data-srcset').split(',')[0].trim().split(' ')[0];
                    }
                }

                if (!src || src.includes('data:image')) return;

                const lowerSrc = src.toLowerCase();
                const invalidKeywords = ['provador', 'logo', 'provoulevou', 'icon', 'play', 'video', 'transparent', 'placeholder', 'blank', 'spacer'];
                if (invalidKeywords.some(kw => lowerSrc.includes(kw))) return;

                // Filter out tiny images (1x1 pixels, spacers, etc.)
                if (img.naturalWidth > 0 && img.naturalWidth < 50) return;
                if (img.naturalHeight > 0 && img.naturalHeight < 50) return;

                let cleanSrc = src.split('?')[0].replace(/-\d+-\d+\.webp|_\d+x\d+/, '');

                // Upgrade to 1024px version
                src = upgradeImgUrl(src);

                if (!uniqueImgs.some(u => u.split('?')[0].replace(/-\d+-\d+\.webp|_\d+x\d+/, '') === cleanSrc)) {
                    uniqueImgs.push(src);
                }
            });
            if (uniqueImgs.length === 0) {
                const og = document.querySelector('meta[property="og:image"]')?.content;
                if (og) uniqueImgs.push(upgradeImgUrl(og));
            }
            return uniqueImgs.slice(0, 4);
        }

        function populateImageSelector() {
            const imgs = extractImages();
            const group = document.getElementById('q-photo-selector-group');
            if (group) group.style.display = 'none';
            selectedProductImgUrl = imgs[0] || '';
        }

        // -- Tracking de abertura do provador (session anonima) - Provou Levou --
        var WEBHOOK_OPEN_PL = 'https://n8n.segredosdodrop.com/webhook/pl-provador-open';
        function plSid() { try { var s = localStorage.getItem('pl_sid'); if (!s) { s = 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10); localStorage.setItem('pl_sid', s); } return s; } catch (e) { return 'nostore'; } }
        function plTrackOpen() { try { fetch(WEBHOOK_OPEN_PL, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: plSid(), origin: location.origin, produto: (document.querySelector('h1.product-name, h1.product__title, .product-single__title, h1') || {}).innerText || document.title || '' }) }).catch(function () {}); } catch (e) {} }
        function plTrackProved(rawPhone) { try { var d = (rawPhone || '').replace(/\D/g, ''); if (d.length > 11 && d.slice(0, 2) === '55') d = d.slice(2); fetch(WEBHOOK_OPEN_PL, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: plSid(), proved: true, telefone_cliente: d || null }) }).catch(function () {}); } catch (e) {} }
        // ── Detecção de rosto: foto do óculos no rosto vira a referência principal ──
        // Roda no navegador (FaceDetector nativo do Chromium; fallback MediaPipe via CDN).
        // Varre a galeria do produto (extractImages) e coleta as fotos com rosto. Fallback
        // seguro: se nada detectar ou der erro, mantém as fotos default — sem regressão.
        var faceDetectPromise = null, _faceUrls = [], _faceDet = null, _faceDetTried = false;
        async function getFaceDetector() {
            if (_faceDetTried) return _faceDet;
            _faceDetTried = true;
            try {
                if ('FaceDetector' in window) { _faceDet = { native: new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 }) }; return _faceDet; }
            } catch (e) {}
            try {
                var vision = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/vision_bundle.mjs');
                var fileset = await vision.FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm');
                var det = await vision.FaceDetector.createFromOptions(fileset, {
                    baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite' },
                    runningMode: 'IMAGE'
                });
                _faceDet = { mp: det };
            } catch (e) { _faceDet = null; }
            return _faceDet;
        }
        function _plLoadCorsImg(url) {
            return new Promise(function (resolve) {
                var img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = function () { resolve(img); };
                img.onerror = function () { resolve(null); };
                img.src = url;
            });
        }
        async function _plImgHasFace(det, img) {
            try {
                if (det.native) { var f = await det.native.detect(img); return !!(f && f.length); }
                if (det.mp) { var r = det.mp.detect(img); return !!(r && r.detections && r.detections.length); }
            } catch (e) {}
            return false;
        }
        async function _plDetectFaces(urls) {
            if (!urls || !urls.length) return _faceUrls;
            var det = await getFaceDetector();
            if (!det) return _faceUrls;
            for (var i = 0; i < urls.length && _faceUrls.length < 4; i++) {
                var img = await _plLoadCorsImg(urls[i]);
                if (!img) continue;
                if (await _plImgHasFace(det, img)) _faceUrls.push(urls[i]);
            }
            return _faceUrls;
        }
        function startFaceDetect() {
            if (faceDetectPromise) return faceDetectPromise;
            var _urls = [];
            try { if (typeof extractImages === 'function') _urls = extractImages().slice(0, 12); } catch (e) {}
            faceDetectPromise = _plDetectFaces(_urls).then(function (arr) {
                if (arr && arr.length) { try { console.log('[PL] fotos no rosto detectadas:', arr.length); } catch (e) {} }
                return arr;
            }).catch(function () { return _faceUrls; });
            return faceDetectPromise;
        }

        function openModal() {
            try { startFaceDetect(); } catch (e) {}
            plTrackOpen();
            // Lazy-load Phosphor Icons na primeira abertura
            if (!window.phosphorIconsLoaded) {
                var ph = document.createElement('script');
                ph.src = 'https://unpkg.com/@phosphor-icons/web';
                document.head.appendChild(ph);
                window.phosphorIconsLoaded = true;
            }
            modal.style.display = 'flex';
            lockBodyScroll();
            // Mostra contador imediatamente (só por IP) ao abrir o modal
        }


        function closeModal() {
            modal.style.display = 'none';
            unlockBodyScroll();
        
            // --- volta pra tela inicial ao fechar (pos-prova) + limpa input p/ 2a foto enviar ---
            try {
                var _qsr = document.getElementById('q-step-result'); if (_qsr) _qsr.style.display = 'none';
                var _qsp = (typeof photoStep !== 'undefined' && photoStep) ? photoStep : document.getElementById('q-step-photo');
                if (_qsp) _qsp.style.display = 'flex';
                var _qcard = document.querySelector('.q-card-ia'); if (_qcard) _qcard.classList.remove('is-result');
                if (typeof userPhoto !== 'undefined') userPhoto = null;
                if (typeof pixPaymentId !== 'undefined') pixPaymentId = null;
                if (typeof preImg !== 'undefined' && preImg) preImg.style.display = 'none';
                if (typeof facePlaceholder !== 'undefined' && facePlaceholder) facePlaceholder.style.display = 'flex';
                try { if (typeof cameraInput !== 'undefined' && cameraInput) cameraInput.value = ''; if (typeof galleryInput !== 'undefined' && galleryInput) galleryInput.value = ''; } catch (e) {}
                if (typeof checkFields === 'function') checkFields();
            } catch (e) {}
        }


        function applyProduct(product) {
            currentProduct = product;
        }


        openBtn.onclick = (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            const prodName = document.querySelector('h1.product__title,.product-single__title,h1')?.innerText || document.title;
            applyProduct(detectProduct(prodName));
            populateImageSelector();
            openModal();
        };


        closeBtn.onclick = () => closeModal();
        backBtn.onclick = () => closeModal();


        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });


        retryBtn.onclick = () => {
            try { if (typeof cameraInput !== 'undefined' && cameraInput) cameraInput.value = ''; if (typeof galleryInput !== 'undefined' && galleryInput) galleryInput.value = ''; } catch (e) {}
            document.getElementById('q-step-result').style.display = 'none';
            photoStep.style.display = 'flex';
            document.querySelector('.q-card-ia').classList.remove('is-result');
            userPhoto = null;
            pixPaymentId = null;
            preImg.style.display = 'none';
            if (facePlaceholder) facePlaceholder.style.display = 'flex';
            checkFields();
        };

        // Camera / gallery buttons
        document.getElementById('q-btn-camera').onclick = function() { cameraInput.click(); };
        document.getElementById('q-btn-gallery').onclick = function() { galleryInput.click(); };
        document.getElementById('q-face-frame').onclick = function() { galleryInput.click(); };

        function loadRelatedProducts() {
            var grid = document.getElementById('q-related-grid');
            var section = document.getElementById('q-related-products');
            if (!grid || !section) return;

            // Bagy/Dooca: #product-related com .col-6 / Nuvemshop: outros padrões
            var sel = [
                '#product-related .col-6, #product-related .col-md-3',
                '#product-related .product-card', '#product-related .card-product', '#product-related .product-item',
                '.product-related .col-6, .product-related .col-md-3',
                '.product-related .product-card', '.product-related .card-product', '.product-related .product-item',
                '.related-products .product-card', '.related-products .card-product', '.related-products .product-item',
                '[data-component="products.list"] .product-item',
                '.js-swiper-related .js-item-product',
                '.js-item-product',
                '.product-card', '.card-product'
            ];
            var items = [];
            for (var i = 0; i < sel.length && !items.length; i++) {
                items = document.querySelectorAll(sel[i]);
            }
            if (!items.length) {
                console.log('[PL] Nenhum produto relacionado encontrado');
                return;
            }

            var products = [];
            var prodHref = window.location.pathname;

            items.forEach(function(item) {
                if (products.length >= 4) return;
                try {
                    // 1) Link
                    var linkEl = item.querySelector('a[href]') || (item.tagName === 'A' ? item : null);
                    var link = linkEl ? linkEl.getAttribute('href') : '';
                    if (!link || link === '#' || link === prodHref) return; // ignora link inválido ou o produto atual

                    // 2) Imagem
                    var imgEl = item.querySelector('img');
                    var img = '';
                    if (imgEl) {
                        img = imgEl.getAttribute('src') || imgEl.getAttribute('data-src') || imgEl.getAttribute('data-original') || '';
                        // srcset fallback
                        if (!img) {
                            var srcset = imgEl.getAttribute('srcset') || imgEl.getAttribute('data-srcset');
                            if (srcset) img = srcset.split(',')[0].trim().split(' ')[0];
                        }
                    }
                    if (!img) return;

                    // 3) Nome — tenta multiplos seletores
                    var nameEl = item.querySelector('.product-name, .card-product-name, .product-title, .card-title, h3, h4, [class*="name"]');
                    var name = nameEl ? nameEl.textContent.trim() : (imgEl && imgEl.alt ? imgEl.alt.trim() : '');

                    // 4) Preço — tenta multiplos seletores e extrai só o "R$ X,XX" (ignora parcelamento/creditcard)
                    var priceEl = item.querySelector('.product-price-final .total, .product-price-final .price, .product-price .total, .price-final, .product-price, .card-product-price, [class*="price"]');
                    var price = '';
                    if (priceEl) {
                        var raw = priceEl.textContent.replace(/\s+/g, ' ').trim();
                        var m = raw.match(/R\$\s*[\d.]+,\d{2}/);
                        price = m ? m[0] : '';
                    }

                    if (img && name) {
                        products.push({ name: name, img: img, price: price, link: link });
                    }
                } catch(e) {}
            });

            if (!products.length) {
                console.log('[PL] Nenhum produto extraído com sucesso');
                return;
            }

            while (grid.firstChild) grid.removeChild(grid.firstChild);
            products.slice(0, 4).forEach(function(p) {
                var a = document.createElement('a');
                a.className = 'q-related-card';
                a.href = p.link || '#';
                a.target = '_blank';
                var img = document.createElement('img');
                img.src = p.img;
                img.alt = p.name;
                img.loading = 'lazy';
                var nameEl = document.createElement('span');
                nameEl.className = 'q-related-card-name';
                nameEl.textContent = p.name;
                a.appendChild(img);
                a.appendChild(nameEl);
                if (p.price) {
                    var priceEl = document.createElement('span');
                    priceEl.className = 'q-related-card-name';
                    priceEl.style.color = 'var(--c-brand)';
                    priceEl.style.fontWeight = '700';
                    priceEl.textContent = p.price;
                    a.appendChild(priceEl);
                }
                grid.appendChild(a);
            });
            section.style.display = 'block';
            console.log('[PL] ' + products.length + ' produtos relacionados carregados');
        }

        // ── Barra de progresso simulada (não há evento real de progresso do backend).
        // Desacelera perto de 92% e se auto-encerra sozinha quando a tela de loading
        // for escondida (sucesso, erro ou limite) — não precisa de hook em cada saída. ──
        var _qProgressTimer = null;
        function startLoadingProgress() {
            if (_qProgressTimer) { clearInterval(_qProgressTimer); _qProgressTimer = null; }
            var lb = document.getElementById('q-loading-box');
            var bar = lb ? lb.querySelector('.q-loading-bar > div') : null;
            if (!lb || !bar) return;
            bar.style.transition = 'none';
            bar.style.transform = 'scaleX(0)';
            void bar.offsetWidth;
            bar.style.transition = 'transform 0.3s ease-out';
            var progress = 0;
            _qProgressTimer = setInterval(function () {
                if (lb.style.display !== 'flex') { clearInterval(_qProgressTimer); _qProgressTimer = null; return; }
                var remaining = 92 - progress;
                progress += Math.max(remaining * 0.06, 0.15);
                if (progress > 92) progress = 92;
                bar.style.transform = 'scaleX(' + (progress / 100) + ')';
            }, 200);
        }

        function showError() {
            var lb = document.getElementById('q-loading-box');
            var su = photoStep;
            var se = document.getElementById('q-step-error');
            if (lb) lb.style.display = 'none';
            if (su) su.style.display = 'none';
            if (se) se.style.display = 'flex';
        }
        var _eb = document.getElementById('q-error-back'); if (_eb) _eb.onclick = function() { closeModal(); };



        phoneInput.addEventListener('input', function (e) {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
            e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
            checkPhoneStep();
        });

        // ── Contador de provas restantes (debounced) ──
        let _provasDebounce;
        async function _checkProvasRestantes() {
            const _els = document.querySelectorAll('.q-provas-msg');
            if (!_els.length) return;
            const nums = phoneInput.value.replace(/\D/g, '');
            const phoneOk = isValidBRPhone(nums);
            const phone = phoneOk ? '55' + nums : '0';
            try {
                const r = await fetch(WEBHOOK_CHECK_LIMIT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone })
                });
                const d = await r.json();
                const used = Math.max(d.phone_count || 0, d.ip_count || 0, d.count || 0);
                const restantes = Math.max(0, 3 - used);
                if (restantes > 0) {
                    const _txt = restantes + (restantes === 1 ? ' prova restante hoje' : ' provas restantes hoje');
                    _els.forEach(el => { el.textContent = _txt; el.classList.remove('is-warn'); });
                } else {
                    _els.forEach(el => { el.textContent = 'Você já usou suas 3 provas de hoje — volte amanhã! 🌙'; el.classList.add('is-warn'); });
                }
            } catch(_) { _els.forEach(el => { el.textContent = ''; el.classList.remove('is-warn'); }); }
        }
        phoneInput.addEventListener('input', () => {
            clearTimeout(_provasDebounce);
            _provasDebounce = setTimeout(_checkProvasRestantes, 600);
        });
        setTimeout(_checkProvasRestantes, 300);



        function flashError(targetEl, hintMsg) {
            var hint = document.getElementById('q-validation-hint');
            if (hint) {
                hint.textContent = '\u26A0\uFE0F ' + hintMsg;
                hint.classList.add('is-visible');
            }
            if (targetEl) {
                targetEl.classList.add('is-error', 'q-shake');
                setTimeout(function(){ targetEl.classList.remove('q-shake'); }, 600);
                try { targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (_) {}
                if (targetEl.focus) setTimeout(function(){ targetEl.focus(); }, 350);
            }
        }
        function checkPhoneStep() {
            const nums = phoneInput.value.replace(/\D/g, '');
            const phoneOk = isValidBRPhone(nums);
            document.getElementById('q-phone-error').style.display = (phoneInput.value.length > 0 && !phoneOk) ? 'block' : 'none';
            phoneInput.style.borderColor = (phoneInput.value.length > 0 && !phoneOk) ? '#ef4444' : 'var(--q-border)';
            checkFields();
        }

        function checkFields() {
            const nums = phoneInput.value.replace(/\D/g, '');
            const phoneOk = isValidBRPhone(nums);
            /* aggressive validation: botão sempre clicável */
        }

        document.getElementById('q-accept-terms').onchange = checkFields;

        function handlePhotoSelected(file) {
            if (!file) return;
            userPhoto = file;
            const rd = new FileReader();
            rd.onload = ev => {
                preImg.src = ev.target.result;
                preImg.style.display = 'block';
                if (facePlaceholder) facePlaceholder.style.display = 'none';
                checkFields();
            };
            rd.readAsDataURL(file);
        }

        cameraInput.onchange  = (e) => handlePhotoSelected(e.target.files[0]);
        galleryInput.onchange = (e) => handlePhotoSelected(e.target.files[0]);


        function resizeImage(fileOrBlob, maxSize) {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    let w = img.width, h = img.height;
                    if (w <= maxSize && h <= maxSize) { resolve(fileOrBlob); return; }
                    if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
                    else { w = Math.round(w * maxSize / h); h = maxSize; }
                    const c = document.createElement('canvas');
                    c.width = w; c.height = h;
                    c.getContext('2d').drawImage(img, 0, 0, w, h);
                    c.toBlob(b => resolve(b), 'image/jpeg', 0.95);
                };
                const url = URL.createObjectURL(fileOrBlob instanceof Blob ? fileOrBlob : new Blob([fileOrBlob]));
                img.src = url;
            });
        }

        // ── PIX: polling e controle ──
        let pixPollingTimer = null;

        function stopPixPolling() {
            if (pixPollingTimer) { clearInterval(pixPollingTimer); pixPollingTimer = null; }
        }

        function showPixScreen() {
            uploadStep.style.display = 'none';
            document.getElementById('q-step-pix').style.display = 'block';
            document.getElementById('q-pix-status-msg').textContent = 'Aguardando pagamento...';
            document.getElementById('q-pix-status-msg').className = 'q-pix-status q-pix-waiting';
        }

        function hidePixScreen() {
            stopPixPolling();
            document.getElementById('q-step-pix').style.display = 'none';
        }

        
        // ── PIX pendente em localStorage (evita cobrar duas vezes) ──
        const _PIX_LS_KEY = 'pl_pix_pending_v1';
        const _PIX_TTL_MS = 25 * 60 * 1000; // PIX MP expira em 30min
        function _pixLoadPending(phone) {
            try {
                const raw = localStorage.getItem(_PIX_LS_KEY);
                if (!raw) return null;
                const arr = JSON.parse(raw);
                const now = Date.now();
                const valid = arr.filter(p => p.phone === phone && (now - p.ts) < _PIX_TTL_MS);
                return valid[0] || null;
            } catch (_) { return null; }
        }
        function _pixSavePending(phone, payment_id, qr_code, qr_code_base64) {
            try {
                const raw = localStorage.getItem(_PIX_LS_KEY);
                let arr = [];
                try { arr = raw ? JSON.parse(raw) : []; } catch (_) {}
                const now = Date.now();
                arr = arr.filter(p => (now - p.ts) < _PIX_TTL_MS && p.phone !== phone);
                arr.push({ phone, payment_id, qr_code, qr_code_base64, ts: now });
                localStorage.setItem(_PIX_LS_KEY, JSON.stringify(arr));
            } catch (_) {}
        }
        function _pixClearPending(phone) {
            try {
                const raw = localStorage.getItem(_PIX_LS_KEY);
                if (!raw) return;
                let arr = JSON.parse(raw);
                arr = arr.filter(p => p.phone !== phone);
                localStorage.setItem(_PIX_LS_KEY, JSON.stringify(arr));
            } catch (_) {}
        }

        async function createPixAndPoll() {
            /* PIX_DESATIVADO: prova extra via PIX removida - mostra so mensagem de volte amanha. */
            try {
                var _ph = document.getElementById('q-step-photo'); if (_ph) _ph.style.display = 'none';
                var _lb = document.getElementById('q-loading-box'); if (_lb) _lb.style.display = 'none';
                var _pix = document.getElementById('q-step-pix');
                if (_pix) { _pix.style.display = 'block'; _pix.innerHTML = '<h2>Limite de hoje atingido</h2><p class="q-pix-subtitle" style="text-align:center;">Voc&ecirc; j&aacute; usou suas provas de hoje.<br>Volte amanh&atilde; para experimentar mais &oacute;culos! &#128522;</p>'; }
            } catch (e) {}
            return;
            showPixScreen();
            try {
                let pix;

                const _ppPhone = '55' + phoneInput.value.replace(/\D/g, '');

                const pending = _pixLoadPending(_ppPhone);

                if (pending) {

                    pix = { payment_id: pending.payment_id, qr_code: pending.qr_code, qr_code_base64: pending.qr_code_base64 };

                } else {

                    const resp = await fetch(WEBHOOK_PIX, {

                        method: 'POST',

                        headers: { 'Content-Type': 'application/json' },

                        body: JSON.stringify({ email: 'cliente@provoulevou.com.br', phone: '55' + phoneInput.value.replace(/\D/g, ''), loja: 'univisao', origin: location.origin })

                    });

                    pix = await resp.json();

                    if (!pix.payment_id || !pix.qr_code) throw new Error('PIX inválido');

                    _pixSavePending(_ppPhone, pix.payment_id, pix.qr_code, pix.qr_code_base64);

                }

                document.getElementById('q-pix-qr-img').src = 'data:image/png;base64,' + pix.qr_code_base64;
                document.getElementById('q-pix-code').value = pix.qr_code;

                // Polling a cada 3s por até 5min
                let attempts = 0;
                pixPollingTimer = setInterval(async () => {
                    attempts++;
                    if (attempts > 100) { stopPixPolling(); return; }
                    try {
                        const sr = await fetch(WEBHOOK_PIX_STATUS + '?payment_id=' + pix.payment_id);
                        const st = await sr.json();
                        if (st.status === 'approved') {
                            stopPixPolling();
                            _pixClearPending(_ppPhone);
                            document.getElementById('q-pix-status-msg').textContent = 'Pagamento confirmado!';
                            document.getElementById('q-pix-status-msg').className = 'q-pix-status q-pix-approved';
                            setTimeout(() => {
                                hidePixScreen();
                                pixPaymentId = pix.payment_id;
                                runGeneration();
                            }, 1200);
                        }
                    } catch (_) {}
                }, 3000);
            } catch (e) {
                hidePixScreen();
                uploadStep.style.display = 'block';
                showError();
            }
        }

        // (PIX removido — Univisão usa fluxo "volte amanhã", sem tela de PIX)

        // ── GERAÇÃO PRINCIPAL ──
        async function runGeneration() {
            const keyToUse = window.PROVOU_LEVOU_API_KEY;
            if (!keyToUse || keyToUse.includes("COLOQUE_A_CHAVE_AQUI")) {
                showError();
                return;
            }

            const prodImg = selectedProductImgUrl || (document.querySelector('meta[property="og:image"]')?.content || '');
            const prodName = document.querySelector('h1.product__title,.product-single__title,h1')?.innerText || document.title;

            uploadStep.style.display = 'none';
            document.getElementById('q-loading-box').style.display = 'flex';
            startLoadingProgress();

            try {
                // Guard: re-valida telefone antes de submeter (evita whatsapp vazio)
                const _finalNums = (phoneInput.value || '').replace(/\D/g, '');
                if (typeof isValidBRPhone === 'function' && !isValidBRPhone(_finalNums)) {
                    try { document.getElementById('q-loading-box').style.display = 'none'; } catch(_) {}
                    try { uploadStep.style.display = 'block'; } catch(_) {}
                    try { genBtn.disabled = false; } catch(_) {}
                    try { phoneInput.focus(); } catch(_) {}
                    return;
                }
const fd = new FormData();
                fd.append('person_image', await toJpeg(userPhoto), 'person.jpg');
                fd.append('whatsapp', '55' + phoneInput.value.replace(/\D/g, ''));
                fd.append('phone_raw', phoneInput.value);
                fd.append('product_name', prodName);
                fd.append('product_url', window.location.href);
                fd.append('product_type', currentProduct.category);
                fd.append('product_fit', currentProduct.fit);
                fd.append('api_key', keyToUse);
                if (pixPaymentId) fd.append('pix_payment_id', pixPaymentId);

                // Coleta até 4 fotos do produto: 1ª como binary (compat), 2ª-4ª como base64 text.
                // 1ª = prodImg (escolhida pelo cliente ou default); demais = extractImages() exceto a 1ª.
                let allProdImgs = [];
                if (prodImg) allProdImgs.push(prodImg);
                try {
                    if (typeof extractImages === 'function') {
                        const extra = extractImages();
                        for (const u of extra) {
                            const cleanU = String(u || '').split('?')[0];
                            if (!allProdImgs.some(p => String(p).split('?')[0] === cleanU)) {
                                allProdImgs.push(u);
                            }
                        }
                    }
                } catch (_) {}
                    // Detecção de rosto: manda 1 foto no rosto como PRINCIPAL (o gerador usa pra
                    // calibrar a proporção/tamanho do óculos) + as fotos de fundo branco (packshot),
                    // que mostram os detalhes da armação. Assim garante proporção E detalhe.
                    // Sem rosto detectado → mantém as fotos default (fallback, sem regressão).
                    try {
                        if (faceDetectPromise) { await Promise.race([faceDetectPromise, new Promise(function (r) { setTimeout(r, 4000); })]); }
                        if (_faceUrls && _faceUrls.length) {
                            var _key = function (u) { return String(u || '').split('?')[0]; };
                            var _faceKeys = {};
                            _faceUrls.forEach(function (u) { _faceKeys[_key(u)] = 1; });
                            var _packshots = allProdImgs.filter(function (u) { return !_faceKeys[_key(u)]; });
                            var _mix = [];
                            var _add = function (u) { if (u && !_mix.some(function (x) { return _key(x) === _key(u); })) _mix.push(u); };
                            _add(_faceUrls[0]);
                            _packshots.forEach(_add);
                            _faceUrls.slice(1).forEach(_add);
                            allProdImgs.forEach(_add);
                            allProdImgs = _mix;
                        }
                    } catch (e) {}
                allProdImgs = allProdImgs.slice(0, 4);
                console.log('[PL Univisao] Enviando', allProdImgs.length, 'fotos do produto');
                for (let _pi = 0; _pi < allProdImgs.length; _pi++) {
                    try {
                        const _b = await fetch(allProdImgs[_pi]).then(r => r.blob());
                        if (_pi === 0) {
                            fd.append('product_image', _b, 'product.jpg');
                        } else {
                            const _b64 = await new Promise((resolve, reject) => {
                                const _r = new FileReader();
                                _r.onloadend = () => resolve(_r.result.split(',')[1]);
                                _r.onerror = reject;
                                _r.readAsDataURL(_b);
                            });
                            fd.append('product_image_' + (_pi+1) + '_b64', _b64);
                        }
                    } catch (_) { }
                }

                const res = await fetch(WEBHOOK_PROVA, { method: 'POST', body: fd });

                const contentType = res.headers.get("content-type") || "";
                if (contentType.includes("application/json")) {
                    const data = await res.json();
                    if (data.error) {
                        document.getElementById('q-loading-box').style.display = 'none';
                        photoStep.style.display = 'flex';
                        if (data.error === "Chave invalida, vencida ou inativa." || data.error.includes("vencida ou inativa")) {
                            showError();
                        } else {
                            alert(data.error);
                        }
                        return;
                    }
                }

                if (res.ok) {
                    const blob = await res.blob();
                    document.getElementById('q-loading-box').style.display = 'none';
                    document.getElementById('q-final-view-img').src = URL.createObjectURL(blob);
                    document.querySelector('.q-card-ia').classList.add('is-result');
                    plTrackProved((document.getElementById('q-phone') || document.getElementById('mc-phone') || document.querySelector('input[type=tel]') || {}).value);
                    document.getElementById('q-step-result').style.display = 'flex';
                    try { populateBuyCta(); } catch (e) {}
                    loadRelatedProducts();
                } else if (res.status === 401 || res.status === 403) {
                    document.getElementById('q-loading-box').style.display = 'none';
                    photoStep.style.display = 'flex';
                    showError();
                } else { throw new Error(); }
            } catch (e) {
                document.getElementById('q-loading-box').style.display = 'none';
                photoStep.style.display = 'flex';
                showError();
            }
        }

        genBtn.onclick = async () => {
            // Validação agressiva (UI feedback)
            var _vNums = (phoneInput.value || '').replace(/\D/g, '');
            var _vPhoneOk = isValidBRPhone(_vNums);
            var _vFaceFrame = document.getElementById('q-face-frame');
            var _vTerms = document.getElementById('q-accept-terms');
            if (!_vPhoneOk) { flashError(phoneInput, 'Preencha seu WhatsApp para continuar'); return; }
            if (!userPhoto) { flashError(_vFaceFrame, 'Envie ou tire sua foto para continuar'); return; }
            if (_vTerms && !_vTerms.checked) { flashError(document.querySelector('.q-terms-row'), 'Aceite os termos para continuar'); return; }
            var _vHint = document.getElementById('q-validation-hint');
            if (_vHint) _vHint.classList.remove('is-visible');
            phoneInput.classList.remove('is-error');
            if (_vFaceFrame) _vFaceFrame.classList.remove('is-error');

            if (!userPhoto) return;
            const _gNums = (phoneInput.value || '').replace(/\D/g, '');
            const _gPhoneOk = isValidBRPhone(_gNums);
            if (!_gPhoneOk) { phoneInput.focus(); return; }

            const phone = '55' + phoneInput.value.replace(/\D/g, '');
            genBtn.disabled = true;

            // Feedback imediato: mostra a animacao na hora; o check de limite roda enquanto ela ja aparece.
            try { uploadStep.style.display = 'none'; } catch (_) {}
            try { document.getElementById('q-loading-box').style.display = 'flex';
 startLoadingProgress(); } catch (_) {}


            try {
                const resp = await fetch(WEBHOOK_CHECK_LIMIT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone, notify: true })
                });
                const data = await resp.json();
                if (data.limited) {
                    try { document.getElementById('q-loading-box').style.display = 'none'; } catch (_) {}
                    try { uploadStep.style.display = 'none'; } catch (_) {}
                    genBtn.disabled = false;
                    var _lim = document.getElementById('q-step-pix');
                    if (_lim) _lim.style.display = 'block';
                    var _cb = document.getElementById('q-limit-close');
                    if (_cb) _cb.onclick = function(){ var x = document.getElementById('q-close-btn'); if (x) x.click(); };
                    return;
                }
            } catch (_) {
                // se o check falhar, deixa gerar (evita bloquear por erro de rede)
            }

            genBtn.disabled = false;
            runGeneration();
        };
    }

    // ─── EXECUTA APENAS EM PÁGINAS DE PRODUTO ────────────────────────────────────
    function detectProductPage() {
        if (window.location.pathname === '/' || /^\/(oculos-de-sol|categorias?|colecao|colecoes|busca|search|carrinho|checkout|conta|login|quem-somos|contato|institucional)\/?$/.test(window.location.pathname)) return false;
        if (document.querySelector('input[name="variation_id"]')) return true;
        if (document.querySelector('.product-action-price')) return true;
        const ld = document.querySelectorAll('script[type="application/ld+json"]');
        for (const s of ld) { try { const j = JSON.parse(s.textContent); const t = (j['@type'] || (j['@graph']||[]).map(x=>x['@type']).flat()); if ((Array.isArray(t)?t:[t]).includes('Product')) return true; } catch(_){} }
        if (document.querySelector('meta[property="og:type"][content="product"]')) return true;
        if (window.location.pathname.includes('/produto/') || window.location.pathname.includes('/products/') || window.location.pathname.includes('/p/')) return true;
        return false;
    }
    const isProductPage = detectProductPage();
    console.log('[PL] É página de produto?', isProductPage);

    if (isProductPage) {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
        else init();
    }

})();
