update public.pl_catalog_stores
set
  primary_color = '#111111',
  tema = jsonb_build_object(
    'bg', '#FDC40D',
    'card', '#FFFFFF',
    'line', '#D39F00',
    'brand', '#111111',
    'dark', '#000000',
    'soft', 'rgba(17, 17, 17, 0.09)',
    'on', '#FFFFFF',
    'cta', '#111111',
    'ctaDark', '#000000',
    'onCta', '#FFFFFF'
  )
where slug = 'oticaesm';
