import { mkdirSync } from 'node:fs';
import { setLocale } from './setLocale.mjs';
const puppeteer = (await import(process.env.PUPPETEER_CORE ?? 'puppeteer-core')).default;
const SHOTS = process.env.SHOTS_DIR ?? `${import.meta.dirname}/output`;
mkdirSync(SHOTS, { recursive: true });
const API = 'http://localhost:3000/api/career-mp';
const api = async (path, opts = {}) => { const r = await fetch(`${API}${path}`, { method: opts.method ?? 'GET', headers: { 'content-type': 'application/json', ...(opts.token ? { 'x-coach-token': opts.token } : {}) }, body: opts.body ? JSON.stringify(opts.body) : undefined }); return r.json(); };
const act = async (code, token, action) => { const v = await api(`/rooms/${code}`, { token }); return api(`/rooms/${code}/actions`, { method: 'POST', token, body: { action, expectVersion: v.version } }); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const c = await api('/rooms', { method: 'POST', body: { coachName: 'Host', slug: 'vuka', settings: { windowSeconds: null, paperSeconds: null, matchBetSeconds: null, matchLingerSeconds: 0 } } });
const code = c.code, ta = c.token;
const j = await api(`/rooms/${code}/join`, { method: 'POST', body: { coachName: 'Cone', slug: 'cone' } });
const tb = j.token;
const j2 = await api(`/rooms/${code}/join`, { method: 'POST', body: { coachName: 'Dax', slug: 'dax' } });
const tc = j2.token;
const all = [ta, tb, tc];
for (const t of [tb, tc]) await act(code, t, { type: 'ready', ready: true });
await act(code, ta, { type: 'start' });
for (const t of all) { const v = await api(`/rooms/${code}`, { token: t }); for (const m of v.career.mail) await act(code, t, { type: 'readMail', mailId: m.id }); }
// two seasons through the API so betting opens
async function ff() { for (let i = 0; i < 60; i++) { const v = await api(`/rooms/${code}`, { token: ta }); const k = v.phase.kind; if (k === 'window' && v.career.standingsHistory.length >= 2) return; if (['window', 'paper', 'cup-pre', 'season-end'].includes(k)) for (const t of all) await act(code, t, { type: 'setDone', done: true }); else if (k === 'match-bets') { for (const t of all) await act(code, t, { type: 'pass' }); { const w = await api(`/rooms/${code}`, { token: ta }); if (w.phase.kind === 'match-bets' && w.phase.deadline) await sleep(Math.max(0, w.phase.deadline - w.now + 300)); } } else if (k === 'match-clip') for (const t of all) await act(code, t, { type: 'voteSkipCup', on: true }); } }
await ff();
for (const t of all) await act(code, t, { type: 'setDone', done: true });
await sleep(200);
for (const t of all) await act(code, t, { type: 'setDone', done: true });
let v = await api(`/rooms/${code}`, { token: ta });
console.log('phase', v.phase.kind, v.career.standingsHistory.length);
await act(code, tb, { type: 'bet', side: 'b' });
await act(code, tc, { type: 'bet', side: 'a' });
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
for (const [name, width] of [['P1-prematch-1440', 1440], ['P2-prematch-390', 390]]) {
  const page = await browser.newPage(); await setLocale(page); await page.setViewport({ width, height: width < 500 ? 900 : 1100 });
  await page.evaluateOnNewDocument((c, t) => localStorage.setItem(`glizzy-rivals:${c}`, t), code, ta);
  await page.goto(`http://localhost:3000/rivals/${code}`, { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => document.body.innerText.includes('PRE-MATCH'), { timeout: 20000 });
  if (width > 500) { await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /^x\d/.test(x.textContent.trim())); b?.click(); }); await sleep(2500); }
  await sleep(1500);
  await page.screenshot({ path: `${SHOTS}/${name}.png` });
  console.log(name, 'overflow', await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1));
  await page.evaluate(() => window.scrollBy(0, 500)); await sleep(300);
  await page.screenshot({ path: `${SHOTS}/${name}-scrolled.png` });
}
// the paper: check no tag on a league article
const p = await browser.newPage(); await setLocale(p); await p.setViewport({ width: 1440, height: 1000 });
await p.evaluateOnNewDocument((c, t) => localStorage.setItem(`glizzy-rivals:${c}`, t), code, ta);
for (const t of all) await act(code, t, { type: 'pass' });
await browser.close();
console.log('done', code);
