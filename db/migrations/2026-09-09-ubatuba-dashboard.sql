-- Provisiona a Sunglasses Ubatuba na dashboard do lojista.
-- A tabela dedicada evita misturar pedidos de outras lojas Tray.

create table if not exists public.ubatuba_orders
  (like public.dayone_orders including all);

alter table public.ubatuba_orders enable row level security;

grant all privileges on table public.ubatuba_orders to service_role;
grant select on table public.ubatuba_orders to authenticated;

drop policy if exists ubatuba_orders_authenticated_select
  on public.ubatuba_orders;

create policy ubatuba_orders_authenticated_select
  on public.ubatuba_orders
  for select
  to authenticated
  using (true);

insert into public.lojistas (
  email,
  tabela,
  tabela_pedidos,
  origem,
  campo_telefone_pedido,
  campo_total_pedido,
  campo_status_pedido,
  campo_nome_pedido,
  valores_status_pago,
  campo_data_pedido,
  campo_produto_pedido,
  nome_loja,
  categoria,
  canal_provador
)
values (
  'contato@sunglassesubatuba.com.br',
  'geracoes_provou_levou',
  'ubatuba_orders',
  'sunglassesubatuba.com.br',
  'cliente_telefone',
  'valor_pedido',
  'status_pedido',
  'cliente_nome',
  array[
    'A ENVIAR',
    'A ENVIAR VINDI',
    'A ENVIAR VISA',
    'A ENVIAR MASTER',
    'A ENVIAR ELO',
    'A ENVIAR AMEX',
    'A ENVIAR HIPERCARD',
    'A ENVIAR DINERS',
    'A ENVIAR PIX',
    'A ENVIAR BOLETO',
    'PEDIDO EM SEPARACAO',
    'PEDIDO EM SEPARAÇÃO',
    'ENVIADO',
    'FINALIZADO',
    'PAGO'
  ]::text[],
  'data_pedido',
  'produto_provado',
  'Sunglasses Ubatuba',
  'oculos',
  'tray'
)
on conflict (email) do update set
  tabela = excluded.tabela,
  tabela_pedidos = excluded.tabela_pedidos,
  origem = excluded.origem,
  campo_telefone_pedido = excluded.campo_telefone_pedido,
  campo_total_pedido = excluded.campo_total_pedido,
  campo_status_pedido = excluded.campo_status_pedido,
  campo_nome_pedido = excluded.campo_nome_pedido,
  valores_status_pago = excluded.valores_status_pago,
  campo_data_pedido = excluded.campo_data_pedido,
  campo_produto_pedido = excluded.campo_produto_pedido,
  nome_loja = excluded.nome_loja,
  categoria = excluded.categoria,
  canal_provador = excluded.canal_provador;

notify pgrst, 'reload schema';
