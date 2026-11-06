const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [,, modo, out, w = '1920', h = '1080'] = process.argv;   // modo: "teste" ou "tudo"
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
  await p.goto('file://' + path.join(__dirname, 'cena.html') + `?w=${w}&h=${h}`);
  await p.evaluate(() => document.fonts.ready);
  const fps = 30, total = 8 * fps;
  const tempos = modo === 'teste' ? [0.5, 1.8, 2.45, 3.2, 3.9, 4.65, 5.3, 6.0, 6.6, 7.95]
                                  : Array.from({ length: total }, (_, i) => i / fps);
  for (let i = 0; i < tempos.length; i++) {
    // passa por todos os quadros anteriores pra o borrao de movimento ter a velocidade certa
    await p.evaluate(t => { window.quadro(Math.max(0, t - 1/30)); window.quadro(t); }, tempos[i]);
    await p.screenshot({ path: path.join(out, String(i).padStart(4, '0') + '.png') });
  }
  await b.close();
})();
