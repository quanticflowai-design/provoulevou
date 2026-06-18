# Construtor Visual de Fluxos de Disparo — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans pra implementar tarefa-a-tarefa. Steps usam checkbox (`- [ ]`).

**Goal:** Permitir que cada lojista monte fluxos de automação de WhatsApp (gatilho → espera → envio de template), clica-e-arrasta, na aba Disparos do dashboard.

**Architecture:** Motor data-driven — 3 tabelas Supabase (`flows`, `flow_enrollments`, `flow_runs_log`) + 1 workflow n8n (cron interpretador) que processa inscrições vencidas. Frontend Drawflow (vanilla) embutido em `login/index.html`. Gatilhos inscrevem leads via webhook de carrinho e scan de provas.

**Tech Stack:** Supabase (Postgres self-hosted, PostgREST, RLS), n8n (Code/HTTP/Schedule nodes via API pública), Drawflow (JS vanilla, MIT), JS puro no dashboard.

## Global Constraints
- Supabase REST base: `https://quantic-supabase.k5jwra.easypanel.host/rest/v1` — verbatim.
- service_role JWT (motor n8n): role `service_role`, iss `supabase` (a chave válida da loja; NÃO a `supabase-demo`).
- Dashboard usa `supabaseClient` (sessão Supabase Auth do lojista) → RLS por `auth.jwt()->>'email'`.
- n8n base API: `https://n8n.segredosdodrop.com/api/v1`, header `X-N8N-API-KEY`.
- Envio sempre via webhook `https://n8n.segredosdodrop.com/webhook/pl-wa-send` (payload `{email,to,template,language,params,components}`).
- Normalização de telefone = regra do dashboard (sem filtro de comprimento): tira não-dígitos, tira `55` se >11, tira `0` inicial.
- Status de enrollment: `ativo|concluido|parou_comprou|parou_respondeu|erro`.
- Tipos de gatilho: `carrinho_abandonado|provou_nao_comprou|clicou_comprar_nao_comprou`.

---

## File Structure

| Arquivo | Responsabilidade |
|---|---|
| `db/migrations/2026-06-18-flows.sql` (novo) | DDL das 3 tabelas + índices + RLS |
| n8n workflow **"[PL] Fluxos — Motor"** (novo) | cron interpretador das inscrições |
| n8n workflow **"[PL] Fluxos — Inscrição Provas"** (novo) | scan de provas → enrollment |
| n8n workflow de carrinho (existente) | + nó que insere enrollment de `carrinho_abandonado` |
| `login/index.html` (modificar) | sub-aba "Automações": canvas Drawflow, paleta, config, save/list |
| `login/flows-canvas.js` (novo, incluído no index) | lógica isolada do canvas (init Drawflow, serializar `passos`, CRUD Supabase) |

---

## Phase 1 — Banco (migrações + RLS)

### Task 1: Criar as 3 tabelas + índices + RLS

**Files:**
- Create: `db/migrations/2026-06-18-flows.sql`

**Interfaces:**
- Produces: tabelas `flows`, `flow_enrollments`, `flow_runs_log` no schema `public`.

- [ ] **Step 1: Escrever a migração**

```sql
-- flows: definição do fluxo (por lojista)
create table if not exists public.flows (
  id uuid primary key default gen_random_uuid(),
  lojista_email text not null,
  nome text not null default 'Novo fluxo',
  ativo boolean not null default false,
  gatilho text not null check (gatilho in ('carrinho_abandonado','provou_nao_comprou','clicou_comprar_nao_comprou')),
  definicao jsonb not null default '{}'::jsonb,   -- grafo Drawflow (fonte da UI)
  passos jsonb not null default '[]'::jsonb,       -- lista linear normalizada (o motor lê)
  janela_envio jsonb not null default '{"dias":[1,2,3,4,5,6,7],"hora_ini":9,"hora_fim":21,"tz":"America/Sao_Paulo","max_dia":200}'::jsonb,
  exits jsonb not null default '{"para_se_comprou":true,"para_se_respondeu":true}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists flows_lojista_idx on public.flows(lojista_email);
create index if not exists flows_gatilho_ativo_idx on public.flows(gatilho, ativo);

-- flow_enrollments: 1 lead rodando 1 fluxo
create table if not exists public.flow_enrollments (
  id uuid primary key default gen_random_uuid(),
  flow_id uuid not null references public.flows(id) on delete cascade,
  lojista_email text not null,
  lead_phone text not null,
  passo_idx int not null default 0,
  proxima_acao_em timestamptz not null default now(),
  status text not null default 'ativo' check (status in ('ativo','concluido','parou_comprou','parou_respondeu','erro')),
  contexto jsonb not null default '{}'::jsonb,
  enrolled_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists flow_enroll_unico_ativo
  on public.flow_enrollments(flow_id, lead_phone) where status = 'ativo';
create index if not exists flow_enroll_due_idx
  on public.flow_enrollments(status, proxima_acao_em);

-- flow_runs_log: auditoria
create table if not exists public.flow_runs_log (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid references public.flow_enrollments(id) on delete cascade,
  flow_id uuid,
  lojista_email text,
  lead_phone text,
  passo_idx int,
  tipo_no text,
  resultado text,           -- enviado|falhou|movido|parou|esperou
  detalhe jsonb default '{}'::jsonb,
  at timestamptz not null default now()
);
create index if not exists flow_runs_flow_idx on public.flow_runs_log(flow_id, at desc);

-- RLS
alter table public.flows enable row level security;
alter table public.flow_enrollments enable row level security;
alter table public.flow_runs_log enable row level security;

create policy flows_owner_all on public.flows
  for all using (lojista_email = (auth.jwt()->>'email')) with check (lojista_email = (auth.jwt()->>'email'));
create policy enroll_owner_read on public.flow_enrollments
  for select using (lojista_email = (auth.jwt()->>'email'));
create policy runs_owner_read on public.flow_runs_log
  for select using (lojista_email = (auth.jwt()->>'email'));
```

