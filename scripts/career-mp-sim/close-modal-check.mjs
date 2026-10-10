// The host close confirm opens as a modal in the lobby and in the room modal; T13 screenshots
import { mkdirSync } from 'node:fs';
import { setLocale } from './setLocale.mjs';
const puppeteer = (await import(process.env.PUPPETEER_CORE ?? 'puppeteer-core')).default;
const OUT = process.env.SHOTS_DIR ?? `${import.meta.dirname}/output`;
mkdirSync(OUT, { recursive: true });
const B = 'http://localhost:3000/api/career-mp';
const post = (url, body, token) => fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(token ? { 'x-coach-token': token } : {}) }, body: JSON.stringify(body) }).then((r) => r.json());
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const host = await post(`${B}/rooms`, { coachName: 'Host', slug: 'nikola' });
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage();
// The buttons are found by their English text
await setLocale(page);
await page.setViewport({ width: 1100, height: 900, deviceScaleFactor: 2 });
const click = async (t) => { const hit = await page.evaluate((t) => { const b = [...document.querySelectorAll('button')].find((e) => e.textContent?.trim() === t); b?.click(); return !!b; }, t); await wait(500); return hit; };
const inModal = () => page.evaluate(() => { const p = [...document.querySelectorAll('p')].find((e) => e.textContent?.startsWith('The room shuts down')); return p ? Boolean(p.closest('.fixed')) : null; });
await page.goto(`http://localhost:3000/rivals/${host.code}#token=${host.token}`, { waitUntil: 'networkidle0' });
await wait(1500);
console.log('lobby: open confirm', await click('Close room'), 'confirm in a fixed modal:', await inModal());
await page.screenshot({ path: `${OUT}/T13-lobby-close-modal.png` });
console.log('lobby: Never mind closes it', await click('Never mind'), 'confirm left:', await inModal());
const v = (await fetch(`${B}/rooms/${host.code}`, { headers: { 'x-coach-token': host.token } }).then((r) => r.json())).version;
await post(`${B}/rooms/${host.code}/actions`, { action: { type: 'start' }, expectVersion: v }, host.token);
await page.reload({ waitUntil: 'networkidle0' });
await wait(1500);
for (let i = 0; i < 6; i++) { if (!(await click('To the off-season')) && !(await click('Continue'))) break; }
console.log('room: open room modal', await click(host.code));
console.log('room: open confirm', await click('Close room'), 'confirm in a fixed modal:', await inModal());
await page.screenshot({ path: `${OUT}/T13-room-close-modal.png` });
await browser.close();
