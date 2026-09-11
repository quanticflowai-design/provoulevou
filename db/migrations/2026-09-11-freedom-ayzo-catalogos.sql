-- Óticas Freedom e Ayzo: catálogos, autenticação do gerador e teste grátis no CRM.

insert into public.pl_catalog_stores (
  slug, display_name, logo_url, whatsapp, bio, primary_color,
  store_api_key, owner_email, plan, is_active, tema, limite_diario
)
select * from (values
  (
    'oticasfreedom', 'Óticas Freedom',
    'https://cdn.jsdelivr.net/gh/quanticflowai-design/provoulevou@cee7517/catalogo/assets/logo-oticasfreedom.webp',
    '554130560707', 'Óticas Freedom', '#F2A51A',
    'pl_cat_' || encode(gen_random_bytes(32), 'hex'),
    'oticafreedom@gmail.com', 'basic', true,
    '{"bg":"#101050","card":"#18205F","brand":"#F2A51A","cta":"#F2A51A","onCta":"#101050"}'::jsonb,
    3
  ),
  (
    'ayzo', 'Ayzo',
    'https://cdn.jsdelivr.net/gh/quanticflowai-design/provoulevou@50998da/catalogo/assets/logo-ayzo.webp',
    '5594984348873', 'Ayzo', '#211812',
    'pl_cat_' || encode(gen_random_bytes(32), 'hex'),
    'ayzocompany.suporte@gmail.com', 'basic', true,
    '{"bg":"#E6DDD3","card":"#F8F4EF","brand":"#211812","cta":"#211812","onCta":"#FFFFFF"}'::jsonb,
    3
  )
) as v(slug, display_name, logo_url, whatsapp, bio, primary_color,
       store_api_key, owner_email, plan, is_active, tema, limite_diario)
where not exists (
  select 1 from public.pl_catalog_stores c
   where c.slug = v.slug or lower(c.owner_email) = lower(v.owner_email)
);

insert into public.provou_levou_stores (
  name, domain, email, active, company, phone, plan, status,
  api_key_hash, api_key_prefix, api_key_last4, api_key_created_at,
  api_key_active, platform, categoria
)
select
  c.display_name, 'https://provoulevou.com.br/catalogo/?loja=' || c.slug,
  c.owner_email, true, c.display_name, c.whatsapp,
  'Teste Grátis — Catálogo', 'Teste Gratuito',
  encode(digest(c.store_api_key, 'sha256'), 'hex'),
  left(encode(digest(c.store_api_key, 'sha256'), 'hex'), 15),
  right(c.store_api_key, 4), now(), true, 'catalogo',
  case when c.slug = 'ayzo' then 'roupa' else 'oculos' end
from public.pl_catalog_stores c
where c.slug in ('oticasfreedom', 'ayzo')
  and not exists (
    select 1 from public.provou_levou_stores p
     where p.api_key_hash = encode(digest(c.store_api_key, 'sha256'), 'hex')
  );

insert into public.leads (
  instagram, nome_loja, seguidores, tem_provador, status, notas,
  idioma, ponto_positivo, fonte_oportunidade, telefone, email, whatsapp,
  categoria, pais, plataforma
)
select * from (values
  ('whatsapp_554130560707', 'Óticas Freedom', 0, false, 'testando',
   'Registrado pelo deploy do Provou Catálogo. Catálogo criado para teste grátis de 7 dias.',
   'pt', true, 'WhatsApp', '554130560707', 'oticafreedom@gmail.com', '554130560707', 'oculos', 'BR', 'instagram'),
  ('whatsapp_5594984348873', 'Ayzo', 0, false, 'testando',
   'Registrado pelo deploy do Provou Catálogo. Catálogo criado para teste grátis de 7 dias.',
   'pt', true, 'WhatsApp', '5594984348873', 'ayzocompany.suporte@gmail.com', '5594984348873', 'roupa', 'BR', 'instagram')
) as v(instagram, nome_loja, seguidores, tem_provador, status, notas,
       idioma, ponto_positivo, fonte_oportunidade, telefone, email, whatsapp,
       categoria, pais, plataforma)
where not exists (
  select 1 from public.leads l
   where l.instagram = v.instagram
      or regexp_replace(coalesce(l.telefone, ''), '\D', '', 'g') in
         (regexp_replace(v.telefone, '^55', ''), v.telefone)
      or regexp_replace(coalesce(l.whatsapp, ''), '\D', '', 'g') in
         (regexp_replace(v.whatsapp, '^55', ''), v.whatsapp)
);

update public.leads l
   set status = 'testando',
       email = coalesce(l.email, v.email),
       whatsapp = coalesce(l.whatsapp, v.whatsapp),
       updated_at = now()
  from (values
    ('whatsapp_554130560707', '554130560707', 'oticafreedom@gmail.com'),
    ('whatsapp_5594984348873', '5594984348873', 'ayzocompany.suporte@gmail.com')
  ) as v(instagram, whatsapp, email)
 where l.instagram = v.instagram
    or regexp_replace(coalesce(l.telefone, ''), '\D', '', 'g') in
       (regexp_replace(v.whatsapp, '^55', ''), v.whatsapp)
    or regexp_replace(coalesce(l.whatsapp, ''), '\D', '', 'g') in
       (regexp_replace(v.whatsapp, '^55', ''), v.whatsapp);

insert into public.crm_lead_etapas (lead_id, status, updated_at)
select l.id, 'teste_catalogo_7_dias', now()
  from public.leads l
 where l.instagram in ('whatsapp_554130560707', 'whatsapp_5594984348873')
on conflict (lead_id) do update
set status = excluded.status, updated_at = excluded.updated_at;

insert into public.interacoes (lead_id, tipo, conteudo, created_at)
select l.id, 'nota',
       'Provou Catálogo criado e lead movido para o teste grátis de 7 dias.', now()
  from public.leads l
 where l.instagram in ('whatsapp_554130560707', 'whatsapp_5594984348873')
   and not exists (
     select 1 from public.interacoes i where i.lead_id = l.id
       and i.conteudo = 'Provou Catálogo criado e lead movido para o teste grátis de 7 dias.'
   );
