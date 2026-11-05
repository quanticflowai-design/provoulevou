(function () {



    // ─── FORA DO PROVADOR: calcados e bolsas (a Luzzi vende roupa, calcado e bolsa) ───
    var PL_RE_BLOQ = /(bota|botina|coturno|sapatilha|sapato|scarpin|mocassim|mocassin|sand[aá]lia|sand|papete|rasteir\w*|flat|t[eê]nis|chinelo|tamanco|mule|slide|anabela|peep\s?toe|salto|bolsa|clutch|mochila|carteira|necess[aá]ire)/i;

    // ─── FOTO DA VARIANTE SELECIONADA (Nuvemshop) ──────────────────────────────
    // Trocar a cor NAO muda a imagem principal nem a og:image neste tema, entao o
    // gerador recebia sempre a 1a variante. O elo correto e:
    //   input[name=variant_id] -> LS.variants[].image (id) -> .js-product-slide[data-image=<id>]
    function plVariantImage() {
        try {
            var vid = (document.querySelector('input[name="variant_id"], #variant_id') || {}).value;
            var vs = window.LS && window.LS.variants;
            if (!vid || !vs) return '';
            var arr = Array.isArray(vs) ? vs : Object.keys(vs).map(function (k) { return vs[k]; });
            var v = null;
            for (var i = 0; i < arr.length; i++) { if (String(arr[i].id) === String(vid)) { v = arr[i]; break; } }
            if (!v || !v.image) return '';
            var slide = document.querySelector('.js-product-slide[data-image="' + v.image + '"]');
            if (!slide) return '';
            var img = slide.querySelector('img');
            var src = img && (img.getAttribute('src') || img.getAttribute('data-src') || '');
            if (!src || src.indexOf('data:') === 0) {
                var a = slide.querySelector('a.js-product-slide-link');
                src = (a && a.getAttribute('href')) || '';
            }
            if (src && src.indexOf('//') === 0) src = 'https:' + src;
            return src || '';
        } catch (e) { return ''; }
    }

    function plProdutoBloqueado() {
        try {
            if (document.querySelector('[data-pl-nunca]')) return true;
            var bc = document.querySelector('.breadcrumbs');
            if (bc && /calçados|calcados|bolsas/i.test(bc.textContent || '')) return true;
            var nm = (document.querySelector('[class*="productNameContainer"] h1, h1') || {}).textContent || document.title || '';
            if (PL_RE_BLOQ.test(nm)) return true;
        } catch (e) {}
        return false;
    }
    /* Laço de Luxo: loja so de roupa, sem bloqueio por categoria */

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
        // so 1-2 digitos distintos = fake (99996666, 54545454, 56565656)
        if (new Set(local).size <= 2) { setErr('N\u00famero n\u00e3o parece real — confira'); return false; }
        if (/^(?:01234567|12345678|23456789|34567890|98765432|87654321|76543210|0123456789|1234567890)/.test(local)) { setErr('N\u00famero n\u00e3o parece real — confira'); return false; }
        return true;
    }


    // ─── SEO BACKLINK BADGE (mini logo discreto pro crawler do Google) ───
    (function() {
        function injectPLBadge() {
            try {
                if (document.querySelector('.pl-seo-badge')) return;
                var path = window.location.pathname;
                var isProduct = /\/p($|\?)/.test(location.pathname + location.search) || path.includes('/produto/') || path.includes('/produtos/') || path.includes('/products/') || path.includes('/p/') || document.querySelector('meta[property="og:type"][content="product"]');
                if (!isProduct) return;
                var b = document.createElement('div');
                b.className = 'pl-seo-badge';
                b.style.cssText = 'text-align:center;padding:4px 0;margin:0;opacity:0.5;line-height:1;';
                var a = document.createElement('a');
                a.href = 'https://provoulevou.com.br?utm_source=widget&utm_medium=lojista&utm_campaign=beachnetty';
                a.target = '_blank';
                a.rel = 'noopener';
                a.title = 'Provador Virtual de Roupas por Provou Levou';
                a.style.cssText = 'display:inline-block;text-decoration:none;border:0;outline:0;';
                var img = document.createElement('img');
                img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOUAAAAoCAMAAAA2Yc1OAAAAYFBMVEUAAAB2Muz18f18DvaRWfFsZ/wAAP8AAAAAAAAAAAB8Oe17Ou3/AP+pVP+0jvTJr/dVVaqHO/t/AH+AO/R/P7+AO/SAO/QAAAB7Oe0AAACDPfp9O/V7Oe17OOwAAAB7OezQS/HyAAAAIHRSTlNg6f8E/gMBry/Sr08BA//+AyMCawTFlQD8+/4Kki6QcnVUoNsAAAaeSURBVHja3ZoJc9sqEIBFEKADOc7RhyyE9P//ZXeX21frmcZvEqbjRIBcPu29SmPSEPZoqiGsMD9jNAlJwoe2gochLKfpn0QpgcZ9DGwuBhtWZwzXTz6RlF9FCWIbf83LspSUcLn8Gn+EOBuvlnyoCTPpwM3xmQeyML6EkhvLrjISJ3NPlKY1+7Ksxv57Sq7vQALmbCX//pTCDHcgUZr2KL875QRfXGMx+ldg7rDpe1NKac9k176+vBzqKWv0/0Ap0BN5nwDxO59AQ1CnmDPZz8laHmfzFi5qG2usGWtRti84Xs+EaZ9OGV2evOX70rz4owiac6tkry8tm+GjskxDz6aBYUy39X2vms4UU41S6K27TdFaXgmjgwu8oaF7ty5NlhsqSkxT9nXdITE5Gu3cmzUyZA32zTkJs3xch2H9wNQF1uxb2sKdc6K2yzOFZS8vDAV6YJcqu51OPX74QSdUaaqhi7x2wpU4cKUzTR/XFSHTpB/4FSWlCGnKMrPRfGoI5yxYzQRiWQZw+yNbaMwrN9yaNSqBJCRneEnpzs0SpMhaFGgxHKUGcBSVIE+nzR9fNQGsP5VrW8GAyMo0xToulZRNTYkukVIx/FyNRAfpz00MyyiBal58pMOQzv9EeSWMgG3WwWQkL+sJ+6YDDc3iQ7heqa6Pa0G04TlEho4gFW6gx3FPlgL9/jKMzo1gT+1OZN45WIl+xIYN1rqdYp19mBJMszLLmnLLBz8FJe2j/qlyTfmDJ71OWu6/SN2h5KBg8IPGSmIklX03ProjTt4AAPjro5QoSXaLMtlaQ4dWaeqUofxak6i6eBllS8p9hxKPPJjJCixxGUCQAPHgOiAAOzsKqzX38f5BWTIfSWqzLCiz3yR5qDjVVGt9EJ7KRleItngMN7wP/JfujWO8tHxHMXLmVRYVdmHCshTeNCdDfYSSUUrQHiBglpwFpan8Zj57eeSwM23vETcrdHhE221KlFyOoXMQFcYzUtidXKYL6XXQ4QcoD16MHpbdp4wkfXnM0t10QbzduTMK4LcpUQf3NOjMxAWn8MzwGFiMjlaSfv8tJSlrm34/QExh55T9LUp1SellGKPEI5RriCEhIOKZJUMZWogpQGTGHD+NNQ9Qevllt8MO2Tz/gvKKLONcj3zdo5RzHa8N4VnUzpEuWMS4pOS3KNl8bovA/BqnrmpsH+wyU9Z22QVV7fzKI3aJRmjLIaJvtVjvci/LUA5OZ3apS1lyO8lM2QbBtW2KJq9RvLd9bJ8pr/hYnxlFcd/3sercLtlFbo5uR4akwWcGAVOQw11zmu8Spa9dAmUqtlpvmGih5HyCqd6Kl1umNJdrwSJ7j189BhXjZZMfWUFJxxSThjFN7r919zkP6CV0NRwGFAw1nKpe8e5CBF1WTdmRTvkgiPVjhKdBlG1W1gNCJci5pZmbuU9XUG55rTtFKeFclOEpi87nSV1WYnW6iJcrtoglF2Zt28F8SlJWB9mcfAdxMUTGkgsKM8wQuDdOaCRPFh8FUYJUF9R9jZTgZ1LUQJ+D4bJloWfAGHKXeSzWE10EzpRkp4rKsPwwwh35uWDR1akA3FeJbZn7eGnQ8FnP0XwSjU8GPnEWvRBleJTjFrfsS9BYzpEX0mCsSSBvhajhR8h9WhYnUJnxHhE1NpcVylSUXVlyqHKuyF7L2qwsUs5yH+q3jVZzt3qxkrktvgh8RzXFqngHBbUjZevCV5Ahv/eUPqTg7VBfstAeCD0C5m0zT+FVUV+qsvCqfEqnqqIsCbhKb/3ou3qiqSsvbhzDwooxLKwGTt01LXBuoOft+45xAyKhZs9Ui4GTGpagsQPMtSN2RLC2ObzCOOCIGfvBixd/xK8O7r5R6EE3L6Bm24ooSEuwlkMKrjflBirTmuoG3N/574my5NQHT0WyjN0SrCwn/zYgbVgGi80CoddwvXsfxelZgCg1byZSfJZGSgqKGbCAz8vI/yUvSWJjAxykWwfGBmx4yLgGnY7YTUwb6GWOX3cfK3RIQKVhX8wJ3ixlBVywu+1YVPvwSujrKfPQvHobd2+Dfvc/j+dtL0N2JpBSXO0WXKm7nkOZG45HK+T7ZItETQpRNq1wgzwWb12hVIPOpcZOZdpHTc0GM6T1fm99jU3nZ8ryX79BkJO89woBXFzUme9MCRoubksTIKU2P4DSaG32+cb7y93ktwdVI/n7vXGHZNCuRd2a6teVUogf89cTE+ZKO3Tk81j38c087W3Xc/5GRF9932P5T4A0vwEkzAGPQIFmHAAAAABJRU5ErkJggg==';
                img.alt = 'Provador Virtual de Roupas por Provou Levou';
                img.style.cssText = 'height:12px;width:auto;border:0;display:block;';
                a.appendChild(img);
                b.appendChild(a);
                document.body.appendChild(b);
            } catch(e) {}
        }
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectPLBadge);
        else injectPLBadge();
        setTimeout(injectPLBadge, 2500);
    })();


    // ===============================================
    // 0. CHUMBAR A API KEY AQUI DIRETO NO CÓDIGO
    // ===============================================
    const apiKey = "pl_live_0ce136ecc94510cf3b5cac11ed11864000de87731a6e6a3a71c1d1a51d77af86";
    window.PROVOU_LEVOU_API_KEY = apiKey;

    const WEBHOOK_PROVA = 'https://n8n.segredosdodrop.com/webhook/quantic-materialize';
    const WEBHOOK_PIX = 'https://n8n.segredosdodrop.com/webhook/cacife-pix';
    const WEBHOOK_PIX_STATUS = 'https://n8n.segredosdodrop.com/webhook/cacife-pix-status';
    const WEBHOOK_CHECK_LIMIT = 'https://n8n.segredosdodrop.com/webhook/beachnetty-check-limit';
    const SIZES_TOP = ['XXP', 'XP', 'P', 'M', 'G', 'XG', 'XXG', '3XG', '4XG', '5XG'];
    const SIZES_BOTTOM = ['36/XXP', '38/XP', '40/P', '42/M', '44/G', '46/XG', '48/XXG', '50/3XG', '52/4XG', '54/5XG'];
    const SIZES_BOTTOM_SW = ['XXP', 'XP', 'P', 'M', 'G', 'XG', 'XXG', '3XG', '4XG', '5XG'];


    const GRADE = {
        regular: [49, 51, 54, 57, 61, 62, 64, 66, 70, 73],
        oversized: [58, 60, 62, 64, 66, 70, 73, 76, 79, 83],
        oversizedSS: [58, 61, 63, 67, 70, 74, 78, 82, 87, 92],
        hoodie: [50, 53, 55, 58, 62, 65, 69, 74, 79, 83],
        boxyHoodie: [61, 77, 78, 79, 80, 81, 82, 83, 84, 85],
        puffer: [53, 56, 59, 61, 70, 74, 78, 82, 86, 90],
        vest: [52, 55, 57, 59, 63, 66, 70, 72, 76, 82],
        boxyHenley: [54, 56, 58, 64, 66, 68, 70, 76, 78, 84],
        bottomTailoring: [36, 38, 40, 42, 44, 46, 48, 50, 52, 54],
        bottomSweat: [36, 38, 40, 42, 44, 46, 48, 50, 52, 54],
        underwear: [36, 38, 40, 42, 44, 46, 48, 50, 52, 54],
        quadrilTailoring: [48, 50, 52, 56, 58, 60, 62, 64, 66, 68],
        quadrilSweat: [48, 50, 52, 54, 56, 58, 60, 62, 64, 66],
        quadrilUnderwear: [50, 52, 54, 56, 58, 60, 62, 64, 66, 68],
    };


    function detectProduct(name) {
        const n = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (/tailoring/.test(n) || /\d\/\d\s*short/.test(n) || /\b(1\/5|2\/5|3\/5|4\/5)\b/.test(n)) return { category: 'bottom', fit: 'tailoring' };
        if (/underwear|cueca/.test(n)) return { category: 'bottom', fit: 'underwear' };
        if (/sweatpant|sweatshort|sweat pant|sweat short|calca|bermuda/.test(n)) return { category: 'bottom', fit: 'sweat' };
        if (/henley/.test(n)) return { category: 'top', fit: 'boxyHenley' };
        if (/boxy.*(hoodie|crewneck|crew)/.test(n) || /(hoodie|crewneck|crew).*boxy/.test(n)) return { category: 'top', fit: 'boxyHoodie' };
        if (/puffer|jacket/.test(n)) return { category: 'top', fit: 'puffer' };
        if (/vest/.test(n)) return { category: 'top', fit: 'vest' };
        if (/(hoodie|hoodie zip|half zip|crewneck|crew neck)/.test(n) && !/oversized|boxy|short sleeve/.test(n)) return { category: 'top', fit: 'hoodie' };
        if (/oversized.*(hoodie|crewneck|crew|short sleeve)/.test(n) || /short sleeve.*(hoodie|crewneck)/.test(n)) return { category: 'top', fit: 'oversizedSS' };
        if (/oversized|boxy tee|2\/4/.test(n)) return { category: 'top', fit: 'oversized' };
        return { category: 'top', fit: 'regular' };
    }


    function estimarTorax(altura, peso) {
        if (altura < 3) altura *= 100;
        let circ = 0.65 * peso + 56;
        const imc = peso / Math.pow(altura / 100, 2);
        if (imc > 30) circ += 4; else if (imc > 25) circ += 2;
        return circ;
    }


    function findClosest(arr, val) {
        let idx = 0, minDiff = Infinity;
        arr.forEach((v, i) => { const d = Math.abs(v - val); if (d < minDiff) { minDiff = d; idx = i; } });
        return idx;
    }


    let recommendedSize = 'M';
    let currentProduct = { category: 'top', fit: 'regular' };

    function calculateFinalSize() {
        // Feature desativada: não faz mais cálculos de tamanho
        return;
    }


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
/* PL: borda arredondada do modal */@media(min-width:768px){.q-card-ia,.q-card,#q-card-ia,#q-card,.q-modal-card{border-radius:16px !important;overflow:hidden;}}
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
            position: absolute; top: 40px; right: 14px; z-index: 100;
            background: none; border: none; padding: 0; cursor: pointer;
            width: 70px; height: 70px;
            display: flex; align-items: center; justify-content: center;
            filter: drop-shadow(0 3px 10px rgba(0,0,0,0.22));
            animation: q-shake 3s infinite;
            transition: filter 0.2s;
        }
        .q-btn-trigger-ia:hover { filter: drop-shadow(0 6px 18px rgba(0,0,0,0.32)); }
        .q-btn-trigger-ia img { width: 100%; height: 100%; object-fit: contain; }
        @media (min-width: 768px) { .q-btn-trigger-ia { width: 70px; height: 70px; } }

        /* ── Inline button ── */
        /* Espelha o botao COMPRAR do tema (button#button-buy): pill 50px, Lato 17/700
           uppercase, altura 50px, #2C3E50 — mas SEM fundo (outline), pra ficar
           secundario em relacao ao comprar. */
        .q-btn-inline-provador {
            display: flex; align-items: center; justify-content: center; gap: 9px;
            width: 100%; height: 56px; padding: 0 16px;
            background: transparent; color: #000;
            border: 1px solid #000; border-radius: 0; /* retangular e da altura do COMPRAR */
            font-size: 17px; font-weight: 400; letter-spacing: normal; text-transform: none;
            cursor: pointer; transition: background 0.25s, color 0.25s;
            margin-bottom: 0; box-sizing: border-box;
        }
        .q-btn-inline-provador:hover { background: #000; color: #fff; }
        .q-btn-inline-provador svg { width: 18px; height: 18px; flex-shrink: 0; }

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

        /* ── Orientações da foto ──
           Bloco legível (o cliente PRECISA ver): título curto + 3 regras com
           ícone. A confirmação de que seguiu acontece ao clicar em "Provar". */
        .q-guide {
            background: var(--c-surface);
            border: 1px solid var(--c-line);
            border-radius: 10px;
            padding: 12px 14px;
            margin: 0 0 16px;
        }
        .q-guide-title {
            font-size: 11px; font-weight: 700; letter-spacing: .8px;
            text-transform: uppercase; color: var(--c-ink);
            margin-bottom: 10px; text-align: center;
        }
        .q-guide-row {
            display: flex; align-items: flex-start; justify-content: space-between;
            gap: 8px;
        }
        .q-guide-row > span {
            flex: 1; min-width: 0;
            display: flex; flex-direction: column; align-items: center;
            text-align: center; gap: 5px;
            font-size: 12.5px; font-weight: 600; color: var(--c-ink);
            line-height: 1.25;
        }
        .q-guide-row > span i {
            font-size: 21px; color: var(--c-ink); opacity: .9; line-height: 1;
        }
        .q-guide-row > span small {
            display: block; font-size: 10.5px; font-weight: 400;
            color: var(--c-muted); line-height: 1.3;
        }
        .q-guide-ic { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; margin: 0 auto 7px; border-radius: 50%; background: #fff; border: 1px solid var(--c-line, #e6e1d9); color: var(--c-ink, #111); font-style: normal; }
        .q-guide-ic svg { width: 20px; height: 20px; display: block; }

        /* ── Diálogo de confirmação (ao clicar em Provar) ── */
        .q-gconf {
            position: absolute; inset: 0; z-index: 20;
            display: none; align-items: center; justify-content: center;
            padding: 22px;
            background: rgba(255,255,255,.82);
            backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
        }
        .q-gconf.is-open { display: flex; }
        .q-gconf-box {
            width: 100%; max-width: 320px;
            background: #fff;
            border: 1px solid var(--c-line);
            border-radius: 14px;
            padding: 22px 20px 18px;
            box-shadow: 0 18px 44px rgba(0,0,0,.16);
            text-align: center;
        }
        .q-gconf-title {
            font-family: var(--font-display); font-size: 17px; font-weight: 700;
            color: var(--c-ink); letter-spacing: .3px; margin-bottom: 6px;
            text-transform: uppercase;
        }
        .q-gconf-sub {
            font-size: 12.5px; color: var(--c-muted); line-height: 1.45;
            margin-bottom: 16px;
        }
        .q-gconf-list {
            display: flex; flex-direction: column; gap: 9px;
            text-align: left; margin-bottom: 18px;
        }
        .q-gconf-list div {
            display: flex; align-items: center; gap: 9px;
            font-size: 13px; color: var(--c-ink);
        }
        .q-gconf-list i { font-size: 17px; flex-shrink: 0; opacity: .8; }
        .q-gconf-actions { display: flex; flex-direction: column; gap: 8px; }
        .q-gconf-yes {
            width: 100%; height: 46px; border: none; border-radius: 12px;
            background: var(--c-ink); color: #fff; cursor: pointer;
            font-family: var(--font-display); font-size: 13px; letter-spacing: 1.4px;
            text-transform: uppercase; transition: opacity .2s;
        }
        .q-gconf-yes:hover { opacity: .88; }
        .q-gconf-no {
            width: 100%; height: 40px; border: none; background: none;
            color: var(--c-muted); cursor: pointer;
            font-size: 12.5px; text-decoration: underline; text-underline-offset: 2px;
        }

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
            font-family: var(--font-display); font-size: 14px;
            letter-spacing: 3px; text-transform: uppercase;
            cursor: pointer; transition: opacity 0.2s; box-sizing: border-box;
        }
        .q-btn-black:hover:not(:disabled) { opacity: 0.82; }
        .q-btn-black:disabled { background: #ccc; cursor: not-allowed; }

        /* ── Paleta Luzzi ─────────────────────────────────────────────── */
        #q-modal-ia .q-btn-black { background: #111111 !important; color: #fff !important; }
        #q-modal-ia .q-btn-black:hover:not(:disabled) { background: #000000 !important; opacity: 1 !important; }
        #q-modal-ia .q-btn-outline { border-color: #111111 !important; color: #111111 !important; }
        #q-modal-ia .q-btn-outline:hover,
        #q-modal-ia .q-upload-btn:hover { border-color: #111111 !important; background: #f5f5f5 !important; color: #111111 !important; }
        #q-modal-ia .q-section-label, #q-modal-ia .q-tip-box i { color: #111111 !important; }
        #q-modal-ia .q-tip-box { background: #f5f5f5 !important; }

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
        .q-result-oldprice { text-decoration: line-through; opacity: .55; font-weight: 400; font-size: .8em; }
        .q-result-pixtxt { font-size: .62em; font-weight: 600; color: #1a7f37; white-space: nowrap; }
        .q-result-prodprice {
            font-family: var(--font-display); font-size: 28px; letter-spacing: .5px; font-weight: 700;
            color: var(--c-ink); line-height: 1;
        }
        .q-result-installment {
            font-family: var(--font-body); font-size: 12px; color: var(--c-muted);
            margin-top: 4px; letter-spacing: .2px;
        }
        .q-scarcity { display: none !important; /* escassez removida 30/09 (Lucas) */
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

        /* ─── ALINHAMENTO TIPOGRAFICO COM A LOJA ────────────────────────────
           A familia ja era herdada (Gotham), mas o PESO e o TRACKING vinham do
           template de oculos: titulo 400/4px e botao 400/3px contra 700/normal
           do site. Isso lia como "outra fonte". Aqui reaproximamos do site.    */
        #q-modal-ia h1, #q-modal-ia h2, #q-modal-ia h3 {
            font-weight: 700; letter-spacing: .5px;
        }
        #q-modal-ia .q-btn-black {
            font-weight: 700; letter-spacing: .5px;
        }
        /* 'Work Sans' era resto do template de oculos: na maquina de quem tem a
           fonte instalada o botao renderizava numa familia diferente do site. */
        /* sem negrito (pedido do lojista): o COMPRAR e 700, o provador fica 400
           pra ficar visivelmente secundario. */
        .q-btn-inline-provador {
            font-family: inherit;
            font-weight: 400; letter-spacing: normal; font-size: 17px;
        }
    `;


    // ─── IMAGEM DO BOTÃO (trigger) ─────────────────────────────────────────────
    const stampImageHTML = `<img src="https://cdn.shopify.com/s/files/1/0636/6334/1746/files/logo_provador.png?v=1772494793" alt="Provador Virtual" style="width:100%;height:100%;object-fit:contain;">`;



    const PL_ED_CSS = "\n#q-modal-ia.pl-ed{background:rgba(17,17,17,.55)!important;font-family:'Inter Tight',sans-serif}\n#q-modal-ia.pl-ed *{font-family:'Inter Tight',sans-serif}\n#q-modal-ia.pl-ed .q-card-ia{border-radius:4px!important;box-shadow:0 30px 80px rgba(0,0,0,.25)!important}\n@media(min-width:768px){#q-modal-ia.pl-ed .q-card-ia:not(.is-result){width:480px!important}}\n#q-modal-ia.pl-ed .q-close-ia{top:11px!important;right:14px!important;color:#111!important;font-size:24px!important}\n#q-modal-ia.pl-ed #q-header-provador{display:flex!important;flex-direction:row!important;justify-content:flex-start!important;align-items:center!important;gap:14px!important;padding:17px 56px 15px 24px!important;border-bottom:1px solid #111!important;background:#fff!important}\n#q-modal-ia.pl-ed #q-header-provador h1{display:none!important}\n#q-modal-ia.pl-ed #q-header-provador img{height:20px!important;width:auto!important}\n#q-modal-ia.pl-ed .ed-tag{font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:#111}\n#q-modal-ia.pl-ed #ed-prod{display:flex;gap:12px;align-items:center;padding:14px 24px;border-bottom:1px solid #e6e6e6}\n#q-modal-ia.pl-ed #ed-prod img{width:44px;height:58px;object-fit:cover;object-position:top;background:#f3f3f3;flex:none}\n#q-modal-ia.pl-ed #ed-prod b{display:block;font-size:13px;font-weight:500;color:#111}\n#q-modal-ia.pl-ed #ed-prod small{font-size:11px;color:#777}\n#q-modal-ia.pl-ed .q-card-ia.is-result #ed-prod{display:none!important}\n#q-modal-ia.pl-ed #q-step-photo{padding:0 24px!important;gap:0!important}\n#q-modal-ia.pl-ed .ed-sec,#q-modal-ia.pl-ed .q-phone-wrap{padding-top:20px;margin:0!important}\n#q-modal-ia.pl-ed .ed-n{font-size:10px;letter-spacing:.2em;color:#999;text-transform:uppercase;text-align:left}\n#q-modal-ia.pl-ed .ed-h{font-size:15px;font-weight:500;letter-spacing:.02em;margin:4px 0 10px;text-transform:uppercase;color:#111;text-align:left}\n#q-modal-ia.pl-ed .q-phone-wrap .q-field-label,#q-modal-ia.pl-ed .q-guide,#q-modal-ia.pl-ed #q-step-photo>.q-section-label,#q-modal-ia.pl-ed #pl-look-row .q-section-label{display:none!important}\n#q-modal-ia.pl-ed #q-phone{height:44px!important;padding:0!important;border:0!important;border-bottom:1px solid #111!important;border-radius:0!important;background:transparent!important;text-align:left!important;font-size:16px!important;box-shadow:none!important}\n#q-modal-ia.pl-ed #q-phone:focus{border-bottom-width:2px!important}\n#q-modal-ia.pl-ed .q-provas-msg{border-radius:0!important;font-size:12px!important;text-align:left!important;background:transparent!important;border:0!important;padding:8px 0 0!important;color:#777!important}\n#q-modal-ia.pl-ed .ed-foto{display:flex;gap:12px;align-items:flex-start}\n#q-modal-ia.pl-ed #q-face-frame{width:96px!important;height:128px!important;margin:0!important;border:1px dashed #111!important;border-radius:0!important;background:#fff!important;flex:none;transform:none!important;aspect-ratio:auto!important}\n#q-modal-ia.pl-ed .q-face-corner{display:none!important}\n#q-modal-ia.pl-ed .q-face-placeholder i{font-size:30px!important;color:#111!important}\n#q-modal-ia.pl-ed .ed-tips{margin:0;padding:2px 0 0;list-style:none;font-size:12px;color:#555;line-height:1.9;flex:1;min-width:130px;text-align:left}\n#q-modal-ia.pl-ed .ed-tips li::before{content:'— ';color:#111}\n#q-modal-ia.pl-ed .q-upload-btns{margin:10px 0 0!important;gap:8px!important}\n#q-modal-ia.pl-ed .q-upload-btn{border:1px solid #111!important;border-radius:0!important;background:#fff!important;color:#111!important;font-size:11px!important;font-weight:500!important;letter-spacing:.14em!important;text-transform:uppercase!important;min-height:42px!important;box-shadow:none!important}\n#q-modal-ia.pl-ed #pl-look-row{margin:0!important;padding-top:20px}\n#q-modal-ia.pl-ed #pl-look-sub{font-size:12px!important;color:#777!important;margin:-4px 0 10px!important;text-align:left!important}\n#q-modal-ia.pl-ed #pl-look-list{gap:8px!important}\n#q-modal-ia.pl-ed .pl-look-card{position:relative;flex:0 0 96px!important;width:96px!important;border:0!important;border-radius:0!important;background:transparent!important;overflow:visible!important}\n#q-modal-ia.pl-ed .pl-look-card img{height:128px!important;outline:1px solid #e6e6e6;outline-offset:-1px;background:#f3f3f3}\n#q-modal-ia.pl-ed .pl-look-card.on img{outline:2px solid #111;outline-offset:-2px}\n#q-modal-ia.pl-ed .pl-look-card::after{content:'';position:absolute;top:6px;right:6px;width:20px;height:20px;border-radius:50%;border:1px solid #111;background:#fff;box-sizing:border-box;display:flex;align-items:center;justify-content:center;font-size:11px;color:#fff}\n#q-modal-ia.pl-ed .pl-look-card.on::after{content:'✓';background:#111}\n#q-modal-ia.pl-ed .pl-look-card span{margin:6px 0 0!important;font-size:11px!important;font-weight:400!important;line-height:1.3!important;color:#111!important}\n#q-modal-ia.pl-ed .q-terms-row{justify-content:flex-start!important;text-align:left!important;font-size:12px!important;margin:18px 0 0!important;color:#555!important}\n#q-modal-ia.pl-ed #q-btn-generate,#q-modal-ia.pl-ed .q-btn-buy-now,#q-modal-ia.pl-ed .q-gconf-yes{background:#111!important;color:#fff!important;border:0!important;border-radius:0!important;font-size:12px!important;font-weight:500!important;letter-spacing:.22em!important;text-transform:uppercase!important;padding:17px!important;min-height:0!important;height:auto!important;box-shadow:none!important}\n#q-modal-ia.pl-ed #q-btn-generate{margin:14px 0 18px!important;width:100%}\n#q-modal-ia.pl-ed .q-gconf-box{border-radius:0!important}\n#q-modal-ia.pl-ed .q-gconf-no{border:1px solid #111!important;border-radius:0!important;background:#fff!important;color:#111!important;font-size:11px!important;letter-spacing:.16em!important;text-transform:uppercase!important}\n#q-modal-ia.pl-ed #q-loading-box{padding:0!important;min-height:0!important;flex-direction:column;align-items:stretch!important;justify-content:flex-start!important;gap:0!important}\n#q-modal-ia.pl-ed .q-loading-texts{display:none!important}\n#q-modal-ia.pl-ed .ed-duo{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:100%;gap:1px;background:#111;height:min(300px,42vh);width:100%;flex:none;overflow:hidden}\n#q-modal-ia.pl-ed .ed-duo.solo{grid-template-columns:1fr}\n#q-modal-ia.pl-ed .ed-duo img{display:block;min-height:0;width:100%;height:100%;object-fit:cover;object-position:top;filter:grayscale(1) contrast(1.05);background:#f3f3f3}\n#q-modal-ia.pl-ed .ed-load-tx{padding:20px 24px 24px;text-align:left;width:100%;box-sizing:border-box}\n#q-modal-ia.pl-ed .ed-load-tx b{display:block;font-size:15px;font-weight:500;text-transform:uppercase;letter-spacing:.04em;color:#111}\n#q-modal-ia.pl-ed .ed-load-tx small{display:block;font-size:12px;color:#777;margin-top:3px}\n#q-modal-ia.pl-ed .q-loading-bar{height:2px!important;background:#eee!important;margin-top:16px!important;border-radius:0!important}\n#q-modal-ia.pl-ed .q-loading-bar>div{background:#111!important}\n#q-modal-ia.pl-ed .q-res-title{font-size:18px!important;font-weight:400!important;letter-spacing:.14em!important;text-transform:uppercase!important;color:#111!important}\n#q-modal-ia.pl-ed #q-result-img-col{background:#f3f3f3!important;border-radius:0!important}\n#q-modal-ia.pl-ed #q-result-img-col img{border-radius:0!important}\n#q-modal-ia.pl-ed .q-seals,#q-modal-ia.pl-ed .q-scarcity{display:none!important}\n#q-modal-ia.pl-ed .q-result-prodname{font-size:14px!important;font-weight:500!important;color:#111!important}\n#q-modal-ia.pl-ed #q-step-result button:not(.q-btn-buy-now),#q-modal-ia.pl-ed #pl-look-link{border:1px solid #111!important;border-radius:0!important;background:#fff!important;color:#111!important;font-size:11px!important;font-weight:500!important;letter-spacing:.16em!important;text-transform:uppercase!important;min-height:46px!important;box-shadow:none!important}\n#q-modal-ia.pl-ed .q-powered-footer,#q-modal-ia.pl-ed [class*=powered]{background:#fff!important;border-top:1px solid #eee!important}\n";

    // ─── HTML ─────────────────────────────────────────────────────────────────────


    const html = `
        <div id="q-modal-ia">
            <div class="q-card-ia">
                <button type="button" class="q-close-ia" id="q-close-btn">&times;</button>

                <!-- Confirma&#231;&#227;o das orienta&#231;&#245;es: aparece ao clicar em Provar -->
                <div class="q-gconf" id="q-gconf">
                    <div class="q-gconf-box">
                        <div class="q-gconf-title">Antes de provar</div>
                        <div class="q-gconf-sub">S&#243; confirmando: sua foto est&#225; assim?</div>
                        <div class="q-gconf-list">
                            <div><i class="ph ph-sun"></i><span>Com <b>luz boa</b>, sem sombra</span></div>
                            <div><i class="ph ph-person-simple"></i><span>Mostrando o <b>corpo todo</b>, de frente</span></div>
                            <div><i class="ph ph-t-shirt"></i><span><b>Com roupa</b> justa ao corpo</span></div>
                        </div>
                        <div class="q-gconf-actions">
                            <button type="button" class="q-gconf-yes" id="q-gconf-yes">Sim, provar agora</button>
                            <button type="button" class="q-gconf-no" id="q-gconf-no">Trocar minha foto</button>
                        </div>
                    </div>
                </div>
                <div class="q-content-scroll">

                    <!-- Persistent header (all steps) -->
                    <div id="q-header-provador">
                        <h1>Provador Virtual</h1>
                        <img src="https://beachnetty.cdn.magazord.com.br/resources/logonova.svg" alt="BN Fitness" style="height:34px;width:auto;"/>
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

                        <!-- Orienta&#231;&#245;es discretas (a confirma&#231;&#227;o vem ao clicar em Provar) -->
                        <div class="q-guide">
                            <div class="q-guide-title">Para a prova sair perfeita</div>
                            <div class="q-guide-row">
                                <span><em class="q-guide-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M5.28 5.28l1.41 1.41M17.31 17.31l1.41 1.41M2.5 12h2M19.5 12h2M5.28 18.72l1.41-1.41M17.31 6.69l1.41-1.41"/></svg></em>Luz boa<small>sem sombra</small></span>
                                <span><em class="q-guide-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7.5V5a2 2 0 0 1 2-2h2.5M16.5 3H19a2 2 0 0 1 2 2v2.5M21 16.5V19a2 2 0 0 1-2 2h-2.5M7.5 21H5a2 2 0 0 1-2-2v-2.5"/><circle cx="12" cy="7.4" r="1.7"/><path d="M9.4 15v-2.6a2.6 2.6 0 0 1 5.2 0V15M10.6 15v3.6M13.4 15v3.6"/></svg></em>Corpo todo<small>de frente</small></span>
                                <span><em class="q-guide-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg></em>Com roupa<small>justa ao corpo</small></span>
                            </div>
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

                        <!-- Combine com outra peca (parte de cima + parte de baixo) -->
                        <div id="pl-look-row" style="display:none;">
                            <p class="q-section-label" style="margin-bottom:2px;">Combine com outra pe&#231;a</p>
                            <div id="pl-look-sub">Opcional: escolha uma e prove as duas juntas</div>
                            <div id="pl-look-list"></div>
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
                        <p class="q-pix-subtitle">Limite de provas de hoje atingido.<br>Pague R$1 via PIX para mais uma:</p>
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
                            <a href="https://provoulevou.com.br?utm_source=widget&utm_medium=lojista&utm_campaign=beachnetty" target="_blank" class="q-loading-t2">
                                <span>Powered by</span>
                                <img src="data:image/png;base64,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" alt="Provou Levou">
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
                            <a id="pl-look-link" target="_blank" rel="noopener" style="display:none;"></a>
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
                        <div style="margin-top:14px;padding-top:12px;border-top:1px solid rgba(0,0,0,.08);"><p style="font-size:12px;color:var(--c-muted);margin:0 0 8px;">Continua com problema? Fale direto com a Provou Levou:</p><a href="https://wa.me/5511938034714?text=Ol%C3%A1!%20Tive%20um%20problema%20ao%20usar%20o%20provador." target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:7px;background:#25D366;color:#fff;border-radius:10px;padding:10px 18px;font-family:inherit;font-weight:700;font-size:13px;text-decoration:none;"><svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.9c0 2.1.55 4.06 1.6 5.8L2 22l4.44-1.65a9.9 9.9 0 0 0 5.6 1.72h.01c5.46 0 9.9-4.45 9.9-9.9C21.95 6.45 17.5 2 12.04 2zm5.8 14.15c-.24.68-1.4 1.3-1.94 1.34-.5.05-1.13.07-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.8-4.17-4.94-4.36-.15-.19-1.18-1.57-1.18-2.99 0-1.42.75-2.12 1.01-2.41.27-.29.58-.36.77-.36l.55.01c.18.01.42-.07.66.5.24.59.83 2.04.9 2.18.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.75 1.24 1.62 2.01 1.11.99 2.05 1.3 2.34 1.44.29.15.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.39-.24.66-.14.27.1 1.7.8 1.99.95.29.15.48.22.55.34.07.12.07.71-.17 1.39z"/></svg> Falar com a Provou Levou</a></div>
                    </div>

                </div>
                <a href="https://provoulevou.com.br?utm_source=widget&utm_medium=lojista&utm_campaign=beachnetty" target="_blank" class="q-powered-footer">
                    <span>Powered by</span>
                    <img src="data:image/png;base64,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" class="q-quantic-logo" alt="Provou Levou">
                </a>
            </div>
        </div>
    `;


    // ─── INIT ─────────────────────────────────────────────────────────────────────


    // ─── CTA DE COMPRA NO RESULTADO ───────────────────────────────────────────────

    // Caminho do checkout da Nuvemshop. Se na loja o checkout direto não abrir,
    // troque para '/comprar/' por '/carrinho' (1 linha) — é o único ponto a validar ao vivo.
    var Q_CHECKOUT_URL = '/comprar/';

    // Tray: o preço da página fica em #variacaoPreco (muda com a variação escolhida),
    // o "de" em #precoDe e as parcelas em #info_preco. O "no pix com 3% OFF" é um
    // ::after do CSS do tema em cima de #variacaoPreco.
    function plTrayPreco() {
        var v = document.getElementById('variacaoPreco');
        var t = v ? (v.textContent || '').replace(/\s+/g, ' ').trim() : '';
        return /\d/.test(t) ? 'R$ ' + t.replace(/^R\$\s*/, '') : '';
    }
    function plTrayPrecoDe() {
        var d = document.getElementById('precoDe');
        var t = d ? (d.textContent || '').replace(/\s+/g, ' ').replace(/^\s*De\s*/i, '').trim() : '';
        return /\d/.test(t) ? t.replace(/R\$\s*/, 'R$ ') : '';
    }
    function plTrayPixTxt() {
        var v = document.getElementById('variacaoPreco');
        if (!v) return '';
        try {
            var c = getComputedStyle(v, '::after').content || '';
            c = c.replace(/^["']|["']$/g, '').trim();
            return /pix/i.test(c) ? c : '';
        } catch (e) { return ''; }
    }
    function plTrayParcela() {
        var box = document.getElementById('info_preco');
        if (!box) return '';
        var txt = (box.textContent || '').replace(/\s+/g, ' ');
        var re = /(\d+)\s*x\s*de\s*R\$\s*([\d.]+,\d{2})\s*(sem juros|com juros)?/gi, m, livre = null, qualquer = null;
        while ((m = re.exec(txt))) {
            var n = parseInt(m[1], 10); if (n < 2) continue;
            var it = { n: n, v: m[2], sj: /sem/i.test(m[3] || '') };
            if (!qualquer || n > qualquer.n) qualquer = it;
            if (it.sj && (!livre || n > livre.n)) livre = it;
        }
        var b = livre || qualquer;
        return b ? (b.n + 'x de R$ ' + b.v + (b.sj ? ' sem juros' : '')) : '';
    }


    // Escolhe a foto "de estúdio" entre as da galeria: a que tem a borda mais lisa
    // (fundo de uma cor só). Empate/erro => mantém a 1ª. Tempo máximo ~2,5 s.
    function plFotoEstudio(urls) {
        var lista = [];
        (urls || []).forEach(function (u) { var k = String(u || '').split('?')[0]; if (u && !lista.some(function (x) { return String(x).split('?')[0] === k; })) lista.push(u); });
        lista = lista.slice(0, 6);
        if (lista.length < 2) return Promise.resolve(lista[0] || '');
        function nota(u) {
            return new Promise(function (ok) {
                var img = new Image(); img.crossOrigin = 'anonymous';
                var fim = setTimeout(function () { ok(null); }, 2500);
                img.onload = function () {
                    clearTimeout(fim);
                    try {
                        var W = 60, H = Math.max(1, Math.round(60 * img.naturalHeight / img.naturalWidth));
                        var c = document.createElement('canvas'); c.width = W; c.height = H;
                        var g = c.getContext('2d'); g.drawImage(img, 0, 0, W, H);
                        var d = g.getImageData(0, 0, W, H).data, px = [];
                        for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
                            if (y < H * 0.12 || x < W * 0.1 || x > W * 0.9) { var i = (y * W + x) * 4; px.push([d[i], d[i + 1], d[i + 2]]); }
                        }
                        var m = [0, 1, 2].map(function (k) { return px.reduce(function (a, p) { return a + p[k]; }, 0) / px.length; });
                        var v = px.reduce(function (a, p) { return a + Math.pow(p[0] - m[0], 2) + Math.pow(p[1] - m[1], 2) + Math.pow(p[2] - m[2], 2); }, 0) / px.length;
                        // foto deitada (detalhe/close) não serve de referência de corpo inteiro
                        ok(img.naturalHeight >= img.naturalWidth ? v : null);
                    } catch (e) { ok(null); }
                };
                img.onerror = function () { clearTimeout(fim); ok(null); };
                img.src = u;
            });
        }
        return Promise.all(lista.map(nota)).then(function (n) {
            var melhor = 0;
            n.forEach(function (v, i) { if (v != null && (n[melhor] == null || v < n[melhor] * 0.6)) melhor = i; });
            return lista[melhor];
        });
    }

    function getMainPrice() {
        var tray = plTrayPreco(); if (tray) return tray;
        // 1) preço exibido na página (vários temas Nuvemshop)
        var sel = '.js-price-display, [data-product-price], .product__price .price, .js-product-price, .price-display, [class*="sellingPriceValue"], [class*="sellingPrice"] [class*="currencyContainer"]';
        var el = document.querySelector(sel);
        if (el) {
            var t = (el.getAttribute('data-product-price') || el.textContent || '').trim();
            if (t && /\d/.test(t)) {
                // normaliza "R$ 289,00" / "28900" -> "R$ 289,00"
                if (/^\d+$/.test(t)) { var n = (parseInt(t,10)/100).toFixed(2).replace('.',','); return 'R$ ' + n; }
                return t.replace(/\s+/g,' ');
            }
        }
        // 2) fallback: data-variants do produto principal (mesmo formato dos "Veja também")
        var dv = document.querySelector('[data-variants]');
        if (dv) {
            try { var v = JSON.parse(dv.getAttribute('data-variants'))[0]; if (v && v.price_short) return v.price_short; } catch (e) {}
        }
        return '';
    }

    function findStoreBuyBtn() {
        // Nuvemshop (legado)
        var ns = document.querySelector('.js-addtocart, .btn-add-to-cart, [data-component="product.add-to-cart"], button[type="submit"].js-addtocart');
        if (ns) return ns;
        // Tray (tema Day One): botão de compra da página de produto
        var v = document.querySelector('.botao-comprar, .page-product__button-buy, .botao-commerce');
        if (v) return (v.tagName === 'BUTTON' ? v : (v.closest('button') || v));
        // Fallback: botão de ação primário rotulado "Comprar"/"Adicionar" (exclui o nosso "Comprar Agora")
        var btns = document.querySelectorAll('button.botao-commerce, button.botao-comprar, button[class*="button-buy"], button[type="submit"]');
        for (var i = 0; i < btns.length; i++) {
            var t = (btns[i].textContent || '').trim().toLowerCase();
            if (/(comprar|adicionar|sacola|add to cart)/.test(t) && !/agora/.test(t)) return btns[i];
        }
        return null;
    }

    // Acha o form de produto real (o que tem o input add_to_cart = product_id)
    function getProductForm() {
        var f = document.getElementById('product_form');
        if (f && f.querySelector('input[name="add_to_cart"]')) return f;
        var inp = document.querySelector('input[name="add_to_cart"]');
        if (inp && inp.closest('form')) return inp.closest('form');
        return document.querySelector('form.js-product-form');
    }

    // Compra de verdade: submete uma CÓPIA do form do produto (POST real).
    // A Nuvemshop só adiciona ao carrinho via POST — o GET antigo abria o
    // carrinho vazio. O clone não tem o AJAX do tema, então faz POST nativo:
    // servidor adiciona o item e redireciona pro carrinho JÁ com o produto.
    function buyNow() {
        // Tracking: registra o clique em "Comprar Agora" (marca carrinho_adicionado na prova)
        try {
            var _tp = (document.getElementById('q-phone') || {}).value || '';
            var _td = plNomeProduto();
            fetch('https://n8n.segredosdodrop.com/webhook/pl-provador-buy-click', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: _tp, origin: location.origin, produto: _td }) }).catch(function () {});
        } catch (e) {}
        var src = getProductForm();
        if (src) {
            var clone = document.createElement('form');
            clone.method = 'post';
            clone.action = src.getAttribute('action') || '/comprar/';
            clone.style.display = 'none';
            src.querySelectorAll('input, select, textarea').forEach(function (el) {
                if (!el.name) return;
                if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) return;
                var h = document.createElement('input');
                h.type = 'hidden'; h.name = el.name; h.value = el.value;
                clone.appendChild(h);
            });
            if (!clone.querySelector('[name="quantity"]')) {
                var q = document.createElement('input');
                q.type = 'hidden'; q.name = 'quantity'; q.value = '1';
                clone.appendChild(q);
            }
            document.body.appendChild(clone);
            clone.submit();
            return;
        }
        // Botão nativo da loja (Tray e temas sem form POST):
        // fecha nosso overlay pra loja mostrar o minicart/validação de tamanho e clica no "Comprar".
        var sb = findStoreBuyBtn();
        if (sb) {
            try { var m = document.getElementById('q-modal-ia'); if (m) m.style.display = 'none'; } catch (e) {}
            try { sb.scrollIntoView({ block: 'center' }); } catch (e) {}
            try { sb.click(); } catch (e) {}
        }
    }

    // Escassez — número estável por produto (não muda a cada refresh)
    function scarcityCount(name) {
        var h = 5381, s = String(name || '');
        for (var i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
        var FLOOR = 8, _st = 10 + (h % 4);   // estoque inicial por produto (10..13)
            var _dn = new Date(), _df = (_dn.getHours() * 60 + _dn.getMinutes()) / 1440;
            var _q = _st - Math.floor(_df * 5);   // cai ao longo do dia
            return _q < FLOOR ? FLOOR : _q;        // piso 8
    }
    // Notificações de compra (prova social)
    var Q_FAKE_NAMES = ['Ana C.','Carlos M.','Mariana S.','João P.','Beatriz R.','Pedro A.','Juliana F.','Lucas T.','Fernanda L.','Rafael O.','Camila N.','Bruno G.','Larissa D.','Gabriel V.','Patrícia H.','Thiago B.','Aline M.','Rodrigo S.','Vanessa P.','Felipe C.','Letícia M.','Marcos A.'];
    var Q_FAKE_WHEN = ['agora mesmo','há 1 minuto','há 2 minutos','há 4 minutos','há 6 minutos','há 9 minutos','há 12 minutos'];
    var _fakeBuyTimer = null;
    function _showFakeBuy() {
        var step = document.getElementById('q-step-result');
        var el = document.getElementById('q-fakebuy');
        if (!el || !step || step.style.display === 'none') return;
        var nm = Q_FAKE_NAMES[Math.floor(Math.random() * Q_FAKE_NAMES.length)];
        var wh = Q_FAKE_WHEN[Math.floor(Math.random() * Q_FAKE_WHEN.length)];
        el.innerHTML = '<i class="ph-fill ph-shopping-bag"></i><div><span style="font-size:12.5px;color:var(--c-ink);"><strong>' + nm + '</strong> comprou este produto</span><span>' + wh + ' &middot; compra verificada</span></div>';
        el.classList.add('show');
        clearTimeout(el._hideT);
        el._hideT = setTimeout(function () { el.classList.remove('show'); }, 4500);
    }
    function startFakeBuy() {
        stopFakeBuy();
        setTimeout(_showFakeBuy, 3000);
        _fakeBuyTimer = setInterval(_showFakeBuy, 12000);
    }
    function stopFakeBuy() {
        if (_fakeBuyTimer) { clearInterval(_fakeBuyTimer); _fakeBuyTimer = null; }
        var el = document.getElementById('q-fakebuy'); if (el) el.classList.remove('show');
    }

    // Parcelamento — o MESMO da pagina: pega a MAIOR parcela do produto ("em ate Nx de R$ X").
    // Le do data-variants (mesma fonte do preco). installments_data vem como STRING JSON aninhada.
    function getInstallment() {
        var tray = plTrayParcela(); if (tray) return tray;
        var dv = document.querySelector('[data-variants]');
        if (!dv) return '';
        try {
            var v = JSON.parse(dv.getAttribute('data-variants'))[0];
            var idata = v.installments_data;
            if (!idata) return '';
            if (typeof idata === 'string') idata = JSON.parse(idata);
            var plans = idata[Object.keys(idata)[0]];
            if (!plans) return '';
            // Prioriza a MAIOR parcela SEM JUROS (without_interests), igual a pagina.
            // So cai numa parcela com juros se nao existir nenhuma sem juros >= 2x.
            var bestFree = null, bestAny = null;
            Object.keys(plans).forEach(function (k) {
                var n = parseInt(k, 10);
                var p = plans[k];
                if (n >= 2 && p.installment_value > 0) {
                    if (!bestAny || n > bestAny.n) bestAny = { n: n, val: p.installment_value };
                    if (p.without_interests === true && (!bestFree || n > bestFree.n)) bestFree = { n: n, val: p.installment_value };
                }
            });
            var best = bestFree || bestAny;
            if (best) return best.n + 'x de R$ ' + Number(best.val).toFixed(2).replace('.', ',');
        } catch (e) {}
        return '';
    }

    function populateBuyCta() {
        var btn = document.getElementById('q-btn-buy-now');
        var trust = document.getElementById('q-seals');
        if (!btn) return;
        // Nome + valor do produto acima do botão
        var price = getMainPrice();
        var prodName = plNomeProduto();
        var info = document.getElementById('q-result-prodinfo');
        var nameEl = document.getElementById('q-result-prodname');
        var priceEl = document.getElementById('q-result-prodprice');
        if (nameEl) nameEl.textContent = (prodName || '').trim();
        if (priceEl) {
            priceEl.textContent = '';
            var de = plTrayPrecoDe(), pixTxt = plTrayPixTxt();
            if (de && price && de !== price) {
                var old = document.createElement('span'); old.className = 'q-result-oldprice'; old.textContent = de;
                priceEl.appendChild(old); priceEl.appendChild(document.createTextNode(' '));
            }
            priceEl.appendChild(document.createTextNode(price || ''));
            if (pixTxt && price) {
                var px = document.createElement('span'); px.className = 'q-result-pixtxt'; px.textContent = ' ' + pixTxt;
                priceEl.appendChild(px);
            }
        }
        var instEl = document.getElementById('q-result-installment');
        if (instEl) { var _inst = getInstallment(); instEl.textContent = _inst; instEl.style.display = _inst ? 'block' : 'none'; }
        if (info && ((prodName || '').trim() || price)) info.style.display = 'block';
        // Escassez
        var sc = document.getElementById('q-scarcity');
        var scn = document.getElementById('q-scarcity-n');
        if (sc && scn && (prodName || '').trim()) { scn.textContent = scarcityCount(prodName); sc.style.display = 'flex'; }
        // Notificações de compra: desativadas em todos os provadores
        btn.style.display = 'flex';
        if (trust) trust.style.display = 'flex';
        btn.onclick = buyNow;
    }


    // ─── INIT ─────────────────────────────────────────────────────────────────────


    function init() {
        // --- FILTRO DE CATEGORIA (HAT) ---
        const productNameNormalized = (plNomeProduto()).toUpperCase();
        if (productNameNormalized.includes('HAT')) {
            return;
        }

        // Fontes (async, não bloqueia render)

        // Phosphor Icons — carregado lazily na primeira abertura do modal
        // (não carrega na init para não impactar o tempo de carregamento da página)

        const styleTag = document.createElement('style');
        styleTag.textContent = styles;
        document.head.appendChild(styleTag);

        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = html;
        document.body.appendChild(modalContainer);

        // Usa a MESMA FONTE da loja no provador (em vez de Bebas Neue / DM Sans)
        try {
            var _bodyF = getComputedStyle(document.body).fontFamily;
            var _h = document.querySelector('.product-name,h1.product-name,h1,h2');
            var _headF = _h ? getComputedStyle(_h).fontFamily : _bodyF;
            var _root = document.documentElement;
            if (_bodyF) _root.style.setProperty('--font-body', _bodyF);
            if (_headF) _root.style.setProperty('--font-display', _headF);
        } catch (e) {}


        // ── Botão imagem PNG ──
        const openBtn = document.createElement('button');
        openBtn.className = 'q-btn-trigger-ia';
        openBtn.id = 'q-open-ia';
        openBtn.setAttribute('aria-label', 'Abrir Provador Virtual');
        openBtn.innerHTML = stampImageHTML;


        const imgContainers = ['.block-imagem .product-img', '.product-gallery', '.product-images', '[class*="carousel"]', '[class*="productImagesGallery"]', '.product-image-column', '[data-store^="product-image-"]', '.product__media-wrapper', '.product-gallery__media', '.product__media', '.product-image-main', '.product-media-container', '[data-media-id]', '.product__media-item', '.product-gallery', '.product-single__media', '.media-gallery'];

        // Ancora o selo por POSICAO sobre a galeria (nao dentro de um slide):
        // assim ele aparece em todas as fotos e sobrevive ao re-render do React.
        function plGaleria() {
            // Ancora na FOTO em si (visivel e dentro da viewport). Os containers
            // slick se movem/duplicam, por isso mirar neles jogava o selo pra fora.
            var best = null, area = 0;
            // Tray/Day One: procura SÓ dentro da galeria do produto. Sem isso a
            // varredura global pegava a maior imagem da página (banner/relacionado)
            // e jogava o selo pra fora da foto. Ver validação na loja em 31/07.
            var escopo = document.querySelector('.product-gallery, .product-images');
            var imgs = (escopo || document).querySelectorAll('img');
            if (escopo && !imgs.length) imgs = document.querySelectorAll('img');
            for (var i = 0; i < imgs.length; i++) {
                var im = imgs[i], r = im.getBoundingClientRect();
                var sc = im.getAttribute('src') || '';
                if (/tabela|medida/i.test(sc)) continue;
                if (r.width < 320 || r.height < 320) continue;
                if (r.left < 0 || r.left > window.innerWidth - 120) continue;
                if (im.offsetParent === null) continue;
                var a = r.width * r.height;
                if (a > area) { area = a; best = im; }
            }
            return best;
        }
        function plPosicionaSelo() {
            // Beach Netty (05/11/2026): selo preso dentro da galeria, rola junto com a foto.
            // Fixo na tela e reposicionado no scroll ele tremia e andava com a pagina.
            var _gal = document.querySelector('.block-imagem .product-img');
            if (_gal) {
                if (window.getComputedStyle(_gal).position === 'static') _gal.style.position = 'relative';
                if (openBtn.parentElement !== _gal) _gal.appendChild(openBtn);
                var _tam = window.innerWidth < 768 ? 66 : 72;
                openBtn.style.position = 'absolute';
                // Canto da FOTO, medido em relacao a galeria: a distancia nao muda com o scroll.
                var _foto = null, _ar = 0;
                _gal.querySelectorAll('img').forEach(function (im) {
                    var q = im.getBoundingClientRect();
                    if (im === openBtn.querySelector('img') || q.width < 200 || q.height < 200 || q.left < 0 || q.left > window.innerWidth - 80) return;
                    if (q.width * q.height > _ar) { _ar = q.width * q.height; _foto = q; }
                });
                var _gr = _gal.getBoundingClientRect();
                openBtn.style.top = ((_foto ? Math.max(0, _foto.top - _gr.top) : 0) + 14) + 'px';
                openBtn.style.right = ((_foto ? Math.max(0, _gr.right - _foto.right) : 0) + 14) + 'px';
                openBtn.style.left = 'auto';
                openBtn.style.bottom = 'auto';
                openBtn.style.width = _tam + 'px';
                openBtn.style.height = _tam + 'px';
                openBtn.style.zIndex = '20';
                openBtn.style.visibility = 'visible';
                return true;
            }
            // Tray/Day One: a galeria é um swiper cujos slides ficam lado a lado muito
            // além do container (overflow hidden) e uma das <img> renderiza no tamanho
            // natural (1080x1920). Mirar na "maior imagem" jogava o selo pra fora da
            // foto, então quando existe o container da galeria usamos o rect DELE.
            var cont = document.querySelector('.product-gallery, .product-images');
            var r;
            if (cont) {
                var cr = cont.getBoundingClientRect();
                if (cr.width > 120 && cr.height > 120) r = cr;
            }
            if (!r) {
                var g = plGaleria();
                if (!g) return false;
                r = g.getBoundingClientRect();
            }
            if (!openBtn.isConnected) document.body.appendChild(openBtn);
            var mob = window.innerWidth < 768;
            var tam = mob ? 66 : 72;
            openBtn.style.position = 'fixed';
            openBtn.style.zIndex = '9999';
            openBtn.style.width = tam + 'px';
            openBtn.style.height = tam + 'px';
            // Altura do header fixo da loja: o selo nao pode passar por cima dele.
            var _hb = 0;
            try {
                var hs = document.querySelectorAll('header, [class*="header"], [class*="Header"]');
                for (var k = 0; k < hs.length; k++) {
                    var hr = hs[k].getBoundingClientRect();
                    var pos = window.getComputedStyle(hs[k]).position;
                    if ((pos === 'fixed' || pos === 'sticky') && hr.top <= 8 && hr.height > 20 && hr.bottom > _hb) _hb = hr.bottom;
                }
            } catch (e) {}
            // Laço de Luxo: a etiqueta de desconto (-10%) fica no canto de cima; o selo desce pra não cobrir
            var _topSelo = r.top + 62;
            if (r.bottom < 40 || r.top > window.innerHeight - 40 || _topSelo < _hb + 6) { openBtn.style.visibility = 'hidden'; }
            else {
                openBtn.style.visibility = 'visible';
                openBtn.style.top = (r.top + 62) + 'px';
                openBtn.style.left = (r.right - tam - 14) + 'px';
            }
            return true;
        }
        window.addEventListener('scroll', plPosicionaSelo, { passive: true });
        setInterval(plPosicionaSelo, 800); // o React re-renderiza a galeria e arranca o selo
        window.addEventListener('resize', plPosicionaSelo);

        function tryPlaceTriggerBtn() {
            if (plPosicionaSelo()) return true;
            // 1ª prioridade: container que tenha <img> dentro (evita cair em slide de vídeo)
            for (const sel of imgContainers) {
                const els = document.querySelectorAll(sel);
                for (const el of els) {
                    if (el.querySelector('img')) {
                        if (window.getComputedStyle(el).position === 'static') el.style.position = 'relative';
                        el.appendChild(openBtn);
                        return true;
                    }
                }
            }
            // 2ª prioridade: qualquer container correspondente
            for (const sel of imgContainers) {
                const el = document.querySelector(sel);
                if (el) {
                    if (window.getComputedStyle(el).position === 'static') el.style.position = 'relative';
                    el.appendChild(openBtn);
                    return true;
                }
            }
            return false;
        }

        // Mantem o selo no ar: se o tema re-renderizar a galeria (troca de foto),
        // o botao e reinserido em vez de sumir.
        // A galeria da Tray pode montar depois do load (swiper): tenta por ate 20s
        // e segue vigiando para o caso de re-render.
        var _tries = 0;
        setInterval(function () { try { plPosicionaSelo(); } catch (e) {} }, 800);

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
            }, 12000);
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

        const inlineBtnText = document.createTextNode('Provador virtual');
        inlineBtn.appendChild(inlineBtnText);

        inlineBtn.addEventListener('click', (e) => {
            window.__plBtnSrc = 'carrinho';
            e.preventDefault();
            e.stopPropagation();
            const prodName = plNomeProduto();
            applyProduct(detectProduct(prodName));
            populateImageSelector();
            openModal();
        });

        // Posiciona ABAIXO do botão de compra (pedido do lojista)
        // Tray: o botao de compra e o .botao-comprar da pagina de produto
        // O bloco de compra usa flex: sem width:100% o botao encolhe e cola a esquerda
        inlineBtn.style.width = '100%';
        inlineBtn.style.boxSizing = 'border-box';
        inlineBtn.style.display = 'flex';
        inlineBtn.style.alignItems = 'center';
        inlineBtn.style.justifyContent = 'center';
        inlineBtn.style.alignSelf = 'stretch';
        inlineBtn.style.height = '50px';
        inlineBtn.style.borderRadius = '5px';
        inlineBtn.style.margin = '0';
        // O botao de compra pode ser montado DEPOIS do init(), entao
        // a insercao unica falhava no primeiro acesso (so aparecia apos F5).
        // Agora tentamos ate o alvo existir.
        function plInsereInline() {
            try {
                if (document.body.contains(inlineBtn)) return true;
                var _alvo = document.querySelector('.area-comprar');
                if (!_alvo) return false;
                var _acoes = document.getElementById('pl-bn-acoes');
                if (!_acoes) {
                    _acoes = document.createElement('div');
                    _acoes.id = 'pl-bn-acoes';
                    if (plTemManequim()) {
                        var _tam = document.createElement('button');
                        _tam.type = 'button';
                        _tam.className = 'q-btn-inline-provador';
                        _tam.id = 'pl-bn-tamanho';
                        _tam.textContent = 'Descobrir meu tamanho';
                        _tam.onclick = function (e) { e.preventDefault(); e.stopPropagation(); plAbreManequim(); };
                        _acoes.appendChild(_tam);
                    } else {
                        _acoes.style.gridTemplateColumns = '1fr';
                    }
                    _alvo.parentNode.insertBefore(_acoes, _alvo);
                }
                _acoes.appendChild(inlineBtn);
                return true;
            } catch (e) { return false; }
        }
        // Vigia PERMANENTE (igual ao selo): alem de esperar o React montar o
        // "Comprar", o React re-renderiza a area de compra e ARRANCA o nosso
        // botao. Se pararmos no primeiro sucesso, ele some e nao volta -- era
        // por isso que so aparecia depois do F5. Nunca limpar este intervalo.
        plInsereInline();
        setInterval(plInsereInline, 800);
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
        // Combine com outra peca (05/11/2026, igual ao da Laeva): o gerador veste as duas pelo kit_json.
        // Magazord nao tem rota de recomendacao: as opcoes vem do sitemap e dos dados da pagina de cada produto.
        let plLook = null, plLookOps = null, plLookPlanos = null, plLookCorUsada = null, plLookVez = 0;
        const PL_LOOK_ON = true; // liberado para todos em 05/11/2026
        const PL_ED_ON = true; // visual da Laeva: no ar para todos desde 05/11/2026
        const PL_CORES = ['azul marinho', 'verde oliva', 'off white', 'preto', 'branco', 'marrom', 'marsala', 'marinho', 'azul', 'verde', 'rosa', 'vinho', 'cinza', 'bege', 'nude', 'lilas', 'roxo', 'vermelho', 'laranja', 'amarelo', 'terracota', 'caramelo'];
        function plLookNorm(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[.\-_]+/g, ' '); }
        function plLookLado(s) {
            const n = plLookNorm(s);
            if (/c?onjunto|\bkit\b|vestido|macac/.test(n)) return '';
            if (/\b(calca|legging|short|shorts|saia|bermuda|ciclista)\b/.test(n)) return 'baixo';
            if (/\b(blusa|top|regata|jaqueta|camiseta|camisa|cropped)\b/.test(n)) return 'cima';
            return '';
        }
        function plLookCor(s) { const n = plLookNorm(s); return PL_CORES.find(c => new RegExp('\\b' + c + '\\b').test(n)) || ''; }
        // Cor marcada na pagina; sem marcacao, a cor que estiver no link do produto.
        function plLookCorAtual() {
            const li = document.querySelector('.variacao-lista-1 li.selected');
            const nome = li ? (li.getAttribute('data-derivacao-item-name') || li.getAttribute('title') || li.textContent) : '';
            return plLookCor(nome) || plLookNorm(nome).trim() || plLookCor(location.pathname.split('/').pop());
        }
        // A pagina traz a foto e o estoque de cada cor no JSON da loja: { preto: url, 'off white': url }
        function plLookCoresDaPagina(h) {
            const mapa = {}, re = /"qtde_estoque":(\d+)[^{}]*?"derivacoes_produto":(\[.*?\]),"link".*?"midias":\[\{.*?"midia_url":"([^"]+)"/g;
            let m;
            while ((m = re.exec(h))) {
                try {
                    const cor = JSON.parse(m[2]).find(d => /^cor$/i.test(d.deri_nome || ''));
                    if (!cor || !Number(m[1])) continue;
                    const k = plLookCor(cor.derivacao) || plLookNorm(cor.derivacao).trim();
                    if (!mapa[k]) mapa[k] = JSON.parse('"' + m[3] + '"').split('?')[0];
                } catch (_) {}
            }
            return mapa;
        }
        const plLookPaginas = {};
        function plLookPagina(s) {
            if (!plLookPaginas[s]) plLookPaginas[s] = fetch('/' + s).then(r => r.text()).then(h => {
                const d = new DOMParser().parseFromString(h, 'text/html');
                const p = Array.from(d.querySelectorAll('script[type="application/ld+json"]')).map(e => { try { return JSON.parse(e.textContent); } catch (_) { return null; } }).find(j => j && j['@type'] === 'Product');
                if (!p || !/InStock/i.test(JSON.stringify(p.offers || ''))) return null;
                const img = Array.isArray(p.image) ? p.image[0] : p.image;
                return img ? { slug: s, nome: String(p.name || '').trim(), img: img, cores: plLookCoresDaPagina(h) } : null;
            }).catch(() => null);
            return plLookPaginas[s];
        }
        async function plLookCarregar(cor) {
            const atual = location.pathname.split('/').pop();
            const lado = plLookLado(plNomeProduto()) || plLookLado(atual);
            if (!lado) return [];
            if (!plLookPlanos) plLookPlanos = fetch('/sitemap-produto.xml').then(r => r.text());
            const xml = await plLookPlanos;
            const slugs = (xml.match(/<loc>[^<]+<\/loc>/g) || []).map(l => l.replace(/<\/?loc>/g, '').split('/').pop())
                .filter(s => /^[a-z0-9.\-]+$/.test(s) && s !== atual && plLookLado(s) && plLookLado(s) !== lado);
            // Primeiro o link na cor; depois produtos com varias cores (a cor esta dentro da pagina); preto por ultimo.
            const peso = s => { const c = plLookCor(s); return (cor && c === cor) ? 0 : (!c ? 1 : (c === 'preto' ? 2 : 3)); };
            const modelo = s => { let n = plLookNorm(s); PL_CORES.forEach(c => { n = n.replace(c, ''); }); return n.replace(/\s+/g, ' ').trim(); };
            const vistos = {};
            const fila = slugs.map((s, i) => [s, i]).sort((a, b) => (peso(a[0]) - peso(b[0])) || (a[1] - b[1])).map(x => x[0])
                .filter(s => { const m = modelo(s); if (vistos[m]) return false; vistos[m] = 1; return true; }).slice(0, 10);
            const lidos = (await Promise.all(fila.map(plLookPagina))).filter(Boolean);
            const nota = o => { const cs = plLookCor(o.slug); if (cor && (cs === cor || o.cores[cor])) return 0; if (cs === 'preto' || o.cores.preto) return 1; return 2; };
            return lidos.map((o, i) => [o, i]).sort((a, b) => (nota(a[0]) - nota(b[0])) || (a[1] - b[1])).map(x => {
                const o = x[0], igual = cor && o.cores[cor], preto = nota(o) === 1 && o.cores.preto;
                return { slug: o.slug, nome: o.nome, img: igual || preto || o.img };
            }).slice(0, 4);
        }
        function plLookPintar() {
            const row = document.getElementById('pl-look-row'), list = document.getElementById('pl-look-list');
            if (!row || !list) return;
            if (!plLookOps || !plLookOps.length) { row.style.display = 'none'; return; }
            row.style.display = 'block';
            list.textContent = '';
            plLookOps.forEach(o => {
                const on = plLook && plLook.slug === o.slug;
                const c = document.createElement('button'); c.type = 'button'; c.className = 'pl-look-card' + (on ? ' on' : '');
                const im = document.createElement('img'); im.src = o.img; im.alt = o.nome; im.loading = 'lazy';
                const t = document.createElement('span'); t.textContent = o.nome;
                c.appendChild(im); c.appendChild(t);
                c.onclick = () => { plLook = on ? null : o; plLookPintar(); };
                list.appendChild(c);
            });
            const sub = document.getElementById('pl-look-sub');
            if (sub) sub.textContent = plLook ? ('Vamos provar junto: ' + plLook.nome) : 'Opcional: escolha uma e prove as duas juntas';
            const gb = document.getElementById('q-btn-generate');
            if (gb) gb.textContent = PL_ED_ON ? (plLook ? 'Ver o look no meu corpo' : 'Ver no meu corpo') : (plLook ? 'Provar o look' : 'Provar roupa');
        }
        // Visual igual ao da Laeva (05/11/2026). Por enquanto so na previa (pl_look=1).
        function plEdMontar() {
            const modal = document.getElementById('q-modal-ia');
            if (!modal || modal.classList.contains('pl-ed')) return;
            const lk = document.createElement('link'); lk.rel = 'stylesheet';
            lk.href = 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600&display=swap';
            document.head.appendChild(lk);
            const st = document.createElement('style'); st.textContent = PL_ED_CSS; document.head.appendChild(st);
            modal.classList.add('pl-ed');
            const mk = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; };
            const sec = (n, h) => { const s = mk('div', 'ed-sec'); s.appendChild(mk('div', 'ed-n', n)); s.appendChild(mk('div', 'ed-h', h)); return s; };
            const head = document.getElementById('q-header-provador');
            head.appendChild(mk('span', 'ed-tag', 'Provador virtual'));
            const prod = mk('div'); prod.id = 'ed-prod';
            const pi = mk('img'); pi.id = 'ed-prod-img'; pi.alt = '';
            const pt = mk('div'); const pb = mk('b'); pb.id = 'ed-prod-nome'; pt.appendChild(pb); pt.appendChild(mk('small', '', 'você está provando'));
            prod.appendChild(pi); prod.appendChild(pt);
            head.parentNode.insertBefore(prod, head.nextSibling);
            const fone = document.querySelector('.q-phone-wrap');
            fone.insertBefore(mk('div', 'ed-h', 'Seu WhatsApp'), fone.firstChild);
            fone.insertBefore(mk('div', 'ed-n', '01'), fone.firstChild);
            const frame = document.getElementById('q-face-frame'), btns = document.querySelector('.q-upload-btns');
            const s2 = sec('02', 'Sua foto');
            frame.parentNode.insertBefore(s2, frame);
            const foto = mk('div', 'ed-foto'); foto.appendChild(frame);
            const tips = mk('ul', 'ed-tips'); ['Corpo inteiro', 'Roupa justa ou leve', 'Boa luz, fundo limpo'].forEach(x => tips.appendChild(mk('li', '', x)));
            foto.appendChild(tips); s2.appendChild(foto); s2.appendChild(btns);
            const row = document.getElementById('pl-look-row');
            row.insertBefore(mk('div', 'ed-h', 'Combine com outra peça'), row.firstChild);
            row.insertBefore(mk('div', 'ed-n', '03 · opcional'), row.firstChild);
            const gb = document.getElementById('q-btn-generate'); if (gb) gb.textContent = 'Ver no meu corpo';
            const lb = document.getElementById('q-loading-box'), bar = lb.querySelector('.q-loading-bar');
            const duo = mk('div', 'ed-duo solo'); duo.id = 'ed-duo';
            const d1 = mk('img'); d1.id = 'ed-duo-1'; d1.alt = ''; const d2 = mk('img'); d2.id = 'ed-duo-2'; d2.alt = ''; d2.style.display = 'none';
            duo.appendChild(d1); duo.appendChild(d2);
            const tx = mk('div', 'ed-load-tx'); const tb = mk('b'); tb.id = 'ed-load-tit'; const ts = mk('small'); ts.id = 'ed-load-sub';
            tx.appendChild(tb); tx.appendChild(ts); if (bar) tx.appendChild(bar);
            lb.insertBefore(tx, lb.firstChild); lb.insertBefore(duo, lb.firstChild);
        }
        function plEdProduto() {
            const og = document.querySelector('meta[property="og:image"]');
            const im = document.getElementById('ed-prod-img'), nm = document.getElementById('ed-prod-nome');
            let foto = '';
            try { foto = extractImages()[0] || ''; } catch (_) {}
            if (im) im.src = foto || (og ? og.content : '');
            if (nm) nm.textContent = plNomeProduto();
        }
        function plEdCarregando(img1) {
            const duo = document.getElementById('ed-duo');
            if (!duo) return;
            const i1 = document.getElementById('ed-duo-1'), i2 = document.getElementById('ed-duo-2');
            if (img1) i1.src = img1;
            duo.classList.toggle('solo', !plLook);
            i2.style.display = plLook ? '' : 'none';
            if (plLook) i2.src = plLook.img;
            document.getElementById('ed-load-tit').textContent = plLook ? 'Vestindo as 2 peças em você' : 'Vestindo a peça em você';
            document.getElementById('ed-load-sub').textContent = plNomeProduto() + (plLook ? ' + ' + plLook.nome : '');
        }
        if (PL_ED_ON) { try { plEdMontar(); } catch (_) {} }
        async function plLookAbrir() {
            if (PL_ED_ON) { try { plEdProduto(); } catch (_) {} }
            if (!PL_LOOK_ON) return;
            // Trocou de cor com o provador fechado: refaz as sugestoes nessa cor.
            const cor = plLookCorAtual();
            if (plLookOps && cor === plLookCorUsada) { plLookPintar(); return; }
            plLookCorUsada = cor; plLook = null; plLookOps = [];
            plLookPintar();
            const vez = ++plLookVez;
            let ops = [];
            try { ops = await plLookCarregar(cor); } catch (_) {}
            if (vez !== plLookVez) return;
            plLookOps = ops;
            plLookPintar();
        }
        let pixPaymentId = null;
        let selectedProductImgUrl = '';
        let userPickedPhoto = false;   // true quando a cliente clica numa miniatura

        // Upgrade Nuvemshop CDN URLs to 1024px version
        function upgradeImgUrl(url) {
            if (url.includes('mitiendanube.com') || url.includes('nuvemshop.com')) {
                return url.replace(/-\d+-\d+\.webp/, '-1024-1024.webp');
            }
            return url;
        }

        function extractImages() {
            const containersSelectors = '.product-gallery, .product-images, .image.swiper-slide, .js-product-slide, .product-image-column, .js-swiper-product, [data-store^="product-image-"], .product__media-wrapper, .product-gallery__media, .product__media, .product-image-main, .product-media-container, [data-media-id], .product__media-item, .product-gallery, .product-single__media, .media-gallery, [data-component="product.gallery"], .swiper-slide:not(.swiper-slide-duplicate), .slider-wrapper';
            // ⚠️ Tema Tray 127: os carrosseis de produtos RELACIONADOS tambem sao
            // .swiper-slide e vem ANTES da galeria no DOM. Hoje escapam so porque
            // estao com placeholder 1x1; assim que o lazy-load troca o src -- ou
            // ANTES de carregarem, quando naturalWidth e 0 e o filtro de tamanho
            // nao pega -- eles entram e ocupam os 4 slots, e a prova sai com a peca
            // errada. Quando a galeria do produto existe, so ela vale.
            const _galeriaProduto = document.querySelector('.block-imagem .product-img') || document.querySelector('.block-imagem');
            let possibleContainers = _galeriaProduto ? [_galeriaProduto] : Array.from(document.querySelectorAll(containersSelectors));
            let imgEls = [];
            const _coleta = (conts) => {
                const out = [];
                conts.forEach(c => {
                    if (!c.closest('#q-modal-ia')) out.push(...Array.from(c.querySelectorAll('img')));
                });
                return out;
            };
            imgEls = _coleta(possibleContainers);
            // galeria existe mas ainda sem <img> (render tardio) -> volta pro seletor amplo
            if (!imgEls.length && _galeriaProduto) imgEls = _coleta(Array.from(document.querySelectorAll(containersSelectors)));
            let uniqueImgs = [];
            imgEls.forEach(img => {
                // miniaturas da galeria (pai .thumb, arquivo prefixado "90_") nao servem
                // de referencia: sao a mesma foto em baixa resolucao.
                if (img.closest('.thumb')) return;
                let src = img.dataset?.src || img.getAttribute('data-src') || img.src;

                if (src && src.includes('data:image')) {
                    const parentA = img.closest('a');
                    if (parentA && parentA.href && !parentA.href.includes('javascript:')) {
                        src = (/\.(jpe?g|png|webp|gif|avif)(\?|#|$)/i.test(parentA.href) ? parentA.href : '');
                    } else if (img.getAttribute('data-srcset')) {
                        src = img.getAttribute('data-srcset').split(',')[0].trim().split(' ')[0];
                    }
                }

                if (!src || src.includes('data:image')) return;
                // Magazord: a miniatura (?ims=fit-in/96x96) vinha primeiro e ia como referencia da prova;
                // sem o ?ims o CDN entrega a foto inteira.
                if (/[?&]ims=fit-in\/\d{1,3}x\d{1,3}/.test(src)) return;
                if (/cdn\.magazord\.com\.br/.test(src)) src = src.split('?')[0];

                const lowerSrc = src.toLowerCase();
                const invalidKeywords = ['provador', 'logo', 'provoulevou', 'icon', 'play', 'video', 'transparent', 'placeholder', 'blank', 'spacer'];
                if (invalidKeywords.some(kw => lowerSrc.includes(kw))) return;

                // Filter out tiny images (1x1 pixels, spacers, etc.)
                if (img.naturalWidth > 0 && img.naturalWidth < 50) return;
                if (img.naturalHeight > 0 && img.naturalHeight < 50) return;

                // A Tray serve a miniatura como "<tamanho>_<arquivo>" (ex.: 90_colete...jpg).
                // Sem normalizar isso a mesma foto entrava duas vezes e ocupava 2 dos 4 slots.
                const _norm = u => u.split('?')[0].replace(/-\d+-\d+\.webp|_\d+x\d+/, '').replace(/\/\d+_(?=[^/]+$)/, '/');
                let cleanSrc = _norm(src);

                // Upgrade to 1024px version
                src = upgradeImgUrl(src);

                if (!uniqueImgs.some(u => _norm(u) === cleanSrc)) {
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
            userPickedPhoto = false;
        }

        // -- Tracking de abertura do provador (session anonima) - Provou Levou --
        var WEBHOOK_OPEN_PL = 'https://n8n.segredosdodrop.com/webhook/pl-provador-open';
        function plSid() { try { var s = localStorage.getItem('pl_sid'); if (!s) { s = 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10); localStorage.setItem('pl_sid', s); } return s; } catch (e) { return 'nostore'; } }
        function plTrackOpen() { try { fetch(WEBHOOK_OPEN_PL, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: plSid(), origin: location.origin, botao: window.__plBtnSrc || null, produto: plNomeProduto() }) }).catch(function () {}); } catch (e) {} }
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
            /* roupa: sem deteccao de rosto (foto e de corpo inteiro) */
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
            if (typeof _checkProvasRestantes === 'function') _checkProvasRestantes();
            try { pixResume(); } catch (e) {}
        }


        function closeModal() {
            modal.style.display = 'none';
            unlockBodyScroll();
            try { stopFakeBuy(); } catch (e) {}
        
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

        /* ── Fechar sem perder a foto ──────────────────────────────────────
           Fechar o provador depois de provar resetava tudo e a foto gerada
           sumia. Agora o resultado fica guardado: ao reabrir pelo selo ou
           pelo botao, o cliente volta direto na foto dele.
           Como a tela de resultado nao tinha saida (o #q-retry-btn e lido no
           JS mas nunca existiu no HTML), adicionamos "Provar outra foto" --
           sem isso o cliente ficaria preso no resultado. */
        function _plTemResultado() {
            var i = document.getElementById('q-final-view-img');
            return !!(i && i.getAttribute('src'));
        }

        function _plNovaProva() {
            var img = document.getElementById('q-final-view-img');
            if (img) img.removeAttribute('src');
            var s = document.getElementById('q-step-result');
            if (s) s.style.display = 'none';
            var p = document.getElementById('q-step-photo');
            if (p) p.style.display = 'flex';
            var c = document.querySelector('.q-card-ia');
            if (c) c.classList.remove('is-result');
            try { if (typeof userPhoto !== 'undefined') userPhoto = null; } catch (e) {}
            try { if (typeof pixPaymentId !== 'undefined') pixPaymentId = null; } catch (e) {}
            try { if (typeof preImg !== 'undefined' && preImg) preImg.style.display = 'none'; } catch (e) {}
            try { if (typeof facePlaceholder !== 'undefined' && facePlaceholder) facePlaceholder.style.display = 'flex'; } catch (e) {}
            try { if (typeof cameraInput !== 'undefined' && cameraInput) cameraInput.value = ''; } catch (e) {}
            try { if (typeof galleryInput !== 'undefined' && galleryInput) galleryInput.value = ''; } catch (e) {}
            try { if (typeof checkFields === 'function') checkFields(); } catch (e) {}
        }

        function _plMontaBotaoNovaProva() {
            var col = document.getElementById('q-result-actions-col');
            if (!col || document.getElementById('q-btn-nova-prova')) return;
            var b = document.createElement('button');
            b.type = 'button';
            b.id = 'q-btn-nova-prova';
            b.className = 'q-btn-outline';
            b.textContent = 'Provar outra foto';
            b.style.marginTop = '10px';
            b.onclick = _plNovaProva;
            col.appendChild(b);
        }

        var _plCloseOriginal = closeModal;
        closeModal = function () {
            if (_plTemResultado()) {
                try { modal.style.display = 'none'; } catch (e) {}
                try { unlockBodyScroll(); } catch (e) {}
                try { stopFakeBuy(); } catch (e) {}
                return;
            }
            return _plCloseOriginal.apply(this, arguments);
        };

        var _plOpenOriginal = openModal;
        openModal = function () {
            try { plLookAbrir(); } catch (_) {}
            var _r = _plOpenOriginal.apply(this, arguments);
            try {
                _plMontaBotaoNovaProva();
                if (_plTemResultado()) {
                    ['q-step-photo', 'q-loading-box', 'q-step-error'].forEach(function (id) {
                        var el = document.getElementById(id);
                        if (el) el.style.display = 'none';
                    });
                    var s = document.getElementById('q-step-result');
                    if (s) s.style.display = 'flex';
                    var c = document.querySelector('.q-card-ia');
                    if (c) c.classList.add('is-result');
                }
            } catch (e) {}
            return _r;
        };



        function applyProduct(product) {
            currentProduct = product;
        }


        openBtn.onclick = (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            const prodName = plNomeProduto();
            applyProduct(detectProduct(prodName));
            populateImageSelector();
            openModal();
        };


        closeBtn.onclick = () => closeModal();
        if (backBtn) backBtn.onclick = () => closeModal();


        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });


        if (retryBtn) retryBtn.onclick = () => {
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

        function loadRelatedProducts(_attempt) {
            _attempt = _attempt || 0;
            var grid = document.getElementById('q-related-grid');
            var section = document.getElementById('q-related-products');
            if (!grid || !section) return;

            var items = document.querySelectorAll('.js-swiper-related .js-item-product');
            if (!items.length) items = document.querySelectorAll('.js-related-products .js-item-product');
            if (!items.length) items = document.querySelectorAll('.js-swiper-complementary .js-item-product');
            if (!items.length) items = document.querySelectorAll('.js-item-product');
            if (!items.length && _attempt < 6) {
                setTimeout(function() { loadRelatedProducts(_attempt + 1); }, 500);
                return;
            }
            var products = [];

            items.forEach(function(item) {
                if (products.length >= 3) return;
                var container = item.querySelector('[data-variants]');
                if (!container) return;
                try {
                    var variants = JSON.parse(container.getAttribute('data-variants'));
                    if (!variants || !variants.length) return;
                    var v = variants[0];
                    var imgRaw = v.image_url || '';
                    var img = imgRaw ? 'https:' + imgRaw.replace(/\\/g, '').replace('-1024-1024.webp', '-480-0.webp') : '';
                    var price = v.price_short || '';
                    // Name from img alt (Nuvemshop sets it reliably)
                    var imgEl = item.querySelector('img[alt]');
                    var name = imgEl ? imgEl.getAttribute('alt').trim() : '';
                    // Link from any anchor pointing to /produtos/
                    var linkEl = item.querySelector('a[href*="/produtos/"]');
                    var link = linkEl ? linkEl.getAttribute('href') : '';
                    if (img && (name || price)) {
                        products.push({ name: name, img: img, price: price, link: link });
                    }
                } catch(e) {}
            });

            if (!products.length) {
                if (_attempt < 6) {
                    setTimeout(function() { loadRelatedProducts(_attempt + 1); }, 500);
                }
                return;
            }

            while (grid.firstChild) grid.removeChild(grid.firstChild);
            products.forEach(function(p) {
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
                grid.appendChild(a);
            });
            section.style.display = 'block';
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
            // Phone vazio/incompleto → manda '0' pra pegar só o ip_count.
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
                    _els.forEach(el => { el.textContent = ''; el.classList.remove('is-warn'); });   // limite: nao avisa na tela inicial; PIX so ao enviar a foto
                }
            } catch(_) { _els.forEach(el => { el.textContent = ''; el.classList.remove('is-warn'); }); }
        }
        phoneInput.addEventListener('input', () => {
            clearTimeout(_provasDebounce);
            _provasDebounce = setTimeout(_checkProvasRestantes, 600);
        });



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

        // ── Confirmação das orientações da foto (no clique em "Provar") ──
        var _guiaConfirmada = false;
        function abrirConfirmacaoGuia() {
            var el = document.getElementById('q-gconf');
            if (!el) { _guiaConfirmada = true; genBtn.click(); return; } // fallback: não trava
            el.classList.add('is-open');
        }
        function fecharConfirmacaoGuia() {
            var el = document.getElementById('q-gconf');
            if (el) el.classList.remove('is-open');
        }
        (function () {
            var yes = document.getElementById('q-gconf-yes');
            var no = document.getElementById('q-gconf-no');
            if (yes) yes.onclick = function () {
                _guiaConfirmada = true;
                fecharConfirmacaoGuia();
                genBtn.click();               // segue a geração
            };
            if (no) no.onclick = function () { // volta pra trocar a foto
                fecharConfirmacaoGuia();
                var frame = document.getElementById('q-face-frame');
                if (frame) { try { frame.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (_) {} }
            };
        })();

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

        // ── Recuperacao do pagamento ──────────────────────────────────────────
        // O PIX e pago NO APP DO BANCO: a aba do provador vai pra segundo plano
        // e o celular suspende o setInterval. Antes, se o cliente nao voltasse
        // pro modal ainda aberto, a prova paga nunca aparecia. Agora reconferimos
        // sempre que ele volta pra aba ou reabre o provador.
        let pixWatchId = null;

        function pixUnlock(payment_id, phone) {
            stopPixPolling();
            pixWatchId = null;
            try { if (phone) _pixClearPending(phone); } catch (_) {}
            pixPaymentId = payment_id;
            var _msg = document.getElementById('q-pix-status-msg');
            if (_msg) {
                _msg.textContent = 'Pagamento confirmado!';
                _msg.className = 'q-pix-status q-pix-approved';
            }
            setTimeout(function () {
                hidePixScreen();
                // Se a pagina recarregou, perdemos a foto da memoria. O credito
                // continua valendo no servidor, entao pedimos a foto de novo em
                // vez de deixar a tela muda (era isso que o cliente via).
                if (!userPhoto) {
                    try {
                        photoStep.style.display = 'flex';
                        var h = document.getElementById('q-validation-hint');
                        if (h) {
                            h.textContent = '\u2705 Pagamento confirmado! Envie sua foto para gerar a prova.';
                            h.classList.add('is-visible');
                        }
                    } catch (_) {}
                    return;
                }
                runGeneration();
            }, 1200);
        }

        async function pixCheck(payment_id, phone) {
            try {
                const sr = await fetch(WEBHOOK_PIX_STATUS + '?payment_id=' + payment_id);
                const st = await sr.json();
                if (st && st.status === 'approved') { pixUnlock(payment_id, phone); return true; }
            } catch (_) {}
            return false;
        }

        async function pixResume() {
            let id = pixWatchId, ph = null;
            if (!id) {
                try {
                    const raw = localStorage.getItem(_PIX_LS_KEY);
                    const arr = raw ? JSON.parse(raw) : [];
                    const now = Date.now();
                    const p = arr.filter(function (x) { return (now - x.ts) < _PIX_TTL_MS; })[0];
                    if (p) { id = p.payment_id; ph = p.phone; }
                } catch (_) {}
            }
            if (id) await pixCheck(id, ph);
        }

        // Volta do app do banco -> reconfere na hora.
        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'visible') pixResume();
        });
        window.addEventListener('focus', function () { pixResume(); });

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

        // ── Reaproveitamento de PIX pendente ──
        // Evita criar um novo QR a cada abertura do modal: se há PIX pendente do
        // mesmo telefone gerado há menos de 25min, reaproveita e continua polando.
        const _PIX_LS_KEY = 'pl_pix_pending_v1';
        const _PIX_TTL_MS = 25 * 60 * 1000; // 25 min (PIX MP expira em 30min)
        function _pixLoadPending(phone) {
            try {
                const raw = localStorage.getItem(_PIX_LS_KEY);
                if (!raw) return null;
                const arr = JSON.parse(raw);
                const now = Date.now();
                const valid = arr.filter(p => p.phone === phone && (now - p.ts) < _PIX_TTL_MS);
                return valid[0] || null;
            } catch(_) { return null; }
        }
        function _pixSavePending(phone, payment_id, qr_code, qr_code_base64) {
            try {
                const raw = localStorage.getItem(_PIX_LS_KEY);
                let arr = [];
                try { arr = raw ? JSON.parse(raw) : []; } catch(_) {}
                // Limpa expirados
                const now = Date.now();
                arr = arr.filter(p => (now - p.ts) < _PIX_TTL_MS && p.phone !== phone);
                arr.push({ phone, payment_id, qr_code, qr_code_base64, ts: now });
                localStorage.setItem(_PIX_LS_KEY, JSON.stringify(arr));
            } catch(_) {}
        }
        function _pixClearPending(phone) {
            try {
                const raw = localStorage.getItem(_PIX_LS_KEY);
                if (!raw) return;
                let arr = JSON.parse(raw);
                arr = arr.filter(p => p.phone !== phone);
                localStorage.setItem(_PIX_LS_KEY, JSON.stringify(arr));
            } catch(_) {}
        }

        async function createPixAndPoll() {
            /* PIX_DESATIVADO: prova extra via PIX removida - mostra so mensagem de volte amanha. */
            try {
                var _ph = document.getElementById('q-step-photo'); if (_ph) _ph.style.display = 'none';
                var _lb = document.getElementById('q-loading-box'); if (_lb) _lb.style.display = 'none';
                var _pix = document.getElementById('q-step-pix');
                if (_pix) { _pix.style.display = 'block'; _pix.innerHTML = '<h2>Limite de hoje atingido</h2><p class="q-pix-subtitle" style="text-align:center;">Voc&ecirc; j&aacute; usou suas provas de hoje.<br>Volte amanh&atilde; para experimentar mais pe&ccedil;as! &#128522;</p>'; }
            } catch (e) {}
            return;
            showPixScreen();
            const phone = '55' + phoneInput.value.replace(/\D/g, '');
            try {
                let pix;
                const pending = _pixLoadPending(phone);
                if (pending) {
                    // Reaproveita PIX pendente
                    pix = { payment_id: pending.payment_id, qr_code: pending.qr_code, qr_code_base64: pending.qr_code_base64 };
                } else {
                    const resp = await fetch(WEBHOOK_PIX, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: 'cliente@provoulevou.com.br', phone, loja: 'cacife', origin: location.origin })
                    });
                    pix = await resp.json();
                    if (!pix.payment_id || !pix.qr_code) throw new Error('PIX inválido');
                    _pixSavePending(phone, pix.payment_id, pix.qr_code, pix.qr_code_base64);
                }

                document.getElementById('q-pix-qr-img').src = 'data:image/png;base64,' + pix.qr_code_base64;
                document.getElementById('q-pix-code').value = pix.qr_code;

                // Polling a cada 3s ate o PIX expirar (30min), nao mais 5min.
                // O reforco de verdade e o pixResume() no visibilitychange.
                pixWatchId = pix.payment_id;
                let attempts = 0;
                pixPollingTimer = setInterval(function () {
                    attempts++;
                    if (attempts > 600) { stopPixPolling(); return; }
                    pixCheck(pix.payment_id, phone);
                }, 3000);
            } catch (e) {
                hidePixScreen();
                uploadStep.style.display = 'block';
                showError();
            }
        }

        // Botão copiar PIX
        document.getElementById('q-pix-copy-btn').onclick = () => {
            const code = document.getElementById('q-pix-code').value;
            navigator.clipboard.writeText(code).then(() => {
                document.getElementById('q-pix-copy-btn').textContent = 'Copiado!';
                setTimeout(() => { document.getElementById('q-pix-copy-btn').textContent = 'Copiar'; }, 2000);
            });
        };

        // Botão cancelar PIX
        document.getElementById('q-pix-cancel').onclick = () => {
            hidePixScreen();
            uploadStep.style.display = 'block';
        };

        // ── GERAÇÃO PRINCIPAL ──
        async function runGeneration() {

            if (runGeneration._busy) return;

            runGeneration._busy = true;

            try {
                const keyToUse = window.PROVOU_LEVOU_API_KEY;
                if (!keyToUse || keyToUse.includes("COLOQUE_A_CHAVE_AQUI")) {
                    showError();
                    return;
                }

                let prodImg = (userPickedPhoto && selectedProductImgUrl) || plVariantImage() || selectedProductImgUrl || (document.querySelector('meta[property="og:image"]')?.content || '');
                // Laço de Luxo: a IA de roupa usa UMA foto só. A 1ª da galeria costuma ser
                // de rua (modelo de lado, cabelo/braço/bolsa na frente) e o decote saía
                // errado. Sem escolha da cliente nem foto de variante, usa a de estúdio.
                if (!userPickedPhoto && !plVariantImage()) {
                    try { prodImg = (await plFotoEstudio([prodImg].concat(extractImages()))) || prodImg; } catch (e) {}
                }
                if (/cdn\.magazord\.com\.br/.test(prodImg)) prodImg = prodImg.split('?')[0];
                const prodName = plNomeProduto();

                uploadStep.style.display = 'none';
                document.getElementById('q-loading-box').style.display = 'flex';
                try { plEdCarregando(prodImg); } catch (_) {}
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
                    fd.append('product_type', /(cal[cç]a|legging|short|saia|bermuda)/i.test(prodName) ? 'bottom' : 'top');
                    fd.append('product_fit', 'regular');
                    fd.append('api_key', keyToUse);
                    // O gerador prioriza baixar a imagem de product_image_url. Mandamos a
                    // foto JA resolvida da variante escolhida, senao ele usa a 1a cor.
                    if (prodImg) fd.append('product_image_url', prodImg);
                    if (pixPaymentId) fd.append('pix_payment_id', pixPaymentId);

                    if ('top' === 'top') {
                        fd.append('height', '');
                        fd.append('weight', '');
                    } else {
                        fd.append('height', '');
                        fd.append('weight', '');
                        fd.append('cintura', '');
                        fd.append('quadril', '');
                    }

                    // Coleta até 4 fotos do produto: 1ª como binary (compat), 2ª-4ª como base64 text.
                    // 1ª = prodImg (escolhida pelo cliente ou default); demais = extractImages() exceto a 1ª.
                    let allProdImgs = [];
                    if (prodImg) allProdImgs.push(prodImg);
                    // Variante resolvida => manda SO a foto dela. A galeria tem as fotos
                    // das OUTRAS cores; mandar junto fazia o gerador usar a cor errada.
                    var _ehVariante = !!plVariantImage();
                    if (!_ehVariante) try {
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
                        if (!_ehVariante && _faceUrls && _faceUrls.length) {
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
                    allProdImgs = allProdImgs.slice(0, plLook ? 1 : 4);
                    console.log('[PL Arc Sunglasses] Enviando', allProdImgs.length, 'fotos do produto');
                    // O CDN da Magazord nao libera CORS: o navegador nao baixa as fotos. Vao os links,
                    // e o gerador baixa (product_image_url + product_image_url_2/3/4).
                    const _urls = allProdImgs.map(u => String(u).split('?')[0]).filter(Boolean);
                    _urls.slice(1).forEach((u, i) => fd.append('product_image_url_' + (i + 2), u));
                    const _primaryDone = _urls.length > 0;

                    // Look: 1 foto de cada peca, na ordem que o kit_json descreve. Se a peca 2 falhar, prova so a da pagina.
                    const _lkLink = document.getElementById('pl-look-link');
                    if (_lkLink) _lkLink.style.display = 'none';
                    if (plLook && _primaryDone) {
                        fd.append('product_image_url_2', String(plLook.img).split('?')[0]);
                        fd.append('kit_json', JSON.stringify([{ nome: prodName.trim(), imgs: 1 }, { nome: plLook.nome, imgs: 1 }]));
                        fd.set('product_name', prodName.trim() + ' + ' + plLook.nome);
                        if (_lkLink) { _lkLink.href = '/' + plLook.slug; _lkLink.textContent = 'Ver também: ' + plLook.nome; _lkLink.style.display = 'flex'; }
                    }

                    calculateFinalSize();

                    const res = await fetch(WEBHOOK_PROVA, { method: 'POST', body: fd });

                    const contentType = res.headers.get("content-type") || "";
                    if (contentType.includes("application/json")) {
                        const data = await res.json();
                        if (data.limited || data.error === 'limite_diario') {
                            try { document.getElementById('q-loading-box').style.display = 'none'; } catch (_) {}
                            createPixAndPoll();
                            return;
                        }
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
                        populateBuyCta();
                        if (typeof _checkProvasRestantes === 'function') _checkProvasRestantes();
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
        

            } finally {

                runGeneration._busy = false;

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
            // Confirmação das orientações (luz boa / corpo todo / com roupa):
            // abre o diálogo no clique em Provar. Foto ruim = prova ruim.
            if (!_guiaConfirmada) { abrirConfirmacaoGuia(); return; }
            _guiaConfirmada = false; // volta a pedir na próxima prova
            var _vHint = document.getElementById('q-validation-hint');
            if (_vHint) _vHint.classList.remove('is-visible');
            phoneInput.classList.remove('is-error');
            if (_vFaceFrame) _vFaceFrame.classList.remove('is-error');

            if (!userPhoto) return;
            const _gNums = (phoneInput.value || '').replace(/\D/g, '');
            const _gPhoneOk = (_gNums.length === 10 || _gNums.length === 11) && /^[1-9][1-9]/.test(_gNums) && (_gNums.length === 10 || _gNums[2] === '9');
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
                    body: JSON.stringify({ phone })
                });
                const data = await resp.json();
                if (data.limited) {
            try { document.getElementById('q-loading-box').style.display = 'none'; } catch (_) {}
                    genBtn.disabled = false;
                    createPixAndPoll();
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
    const isProductPage = window.location.pathname.includes('/products/') || window.location.pathname.includes('/product/') || window.location.pathname.includes('/produtos/') || window.location.pathname.includes('/produto/') || /\/p($|\/)/.test(window.location.pathname) || window.location.pathname.includes('preview.html') || document.querySelector('meta[property="og:type"][content="product"]');

    // Tray tambem navega sem reload em alguns temas, entao
    // o init() abaixo nunca rodaria (era preciso dar F5). Observamos a troca de
    // rota e montamos o provador assim que virar pagina de produto.
    var _plMontado = false;

    // ── Nome do produto (Tray/Day One) ────────────────────────────────────────
    // ⚠️ NÃO usar .product-name: nesse tema ela casa com os CARDS dos carrosséis
    // (produtos relacionados), então pegaria o produto errado. As fontes
    // confiáveis são o JSON-LD e o og:title da própria página.
    function plNomeProduto() {
        try {
            var lds = document.querySelectorAll('script[type="application/ld+json"]');
            for (var i = 0; i < lds.length; i++) {
                try {
                    var j = JSON.parse(lds[i].textContent);
                    var arr = Array.isArray(j) ? j : (j['@graph'] || [j]);
                    for (var k = 0; k < arr.length; k++) {
                        var it = arr[k];
                        if (it && it.name && (!it['@type'] || /product/i.test(String(it['@type'])))) {
                            return String(it.name).trim();
                        }
                    }
                } catch (_) {}
            }
        } catch (_) {}
        var og = (document.querySelector('meta[property="og:title"]') || {}).content || '';
        var t = (og || document.title || '').trim();
        return t.replace(/\s*[-–|]\s*(Loja\s+)?La[çc]o de Luxo\s*$/i, '').trim();
    }

    // Manequim 3D (pagina isolada no iframe): recomenda pela tabela de medidas da loja e marca o tamanho na pagina.
    function plTamanhosPagina() {
        return Array.from(document.querySelectorAll('.variacao-label')).filter(function (e) { return e.offsetParent !== null && /^(PP|P|M|G|GG|G[1-9])$/.test((e.textContent || '').trim()); });
    }
    function plAbreManequim() {
        var nomes = plTamanhosPagina().map(function (e) { return e.textContent.trim(); }).filter(function (v, i, a) { return a.indexOf(v) === i; });
        var f = document.createElement('iframe');
        f.id = 'pl-bn-manequim';
        f.title = 'Descobrir meu tamanho';
        f.src = 'https://provoulevou.com.br/lojas/beachnetty/manequim.html?tams=' + encodeURIComponent(nomes.join(','));
        f.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;border:0;z-index:2147483000;background:transparent;';
        f.setAttribute('allowtransparency', 'true');
        document.body.appendChild(f);
        document.documentElement.style.overflow = 'hidden';
    }
    window.addEventListener('message', function (ev) {
        if (ev.origin !== 'https://provoulevou.com.br' || !ev.data || !ev.data.plManequim) return;
        var f = document.getElementById('pl-bn-manequim');
        if (f) f.remove();
        document.documentElement.style.overflow = '';
        if (ev.data.tamanho) plAplicaTamanho(ev.data.tamanho);
    });
    // A loja exige escolher a cor antes do tamanho: sem cor, guarda o tamanho e marca assim que a cor for escolhida.
    var plTamPendente = '';
    function plAvisoTamanho(txt) {
        var box = document.getElementById('pl-bn-acoes');
        if (!box) return;
        var n = document.getElementById('pl-bn-rec');
        if (!n) { n = document.createElement('div'); n.id = 'pl-bn-rec'; n.style.cssText = 'grid-column:1/-1;font:600 13px Montserrat,sans-serif;color:#252525;'; box.appendChild(n); }
        n.textContent = txt;
    }
    function plAplicaTamanho(t) {
        var lista = document.querySelector('.variacao-lista-1');
        var bloco = lista || document.querySelector('.variacao-lista');
        if (lista && !lista.querySelector('li.selected')) {
            plTamPendente = t;
            plAvisoTamanho('Seu tamanho é ' + t + '. Agora escolha a cor.');
            lista.scrollIntoView({ block: 'center', behavior: 'smooth' });
            return;
        }
        plTamPendente = '';
        plAvisoTamanho('Tamanho recomendado para você: ' + t + '.');
        var el = plTamanhosPagina().filter(function (e) { return e.textContent.trim() === t; })[0];
        if (el) { (el.closest('li') || el).click(); (bloco || el).scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    }
    document.addEventListener('click', function (e) {
        if (!plTamPendente || !e.target.closest || !e.target.closest('.variacao-lista-1 li')) return;
        var t = plTamPendente;
        setTimeout(function () { plAplicaTamanho(t); }, 900);
    }, true);

    function plEhProduto() {
        // Beach Netty (Magazord): so a pagina de produto tem og:type "og:product". O JSON-LD
        // com @type Product tambem aparece nas categorias, entao nao serve aqui.
        return !!document.querySelector('meta[property="og:type"][content="og:product"]');
    }
    // Manequim: por enquanto so na legging validada (05/11/2026, Lucas). O provador vale para a loja toda.
    function plTemManequim() {
        return window.location.pathname === '/calca-legging-plus-size-cintura-alta-basica';
    }
    function plTentaMontar() {
        try {
            if (_plMontado) {
                // trocou de produto dentro da SPA: reposiciona o selo
                if (!document.getElementById('q-modal-ia')) { _plMontado = false; }
                else return;
            }
            if (!plEhProduto()) return;
            if (document.getElementById('q-modal-ia')) { _plMontado = true; return; }
            init();
            _plMontado = true;
        } catch (e) {}
    }
    // roda agora e continua vigiando (cobre SPA, lazy render e voltar/avancar)
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', plTentaMontar);
    else plTentaMontar();
    setInterval(plTentaMontar, 900);
    window.addEventListener('popstate', plTentaMontar);
    (function () {
        var _ps = history.pushState, _rs = history.replaceState;
        history.pushState = function () { var r = _ps.apply(this, arguments); setTimeout(plTentaMontar, 350); return r; };
        history.replaceState = function () { var r = _rs.apply(this, arguments); setTimeout(plTentaMontar, 350); return r; };
    })();

})();

;(function(){try{if(window.__plAdLoader)return;window.__plAdLoader=1;var s=document.createElement('script');s.src='https://lucasdecamargosilva.github.io/pl-loja-scripts/pl-antes-depois.js?v=1';s.async=true;(document.head||document.documentElement).appendChild(s);}catch(e){}})(); // PL: slider antes/depois

;(function(){var st=document.createElement('style');st.textContent="#pl-bn-acoes{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px}\n#pl-bn-acoes .q-btn-inline-provador{width:100%!important;height:50px!important;margin:0!important;padding:0 8px!important;background:transparent!important;color:#00a441!important;border:1px solid #00a441!important;border-radius:5px!important;font-family:Montserrat,sans-serif!important;font-size:13px!important;font-weight:700!important;letter-spacing:0!important;text-transform:uppercase!important;box-shadow:none!important;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px}\n#pl-bn-acoes .q-btn-inline-provador:hover{background:rgba(0,164,65,.08)!important;color:#00a441!important}\n#pl-bn-acoes .q-btn-inline-provador svg{stroke:#00a441!important}\n#pl-look-row{width:100%;text-align:left;margin-bottom:10px}\n#pl-look-sub{font:12px Montserrat,sans-serif;color:#666;margin:0 0 8px;text-align:center}\n#pl-look-list{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 6px;scrollbar-width:none}\n.pl-look-card{flex:0 0 84px;width:84px;padding:0;background:#fff;border:1px solid #e5e5e5;border-radius:6px;overflow:hidden;cursor:pointer;text-align:left}\n.pl-look-card.on{border:2px solid #00a441}\n.pl-look-card img{display:block;width:100%;height:112px;object-fit:cover;object-position:top}\n.pl-look-card span{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font:600 10px/1.25 Montserrat,sans-serif;color:#252525;margin:5px;padding:0}\n#pl-look-link{align-items:center;justify-content:center;text-align:center;min-height:44px;margin-top:8px;padding:8px 12px;border:1px solid #00a441;border-radius:5px;color:#00a441;font:700 12px Montserrat,sans-serif;text-decoration:none}\n";(document.head||document.documentElement).appendChild(st);})();
