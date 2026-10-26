const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [,, modo, out] = process.argv;   // modo: "teste" ou "tudo"
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 758 }, deviceScaleFactor: 1 });
  await p.goto('file://' + path.join(__dirname, 'cena.html'));
  await p.evaluate(() => document.fonts.ready);
  const fps = 30, total = 8 * fps;
  const tempos = modo === 'teste' ? [0.4, 1.4, 2.3, 2.85, 3.5, 4.4, 5.2, 6.0, 6.4, 7.9]
                                  : Array.from({ length: total }, (_, i) => i / fps);
  for (let i = 0; i < tempos.length; i++) {
    // passa por todos os quadros anteriores pra o borrao de movimento ter a velocidade certa
    await p.evaluate(t => { window.quadro(Math.max(0, t - 1/30)); window.quadro(t); }, tempos[i]);
    await p.screenshot({ path: path.join(out, String(i).padStart(4, '0') + '.png') });
  }
  await b.close();
})();