- [ ] **Step 2: Aplicar a migração** (via psql no EasyPanel ou um nó Postgres n8n one-shot). Não dá pra rodar DDL via PostgREST.

- [ ] **Step 3: Verificar que as tabelas existem (PostgREST)**

Run:
```bash
SVC="<service_role válido>"; BASE="https://quantic-supabase.k5jwra.easypanel.host/rest/v1"
for t in flows flow_enrollments flow_runs_log; do
  curl -s -o /dev/null -w "$t -> %{http_code}\n" -H "apikey: $SVC" -H "Authorization: Bearer $SVC" "$BASE/$t?select=id&limit=1"
done
```
Expected: cada uma `200`.

- [ ] **Step 4: Verificar RLS (anon NÃO lê de outro lojista)**

Run: GET `flows` com a **anon key** sem sessão → deve voltar `[]` (RLS bloqueia). Com service_role → vê tudo.

- [ ] **Step 5: Commit**

```bash
git add -f db/migrations/2026-06-18-flows.sql
git commit -m "feat(flows): migração das tabelas de fluxos + RLS"
```

---

## Phase 2 — Inscrição (gatilho → enrollment)

### Task 2: Função compartilhada de inscrição (Code node reutilizável)

**Files:**
- n8n: novo workflow **"[PL] Fluxos — Inscrição Provas"** (Schedule + Code + HTTP).

**Interfaces:**
- Produces: insere linhas em `flow_enrollments` com `passo_idx=0, status=ativo, proxima_acao_em=now`.
- Consumes: `flows` (ativos por gatilho), `geracoes_provou_levou`, `<loja>_orders`, `lojistas` (config).

- [ ] **Step 1: Montar o Code node de scan** (roda a cada 10 min)

```javascript
// SVC/BASE no topo (service_role válido)
const H = { apikey: SVC, Authorization: 'Bearer ' + SVC };
const get = (u) => this.helpers.httpRequest({ method:'GET', url: BASE+u, headers: H, json: true });
const norm = p => { let d=String(p||'').replace(/\D/g,''); if(d.startsWith('55')&&d.length>11)d=d.slice(2); if(d.startsWith('0'))d=d.slice(1); return d; };
// 1. estado: último scan (guarda em flow_runs_log tipo_no='scan' ou numa key simples). MVP: janela fixa de 20min.
const since = new Date(Date.now() - 20*60*1000).toISOString();
// 2. fluxos ativos com gatilho de prova
const flows = await get(`/flows?ativo=eq.true&gatilho=in.(provou_nao_comprou,clicou_comprar_nao_comprou)&select=id,lojista_email,gatilho`);
const out = [];
for (const f of flows) {
  const cfg = (await get(`/lojistas?email=eq.${encodeURIComponent(f.lojista_email)}&select=origem,tabela_pedidos,valores_status_pago`))[0];
  if (!cfg) continue;
  const provas = await get(`/geracoes_provou_levou?origin=ilike.*${cfg.origem}*&created_at=gte.${since}&select=telefone_cliente,produtos,produto_url,carrinho_adicionado,created_at`);
  for (const p of provas) {
    const ph = norm(p.telefone_cliente); if (ph.length < 8) continue;
    const clicou = !!p.carrinho_adicionado;
    const querClicou = f.gatilho === 'clicou_comprar_nao_comprou';
    if (querClicou !== clicou) continue;             // casa a classificação do gatilho
    out.push({ json: { flow_id: f.id, lojista_email: f.lojista_email, lead_phone: ph,
      contexto: { nome:'', produto:(p.produtos||'').split(',')[0].trim(), url:p.produto_url||'' } } });
  }
}
return out;
```

