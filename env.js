window.ENV = {
    // Insira a URL do seu projeto no Supabase (ex: https://xyz.supabase.co)
    SUPABASE_URL: 'https://jytsrxrmgvliyyuktxsd.supabase.co',

    // Insira a chave pública "anon/public" do seu projeto
    SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5dHNyeHJtZ3ZsaXl5dWt0eHNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDA0ODYsImV4cCI6MjA3NTQ3NjQ4Nn0.vxiQwV3DxFxfcqts4mgRjk9CRmzdhxKvKBM7XPCrKXQ',

    // Mapeamento de e-mails Autenticados para tabelas e origens
    LOJISTAS: {
        'calmostore1@gmail.com': { // Insira o e-mail real criado no Supabase Auth para a Calmo
            tabela: 'geracoes_provador_calmo',
            origem: 'calmostore.com.br'
        },
        'budaimportss@gmail.com': { // Insira o e-mail real criado no Supabase Auth para a Buda
            tabela: 'geracoes_provador_buda',
            origem: 'budastore.com.br'
        }
    }
};
