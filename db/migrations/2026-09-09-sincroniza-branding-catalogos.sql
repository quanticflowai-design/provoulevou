-- Sincroniza no banco as paletas de branding dos catálogos ativos.

with branding(slug, tema) as (
  values
    ('lojateste', '{"bg":"#FFF7FA","card":"#FFFFFF","line":"#F0D5E1","brand":"#9F1953","dark":"#7E1240","soft":"rgba(159,25,83,.10)","on":"#FFFFFF","cta":"#9F1953","onCta":"#FFFFFF","ctaDark":"#7E1240"}'::jsonb),
    ('provoulevou', '{"bg":"#F6F4FB","card":"#FFFFFF","line":"#ECE9F1","brand":"#6D3BEF","dark":"#4D24BD","soft":"#F1ECFE","on":"#FFFFFF","cta":"#6D3BEF","onCta":"#FFFFFF","ctaDark":"#4D24BD"}'::jsonb),
    ('mvotica', '{"bg":"#ffffff","card":"#ffffff","line":"#EFE6D2","brand":"#8F6D2E","dark":"#75581F","soft":"rgba(143,109,46,.12)","on":"#ffffff","cta":"#8F6D2E","onCta":"#ffffff","ctaDark":"#75581F"}'::jsonb),
    ('vyre', '{"bg":"#08132B","card":"#0E1D3D","line":"rgba(199,162,74,.28)","brand":"#C7A24A","dark":"#A9863A","soft":"rgba(199,162,74,.16)","on":"#08132B","cta":"#C7A24A","onCta":"#08132B","ctaDark":"#A9863A"}'::jsonb),
    ('valterotica', '{"bg":"#ffffff","card":"#ffffff","line":"#F0E2E1","brand":"#AC0300","dark":"#8A0200","soft":"rgba(172,3,0,.09)","on":"#ffffff","cta":"#AC0300","onCta":"#ffffff","ctaDark":"#8A0200"}'::jsonb),
    ('stilus', '{"bg":"#000000","card":"#0D0D0D","line":"rgba(212,166,60,.30)","brand":"#D4A63C","dark":"#B88C2C","soft":"rgba(212,166,60,.16)","on":"#000000","cta":"#D4A63C","onCta":"#000000","ctaDark":"#B88C2C"}'::jsonb),
    ('paranhos', '{"bg":"#151B63","card":"#1D247A","line":"rgba(254,238,5,.30)","brand":"#FEEE05","dark":"#E2D400","soft":"rgba(254,238,5,.15)","on":"#151B63","cta":"#FEEE05","onCta":"#151B63","ctaDark":"#E2D400"}'::jsonb),
    ('catglass', '{"bg":"#E6C4FF","card":"#FFFFFF","line":"rgba(116,15,217,.20)","brand":"#740FD9","dark":"#5E0BB0","soft":"rgba(116,15,217,.10)","on":"#ffffff","cta":"#740FD9","onCta":"#ffffff","ctaDark":"#5E0BB0"}'::jsonb),
    ('florao', '{"bg":"#FBF3E8","card":"#FFFFFF","line":"#EADDC7","brand":"#956C26","dark":"#7C5A1F","soft":"rgba(149,108,38,.12)","on":"#ffffff","cta":"#956C26","onCta":"#ffffff","ctaDark":"#7C5A1F"}'::jsonb),
    ('ruby', '{"bg":"#FFFFFF","card":"#FFFFFF","line":"#EFE3E3","brand":"#C22125","dark":"#9E1B1E","soft":"rgba(194,33,37,.10)","on":"#ffffff","cta":"#C22125","onCta":"#ffffff","ctaDark":"#9E1B1E"}'::jsonb),
    ('foreyes', '{"bg":"#EDEDEE","card":"#FFFFFF","line":"#E3E3E5","brand":"#B2326B","dark":"#8E2755","soft":"rgba(178,50,107,.10)","on":"#ffffff","cta":"#3F4448","ctaDark":"#2E3235","onCta":"#ffffff"}'::jsonb),
    ('carone', '{"bg":"#FFFFFF","card":"#FFFFFF","line":"#F6E1EC","brand":"#D1056D","dark":"#A80457","soft":"rgba(209,5,109,.10)","on":"#ffffff","cta":"#D1056D","onCta":"#ffffff","ctaDark":"#A80457"}'::jsonb),
    ('diamond', '{"bg":"#000000","card":"#101010","line":"rgba(242,205,124,.30)","brand":"#F2CD7C","dark":"#D9B265","soft":"rgba(242,205,124,.15)","on":"#0A0A0A","cta":"#F2CD7C","onCta":"#0A0A0A","ctaDark":"#D9B265"}'::jsonb),
    ('oticamatheus', '{"bg":"#000000","card":"#0D0D0D","line":"rgba(255,113,0,.30)","brand":"#FF7100","dark":"#E06200","soft":"rgba(255,113,0,.15)","on":"#0A0A0A","cta":"#FF7100","onCta":"#0A0A0A","ctaDark":"#E06200"}'::jsonb),
    ('oticapopular', '{"bg":"#FFFFFF","card":"#FFFFFF","line":"#E2E8F1","brand":"#184678","dark":"#123353","soft":"rgba(24,70,120,.10)","on":"#ffffff","cta":"#184678","onCta":"#ffffff","ctaDark":"#123353"}'::jsonb),
    ('oticamoderna', '{"bg":"#FFFFFF","card":"#FFFFFF","line":"#EDE7BC","brand":"#111111","dark":"#000000","soft":"rgba(255,255,0,.20)","on":"#ffffff","cta":"#111111","onCta":"#ffffff","ctaDark":"#000000"}'::jsonb),
    ('mendonca', '{"bg":"#87000E","card":"#9B0714","line":"rgba(248,147,31,.30)","brand":"#F8931F","dark":"#DE7F14","soft":"rgba(248,147,31,.15)","on":"#111111","cta":"#F8931F","onCta":"#111111","ctaDark":"#DE7F14"}'::jsonb),
    ('goulart', '{"bg":"#ffffff","card":"#ffffff","line":"#E8E8EA","brand":"#111111","dark":"#000000","soft":"rgba(17,17,17,.07)","on":"#ffffff","cta":"#111111","onCta":"#ffffff","ctaDark":"#000000"}'::jsonb),
    ('gcstore', '{"bg":"#ffffff","card":"#ffffff","line":"#EFE4CC","brand":"#96701F","dark":"#7C5E1C","soft":"rgba(196,152,55,.14)","on":"#ffffff","cta":"#96701F","onCta":"#ffffff","ctaDark":"#7C5E1C"}'::jsonb),
    ('millu', '{"bg":"#ffffff","card":"#ffffff","line":"#F5DDE8","brand":"#C43A72","dark":"#A32E5E","soft":"rgba(224,69,127,.12)","on":"#ffffff","cta":"#C43A72","onCta":"#ffffff","ctaDark":"#A32E5E"}'::jsonb),
    ('satika', '{"bg":"#ffffff","card":"#ffffff","line":"#F0DBDB","brand":"#B02828","dark":"#962222","soft":"rgba(176,40,40,.10)","on":"#ffffff","cta":"#B02828","onCta":"#ffffff","ctaDark":"#962222"}'::jsonb),
    ('oticadebora', '{"bg":"#ffffff","card":"#ffffff","line":"#D6ECEF","brand":"#137884","dark":"#0F5F69","soft":"rgba(26,173,183,.12)","on":"#ffffff","cta":"#137884","onCta":"#ffffff","ctaDark":"#0F5F69"}'::jsonb),
    ('dafflon', '{"bg":"#000000","card":"#101010","line":"#2A2A2A","brand":"#FFFFFF","dark":"#D9D9D9","soft":"rgba(255,255,255,.12)","on":"#000000","cta":"#FFFFFF","onCta":"#000000","ctaDark":"#D9D9D9"}'::jsonb),
    ('precisionprime', '{"bg":"#F3F3F3","card":"#FFFFFF","line":"#DCE4EA","brand":"#2F5F86","dark":"#244A69","soft":"rgba(47,95,134,.12)","on":"#FFFFFF","cta":"#2F5F86","onCta":"#FFFFFF","ctaDark":"#244A69"}'::jsonb),
    ('oticasocial', '{"bg":"#FFFFFF","card":"#FFFFFF","line":"#E6E6E6","brand":"#111111","dark":"#000000","soft":"rgba(17,17,17,.08)","on":"#FFFFFF","cta":"#111111","onCta":"#FFFFFF","ctaDark":"#000000"}'::jsonb),
    ('visaodf', '{"bg":"#FFFFFF","card":"#FFFFFF","line":"#D9E9E9","brand":"#0B6B6E","dark":"#075356","soft":"rgba(11,107,110,.10)","on":"#FFFFFF","cta":"#0B6B6E","onCta":"#FFFFFF","ctaDark":"#075356"}'::jsonb),
    ('visualmix', '{"bg":"#FFFFFF","card":"#FFFFFF","line":"#EADDD8","brand":"#7A4030","dark":"#603124","soft":"rgba(122,64,48,.10)","on":"#FFFFFF","cta":"#7A4030","onCta":"#FFFFFF","ctaDark":"#603124"}'::jsonb),
    ('studiovisual', '{"bg":"#FFFFFF","card":"#FFFFFF","line":"#F2D7D7","brand":"#C5161D","dark":"#9F1016","soft":"rgba(197,22,29,.10)","on":"#FFFFFF","cta":"#C5161D","onCta":"#FFFFFF","ctaDark":"#9F1016"}'::jsonb),
    ('rever', '{"bg":"#FFFFFF","card":"#FFFFFF","line":"#D9E7F7","brand":"#0868C9","dark":"#0754A1","soft":"rgba(8,104,201,.10)","on":"#FFFFFF","cta":"#0868C9","onCta":"#FFFFFF","ctaDark":"#0754A1"}'::jsonb),
    ('bamboo', '{"bg":"#FFFFFF","card":"#FFFFFF","line":"#E6DADC","brand":"#B30B20","dark":"#8E0919","soft":"rgba(179,11,32,.10)","on":"#FFFFFF","cta":"#B30B20","onCta":"#FFFFFF","ctaDark":"#8E0919"}'::jsonb),
    ('sabrina', '{"bg":"#FFFFFF","card":"#FFFFFF","line":"#E6E6E6","brand":"#1F1B1C","dark":"#000000","soft":"rgba(31,27,28,.08)","on":"#FFFFFF","cta":"#1F1B1C","onCta":"#FFFFFF","ctaDark":"#000000"}'::jsonb),
    ('clubdosoculos', '{"bg":"#FFF8F0","card":"#FFFFFF","line":"#F0D8BF","brand":"#D96F0C","dark":"#A94E05","soft":"rgba(217,111,12,.12)","on":"#111111","cta":"#D96F0C","onCta":"#111111","ctaDark":"#A94E05"}'::jsonb),
    ('santaefigenia', '{"bg":"#FFF8F3","card":"#FFFFFF","line":"#F2D8CC","brand":"#F15A24","dark":"#C74316","soft":"rgba(241,90,36,.11)","on":"#111111","cta":"#F15A24","onCta":"#111111","ctaDark":"#C74316"}'::jsonb),
    ('oticasrufins', '{"bg":"#FFFDF4","card":"#FFFFFF","line":"#EEE4B8","brand":"#3F3F43","dark":"#3F3F43","soft":"rgba(224,185,0,.13)","on":"#FFFFFF","cta":"#E0B900","onCta":"#111111","ctaDark":"#3F3F43"}'::jsonb),
    ('oticasalvador', '{"bg":"#F5FCFC","card":"#FFFFFF","line":"#CFE9E7","brand":"#287F7B","dark":"#287F7B","soft":"rgba(85,189,184,.12)","on":"#FFFFFF","cta":"#55BDB8","onCta":"#111111","ctaDark":"#287F7B"}'::jsonb),
    ('olhodgatto', '{"bg":"#FCF8FF","card":"#FFFFFF","line":"#E8D7F5","brand":"#7A16C7","dark":"#4E0B8A","soft":"rgba(122,22,199,.11)","on":"#FFFFFF","cta":"#7A16C7","onCta":"#FFFFFF","ctaDark":"#4E0B8A"}'::jsonb),
    ('lumesunglasses', '{"bg":"#FFF9F4","card":"#FFFFFF","line":"#EAD9CC","brand":"#54240D","dark":"#321205","soft":"rgba(84,36,13,.10)","on":"#FFFFFF","cta":"#54240D","onCta":"#FFFFFF","ctaDark":"#321205"}'::jsonb),
    ('carolaoculos', '{"bg":"#F8F8F9","card":"#FFFFFF","line":"#DEDEE2","brand":"#414044","dark":"#222124","soft":"rgba(65,64,68,.09)","on":"#FFFFFF","cta":"#414044","onCta":"#FFFFFF","ctaDark":"#222124"}'::jsonb),
    ('oticakadima', '{"bg":"#F5F9FD","card":"#FFFFFF","line":"#D4E2F0","brand":"#123C70","dark":"#082447","soft":"rgba(18,60,112,.11)","on":"#FFFFFF","cta":"#123C70","onCta":"#FFFFFF","ctaDark":"#082447"}'::jsonb),
    ('oticasporto', '{"bg":"#F4FCFA","card":"#FFFFFF","line":"#CDEBE4","brand":"#111064","dark":"#08073F","soft":"rgba(45,207,167,.13)","on":"#FFFFFF","cta":"#111064","onCta":"#FFFFFF","ctaDark":"#08073F"}'::jsonb),
    ('oculosguill', '{"bg":"#F7F7F7","card":"#FFFFFF","line":"#DEDEDE","brand":"#111111","dark":"#000000","soft":"rgba(17,17,17,.09)","on":"#FFFFFF","cta":"#111111","onCta":"#FFFFFF","ctaDark":"#000000"}'::jsonb),
    ('nyllotica', '{"bg":"#F4FBFF","card":"#FFFFFF","line":"#D8EAF5","brand":"#36358F","dark":"#28276F","soft":"rgba(54,53,143,.10)","on":"#FFFFFF","cta":"#36358F","onCta":"#FFFFFF","ctaDark":"#28276F"}'::jsonb),
    ('oticaesm', '{"bg":"#FDC40D","card":"#FFFFFF","line":"rgba(17,17,17,.20)","brand":"#111111","dark":"#000000","soft":"rgba(17,17,17,.10)","on":"#FFFFFF","cta":"#111111","ctaDark":"#000000","onCta":"#FFFFFF"}'::jsonb)
)
update public.pl_catalog_stores c
   set tema = b.tema, updated_at = now()
  from branding b
 where c.slug = b.slug;