- [ ] **Step 2: HTTP node "Insere Enrollment"** — `POST {BASE}/flow_enrollments` com `Prefer: resolution=ignore-duplicates` e header `Prefer: return=minimal`. Body por item:
```json
{ "flow_id":"={{ $json.flow_id }}", "lojista_email":"={{ $json.lojista_email }}", "lead_phone":"={{ $json.lead_phone }}", "contexto":"={{ $json.contexto }}", "status":"ativo", "passo_idx":0 }
```
O índice único parcial + `ignore-duplicates` evita reinscrição.

- [ ] **Step 3: Verificar** — ativar o workflow, gerar 1 prova de teste numa loja com fluxo ativo, e confirmar a linha em `flow_enrollments` (GET por `lead_phone`).

- [ ] **Step 4: Commit** (export do workflow pra `db/n8n/fluxos-inscricao-provas.json`)
```bash
git add -f db/n8n/fluxos-inscricao-provas.json && git commit -m "feat(flows): inscrição por scan de provas"
```

### Task 3: Inscrição por carrinho abandonado

**Files:**
- n8n: workflow de carrinho existente — adicionar branch "Insere Enrollment Carrinho".

- [ ] **Step 1:** após o nó que extrai o contato do `checkout/created`, buscar `flows?ativo=eq.true&gatilho=eq.carrinho_abandonado&lojista_email=eq.<email da loja>`; pra cada, `POST /flow_enrollments` (mesmo formato da Task 2, contexto = `{nome, produto, url:url_checkout, total}`).
- [ ] **Step 2: Verificar** — disparar o webhook de teste do carrinho (curl do skill `abandoned-cart-recovery`) e ver o enrollment criado.
- [ ] **Step 3: Commit.**

---

## Phase 3 — Motor (cron interpretador)

### Task 4: Workflow "[PL] Fluxos — Motor"

**Files:**
- n8n: novo workflow (Schedule a cada 1 min → Code → respond).

**Interfaces:**
- Consumes: `flow_enrollments` (vencidas), `flows` (passos/exits/janela), `<loja>_orders`, `whatsapp_mensagens`, `pl-wa-send`.
- Produces: avança/encerra enrollments; escreve `flow_runs_log`.

- [ ] **Step 1: Code node "Processa Lote"** (lógica central)

