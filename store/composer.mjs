// Compose les visuels de la fiche Play Store. À lancer depuis la RACINE du projet,
// avec « python3 -m http.server 8767 » en route :  node store/composer.mjs
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await (await b.newContext({ viewport: { width: 1100, height: 2000 } })).newPage();
await p.goto('http://localhost:8767/store/preview.html');
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
await p.locator('#banniere').screenshot({ path: 'store/banniere-1024x500.png' });
for (let i = 1; i <= 5; i++) {
  await p.locator('#s' + i).screenshot({ path: `store/capture-${i}.png` });
}
console.log('fait'); await b.close();
