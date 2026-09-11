-- Lu Ótica: catálogo, gerador autenticado e teste grátis no CRM.
insert into public.pl_catalog_stores
  (slug,display_name,logo_url,whatsapp,bio,primary_color,store_api_key,owner_email,plan,is_active,tema,limite_diario)
select 'luotica','Lu Ótica',
       'https://provoulevou.com.br/catalogo/assets/logo-luotica.webp',
       '5521976904584','Lu Ótica','#D41467','pl_cat_'||encode(gen_random_bytes(32),'hex'),
       'ronaldojose35@hotmail.com','basic',true,
       '{"bg":"#FFF7FB","card":"#FFFFFF","line":"#F0CADB","brand":"#C91061","dark":"#24131B","soft":"rgba(212,20,103,.11)","on":"#FFFFFF","cta":"#D41467","ctaDark":"#AA0E50","onCta":"#FFFFFF"}'::jsonb,5
where not exists (
  select 1 from public.pl_catalog_stores
  where slug='luotica' or lower(owner_email)='ronaldojose35@hotmail.com'
);

insert into public.provou_levou_stores
  (name,domain,email,active,company,phone,plan,status,api_key_hash,api_key_prefix,api_key_last4,api_key_created_at,api_key_active,platform,categoria)
select c.display_name,'https://provoulevou.com.br/catalogo/?loja='||c.slug,c.owner_email,true,c.display_name,c.whatsapp,
       'Teste Grátis — Catálogo','Teste Gratuito',encode(digest(c.store_api_key,'sha256'),'hex'),
       left(encode(digest(c.store_api_key,'sha256'),'hex'),15),right(c.store_api_key,4),now(),true,'catalogo','Óculos'
from public.pl_catalog_stores c
where c.slug='luotica'
  and not exists (
    select 1 from public.provou_levou_stores p
    where p.api_key_hash=encode(digest(c.store_api_key,'sha256'),'hex')
  );

insert into public.leads
  (instagram,nome_loja,seguidores,tem_provador,status,notas,idioma,ponto_positivo,fonte_oportunidade,telefone,email,whatsapp,categoria,pais,plataforma)
select 'whatsapp_5521976904584','Lu Ótica',0,false,'testando',
       'Registrado pelo deploy do Provou Catálogo. Catálogo criado para teste grátis de 7 dias.',
       'pt',true,'WhatsApp','5521976904584','ronaldojose35@hotmail.com','5521976904584','oculos','BR','instagram'
where not exists (
  select 1 from public.leads
  where lower(coalesce(email,''))='ronaldojose35@hotmail.com'
     or regexp_replace(coalesce(telefone,''),'\D','','g') in ('21976904584','5521976904584')
     or regexp_replace(coalesce(whatsapp,''),'\D','','g') in ('21976904584','5521976904584')
);

update public.leads
set nome_loja='Lu Ótica',status='testando',
    email=coalesce(nullif(email,''),'ronaldojose35@hotmail.com'),
    whatsapp=coalesce(nullif(whatsapp,''),'5521976904584'),updated_at=now()
where lower(coalesce(email,''))='ronaldojose35@hotmail.com'
   or regexp_replace(coalesce(telefone,''),'\D','','g') in ('21976904584','5521976904584')
   or regexp_replace(coalesce(whatsapp,''),'\D','','g') in ('21976904584','5521976904584');

insert into public.crm_lead_etapas (lead_id,status,updated_at)
select id,'teste_catalogo_7_dias',now()
from public.leads
where lower(coalesce(email,''))='ronaldojose35@hotmail.com'
   or regexp_replace(coalesce(telefone,''),'\D','','g') in ('21976904584','5521976904584')
   or regexp_replace(coalesce(whatsapp,''),'\D','','g') in ('21976904584','5521976904584')
on conflict (lead_id) do update set status=excluded.status,updated_at=excluded.updated_at;

insert into public.interacoes (lead_id,tipo,conteudo,created_at)
select l.id,'nota','Catálogo da Lu Ótica criado e lead movido para o teste grátis de 7 dias.',now()
from public.leads l
where (lower(coalesce(l.email,''))='ronaldojose35@hotmail.com'
    or regexp_replace(coalesce(l.telefone,''),'\D','','g') in ('21976904584','5521976904584')
    or regexp_replace(coalesce(l.whatsapp,''),'\D','','g') in ('21976904584','5521976904584'))
  and not exists (
    select 1 from public.interacoes i
    where i.lead_id=l.id
      and i.conteudo='Catálogo da Lu Ótica criado e lead movido para o teste grátis de 7 dias.'
  );
