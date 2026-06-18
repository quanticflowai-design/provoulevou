-- Construtor de Fluxos de Disparo — tabelas + índices + RLS
-- Aplicar via psql / Supabase Studio (DDL não roda via PostgREST).

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

-- RLS: lojista só mexe no que é dele (sessão Supabase Auth do painel)
alter table public.flows enable row level security;
alter table public.flow_enrollments enable row level security;
alter table public.flow_runs_log enable row level security;

create policy flows_owner_all on public.flows
  for all using (lojista_email = (auth.jwt()->>'email')) with check (lojista_email = (auth.jwt()->>'email'));
create policy enroll_owner_read on public.flow_enrollments
  for select using (lojista_email = (auth.jwt()->>'email'));
create policy runs_owner_read on public.flow_runs_log
  for select using (lojista_email = (auth.jwt()->>'email'));
