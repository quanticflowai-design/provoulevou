-- Logo e paleta extraídos da arte enviada pela loja.
update public.pl_catalog_stores
set logo_url = 'https://provoulevou.com.br/catalogo/assets/logo-optica-millena.webp',
    primary_color = '#A30B98',
    tema = '{"bg":"#EAF8F6","card":"#FFFFFF","line":"#C9DFEE","brand":"#A30B98","dark":"#790A72","soft":"#F9EAF8","on":"#FFFFFF","cta":"#A30B98","ctaDark":"#790A72","onCta":"#FFFFFF"}'::jsonb
where slug = 'opticamillena';
