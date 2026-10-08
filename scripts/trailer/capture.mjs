// Trailer footage: node scripts/trailer/capture.mjs [group,group]
// Drives the game in headless Chrome against a dev server (BASE, default
// http://localhost:3218, started with CAREER_MP_UNLIMITED=1) and writes every
// moment the trailer needs as PNG frames into TRAILER_WORK/clips/<name>/, plus
// clips.json describing them (still or 30 fps sequence, the CSS viewport and
// device scale it was shot at, and the screen rect the compositor should zoom
// to). The game is filmed at a phone's viewport (432x768 at a device scale of
// 2.5, so a frame is the 1080x1920 stage exactly); only the cup bracket is
// shot at a desktop viewport, where all sixteen seats fit on one screen, and
// the compositor pans across it. Sequences advance the page on Chrome's
// virtual clock, one frame per 1/30 s, so the match, the cutscenes and the
// Rivals clip come out at an exact frame rate and never catch a loading
// state. Math.random is seeded in every page, so the same run gives the same
// footage. Groups: career (new career flow), offseason, cup, rivals. Needs
// puppeteer-core (PUPPETEER_CORE may point at a node_modules folder that has it).
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DESKTOP, FPS, PHONE, WORK_DIR } from './paths.mjs';
import {
  act, browser, buttons, click, fillLobby, focusRect, fullscreen, hasText, mustClick, newPage, saves,
  sleep, virtualClock, waitText,
} from './game.mjs';

const CLIP_DIR = join(WORK_DIR, 'clips');
const MANIFEST = join(CLIP_DIR, 'clips.json');
const groups = (process.argv[2] ?? 'career,offseason,cup,rivals').split(',');

mkdirSync(CLIP_DIR, { recursive: true });
const manifest = readManifest();

function readManifest() {
  try {
    return JSON.parse(readFileSync(MANIFEST, 'utf8'));
  } catch {
    return {};
  }
}

function saveManifest() {
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1));
}

