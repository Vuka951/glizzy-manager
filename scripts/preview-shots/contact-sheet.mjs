// Contact sheet of every preview scene: node scripts/preview-shots/contact-sheet.mjs [quote,action,hit]
// Needs the dev server (BASE, default http://localhost:3000) and puppeteer-core
// (npm i --no-save puppeteer-core). Writes stills, contact-sheet.html and one
// PNG per scene family to scripts/preview-shots/output/contact.
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const FAMILIES = {
  quote: { title: 'Quote cutscenes', times: [1800, 3400, 5000] },
  action: { title: 'Action cutscenes', times: [900, 2200, 3600] },
  hit: { title: 'Sabotage hit scenes', times: [900, 2200, 3600] },
};
const kinds = (process.argv[2] ?? 'quote,action,hit').split(',');
const BASE = process.env.BASE ?? 'http://localhost:3000';
const OUT = process.env.SHOTS_DIR ?? path.join(import.meta.dirname, 'output', 'contact');
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

const sheet = [];
for (const kind of kinds) {
  const family = FAMILIES[kind];
  const stageSelector = `[data-stage="${kind}"]`;
  const stage = await page.waitForSelector(stageSelector);
  const scenes = await page.evaluate(
    (selector) =>
      [
        ...document
          .querySelector(selector)
          .parentElement.querySelectorAll('button[data-scene]'),
      ].map((button) => button.dataset.scene),
    stageSelector,
  );
  const rows = [];
  for (const scene of scenes) {
    await page.evaluate(
      (selector, id) =>
        document
          .querySelector(selector)
          .parentElement.querySelector(`button[data-scene="${id}"]`)
          .click(),
      stageSelector,
      scene,
    );
    await stage.scrollIntoView();
    // Let the scene mount and start its animations, then freeze them and seek
    // to each still: wall-clock waits drift on a busy dev server
    await new Promise((resolve) => setTimeout(resolve, 250));
    const stills = [];
    for (const at of family.times) {
      await page.evaluate((selector, time) => {
        const root = document.querySelector(selector);
        for (const animation of document.getAnimations()) {
          const target = animation.effect?.target;
          if (!target || !root.contains(target)) continue;
          animation.pause();
          animation.currentTime = time;
        }
      }, stageSelector, at);
      const file = `${kind}-${scene}-${at}.png`;
      await stage.screenshot({ path: path.join(OUT, file) });
      stills.push(file);
    }
    rows.push({ scene, stills });
    console.log(`${kind} ${scene}`);
  }
  sheet.push({ kind, title: family.title, rows });
}

const html = `<!doctype html>
<meta charset="utf-8">
<title>Scene contact sheet</title>
<style>
  body { margin: 0; padding: 16px; background: #0b1220; color: #e2e8f0; font: 13px/1.3 system-ui, sans-serif; }
  section { margin-bottom: 28px; }
  h2 { margin: 0 0 10px; font-size: 18px; }
  .row { display: grid; grid-template-columns: 170px repeat(3, 1fr); gap: 6px; align-items: center; margin-bottom: 6px; }
  .row img { width: 100%; display: block; border-radius: 6px; }
  .id { font-family: ui-monospace, monospace; font-size: 12px; word-break: break-word; }
</style>
${sheet
  .map(
    (family) => `<section id="${family.kind}">
  <h2>${family.title} (${family.rows.length})</h2>
  ${family.rows
    .map(
      (row) =>
        `<div class="row"><div class="id">${row.scene}</div>${row.stills
          .map((file) => `<img src="${file}" alt="${row.scene}">`)
          .join('')}</div>`,
    )
    .join('\n  ')}
</section>`,
  )
  .join('\n')}
`;
writeFileSync(path.join(OUT, 'contact-sheet.html'), html);

const sheetPage = await browser.newPage();
await sheetPage.setViewport({ width: 1500, height: 1000, deviceScaleFactor: 1 });
await sheetPage.goto(`file://${path.join(OUT, 'contact-sheet.html')}`, {
  waitUntil: 'networkidle0',
});
for (const family of sheet) {
  const section = await sheetPage.$(`#${family.kind}`);
  await section.screenshot({ path: path.join(OUT, `contact-${family.kind}.png`) });
}
if (errors.length) console.error('page errors:', errors);
console.log(path.join(OUT, 'contact-sheet.html'));
await browser.close();
