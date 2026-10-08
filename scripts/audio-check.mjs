// Clip integrity check for the audio bank: node scripts/audio-check.mjs
// Collects every clip the code can play (cutscene cues and beds, quote
// scenes, the sfx banks, the mood lines, the season music, the arena crowd
// and the voiced commentary lines) and compares it with public/games/audio.
// Fails (exit 1) on a referenced clip with no file, a file no code
// references, a non-mp3 file, a cutscene id nothing plays, or a file whose
// container or stream metadata carries a tag. The tag check needs ffprobe; without it the check
// is skipped and the summary says so.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { register } from 'node:module';
import { join, relative, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const AUDIO_DIR = join(ROOT, 'public', 'games', 'audio');
const AUDIO_URL_BASE = '/games/audio/';

// The game modules use the `@/` alias and JSON imports, which plain node
// only resolves through the simulators' loader
register('./career-sim/loader.mjs', import.meta.url);

const { CUTSCENE_AUDIO_DIR, ARENA_CROWD_BED_SRC, CUTSCENE_SOUNDTRACKS, SABOTAGE_HIT_SOUNDTRACKS } =
  await import('../lib/constants/cutsceneSounds.ts');
const { QUOTE_SCENES, QUOTE_WORD_BLIP } = await import('../lib/constants/quoteCutscenes.ts');
const { GAME_MUSIC_TRACKS } = await import('../lib/constants/gameMusic.ts');
const { COMMENTARY_VOICE_LOCALES } = await import('../lib/constants/careerCommentaryVoice.ts');
const { moodSoundVariants } = await import('../lib/utils/moodSounds.ts');
const gameSounds = await import('../lib/utils/gameSounds.ts');
const { CHARACTER_ROSTER } = await import('../data/games/roster.ts');

// A clip's url under public/, and the places that play it
const references = new Map();

function refer(url, label) {
  if (!url.startsWith(AUDIO_URL_BASE)) throw new Error(`${label}: ${url} is outside ${AUDIO_URL_BASE}`);
  const file = url.slice(AUDIO_URL_BASE.length);
  if (!references.has(file)) references.set(file, new Set());
  references.get(file).add(label);
}

const cutsceneUrl = (id) => `${CUTSCENE_AUDIO_DIR}/${id}.mp3`;

// A type union has no runtime value, so the declared bank is read from the
// source. The comment on it promises one id per mp3 in the folder
const cutsceneSource = readFileSync(join(ROOT, 'lib', 'constants', 'cutsceneSounds.ts'), 'utf8');
const declaredClipIds = [
  ...cutsceneSource.match(/export type CutsceneClipId =([\s\S]*?);/)[1].matchAll(/'([^']+)'/g),
].map((m) => m[1]);
for (const id of declaredClipIds) refer(cutsceneUrl(id), 'CutsceneClipId');

// The site's one-shots, enumerated by calling each bank with Math.random
// swept over every variant index. A new play function must be listed here;
// the check below fails on one that is not
const SFX_BANKS = [
  { call: 'playChompSound', args: [], sfx: 'chomp' },
  { call: 'playPlaceSound', args: [], sfx: 'place' },
  { call: 'playLiftSound', args: ['hat'], sfx: 'lift-hat' },
  { call: 'playLiftSound', args: ['sock'], sfx: 'lift-sock' },
  { call: 'playLiftSound', args: ['box'], sfx: 'lift-box' },
  { call: 'playCoinSound', args: [0] },
  { call: 'playCoinSound', args: [25] },
  { call: 'playCoinSound', args: [50] },
  { call: 'playCheerSound', args: [], sfx: 'cheer' },
  { call: 'playBooSound', args: [], sfx: 'boo' },
  { call: 'playCricketSound', args: [] },
  { call: 'playPaperSound', args: [], sfx: 'paper' },
  { call: 'playLetterSound', args: [] },
  { call: 'playPukeSound', args: [], sfx: 'puke' },
  { call: 'playMeltdownSound', args: [] },
  { call: 'playPoliceSound', args: [] },
  { call: 'playWithdrawSound', args: [] },
  { call: 'playShutterSound', args: [], sfx: 'shutter' },
  { call: 'playTrophySound', args: [], sfx: 'trophy' },
  { call: 'playCharacterSelectSound', args: [] },
];
const MAX_BANK_VARIANTS = 20;

