-- O lead antigo foi registrado sem o nono dígito; a identidade da loja foi
-- conferida pelo nome antes de atualizar o contato para o número informado.
do $$
declare v_lead constant uuid := '9a608692-9b13-474c-a560-3d5acc1f2e63';
begin
  if not exists (
    select 1 from public.leads
    where id = v_lead and nome_loja = 'Óptica Millena Móvel'
      and regexp_replace(coalesce(telefone,''),'[^0-9]','','g') = '555189561378'
  ) and not exists (
    select 1 from public.leads
    where id = v_lead and nome_loja = 'Óptica Millena Móvel'
      and telefone = '5551989561378' and email = 'milenaguerreiro271@gmail.com'
  ) then
    raise exception 'Identidade do lead da Óptica Millena não confirmada';
  end if;
  update public.leads set telefone = '5551989561378', email = 'milenaguerreiro271@gmail.com',
    status = 'testando', teste_gratis_em = coalesce(teste_gratis_em,current_date), updated_at = now()
    where id = v_lead;
  insert into public.crm_lead_etapas(lead_id,status)
    values (v_lead,'teste_catalogo_7_dias')
    on conflict (lead_id) do update set status=excluded.status,updated_at=now();
  insert into public.interacoes(lead_id,tipo,conteudo)
    select v_lead,'nota','Catálogo Optica Millena criado; teste grátis de 7 dias iniciado.'
    where not exists (
      select 1 from public.interacoes where lead_id=v_lead and tipo='nota'
        and conteudo='Catálogo Optica Millena criado; teste grátis de 7 dias iniciado.'
    );
end $$;
