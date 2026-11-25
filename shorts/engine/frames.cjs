// node frames.cjs <html> <outdir> t1 t2 ...
const { chromium } = require('playwright');
(async () => {
  const [,, html, out, ...ts] = process.argv;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + require('path').resolve(html)); await p.evaluate(async () => { await window.ready; });
  for (const t of ts) { await p.evaluate(t => window.renderAt(+t), t); await p.screenshot({ path: `${out}/f_${String(t).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 80 }); }
  if (errs.length) console.log('ERRORS', errs);
  await b.close();
})();
