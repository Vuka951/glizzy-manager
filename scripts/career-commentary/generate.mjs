// Batch-renders one language's career match commentary bank through
// ElevenLabs with the voice named by XI_VOICE_ID. The wording, the epithets
// and the name forms come from that language's dictionary, and the clips
// land under public/games/audio/commentary/career/<locale>/.
// Usage: XI_API_KEY=... XI_VOICE_ID=... node scripts/career-commentary/generate.mjs [--locale en|sr] [--dry-run] [filter]
// Idempotent: skips clips whose output file already exists. To re-roll a bad
// take, delete the mp3 and run again. Requires ffmpeg on PATH for loudnorm.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { register } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const MODEL_ID = 'eleven_v4';
const STABILITY = { calm: 0.5, hype: 0.0 };
// No ID3 shell and no versioned encoder string, the shape check:audio expects
const CLEAN_MP3_ARGS = ['-map_metadata', '-1', '-id3v2_version', '0', '-write_id3v1', '0', '-fflags', '+bitexact'];
const CONCURRENCY = 4;
// Creative-mode takes swing from flat to electric; hype lines roll several
// and keep the loudest-and-fastest one
const HYPE_TAKES = 3;
// Trim dead air so reactions land on the beat, then normalize
const POST_FILTER =
  'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.06,' +
  'areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.12,areverse,' +
  'loudnorm=I=-18:TP=-1.5:LRA=11';
// The Serbian tts strings carry their audio tags and capitals by hand, so
// the script adds nothing. The English tts strings are plain, so every hype
// line gets one light tag up front and the names stay in sentence case
const LOCALE_STYLE = {
  sr: { hypePrefix: '', shoutNames: true },
  en: { hypePrefix: '[excited] ', shoutNames: false },
};

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const localeIndex = args.indexOf('--locale');
const locale = localeIndex >= 0 ? args[localeIndex + 1] : 'en';
const filter = args.find((a, i) => !a.startsWith('--') && i !== localeIndex + 1);
if (!LOCALE_STYLE[locale]) {
  console.error(`--locale must be one of ${Object.keys(LOCALE_STYLE).join(', ')}`);
  process.exit(1);
}
const style = LOCALE_STYLE[locale];
const OUT_DIR = join(ROOT, 'public', 'games', 'audio', 'commentary', 'career', locale);

const apiKey = process.env.XI_API_KEY;
const VOICE_ID = process.env.XI_VOICE_ID;
if (!dryRun && !(apiKey && VOICE_ID)) {
  console.error('XI_API_KEY and XI_VOICE_ID are required (the ElevenLabs key and the voice id to render with)');
  process.exit(1);
}

// The game modules use the `@/` alias and JSON imports, which plain node
// only resolves through the simulators' loader
register('../career-sim/loader.mjs', import.meta.url);
const { electionIntroLines, introAngleLines, matchCueLines, tournamentWeatherLines } =
  await import('../../data/games/matchCommentary.ts');
const { CHARACTER_ROSTER } = await import('../../data/games/roster.ts');
const { default: dictionary } = await import(`../../data/games/locales/${locale}.json`);
const roster = CHARACTER_ROSTER.map((c) => ({
  slug: c.slug,
  name: dictionary.roster.names[c.slug] ?? c.name,
  epithet: dictionary.roster.epithets[c.slug],
  ...dictionary.commentary.nameForms[c.slug],
}));

const variantIndex = (id) => Number(id.match(/(\d+)$/)?.[1] ?? 1);

// Odd variants read the full name, even variants the short form (when one
// exists), the same split spokenName makes in lib/utils/matchCommentary.ts
// so the caption matches the voice
function nameFor(character, id, hype) {
  const useShort = character.short && variantIndex(id) % 2 === 0;
  const spoken = useShort ? character.short : (character.ttsFull ?? character.name);
  return hype && style.shoutNames ? spoken.toUpperCase() : spoken;
}

function script(line, text) {
  return line.register === 'hype' ? `${style.hypePrefix}${text}` : text;
}

function expand(line, copy, character) {
  const hype = line.register === 'hype';
  const filled = (copy.tts ?? copy.text)
    .replaceAll('{name}', nameFor(character, line.id, hype))
    .replaceAll('{epithet}', character.epithet);
  return { file: `${line.id}--${character.slug}.mp3`, register: line.register, tts: script(line, filled) };
}

