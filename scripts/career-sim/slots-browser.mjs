import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { setLocale } from '../career-mp-sim/setLocale.mjs';
const puppeteer = (await import(process.env.PUPPETEER_CORE ?? 'puppeteer-core')).default;
const ROOT = path.resolve(import.meta.dirname, '..', '..');
const SHOTS = `${import.meta.dirname}/output`;
mkdirSync(SHOTS, { recursive: true });
const en = JSON.parse(readFileSync(`${ROOT}/data/games/locales/en.json`, 'utf8'));
const START = en.career.start;
const YEAR_4 = new RegExp(en.career.hud.year.replace('{year}', '4'), 'i');
const OLD = readFileSync(process.env.OLD_SAVE ?? `${SHOTS}/sp-old-save.json`, 'utf8');
const URL = 'http://localhost:3000/manager';
const checks = [];
const check = (name, pass, extra = '') => { checks.push({ name, pass, extra }); console.log(`${pass ? 'PASS' : 'FAIL'} ${name} ${extra}`); };

const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage();
// The buttons are found by their English text
await setLocale(page);
await page.setViewport({ width: 1280, height: 900 });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const keys = () => page.evaluate(() => Object.fromEntries(['glizzy-manager-active', 'glizzy-manager-slot-1', 'glizzy-manager-slot-2', 'glizzy-manager-slot-3'].map((k) => [k, localStorage.getItem(k)])));
const clickText = (text, scope = 'button') => page.evaluate((text, scope) => {
  const el = [...document.querySelectorAll(scope)].find((b) => b.textContent.trim() === text && !b.disabled);
  if (!el) return false; el.click(); return true;
}, text, scope);
const waitText = (text, timeout = 20000) => page.waitForFunction((t) => document.body.textContent.includes(t), { timeout }, text);
const cardText = () => page.evaluate(() => [...document.querySelectorAll('div.grid > div')].slice(0, 3).map((d) => d.innerText.replace(/\s+/g, ' ')));
const game = 'div.group.relative.w-full.overflow-hidden';

await page.goto(URL, { waitUntil: 'networkidle2' });
await page.evaluate((old) => { localStorage.clear(); localStorage.setItem('glizzy-manager-active', old); }, OLD);
await page.reload({ waitUntil: 'networkidle2' });
await waitText(START.resume);
let k = await keys();
check('legacy save migrated into slot 1', k['glizzy-manager-slot-1'] === OLD);
check('legacy key removed', k['glizzy-manager-active'] === null);
check('slots 2 and 3 empty', !k['glizzy-manager-slot-2'] && !k['glizzy-manager-slot-3']);
let cards = await cardText();
console.log(cards);
check('slot 1 card shows the old career', /Slot 1/i.test(cards[0]) && YEAR_4.test(cards[0]));

// Start a second career in slot 2
const newButtons = await page.evaluate((label) => [...document.querySelectorAll('button')].filter((b) => b.textContent.trim() === label).length, START.button);
check('two empty slots offer a new career', newButtons === 2, String(newButtons));
await page.evaluate((label) => [...document.querySelectorAll('button')].filter((b) => b.textContent.trim() === label)[0].click(), START.button);
await waitText(en.career.intro.ad.cta);
await clickText(en.career.intro.ad.cta);
await page.waitForSelector('div.grid button:not([disabled])');
const picked = await page.evaluate(() => { const b = document.querySelector('div.grid button:not([disabled])'); const name = b?.innerText.trim(); b?.click(); return name; });
await sleep(2500);
k = await keys();
const s2 = k['glizzy-manager-slot-2'] ? JSON.parse(k['glizzy-manager-slot-2']) : null;
check('new career autosaves into slot 2', !!s2, picked);
check('slot 2 holds the whole league', Object.keys(s2?.characters ?? {}).length === 16);
check('slot 1 untouched by the new career', k['glizzy-manager-slot-1'] === OLD);
check('legacy key not rewritten', k['glizzy-manager-active'] === null);

await page.reload({ waitUntil: 'networkidle2' });
await waitText(START.resume);
cards = await cardText();
console.log(cards);
check('after reload both slots are there', YEAR_4.test(cards[0]) && /16/.test(cards[1]) && cards[2].toLowerCase().includes(START.button.toLowerCase()));
await page.evaluate(() => window.scrollTo(0, 0));
const el = await page.$(game);
await el.screenshot({ path: `${SHOTS}/slots-1280.png` });

// Continue slot 1: resumes the old career, writes only slot 1
await page.evaluate((label) => [...document.querySelectorAll('button')].filter((b) => b.textContent.trim() === label)[0].click(), START.resume);
await sleep(2500);
k = await keys();
const s1 = JSON.parse(k['glizzy-manager-slot-1']);
const oldParsed = JSON.parse(OLD);
check('slot 1 resumes at the old year and season', s1.year === oldParsed.year && s1.season === oldParsed.season && s1.playerSlug === oldParsed.playerSlug && s1.balance === oldParsed.balance);
check('slot 2 unchanged while slot 1 plays', k['glizzy-manager-slot-2'] === JSON.stringify(s2) || JSON.parse(k['glizzy-manager-slot-2']).playerSlug === s2.playerSlug);
await page.screenshot({ path: `${SHOTS}/slot1-resumed-1280.png` });

// Settings leads back to the slots without touching either save
const before = await keys();
await page.evaluate((t) => document.querySelector(`button[title="${t}"]`).click(), en.shared.settings);
await waitText(START.slots);
await clickText(START.slots);
await waitText(START.resume);
const after = await keys();
check('settings returns to the slot picker', (await cardText()).length === 3);
check('leaving a career keeps both saves', after['glizzy-manager-slot-1'] === before['glizzy-manager-slot-1'] && after['glizzy-manager-slot-2'] === before['glizzy-manager-slot-2']);

// 390 px
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
await page.reload({ waitUntil: 'networkidle2' });
await waitText(START.resume);
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
check('no horizontal overflow at 390', overflow <= 0, String(overflow));
const clipped = await page.evaluate(() => {
  const box = document.querySelector('div.group.relative.w-full.overflow-hidden > div.relative.z-10 > div');
  const inner = box?.querySelector('div.relative.z-10');
  return inner ? inner.scrollHeight - inner.clientHeight : null;
});
check('start screen content fits at 390', clipped !== null && clipped <= 0, String(clipped));
await (await page.$(game)).screenshot({ path: `${SHOTS}/slots-390.png` });

// Two-step delete on slot 2
await page.evaluate((label) => [...document.querySelectorAll('button')].filter((b) => b.textContent.trim() === label)[1].click(), START.delete);
await waitText(START.deleteConfirm);
k = await keys();
check('first delete click deletes nothing', !!k['glizzy-manager-slot-2']);
await sleep(600);
await page.screenshot({ path: `${SHOTS}/delete-confirm-390.png` });
await clickText(START.confirmNo);
await sleep(300);
k = await keys();
check('cancelling the delete keeps the slot', !!k['glizzy-manager-slot-2']);
await page.evaluate((label) => [...document.querySelectorAll('button')].filter((b) => b.textContent.trim() === label)[1].click(), START.delete);
await waitText(START.deleteConfirm);
await clickText(START.deleteYes);
await sleep(500);
k = await keys();
check('confirmed delete clears slot 2 only', !k['glizzy-manager-slot-2'] && !!k['glizzy-manager-slot-1']);
cards = await cardText();
check('slot 2 card is empty again', cards[1].toLowerCase().includes(START.button.toLowerCase()));

await browser.close();
const failed = checks.filter((c) => !c.pass).length;
console.log(failed ? `${failed} FAILED` : 'ALL PASS');
