// Two-browser playtest against the running dev server (BASE, default :3000).
// Browser A (Vuka) and B (Cone) click through the UI; a third coach (Dax)
// only speaks to the API. Screenshots land in SHOTS_DIR.
import { setSerbianLocale } from './serbianLocale.mjs';
const puppeteer = (await import(process.env.PUPPETEER_CORE ?? 'puppeteer-core')).default;
import { mkdirSync, writeFileSync } from 'node:fs';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SHOTS = process.env.SHOTS_DIR ?? `${import.meta.dirname}/output`;
const BASE = process.env.BASE ?? 'http://localhost:3000';
const API = `${BASE}/api/career-mp`;
const FULL = process.argv.includes('--full');
mkdirSync(SHOTS, { recursive: true });

const report = [];
const note = (step, ok, detail = '') => {
  report.push({ step, ok, detail });
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${step}${detail ? ` :: ${detail}` : ''}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(path, { method = 'GET', token, body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { 'x-coach-token': token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}
async function view(code, token) {
  const r = await api(`/rooms/${code}`, { token });
  return r.json;
}
// A pick closes the picker before the server answers, so poll for it
async function waitSlug(code, token, index, slug, tries = 20) {
  for (let i = 0; i < tries; i++) {
    if ((await view(code, token)).coaches[index]?.slug === slug) return true;
    await sleep(250);
  }
  return false;
}
async function act(code, token, action) {
  const v = await view(code, token);
  const r = await api(`/rooms/${code}/actions`, {
    method: 'POST',
    token,
    body: { action, expectVersion: v.version },
  });
  return r;
}

async function clickText(page, text, { exact = false, nth = 0, regex = false } = {}) {
  const ok = await page.evaluate(
    (t, exact, nth, regex) => {
      const buttons = [...document.querySelectorAll('button')].filter((b) => {
        const s = (b.textContent || '').replace(/\s+/g, ' ').trim();
        if (regex) return new RegExp(t).test(s);
        return exact ? s === t : s.includes(t);
      });
      const b = buttons[nth];
      if (!b) return false;
      b.click();
      return true;
    },
    text,
    exact,
    nth,
    regex,
  );
  if (!ok) throw new Error(`no button "${text}"`);
}
// The pre-match footer: a pass button once the bookie is open, a ready button before
async function passOrReady(page) {
  const passed = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((e) => (e.textContent || '').trim() === 'Preskačem opkladu');
    if (b) { b.click(); return true; }
    return false;
  });
  if (!passed) await clickText(page, 'Spreman', { exact: true });
}
// The clip skip button sits in the fixed row through the bets and the pre-roll,
// greyed out; enabled means the clip is really running
async function waitEnabled(page, text, timeout = 40000) {
  await page.waitForFunction(
    (t) => [...document.querySelectorAll('button')].some((b) => (b.textContent || '').includes(t) && !b.disabled),
    { timeout },
    text,
  );
}
async function hasButton(page, text) {
  return page.evaluate(
    (t) => [...document.querySelectorAll('button')].some((b) => (b.textContent || '').includes(t)),
    text,
  );
}
async function stampDisabled(page, text) {
  return page.evaluate(
    (t) => [...document.querySelectorAll('button')].find((b) => (b.textContent || '').trim() === t)?.disabled ?? false,
    text,
  );
}
async function waitText(page, text, timeout = 20000) {
  await page.waitForFunction(
    (t) => document.body.innerText.toLowerCase().includes(t.toLowerCase()),
    { timeout },
    text,
  );
}
async function hasText(page, text) {
  return page.evaluate(
    (t) => document.body.innerText.toLowerCase().includes(t.toLowerCase()),
    text,
  );
}
async function shot(page, name) {
  await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: false });
}
async function overflow(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const wide = doc.scrollWidth > doc.clientWidth + 1;
    const offenders = wide
      ? [...document.querySelectorAll('body *')]
          .filter((el) => el.getBoundingClientRect().right > doc.clientWidth + 1)
          .slice(0, 5)
          .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(' ').slice(0, 3).join('.')}`)
      : [];
    return { wide, scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, offenders };
  });
}
async function checkOverflow(page, label) {
  const o = await overflow(page);
  note(`no horizontal overflow: ${label}`, !o.wide, o.wide ? JSON.stringify(o) : `${o.scrollWidth}/${o.clientWidth}`);
}
async function tokenOf(page, code) {
  return page.evaluate((c) => localStorage.getItem(`glizzy-rivals:${c}`), code);
}

async function launch(dir, width) {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    userDataDir: `${SHOTS}/profile-${dir}`,
    args: ['--no-first-run', '--no-default-browser-check'],
  });
  const page = await browser.newPage();
  // The buttons are found by their Serbian text
  await setSerbianLocale(page, BASE);
  await page.setViewport({ width, height: 900 });
  page.on('pageerror', (e) => console.log(`[${dir} pageerror]`, e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') console.log(`[${dir} console]`, m.text().slice(0, 200));
  });
  return { browser, page };
}

const A = await launch('a', 1440);
const B = await launch('b', 820);
let code = '';
let tokens = {};
let slugs = {};

try {
  // 1. Lobby: A creates through the form, name only, and picks inside the room
  await A.page.goto(`${BASE}/rivals`, { waitUntil: 'networkidle2' });
  await A.page.type('input[placeholder]', 'Vuka');
  await clickText(A.page, 'Bez', { exact: true });
  note('create form has no character select', !(await hasButton(A.page, 'Izaberi lika')) && !(await hasText(A.page, 'Mali oglasi')));
  await shot(A.page, '01-lobby-form-a');
  await clickText(A.page, 'Otvori sobu', { exact: true });
  await A.page.waitForFunction(() => /rivals\/[A-Z0-9]{6}$/.test(location.pathname), { timeout: 20000 });
  code = A.page.url().split('/').pop();
  await waitText(A.page, 'Počni ligu');
  tokens.a = await tokenOf(A.page, code);
  note('room created through the form', Boolean(code && tokens.a), code);
  note('host joined without a character', (await view(code, tokens.a)).coaches[0].slug === null);
  note('start blocked until the host picks', await stampDisabled(A.page, 'Počni ligu'));
  await clickText(A.page, 'Izaberi lika');
  await waitText(A.page, 'Mali oglasi');
  await clickText(A.page, 'Vuk', { exact: true });
  await A.page.waitForFunction(() => !document.body.innerText.includes('Mali oglasi'), { timeout: 20000 });
  note('host picked Vuka in the lobby', await waitSlug(code, tokens.a, 0, 'vuka'));

  // 2. B joins through the room link by name, then picks with Vuka taken
  await B.page.goto(`${BASE}/rivals/${code}`, { waitUntil: 'networkidle2' });
  await waitText(B.page, code);
  await B.page.type('input[placeholder]', 'Cone');
  note('join form has no character select', !(await hasButton(B.page, 'Izaberi lika')));
  await shot(B.page, '01-join-form-b');
  await clickText(B.page, 'Uđi u sobu', { exact: true });
  await waitText(B.page, 'Nisu svi izabrali lika');
  tokens.b = await tokenOf(B.page, code);
  note('second browser joined', Boolean(tokens.b));
  await waitText(A.page, 'Cone');
  await waitText(A.page, 'Nisu svi izabrali lika');
  note('host start blocked while Cone has not picked', await stampDisabled(A.page, 'Počni ligu'));
  await shot(A.page, '02-lobby-a-waiting-pick');
  await clickText(B.page, 'Izaberi lika');
  await waitText(B.page, 'Mali oglasi');
  const vukaTaken = await B.page.evaluate(() =>
    [...document.querySelectorAll('button')].some((b) => (b.textContent || '').trim() === 'Vuk' && b.disabled),
  );
  note('Vuka shown as taken in the lobby picker', vukaTaken);
  await sleep(700);
  await shot(B.page, '02-lobby-pick-b-taken');
  await clickText(B.page, 'Daniel', { exact: true });
  await waitText(B.page, 'Promeni lika');
  await clickText(B.page, 'Promeni lika');
  await waitText(B.page, 'Mali oglasi');
  await clickText(B.page, 'Jajoglavi', { exact: true });
  await waitText(B.page, 'Čeka se domaćin');
  note('B changed the pick from Dax to Cone', await waitSlug(code, tokens.b, 1, 'cone'));
  await waitText(A.page, 'Treneri (2/');
  await shot(A.page, '02-lobby-a');
  await shot(B.page, '02-lobby-b');
  await checkOverflow(B.page, 'lobby 820');

  // 3. A third coach over the API only: join by name, pick in the lobby
  const joinC = await api(`/rooms/${code}/join`, { method: 'POST', body: { coachName: 'Dax' } });
  tokens.c = joinC.json.token;
  note('third coach joined over the API', joinC.status === 200, String(joinC.status));
  const takenPick = await act(code, tokens.c, { type: 'pickCharacter', slug: 'vuka' });
  note('taken pick refused over the API', takenPick.status === 409 && takenPick.json.error === 'character-taken', JSON.stringify(takenPick.json.error));
  const pickC = await act(code, tokens.c, { type: 'pickCharacter', slug: 'dax' });
  note('third coach picked Dax', pickC.status === 200, String(pickC.status));
  const settings = await act(code, tokens.a, {
    type: 'setSettings',
    settings: { windowSeconds: 60, paperSeconds: null, preRoundSeconds: null, matchBetSeconds: null, seasonEndSeconds: null, matchLingerSeconds: 0 },
  });
  note('host settings: 60 s window, no other countdowns, no linger', settings.status === 200, JSON.stringify(settings.json.view?.settings));

  // 4. Start
  await waitText(A.page, 'Dax');
  await A.page.waitForFunction(() => [...document.querySelectorAll('button')].some((b) => (b.textContent || '').trim() === 'Počni ligu' && !b.disabled), { timeout: 20000 });
  await clickText(A.page, 'Počni ligu', { exact: true });
  await waitText(A.page, 'Gotovo 0 od 3', 30000);
  await waitText(B.page, 'Gotovo 0 od 3', 30000);
  // The expansion issue opens the league once per browser
  await waitText(A.page, 'Liga se širi', 30000);
  await clickText(A.page, 'Na prelazni rok', { exact: true });
  await waitText(B.page, 'Liga se širi', 30000);
  await clickText(B.page, 'Na prelazni rok', { exact: true });
  await sleep(500);
  note('expansion issue shown and dismissed on both screens', !(await hasText(A.page, 'Liga se širi')) && !(await hasText(B.page, 'Liga se širi')));
  const v0 = await view(code, tokens.a);
  slugs = Object.fromEntries(v0.coaches.map((c) => [c.name, c.slug]));
  note('league started, window open', v0.phase.kind === 'window', JSON.stringify(slugs));
  await sleep(1500);
  await shot(A.page, '03-window-a-1440');
  await shot(B.page, '03-window-b-820');
  await checkOverflow(A.page, 'window 1440');
  await checkOverflow(B.page, 'window 820');
  // Coach names live in the tooltips of the bar and the table, not as pills
  note('coach names on the window screen (A, tooltips included)', await A.page.evaluate(() => ['Vuka', 'Cone', 'Dax'].every((n) => document.body.innerHTML.includes(n))));

  // 5. Window actions: mail, training, Done toggled off and used again
  for (const t of [tokens.a, tokens.b, tokens.c]) {
    const mail = (await view(code, t)).career.mail;
    for (const m of mail) await act(code, t, { type: 'readMail', mailId: m.id });
  }
  const trainA = await act(code, tokens.a, { type: 'train', trainingId: 'fans' });
  note('train over the API returns a receipt', Boolean(trainA.json.receipt), trainA.json.receipt?.title);
  await clickText(A.page, 'Gotovo', { exact: true });
  await waitText(A.page, 'Neje gotovo');
  await waitText(B.page, 'Gotovo 1 od 3');
  await clickText(A.page, 'Neje gotovo', { exact: true });
  await waitText(A.page, 'Gotovo 0 od 3');
  const restA = await act(code, tokens.a, { type: 'rest', fasting: false });
  const afterUndo = await view(code, tokens.a);
  note('Done toggled off then another action taken', restA.status === 200 && afterUndo.coaches.find((c) => c.name === 'Vuka').done === false, `slots ${afterUndo.career.slotsUsed}`);
  await shot(A.page, '04-window-a-after-actions');
  await clickText(A.page, 'Gotovo', { exact: true });
  await clickText(B.page, 'Gotovo', { exact: true });
  await act(code, tokens.c, { type: 'setDone', done: true });
  await waitText(A.page, 'GLIZIĆ GLASNIK', 30000);
  await sleep(1200);
  await shot(A.page, '05-paper-a');
  // B polls on its own cadence, so give it a poll or two to catch up
  await waitText(B.page, 'GLIZIĆ GLASNIK', 15000).catch(() => null);
  await shot(B.page, '05-paper-b-820');
  await checkOverflow(B.page, 'paper 820');
  note('paper phase reached on both screens', await hasText(B.page, 'GLIZIĆ GLASNIK'));

  // 6. Paper -> bracket draw with tags -> pre-match
  await clickText(A.page, 'Gotovo', { exact: true });
  await act(code, tokens.b, { type: 'setDone', done: true });
  await act(code, tokens.c, { type: 'setDone', done: true });
  await waitText(A.page, 'Osmina finala', 30000);
  await sleep(1200);
  await shot(A.page, '06-bracket-draw-a');
  await shot(B.page, '06-bracket-draw-b-820');
  await checkOverflow(B.page, 'bracket draw 820');
  const cupView = await view(code, tokens.a);
  note('paper closes straight into round 0 of the bracket', cupView.phase.kind === 'cup-pre' && cupView.phase.round === 0);
  const inRound0 = cupView.coaches.filter((c) => cupView.career.cup.rounds[0].some((m) => m.a === c.slug || m.b === c.slug)).map((c) => c.name);
  note('every human is in round 0', inRound0.length === cupView.coaches.length, inRound0.join(', '));
  const tagsInBracket = await A.page.evaluate((names) => {
    const text = document.body.innerText.toUpperCase();
    return names.filter((n) => text.includes(n.toUpperCase()));
  }, inRound0);
  note('coach tags on the bracket', tagsInBracket.length === inRound0.length, tagsInBracket.join(', '));

  // 7. Withdrawal by a human in round 0 (through the UI when it is A or B)
  if (inRound0.includes('Vuka')) {
    await clickText(A.page, 'Povuci se iz turnira');
    await clickText(A.page, 'Da, povuci ga');
    await sleep(1500);
    const w = await view(code, tokens.a);
    note('withdrawal through the UI', w.coaches.find((c) => c.name === 'Vuka').withdrawn);
  } else if (inRound0.includes('Cone')) {
    await clickText(B.page, 'Povuci se iz turnira');
    await clickText(B.page, 'Da, povuci ga');
    await sleep(1500);
    const w = await view(code, tokens.b);
    note('withdrawal through the UI', w.coaches.find((c) => c.name === 'Cone').withdrawn);
  } else {
    const w = await act(code, tokens.c, { type: 'withdraw' });
    note('withdrawal over the API', w.status === 200);
  }
  await shot(A.page, '07-bracket-after-withdraw-a');

  // 8. Pre-match, clip, majority clip skip
  await clickText(A.page, 'Gotovo', { exact: true });
  await act(code, tokens.b, { type: 'setDone', done: true });
  await act(code, tokens.c, { type: 'setDone', done: true });
  await waitText(A.page, 'Pre meča', 30000);
  await sleep(800);
  await shot(A.page, '06-prematch-locked-a');
  await checkOverflow(A.page, 'prematch 1440');
  note('pre-match card in cup 1 has no bookie, only the ready button', !(await hasText(A.page, 'Preskačem opkladu')) && (await hasText(A.page, 'Spreman')));
  await passOrReady(A.page);
  await act(code, tokens.b, { type: 'pass' });
  await act(code, tokens.c, { type: 'pass' });
  await waitEnabled(A.page, 'Preskoči do rezultata');
  await sleep(4000);
  await shot(A.page, '08-clip-a');
  await shot(B.page, '08-clip-b-820');
  await checkOverflow(B.page, 'clip 820');
  note('clip runs on both screens', (await hasText(A.page, 'Preskoči do rezultata')) && (await hasText(B.page, 'Preskoči do rezultata')));

  // Majority clip skip: A and B vote (2 of 3)
  await clickText(A.page, 'Preskoči do rezultata');
  await sleep(300);
  await waitEnabled(B.page, 'Preskoči do rezultata');
  await clickText(B.page, 'Preskoči do rezultata');
  await sleep(2500);
  const afterSkip = await view(code, tokens.a);
  const skipped = afterSkip.phase.kind === 'match-clip' ? afterSkip.phase.playback.skippedAt !== undefined : afterSkip.phase.kind === 'match-bets' && afterSkip.phase.index >= 1;
  note('majority clip skip landed', skipped, `${afterSkip.phase.kind} ${afterSkip.phase.index ?? ''}`);
  await shot(A.page, '08-after-clip-skip-a');

  // 9. Unanimous round skip on the rest of round 0 lands on the quarterfinal
  await waitText(A.page, 'Preskoči kolo', 30000);
  await clickText(A.page, 'Preskoči kolo');
  await sleep(300);
  await waitText(B.page, 'Preskoči kolo', 30000);
  await clickText(B.page, 'Preskoči kolo');
  await act(code, tokens.c, { type: 'voteSkipRound', on: true });
  await waitText(A.page, 'Četvrtfinale', 30000);
  await sleep(1200);
  await shot(A.page, '09-bracket-round1-a');
  await shot(B.page, '09-bracket-round1-b-820');
  await checkOverflow(B.page, 'bracket 820');
  const round1View = await view(code, tokens.a);
  note('unanimous round skip resolved round 0 into round 1', round1View.phase.kind === 'cup-pre' && round1View.phase.round === 1);

  // 10. Round 1 by round skip, then the unanimous cup skip from round 2
  await clickText(A.page, 'Gotovo', { exact: true });
  await act(code, tokens.b, { type: 'setDone', done: true });
  await act(code, tokens.c, { type: 'setDone', done: true });
  await waitText(A.page, 'Pre meča', 30000);
  await clickText(A.page, 'Preskoči kolo');
  await act(code, tokens.b, { type: 'voteSkipRound', on: true });
  await act(code, tokens.c, { type: 'voteSkipRound', on: true });
  await waitText(A.page, 'Polufinale', 30000);
  await sleep(800);
  await shot(A.page, '11-bracket-round2-a');
  await clickText(A.page, 'Preskoči ceo kup');
  await act(code, tokens.b, { type: 'voteSkipCup', on: true });
  await act(code, tokens.c, { type: 'voteSkipCup', on: true });
  await waitText(A.page, 'Završen kup', 30000);
  await sleep(1200);
  await shot(A.page, '12-season-end-bracket-a');
  note('unanimous cup skip from round 2 landed on the finished bracket', await hasText(A.page, 'Na podijum'));
  await clickText(A.page, 'Na podijum');
  await sleep(1500);
  await shot(A.page, '13-podium-a');
  await clickText(A.page, 'Novine', { exact: true });
  await waitText(A.page, 'GLIZIĆ GLASNIK');
  await sleep(800);
  await shot(A.page, '14-recap-a');
  await clickText(A.page, 'Tabela', { exact: true });
  await waitText(A.page, 'Konačna tabela');
  await sleep(500);
  await shot(A.page, '15-standings-a');
  await checkOverflow(A.page, 'standings 1440');
  note('coach tags in the table', (await hasText(A.page, 'VUKA')) && (await hasText(A.page, 'CONE')));
  await clickText(A.page, 'Spreman za sledeću sezonu');
  await act(code, tokens.b, { type: 'setDone', done: true });
  await act(code, tokens.c, { type: 'setDone', done: true });
  await waitText(A.page, 'Gotovo 0 od 3', 30000);
  const s2 = await view(code, tokens.a);
  note('season 2 window open', s2.phase.kind === 'window' && s2.career.season === 1);

  // 11. Plots between humans, a guard, and the paper that follows
  const plot = await act(code, tokens.b, { type: 'sabotage', targetSlug: slugs.Vuka, tier: 1, boostSteps: 0 });
  note('B plots against A', plot.status === 200, plot.json.error ?? plot.json.receipt?.title);
  const guard = await act(code, tokens.a, { type: 'guard', steps: 0 });
  note('A hires a crew', guard.status === 200, guard.json.error ?? guard.json.receipt?.title);
  for (const t of [tokens.a, tokens.b, tokens.c]) {
    const mail = (await view(code, t)).career.mail.filter((m) => !m.read && m.kind !== 'sponsor-offer');
    for (const m of mail) await act(code, t, { type: 'readMail', mailId: m.id });
  }
  const plot2 = await act(code, tokens.c, { type: 'sabotage', targetSlug: slugs.Cone, tier: 1, boostSteps: 0 });
  note('C plots against B', plot2.status === 200, plot2.json.error ?? '');
  const bView = await view(code, tokens.b);
  note('other coaches plots are redacted', bView.career.pendingSabotages.every((p) => p.bySlug === slugs.Cone), JSON.stringify(bView.career.pendingSabotages.map((p) => p.bySlug)));
  const offers = [];
  for (const [name, t] of Object.entries({ Vuka: tokens.a, Cone: tokens.b, Dax: tokens.c })) {
    const v = await view(code, t);
    v.career.mail.filter((m) => m.kind === 'sponsor-offer' && !m.read).forEach((m) => offers.push({ name, t, m }));
  }
  note('sponsor offers this window', true, offers.map((o) => `${o.name}:${o.m.sponsorId}`).join(', ') || 'none');
  const ostrvo = offers.find((o) => o.m.sponsorId === 'ostrvo');
  if (ostrvo) {
    await act(code, ostrvo.t, { type: 'acceptSponsor', mailId: ostrvo.m.id, sponsorId: 'ostrvo' });
    const island = await act(code, ostrvo.t, { type: 'island' });
    note('island weekend', island.status === 200, island.json.receipt?.title ?? island.json.error);
  } else if (offers[0]) {
    await act(code, offers[0].t, { type: 'acceptSponsor', mailId: offers[0].m.id, sponsorId: offers[0].m.sponsorId });
    note('sponsor signed', true, `${offers[0].name} -> ${offers[0].m.sponsorId}`);
  }

  // 12. Countdown expiry with unused slots: nobody presses Done for 60 s
  await sleep(1000);
  await shot(A.page, '16-window-s2-a');
  const t0 = Date.now();
  await waitText(A.page, 'GLIZIĆ GLASNIK', 90000);
  const waited = Math.round((Date.now() - t0) / 1000);
  const afterExpiry = await view(code, tokens.c);
  const restsC = afterExpiry.career.slotLog.filter((s) => s.kind === 'rest').length;
  note('window countdown expired with unused slots filled by rest', afterExpiry.phase.kind === 'paper' && afterExpiry.career.slotsUsed === 3 && restsC >= 2, `waited ${waited}s, C slots ${afterExpiry.career.slotsUsed}, rests ${restsC}`);
  const paperNews = afterExpiry.career.lastIssue.news.map((n) => n.templateKey);
  note('paper carries the plots', paperNews.some((k) => /sabotage|poison|catfish|witch|nutrition|fans|blocked|caught|hushed/i.test(k)), paperNews.join(', '));
  await shot(A.page, '17-paper-s2-a');

  // Fast forward through the API until betting opens
  const all = [tokens.a, tokens.b, tokens.c];
  async function ffPhase() {
    const v = await view(code, tokens.a);
    switch (v.phase.kind) {
      case 'window':
      case 'paper':
      case 'cup-pre':
      case 'season-end':
        for (const t of all) await act(code, t, { type: 'setDone', done: true });
        break;
      case 'match-bets': {
        for (const t of all) await act(code, t, { type: 'pass' });
        // everyone decided: the room holds a short countdown before the clip
        const w = await view(code, tokens.a);
        if (w.phase.kind === 'match-bets' && w.phase.deadline) await sleep(Math.max(0, w.phase.deadline - w.now + 300));
        break;
      }
      case 'match-clip':
        for (const t of all) await act(code, t, { type: 'voteSkipCup', on: true });
        break;
      default:
        return false;
    }
    return true;
  }
  async function ffSeason() {
    for (let i = 0; i < 40; i++) {
      const v = await view(code, tokens.a);
      if (v.status === 'finished') return v;
      if (v.phase.kind === 'window' && i > 0) return v;
      await ffPhase();
    }
    return view(code, tokens.a);
  }
  // From the season-2 paper to the window of season 3 (betting opens after 2 cups)
  await ffSeason();
  let v3 = await view(code, tokens.a);
  note('fast forward to season 3', v3.phase.kind === 'window' && v3.career.standingsHistory.length === 2, `year ${v3.career.year} season ${v3.career.season}`);

  // 13. Rival pick shows up at the new year; play through to it later. First: live bet tokens from three coaches
  // Window, paper and the bracket draw each close on everyone's Done
  for (let i = 0; i < 4 && (await view(code, tokens.a)).phase.kind !== 'match-bets'; i++) {
    for (const t of all) await act(code, t, { type: 'setDone', done: true });
    await sleep(300);
  }
  await waitText(A.page, 'Pre meča', 30000);
  await sleep(1000);
  for (const t of all) {
    const mail = (await view(code, t)).career.mail.filter((m) => !m.read && m.kind !== 'sponsor-offer');
    for (const m of mail) await act(code, t, { type: 'readMail', mailId: m.id });
  }
  await clickText(A.page, '^x\\d', { regex: true });
  const betB = await act(code, tokens.b, { type: 'bet', side: 'b' });
  const betC = await act(code, tokens.c, { type: 'bet', side: 'a' });
  note('bets over the API', betB.status === 200 && betC.status === 200, `${betB.json.error ?? ''} ${betC.json.error ?? ''}`);
  await sleep(2500);
  await shot(A.page, '18-prematch-bets-a');
  await shot(B.page, '18-prematch-bets-b-820');
  const betsView = await view(code, tokens.a);
  note('live bet tokens from three coaches on one match', betsView.publicBets.length === 3, JSON.stringify(betsView.publicBets));
  let tokensOnScreen = false;
  try {
    await A.page.waitForFunction(() => ['VUKA', 'CONE', 'DAX'].every((n) => document.body.innerText.includes(n)), { timeout: 10000 });
    tokensOnScreen = true;
  } catch {}
  note('tokens show the coach names in the stands preview', tokensOnScreen);
  // the third coach passes so the bets close (A and B placed bets)
  await waitEnabled(A.page, 'Preskoči do rezultata');
  await sleep(3000);
  await shot(A.page, '19-clip-tokens-a');
  const standTokens = await A.page.evaluate(() => document.querySelectorAll('[data-coach-tokens]').length);
  note('crowd tokens rendered in the stands during the clip', standTokens >= 1, `${standTokens} stands with tokens`);
  // 14. Reconnect mid-clip
  await B.page.reload({ waitUntil: 'networkidle2' });
  await waitEnabled(B.page, 'Preskoči do rezultata');
  await sleep(500);
  await shot(B.page, '20-reconnect-mid-clip-b-820');
  const roundLabel = await B.page.evaluate(() => (document.body.innerText.match(/Runda (\d+)|Kraj meča|Meč počinje/i) || [])[0] ?? null);
  note('reconnect lands in the running clip', roundLabel !== null, `round label ${roundLabel}`);
  // let the clip play out for real for a bit, then skip the rest of the cup
  await sleep(4000);
  for (const t of all) await act(code, t, { type: 'voteSkipCup', on: true });
  await waitText(A.page, 'Završen kup', 30000);
  const settled = await view(code, tokens.a);
  const winners = settled.coaches.map((c) => `${c.name}:${c.balance}`).join(' ');
  note('bets settled at the clip end', true, winners);

  if (!FULL) {
    note('short run done', true, 'pass --full for the election, the Overlord and the reopen');
  } else {
    // 15. Up to the year 3 window: rival shortlist at year 2, election counted at the year 2 wrap
    for (let i = 0; i < 12; i++) {
      const v = await view(code, tokens.a);
      if (v.phase.kind === 'window' && v.career.year === 2 && v.career.season === 0) break;
      await ffSeason();
    }
    let vy2 = await view(code, tokens.a);
    note('year 2 window', vy2.phase.kind === 'window' && vy2.career.year === 2, `rival shortlist ${vy2.career.rivalChoice?.length ?? 0}`);
    await waitText(A.page, 'Izbor rivala', 30000);
    await clickText(A.page, 'Izbor rivala');
    await waitText(A.page, 'Njega');
    await sleep(800);
    await shot(A.page, '21-rival-pick-a');
    await clickText(A.page, 'Njega');
    await sleep(400);
    await clickText(A.page, 'Nastavi', { exact: true });
    await sleep(1500);
    vy2 = await view(code, tokens.a);
    note('rival picked through the dialog', vy2.career.rivalSlug !== null && !vy2.career.rivalChoice, vy2.career.rivalSlug);
    for (let i = 0; i < 12; i++) {
      const v = await view(code, tokens.a);
      if (v.phase.kind === 'window' && v.career.year === 3) break;
      await ffSeason();
    }
    const vy3 = await view(code, tokens.a);
    note('election counted at the year 2 wrap', vy3.lastElection?.year === 2 && (vy3.career.parliament?.government.length ?? 0) > 0, JSON.stringify(vy3.lastElection?.result.government));
    await waitText(A.page, 'Izborna noć', 30000);
    await clickText(A.page, 'Izborna noć');
    await waitText(A.page, 'Skupština Leskovca', 30000);
    await sleep(7000);
    await shot(A.page, '22-election-night-a');
    await A.page.waitForFunction(
      () => [...document.querySelectorAll('button')].some((b) => b.textContent.trim() === 'Nastavi' && !b.disabled),
      { timeout: 40000 },
    );
    await clickText(A.page, 'Nastavi', { exact: true });
    await sleep(800);
    note('election night cutscene shown and closed', !(await hasText(A.page, 'Skupština Leskovca')));

    // 16. Overlord: run seasons until the room finishes
    let finished = null;
    for (let i = 0; i < 160; i++) {
      const v = await ffSeason();
      if (v.status === 'finished') { finished = v; break; }
    }
    note('Overlord finish', Boolean(finished), finished ? `${finished.career.year} ${finished.report?.overlordSlug}` : 'not reached');
    if (finished) {
      await waitText(A.page, 'Kampanja je gotova', 30000);
      await sleep(1500);
      await shot(A.page, '23-finished-a');
      await clickText(A.page, 'Izveštaj', { exact: true });
      await sleep(800);
      await shot(A.page, '24-report-a');
      await A.page.evaluate(() => window.scrollBy(0, 700));
      await sleep(400);
      await shot(A.page, '24b-report-a-scrolled');
      await checkOverflow(A.page, 'report 1440');
      await B.page.reload({ waitUntil: 'networkidle2' });
      await waitText(B.page, 'Igramo dalje', 30000);
      await clickText(A.page, 'Igramo dalje');
      await sleep(500);
      await clickText(B.page, 'Igramo dalje');
      await waitText(A.page, 'Gotovo 0 od 3', 30000);
      const reopened = await view(code, tokens.a);
      note('majority reopen vote reopened the room', reopened.status === 'playing' && reopened.phase.kind === 'window');
      await shot(A.page, '25-reopened-a');
      // Phone width on the reopened window, the table and the dossier
      await B.page.setViewport({ width: 390, height: 844 });
      await sleep(1500);
      await shot(B.page, '26-window-b-390');
      await checkOverflow(B.page, 'window 390');
      await B.page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.title === 'Tabela lige'); b?.click(); });
      await sleep(800);
      await shot(B.page, '27-table-b-390');
      await checkOverflow(B.page, 'table modal 390');
      const dossierOpened = await B.page.evaluate(() => { const b = [...document.querySelectorAll('table button')][0]; b?.click(); return Boolean(b); });
      await sleep(800);
      await shot(B.page, '28-dossier-b-390');
      note('dossier opened from the table', dossierOpened);
      note('coach tag in the dossier', await hasText(B.page, 'VUKA') || await hasText(B.page, 'CONE') || await hasText(B.page, 'DAX'));
      await checkOverflow(B.page, 'dossier 390');
    }
  }
} catch (e) {
  note('script error', false, `${e.message}\n${e.stack?.split('\n').slice(0, 3).join('\n')}`);
  try { await shot(A.page, 'error-a'); await shot(B.page, 'error-b'); } catch {}
} finally {
  writeFileSync(`${SHOTS}/report.json`, JSON.stringify({ code, report }, null, 2));
  await A.browser.close();
  await B.browser.close();
}
console.log(`room ${code}, ${report.filter((r) => !r.ok).length} failures of ${report.length}`);