const bankLabel = (bank) => `${bank.call}(${bank.args.map((a) => JSON.stringify(a)).join(', ')})`;

const unlistedPlayers = Object.keys(gameSounds).filter(
  (name) => typeof gameSounds[name] === 'function' && !SFX_BANKS.some((bank) => bank.call === name),
);
if (unlistedPlayers.length > 0) {
  console.error(`gameSounds exports not listed in SFX_BANKS: ${unlistedPlayers.join(', ')}`);
  process.exit(1);
}

const sfxFiles = new Map();
{
  const played = [];
  // No localStorage on the stub: the audio settings fall back to defaults
  globalThis.window = {};
  globalThis.Audio = class {
    constructor(src) {
      played.push(src);
    }
    play() {
      return Promise.resolve();
    }
  };
  const realRandom = Math.random;
  for (const bank of SFX_BANKS) {
    const urls = new Set();
    for (let i = 0; i < MAX_BANK_VARIANTS; i += 1) {
      Math.random = () => i / MAX_BANK_VARIANTS;
      played.length = 0;
      gameSounds[bank.call](...bank.args);
      urls.add(played[0]);
    }
    Math.random = realRandom;
    const label = bankLabel(bank);
    for (const url of urls) refer(url, label);
    if (bank.sfx) sfxFiles.set(bank.sfx, [...urls]);
  }
  delete globalThis.window;
  delete globalThis.Audio;
}

function referCues(cues, label) {
  for (const cue of cues) {
    if (cue.clip) refer(cutsceneUrl(cue.clip), label);
    if (cue.sfx) {
      const urls = sfxFiles.get(cue.sfx);
      if (!urls) {
        console.error(`${label}: sfx cue "${cue.sfx}" has no bank in SFX_BANKS`);
        process.exit(1);
      }
      for (const url of urls) refer(url, label);
    }
  }
}

function referBed(bed, label) {
  refer(bed === 'arena-crowd' ? ARENA_CROWD_BED_SRC : cutsceneUrl(bed), label);
}

for (const [scene, track] of Object.entries(CUTSCENE_SOUNDTRACKS)) {
  referBed(track.bed, `scene ${scene}`);
  referCues(track.cues, `scene ${scene}`);
}
for (const [scene, track] of Object.entries(SABOTAGE_HIT_SOUNDTRACKS)) {
  referBed(track.bed, `hit ${scene}`);
  referCues(track.cues, `hit ${scene}`);
}
for (const scene of QUOTE_SCENES) {
  referBed(scene.sounds.bed, `quote ${scene.id}`);
  referCues(scene.sounds.cues, `quote ${scene.id}`);
}
refer(cutsceneUrl(QUOTE_WORD_BLIP), 'QUOTE_WORD_BLIP');

// Components are React and cannot load here; their one-off calls are read
// from the source
function* sourceFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* sourceFiles(full);
    else if (/\.tsx?$/.test(entry.name)) yield full;
  }
}
for (const dir of ['components', 'app']) {
  for (const file of sourceFiles(join(ROOT, dir))) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/playCutsceneClip\(\s*'([^']+)'/g)) {
      refer(cutsceneUrl(match[1]), relative(ROOT, file));
    }
  }
}

const moodSource = readFileSync(join(ROOT, 'lib', 'utils', 'careerMood.ts'), 'utf8');
const moodActivities = [
  ...moodSource.match(/export type CareerMoodActivity =([\s\S]*?);/)[1].matchAll(/'([^']+)'/g),
].map((m) => m[1]);
for (const activity of moodActivities) {
  for (const url of moodSoundVariants(activity)) refer(url, `mood ${activity}`);
}