function clipFolder(name) {
  const dir = join(CLIP_DIR, name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  return dir;
}

const viewportOf = (page) => {
  const { width, height, deviceScaleFactor } = page.viewport();
  return { width, height, scale: deviceScaleFactor };
};

// marks: named screen rects inside the shot (a label, a row, the character
// cells) that the compositor can zoom to or point a sticker at
async function still(page, name, { focus = null, marks = {} } = {}) {
  const dir = clipFolder(name);
  await page.screenshot({ path: join(dir, '0000.png') });
  manifest[name] = { kind: 'still', frames: 1, ...viewportOf(page), focus, marks };
  saveManifest();
  console.log(`  still ${name}${focus ? ` focus ${Math.round(focus.x)},${Math.round(focus.y)} ${Math.round(focus.w)}x${Math.round(focus.h)}` : ''}`);
}

// Steps the virtual clock one frame at a time; `until` can stop a clip early
// once the screen reaches a state
async function sequence(page, name, seconds, { focus = null, marks = {}, until = null, lead = 0 } = {}) {
  const clock = await virtualClock(page);
  if (lead > 0) await clock.advance(lead * 1000);
  if (typeof focus === 'function') focus = await focus();
  const dir = clipFolder(name);
  const total = Math.round(seconds * FPS);
  let frames = 0;
  for (let i = 0; i < total; i++) {
    await page.screenshot({ path: join(dir, `${String(i).padStart(4, '0')}.png`) });
    frames = i + 1;
    if (until && (await until())) break;
    await clock.advance(1000 / FPS);
  }
  manifest[name] = { kind: 'sequence', frames, fps: FPS, ...viewportOf(page), focus, marks };
  saveManifest();
  console.log(`  sequence ${name}: ${frames} frames`);
}

const labelRect = (page, text) => focusRect(page, text, 'none');

// The screen rects of the buttons whose text starts with each name
const buttonRects = (page, names) =>
  page.evaluate((names) => {
    const all = [...document.querySelectorAll('button')];
    return Object.fromEntries(names.map((n) => {
      const b = all.find((x) => (x.textContent || '').replace(/\s+/g, ' ').trim().startsWith(n));
      const r = b?.getBoundingClientRect();
      return [n, r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null];
    }));
  }, names);

async function careerGroup() {
  console.log('group career');
  const page = await newPage({ path: '/manager' });
  await fullscreen(page);
  await mustClick(page, 'New career', { exact: true });
  await sleep(2600);
  await still(page, 'intro-paper', { focus: await focusRect(page, 'COACH WANTED') });
  await mustClick(page, 'Answer the ad');
  await sleep(1500);
  const cells = await buttonRects(page, await buttons(page));
  await still(page, 'select', { focus: await focusRect(page, 'Who needs a coach?'), marks: cells });
  await page.hover('button ::-p-text(The Wolf)').catch(() => {});
  await sleep(400);
  await still(page, 'select-hover', { focus: await focusRect(page, 'Who needs a coach?'), marks: cells });
  await mustClick(page, 'The Wolf', { exact: true });
  await sleep(2500);
  await still(page, 'offseason-winter');
  await page.browserContext().close();
}

async function offseasonGroup() {
  console.log('group offseason');
  const open = async (save = 'offseason') => {
    const page = await newPage({ path: '/manager', save: saves[save] });
    await fullscreen(page);
    await mustClick(page, 'Continue', { exact: true });
    await sleep(1800);
    return page;
  };
  let page = await open();
  await still(page, 'offseason', {
    marks: {
      calendar: await labelRect(page, 'April · Year 3'),
      ...(await buttonRects(page, ['Training', 'Security crew'])),
    },
  });
  await page.browserContext().close();

  // One month of each kind, filmed from the moment it is paid for
  for (const [name, activity, choice] of [
    ['training-scene', 'Training', 'Pay 83 glizars'],
    ['rest-scene', 'Rest', 'Spend the month'],
    ['media-scene', 'Media', 'Spend the month'],
  ]) {
    page = await open();
    await mustClick(page, activity);
    await sleep(900);
    await mustClick(page, choice);
    await sleep(300);
    await sequence(page, name, 2.5, { focus: await focusRect(page, 'THIS MONTH') });
    await page.browserContext().close();
  }

  for (const [name, button, anchor] of [
    ['sabotage', 'Sabotage', 'Sabotage'],
    ['security', 'Security crew', 'Security crew'],
    ['investments', 'Investments', 'PERMANENT INVESTMENTS'],
    ['chart', 'Coach: The Wolf', 'PLAYER CHART'],
  ]) {
    page = await open();
    await mustClick(page, button, { exact: true });
    await sleep(900);
    const marks = name === 'chart' ? { ego: await labelRect(page, 'Ego'), sponsor: await labelRect(page, 'Sponsor payment') } : {};
    await still(page, name, { focus: await focusRect(page, anchor), marks });
    await page.browserContext().close();
  }
  for (const [name, title, anchor, label] of [
    ['table', 'League table', 'LEAGUE TABLE', 'Goal: first to 300 points'],
    ['parliament', 'Assembly of Leskovac', 'ASSEMBLY OF LESKOVAC', 'Party favor'],
  ]) {
    page = await open();
    await page.click(`button[title="${title}"]`);
    await sleep(900);
    await still(page, name, { focus: await focusRect(page, anchor), marks: { label: await labelRect(page, label) } });
    await page.browserContext().close();
  }
  page = await open('news');
  await still(page, 'news', { focus: await focusRect(page, 'TOP STORY') });
  await page.browserContext().close();
}

async function cupGroup() {
  console.log('group cup');
  const page = await newPage({ path: '/manager', save: saves.cup });
  await fullscreen(page);
  await mustClick(page, 'Continue', { exact: true });
  await sleep(1800);
  await mustClick(page, 'Continue');
  await sleep(1500);
  // The bracket is the one desktop shot: the phone stacks it a half at a time
  await page.setViewport({ width: DESKTOP.width, height: DESKTOP.height, deviceScaleFactor: DESKTOP.scale });
  await sleep(1200);
  await still(page, 'bracket', {
    marks: { stakes: await labelRect(page, 'Stake per match'), first: await labelRect(page, 'Your match') },
  });
  await page.setViewport({ width: PHONE.width, height: PHONE.height, deviceScaleFactor: PHONE.scale });
  await sleep(1200);
  await mustClick(page, 'Your match');
  await sleep(900);
  await still(page, 'match-intro', { focus: await focusRect(page, 'RECORD') });
  await mustClick(page, 'Continue');
  await sleep(200);
  const matchFocus = () => focusRect(page, 'Skip to result');
  const props = { hat: await labelRect(page, 'hat'), sock: await labelRect(page, 'sock'), box: await labelRect(page, 'box') };
  await sequence(page, 'match', 10, { focus: matchFocus, marks: props });
  const clock = await virtualClock(page);
  for (let i = 0; i < 120 && !(await hasText(page, 'MATCH OVER')); i++) await clock.advance(250);

  // Skip the rest of the cup and its quote scenes to the podium
  for (let step = 0; step < 60; step++) {
    const list = await buttons(page);
    if (await hasText(page, 'BREAKING NEWS')) {
      await mustClick(page, 'Skip', { exact: true });
      await clock.advance(600);
      continue;
    }
    if (list.includes('Podium')) {
      await mustClick(page, 'Podium', { exact: true });
      await clock.advance(2500);
      // A second quote scene may be airing; the portraits load off the
      // network, which the virtual clock does not wait for
      while (await hasText(page, 'BREAKING NEWS')) {
        await mustClick(page, 'Skip', { exact: true });
        await clock.advance(800);
      }
      await sleep(2000);
      await still(page, 'podium', { focus: await focusRect(page, 'Eliminated') });
      return page.browserContext().close();
    }
    if (list.includes('Skip remaining matches')) await click(page, 'Skip remaining matches');
    else if (list.includes('Next round')) await click(page, 'Next round');
    else if (list.some((b) => b.startsWith('Skip to result'))) await click(page, 'Skip to result');
    else if (list.includes('Continue')) await click(page, 'Continue', { exact: true });
    await clock.advance(1500);
  }
  throw new Error('the cup never reached the podium');
}

async function rivalsGroup() {
  console.log('group rivals');
  const page = await newPage({ path: '/rivals' });
  await fullscreen(page);
  const { code, tokens } = await fillLobby(page);
  await still(page, 'rivals-lobby', { focus: await focusRect(page, 'Coach list'), marks: { code: await labelRect(page, code) } });

  const everyoneDone = async () => {
    for (const token of tokens) await act(code, token, { type: 'setDone', done: true });
  };
  await mustClick(page, 'Start the league', { exact: true });
  await waitText(page, 'The league expands', 30000);
  await sleep(1200);
  await still(page, 'rivals-expansion', { focus: await focusRect(page, 'The league expands') });
  await mustClick(page, 'To the off-season', { exact: true });
  await sleep(800);
  await fullscreen(page);
  await waitText(page, 'Done 0 of 8');
  for (const token of tokens) await act(code, token, { type: 'train', trainingId: 'fans' });
  await everyoneDone();
  await waitText(page, 'Done 7 of 8');
  await sleep(1200);
  await still(page, 'rivals-window', { focus: await focusRect(page, 'Done 7 of 8') });
  await mustClick(page, 'Done', { exact: true });
  await waitText(page, 'THE GLIZZY GAZETTE', 30000);
  await sleep(1500);
  await mustClick(page, 'Done', { exact: true });
  await everyoneDone();
  await waitText(page, 'Round of 16', 30000);
  await sleep(1500);
  await mustClick(page, 'Done', { exact: true });
  await everyoneDone();
  await waitText(page, 'Pre-match', 30000);
  await sleep(1200);
  for (const token of tokens) await act(code, token, { type: 'pass' });
  await mustClick(page, 'Ready', { exact: true });
  await page.waitForFunction(
    () => [...document.querySelectorAll('button')].some((b) => b.textContent.includes('Skip to result') && !b.disabled),
    { timeout: 60000 },
  );
  // From here the stage animates on its own clock; the room polls are cut so
  // the server cannot move the phase on while the frames are taken
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    if (request.url().includes('/api/career-mp/')) request.abort();
    else request.continue();
  });
  const stageFocus = async () =>
    (await focusRect(page, 'Round 1')) ?? (await focusRect(page, 'Match starting...')) ?? focusRect(page, 'hat');
  await sequence(page, 'rivals-match', 9, { focus: stageFocus, lead: 1.5 });
  await page.browserContext().close();
}

const runners = { career: careerGroup, offseason: offseasonGroup, cup: cupGroup, rivals: rivalsGroup };
for (const group of groups) {
  if (!runners[group]) throw new Error(`unknown group ${group}`);
  await runners[group]();
}
await browser.close();
console.log(`clips at ${CLIP_DIR}`);
