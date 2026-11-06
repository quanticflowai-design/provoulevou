# Vídeo da Visão Geral (hero)

`assets/videos/painel-visao-geral.mp4` é gerado a partir de `cena.html`, uma recriação da Visão Geral do painel
com câmera, contadores e barras animados por tempo (`window.quadro(t)`).

Para gerar de novo (precisa de Playwright e ffmpeg):

```bash
mkdir -p fonts frames
cp ../../helveticanowdisplay-medium.ttf ../../assets/fonts/helvetica-light.ttf fonts/
cp ../../assets/logo-provou-colorido.png logo.png
node render.js tudo frames
ffmpeg -framerate 30 -i frames/%04d.png -vf "noise=alls=3:allf=t,format=yuv420p" \
  -c:v libx264 -preset slow -crf 23 -movflags +faststart -an ../../assets/videos/painel-visao-geral.mp4
ffmpeg -i frames/0239.png -quality 82 ../../assets/videos/painel-visao-geral.webp
```

7 planos com ângulos em 3D; renderizado em 1920x1080. Os números da cena são os mesmos do print `assets/demo/dashboard-painel-lojista.png`.

Versão em pé para o celular (4:5), mesmos planos com zoom ajustado:

```bash
node render.js tudo frames-pe 1080 1350
ffmpeg -framerate 30 -i frames-pe/%04d.png -vf "noise=alls=3:allf=t,format=yuv420p" \
  -c:v libx264 -preset slow -crf 24 -movflags +faststart -an ../../assets/videos/painel-visao-geral-mobile.mp4
ffmpeg -i frames-pe/0239.png -quality 82 ../../assets/videos/painel-visao-geral-mobile.webp
```