GAME_MUSIC_TRACKS.forEach((url, season) => refer(url, `season ${season + 1}`));

// Mirrors clipUrl in lib/utils/matchCommentary.ts and the generator: a
// line that names a character has one take per roster slug
for (const locale of COMMENTARY_VOICE_LOCALES) {
  const dictionary = JSON.parse(
    readFileSync(join(ROOT, 'data', 'games', 'locales', `${locale}.json`), 'utf8'),
  );
  const base = `${AUDIO_URL_BASE}commentary/career/${locale}`;
  for (const [id, copy] of Object.entries(dictionary.commentary.lines)) {
    const label = `commentary ${locale} ${id}`;
    if (copy.text.includes('{name}')) {
      for (const character of CHARACTER_ROSTER) refer(`${base}/${id}--${character.slug}.mp3`, label);
    } else {
      refer(`${base}/${id}.mp3`, label);
    }
  }
}

function* audioFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* audioFiles(full);
    else yield relative(AUDIO_DIR, full);
  }
}
const files = [...audioFiles(AUDIO_DIR)].sort();

let ffprobe = true;
try {
  execFileSync('ffprobe', ['-version'], { stdio: 'ignore' });
} catch {
  ffprobe = false;
}

// Container tags and stream tags both count. The one stream tag allowed is the
// bare encoder marker of the Xing/Info frame: decoders only read the gapless
// delay and padding behind a recognised marker, and the season loops depend
// on that trim, so a versioned or vendor string fails while the marker stays
const GAPLESS_MARKER = 'Lavf';
function tagsOf(file) {
  const out = execFileSync('ffprobe', [
    '-v', 'error', '-show_entries', 'format_tags:stream_tags', '-of', 'json', join(AUDIO_DIR, file),
  ]);
  const probe = JSON.parse(out.toString());
  return [
    ...Object.keys(probe.format?.tags ?? {}),
    ...(probe.streams ?? []).flatMap((stream) =>
      Object.entries(stream.tags ?? {})
        .filter(([key, value]) => !(key === 'encoder' && value === GAPLESS_MARKER))
        .map(([key]) => key),
    ),
  ];
}

const problems = [];
const fileSet = new Set(files);

for (const [file, labels] of [...references].sort()) {
  if (!fileSet.has(file)) problems.push(`missing: ${file} (${[...labels].join(', ')})`);
}
for (const file of files) {
  if (!references.has(file)) problems.push(`orphan: ${file}`);
  if (extname(file) !== '.mp3') problems.push(`not mp3: ${file}`);
}
for (const id of declaredClipIds) {
  const labels = references.get(`cutscenes/${id}.mp3`);
  if (labels.size === 1) problems.push(`declared but never played: CutsceneClipId '${id}'`);
}
if (ffprobe) {
  for (const file of files) {
    if (extname(file) !== '.mp3') continue;
    const tags = tagsOf(file);
    if (tags.length > 0) problems.push(`tagged: ${file} (${tags.join(', ')})`);
  }
}

if (problems.length > 0) {
  console.error(`${problems.length} problem${problems.length === 1 ? '' : 's'}:`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

const folders = new Map();
let totalBytes = 0;
for (const file of files) {
  const folder = dirname(file);
  const size = statSync(join(AUDIO_DIR, file)).size;
  totalBytes += size;
  const entry = folders.get(folder) ?? { count: 0, bytes: 0 };
  entry.count += 1;
  entry.bytes += size;
  folders.set(folder, entry);
}
const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;
console.log(`${files.length} clips, ${references.size} referenced, ${mb(totalBytes)}`);
for (const [folder, entry] of [...folders].sort()) {
  console.log(`  ${folder}: ${entry.count} (${mb(entry.bytes)})`);
}
console.log(ffprobe ? 'tags: none' : 'tags: not checked, ffprobe is not on PATH');
