(function () {
    // --- Configuração ---
    const WEBHOOK_PROVA = 'https://n8n.segredosdodrop.com/webhook/quantic-materialize';

    // --- Estilos Baseados na DIVINÉ ---
    const styles = `
        :root { 
            --q-primary: #000000; 
            --q-bg: #ffffff; 
            --q-border: #000000;
            --q-gray: #f5f5f5;
            --q-text: #000000;
            --q-text-light: #666666;
        }
        .q-btn-trigger-ia {
            position: absolute; top: 0; left: 50%; transform: translateX(-50%); z-index: 100;
            background: var(--q-bg); 
            color: var(--q-text); border: 1px solid var(--q-border); 
            padding: 5px 24px; font-family: 'Inter', sans-serif; 
            font-weight: 500; font-size: 9px; letter-spacing: 1px; cursor: pointer; display: flex; 
            align-items: center; justify-content: center; gap: 6px; text-transform: uppercase;
            transition: 0.3s ease;
            white-space: nowrap;
        }
        .q-btn-trigger-ia i { font-size: 14px; }
        .q-btn-trigger-ia:hover {
            background: var(--q-primary);
            color: var(--q-bg);
        }
        #q-modal-ia { 
            display: none; position: fixed; inset: 0; background: rgba(255,255,255,0.98); 
            z-index: 999999; align-items: center; justify-content: center; font-family: 'Inter', sans-serif; 
        }
        .q-card-ia { 
            background: var(--q-bg); width: 100%; max-width: 480px; 
            padding: 0; position: relative; color: var(--q-text); 
            border: 1px solid var(--q-border); 
            max-height: 94vh; display: flex; flex-direction: column; overflow: hidden;
        }
        .q-content-scroll { padding: 40px 30px; overflow-y: auto; flex: 1; text-align: center; }
        .q-close-ia { position: absolute; top: 20px; right: 20px; background: none; border: none; color: var(--q-text); cursor: pointer; font-size: 24px; z-index: 100; font-weight: 300; }
        .q-tips-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 20px 0; margin: 20px 0; border-top: 1px solid var(--q-gray); border-bottom: 1px solid var(--q-gray); }
        .q-tip-item { display: flex; flex-direction: column; align-items: center; gap: 8px; font-size: 9px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--q-text-light); }
        .q-tip-item i { color: var(--q-primary); font-size: 20px; }
        .q-lead-form { margin: 30px 0 20px; display: flex; flex-direction: column; gap: 20px; text-align: left; }
        .q-input-row { display: flex; gap: 15px; }
        .q-group { flex: 1; }
        .q-group label { display: block; font-size: 9px; font-weight: 600; letter-spacing: 1.5px; color: var(--q-text); margin-bottom: 8px; text-transform: uppercase; }
        .q-input { width: 100%; padding: 15px; border: 1px solid var(--q-border); font-size: 13px; font-family: 'Inter', sans-serif; background: transparent; color: var(--q-text); outline: none; box-sizing: border-box; }
        .q-input:focus { border-width: 2px; padding: 14px; }
        .q-btn-black { background: var(--q-primary); color: var(--q-bg); border: 1px solid var(--q-primary); width: 100%; padding: 18px; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; margin-top: 20px; transition: 0.3s; }
        .q-btn-black:disabled { background: var(--q-gray); color: #999; border-color: var(--q-gray); cursor: not-allowed; }
        .q-btn-black:not(:disabled):hover { background: var(--q-bg); color: var(--q-primary); }
        .q-btn-buy { background: var(--q-primary); color: var(--q-bg); border: 1px solid var(--q-primary); width: 100%; padding: 20px; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; margin-bottom: 15px; transition: 0.3s; }
        .q-btn-buy:hover { background: var(--q-bg); color: var(--q-primary); }
        .q-btn-outline { background: var(--q-bg); color: var(--q-primary); border: 1px solid var(--q-border); width: 100%; padding: 18px; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; transition: 0.3s; }
        .q-btn-outline:hover { background: var(--q-primary); color: var(--q-bg); }
        .q-powered-footer { background: var(--q-bg); padding: 20px; display: flex; align-items: center; justify-content: center; gap: 10px; flex-shrink: 0; border-top: 1px solid var(--q-gray); }
        .q-quantic-logo { height: 12px; filter: brightness(0); }
        .q-loader-ui { display:none; padding: 60px 0; }
        .q-status-msg { display:none; font-size: 10px; letter-spacing: 1px; color: #ef4444; margin-top: 8px; font-weight: 600; text-align: left; text-transform: uppercase; }
        @keyframes q-slide { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
        @keyframes q-pulse-text { 0%, 100% { opacity: 0.4; transform: scale(0.98); } 50% { opacity: 1; transform: scale(1); } }
        
        /* Oculta scrollbar */
        .q-content-scroll::-webkit-scrollbar { width: 4px; }
        .q-content-scroll::-webkit-scrollbar-track { background: transparent; }
        .q-content-scroll::-webkit-scrollbar-thumb { background: #e5e5e5; }
    `;

    const html = `
        <div id="q-modal-ia">
            <div class="q-card-ia">
                <button type="button" class="q-close-ia" id="q-close-btn">&times;</button>
                <div class="q-content-scroll">
                    <div id="q-header-provador">
                        <h1 style="margin:0 0 10px 0; font-size:20px; font-weight:700; letter-spacing:2px; text-transform:uppercase;">Provador Virtual</h1>
                        <p style="margin:0; font-size:11px; color:var(--q-text-light); letter-spacing:1px; text-transform:uppercase;">DIVINÉ</p>
                    </div>
                    
                    <div id="q-step-upload">
                        <div class="q-lead-form">
                            <div class="q-group">
                                <label>Seu WhatsApp</label>
                                <input type="tel" id="q-phone" class="q-input" placeholder="(11) 99999-9999" maxlength="15">
                                <div id="q-phone-error" class="q-status-msg">Insira um número válido</div>
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
                        
                        <p style="margin: 30px 0 10px; font-size: 10px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--q-text-light); text-align: center;">Sua foto deve seguir estes requisitos:</p>
                        <div class="q-tips-grid" style="margin-top: 0;">
                            <div class="q-tip-item"><i class="ph ph-t-shirt"></i><span>Com Roupa</span></div>
                            <div class="q-tip-item"><i class="ph ph-person"></i><span>Corpo Inteiro</span></div>
                            <div class="q-tip-item"><i class="ph ph-sun"></i><span>Boa Luz</span></div>
                        </div>
                        
                        <div style="display: flex; gap: 20px; justify-content: center; margin-top: 30px;">
                            <div id="q-trigger-upload" style="width:120px; height:160px; border:1px solid var(--q-border); display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; background:var(--q-gray); transition:0.3s;">
                                <i class="ph ph-camera-plus" style="font-size:32px; color:var(--q-primary); margin-bottom: 10px;"></i>
                                <span style="font-size: 9px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">Enviar Foto</span>
                                <input type="file" id="q-real-input" accept="image/*" style="display:none">
                            </div>
                            <div id="q-pre-view" style="display:none; width:120px; height:160px; overflow:hidden; border:1px solid var(--q-border);">
                                <img id="q-pre-img" style="width:100%; height:100%; object-fit:cover;">
                            </div>
                        </div>
                        
                        <button class="q-btn-black" id="q-btn-generate" disabled>Ver no meu corpo</button>
                    </div>

                    <div class="q-loader-ui" id="q-loading-box">
                        <div style="font-weight:600; font-size:12px; letter-spacing:3px; text-transform:uppercase; margin-bottom:20px; animation: q-pulse-text 1.5s infinite ease-in-out;">Processando Imagem...</div>
                        <div style="height:1px; background:var(--q-gray); width:100%; position:relative; overflow:hidden;">
                            <div style="position:absolute; top:0; left:0; height:100%; width:30%; background:var(--q-primary); animation: q-slide 1.5s infinite linear;"></div>
                        </div>
                    </div>

                    <div id="q-step-result" style="display:none; flex-direction:column; align-items:center;">
                        <div style="width:100%; border:1px solid var(--q-border); margin-bottom:30px; background:var(--q-gray);">
                            <img id="q-final-view-img" style="width:100%; height:auto; display:block;">
                        </div>
                        
                        <div style="border-top:1px solid var(--q-border); border-bottom:1px solid var(--q-border); padding:20px 0; width:100%; margin-bottom:30px; display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:10px; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:var(--q-text-light);">Tamanho Ideal</span>
                            <div id="q-res-letter" style="font-size:24px; font-weight:400; font-family:monospace; line-height:1;">M</div>
                        </div>
                        
                        <button class="q-btn-buy" id="q-add-to-cart-btn">Adicionar ao Carrinho</button>
                        <button class="q-btn-outline" id="q-btn-back">Voltar</button>
                        <p style="margin-top:30px; font-size:10px; font-weight:600; letter-spacing:1px; text-transform:uppercase; color:var(--q-text-light); cursor:pointer; text-decoration:underline; text-underline-offset:4px;" id="q-retry-btn">Tentar outra foto</p>
                    </div>
                </div>
                
                <div class="q-powered-footer">
                    <span style="font-size:9px; letter-spacing:1px; text-transform:uppercase; color:var(--q-text-light);">Powered by</span>
                    <img src="https://i.ibb.co/23hMHTRt/logo-quantic-na-melhor-qualidade.png" class="q-quantic-logo">
                </div>
            </div>
        </div>
    `;

    function init() {
        if (!document.getElementById('q-inter-font')) {
            const fontLink = document.createElement('link');
            fontLink.id = 'q-inter-font';
            fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
            fontLink.rel = 'stylesheet';
            document.head.appendChild(fontLink);
        }
        if (!window.phosphorIconsLoaded) {
            const phosphorScript = document.createElement('script');
            phosphorScript.src = 'https://unpkg.com/@phosphor-icons/web';
            document.head.appendChild(phosphorScript);
            window.phosphorIconsLoaded = true;
        }

        const styleTag = document.createElement('style');
        styleTag.innerHTML = styles;
        document.head.appendChild(styleTag);

        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = html;
        document.body.appendChild(modalContainer);

        const modal = document.getElementById('q-modal-ia');
        const openBtn = document.createElement('button');
        openBtn.className = 'q-btn-trigger-ia';
        openBtn.id = 'q-open-ia';
        openBtn.innerHTML = '<i class="ph ph-user"></i><span>Provador Virtual</span>';

        // Shopify / DIVINÉ Selectors Expandidos
        const imgContainers = [
            '.product__media-wrapper',
            '.product-gallery__media',
            '.product__media',
            '.grid__item.product__media-wrapper',
            '.product-image-main',
            '.product-media-container',
            '[data-media-id]',
            '.product__media-item',
            '.product-gallery',
            '.product-image-container',
            '.product-single__media',
            '.media-gallery'
        ];

        let foundContainer = false;
        for (const selector of imgContainers) {
            const container = document.querySelector(selector);
            if (container) {
                // Ensure container captures child absolute positioning
                if (window.getComputedStyle(container).position === 'static') {
                    container.style.position = 'relative';
                }
                container.appendChild(openBtn);

                // Centraliza o botão colado na margem superior da imagem
                openBtn.style.position = 'absolute';
                openBtn.style.top = '0px';
                openBtn.style.left = '50%';
                openBtn.style.transform = 'translateX(-50%)';
                openBtn.style.margin = '0';
                openBtn.style.bottom = 'auto';
                openBtn.style.right = 'auto';

                foundContainer = true;
                break;
            }
        }

        if (!foundContainer) {
            openBtn.style.position = 'fixed';
            openBtn.style.bottom = '30px';
            openBtn.style.left = '50%';
            openBtn.style.transform = 'translateX(-50%)';
            openBtn.style.top = 'auto';
            openBtn.style.right = 'auto';
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

        openBtn.onclick = () => {
            genBtn.style.display = 'block';
            modal.style.display = 'flex';
        };

        closeBtn.onclick = () => modal.style.display = 'none';
        backBtn.onclick = () => modal.style.display = 'none';
        retryBtn.onclick = () => {
            document.getElementById('q-step-result').style.display = 'none';
            document.getElementById('q-step-upload').style.display = 'block';
            userPhoto = null;
            document.getElementById('q-pre-view').style.display = 'none';
            checkFields();
        };
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
                phoneInput.style.borderColor = 'var(--q-border)';
            }

            const allFilled = document.getElementById('q-h-val').value.length > 0 &&
                document.getElementById('q-w-val').value.length > 0 &&
                userPhoto && isPhoneValid;
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
            const h = document.getElementById('q-h-val').value;
            const w = document.getElementById('q-w-val').value;

            const prodImgTag = document.querySelector('.product__media img, img.product-featured-media, .product-single__photo');
            const prodImg = prodImgTag ? prodImgTag.src : (document.querySelector('meta[property="og:image"]')?.content || '');
            const prodName = document.querySelector('h1.product__title, .product-single__title, h1')?.innerText || document.title;

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
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    calculateFinalSize(h, w, prodName);
                    document.getElementById('q-loading-box').style.display = 'none';
                    document.getElementById('q-final-view-img').src = url;
                    document.getElementById('q-step-result').style.display = 'flex';
                } else {
                    throw new Error('Falha na requisição');
                }
            } catch (e) { alert("Ocorreu um erro ao processar sua imagem. Tente novamente."); location.reload(); }
        };

        function calculateFinalSize(h, w, name) {
            let hInt = parseFloat(h.toString().replace(',', '.'));
            let wInt = parseFloat(w.toString().replace(',', '.'));
            if (hInt < 3) hInt = hInt * 100;
            name = name.toLowerCase();

            // Lógica genérica baseada numeração de alfaiataria (comum na Divine) vs tamanhos em letras
            let size = "40/P";
            if (wInt < 60) size = "36/XXP";
            else if (wInt < 68) size = "38/XP";
            else if (wInt < 76) size = "40/P";
            else if (wInt < 84) size = "42/M";
            else if (wInt < 92) size = "44/G";
            else if (wInt < 100) size = "46/XG";
            else size = "48/XXG";

            recommendedSize = size;
            document.getElementById('q-res-letter').innerText = size;
        }

        buyBtn.onclick = function () {
            this.innerHTML = "Processando...";
            this.disabled = true;

            // Integração simples com o botão nativo do Shopify
            const shopifyFormBtn = document.querySelector('form[action^="/cart/add"] button[type="submit"], form[action^="/cart/add"] input[type="submit"], .product-form__cart-submit');

            if (shopifyFormBtn) {
                modal.style.display = 'none';
                shopifyFormBtn.click();
            } else {
                alert("Selecione o tamanho " + recommendedSize);
                modal.style.display = 'none';
            }

            this.innerHTML = `Adicionar ao Carrinho`;
            this.disabled = false;
        };
    }

    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();
