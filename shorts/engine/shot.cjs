const { chromium } = require('playwright');
(async () => {
  const [,, url, out, w = '1400', h = '1100', t] = process.argv;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: +h } });
  await p.goto(url); await p.evaluate(() => document.fonts.ready);
  if (t !== undefined) await p.evaluate(async (t) => { await window.ready; window.renderAt(+t); }, t);
  await p.waitForTimeout(200);
  await p.screenshot({ path: out }); await b.close();
})();
