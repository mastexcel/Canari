import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await (await b.newContext({ viewport: { width: 1800, height: 1200 } })).newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file:///tmp/claude-0/pub/modele.html');
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(1200);
const noms = ['statut-gain', 'statut-credit', 'carre-marque', 'carre-relance', 'carre-prix', 'banniere', 'flyer'];
for (const n of noms) {
  const e = await p.$('#' + n);
  await e.screenshot({ path: `store/pub/${n}.png` });
  const bb = await e.boundingBox();
  console.log(n, Math.round(bb.width) + '×' + Math.round(bb.height));
}
console.log('erreurs', errs);
await b.close();
