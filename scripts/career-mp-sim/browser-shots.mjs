// Screenshots for the room board, the room modal with the host's close
// control, and the closed screen. Needs the dev server on :3000.
import { mkdirSync } from 'node:fs';
import { setLocale } from './setLocale.mjs';
const puppeteer = (await import(process.env.PUPPETEER_CORE ?? 'puppeteer-core')).default;
const OUT = process.env.SHOTS_DIR ?? `${import.meta.dirname}/output`;
mkdirSync(OUT, { recursive: true });
const B = 'http://localhost:3000/api/career-mp';
const post = (url, body, token) => fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(token ? { 'x-coach-token': token } : {}) }, body: JSON.stringify(body) }).then((r) => r.json());
const host = await post(`${B}/rooms`, { coachName: 'Host', slug: 'nikola' });
const guest = await post(`${B}/rooms/${host.code}/join`, { coachName: 'Guest', slug: 'vuka' });
await post(`${B}/rooms/${host.code}/actions`, { action: { type: 'ready', ready: true }, expectVersion: guest.view.version }, guest.token);
const v = (await fetch(`${B}/rooms/${host.code}`, { headers: { 'x-coach-token': host.token } }).then((r) => r.json())).version;
await post(`${B}/rooms/${host.code}/actions`, { action: { type: 'start' }, expectVersion: v }, host.token);
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage();
// The buttons are found by their English text
await setLocale(page);
await page.setViewport({ width: 1100, height: 900, deviceScaleFactor: 2 });
await page.goto('http://localhost:3000/rivals', { waitUntil: 'networkidle0' });
await page.evaluate((code, token) => localStorage.setItem(`glizzy-rivals:${code}`, token), host.code, host.token);
await page.reload({ waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 800));
await page.evaluate(() => [...document.querySelectorAll('button')].find((e) => e.textContent?.trim() === 'Active rooms')?.click());
await new Promise((r) => setTimeout(r, 700));
await page.screenshot({ path: `${OUT}/T12-room-board.png` });
await page.evaluate(() => [...document.querySelectorAll('button')].find((e) => e.textContent?.trim() === 'Join')?.click());
await new Promise((r) => setTimeout(r, 500));
await page.screenshot({ path: `${OUT}/T12-board-join-picked.png` });
await page.goto(`http://localhost:3000/rivals/${host.code}#token=${host.token}`, { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 1500));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
// DOM clicks: puppeteer's handle click lands on the intro backdrop, the DOM click does not
const clickText = async (t) => { const hit = await page.evaluate((t) => { const b = [...document.querySelectorAll('button')].find((e) => e.textContent?.trim() === t); b?.click(); return !!b; }, t); await wait(600); return hit; };
console.log('intro', await clickText('To the off-season'));
console.log('code', await clickText(host.code));
await page.screenshot({ path: `${OUT}/T12-room-modal.png` });
console.log('close', await clickText('Close room'));
await page.screenshot({ path: `${OUT}/T12-room-modal-armed.png` });
console.log('yes', await clickText('Yes, close it'));
await wait(1200);
await page.screenshot({ path: `${OUT}/T12-closed.png` });
await page.goto('http://localhost:3000/rivals', { waitUntil: 'networkidle0' });
await wait(800);
console.log('closed room still on board:', await page.evaluate((code) => document.body.innerText.includes(code), host.code));
await browser.close();
