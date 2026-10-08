// Trailer assembly: node scripts/trailer/compose.mjs [--preview | --frames-only | --encode-only]
// Lays the narration (TRAILER_WORK/narration, from narrate.mjs) over the
// footage (TRAILER_WORK/clips, from capture.mjs) on a 1080x1920 portrait
// stage: every shot is cued to the moment its first word is spoken, stickers
// and slams pop in on the words they annotate, and the karaoke captions come
// straight from the word alignment. The compositor page renders each frame
// at 30 fps under headless Chrome, mix.mjs lays the effects of sfx-cues.mjs
// under the voice (no music), and ffmpeg encodes H.264 and AAC. Writes
// public/trailer/glizzy-manager-trailer.mp4, the WebVTT captions next to it
// and the README poster (docs/screenshots/00-trailer.png, the title card).
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  CHROME, COMPOSITOR_FILE, FPS, HEIGHT, OUTPUT_MP4, OUTPUT_VTT, ROOT, SCREENSHOT_DIR, WIDTH, WORK_DIR, loadPuppeteer,
} from './paths.mjs';
import { mixAudio } from './mix.mjs';
import { beats, cueSheet } from './sfx-cues.mjs';

const NARRATION_DIR = join(WORK_DIR, 'narration');
const CLIP_DIR = join(WORK_DIR, 'clips');
const FRAME_DIR = join(WORK_DIR, 'frames');
const MIX_FILE = join(WORK_DIR, 'mix.wav');
const POSTER = join(SCREENSHOT_DIR, '00-trailer.png');
const FIRST_WORD_AT = 0.7;
const PARAGRAPH_GAP = 0.55;
const END_HOLD = 3.2;
const CUT_LEAD = 0.12;
const CAPTION_CHARS = 24;
const AMBER = '#fbbf24';
const RED = '#fca5a5';
const SKY = '#bae6fd';
const CYAN = '#a5f3fc';
const GREEN = '#6ee7b7';

const alignment = JSON.parse(readFileSync(join(NARRATION_DIR, 'alignment.json'), 'utf8'));
const clips = JSON.parse(readFileSync(join(CLIP_DIR, 'clips.json'), 'utf8'));

// Absolute word times: paragraphs follow one another with a short gap
let cursor = FIRST_WORD_AT;
const paragraphs = alignment.map((p) => {
  const start = cursor;
  cursor = start + p.duration + PARAGRAPH_GAP;
  return {
    ...p,
    start,
    end: start + p.duration,
    words: p.words.map((w) => ({ text: w.text, start: start + w.start, end: start + w.end })),
  };
});

// The moment a phrase starts being spoken in a paragraph, and the moment the
// picture cuts for it, a hair early so the cut lands on the word
function word(index, phrase) {
  const words = paragraphs[index].words;
  const wanted = phrase.split(' ').map(clean);
  for (let i = 0; i + wanted.length <= words.length; i++) {
    if (wanted.every((w, k) => clean(words[i + k].text) === w)) return words[i].start;
  }
  throw new Error(`"${phrase}" is not in paragraph ${index}: ${paragraphs[index].text}`);
}
function clean(text) {
  return text.toLowerCase().replace(/[^a-z0-9'-]/g, '');
}
const cut = (index, phrase) => word(index, phrase) - CUT_LEAD;
const end = (index) => paragraphs[index].end;
const last = paragraphs.length - 1;

const b = beats({ word, paragraphEnd: end });
const titleCard = { start: 0, end: cut(0, 'Strong'), stamp: b.titleStamp };
const endCard = { start: b.endCard, end: end(last) + END_HOLD, slam: b.endSlam, modes: b.endModes, url: b.endUrl };
const duration = endCard.end;

const mark = (clip, name) => {
  const rect = clips[clip]?.marks?.[name];
  if (!rect) throw new Error(`no mark "${name}" on clip "${clip}"`);
  return rect;
};
const focus = (clip) => clips[clip].focus;
const rect = (x, y, w, h) => ({ x, y, w, h });
const centerOf = (r) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });

