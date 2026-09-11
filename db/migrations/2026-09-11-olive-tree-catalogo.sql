-- Olive Tree: catálogo, gerador autenticado e teste grátis no CRM.
insert into public.pl_catalog_stores
  (slug,display_name,logo_url,whatsapp,bio,primary_color,store_api_key,owner_email,plan,is_active,tema,limite_diario)
select 'olivetree','Olive Tree',
       'https://provoulevou.com.br/catalogo/assets/logo-olive-tree.webp',
       '5551992896189','Olive Tree','#4C1626','pl_cat_'||encode(gen_random_bytes(32),'hex'),
       'fe_sci@hotmail.com','basic',true,
       '{"bg":"#FBF7F8","card":"#FFFFFF","line":"#E7D8DC","brand":"#4C1626","dark":"#21171A","soft":"rgba(76,22,38,.10)","on":"#FFFFFF","cta":"#4C1626","ctaDark":"#35101B","onCta":"#FFFFFF"}'::jsonb,5
where not exists (
  select 1 from public.pl_catalog_stores
  where slug='olivetree' or lower(owner_email)='fe_sci@hotmail.com'
);

insert into public.provou_levou_stores
  (name,domain,email,active,company,phone,plan,status,api_key_hash,api_key_prefix,api_key_last4,api_key_created_at,api_key_active,platform,categoria)
select c.display_name,'https://provoulevou.com.br/catalogo/?loja='||c.slug,c.owner_email,true,c.display_name,c.whatsapp,
       'Teste Grátis — Catálogo','Teste Gratuito',encode(digest(c.store_api_key,'sha256'),'hex'),
       left(encode(digest(c.store_api_key,'sha256'),'hex'),15),right(c.store_api_key,4),now(),true,'catalogo','Óculos'
from public.pl_catalog_stores c
where c.slug='olivetree'
  and not exists (
    select 1 from public.provou_levou_stores p
    where p.api_key_hash=encode(digest(c.store_api_key,'sha256'),'hex')
  );

insert into public.leads
  (instagram,nome_loja,seguidores,tem_provador,status,notas,idioma,ponto_positivo,fonte_oportunidade,telefone,email,whatsapp,categoria,pais,plataforma)
select 'whatsapp_5551992896189','Olive Tree',0,false,'testando',
       'Registrado pelo deploy do Provou Catálogo. Catálogo criado para teste grátis de 7 dias.',
       'pt',true,'WhatsApp','5551992896189','fe_sci@hotmail.com','5551992896189','oculos','BR','instagram'
where not exists (
  select 1 from public.leads
  where lower(coalesce(email,''))='fe_sci@hotmail.com'
     or regexp_replace(coalesce(telefone,''),'\D','','g') in ('51992896189','5551992896189')
     or regexp_replace(coalesce(whatsapp,''),'\D','','g') in ('51992896189','5551992896189')
);

update public.leads
set nome_loja='Olive Tree',status='testando',
    email=coalesce(nullif(email,''),'fe_sci@hotmail.com'),
    whatsapp=coalesce(nullif(whatsapp,''),'5551992896189'),updated_at=now()
where lower(coalesce(email,''))='fe_sci@hotmail.com'
   or regexp_replace(coalesce(telefone,''),'\D','','g') in ('51992896189','5551992896189')
   or regexp_replace(coalesce(whatsapp,''),'\D','','g') in ('51992896189','5551992896189');

insert into public.crm_lead_etapas (lead_id,status,updated_at)
select id,'teste_catalogo_7_dias',now()
from public.leads
where lower(coalesce(email,''))='fe_sci@hotmail.com'
   or regexp_replace(coalesce(telefone,''),'\D','','g') in ('51992896189','5551992896189')
   or regexp_replace(coalesce(whatsapp,''),'\D','','g') in ('51992896189','5551992896189')
on conflict (lead_id) do update set status=excluded.status,updated_at=excluded.updated_at;

insert into public.interacoes (lead_id,tipo,conteudo,created_at)
select l.id,'nota','Catálogo da Olive Tree criado e lead movido para o teste grátis de 7 dias.',now()
from public.leads l
where (lower(coalesce(l.email,''))='fe_sci@hotmail.com'
    or regexp_replace(coalesce(l.telefone,''),'\D','','g') in ('51992896189','5551992896189')
    or regexp_replace(coalesce(l.whatsapp,''),'\D','','g') in ('51992896189','5551992896189'))
  and not exists (
    select 1 from public.interacoes i
    where i.lead_id=l.id
      and i.conteudo='Catálogo da Olive Tree criado e lead movido para o teste grátis de 7 dias.'
  );
