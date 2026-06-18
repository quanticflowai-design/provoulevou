# Construtor Visual de Fluxos de Disparo (no-code) — Design

**Data:** 2026-06-18
**Status:** Aprovado (brainstorming) — pronto pra plano de implementação

## 1. Objetivo

Permitir que **cada lojista** monte, sozinho (self-service), **fluxos de automação de WhatsApp** num editor **clica-e-arrasta** (estilo n8n, mas linear) dentro da aba **Disparos** do dashboard (`login/index.html`).

Exemplo de fluxo que o lojista deve conseguir montar sem código:
> **Carrinho abandonado** → espera **15 min** → envia template "volta pro carrinho" → espera **24h** → envia template "cupom 10%" → (para sozinho se o cliente comprar ou responder)

## 2. Escopo (decisões do brainstorming)

- **Formato:** linear com ramificação simples (não é grafo arbitrário estilo n8n completo).
- **Gatilhos (v1):** carrinho abandonado · provou e não comprou (`cold`) · clicou comprar e não comprou (`clicou-comprar`).
- **Nós:** Gatilho · Espera · Enviar template · Mover etapa CRM.
- **Saídas automáticas (toggle por fluxo):** parar se comprou · parar se respondeu.
- **Guardrails por fluxo:** janela de envio (horário comercial/dias) + máximo por dia.
- **Quem monta:** cada lojista (self-service) — UX à prova de erro, escopada por `lojista_email`.
- **Arquitetura:** motor genérico data-driven (tabelas + 1 cron n8n interpretador). Frontend com **Drawflow** (lib vanilla, sem framework).

**Não-escopo (v1):** grafo arbitrário com múltiplos caminhos paralelos; gatilho por inbound; A/B de mensagens; ramificações condicionais complexas além das saídas automáticas.

## 3. Modelo de dados (Supabase)

### `flows`
| coluna | tipo | nota |
|---|---|---|
| id | uuid pk | |
| lojista_email | text | dono do fluxo (escopo RLS) |
| nome | text | |
| ativo | bool | pausar/ativar |
| gatilho | text | `carrinho_abandonado` \| `provou_nao_comprou` \| `clicou_comprar_nao_comprou` |
| definicao | jsonb | grafo do Drawflow (nós + arestas) — fonte de verdade da UI |
| passos | jsonb | lista linear **normalizada** dos nós em ordem de execução (derivada da `definicao` no save) — o que o motor lê |
| janela_envio | jsonb | `{dias:[1..7], hora_ini, hora_fim, tz, max_dia}` |
| exits | jsonb | `{para_se_comprou:bool, para_se_respondeu:bool}` |
| created_at, updated_at | timestamptz | |

### `flow_enrollments` (uma linha por lead rodando um fluxo)
| coluna | tipo | nota |
|---|---|---|
| id | uuid pk | |
| flow_id | uuid fk | |
| lojista_email | text | |
| lead_phone | text | normalizado (regra do dashboard) |
| passo_idx | int | índice do passo atual em `flows.passos` |
| proxima_acao_em | timestamptz | quando o motor deve processar |
| status | text | `ativo` \| `concluido` \| `parou_comprou` \| `parou_respondeu` \| `erro` |
| contexto | jsonb | nome, produto, url do produto, total — capturado na inscrição |
| enrolled_at | timestamptz | |
| updated_at | timestamptz | |

**Único parcial:** `(flow_id, lead_phone) WHERE status = 'ativo'` — evita inscrição dupla no mesmo fluxo.

### `flow_runs_log` (auditoria → histórico do painel)
`id, enrollment_id, flow_id, lojista_email, lead_phone, passo_idx, tipo_no, resultado (enviado|falhou|movido|parou|esperou), detalhe (jsonb), at`.

### RLS
- `flows`, `flow_enrollments`, `flow_runs_log`: lojista lê/escreve só onde `lojista_email = auth.jwt()->>'email'` (sessão Supabase Auth do painel). Enrollments/log: lojista **read-only** (quem escreve é o motor).
- Motor n8n usa **service_role** (bypassa RLS).

## 4. Paleta de nós (Drawflow)

| Nó | Config | Execução |
|---|---|---|
| **Gatilho** (1, início) | tipo de gatilho | define como o lead entra (ver §5) |
| **Espera** | duração (min/h/dias) | agenda `proxima_acao_em = agora + duração`, avança passo |
| **Enviar template** | template Meta + mapeamento de params (nome/produto/link) + botão URL | `POST pl-wa-send`; loga; avança |
| **Mover etapa CRM** | estágio destino (da config de CRM do lojista) | atualiza estágio do lead; avança |
| **Fim** (implícito) | — | `status = concluido` |

No **save**, o frontend valida que o grafo é **linear** (1 gatilho, cada nó com no máx 1 saída) e serializa `passos` em ordem. Saídas automáticas e janela ficam no nível do fluxo (não são nós).

