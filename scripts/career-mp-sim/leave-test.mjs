// Leaving the lobby: the seat token is dropped and the browser lands on the entry page
import { setSerbianLocale } from './serbianLocale.mjs';
const puppeteer = (await import(process.env.PUPPETEER_CORE ?? 'puppeteer-core')).default;
const B = 'http://localhost:3000/api/career-mp';
const post = (url, body) => fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }).then((r) => r.json());
const host = await post(`${B}/rooms`, { coachName: 'Domacin', slug: 'nikola' });
const guest = await post(`${B}/rooms/${host.code}/join`, { coachName: 'Gost', slug: 'vuka' });
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage();
// The buttons are found by their Serbian text
await setSerbianLocale(page);
await page.goto(`http://localhost:3000/rivals/${host.code}#token=${guest.token}`, { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 1200));
await page.evaluate(() => [...document.querySelectorAll('button')].find((e) => e.textContent?.trim() === 'Napusti sobu')?.click());
await new Promise((r) => setTimeout(r, 2000));
console.log('url after leave:', page.url());
console.log('token cleared:', await page.evaluate((c) => localStorage.getItem(`glizzy-rivals:${c}`) === null, host.code));
const view = await fetch(`${B}/rooms/${host.code}`, { headers: { 'x-coach-token': host.token } }).then((r) => r.json());
console.log('coaches left in room:', view.coaches.map((c) => c.name));
await browser.close();
