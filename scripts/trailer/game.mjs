// Shared browser helpers for the trailer scripts: a page with the onboarding
// done, the dark theme, a seeded Math.random and an optional career save; the
// fullscreen game card with the dev overlay and the settings gear hidden;
// clicks by button text; a virtual clock that steps the page one frame at a
// time; and the screen rect of a dialog or paper found by its text.
import { register } from 'node:module';
import { BASE_URL, CHROME, PHONE, loadPuppeteer } from './paths.mjs';

register('../career-sim/loader.mjs', import.meta.url);
const { sampleCareer } = await import('../../components/preview/sampleCareer.ts');
const { CHARACTER_ROSTER } = await import('../../data/games/roster.ts');

const puppeteer = await loadPuppeteer();
const SLOT_KEY = 'glizzy-manager-slot-1';
const SEED = 20260926;
const HIDE_CSS =
  'nextjs-portal{display:none!important}' +
  'html.trailer-hide button[title="Settings"],html.trailer-hide button[title="Fullscreen"],' +
  'html.trailer-hide button[title="Exit fullscreen"]{visibility:hidden!important}';

// Late-game states from the preview gallery's sample career: a spring
// off-season in year 3 with every action unlocked, its newspaper, and a cup
// The player is the first seed (The Wolf); characters are picked by seed
const slugs = CHARACTER_ROSTER.map((c) => c.slug);
const PLAYER = slugs[0];
export const saves = {
  offseason: JSON.stringify(sampleCareer({ slugs, playerSlug: PLAYER, phase: 'offseason', year: 3, season: 1 })),
  news: JSON.stringify({ ...sampleCareer({ slugs, playerSlug: PLAYER, phase: 'offseason', year: 3, season: 1 }), phase: 'news' }),
  cup: JSON.stringify(sampleCareer({ slugs, playerSlug: PLAYER, phase: 'cup', year: 3, season: 1 })),
};

export const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--mute-audio', '--no-first-run', '--hide-scrollbars'],
});

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function newPage({ path, save = null, scale = PHONE.scale, width = PHONE.width, height = PHONE.height } = {}) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: scale });
  await page.evaluateOnNewDocument(
    (saveJson, key, seed) => {
      try {
        localStorage.setItem('glizzy-onboarding-done', '1');
        localStorage.setItem('theme', 'dark');
        if (saveJson) localStorage.setItem(key, saveJson);
      } catch {}
      // Mulberry32 in place of Math.random: the same run, the same footage
      let s = seed >>> 0;
      Math.random = () => {
        s = (s + 0x6d2b79f5) >>> 0;
        let t = s;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    },
    save,
    SLOT_KEY,
    SEED,
  );
  page.on('pageerror', (e) => console.log('  [pageerror]', e.message));
  if (path) await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle2' });
  return page;
}

// The game card goes fullscreen on a trusted click; the dev overlay, the
// settings gear and the fullscreen button itself stay out of every frame
export async function hideChrome(page) {
  await page.addStyleTag({ content: HIDE_CSS });
  await page.evaluate(() => document.documentElement.classList.add('trailer-hide'));
}

export async function fullscreen(page) {
  await page.evaluate(() => document.documentElement.classList.remove('trailer-hide'));
  const button = await page.$('button[title="Fullscreen"]');
  if (button) {
    await button.click();
    await page.waitForFunction(() => Boolean(document.fullscreenElement), { timeout: 3000 }).catch(() => {});
  }
  await hideChrome(page);
}

export const click = (page, text, { exact = false, nth = 0 } = {}) =>
  page.evaluate(
    (t, exact, nth) => {
      const matches = [...document.querySelectorAll('button, a')].filter((b) => {
        const s = (b.textContent || '').replace(/\s+/g, ' ').trim();
        return exact ? s === t : s.includes(t);
      });
      const b = matches[nth];
      if (!b) return false;
      b.click();
      return true;
    },
    text,
    exact,
    nth,
  );

export async function mustClick(page, text, options) {
  if (!(await click(page, text, options))) throw new Error(`no button "${text}"`);
}

export const buttons = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('button')].map((b) => (b.textContent || '').replace(/\s+/g, ' ').trim()).filter(Boolean),
  );

// innerText carries the CSS uppercase, so the checks ignore case
export const hasText = (page, text) =>
  page.evaluate((t) => document.body.innerText.toLowerCase().includes(t.toLowerCase()), text);

export const waitText = (page, text, timeout = 20000) =>
  page.waitForFunction(
    (t) => document.body.innerText.toLowerCase().includes(t.toLowerCase()),
    { timeout },
    text,
  );