// Each segment runs until the next one starts. Without zoom a phone shot
// fills the stage; zoom names a rect of the clip (CSS pixels) to frame above
// the captions, zoomTo a rect to glide to, from/to scale the fitted view
const cuts = [
  { start: titleCard.end, clip: 'intro-paper', zoom: rect(0, 60, 432, 640), zoomTo: rect(24, 480, 384, 190), pad: 1.04, from: 1, to: 1, ease: 'out', fade: 0.2 },
  { start: cut(1, 'Glizzy'), clip: 'select', zoom: focus('select'), pad: 1.04, from: 1, to: 1.03 },
  { start: b.landing, clip: 'select-hover', zoom: focus('select'), pad: 1.04, from: 1.03, to: 1.05, fade: 0, punch: 0 },
  { start: cut(1, 'through'), clip: 'offseason-winter', from: 1, to: 1.08 },
  { start: cut(2, 'The match'), clip: 'match-intro', zoom: focus('match-intro'), pad: 1, from: 1, to: 1.06 },
  { start: cut(2, 'Hide'), clip: 'match', zoom: focus('match'), pad: 1, from: 1, to: 1.1, offset: 2.4 },
  { start: cut(3, "You don't"), clip: 'offseason', from: 1, to: 1.05 },
  { start: cut(3, 'Three months'), clip: 'offseason', zoom: rect(0, 0, 300, 150), pad: 1.1, from: 1, to: 1.06 },
  { start: cut(3, 'one move'), clip: 'offseason', zoom: rect(0, 140, 230, 350), pad: 1.1, from: 1, to: 1.05 },
  { start: cut(3, 'train,'), clip: 'training-scene', zoom: focus('training-scene'), pad: 1, from: 1, to: 1.06, offset: 0.4 },
  { start: cut(3, 'rest,'), clip: 'rest-scene', zoom: focus('rest-scene'), pad: 1, from: 1, to: 1.06, offset: 0.4 },
  { start: cut(3, 'media'), clip: 'media-scene', zoom: focus('media-scene'), pad: 1, from: 1, to: 1.06, offset: 0.3 },
  { start: cut(3, 'Money'), clip: 'security', zoom: focus('security'), pad: 1.05, from: 1, to: 1.05 },
  { start: cut(3, 'investments'), clip: 'investments', zoom: focus('investments'), pad: 1, from: 1, to: 1.05 },
  { start: cut(3, 'sabotage.'), clip: 'sabotage', zoom: focus('sabotage'), pad: 1, from: 1, to: 1.05 },
  { start: cut(3, 'And watch'), clip: 'chart', zoom: focus('chart'), pad: 1.05, from: 1, to: 1.05 },
  { start: cut(3, 'ego over'), clip: 'chart', zoom: rect(40, 385, 352, 60), pad: 1.1, from: 1, to: 1.12 },
  { start: cut(4, 'Four cups'), clip: 'bracket', zoom: rect(60, 270, 440, 560), zoomTo: rect(1420, 270, 440, 560), pad: 1, from: 1, to: 1 },
  { start: cut(4, 'A title'), clip: 'podium', from: 1, to: 1.06 },
  { start: cut(4, 'A win'), clip: 'table', zoom: focus('table'), pad: 1, from: 1, to: 1.04 },
  { start: cut(4, 'First to'), clip: 'table', zoom: rect(200, 60, 200, 45), pad: 1.6, from: 1, to: 1.06 },
  { start: cut(5, 'There are'), clip: 'chart', zoom: rect(40, 170, 370, 90), pad: 1.1, from: 1, to: 1.05 },
  { start: cut(5, 'The Assembly'), clip: 'parliament', zoom: focus('parliament'), pad: 1.05, from: 1, to: 1.05 },
  { start: cut(5, 'Elections.'), clip: 'news', zoom: focus('news'), pad: 1, from: 1, to: 1.05 },
  { start: cut(5, 'Favors.'), clip: 'parliament', zoom: rect(24, 440, 384, 270), pad: 1.05, from: 1, to: 1.04, free: true },
  { start: cut(6, 'Glizzy Rivals'), clip: 'rivals-lobby', from: 1, to: 1.05 },
  { start: cut(6, 'one room'), clip: 'rivals-lobby', zoom: rect(60, 120, 240, 100), pad: 1.2, from: 1, to: 1.06 },
  { start: cut(6, "Everyone's"), clip: 'rivals-window', zoom: rect(0, 330, 432, 438), pad: 1, from: 1, to: 1.04, free: true },
  { start: cut(6, 'you watch'), clip: 'rivals-match', from: 1, to: 1.08, offset: 1.5 },
  { start: cut(6, 'bet,'), clip: 'bracket', zoom: rect(780, 370, 340, 70), pad: 1.25, from: 1, to: 1.06 },
  { start: cut(6, 'and sabotage'), clip: 'sabotage', zoom: focus('sabotage'), pad: 1, from: 1.04, to: 1.1 },
];
const segments = cuts.map((seg, i) => ({ ...seg, end: cuts[i + 1]?.start ?? endCard.start }));
for (const seg of segments) {
  if (!clips[seg.clip]) throw new Error(`no clip "${seg.clip}" in ${CLIP_DIR}`);
  if (seg.end <= seg.start) throw new Error(`segment ${seg.clip} at ${seg.start} ends before it starts`);
}