const jobs = [];
const allLines = [
  ...Object.values(introAngleLines).flat(),
  ...Object.values(matchCueLines).flat(),
  ...tournamentWeatherLines.flat(),
  ...Object.values(electionIntroLines).flat(),
];
for (const line of allLines) {
  const copy = dictionary.commentary.lines[line.id];
  if (!copy) throw new Error(`${line.id}: no ${locale} text`);
  if (copy.text.includes('{a}')) {
    if (!copy.tts || copy.tts.includes('{a}')) throw new Error(`${line.id}: pairing line needs a name-free tts`);
    jobs.push({ file: `${line.id}.mp3`, register: line.register, tts: script(line, copy.tts) });
  } else if (copy.text.includes('{name}')) {
    for (const character of roster) jobs.push(expand(line, copy, character));
  } else {
    jobs.push({ file: `${line.id}.mp3`, register: line.register, tts: script(line, copy.tts ?? copy.text) });
  }
}

const wanted = jobs.filter((j) => !filter || j.file.includes(filter));
const pending = wanted.filter((j) => !existsSync(join(OUT_DIR, j.file)));
const characters = pending.reduce((sum, j) => sum + j.tts.length, 0);
console.log(`locale ${locale}, output ${OUT_DIR}`);
console.log(`${jobs.length} clips total, ${wanted.length} matching, ${pending.length} to generate (~${characters} characters)`);
if (dryRun) {
  for (const j of pending) console.log(`  ${j.file} [${j.register}] ${j.tts}`);
  process.exit(0);
}
mkdirSync(OUT_DIR, { recursive: true });

async function fetchTake(job, path) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: job.tts,
      model_id: MODEL_ID,
      voice_settings: { stability: STABILITY[job.register] },
    }),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  writeFileSync(path, Buffer.from(await res.arrayBuffer()));
}

// Higher is hotter: pre-normalization loudness rewards a committed read, the
// duration penalty rewards tempo on the identical text
function takeScore(path) {
  const probe = execFileSync('ffprobe', ['-v', 'error', '-show_entries',
    'format=duration', '-of', 'csv=p=0', path]);
  const duration = Number(probe.toString().trim()) || 99;
  // volumedetect reports on stderr and exits 0
  const detect = spawnSync(
    'ffmpeg',
    ['-i', path, '-af', 'volumedetect', '-f', 'null', '-'],
    { encoding: 'utf8' },
  );
  const meanVolume = Number(detect.stderr.match(/mean_volume: (-?[\d.]+) dB/)?.[1] ?? -99);
  return meanVolume - duration;
}

async function generate(job) {
  const takes = job.register === 'hype' ? HYPE_TAKES : 1;
  let best = null;
  for (let take = 0; take < takes; take++) {
    const raw = join(OUT_DIR, `${job.file}.take${take}.raw`);
    await fetchTake(job, raw);
    const score = takes > 1 ? takeScore(raw) : 0;
    if (!best || score > best.score) best = { raw, score };
  }
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'mp3', '-i', best.raw,
    '-af', POST_FILTER, '-ar', '44100', '-c:a', 'libmp3lame', '-q:a', '3',
    ...CLEAN_MP3_ARGS, join(OUT_DIR, job.file)]);
  for (let take = 0; take < takes; take++) {
    const raw = join(OUT_DIR, `${job.file}.take${take}.raw`);
    if (existsSync(raw)) unlinkSync(raw);
  }
}

const failed = [];
let done = 0;
const queue = [...pending];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    for (let job = queue.shift(); job; job = queue.shift()) {
      for (let attempt = 1; ; attempt++) {
        try {
          await generate(job);
          console.log(`[${++done}/${pending.length}] ${job.file}`);
          break;
        } catch (error) {
          if (attempt >= 3) {
            failed.push(job.file);
            console.error(`FAILED ${job.file}: ${error.message}`);
            break;
          }
          await new Promise((r) => setTimeout(r, 2000 * attempt));
        }
      }
    }
  }),
);
if (failed.length) {
  console.error(`\n${failed.length} failed: ${failed.join(', ')}`);
  process.exit(1);
}
console.log('\nAll clips generated.');
