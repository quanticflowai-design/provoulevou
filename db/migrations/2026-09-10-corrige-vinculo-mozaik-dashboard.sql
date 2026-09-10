-- Alinha a ficha financeira da Mozaik ao login e ao domínio usados na dashboard.
-- A dashboard lê plano e último pagamento diretamente de provou_levou_stores;
-- os identificadores antigos apontavam para outro domínio e impediam o vínculo.
update public.provou_levou_stores
set email = 'contato@mozaikbr.com',
    domain = 'https://mozaikbr.com',
    updated_at = now()
where id = '54678f32-ad96-4844-9019-955bcf0273a2'
  and lower(coalesce(company, name, '')) = 'mozaik';
