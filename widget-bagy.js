(function () {
    // --- Configuração ---
    const WEBHOOK_PROVA = 'https://n8n.segredosdodrop.com/webhook/quantic-materialize';
    const WEBHOOK_CARRINHO = 'https://n8n.segredosdodrop.com/webhook/adicionou-carrinho-calmo';

    // --- Estilos ---
    const styles = `
        :root { --q-quantic: #8b5cf6; --q-quantic-dark: #7c3aed; }
        .q-btn-trigger-ia {
            position: absolute; top: 15px; right: 20px; z-index: 100; 
            background: linear-gradient(135deg, var(--q-quantic) 0%, var(--q-quantic-dark) 100%); 
            color: #ffffff; border: 2px solid rgba(255,255,255,0.3); 
            padding: 8px 18px; border-radius: 50px; font-family: 'Outfit', sans-serif; 
            font-weight: 800; font-size: 12px; cursor: pointer; display: flex; 
            align-items: center; gap: 8px; box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4); 
            transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); overflow: hidden;
            line-height: 1;
        }
        .q-btn-trigger-ia i { font-size: 16px; }
        .q-btn-trigger-ia:hover {
            transform: scale(1.05) translateY(-1px);
            box-shadow: 0 12px 25px rgba(139, 92, 246, 0.6);
        }
        .q-btn-trigger-ia::after {
            content: ''; position: absolute; top: -50%; left: -60%; width: 20%; height: 200%;
            background: rgba(255, 255, 255, 0.4); transform: rotate(30deg);
            animation: q-shimmer 3.5s infinite;
        }
        .q-animate-attention { animation: q-button-pulse 2.5s infinite; }
        @keyframes q-button-pulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.6); }
            70% { transform: scale(1.03); box-shadow: 0 0 0 10px rgba(139, 92, 246, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
        }
        @keyframes q-shimmer {
            0% { left: -60%; }
            15% { left: 120%; }
            100% { left: 120%; }
        }
        #q-modal-ia { 
            display: none; position: fixed; inset: 0; background: rgba(255,255,255,0.96); 
            backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); 
            z-index: 999999; align-items: center; justify-content: center; font-family: 'Outfit', sans-serif; 
        }
        .q-card-ia { 
            background: #ffffff; width: 93%; max-width: 440px; border-radius: 32px; 
            padding: 0; position: relative; color: #000; 
            border: 1px solid #f1f5f9; box-shadow: 0 25px 60px rgba(0,0,0,0.12); 
            max-height: 94vh; display: flex; flex-direction: column; overflow: hidden;
        }
        .q-content-scroll { padding: 25px 20px; overflow-y: auto; flex: 1; text-align: center; }
        .q-close-ia { position: absolute; top: 15px; right: 15px; background: none; border: none; color: #cbd5e1; cursor: pointer; font-size: 30px; z-index: 100; }
        .q-tips-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: #f8fafc; padding: 15px; border-radius: 20px; margin: 15px 0; }
        .q-tip-item { display: flex; flex-direction: column; align-items: center; gap: 5px; font-size: 9px; font-weight: 700; text-transform: uppercase; color: #475569; }
        .q-tip-item i { color: var(--q-quantic); font-size: 24px; }
        .q-lead-form { margin: 20px 0; display: flex; flex-direction: column; gap: 12px; text-align: left; }
        .q-input-row { display: flex; gap: 10px; }
        .q-group label { display: block; font-size: 10px; font-weight: 800; color: #64748b; margin-bottom: 5px; text-transform: uppercase; }
        .q-input { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 15px; font-family: 'Outfit'; font-weight: 600; }
        .q-btn-black { background: #000; color: #fff; border: none; width: 100%; padding: 18px; border-radius: 16px; font-weight: 700; font-size: 16px; cursor: pointer; margin-top: 10px; transition: 0.3s; }
        .q-btn-black:disabled { background: #cbd5e1; cursor: not-allowed; }
        .q-btn-buy { background: #10b981; color: #fff; border: none; width: 100%; padding: 18px; border-radius: 16px; font-weight: 800; font-size: 16px; cursor: pointer; margin-bottom: 10px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); }
        .q-btn-outline { background: #fff; color: #000; border: 1px solid #e2e8f0; width: 100%; padding: 18px; border-radius: 16px; font-weight: 700; font-size: 16px; cursor: pointer; }
        .q-powered-footer { background: #000; padding: 15px; display: flex; align-items: center; justify-content: center; gap: 10px; flex-shrink: 0; }
        .q-quantic-logo { height: 14px; filter: brightness(0) invert(1); }
        .q-loader-ui { display:none; padding: 40px 0; }
        .q-status-msg { display:none; font-size: 11px; color: #ef4444; margin-top: 5px; font-weight: 600; text-align: center; padding: 10px; border-radius: 8px; background: rgba(239, 68, 68, 0.1); }
        @keyframes q-slide { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
    `;

    const html = `
        <div id="q-modal-ia">
            <div class="q-card-ia">
                <button type="button" class="q-close-ia" id="q-close-btn">&times;</button>
                <div class="q-content-scroll">
                    <div id="q-header-provador">
                        <h1 style="margin:0 0 20px 0; font-size:24px; font-weight:800; letter-spacing:-0.5px">Provador Virtual Calmô ✨</h1>
                    </div>
                    <div id="q-step-upload">
                        <div class="q-lead-form">
                            <div class="q-group">
                                <label>Seu WhatsApp (Obrigatório)</label>
                                <input type="tel" id="q-phone" class="q-input" placeholder="(11) 99999-9999" maxlength="15">
                                <div id="q-phone-error" class="q-status-msg">Por favor, insira um celular válido.</div>
                            </div>
                            <div class="q-input-row">
                                <div class="q-group">
                                    <label>Altura (cm)</label>
                                    <input type="text" id="q-h-val" class="q-input" placeholder="Ex: 175">
                                </div>
                                <div class="q-group">
                                    <label>Peso (kg)</label>
                                    <input type="text" id="q-w-val" class="q-input" placeholder="Ex: 80">
                                </div>
                            </div>
                        </div>
                        <p style="font-weight: 700; font-size: 14px; color: #475569; margin: 25px 0 10px; text-align: center;">Sua foto deve seguir os seguintes requisitos:</p>
                        <div class="q-tips-grid">
                            <div class="q-tip-item"><i class="ph-bold ph-t-shirt"></i> Com roupa</div>
                            <div class="q-tip-item"><i class="ph-bold ph-hand-pointing"></i> Braços soltos</div>
                            <div class="q-tip-item"><i class="ph-bold ph-sun"></i> Boa luz</div>
                        </div>
                        <div style="display: flex; gap: 12px; justify-content: center; margin-bottom: 25px; margin-top: 20px;">
                            <div id="q-trigger-upload" style="width:100px; height:100px; border:2px dashed #e2e8f0; border-radius:20px; display:flex; align-items:center; justify-content:center; cursor:pointer; background:#fff;">
                                <i class="ph-bold ph-camera-plus" style="font-size:24px; color:var(--q-quantic)"></i>
                                <input type="file" id="q-real-input" accept="image/*" style="display:none">
                            </div>
                            <div id="q-pre-view" style="display:none; width:100px; height:100px; border-radius:20px; overflow:hidden; border:1px solid #f1f5f9;">
                                <img id="q-pre-img" style="width:100%; height:100%; object-fit:cover;">
                            </div>
                        </div>
                        <div id="q-limit-msg" class="q-status-msg" style="margin-bottom: 15px;">Você atingiu o limite de 2 testes por dia. Volte amanhã!</div>
                        <button class="q-btn-black" id="q-btn-generate" disabled>MATERIALIZAR LOOK</button>
                    </div>
                    <div class="q-loader-ui" id="q-loading-box">
                        <div style="font-weight:800; font-size:18px;">CONECTANDO IA CALMÔ...</div>
                        <div style="height:4px; background:#f1f5f9; border-radius:10px; overflow:hidden; margin-top:15px;"><div style="width:100%; height:100%; background:#000; animation: q-slide 1.5s infinite linear;"></div></div>
                    </div>
                    <div id="q-step-result" style="display:none; flex-direction:column; align-items:center;">
                        <div style="width:100%; border-radius:24px; overflow:hidden; border:1px solid #f1f5f9; margin-bottom:20px;">
                            <img id="q-final-view-img" style="width:100%; height:auto; display:block;">
                        </div>
                        <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:15px; border-radius:18px; width:100%; margin-bottom:15px;">
                            <span style="font-size:10px; font-weight:800; color:#166534; letter-spacing:1px;">TAMANHO IDEAL PARA VOCÊ:</span>
                            <div id="q-res-letter" style="font-size:32px; font-weight:900; color:#15803d; line-height:1;">M</div>
                        </div>
                        <button class="q-btn-buy" id="q-add-to-cart-btn">🛒 COMPRAR TAMANHO <span id="q-btn-size-text">M</span></button>
                        <button class="q-btn-outline" id="q-btn-back">VOLTAR AO PRODUTO</button>
                        <p style="margin-top:20px; font-size:12px; color:#94a3b8; cursor:pointer;" id="q-retry-btn">Tentar outra foto</p>
                    </div>
                </div>
                <div class="q-powered-footer">
                    <span style="font-size:11px; color:#94a3b8;">powered by</span>
                    <img src="https://i.ibb.co/23hMHTRt/logo-quantic-na-melhor-qualidade.png" class="q-quantic-logo">
                </div>
            </div>
        </div>
    `;

    function init() {
        // Injetar Fontes e Ícones
        if (!document.getElementById('q-outfit-font')) {
            const fontLink = document.createElement('link');
            fontLink.id = 'q-outfit-font';
            fontLink.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap';
            fontLink.rel = 'stylesheet';
            document.head.appendChild(fontLink);
        }
        if (!window.phosphorIconsLoaded) {
            const phosphorScript = document.createElement('script');
            phosphorScript.src = 'https://unpkg.com/@phosphor-icons/web';
            document.head.appendChild(phosphorScript);
            window.phosphorIconsLoaded = true;
        }

        // Injetar CSS
        const styleTag = document.createElement('style');
        styleTag.innerHTML = styles;
        document.head.appendChild(styleTag);

        // Injetar HTML
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = html;
        document.body.appendChild(modalContainer);

        // --- Lógica Principal ---
        const modal = document.getElementById('q-modal-ia');
        const openBtn = document.createElement('button');
        openBtn.className = 'q-btn-trigger-ia q-animate-attention';
        openBtn.id = 'q-open-ia';
        openBtn.innerHTML = '<i class="ph-fill ph-magic-wand"></i><span>Provar em Mim ✨</span>';

        // Tentar injetar o botão na imagem do produto (Bagy)
        // Seletores comuns da Bagy para imagem do produto: .produto-imagem, .product-images, .js-product-image
        const imgContainer = document.querySelector('.produto-imagem, .product-images, .js-product-image, .image-container');
        if (imgContainer) {
            imgContainer.style.position = 'relative';
            imgContainer.appendChild(openBtn);
        } else {
            // Fallback: Fixar no canto inferior se não achar a imagem
            openBtn.style.position = 'fixed';
            openBtn.style.bottom = '20px';
            openBtn.style.right = '20px';
            document.body.appendChild(openBtn);
        }

        const genBtn = document.getElementById('q-btn-generate');
        const buyBtn = document.getElementById('q-add-to-cart-btn');
        const closeBtn = document.getElementById('q-close-btn');
        const backBtn = document.getElementById('q-btn-back');
        const retryBtn = document.getElementById('q-retry-btn');
        const realInput = document.getElementById('q-real-input');
        const triggerUpload = document.getElementById('q-trigger-upload');
        const phoneInput = document.getElementById('q-phone');

        let userPhoto = null;
        let recommendedSize = "M";

        function getDailyUsage() {
            const today = new Date().toLocaleDateString();
            let usage = JSON.parse(localStorage.getItem('calmo_provador_usage')) || { count: 0, date: today };
            if (usage.date !== today) { usage = { count: 0, date: today }; }
            return usage;
        }

        function saveDailyUsage(usage) {
            localStorage.setItem('calmo_provador_usage', JSON.stringify(usage));
        }

        openBtn.onclick = () => {
            const usage = getDailyUsage();
            const limitMsg = document.getElementById('q-limit-msg');
            if (usage.count >= 2) {
                limitMsg.style.display = 'block';
                genBtn.style.display = 'none';
            } else {
                limitMsg.style.display = 'none';
                genBtn.style.display = 'block';
            }
            modal.style.display = 'flex';
        };

        closeBtn.onclick = () => modal.style.display = 'none';
        backBtn.onclick = () => modal.style.display = 'none';
        retryBtn.onclick = () => location.reload();
        triggerUpload.onclick = () => realInput.click();

        phoneInput.addEventListener('input', function (e) {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
            e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
            checkFields();
        });

        const checkFields = () => {
            const phoneNumbers = phoneInput.value.replace(/\D/g, '');
            const isPhoneValid = phoneNumbers.length >= 10 && phoneNumbers.length <= 11;
            const phoneError = document.getElementById('q-phone-error');

            if (phoneInput.value.length > 0 && !isPhoneValid) {
                phoneError.style.display = 'block';
                phoneInput.style.borderColor = '#ef4444';
            } else {
                phoneError.style.display = 'none';
                phoneInput.style.borderColor = '#e2e8f0';
            }

            const usage = getDailyUsage();
            const allFilled = document.getElementById('q-h-val').value.length > 0 &&
                document.getElementById('q-w-val').value.length > 0 &&
                userPhoto && isPhoneValid && usage.count < 2;
            genBtn.disabled = !allFilled;
        };

        ['q-h-val', 'q-w-val'].forEach(id => document.getElementById(id).addEventListener('input', checkFields));

        realInput.onchange = (e) => {
            userPhoto = e.target.files[0];
            if (userPhoto) {
                const rd = new FileReader();
                rd.onload = (ev) => {
                    document.getElementById('q-pre-img').src = ev.target.result;
                    document.getElementById('q-pre-view').style.display = 'block';
                    checkFields();
                };
                rd.readAsDataURL(userPhoto);
            }
        };

        genBtn.onclick = async () => {
            const usage = getDailyUsage();
            if (usage.count >= 2) return;

            const h = document.getElementById('q-h-val').value;
            const w = document.getElementById('q-w-val').value;

            // Tentar capturar imagem do produto e nome na Bagy
            const prodImgTag = document.querySelector('.produto-imagem img, .product-images img, .js-product-image img');
            const prodImg = prodImgTag ? prodImgTag.src : (document.querySelector('meta[property="og:image"]')?.content || '');
            const prodName = document.querySelector('.produto-nome, .product-name, h1')?.innerText || document.title;

            document.getElementById('q-step-upload').style.display = 'none';
            document.getElementById('q-loading-box').style.display = 'block';

            try {
                const phoneVal = phoneInput.value.replace(/\D/g, '');
                const fd = new FormData();
                fd.append('person_image', userPhoto);
                fd.append('whatsapp', '55' + phoneVal);
                fd.append('phone_raw', phoneInput.value);
                fd.append('height', h);
                fd.append('weight', w);
                fd.append('product_name', prodName);

                if (prodImg) {
                    const b = await fetch(prodImg).then(r => r.blob());
                    fd.append('product_image', b, 'p.png');
                }

                const res = await fetch(WEBHOOK_PROVA, { method: 'POST', body: fd });
                if (res.ok) {
                    usage.count += 1;
                    saveDailyUsage(usage);
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    calculateFinalSize(h, w, prodName);
                    document.getElementById('q-loading-box').style.display = 'none';
                    document.getElementById('q-final-view-img').src = url;
                    document.getElementById('q-step-result').style.display = 'flex';
                }
            } catch (e) { alert("Ops! Tente novamente."); location.reload(); }
        };

        function calculateFinalSize(h, w, name) {
            let hInt = parseFloat(h.toString().replace(',', '.'));
            let wInt = parseFloat(w.toString().replace(',', '.'));
            if (hInt < 3) hInt = hInt * 100;
            name = name.toLowerCase();
            let size = "M";

            if (name.includes("oversized")) {
                let sH = hInt < 178 ? 1 : hInt < 190 ? 2 : hInt < 196 ? 3 : 4;
                let sW = wInt < 78 ? 1 : wInt < 90 ? 2 : wInt < 102 ? 3 : 4;
                size = ["P", "M", "G", "GG"][Math.max(sH, sW) - 1];
            } else if (name.includes("cargo") || name.includes("jeans")) {
                let sH = hInt < 174 ? 1 : hInt < 184 ? 2 : hInt < 192 ? 3 : 4;
                let sW = wInt < 75 ? 1 : wInt < 86 ? 2 : wInt < 96 ? 3 : 4;
                size = ["P", "M", "G", "GG"][Math.max(sH, sW) - 1];
            } else if (name.includes("slim")) {
                let sH = hInt < 182 ? 1 : hInt < 192 ? 2 : hInt < 198 ? 3 : 4;
                let sW = wInt < 82 ? 1 : wInt < 92 ? 2 : wInt < 100 ? 3 : 4;
                size = ["P", "M", "G", "GG"][Math.max(sH, sW) - 1];
            } else if (name.includes("balão") || name.includes("balao")) {
                size = (wInt < 65 ? 38 : wInt < 72 ? 40 : wInt < 82 ? 42 : wInt < 90 ? 44 : wInt < 98 ? 46 : 48).toString();
            }
            recommendedSize = size;
            document.getElementById('q-res-letter').innerText = size;
            document.getElementById('q-btn-size-text').innerText = size;
        }

        buyBtn.onclick = function () {
            const phoneVal = phoneInput.value.replace(/\D/g, '');
            const prodName = document.title;

            fetch(WEBHOOK_CARRINHO, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    whatsapp: '55' + phoneVal,
                    phone_raw: phoneInput.value,
                    product: prodName,
                    event: 'adicionou_ao_carrinho',
                    recommended_size: recommendedSize
                })
            }).catch(e => console.error('Erro no rastreio:', e));

            this.innerHTML = "ADICIONANDO...";
            this.disabled = true;

            // Bagy: Tentar selecionar variante e clicar no botão comprar
            // Isso requer mapear como a Bagy lida com variantes no DOM
            alert("Selecione o tamanho " + recommendedSize + " e finalize sua compra!");
            modal.style.display = 'none';
            this.innerHTML = `🛒 COMPRAR TAMANHO ${recommendedSize}`;
            this.disabled = false;
        };
    }

    // Aguardar o carregamento do DOM
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();
