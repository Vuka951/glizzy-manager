// /preview/animations: pages through both report overlays screen by screen; T15 screenshots
import { mkdirSync } from 'node:fs';
import { setSerbianLocale } from './serbianLocale.mjs';
const puppeteer = (await import(process.env.PUPPETEER_CORE ?? 'puppeteer-core')).default;
const OUT = process.env.SHOTS_DIR ?? `${import.meta.dirname}/output`;
mkdirSync(OUT, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage();
// The buttons are found by their Serbian text
await setSerbianLocale(page);
await page.setViewport({ width: 1200, height: 900, deviceScaleFactor: 1.2 });
page.on('pageerror', (e) => console.log('pageerror', e.message));
await page.goto('http://localhost:3000/preview/animations', { waitUntil: 'networkidle0', timeout: 120000 });
await wait(1200);
const click = (t) => page.evaluate((t) => { const b = [...document.querySelectorAll('button')].find((e) => e.textContent?.trim() === t); b?.click(); return !!b; }, t);
const scrollOverlay = (y) => page.evaluate((y) => { const o = document.querySelector('.fixed.inset-0.z-50'); if (o) o.scrollTop = y; return o ? o.scrollHeight : 0; }, y);
for (const [label, mode] of [['sp', 'Otvori izveštaj (jedan igrač)'], ['mp', 'Otvori izveštaj (Glizi Rivals)']]) {
  await click(mode); await wait(1200);
  const total = await scrollOverlay(0);
  let i = 0;
  for (let y = 0; y < total; y += 850) { await scrollOverlay(y); await wait(250); await page.screenshot({ path: `${OUT}/T15-${label}-${i++}.png` }); }
  console.log(label, 'height', total, 'pages', i);
  await click('Zatvori'); await wait(400);
}
await browser.close();
