-- Ótica Olho D'Gatto e Lume Sunglasses: catálogos, gerador e teste grátis no CRM.

with lojas(slug, nome, logo, telefone, email, cor, tema) as (
  values
    ('olhodgatto', 'Ótica Olho D''Gatto',
     'https://cdn.jsdelivr.net/gh/quanticflowai-design/provoulevou@1427952/catalogo/assets/logo-olhodgatto.webp',
     '5584994655858', 'olhodgatto07@gmail.com', '#7A16C7',
     '{"bg":"#fcf8ff","card":"#ffffff","brand":"#7A16C7","cta":"#4E0B8A","onCta":"#ffffff"}'::jsonb),
    ('lumesunglasses', 'Lume Sunglasses',
     'https://cdn.jsdelivr.net/gh/quanticflowai-design/provoulevou@1427952/catalogo/assets/logo-lumesunglasses.webp',
     '5598991443295', 'lumeoculos@gmail.com', '#54240D',
     '{"bg":"#fff9f4","card":"#ffffff","brand":"#54240D","cta":"#321205","onCta":"#ffffff"}'::jsonb)
)
insert into public.pl_catalog_stores (
  slug, display_name, logo_url, whatsapp, bio, primary_color,
  store_api_key, owner_email, plan, is_active, tema, limite_diario
)
select l.slug, l.nome, l.logo, l.telefone, l.nome, l.cor,
       'pl_cat_' || encode(gen_random_bytes(32), 'hex'),
       l.email, 'basic', true, l.tema, 3
  from lojas l
 where not exists (
   select 1 from public.pl_catalog_stores c
    where c.slug = l.slug or lower(c.owner_email) = l.email
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
  right(c.store_api_key, 4), now(), true, 'catalogo', 'Óculos'
from public.pl_catalog_stores c
where c.slug in ('olhodgatto', 'lumesunglasses')
  and not exists (
    select 1 from public.provou_levou_stores p
     where p.api_key_hash = encode(digest(c.store_api_key, 'sha256'), 'hex')
  );

with lojas(instagram, nome, telefone, email) as (
  values
    ('whatsapp_5584994655858', 'Ótica Olho D''Gatto', '5584994655858', 'olhodgatto07@gmail.com'),
    ('whatsapp_5598991443295', 'Lume Sunglasses', '5598991443295', 'lumeoculos@gmail.com')
)
insert into public.leads (
  instagram, nome_loja, seguidores, tem_provador, status, notas,
  idioma, ponto_positivo, fonte_oportunidade, telefone, email, whatsapp,
  categoria, pais, plataforma
)
select l.instagram, l.nome, 0, false, 'testando',
       'Registrado pelo deploy do Provou Catálogo. Catálogo criado para teste grátis de 7 dias.',
       'pt', true, 'WhatsApp', l.telefone, l.email, l.telefone,
       'oculos', 'BR', 'instagram'
  from lojas l
 where not exists (
   select 1 from public.leads x
    where x.instagram = l.instagram
       or regexp_replace(coalesce(x.telefone, ''), '\D', '', 'g') = l.telefone
       or regexp_replace(coalesce(x.whatsapp, ''), '\D', '', 'g') = l.telefone
 );

with lojas(instagram, telefone, email) as (
  values
    ('whatsapp_5584994655858', '5584994655858', 'olhodgatto07@gmail.com'),
    ('whatsapp_5598991443295', '5598991443295', 'lumeoculos@gmail.com')
)
update public.leads l
   set status = 'testando',
       email = coalesce(l.email, x.email),
       whatsapp = coalesce(l.whatsapp, x.telefone),
       updated_at = now()
  from lojas x
 where l.instagram = x.instagram
    or regexp_replace(coalesce(l.telefone, ''), '\D', '', 'g') = x.telefone
    or regexp_replace(coalesce(l.whatsapp, ''), '\D', '', 'g') = x.telefone;

with lojas(instagram, telefone) as (
  values
    ('whatsapp_5584994655858', '5584994655858'),
    ('whatsapp_5598991443295', '5598991443295')
)
insert into public.crm_lead_etapas (lead_id, status, updated_at)
select l.id, 'teste_catalogo_7_dias', now()
  from public.leads l
  join lojas x on l.instagram = x.instagram
    or regexp_replace(coalesce(l.telefone, ''), '\D', '', 'g') = x.telefone
    or regexp_replace(coalesce(l.whatsapp, ''), '\D', '', 'g') = x.telefone
on conflict (lead_id) do update
set status = excluded.status, updated_at = excluded.updated_at;

with lojas(instagram, telefone, conteudo) as (
  values
    ('whatsapp_5584994655858', '5584994655858',
     'Catálogo da Ótica Olho D''Gatto criado e lead movido para o teste grátis de 7 dias.'),
    ('whatsapp_5598991443295', '5598991443295',
     'Catálogo da Lume Sunglasses criado e lead movido para o teste grátis de 7 dias.')
)
insert into public.interacoes (lead_id, tipo, conteudo, created_at)
select l.id, 'nota', x.conteudo, now()
  from public.leads l
  join lojas x on l.instagram = x.instagram
    or regexp_replace(coalesce(l.telefone, ''), '\D', '', 'g') = x.telefone
    or regexp_replace(coalesce(l.whatsapp, ''), '\D', '', 'g') = x.telefone
 where not exists (
   select 1 from public.interacoes i
    where i.lead_id = l.id and i.conteudo = x.conteudo
 );
