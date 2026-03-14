window.ENV = {
    // Insira a URL do seu projeto no Supabase (ex: https://xyz.supabase.co)
    SUPABASE_URL: 'https://jytsrxrmgvliyyuktxsd.supabase.co',

    // Insira a chave pública "anon/public" do seu projeto
    SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5dHNyeHJtZ3ZsaXl5dWt0eHNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDA0ODYsImV4cCI6MjA3NTQ3NjQ4Nn0.vxiQwV3DxFxfcqts4mgRjk9CRmzdhxKvKBM7XPCrKXQ',

    // Mapeamento de e-mails Autenticados para tabelas e origens
    LOJISTAS: {
        'calmostore1@gmail.com': {
            tabela: 'geracoes_provou_levou',
            tabela_pedidos: 'calmo_orders',
            origem: 'calmostore.com.br'
        },
        'budaimportss@gmail.com': {
            tabela: 'geracoes_provou_levou',
            tabela_pedidos: 'buda_orders',
            origem: 'budastore.com.br'
        },
        'contato@coletivoemaus.com': {
            tabela: 'geracoes_provou_levou',
            tabela_pedidos: 'emaus_vendas_provador',
            origem: 'https://www.coletivoemaus.com',
            campo_telefone_pedido: 'cliente_telefone',
            campo_total_pedido: 'valor_pedido',
            campo_status_pedido: 'status_pedido',
            campo_nome_pedido: 'cliente_nome',
            valores_status_pago: ['Pedido Pago', 'Pedido Enviado', 'Pedido Entregue', 'Em produção', 'Faturado', 'Pedido em separação', 'Pedido pronto para retirada']
        }
    }
};
