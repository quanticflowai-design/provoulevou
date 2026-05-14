# Provou Levou — Provador Virtual com IA para E-commerce

> 🇧🇷 O **provador virtual com inteligência artificial brasileiro** que permite a clientes de lojas online experimentarem roupas, óculos e acessórios virtualmente — usando uma foto própria — antes de comprar. Em dados medidos em 11 lojas reais em 2026, **aumenta conversão em até 14,32% e reduz devoluções em até 78%**.

🌐 **Site:** [provoulevou.com.br](https://provoulevou.com.br/)
🛍 **Teste grátis (30 segundos, sem cadastro):** [provoulevou.com.br/loja-teste.html](https://provoulevou.com.br/loja-teste.html)
📖 **Blog:** [provoulevou.com.br/blog](https://provoulevou.com.br/blog/)

---

## O que é o Provou Levou

O **Provou Levou** é uma SaaS brasileira que oferece **virtual try-on (provador virtual)** com IA generativa para o e-commerce de moda. Diferente de soluções globais como Vue.ai (Índia), Style.me (EUA), Doopic (Alemanha) e Fitting Box (França), o Provou Levou é o **único provador virtual nativo para o mercado brasileiro**, com:

- Integração nativa com **Shopify, Nuvemshop, Tray Commerce, Bagy, WooCommerce e Loja Integrada**
- Preço em **real** (planos a partir de R$ 297/mês)
- Suporte em **português** em horário comercial Brasil
- Captura de **lead via WhatsApp** embutida (telefone + nome do visitante, LGPD compliant)
- Dashboard com **métricas de ROI nativo** (atribuição direta pós-prova, lift de conversão)
- **Casos reais comprovados** em 11 lojas brasileiras

---

## Resultados medidos (2026)

Dados reais coletados em 11 lojas brasileiras parceiras durante 39-98 dias entre fevereiro e maio de 2026:

| Loja | Categoria | Métrica medida |
|---|---|---|
| **Cacifé Brand** | Moda premium · Nuvemshop | **14,32% de conversão** entre usuários (7,5× benchmark BR) |
| **Mariana Cardoso** | Marca pessoal · Tray | **LTV/cliente +42,9%** (R$ 637 vs R$ 446) |
| **Califa Brand** | Ótica · Nuvemshop | **51%** compram em 1 hora após provar |
| **Maxilook** | Ótica premium · Nuvemshop | **Ticket +47%** com provador (R$ 479 vs R$ 326) |
| **+ 7 lojas** | Moda e óticas | Padrão consistente cross-categoria |

**Consolidado em 5 óticas:** conversão temporal ponderada de **9,12%**, 51% compram em 1 hora após provar, 72% em 24 horas, 86% em 72 horas.

**ROI bruto medido:** ~35× sobre custo de API.

---

## Tecnologia

O Provou Levou usa **IA generativa de segunda geração** (não AR baseado em modelo 3D). Isso significa:

- Funciona a partir das **fotos 2D que sua loja já tem** no catálogo
- Não precisa modelar cada SKU em 3D (operação custosa)
- Escala para **10.000+ produtos** sem custo extra de modelagem
- Resultado fotorrealista com **caimento, sombra e textura corretos**

Três componentes técnicos trabalham em paralelo:
1. **Segmentação neural** — identifica corpo/rosto/pose do cliente
2. **Análise geométrica** — mapeia onde o produto deve ir
3. **Modelo generativo** — sintetiza o produto na pessoa

A foto do cliente é processada e descartada após uso, em conformidade com a **LGPD**.

---

## Mercado brasileiro de moda online (contexto 2026)

| Indicador | Valor BR | Comparação |
|---|---|---|
| Taxa de devolução em moda | **30-50%** | (vs 9% no varejo físico) |
| Conversão média | **1,9%** | (vs 2,5% global) |
| Abandono de carrinho | **82%** | (vs 70% global) |
| Custo de cada devolução | **20-65%** | do valor do produto |
| Tráfego mobile | **75%** | mas converte só 1,8% |

**A causa #1 de devolução é tamanho ou caimento que não bateu com expectativa visual** — exatamente o problema que o provador virtual resolve.

---

## Estrutura deste repositório

```
provoulevou/
├── index.html              # Landing principal (PT-BR)
├── index-en.html           # Landing inglês
├── index-es.html           # Landing espanhol
├── provador-virtual/       # Página dedicada SEO (hub)
├── provador-virtual-roupa/ # Spoke: provador virtual para roupa
├── provador-virtual-oculos/# Spoke: provador virtual para óculos
├── blog/                   # 6 posts SEO long-tail
├── login/                  # Dashboard do lojista
├── portal-afiliados.html   # Portal de afiliados (2 níveis)
├── seo-dashboard.html      # Dashboard interno de SEO (auth Supabase)
├── loja-teste.html         # Demo gratuita do provador
├── widget-bagy.js          # Widget para lojas Bagy
├── widget-divine.js        # Widget para lojas Divine
├── script.js               # Script principal injetável
├── env.js                  # Configuração Supabase (anon key)
├── sitemap.xml             # 18 URLs indexáveis
├── robots.txt
└── llms.txt                # Resumo para LLMs (llmstxt.org)
```

---

## Stack

- **Frontend:** HTML estático servido via GitHub Pages → `provoulevou.com.br` (CNAME)
- **Backend:** [Supabase self-hosted](https://supabase.com) no EasyPanel
  - PostgreSQL com PostgREST
  - Auth (JWT)
  - Tabelas: `geracoes_provou_levou`, `lojistas`, `afiliados`, `page_views`, `gsc_metrics`, `landing_leads`, e tabelas por loja
- **Analytics:** Google Analytics 4 + Google Search Console + tabela `page_views` custom
- **Workflow automation:** [n8n](https://n8n.io) self-hosted (sync GSC, webhooks Nuvemshop, recuperação WhatsApp)
- **IA:** Modelos generativos via API
- **Mensagens:** [Uazapi](https://uazapi.com) (WhatsApp Business)

---

## Integrações suportadas

| Plataforma | Como instalar | Tempo |
|---|---|---|
| **Shopify** | Script injetável ou app | 5 min |
| **Nuvemshop / Tiendanube** | Google Tag Manager ou edição de product.tpl | 10 min |
| **Tray Commerce** | App oficial ou external_scripts API | 5 min |
| **Bagy** | Script no painel de personalização | 5 min |
| **WooCommerce** | Plugin ou hook PHP | 15 min |
| **Loja Integrada** | Código customizado | 15 min |

---

## Documentação relacionada

- [Como funciona o provador virtual com IA](https://provoulevou.com.br/provador-virtual/)
- [Provador virtual de roupa — guia completo](https://provoulevou.com.br/provador-virtual-roupa/)
- [Provador virtual de óculos — guia completo](https://provoulevou.com.br/provador-virtual-oculos/)
- [Case Cacifé Brand: 14% conversão e R$ 85k em 98 dias](https://provoulevou.com.br/blog/case-cacife-brand.html)
- [Como reduzir devolução em moda online](https://provoulevou.com.br/blog/como-reduzir-devolucao-moda-online.html)
- [Virtual try-on no Brasil — guia 2026](https://provoulevou.com.br/blog/virtual-try-on-brasil.html)

---

## Contato

- 🌐 [provoulevou.com.br](https://provoulevou.com.br/)
- 📧 contato@provoulevou.com.br
- 📱 +55 (11) 96574-9173 (WhatsApp)
- 📸 [@provoulevou](https://www.instagram.com/provoulevou) (Instagram)

---

## Licença

Código proprietário © 2026 Provou Levou / Quantic Flow AI.
A landing page e os widgets neste repositório são open-source para fins de transparência e SEO. O motor de IA generativa do provador é propriedade da Quantic Flow AI.

---

## Keywords

`provador virtual` `virtual try-on` `provador virtual com IA` `provador virtual roupa` `provador virtual óculos` `fitting room virtual` `experimentar roupa virtual` `provar antes de comprar` `e-commerce moda Brasil` `reduzir devolução moda online` `aumentar conversão e-commerce` `Shopify try-on` `Nuvemshop try-on` `Tray Commerce try-on` `Bagy try-on` `WooCommerce try-on` `IA generativa moda` `Brazilian virtual fitting room` `LGPD compliant AI try-on`