## 5. Gatilho → inscrição (como o lead entra no fluxo)

- **Carrinho abandonado:** webhook Nuvemshop `checkout/created` (já existe pipeline, ver skill `abandoned-cart-recovery`) → n8n → para cada `flow` ativo do lojista com `gatilho=carrinho_abandonado`, insere enrollment (`lead_phone`, `contexto` do checkout, `proxima_acao_em=agora`, `passo_idx=0`).
- **Provou / clicou e não comprou:** **scan periódico** (cron n8n ~5–15min) sobre provas novas em `geracoes_provou_levou` (desde o último scan) → classifica o lead (`cold` / `clicou-comprar` pela flag `carrinho_adicionado`), confere que **não comprou** (tabela de pedidos do lojista) e que **não está inscrito** → insere enrollment.
- Dedup: o índice único parcial garante 1 inscrição ativa por lead/fluxo.

## 6. Motor de execução (1 workflow n8n)

**Schedule trigger a cada ~1–2 min** (granularidade ok pra esperas de 15min/24h):

1. `SELECT * FROM flow_enrollments WHERE status='ativo' AND proxima_acao_em <= now() LIMIT 200` (lote).
2. Para cada enrollment (try/catch **por lead** — erro não trava o lote):
   1. Carrega `flows.passos` + `exits` + `janela_envio`.
   2. **Saídas:** se `para_se_comprou` e há pedido pago do `lead_phone` após `enrolled_at` → `parou_comprou`. Se `para_se_respondeu` e há inbound (`whatsapp_mensagens dir=in`) após `enrolled_at` → `parou_respondeu`. (sinais reusam o que já existe.)
   3. **Janela/limite:** se o passo atual é envio e está fora da janela ou estourou `max_dia` → reagenda `proxima_acao_em` pro próximo horário válido, sem avançar.
   4. **Executa o nó** `passos[passo_idx]` (ver tabela §4).
   5. Avança `passo_idx`; se acabou → `concluido`. Grava log.
3. Retry de falha **transitória** de envio (ex.: timeout): mantém o passo e reagenda com backoff curto; falha de **template/param** vai pro log via o rastreio de entrega (já implementado).

## 7. Frontend (canvas no dashboard)

- Nova sub-aba **"Automações"** dentro da aba Disparos (`login/index.html`).
- Layout: **paleta de nós** (esquerda, arrastar) · **canvas Drawflow** (centro) · **painel de config** do nó selecionado (direita).
- Cabeçalho do fluxo: nome · seletor de gatilho · toggle ativo · botão "janela de envio" · saídas automáticas.
- **Salvar:** serializa grafo → valida linearidade → `upsert` em `flows` (sessão autenticada).
- **Lista de fluxos:** ativo/pausado, nº de inscritos ativos, enviados/parou-comprou (stats do `flow_runs_log`).
- Drawflow: lib vanilla MIT, sem build/framework (combina com o dashboard JS puro). Importar via CDN/arquivo estático.

## 8. Tratamento de erro

- Motor: try/catch por enrollment; status `erro` + log; lote continua.
- Idempotência: índice único parcial + avanço atômico (`UPDATE ... WHERE passo_idx = X` pra não duplicar passo sob concorrência).
- Falhas de envio: visíveis via `whatsapp_send_log` (rastreio de `delivered`/`failed` + código de erro, já ligado).
- Limite de marketing da Meta: não detectável (drop silencioso) — documentar pro lojista que "sent" sem "delivered" pode ser cap de marketing.

## 9. Reuso de infraestrutura existente

`pl-wa-send` (envio de template) · `pl-wa-inbound` (sinal de resposta + status) · webhook Nuvemshop `checkout/created` · `geracoes_provou_levou` (provas) · tabelas `<loja>_orders` (compra) · config de CRM/pipeline · `pl-wa-templates` (lista de templates). Nada é reinventado — o motor orquestra o que já roda.

## 10. Fases sugeridas

1. **Migrações** (3 tabelas + RLS + índices).
2. **Motor n8n** (cron interpretador) + scan de inscrição + webhook de carrinho → enrollment.
3. **Frontend Drawflow** (canvas, paleta, config, save/list).
4. **Integração de sinais** (saídas comprou/respondeu, janela) + stats no painel.
5. **Hardening** (retry/backoff, idempotência, logs, QA com 1 lojista piloto).

## 11. Pontos em aberto / riscos

- Validação de linearidade no save (UX: bloquear grafos não-lineares ou auto-corrigir?).
- Migração dos disparos atuais (`disparos_agendados`) — coexistir no v1; avaliar absorver depois.
- Volume do scan de provas (tabela `geracoes_provou_levou` tem ~78k linhas, todas as lojas) — usar `created_at > último_scan` + índice pra não varrer tudo.
- Concorrência do motor (vários ticks sobrepostos) — lock otimista por `passo_idx`.
