// README screenshots: node scripts/trailer/screenshots.mjs [name prefix ...]
// Eight 1600x900 PNGs of the English dark-theme game into docs/screenshots,
// taken against the dev server (BASE, default http://localhost:3218 with
// CAREER_MP_UNLIMITED=1) the same way the trailer footage is: the hub, the
// character select, the off-season, the newspaper, a match in front of the
// stands, a quote cutscene mid-line, the Assembly and the Rivals lobby. A
// shot over 600 KB is retaken at 1280x720. The off-season is a new career's
// first winter: the spring backdrop of the sample save makes a PNG too large.
import { mkdirSync, statSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { BASE_URL, SCREENSHOT_DIR } from './paths.mjs';
import {
  browser, buttons, click, fillLobby, fullscreen, hasText, hideChrome, mustClick, newPage, saves, sleep,
  virtualClock, waitText,
} from './game.mjs';

const SIZES = [[1600, 900], [1280, 720]];
const MAX_BYTES = 600 * 1024;
mkdirSync(SCREENSHOT_DIR, { recursive: true });

// Each shot is a function of a fresh page at the given size; it runs again
// at the smaller size when the file comes out too large
const shots = {
  '01-hub': async (page) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    await hideChrome(page);
    await sleep(600);
  },
  '02-character-select': async (page) => {
    await page.goto(`${BASE_URL}/manager`, { waitUntil: 'networkidle2' });
    await fullscreen(page);
    await mustClick(page, 'New career', { exact: true });
    await sleep(2200);
    await mustClick(page, 'Answer the ad');
    await sleep(1400);
  },
  '03-offseason': async (page) => {
    await page.goto(`${BASE_URL}/manager`, { waitUntil: 'networkidle2' });
    await fullscreen(page);
    await mustClick(page, 'New career', { exact: true });
    await sleep(1500);
    await mustClick(page, 'Answer the ad');
    await sleep(1000);
    await mustClick(page, 'The Wolf', { exact: true });
    await sleep(2500);
  },
  '04-newspaper': async (page) => {
    await page.goto(`${BASE_URL}/manager`, { waitUntil: 'networkidle2' });
    await fullscreen(page);
    await mustClick(page, 'Continue', { exact: true });
    await sleep(1800);
  },
  '05-match': async (page) => {
    await openCup(page);
    await mustClick(page, 'Your match');
    await sleep(900);
    await mustClick(page, 'Continue');
    const clock = await virtualClock(page);
    await clock.advance(5200);
  },
  '06-quote-cutscene': async (page) => {
    await openCup(page);
    const clock = await virtualClock(page);
    for (let step = 0; step < 80; step++) {
      if (await hasText(page, 'BREAKING NEWS')) {
        await clock.advance(3200);
        return;
      }
      const list = await buttons(page);
      if (list.includes('Podium')) break;
      if (list.includes('Skip remaining matches')) await click(page, 'Skip remaining matches');
      else if (list.includes('Next round')) await click(page, 'Next round');
      else if (list.some((b) => b.startsWith('Skip to result'))) await click(page, 'Skip to result');
      else if (list.includes('Continue')) await click(page, 'Continue', { exact: true });
      await clock.advance(1500);
    }
    throw new Error('no quote scene aired; change the seed in game.mjs');
  },
  '07-parliament': async (page) => {
    await page.goto(`${BASE_URL}/manager`, { waitUntil: 'networkidle2' });
    await fullscreen(page);
    await mustClick(page, 'Continue', { exact: true });
    await sleep(1500);
    await page.click('button[title="Assembly of Leskovac"]');
    await sleep(900);
  },
  '08-rivals': async (page) => {
    await page.goto(`${BASE_URL}/rivals`, { waitUntil: 'networkidle2' });
    await hideChrome(page);
    await fillLobby(page);
    await waitText(page, 'Coaches (8/8)');
    await sleep(800);
  },
};
const saveFor = { '04-newspaper': 'news', '05-match': 'cup', '06-quote-cutscene': 'cup', '07-parliament': 'offseason' };

async function openCup(page) {
  await page.goto(`${BASE_URL}/manager`, { waitUntil: 'networkidle2' });
  await fullscreen(page);
  await mustClick(page, 'Continue', { exact: true });
  await sleep(1800);
  await mustClick(page, 'Continue');
  await sleep(1500);
}

const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));
for (const [name, run] of Object.entries(shots)) {
  if (only.length && !only.some((o) => name.startsWith(o))) continue;
  const file = join(SCREENSHOT_DIR, `${name}.png`);
  for (const [width, height] of SIZES) {
    const page = await newPage({ save: saves[saveFor[name]] ?? null, scale: 1, width, height });
    await run(page);
    await page.screenshot({ path: file });
    await page.browserContext().close();
    const bytes = statSync(file).size;
    if (bytes <= MAX_BYTES) {
      console.log(`${name}.png ${width}x${height} ${(bytes / 1024).toFixed(0)} KB`);
      break;
    }
    console.log(`${name}.png ${width}x${height} is ${(bytes / 1024).toFixed(0)} KB, retaking smaller`);
    unlinkSync(file);
  }
}
await browser.close();