// The screen rect of the element whose text matches (case-insensitive, the
// screen renders it uppercase), climbed up to the nearest card, paper or
// dialog that is narrower than the screen, so the compositor frames it whole.
// A label that sits in no such container (a sidebar button) loses to one
// that does (the dialog it opened). With climb 'none' it is the smallest
// visible element holding the text, for a sticker or a ring to point at
export const focusRect = (page, text, climb = 'card') =>
  page.evaluate(
    (t, climb) => {
      const wanted = t.toLowerCase();
      const all = [...document.querySelectorAll('body *')];
      const leaves = all.filter((e) => e.children.length === 0 && (e.textContent || '').trim().toLowerCase() === wanted);
      const loose = all.filter((e) => e.children.length <= 3 && (e.textContent || '').toLowerCase().includes(wanted));
      const candidates = [...leaves, ...loose];
      if (candidates.length === 0) return null;
      const box = (el) => {
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, w: r.width, h: r.height };
      };
      if (climb === 'none') {
        const visible = candidates.map(box).filter((r) => r.w > 2 && r.h > 2);
        return visible.sort((a, b) => a.w * a.h - b.w * b.h)[0] ?? null;
      }
      const pattern = climb === 'fixed' ? /\bfixed\b/ : /rounded|shadow/;
      const container = (el) => {
        let node = el.parentElement;
        while (node && node !== document.body) {
          const width = node.getBoundingClientRect().width;
          if (pattern.test(String(node.className)) && width > 240 && width < innerWidth * 0.98) return node;
          node = node.parentElement;
        }
        return null;
      };
      const framed = candidates.map((el) => container(el)).find(Boolean);
      return box(framed ?? candidates[0]);
    },
    text,
    climb,
  );

const clocks = new WeakMap();
export async function virtualClock(page) {
  if (clocks.has(page)) return clocks.get(page);
  const cdp = await page.createCDPSession();
  await cdp.send('Emulation.setVirtualTimePolicy', { policy: 'pause' });
  const clock = {
    async advance(ms) {
      const expired = new Promise((r) => cdp.once('Emulation.virtualTimeBudgetExpired', r));
      await cdp.send('Emulation.setVirtualTimePolicy', { policy: 'advance', budget: ms });
      await expired;
    },
  };
  clocks.set(page, clock);
  return clock;
}


// The Rivals room API, for the coaches that are not the browser
export async function api(path, { method = 'GET', token, body } = {}) {
  const res = await fetch(`${BASE_URL}/api/career-mp${path}`, {
    method,
    headers: { 'content-type': 'application/json', ...(token ? { 'x-coach-token': token } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, json: await res.json().catch(() => ({})) };
}

export async function act(code, token, action) {
  const view = (await api(`/rooms/${code}`, { token })).json;
  return api(`/rooms/${code}/actions`, { method: 'POST', token, body: { action, expectVersion: view.version } });
}

// Opens a room as the host in the page, seats seven more coaches over the API
// with their picks, and returns the code and the bots' tokens once the
// lobby lists all eight
const HOST_NAME = 'Ana';
const BOTS = [
  ['Boki', 3, 'violet'], ['Mira', 1, 'fuchsia'], ['Luka', 2, 'orange'],
  ['Teo', 5, 'lime'], ['Nina', 6, 'teal'], ['Pera', 7, 'rose'], ['Mika', 9, 'amber'],
].map(([name, seed, color]) => [name, slugs[seed], color]);
export async function fillLobby(page, { beforePick = null } = {}) {
  await page.type('input[placeholder]', HOST_NAME);
  await mustClick(page, 'Open room', { exact: true });
  await page.waitForFunction(() => /rivals\/[A-Z0-9]{6}$/.test(location.pathname), { timeout: 20000 });
  const code = page.url().split('/').pop();
  await waitText(page, 'Coach list');
  await sleep(600);
  await mustClick(page, 'Pick a character');
  await waitText(page, 'Who needs a coach?');
  await sleep(600);
  if (beforePick) await beforePick();
  await mustClick(page, 'The Wolf', { exact: true });
  await waitText(page, 'Change character');
  const tokens = [];
  for (const [name, slug, color] of BOTS) {
    const joined = await api(`/rooms/${code}/join`, { method: 'POST', body: { coachName: name, color } });
    if (joined.status !== 200) throw new Error(`join ${name}: ${joined.status} ${JSON.stringify(joined.json)}`);
    tokens.push(joined.json.token);
    await act(code, joined.json.token, { type: 'pickCharacter', slug });
  }
  const hostToken = await page.evaluate((c) => localStorage.getItem(`glizzy-rivals:${c}`), code);
  await act(code, hostToken, {
    type: 'setSettings',
    settings: { windowSeconds: null, paperSeconds: null, preRoundSeconds: null, matchBetSeconds: null, seasonEndSeconds: null, matchLingerSeconds: 30 },
  });
  await waitText(page, 'Coaches (8/8)');
  await sleep(1500);
  // The invite line carries the dev origin and the host's token
  await page.evaluate(() => {
    for (const el of document.querySelectorAll('body *')) {
      const text = el.children.length === 0 ? el.textContent || '' : '';
      if (text.includes('/rivals/') || String(el.value ?? '').includes('/rivals/')) el.style.visibility = 'hidden';
    }
  });
  return { code, tokens };
}