```javascript
const H={apikey:SVC,Authorization:'Bearer '+SVC,'Content-Type':'application/json'};
const get=u=>this.helpers.httpRequest({method:'GET',url:BASE+u,headers:H,json:true});
const patch=(u,b)=>this.helpers.httpRequest({method:'PATCH',url:BASE+u,headers:Object.assign({Prefer:'return=minimal'},H),body:b,json:true});
const post=(u,b)=>this.helpers.httpRequest({method:'POST',url:BASE+u,headers:Object.assign({Prefer:'return=minimal'},H),body:b,json:true});
const send=b=>this.helpers.httpRequest({method:'POST',url:'https://n8n.segredosdodrop.com/webhook/pl-wa-send',body:b,json:true});
const norm=p=>{let d=String(p||'').replace(/\D/g,'');if(d.startsWith('55')&&d.length>11)d=d.slice(2);if(d.startsWith('0'))d=d.slice(1);return d;};
const nowIso=new Date().toISOString();
const due = await get(`/flow_enrollments?status=eq.ativo&proxima_acao_em=lte.${nowIso}&select=*&limit=200`);
const log=(e,tipo,res,det)=>post('/flow_runs_log',{enrollment_id:e.id,flow_id:e.flow_id,lojista_email:e.lojista_email,lead_phone:e.lead_phone,passo_idx:e.passo_idx,tipo_no:tipo,resultado:res,detalhe:det||{}});
for (const e of due) {
  try {
    const flow=(await get(`/flows?id=eq.${e.flow_id}&select=*`))[0];
    if(!flow||!flow.ativo){ await patch(`/flow_enrollments?id=eq.${e.id}`,{status:'concluido'}); continue; }
    const cfg=(await get(`/lojistas?email=eq.${encodeURIComponent(e.lojista_email)}&select=origem,tabela_pedidos,valores_status_pago,campo_telefone_pedido,campo_data_pedido,campo_total_pedido`))[0]||{};
    // --- SAÍDAS ---
    if(flow.exits.para_se_comprou && cfg.tabela_pedidos){
      const pagos=(cfg.valores_status_pago||['paid']).join(',');
      const ords=await get(`/${cfg.tabela_pedidos}?payment_status=in.(${encodeURIComponent(pagos)})&created_at=gte.${e.enrolled_at}&select=${cfg.campo_telefone_pedido||'customer_phone'}&limit=500`);
      if(ords.some(o=>norm(o[cfg.campo_telefone_pedido||'customer_phone'])===e.lead_phone)){ await patch(`/flow_enrollments?id=eq.${e.id}`,{status:'parou_comprou'}); await log(e,'exit','parou'); continue; }
    }
    if(flow.exits.para_se_respondeu){
      const resp=await get(`/whatsapp_mensagens?email=eq.${encodeURIComponent(e.lojista_email)}&direction=eq.in&lead_phone=ilike.*${e.lead_phone}*&created_at=gte.${e.enrolled_at}&select=id&limit=1`);
      if(resp.length){ await patch(`/flow_enrollments?id=eq.${e.id}`,{status:'parou_respondeu'}); await log(e,'exit','parou'); continue; }
    }
    const passos=flow.passos||[]; const no=passos[e.passo_idx];
    if(!no){ await patch(`/flow_enrollments?id=eq.${e.id}`,{status:'concluido'}); continue; }
    // --- JANELA (só pra envio) ---
    if(no.tipo==='enviar'){
      const j=flow.janela_envio||{}; const d=new Date(); const horaBR=Number(new Intl.DateTimeFormat('en-US',{hour:'numeric',hour12:false,timeZone:j.tz||'America/Sao_Paulo'}).format(d));
      if(horaBR<(j.hora_ini??9)||horaBR>=(j.hora_fim??21)){ const next=new Date(d); next.setHours((j.hora_ini??9),0,0,0); if(next<=d)next.setDate(next.getDate()+1); await patch(`/flow_enrollments?id=eq.${e.id}`,{proxima_acao_em:next.toISOString()}); await log(e,'janela','esperou'); continue; }
    }
    // --- EXECUTA NÓ ---
    let nextIdx=e.passo_idx+1, nextAt=new Date().toISOString();
    if(no.tipo==='espera'){ const ms=(no.qtd||0)*({min:60000,hora:3600000,dia:86400000}[no.unidade]||60000); nextAt=new Date(Date.now()+ms).toISOString(); await log(e,'espera','esperou',{qtd:no.qtd,unidade:no.unidade}); }
    else if(no.tipo==='enviar'){ const c=e.contexto||{}; const params=(no.params||[]).map(k=>({image:'',nome:c.nome||'👋',produto:c.produto||'o modelo que você provou',link:c.url||''}[k]??k)); const body={email:e.lojista_email,to:e.lead_phone,template:no.template,language:no.language||'pt_BR',params}; if(no.components)body.components=no.components; const r=await send(body); await log(e,'enviar',(r&&r.ok)?'enviado':'falhou',{template:no.template,resp:r}); }
    else if(no.tipo==='mover_crm'){ await post('/crm_lead_overrides',{lojista_email:e.lojista_email,telefone:e.lead_phone,column_key:no.estagio}); await log(e,'mover_crm','movido',{estagio:no.estagio}); }
    await patch(`/flow_enrollments?id=eq.${e.id}`,{passo_idx:nextIdx,proxima_acao_em:nextAt,updated_at:new Date().toISOString()});
  } catch(err){ await patch(`/flow_enrollments?id=eq.${e.id}`,{status:'ativo',proxima_acao_em:new Date(Date.now()+300000).toISOString()}); await log(e,'erro','falhou',{err:String(err.message||err).slice(0,200)}); }
}
return [{json:{processados:due.length}}];
```

- [ ] **Step 2: Verificar (espera)** — inscrever 1 lead num fluxo "espera 1min → enviar"; confirmar que após 1 tick o `passo_idx` vira 1 e `proxima_acao_em` ~+1min.
- [ ] **Step 3: Verificar (envio)** — após a espera, confirmar `flow_runs_log` com `resultado=enviado` e o `whatsapp_send_log` correspondente.
- [ ] **Step 4: Verificar (saída comprou)** — registrar pedido pago do lead → próximo tick marca `parou_comprou`.
- [ ] **Step 5: Commit** (export `db/n8n/fluxos-motor.json`).

---

## Phase 4 — Frontend (canvas Drawflow)