// The character spin: a ring hops across the cells on every tick and lands
// on The Wolf on the ding
const cellNames = Object.keys(clips.select.marks).filter((n) => n !== 'The Wolf');
const spinOrder = [5, 0, 10, 3, 13, 7, 1, 11, 4, 14, 8, 2, 12, 6, 9].map((i) => cellNames[i % cellNames.length]);
const rings = [
  ...b.spin.map((at, i) => ({
    clip: 'select',
    rect: clips.select.marks[spinOrder[i % spinOrder.length]],
    start: at,
    end: b.spin[i + 1] ?? b.landing,
  })),
  { clip: 'select-hover', rect: mark('select-hover', 'The Wolf'), start: b.landing, end: cut(1, 'through'), pop: true },
  { clip: 'rivals-lobby', rect: mark('rivals-lobby', 'code'), start: word(6, 'code.') - 0.2, end: cut(6, "Everyone's"), pop: true },
];

// Stickers: text, when, where (stage pixels, or anchored to a point of the
// clip on screen), and how long
const sticker = (text, start, x, y, { color = AMBER, rot = -4, until = null, scale = 1, anchor = null, dx = 0, dy = 0 } = {}) =>
  ({ text, start, end: until ?? start + 3, x, y, color, rot, scale, anchor, dx, dy });
