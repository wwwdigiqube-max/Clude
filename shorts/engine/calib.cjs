// node calib.cjs <html> <out.jpg> t x y size   — render frame t and crop a square around (x,y) on screen
const { chromium } = require('playwright');
(async () => {
  const [,, html, out, ...rest] = process.argv;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + require('path').resolve(html)); await p.evaluate(async () => { await window.ready; });
  for (let i = 0; i < rest.length; i += 5) {
    const [t, x, y, sz, name] = rest.slice(i, i + 5);
    await p.evaluate(t => window.renderAt(+t), t);
    await p.screenshot({ path: `${out}/${name}.png`, clip: { x: Math.max(0, +x - sz / 2), y: Math.max(0, +y - sz / 2), width: +sz, height: +sz } });
  }
  await b.close();
})();
