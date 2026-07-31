/* Provador Virtual — Loja Demo Provou Levou
 *
 * O CSS e o HTML do modal sao os MESMOS do widget que roda nas lojas dos
 * clientes (extraidos de widget-programmoda.js), para o provador da demo
 * ficar identico ao delas. As unicas diferencas:
 *   1. o logo do header e o da Provou Levou, no lugar do logo do lojista;
 *   2. o motor e o endpoint generico, porque a loja demo nao tem api_key
 *      cadastrada no Switch do gerador.
 *
 * A pagina define window.PL_DEMO antes de carregar este arquivo.
 */
(function () {
    'use strict';

    var CFG = window.PL_DEMO || {};
    var TIPO = CFG.tipo === 'roupa' ? 'roupa' : 'oculos';

    var MOTOR = {
        oculos: {
            endpoint: 'https://n8n.segredosdodrop.com/webhook/gerador-oculos-teste',
            cta: 'Provar óculos',
            espera: 180000
        },
        roupa: {
            endpoint: 'https://n8n.segredosdodrop.com/webhook/materialize-generico',
            cta: 'Provar roupa',
            espera: 120000
        }
    }[TIPO];

    var SELO_PNG = 'https://cdn.shopify.com/s/files/1/0636/6334/1746/files/logo_provador.png?v=1772494793';

    /* ─── CSS e HTML identicos aos das lojas ──────────────────────────── */
    var style = document.createElement('style');
    style.textContent = `
        /* ── Fontes ── */

        :root {
            --c-bg: #ffffff;
            --c-surface: #f7f6f4;
            --c-ink: #111111;
            --c-muted: #999;
            --c-line: #e8e8e8;
            --c-accent: #111111;
            --c-danger: #cc3333;
            --font-display: inherit;
            --font-body: inherit;
        }

        /* ── Trigger (selo sobre foto) ── */
        @keyframes q-shake { 0%,50%,100%{transform:rotate(0deg)} 10%,30%{transform:rotate(-10deg)} 20%,40%{transform:rotate(10deg)} }
        .q-btn-trigger-ia {
            position: absolute; top: 14px; right: 14px; z-index: 100;
            background: none; border: none; padding: 0; cursor: pointer;
            width: 70px; height: 70px;
            display: flex; align-items: center; justify-content: center;
            filter: drop-shadow(0 3px 10px rgba(0,0,0,0.22));
            animation: q-shake 3s infinite;
            transition: filter 0.2s;
        }
        .q-btn-trigger-ia:hover { filter: drop-shadow(0 6px 18px rgba(0,0,0,0.32)); }
        .q-btn-trigger-ia img { width: 100%; height: 100%; object-fit: contain; opacity: 1 !important; }
        @media (min-width: 768px) { .q-btn-trigger-ia { width: 70px; height: 70px; } }

        /* ── Inline button ── */
        .q-btn-inline-provador {
            display: flex; align-items: center; justify-content: center; gap: 7px;
            width: 100%; padding: 13px 16px;
            background: transparent; color: var(--c-ink);
            border: 1.5px solid var(--c-ink); border-radius: 25px;
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
                overflow: hidden;
            }
        }

        /* ── Close ── */
        .q-close-ia {
            position: absolute; top: 18px; right: 18px;
            background: none; border: none;
            font-size: 20px; font-weight: 300; color: var(--c-muted);
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
            font-size: 22px; letter-spacing: 4px;
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
        .q-input {
            display: block; width: 100%; height: 52px;
            padding: 0 16px; margin: 0;
            background: var(--c-surface); border: 1.5px solid transparent;
            border: 1.5px solid var(--c-line); border-radius: 14px;
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
            font-size: 16px; letter-spacing: 3px; text-transform: uppercase;
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
        /* Câmera ao vivo (getUserMedia) */
        .q-cam-overlay { position: fixed; inset: 0; z-index: 2147483646; background: #000; display: none; align-items: center; justify-content: center; }
        .q-cam-overlay.is-open { display: flex; }
        .q-cam-video { width: 100%; height: 100%; object-fit: cover; }
        .q-cam-overlay.is-front .q-cam-video { transform: scaleX(-1); }
        .q-cam-controls { position: absolute; bottom: 24px; left: 0; right: 0; display: flex; align-items: center; justify-content: center; gap: 28px; }
        .q-cam-shutter { width: 68px; height: 68px; border-radius: 50%; background: #fff; border: 4px solid rgba(255,255,255,.55); cursor: pointer; box-shadow: 0 2px 12px rgba(0,0,0,.45); padding: 0; }
        .q-cam-shutter:active { transform: scale(.93); }
        .q-cam-mini { width: 46px; height: 46px; border-radius: 50%; background: rgba(0,0,0,.5); color: #fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 22px; line-height: 1; }
        .q-cam-close { position: absolute; top: 14px; right: 14px; }
        .q-face-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .q-face-placeholder i { font-size: 72px; color: #d0d0d0; }
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
            display: flex; align-items: center; gap: 8px;
            font-size: 10px !important; color: var(--c-muted); cursor: pointer;
            line-height: 1.35 !important; margin-bottom: 14px;
            justify-content: center; text-align: center;
        }
        .q-terms-row span { font-size: 10px !important; line-height: 1.35 !important; }
        .q-terms-row input { width: 13px; height: 13px; margin-top: 0; cursor: pointer; accent-color: var(--c-ink); flex-shrink: 0; }
        .q-terms-row a { color: var(--c-ink); text-decoration: underline; text-underline-offset: 2px; font-size: 10px !important; }

        /* ── CTA buttons ── */
        .q-btn-black {
            width: 100%; height: 52px;
            background: var(--c-ink); color: #fff;
            border: none; border-radius: 14px;
            font-family: var(--font-display); font-size: 14px;
            letter-spacing: 3px; text-transform: uppercase;
            cursor: pointer; transition: opacity 0.2s; box-sizing: border-box;
        }
        .q-btn-black:hover:not(:disabled) { opacity: 0.82; }
        .q-btn-black:disabled { background: #ccc; cursor: not-allowed; }
        .q-btn-outline {
            width: 100%; height: 52px;
            background: transparent; color: var(--c-ink);
            border: 1.5px solid var(--c-line); border-radius: 14px;
            font-family: var(--font-display); font-size: 14px;
            letter-spacing: 3px; text-transform: uppercase;
            cursor: pointer; transition: border-color 0.2s, background 0.2s; box-sizing: border-box;
        }
        .q-btn-outline:hover { border-color: var(--c-ink); background: var(--c-surface); }

        /* ── PIX screen ── */
        #q-step-pix {
            display: none; text-align: center;
            padding: 36px 28px; flex-direction: column; gap: 16px; align-items: center;
        }
        #q-step-pix h2 {
            font-family: var(--font-display); font-size: 19px;
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
            font-family: var(--font-display); font-size: 15px; letter-spacing: 4px;
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
            font-family: var(--font-display); font-size: 15px;
            letter-spacing: 3px; text-transform: uppercase;
            color: var(--c-ink); padding: 20px 28px 16px; margin: 0;
            border-bottom: 1px solid var(--c-line);
            text-align: center;
        }
        .q-res-subtitle, .q-res-note { display: none; }

        #q-result-img-col {
            width: 100%; max-height: 56vh; background: var(--c-surface);
            overflow: hidden; display: flex; align-items: center; justify-content: center;
        }
        #q-result-img-col img { width: 100%; height: 100%; object-fit: cover; object-position: top center; display: block; }

        #q-result-actions-col {
            display: flex; flex-direction: column; gap: 8px;
            padding: 20px 28px 26px;
        }
        .q-res-mobile-only { margin: 0; }

        /* CTA de compra na tela de resultado */
        .q-result-prodinfo { text-align: left; margin-bottom: 6px; }
        .q-result-prodname {
            font-family: var(--font-body); font-size: 20px; font-weight: 700;
            color: var(--c-ink); line-height: 1.25; margin-bottom: 6px;
        }
        .q-result-prodprice {
            font-family: var(--font-display); font-size: 28px; letter-spacing: .5px; font-weight: 700;
            color: var(--c-ink); line-height: 1;
        }
        .q-result-installment {
            font-family: var(--font-body); font-size: 12px; color: var(--c-muted);
            margin-top: 4px; letter-spacing: .2px;
        }
        .q-scarcity {
            margin-top: 12px; font-family: var(--font-body); font-size: 13px; font-weight: 700;
            color: var(--c-danger); letter-spacing: 1.5px; text-transform: uppercase;
            display: flex; align-items: center; justify-content: flex-start; gap: 6px;
        }
        .q-scarcity i { font-size: 15px; }
        /* Selos de segurança */
        .q-seals {
            display: flex; justify-content: flex-start; gap: 30px;
            margin: 8px 0; padding: 12px 0;
            border-top: 1px solid var(--c-line); border-bottom: 1px solid var(--c-line);
        }
        .q-seal { display: flex; align-items: center; gap: 9px; }
        .q-seal > i { font-size: 24px; color: var(--c-ink); flex-shrink: 0; }
        .q-seal span {
            font-family: var(--font-body); font-size: 12px; font-weight: 700;
            text-transform: uppercase; letter-spacing: .6px; line-height: 1.25;
            color: var(--c-ink); text-align: left;
        }
        .q-fakebuy {
            position: fixed; left: 18px; bottom: 18px; z-index: 2147483000;
            background: var(--c-bg, #fff); color: var(--c-ink); border: 1px solid var(--c-line); border-radius: 10px;
            box-shadow: 0 8px 28px -6px rgba(0,0,0,.28); padding: 11px 14px;
            display: flex; align-items: center; gap: 10px; max-width: 290px;
            font-family: var(--font-body); opacity: 0; transform: translateY(14px);
            pointer-events: none; transition: opacity .35s ease, transform .35s ease;
        }
        .q-fakebuy.show { opacity: 1; transform: translateY(0); }
        .q-fakebuy > i { font-size: 22px; color: var(--c-ink); flex-shrink: 0; }
        .q-fakebuy strong { font-size: 12.5px; font-weight: 700; }
        .q-fakebuy > div { display: flex; flex-direction: column; line-height: 1.35; }
        .q-fakebuy span { font-size: 10.5px; color: var(--c-muted); }
        @media (max-width:560px){ .q-fakebuy{ left:12px; right:12px; bottom:12px; max-width:none; } }
        .q-btn-buy-now {
            background: var(--c-ink); color: #fff; border: 1px solid var(--c-ink);
            width: 100%; padding: 17px 18px; font-family: var(--font-body);
            font-weight: 700; font-size: 15px; letter-spacing: .2px; cursor: pointer;
            display: flex; align-items: center; justify-content: center; gap: 8px;
            border-radius: 14px; transition: .2s; line-height: 1.2;
        }
        .q-btn-buy-now:hover { opacity: .88; }
        .q-btn-buy-now .q-buy-price { font-weight: 800; white-space: nowrap; }
        .q-buy-trust {
            text-align: center; font-size: 11px; color: var(--c-muted);
            margin-top: 2px; letter-spacing: .2px;
        }

        /* ── Related products ── */
        #q-related-products { padding: 0 28px 28px; }
        #q-related-products h4 {
            font-family: var(--font-display); font-size: 13px;
            letter-spacing: 3px; text-transform: uppercase;
            color: var(--c-muted); margin: 20px 0 12px; font-weight: 400;
        }
        .q-related-grid {
            display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px;
            -webkit-overflow-scrolling: touch;
        }
        .q-related-grid::-webkit-scrollbar { display: none; }
        .q-related-card {
            flex: 0 0 calc(33.333% - 7px); min-width: 88px;
            text-decoration: none; color: var(--c-ink);
            display: flex; flex-direction: column; gap: 6px;
        }
        .q-related-card img {
            width: 100%; aspect-ratio: 1/1; object-fit: cover;
            border: 1px solid var(--c-line); display: block; border-radius: 3px;
        }
        .q-related-card-name {
            font-size: 10px; font-weight: 500; line-height: 1.4; color: var(--c-ink);
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
            font-family: var(--font-display); font-size: 18px;
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
    document.head.appendChild(style);

    // Nas lojas o botao acima do Comprar e uma pilula (raio 25px, 10px, Work
    // Sans). Aqui ele tem que acompanhar o FORMATO do botao de comprar da
    // loja demo: mesma altura, cantos retos e mesma tipografia. So o formato
    // -- a cor continua sendo contorno, para nao virar dois botoes iguais.
    var ajuste = document.createElement('style');
    ajuste.textContent = [
        '.q-btn-inline-provador{',
        '  height:52px;padding:0 16px;border-radius:0;',
        '  font-family:inherit;font-size:13px;font-weight:700;letter-spacing:1.6px;',
        '  border:1.5px solid var(--c-ink);background:transparent;color:var(--c-ink);',
        '}',
        '.q-btn-inline-provador svg{width:16px;height:16px;}',
        // Barra de progresso na cor da marca (o widget das lojas usa preto).
        '.q-loading-bar > div{background:#7c3aed;}',
        '.q-loading-bar{height:4px;}'
    ].join('\n');
    document.head.appendChild(ajuste);

    var holder = document.createElement('div');
    holder.innerHTML = `
        <div id="q-modal-ia">
            <div class="q-card-ia">
                <button type="button" class="q-close-ia" id="q-close-btn">&times;</button>
                <div class="q-content-scroll">

                    <!-- Persistent header (all steps) -->
                    <div id="q-header-provador">
                        <h1>Provador Virtual</h1>
                        <img src="https://i.ibb.co/MD3B4FQf/Logo-provou-preto-1.png" alt="Provou Levou" style="height:34px;width:auto;"/>
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
                        <button class="q-btn-black" id="q-btn-generate">Provar roupa</button>
                    </div>

                    <!-- PIX -->
                    <div id="q-step-pix">
                        <h2>Prova Extra</h2>
                        <p class="q-pix-subtitle">Limite de 3 provas atingido.<br>Pague R$1 via PIX para mais uma:</p>
                        <p style="font-size: 11px; color: var(--c-muted); margin: 8px 0 0; line-height: 1.5; text-align: center;">&#8505;&#65039; Cobran&#231;a feita pela Provou Levou, n&#227;o pela loja</p>
                        <div class="q-pix-qr"><img id="q-pix-qr-img" alt="QR Code PIX"></div>
                        <div class="q-pix-copiacola">
                            <input type="text" id="q-pix-code" readonly placeholder="C&#243;digo PIX...">
                            <button id="q-pix-copy-btn">Copiar</button>
                        </div>
                        <div id="q-pix-status-msg" class="q-pix-status q-pix-waiting">Aguardando pagamento...</div>
                        <p class="q-pix-cancel" id="q-pix-cancel">Cancelar</p>
                    </div>

                    <!-- Loading -->
                    <div id="q-loading-box">
                        <div class="q-loading-texts">
                            <div class="q-loading-t1">Gerando sua prova...</div>
                            <a href="https://provoulevou.com.br?utm_source=widget&utm_medium=lojista&utm_campaign=cacife" target="_blank" class="q-loading-t2">
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
                            <div class="q-fakebuy" id="q-fakebuy"></div>
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
                            <div id="q-related-products" style="display:none" style="display:none;">
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
                        <div style="margin-top:14px;padding-top:12px;border-top:1px solid rgba(0,0,0,.08);"><p style="font-size:12px;color:var(--c-muted);margin:0 0 8px;">Continua com problema? Fale direto com a Provou Levou:</p><a href="https://wa.me/5511938034714?text=Ol%C3%A1!%20Tive%20um%20problema%20ao%20usar%20o%20provador." target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:7px;background:#25D366;color:#fff;border-radius:10px;padding:10px 18px;font-family:inherit;font-weight:700;font-size:13px;text-decoration:none;"><svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.9c0 2.1.55 4.06 1.6 5.8L2 22l4.44-1.65a9.9 9.9 0 0 0 5.6 1.72h.01c5.46 0 9.9-4.45 9.9-9.9C21.95 6.45 17.5 2 12.04 2zm5.8 14.15c-.24.68-1.4 1.3-1.94 1.34-.5.05-1.13.07-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.8-4.17-4.94-4.36-.15-.19-1.18-1.57-1.18-2.99 0-1.42.75-2.12 1.01-2.41.27-.29.58-.36.77-.36l.55.01c.18.01.42-.07.66.5.24.59.83 2.04.9 2.18.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.75 1.24 1.62 2.01 1.11.99 2.05 1.3 2.34 1.44.29.15.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.39-.24.66-.14.27.1 1.7.8 1.99.95.29.15.48.22.55.34.07.12.07.71-.17 1.39z"/></svg> Falar com a Provou Levou</a></div>
                    </div>

                </div>
                <a href="https://provoulevou.com.br?utm_source=widget&utm_medium=lojista&utm_campaign=cacife" target="_blank" class="q-powered-footer">
                    <span>Powered by</span>
                    <img src="https://i.ibb.co/MD3B4FQf/Logo-provou-preto-1.png" class="q-quantic-logo" alt="Provou Levou">
                </a>
            </div>
        </div>
    `;
    while (holder.firstChild) document.body.appendChild(holder.firstChild);

    var $ = function (id) { return document.getElementById(id); };
    var modal   = $('q-modal-ia');
    var card    = modal.querySelector('.q-card-ia');
    var stepFoto= $('q-step-photo');
    var stepLoad= $('q-loading-box');
    var stepRes = $('q-step-result');
    var stepErr = $('q-step-error');
    var stepPix = $('q-step-pix');
    var preImg  = $('q-pre-img');
    var placeholder = $('q-face-placeholder');
    var phone   = $('q-phone');
    var terms   = $('q-accept-terms');
    var btnGen  = $('q-btn-generate');
    var hint    = $('q-validation-hint');

    btnGen.textContent = MOTOR.cta;
    if (stepPix) stepPix.style.display = 'none';
    // A demo nao tem contador de provas por telefone.
    var provasMsg = $('q-provas-restantes');
    if (provasMsg) provasMsg.style.display = 'none';

    var fotoB64 = null, produtoB64 = null;

    function mostra(qual) {
        [stepFoto, stepLoad, stepRes, stepErr].forEach(function (el) { if (el) el.style.display = 'none'; });
        if (qual) qual.style.display = (qual === stepLoad) ? 'flex' : 'block';
        card.classList.toggle('is-result', qual === stepRes);
    }

    function abre() {
        // Os icones (moldura de rosto, camera, galeria) sao Phosphor: sem isto
        // a moldura aparece vazia. O widget das lojas carrega do mesmo jeito.
        if (!window.phosphorIconsLoaded) {
            var ph = document.createElement('script');
            ph.src = 'https://unpkg.com/@phosphor-icons/web';
            document.head.appendChild(ph);
            window.phosphorIconsLoaded = true;
        }
        // 'flex' (nao 'block'): o CSS centraliza com align/justify-content,
        // que so valem em flex. Com block o modal abria colado no topo.
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        if (!stepRes || stepRes.style.display !== 'block') mostra(stepFoto);
    }
    function fecha() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
    $('q-close-btn').addEventListener('click', fecha);
    if ($('q-error-back')) $('q-error-back').addEventListener('click', function () { mostra(stepFoto); });
    if ($('q-btn-buy-now')) $('q-btn-buy-now').addEventListener('click', fecha);

    /* ─── Telefone ────────────────────────────────────────────────────── */
    phone.addEventListener('input', function () {
        var n = phone.value.replace(/\D/g, '').slice(0, 11);
        var x = n.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
        phone.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
        revalida();
    });
    function telOk() { return phone.value.replace(/\D/g, '').length >= 10; }

    function revalida() {
        btnGen.disabled = !(fotoB64 && terms.checked && telOk());
    }
    terms.addEventListener('change', revalida);
    revalida();

    /* ─── Foto ────────────────────────────────────────────────────────── */
    // Comprime: com a imagem original do celular o webhook devolve 502.
    function comprime(blob, max, q) {
        return new Promise(function (res, rej) {
            var fr = new FileReader();
            fr.onload = function () {
                var im = new Image();
                im.onload = function () {
                    var w = im.width, h = im.height;
                    if (w > max || h > max) {
                        if (w >= h) { h = Math.round(h * max / w); w = max; }
                        else { w = Math.round(w * max / h); h = max; }
                    }
                    var c = document.createElement('canvas');
                    c.width = w; c.height = h;
                    c.getContext('2d').drawImage(im, 0, 0, w, h);
                    res(c.toDataURL('image/jpeg', q));
                };
                im.onerror = function () { rej(new Error('imagem invalida')); };
                im.src = fr.result;
            };
            fr.onerror = function () { rej(new Error('falha ao ler')); };
            fr.readAsDataURL(blob);
        });
    }

    function usaArquivo(file) {
        if (!file || file.type.indexOf('image/') !== 0) return;
        comprime(file, 900, 0.82).then(function (b64) {
            fotoB64 = b64;
            preImg.src = b64;
            preImg.style.display = 'block';
            if (placeholder) placeholder.style.display = 'none';
            hint.classList.remove('is-visible');
            revalida();
        }).catch(function () {
            hint.textContent = 'Não consegui ler essa imagem. Tente outra.';
            hint.classList.add('is-visible');
        });
    }

    [['q-btn-camera', 'q-camera-input'], ['q-btn-gallery', 'q-gallery-input']].forEach(function (par) {
        var b = $(par[0]), i = $(par[1]);
        if (!b || !i) return;
        b.addEventListener('click', function () { i.click(); });
        i.addEventListener('change', function () { if (i.files && i.files[0]) usaArquivo(i.files[0]); });
    });

    // A propria moldura (com o icone de pessoa) e clicavel, como nas lojas.
    if ($('q-face-frame')) {
        $('q-face-frame').addEventListener('click', function () { $('q-gallery-input').click(); });
    }

    // Foto do PRODUTO: vem da pagina, como nas lojas reais.
    // O cache e por URL: a loja demo troca de modelo na mesma pagina, entao
    // guardar so o base64 faria a prova sair sempre com o primeiro produto.
    var produtoUrlCache = null;
    function carregaProduto() {
        var url = (window.PL_DEMO && window.PL_DEMO.imagem) ||
                  (document.querySelector('meta[property="og:image"]') || {}).content;
        if (!url) return Promise.reject(new Error('sem imagem de produto'));
        if (produtoB64 && produtoUrlCache === url) return Promise.resolve(produtoB64);
        // Ja e data URI (catalogo embutido): nao precisa de rede. Isso e o que
        // faz a demo funcionar tambem quando a pasta e aberta por file://,
        // onde o navegador bloqueia fetch() de imagem.
        if (url.indexOf('data:') === 0) {
            produtoB64 = url; produtoUrlCache = url;
            return Promise.resolve(url);
        }
        return fetch(url).then(function (r) { return r.blob(); })
            .then(function (b) { return comprime(b, 900, 0.82); })
            .then(function (b64) { produtoB64 = b64; produtoUrlCache = url; return b64; });
    }

    /* ─── Geracao ─────────────────────────────────────────────────────── */
    function comTimeout(p, ms) {
        return Promise.race([p, new Promise(function (_, rej) {
            setTimeout(function () { rej(new Error('timeout')); }, ms);
        })]);
    }

    // Espelha o populateBuyCta() do widget das lojas. Os blocos de preco,
    // selos e "Comprar Agora" nascem com display:none no HTML -- quem revela
    // e o JS. Sem isto o resultado saia so com a foto.
    function preencheResultado() {
        var nome  = document.querySelector('.titulo');
        var preco = document.querySelector('.preco');
        var parc  = document.querySelector('.parcela');

        var nomeTxt  = nome ? nome.textContent.trim() : '';
        var precoTxt = preco ? preco.childNodes[0].textContent.trim() : '';

        if ($('q-result-prodname'))  $('q-result-prodname').textContent = nomeTxt;
        if ($('q-result-prodprice')) $('q-result-prodprice').textContent = precoTxt;

        var inst = $('q-result-installment');
        if (inst) {
            inst.textContent = parc ? parc.textContent.trim() : '';
            inst.style.display = parc ? 'block' : 'none';
        }

        var info = $('q-result-prodinfo');
        if (info && (nomeTxt || precoTxt)) info.style.display = 'block';

        // Escassez: numero estavel por produto (o da frota decai ao longo do dia).
        var sc = $('q-scarcity'), scn = $('q-scarcity-n');
        if (sc && scn && nomeTxt) {
            var h = 0;
            for (var i = 0; i < nomeTxt.length; i++) h = (h * 31 + nomeTxt.charCodeAt(i)) % 997;
            scn.textContent = 8 + (h % 6);
            sc.style.display = 'flex';
        }

        if ($('q-seals')) $('q-seals').style.display = 'flex';
        var btn = $('q-btn-buy-now');
        if (btn) {
            btn.style.display = 'flex';
            btn.textContent = 'Comprar Agora';
        }
    }

    /* ─── Barra de progresso ──────────────────────────────────────────
       A barra existe no HTML mas quem a move e o JS; a demo nunca chamava
       nada, entao ela ficava parada em zero. Avanca desacelerando ate 92%
       (nao da pra saber o tempo real do gerador) e so fecha em 100% quando
       a imagem chega. O ritmo muda por motor: roupa ~15s, oculos ~30-130s. */
    var _progTimer = null;
    function barra() {
        return stepLoad ? stepLoad.querySelector('.q-loading-bar > div') : null;
    }
    function progressoInicia() {
        progressoPara();
        var b = barra();
        if (!b) return;
        b.style.transition = 'none';
        b.style.transform = 'scaleX(0)';
        void b.offsetWidth;
        b.style.transition = 'transform 0.3s ease-out';
        var pct = 0;
        var passo = TIPO === 'roupa' ? 0.055 : 0.012;
        _progTimer = setInterval(function () {
            if (!stepLoad || stepLoad.style.display === 'none') { progressoPara(); return; }
            pct += Math.max((92 - pct) * passo, 0.12);
            if (pct > 92) pct = 92;
            b.style.transform = 'scaleX(' + (pct / 100) + ')';
        }, 200);
    }
    function progressoPara() {
        if (_progTimer) { clearInterval(_progTimer); _progTimer = null; }
    }
    function progressoCompleta() {
        progressoPara();
        var b = barra();
        if (b) b.style.transform = 'scaleX(1)';
    }

    btnGen.addEventListener('click', function () {
        if (btnGen.disabled || btnGen.dataset.busy) return;
        btnGen.dataset.busy = '1';
        mostra(stepLoad);
        progressoInicia();

        carregaProduto().then(function (prod) {
            return comTimeout(fetch(MOTOR.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ produto: prod, modelo: fotoB64, demo: 'loja-demo' })
                //           ^ marca a loja-demo: o motor da a ela um limite
                //           proprio (100) em vez dos 5 testes do site.
            }), MOTOR.espera);
        }).then(function (resp) {
            var ct = resp.headers.get('content-type') || '';
            if (ct.indexOf('image/') !== -1 || ct === 'application/octet-stream') {
                return resp.blob().then(function (b) { return URL.createObjectURL(b); });
            }
            if (ct.indexOf('application/json') !== -1) {
                return resp.json().then(function (d) {
                    // 429 + {error:'limite_atingido'} quando o visitante esgota
                    // os testes gratis: mostrar a mensagem real, nao um generico.
                    if (d && d.error) {
                        var err = new Error('negado');
                        err.aviso = d.mensagem || 'Limite de testes atingido.';
                        throw err;
                    }
                    return d.url || d.image_url || d.imagem || d.image || d.resultado || d.result || '';
                });
            }
            return resp.text();
        }).then(function (url) {
            if (!url || !/^(https?:|data:image|blob:)/.test(url)) throw new Error('resposta inesperada');
            progressoCompleta();
            $('q-final-view-img').src = url;
            preencheResultado();
            mostra(stepRes);
        }).catch(function (e) {
            progressoPara();
            try { console.error('[provador demo] falhou:', e); } catch (_) {}
            mostra(stepErr);
            var h2 = stepErr.querySelector('h2'), p = stepErr.querySelector('p');
            if (e && e.aviso) {
                if (h2) h2.textContent = 'LIMITE ATINGIDO';
                if (p) p.textContent = e.aviso;
            } else {
                if (h2) h2.textContent = 'ALTA DEMANDA';
                if (p) p.textContent = 'Aguarde alguns segundos para tentar novamente.';
            }
            // Sem isto, qualquer falha virava "ALTA DEMANDA" e nao dava pra
            // saber o motivo sem abrir o console.
            var det = document.getElementById('q-erro-detalhe');
            if (!det && p) {
                det = document.createElement('p');
                det.id = 'q-erro-detalhe';
                det.style.cssText = 'font-size:11px;color:var(--c-muted);margin-top:6px;';
                p.parentNode.insertBefore(det, p.nextSibling);
            }
            if (det) det.textContent = e && !e.aviso ? ('Detalhe: ' + (e.message || e)) : '';
        }).then(function () {
            delete btnGen.dataset.busy;
            revalida();
        });
    });

    /* ─── Gatilhos na pagina ──────────────────────────────────────────── */
    // Selo: mesmo PNG e mesmo estilo (.q-btn-trigger-ia) das lojas.
    function montaGatilhos() {
        var galeria = document.querySelector('[data-pl-galeria] .galeria-principal') ||
                      document.querySelector('[data-pl-galeria]');
        if (galeria && !galeria.querySelector('.q-btn-trigger-ia')) {
            var selo = document.createElement('button');
            selo.className = 'q-btn-trigger-ia';
            selo.id = 'q-open-ia';
            selo.type = 'button';
            selo.setAttribute('aria-label', 'Abrir Provador Virtual');
            var si = document.createElement('img');
            si.src = SELO_PNG;
            si.alt = 'Provador Virtual';
            si.style.cssText = 'width:100%;height:100%;object-fit:contain;';
            selo.appendChild(si);
            selo.addEventListener('click', abre);
            if (getComputedStyle(galeria).position === 'static') galeria.style.position = 'relative';
            galeria.appendChild(selo);
        }

        var comprar = document.querySelector('[data-pl-comprar]');
        if (comprar && !document.querySelector('.q-btn-inline-provador')) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'q-btn-inline-provador';
            var bs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            bs.setAttribute('viewBox', '0 0 24 24');
            bs.setAttribute('width', '16'); bs.setAttribute('height', '16');
            bs.setAttribute('fill', 'none'); bs.setAttribute('stroke', 'currentColor');
            bs.setAttribute('stroke-width', '1.6');
            var pth = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            pth.setAttribute('d', 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z');
            var cir = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            cir.setAttribute('cx', '12'); cir.setAttribute('cy', '12'); cir.setAttribute('r', '3');
            bs.appendChild(pth); bs.appendChild(cir);
            b.appendChild(bs);
            b.appendChild(document.createTextNode(' Provador Virtual'));
            b.style.marginBottom = '10px';
            b.addEventListener('click', abre);
            comprar.parentNode.insertBefore(b, comprar);
        }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montaGatilhos);
    else montaGatilhos();

    window.PL_DEMO_ABRIR = abre;
})();