const anchored = (clip, point, dx, dy) => ({ anchor: { clip, ...point }, dx, dy });
const prop = (name) => centerOf(mark('match', name));
const stickers = [
  sticker('Experience: 0', word(0, 'No'), 540, 1470, { color: RED, rot: -6, until: titleCard.end }),
  sticker('Strong stomach only', word(0, 'Strong'), 540, 230, { color: AMBER, rot: 3, until: cut(1, 'Glizzy') }),
  sticker('16 characters', word(1, 'sixteen'), 540, 150, { color: SKY, rot: -3, until: cut(1, 'through'), scale: 1.1 }),
  sticker('Hat', word(2, 'hat,'), 0, 0, { rot: -6, until: cut(2, 'Three'), scale: 0.85, ...anchored('match', prop('hat'), 0, 120) }),
  sticker('Sock', word(2, 'sock'), 0, 0, { color: CYAN, rot: 3, until: cut(2, 'Three'), scale: 0.85, ...anchored('match', prop('sock'), 0, 120) }),
  sticker('Box', word(2, 'box.'), 0, 0, { color: SKY, rot: -3, until: cut(2, 'Three'), scale: 0.85, ...anchored('match', prop('box'), 0, 120) }),
  sticker('3 grabs = you lose', word(2, 'Three'), 540, 140, { color: RED, rot: -3, until: end(2) + 0.4 }),
  sticker('You prepare', word(3, 'prepare.'), 540, 1020, { color: SKY, rot: -4, until: cut(3, 'Three months'), scale: 1.2 }),
  sticker('3 months', word(3, 'Three months'), 0, 0, { rot: -4, until: cut(3, 'one move'), scale: 1.2, ...anchored('offseason', centerOf(mark('offseason', 'calendar')), 60, 190) }),
  sticker('1 move a month', word(3, 'one move'), 0, 0, { color: SKY, rot: 4, until: cut(3, 'train,'), ...anchored('offseason', centerOf(mark('offseason', 'Training')), 420, 40) }),
  sticker('Training', word(3, 'train,'), 540, 230, { color: GREEN, rot: -4, until: cut(3, 'rest,'), scale: 1.15 }),
  sticker('Rest', word(3, 'rest,'), 540, 230, { color: CYAN, rot: 4, until: cut(3, 'media'), scale: 1.15 }),
  sticker('Media = cash', word(3, 'media'), 540, 230, { color: AMBER, rot: -3, until: cut(3, 'Money'), scale: 1.15 }),
  sticker('Security', word(3, 'security,'), 540, 1430, { color: SKY, rot: 4, until: cut(3, 'investments') }),
  sticker('Investments', word(3, 'investments'), 540, 1430, { color: GREEN, rot: -4, until: cut(3, 'sabotage.') }),
  sticker('Sabotage', word(3, 'sabotage.'), 540, 1430, { color: RED, rot: 4, until: cut(3, 'And watch') }),
  sticker('Ego 75+', word(3, 'seventy-five,') + 0.3, 0, 0, { color: RED, rot: -5, until: end(3) + 0.4, scale: 1.2, ...anchored('chart', centerOf(mark('chart', 'ego')), 250, -170) }),
  sticker('Plays on their own', word(3, 'they'), 0, 0, { color: AMBER, rot: 3, until: end(3) + 0.4, ...anchored('chart', centerOf(mark('chart', 'ego')), 330, 200) }),
  ...['Frozen', 'Bloody', 'Summer', 'Eggplant'].map((cup, i) =>
    sticker(cup, word(4, 'Four') + 0.15 + i * 0.2, i % 2 ? 790 : 290, i < 2 ? 150 : 290, {
      color: [SKY, RED, AMBER, '#d8b4fe'][i], rot: i % 2 ? 4 : -4, until: word(4, 'bracket') - 0.1, scale: 0.9,
    })),
  sticker('Bracket of 16', word(4, 'bracket'), 540, 200, { color: CYAN, rot: -3, until: cut(4, 'A title'), scale: 1.15 }),
  sticker('Title +20', word(4, 'title,') + 0.3, 540, 1350, { color: AMBER, rot: -4, until: cut(4, 'A win'), scale: 1.2 }),
  sticker('Win +3', word(4, 'win,') + 0.2, 760, 1290, { color: GREEN, rot: 4, until: cut(4, 'First to') }),
  sticker('Loss -1', word(4, 'loss,') + 0.2, 760, 1440, { color: RED, rot: -3, until: cut(4, 'First to') }),
  sticker('Sponsors = parties', word(5, 'sponsors,'), 540, 1180, { color: AMBER, rot: -4, until: cut(5, 'The Assembly') }),
  sticker('The Assembly', word(5, 'The Assembly'), 540, 1430, { color: SKY, rot: 4, until: cut(5, 'Elections.') }),
  sticker('Elections', word(5, 'Elections.'), 540, 1430, { color: GREEN, rot: -4, until: cut(5, 'Favors.') }),
  sticker('Favors', word(5, 'Favors.'), 540, 1120, { color: RED, rot: 4, until: word(5, "You'll") - 0.05, scale: 1.2 }),
  sticker('Up to 8 coaches', word(6, 'eight'), 540, 1460, { color: AMBER, rot: -4, until: cut(6, 'one room') }),
  sticker('One code', word(6, 'code.') - 0.2, 0, 0, { color: RED, rot: 3, until: cut(6, "Everyone's"), scale: 1.25, ...anchored('rivals-lobby', centerOf(mark('rivals-lobby', 'code')), 0, 230) }),
  sticker('All at once', word(6, 'runs'), 540, 1420, { color: CYAN, rot: -3, until: cut(6, 'you watch'), scale: 1.2 }),
  sticker('Cup together', word(6, 'cup') + 0.2, 540, 230, { color: GREEN, rot: 4, until: cut(6, 'bet,'), scale: 1.1 }),
  sticker('Bet', word(6, 'bet,'), 0, 0, { color: AMBER, rot: -5, until: cut(6, 'and sabotage'), scale: 1.3, ...anchored('bracket', centerOf(mark('bracket', 'stakes')), 160, 260) }),
  sticker('Sabotage each other', word(6, 'sabotage') + 0.2, 540, 1430, { color: RED, rot: -3, until: endCard.start, scale: 0.95 }),
];

