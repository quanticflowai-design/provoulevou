update public.pl_catalog_stores
set
  logo_url = 'https://provoulevou.com.br/catalogo/assets/logo-oticas-prime-magrini.webp',
  primary_color = '#B67800',
  tema = jsonb_build_object(
    'bg', '#FBF8F1',
    'card', '#FFFFFF',
    'brand', '#B67800',
    'cta', '#171717',
    'onCta', '#FFFFFF',
    'line', '#E8D8B8',
    'muted', '#665F55',
    'soft', 'rgba(182, 120, 0, 0.12)',
    'ctaDark', '#000000'
  )
where slug = 'oticasprimemagrini';