### Task 5: Incluir Drawflow + sub-aba "Automações"

**Files:**
- Modify: `login/index.html` (incluir CSS/JS do Drawflow via CDN; novo botão de sub-aba `data-sub="automacoes"` + `<div id="dispSubAutomacoes">`).
- Create: `login/flows-canvas.js` (lógica isolada).

- [ ] **Step 1:** adicionar no `<head>`: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/drawflow/dist/drawflow.min.css">` e antes do `</body>`: `<script src="https://cdn.jsdelivr.net/npm/drawflow/dist/drawflow.min.js"></script><script src="flows-canvas.js"></script>`.
- [ ] **Step 2:** sub-aba na nav de Disparos (seguir o padrão `dispSwitchSub('automacoes')` existente) com 3 áreas: paleta (esq), `<div id="flowCanvas">` (centro), `<div id="flowNodeConfig">` (dir).
- [ ] **Step 3: Verificar** — abrir a aba, o canvas Drawflow renderiza vazio sem erro no console.
- [ ] **Step 4: Commit.**

### Task 6: Paleta + nós + config

**Files:** Modify `login/flows-canvas.js`.

- [ ] **Step 1:** registrar os tipos de nó no Drawflow (`gatilho`, `espera`, `enviar`, `mover_crm`) com HTML mínimo cada, arrastáveis da paleta pro canvas (`editor.addNode(...)` no drop).
- [ ] **Step 2:** painel de config por nó (ao selecionar): *espera* (qtd+unidade), *enviar* (select de template via `pl-wa-templates` + mapeamento de params), *mover_crm* (select de estágio via config de CRM), *gatilho* (select dos 3 tipos).
- [ ] **Step 3: Verificar** — montar visualmente gatilho→espera→enviar e editar cada um; estado reflete no `editor.export()`.
- [ ] **Step 4: Commit.**

### Task 7: Salvar/validar/listar (Supabase autenticado)

**Files:** Modify `login/flows-canvas.js`.

**Interfaces:**
- Consumes: `supabaseClient` (sessão do lojista), `activeUser.email`.

- [ ] **Step 1:** `serializePassos(graph)` — percorre o grafo do gatilho seguindo as conexões, **valida linearidade** (1 gatilho; cada nó ≤1 saída; sem ciclo), retorna `[{tipo, ...config}]` em ordem. Se inválido → erro amigável (toast) e não salva.
- [ ] **Step 2:** salvar — `supabaseClient.from('flows').upsert({ id, lojista_email: activeUser.email, nome, gatilho, ativo, definicao: graph, passos, janela_envio, exits })`. RLS garante o escopo.
- [ ] **Step 3:** carregar/listar — `select('*').eq('lojista_email', activeUser.email)`; render da lista com ativo/pausado e (Task 8) stats; clicar em um carrega `definicao` no canvas (`editor.import`).
- [ ] **Step 4: Verificar** — criar fluxo, recarregar a página, confirmar que ele volta no canvas; tentar salvar grafo não-linear → bloqueado com mensagem.
- [ ] **Step 5: Commit.**

---

## Phase 5 — Sinais, stats e hardening

### Task 8: Stats no painel
- [ ] Query `flow_runs_log`/`flow_enrollments` por `flow_id` → mostrar na lista: inscritos ativos, enviados, parou-comprou (conversões), parou-respondeu. Verificar números contra a tabela. Commit.

### Task 9: Estado do scan (evitar reprocessar)
- [ ] Trocar a janela fixa de 20min da Task 2 por marca de "último scan" (linha em `flow_runs_log` com `tipo_no='scan_estado'` guardando `at`), usando `created_at > último`. Verificar que provas antigas não reinscrevem. Commit.

### Task 10: QA piloto + idempotência
- [ ] Rodar 1 fluxo real ponta-a-ponta com 1 lojista piloto (loja de baixo volume). Confirmar: inscrição, espera, envio (com `delivered` no rastreio), saída por compra e por resposta, respeito à janela. Ajustar o que aparecer. Commit.

---

## Self-Review (cobertura da spec)
- Tabelas + RLS → Task 1 ✅ · Inscrição (carrinho + provas) → Tasks 2,3 ✅ · Motor (espera/enviar/mover/saídas/janela) → Task 4 ✅ · Frontend (canvas/paleta/config/save/list) → Tasks 5-7 ✅ · Stats/hardening → Tasks 8-10 ✅. Sem placeholders; nomes de tipo de nó (`espera/enviar/mover_crm/gatilho`) e campos (`passo_idx/proxima_acao_em/status`) consistentes entre motor e frontend.
