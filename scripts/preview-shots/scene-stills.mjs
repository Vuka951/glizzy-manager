// Stills of one preview scene: node scripts/preview-shots/scene-stills.mjs <quote|action|hit> <sceneId> [ms,ms,...] [outcome]
// A quote scene plays with the default cast unless SPEAKER and OTHER name roster slugs.
// Needs the dev server (BASE, default http://localhost:3000) and puppeteer-core
// (npm i --no-save puppeteer-core). Writes PNGs to scripts/preview-shots/output.
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const [kind, scene, times = '800,2500,4500', outcome] = process.argv.slice(2);
if (!['quote', 'action', 'hit'].includes(kind) || !scene) {
  console.error('usage: scene-stills.mjs <quote|action|hit> <sceneId> [ms,ms,...] [outcome]');
  process.exit(2);
}

const BASE = process.env.BASE ?? 'http://localhost:3000';
const OUT = process.env.SHOTS_DIR ?? path.join(import.meta.dirname, 'output');
const CHROME =
  process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const { default: puppeteer } = await import(process.env.PUPPETEER_CORE ?? 'puppeteer-core');

mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--mute-audio'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1100, height: 900, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (error) => errors.push(String(error)));
await page.goto(`${BASE}/preview/animations`, { waitUntil: 'networkidle2' });

const stageSelector = `[data-stage="${kind}"]`;
const stage = await page.waitForSelector(stageSelector);
const picker = await page.evaluateHandle(
  (selector, id) =>
    document
      .querySelector(selector)
      ?.parentElement?.querySelector(`button[data-scene="${id}"]`) ?? null,
  stageSelector,
  scene,
);
if (!picker.asElement()) {
  console.error(`no ${kind} scene "${scene}" in the preview`);
  await browser.close();
  process.exit(1);
}
await picker.asElement().click();
if (outcome) await page.click(`button[data-outcome="${outcome}"]`);
const cast = [
  ['speaker', process.env.SPEAKER],
  ['other', process.env.OTHER],
].filter(([, slug]) => kind === 'quote' && slug);
for (const [role, slug] of cast) {
  const button = await page.$(`button[data-${role}="${slug}"]`);
  if (!button) {
    console.error(`no ${role} "${slug}" to pick for "${scene}"`);
    await browser.close();
    process.exit(1);
  }
  await button.click();
}
const castTag = cast.map(([, slug]) => `-${slug}`).join('');
await stage.scrollIntoView();

const startedAt = Date.now();
for (const at of times.split(',').map(Number)) {
  const wait = at - (Date.now() - startedAt);
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  const file = path.join(
    OUT,
    `${kind}-${scene}${outcome ? `-${outcome}` : ''}${castTag}-${at}.png`,
  );
  await stage.screenshot({ path: file });
  console.log(file);
}
if (errors.length) console.error('page errors:', errors);
await browser.close();
