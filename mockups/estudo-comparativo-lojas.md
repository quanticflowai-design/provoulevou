# Estudo comparativo de lojas — além do provador

> Dados reais via Supabase (`geracoes_provou_levou` + tabelas `*_orders`), paginados, com regra de timestamp pós-prova. Período = desde a 1ª prova de cada loja até ~20/jun/2026. Telefone vazio excluído das métricas de cliente. **Somente leitura — nada na dashboard foi alterado.**

## Tabela comparativa

| Loja | Nicho | Pedidos pagos | % pago | AOV | Clientes | Recompra | Top5 catálogo | Provas | Conv. prova | % via provador | Lift ticket |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Cacifé** | sol | 22.104 | 93,4% | R$ 88 | 6.695 | 5,9% | 18% | 20.000 | 16,4% | 9% | **+43%** |
| **Acessório Style** | grau | 598 | **74,8%** | **R$ 430** | 574 | 3,5% | 27% | 9.799 | **7,9%** | 42,4% | −0,3% |
| **Califa** | sol | 2.374 | 91,5% | R$ 117 | 2.272 | 3,8% | 12% | 7.543 | 14,8% | 21,4% | +1,5% |
| **Amazoni** | sol | 1.208 | 87,1% | R$ 130 | 1.174 | 2,0% | 12% | 3.016 | 14,9% | 19,4% | −2% |
| **Maxilook** | grau | 92 | 81,4% | **R$ 417** | 87 | 4,6% | **35%** | 3.377 | **3,3%** | **61,4%** | +17% |
| **Marandola** | moda | 81 | 75% | R$ 157 | 56 | **39,3%** | 24% | 25 | — | 2,2% | — |

*(Soucet e WS Style fora — amostra pequena demais.)*

---

## Os argumentos: não é só o provador que faz a diferença

### 1. O nicho define a economia — comparar ticket cru é injusto
- **Sol** (Cacifé R$ 88, Califa R$ 117, Amazoni R$ 130): ticket baixo, **jogo de volume**.
- **Grau** (Acessório R$ 430, Maxilook R$ 417): ticket **4–5× maior** (lente + armação), **jogo de margem e conversão**.
> Cada nicho tem uma física própria. A mesma loja "boa" em sol e em grau tem números totalmente diferentes — e isso não tem nada a ver com o provador.

### 2. Saúde de checkout (% pago) é da LOJA, e tem vazamento grande
Pedidos que entram mas nunca são pagos = fricção de checkout / preço / meio de pagamento. **Independe do provador.**
- Saudáveis: Cacifé 93%, Califa 91%.
- Vazando: **Acessório 75%, Maxilook 81%, Marandola 75%** → ~1 em cada 4 pedidos não vira receita.
> Acessório Style perde **202 de 800 pedidos** no pagamento. Destravar isso vale mais do que qualquer ajuste no provador.

### 3. Mix de canal muda a conta (caso Cacifé) — CORRIGIDO
Investigação dos pedidos "sem telefone" da Cacifé: são **Mercado Livre**. Cacifé vende por 2 canais:
- **Mercado Livre: 15.481 pedidos (65%)** — comprador anonimizado pelo ML (sem telefone/email/nome real), pay rate 96,6%. **O provador nem aparece nos anúncios do ML.**
- **Loja própria (Nuvemshop): 8.223 pedidos (35%)** — onde o provador de fato atua.
> Não é falha de checkout nem do nosso sync — é privacidade de marketplace. Implicações:
> 1. O "9% via provador" foi calculado sobre o faturamento **total (incl. ML)**. Sobre o faturamento da **loja própria** (R$ 900k), o provador é **~19,6%** — mais que o dobro. Essa é a conta justa.
> 2. Comparar % via provador entre lojas exige separar quem tem marketplace (Cacifé) de quem é só loja própria (as demais).
> 3. Remarketing/atribuição via provador só fazem sentido na fração loja-própria — e lá o telefone existe.

### 4. Retenção é função do nicho — não cobre a métrica errada
- **Óculos = compra durável**: recompra 2–6% (Cacifé 5,9%, Califa 3,8%, Amazoni 2%, Acessório 3,5%). Normal — ninguém compra óculos todo mês.
- **Moda = recorrência**: Marandola **39,3%** de recompra.
> A alavanca de uma ótica é **aquisição + AOV**, não recompra. Avaliar uma ótica por recompra é usar a régua de uma loja de roupa.

### 5. Concentração de catálogo = risco e foco
- Dependentes de poucos SKUs: **Maxilook top5 = 35%**, Acessório 27%.
- Pulverizados (receita resiliente): Cacifé 18%, Califa 12%, Amazoni 12%.
> Loja concentrada cresce rápido focando no que vende, mas quebra se o SKU campeão sai de linha/estoque. É decisão de catálogo da loja.

### 6. O papel do provador MUDA conforme o contexto da loja
- **% da receita via provador:** Maxilook **61%**, Acessório 42% (peça central em grau/lojas menores) vs Cacifé 9%, Amazoni 19% (incremental nas grandes de sol).
- **Lift de ticket:** Cacifé **+43%**, Maxilook +17% (o provador faz escolher modelo melhor) vs Acessório/Amazoni ~0% (ticket já travado pela lente de grau).
- **Conversão:** sol 15–16% **>** grau 3–8% (comprar óculos de grau envolve receita médica → mais fricção, conversão naturalmente menor).
> O provador não é um número único — ele entrega valor diferente em cada nicho. Vender "+43% de ticket" pra uma loja de grau seria mentira; lá o valor é volume de prova + atribuição.

---

## Diagnóstico por loja (alavanca nº 1)

| Loja | Está forte em | Gargalo real (≠ provador) | Alavanca nº 1 |
|---|---|---|---|
| **Cacifé** | volume, % pago, lift +43% | **53% sem telefone** + provas/dia caindo 20% | Capturar telefone no checkout → destrava remarketing e atribuição |
| **Acessório Style** | AOV R$ 430, provador = 42% | **25% não paga** + conversão 7,9% | Checkout/pagamento → depois conversão do provador |
| **Maxilook** | provador = 61%, AOV R$ 417 | volume baixo (loja pequena) + catálogo concentrado | Escalar tráfego pro provador |
| **Califa** | saudável em tudo | nada crítico | Escalar — base sólida |
| **Amazoni** | % pago ok, conversão 15% | recompra 2%, lift ~0 | Aquisição + AOV (catálogo) |
| **Marandola** | recompra 39% (moda) | volume de prova ínfimo (25) | Adoção do provador / tráfego |

---

## Como usar isso com o lojista

A mensagem honesta e forte: **"O provador é uma das alavancas, e mostramos exatamente onde ele pesa na SUA loja — mas o resultado é multifatorial, e nós enxergamos a loja inteira."**

Isso constrói confiança porque:
- Reconhece que checkout, captura de dados, catálogo e nicho são da loja (não vendemos bala de prata).
- Mostra que medimos o provador de forma justa pro nicho dele (não prometemos +43% de ticket pra quem vende grau).
- Posiciona o Provou Levou como **parceiro de diagnóstico da operação**, não só um widget — o que sustenta upsell (remarketing, captura de telefone, etc.).
