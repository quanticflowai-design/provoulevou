# O provador além da conversão — estudo de valor

> Para responder ao lojista que diz "só olho conversão, não sei se vale a pena manter". Dados reais (Supabase), 3 lojas representativas. A tese: **conversão é a ponta visível; o valor real do provador tem 5 camadas, e quem olha só conversão enxerga ~1/3 do que recebe.**

## O stack de valor (3 lojas)

| Camada de valor | Cacifé (sol) | Linda Menina (grau) | Acessório (grau) |
|---|---|---|---|
| Conversão prova→compra | 16,5% | 7,7% | 7,9% |
| **1. Receita direta via provador** | R$ 176.975 | R$ 191.156 | R$ 109.157 |
| **2. Receita EXTRA só do lift de ticket** | **R$ 53.182** | R$ 14.344 | R$ 0* |
| **3. % das vendas que aconteceram DIAS depois** | 43,6% | 46,1% | **58,7%** |
| **4. Leads capturados (provaram, não compraram)** | 6.961 | **7.162** | 2.860 |
| **4b. Potencial recuperável (5–10% × AOV)** | R$ 31k–61k | **R$ 108k–215k** | R$ 62k–123k |
| **5. Dado primário / CRM** | crítico (65% da loja é ML anônimo) | sim | sim |

*Acessório é grau: ticket travado pela lente, lift ~0 — honesto. Mas as outras 4 camadas compensam (58,7% compram depois, R$ 62–123k em leads).

## Por que "só conversão" engana

### 1. Conversão trata uma venda de R$ 86 igual a uma de R$ 123
O provador faz o cliente comprar com confiança e escolher modelo melhor: **+43% de ticket na Cacifé = R$ 53 mil de receita que NÃO existiria** sem o provador — e que a taxa de conversão não mostra, porque conta "1 venda" dos dois jeitos.

### 2. A foto de conversão não vê a venda que acontece depois
**44% a 59% dos compradores via provador compraram DIAS depois** da prova (não na mesma sessão). Quem olha conversão de sessão/janela curta perde metade do efeito — o provador planta a semente, ela germina depois. Na Acessório, **6 de cada 10** vendas-provador foram adiadas.

### 3. O maior valor está parado, esperando ação
Cada loja tem milhares que **provaram, deram telefone, demonstraram interesse num produto, e não compraram**. Isso é um banco de leads quentíssimo:
- Linda Menina: **7.162 leads** → R$ 108–215 mil recuperáveis.
- Esse valor o provador **já capturou**. Realizar depende do lojista abrir a dashboard e disparar a recuperação.

### 4. Em loja de marketplace, o provador é o único CRM
Cacifé: 65% das vendas são Mercado Livre, 100% anônimo (sem nome/telefone). **O provador é literalmente o único canal que captura cliente identificável.** Sem ele, a loja tem zero relacionamento com 2/3 da base.

## O ponto incômodo (e honesto)

Boa parte de quem diz "não faz diferença" **não entra na dashboard nem recupera cliente nenhum.** O provador é como academia: a matrícula não emagrece — ir, sim. A loja que olha só o número de conversão e ignora o banco de leads está deixando **R$ 100–200 mil** na mesa (Linda Menina) e culpando a ferramenta. O valor está capturado; falta colher.

## Resposta pronta para "estamos analisando se vale a pena manter"

> "Entendo — e se você está olhando só a taxa de conversão, faz sentido a dúvida, porque ela mostra a menor parte do que o provador faz. Deixa eu te mostrar o quadro completo da SUA loja:
>
> 1. **Quem usou o provador comprou com ticket [X]% maior** — só isso já foram **R$ [Y] mil** de receita extra no período, que a conversão não conta.
> 2. **[44–59]% das suas vendas-provador aconteceram dias depois da prova** — se você olha conversão na sessão, está perdendo metade do efeito.
> 3. Você tem **[N] pessoas que provaram, deixaram telefone e não compraram** — isso é **R$ [Z] mil** em leads quentes esperando uma mensagem. Recuperar 1 em cada 10 já paga o provador muitas vezes. Posso te ajudar a disparar isso essa semana.
> 4. [Se marketplace] **65% das suas vendas são anônimas no ML — o provador é o único jeito de você ter o contato dos seus clientes.**
>
> O provador já fez a parte dele: trouxe venda, levantou ticket e capturou esses leads. A pergunta não é 'vale a pena manter?' — é 'quanto desse valor capturado a gente vai colher junto?'. Topa eu te mostrar na dashboard e ligar a recuperação?"

## Como usar
- Rode `scripts/value_stack.js <origin> <tabela> <Label>` (na skill `diagnostico-saude-loja`) pra preencher os [X],[Y],[N],[Z] reais da loja do cliente antes da conversa.
- Lidere com a camada mais forte da loja: sol → lift de ticket; grau → leads + conversão atrasada; marketplace → CRM/dado.