// Slams: a big line dropped on the screen for the beats that need weight
const slams = [
  { html: 'You<br>lose', start: word(2, 'lose.'), end: end(2) + 0.45, y: 560, size: 190, color: '#fecaca', rot: -4 },
  { html: 'First to<br>300', start: word(4, 'First'), end: end(4) + 0.45, y: 520, size: 170, color: '#fde68a' },
  { html: 'Glizzy Overlord', start: word(4, 'Glizzy'), end: end(4) + 0.45, y: 940, size: 96 },
  { html: "You'll figure<br>it out.", start: word(5, "You'll"), end: end(5) + 0.4, y: 1270, size: 92 },
];

const pips = { start: word(2, 'Three'), end: end(2) + 0.4, y: 225, fills: b.chomps };

// Captions: a few words a line, broken at punctuation, each line on screen
// until the next one starts; the sign-off is the end card's own slam
const captions = [];
for (const [index, para] of paragraphs.entries()) {
  const lines = [];
  let line = [];
  const length = (words) => words.reduce((n, w) => n + w.text.length + 1, -1);
  for (const w of para.words) {
    if (line.length && length([...line, w]) > CAPTION_CHARS) {
      lines.push(line);
      line = [];
    }
    line.push(w);
    if (/[.:!?]$/.test(w.text) || (/,$/.test(w.text) && length(line) >= 12)) {
      lines.push(line);
      line = [];
    }
  }
  if (line.length) lines.push(line);
  lines.forEach((words, i) => {
    const next = lines[i + 1];
    captions.push({
      start: words[0].start - 0.08,
      end: next ? next[0].start - 0.08 : Math.min(words[words.length - 1].end + 0.6, para.end + PARAGRAPH_GAP),
      words,
      hidden: index === last,
    });
  });
}
captions.forEach((line, i) => {
  if (captions[i + 1]) line.end = Math.min(line.end, captions[i + 1].start);
});

const timeline = {
  clipBase: pathToFileURL(CLIP_DIR).href,
  clips,
  titleCard,
  endCard,
  segments,
  rings,
  stickers,
  slams,
  pips,
  captions,
  duration,
};
writeFileSync(join(WORK_DIR, 'timeline.json'), JSON.stringify(timeline, null, 1));
const cues = cueSheet({ word, cut }, b);
writeFileSync(join(WORK_DIR, 'cues.json'), JSON.stringify(cues, null, 1));
console.log(`timeline: ${segments.length} segments, ${stickers.length} stickers, ${captions.length} caption lines, ${cues.length} effect cues, ${duration.toFixed(2)} s`);

// Frames. --preview renders 24 spread moments into one contact sheet instead;
// --encode-only keeps the frames of the last run and redoes the sound and mux
const preview = process.argv.includes('--preview');
const encodeOnly = process.argv.includes('--encode-only');
const totalFrames = Math.ceil(duration * FPS);
if (!encodeOnly) {
  rmSync(FRAME_DIR, { recursive: true, force: true });
  mkdirSync(FRAME_DIR, { recursive: true });
  await renderFrames();
}
if (process.argv.includes('--frames-only')) process.exit(0);

async function renderFrames() {
  const puppeteer = await loadPuppeteer();
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--allow-file-access-from-files', '--hide-scrollbars'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.log('[compositor]', e.message));
  await page.goto(pathToFileURL(COMPOSITOR_FILE).href, { waitUntil: 'load' });
  await page.evaluate((tl) => window.setTimeline(tl), timeline);
  const started = Date.now();
  if (preview) {
    const sheet = join(WORK_DIR, 'preview.png');
    for (let i = 0; i < 24; i++) {
      const t = ((i + 0.5) / 24) * duration;
      await page.evaluate((t) => window.render(t), t);
      await page.screenshot({ path: join(FRAME_DIR, `${String(i).padStart(5, '0')}.png`) });
    }
    await browser.close();
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', join(FRAME_DIR, '%05d.png'), '-vf', 'scale=270:-1,tile=8x3', sheet]);
    console.log(sheet);
    process.exit(0);
  }
  // The README poster: the title card once the stamp has landed, without
  // the caption under it
  const posterFull = join(WORK_DIR, 'poster.png');
  await page.evaluate((t) => window.render(t, { captions: false }), titleCard.stamp + 0.5);
  await page.screenshot({ path: posterFull });
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', posterFull, '-vf', 'scale=540:960:flags=lanczos', POSTER]);
  for (let i = 0; i < totalFrames; i++) {
    await page.evaluate((t) => window.render(t), i / FPS);
    await page.screenshot({ path: join(FRAME_DIR, `${String(i).padStart(5, '0')}.png`) });
    if (i % 300 === 0) console.log(`frame ${i}/${totalFrames} (${((Date.now() - started) / 1000).toFixed(0)} s)`);
  }
  await browser.close();
  console.log(`${totalFrames} frames in ${((Date.now() - started) / 1000).toFixed(0)} s`);
}

mixAudio({ paragraphs, cues, duration, out: MIX_FILE });
mkdirSync(join(ROOT, 'public', 'trailer'), { recursive: true });
execFileSync('ffmpeg', [
  '-y', '-v', 'error',
  '-framerate', String(FPS), '-i', join(FRAME_DIR, '%05d.png'),
  '-i', MIX_FILE,
  '-map', '0:v', '-map', '1:a',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', String(FPS),
  '-c:a', 'aac', '-b:a', '160k', '-ar', '48000',
  '-movflags', '+faststart', '-shortest', '-map_metadata', '-1',
  OUTPUT_MP4,
]);

// Captions file for the in-game player: one cue per caption line
const stamp = (s) => {
  const ms = Math.round(s * 1000);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(ms % 1000).padStart(3, '0')}`;
};
const vtt = ['WEBVTT', '', ...captions.flatMap((c, i) => [
  String(i + 1),
  `${stamp(c.start)} --> ${stamp(c.end)}`,
  c.words.map((w) => w.text).join(' '),
  '',
])].join('\n');
writeFileSync(OUTPUT_VTT, vtt);

const size = statSync(OUTPUT_MP4).size;
const probe = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', OUTPUT_MP4]).toString().trim();
console.log(`${OUTPUT_MP4}: ${Number(probe).toFixed(2)} s, ${(size / 1024 / 1024).toFixed(1)} MB`);
console.log(OUTPUT_VTT);
console.log(POSTER);
