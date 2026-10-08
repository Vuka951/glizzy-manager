// Renders the off-season cutscene sound bank through the ElevenLabs
// sound-generation endpoint. The ids here must match CutsceneClipId in
// lib/constants/cutsceneSounds.ts; the prompts are the source of each mp3.
// Usage: XI_API_KEY=... node scripts/career-cutscenes/generate.mjs [--dry-run] [filter]
// Idempotent: skips clips whose mp3 already exists. Delete one to re-roll it.
// Requires ffmpeg on PATH for loudness normalization.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';


const CLIPS = {
  'bed-gym': { prompt: 'Small gym ambience: conveyor belt motor humming, fluorescent light buzz, distant clatter of plates and weights, room tone', seconds: 8, loop: true },
  'bed-dark-room': { prompt: 'Quiet dark room ambience: faint hanging lamp buzz, wooden floor creaks, slow dripping water, suspenseful', seconds: 8, loop: true },
  'bed-clinic': { prompt: 'Quiet doctor office ambience: soft air conditioning hum, occasional papers shuffled, no clock', seconds: 8, loop: true },
  'bed-square': { prompt: 'Town square at night with a lively crowd murmuring and cheering in the distance, festive', seconds: 8, loop: true },
  'bed-parlor': { prompt: 'Cozy back room ambience: wooden table creaks, quiet chatter far away, a glass set down', seconds: 8, loop: true },
  'bed-bedroom': { prompt: 'Night bedroom ambience: soft crickets outside the window, light wind, a candle flame flickering, peaceful', seconds: 8, loop: true },
  'bed-kitchen-night': { prompt: 'Empty kitchen at night: refrigerator hum, a distant dog barking once, wind outside', seconds: 8, loop: true },
  'bed-sea': { prompt: 'Open sea from a small sailing boat: gentle waves lapping the hull, seagulls far away, light wind', seconds: 8, loop: true },
  'bed-press': { prompt: 'Press conference room: murmuring journalists, chairs shifting, distant camera shutters', seconds: 8, loop: true },
  'bed-scandal': { prompt: 'Chaotic paparazzi mob: shouting reporters, rapid camera flashes, newspaper pages fluttering in wind', seconds: 8, loop: true },
  'bed-club-door': { prompt: 'Night club entrance from outside: muffled bass music through a door, quiet street at night', seconds: 8, loop: true },
  'bed-office': { prompt: 'Quiet notary office: an old radiator knocking softly, papers shuffled, a drawer closing', seconds: 8, loop: true },
  'bed-alley': { prompt: 'Rainy alley at night: steady rain on pavement, water dripping from a gutter, distant thunder', seconds: 8, loop: true },
  'belly-gurgle': { prompt: 'Comedic stomach gurgle as someone eats too much, wet bubbling belly', seconds: 2 },
  'burp-big': { prompt: 'One huge cartoonish satisfied burp', seconds: 1.5 },
  'sniff-1': { prompt: 'A person sniffing the air twice, curious nose sniff', seconds: 1 },
  'sniff-2': { prompt: 'A long deep sniff through the nose, inhale', seconds: 1.2 },
  'discover-ding': { prompt: 'Magical sparkle ding of discovery, bright and short', seconds: 1.5 },
  'plate-slide': { prompt: 'Ceramic plate sliding across a wooden table', seconds: 1 },
  'pen-tick': { prompt: 'A single quick pen check mark scribbled on clipboard paper', seconds: 0.6 },
  'scale-creak': { prompt: 'Bathroom scale spring creak and needle wobble as someone steps on it', seconds: 1.5 },
  'megaphone-shout': { prompt: 'Megaphone click and feedback squeal, then a muffled shout through it', seconds: 1.5 },
  firework: { prompt: 'Single firework rocket whistle and burst with a small crowd cheer', seconds: 2 },
  'spot-shuffle': { prompt: 'Quick shuffling of three cups on a wooden table, shell game', seconds: 1.2 },
  snore: { prompt: 'Gentle cartoonish snore, one breath in and out', seconds: 2.5 },
  'stomach-growl': { prompt: 'Loud comedic hungry stomach growl, long belly rumble', seconds: 2 },
  'rope-creak': { prompt: 'A rope creaking as something swings from it', seconds: 1 },
  'boat-creak': { prompt: 'Wooden boat hull creaking on gentle waves', seconds: 1.5 },
  'gull-cry': { prompt: 'Single seagull cry', seconds: 1.5 },
  'mic-tap': { prompt: 'Tapping a live microphone twice, PA speaker thump', seconds: 1 },
  'flash-barrage': { prompt: 'Rapid barrage of camera flash bulb pops and shutters', seconds: 2 },
  'paper-flutter': { prompt: 'Newspaper pages fluttering and flapping in the wind', seconds: 1.5 },
  'fire-crackle': { prompt: 'Fire catching with a whoosh, then crackling flames and smoke', seconds: 3 },
  'footsteps-heavy': { prompt: 'Two heavy boot footsteps on pavement, a big man stepping forward', seconds: 1.5 },
  'throw-whoosh': { prompt: 'Cartoon whoosh of a person thrown through the air, then a distant thud', seconds: 1.5 },
  'rope-clink': { prompt: 'Brass hook of a velvet rope clinking onto a stanchion', seconds: 1 },
  'pen-scribble': { prompt: 'Fountain pen signing a long signature on paper', seconds: 2 },
  'coin-clink': { prompt: 'A single gold coin dropped onto a wooden desk', seconds: 0.8 },
  'stamp-thud': { prompt: 'Rubber stamp thud on a paper document', seconds: 1 },
  whisper: { prompt: 'Hushed conspiratorial whisper, unintelligible male voice, close', seconds: 1.5 },
  'slide-wood': { prompt: 'A small package sliding across a wooden table', seconds: 1 },
  'vial-clink': { prompt: 'Small glass vial set down on a wooden table with a clink', seconds: 1 },
  'cat-meow': { prompt: 'Single distant cat meow at night', seconds: 1.5 },
  'sting-level-up': { prompt: '8-bit video game level up jingle, triumphant ascending arpeggio', seconds: 2.5 },
  'sting-good': { prompt: 'Short bright success chime, two notes', seconds: 1.5 },
  'sting-fail': { prompt: 'Comedic sad trombone wah wah wah fail', seconds: 2 },
  // The victim's side of a plot (SabotageHitReel), added 2026-09-08
  'bed-forest-night': { prompt: 'Deep forest at night: crickets, an owl hooting, wind moving through pine branches, uneasy', seconds: 8, loop: true },
  'hit-vial-pour': { prompt: 'Small glass bottle uncorked and its liquid glugged out quickly, a few drops splashing', seconds: 1.5 },
  'hit-retch': { prompt: 'Comedic retching and heaving of a man about to vomit, wet and exaggerated', seconds: 1.5 },
  'hit-iv-beep': { prompt: 'Hospital heart monitor: three slow electronic beeps', seconds: 2 },
  'hit-witch-cackle': { prompt: 'Old witch cackling with glee, high pitched wicked laugh', seconds: 2 },
  'hit-cat-hiss': { prompt: 'A cat hissing and yowling angrily at night', seconds: 1.5 },
  'hit-spooky-chime': { prompt: 'Eerie magical curse sting: a dissonant chime with a dark reverse swell', seconds: 2.5 },
  'hit-envelope-slide': { prompt: 'A thick paper envelope slid across a desk and tapped twice', seconds: 1.2 },
  'hit-grease-sizzle': { prompt: 'Greasy food sizzling loudly in a hot pan, oil spitting', seconds: 2 },
  'hit-gulp': { prompt: 'One big cartoon gulp swallow followed by a queasy groan', seconds: 1.5 },
  'hit-phone-buzz': { prompt: 'Mobile phone vibrating twice on a hard surface, notification buzz', seconds: 1 },
  'hit-crowd-gasp': { prompt: 'A crowd gasping in shock all at once, then a stunned murmur', seconds: 2 },
  'hit-crowd-angry': { prompt: 'A crowd murmuring angrily and booing, disapproving, outdoors', seconds: 2.5 },
  'hit-camera-roll': { prompt: 'Television camera on a wheeled tripod rolling in fast across a floor and stopping', seconds: 1.5 },
  'hit-heart-crack': { prompt: 'Glass cracking and shattering softly with a sad low piano note, heartbreak', seconds: 2 },
  'hit-candle-blow': { prompt: 'A candle flame blown out with a short puff of breath and a faint hiss', seconds: 1 },
  'hit-twig-snap': { prompt: 'A dry twig snapping underfoot in a quiet forest', seconds: 0.8 },
  'hit-beast-growl': { prompt: 'A large beast growling low from the darkness, wet menacing rumble', seconds: 2 },
  'hit-beast-roar': { prompt: 'A huge monster roaring and lunging, deep furious roar', seconds: 2 },
  'hit-claw-swipe': { prompt: 'Three fast claw slashes whooshing through the air with a ripping tear', seconds: 1.2 },
  'hit-paint-splat': { prompt: 'A wet paint balloon bursting with a thick splat', seconds: 1 },
  'hit-demon-growl': { prompt: 'Several demons growling and whispering in guttural voices, echoing, hellish', seconds: 2.5 },
  'hit-door-pound': { prompt: 'Heavy fists pounding twice on a thick wooden door from outside, wood rattling', seconds: 1.5 },
  'hit-chain-rattle': { prompt: 'A heavy iron chain dropped and rattling against a wooden door', seconds: 1.5 },
  'hit-salt-pour': { prompt: 'Coarse salt poured in a line onto a stone floor, dry granular hiss', seconds: 1.5 },
  'hit-rooster': { prompt: 'A rooster crowing at dawn, distant', seconds: 2 },
  'hit-door-kick': { prompt: 'A door kicked open violently, wood splintering and slamming against a wall', seconds: 1.5 },
  'hit-police-radio': { prompt: 'Police walkie talkie crackle and squelch with a short unintelligible dispatch voice', seconds: 1.5 },
  'hit-locker-clang': { prompt: 'Metal locker door yanked open and clanging, papers spilling out', seconds: 1.5 },
  'hit-door-creak': { prompt: 'A heavy wooden door creaking open slowly at night', seconds: 1.5 },
  'hit-sneak-steps': { prompt: 'Sneaky tiptoe footsteps of a burglar on gravel, cautious', seconds: 1.5 },
  'hit-thud-body': { prompt: 'A body landing hard on the ground with a cartoon thud and a groan', seconds: 1.2 },
  'hit-dust-hands': { prompt: 'Two hands clapped together twice, brushing dust off, job done', seconds: 1 },
};

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT_DIR = join(ROOT, 'public', 'games', 'audio', 'cutscenes');
// No ID3 shell and no versioned encoder string, the shape check:audio expects
const CLEAN_MP3_ARGS = ['-map_metadata', '-1', '-id3v2_version', '0', '-write_id3v1', '0', '-fflags', '+bitexact'];
const CONCURRENCY = 3;
// Beds sit under everything, hits get trimmed so they land on the beat
const BED_FILTER = 'loudnorm=I=-24:TP=-2:LRA=9';
const HIT_FILTER =
  'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.04,' +
  'areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.15,areverse,' +
  'loudnorm=I=-18:TP=-1.5:LRA=11';

const apiKey = process.env.XI_API_KEY;
const dryRun = process.argv.includes('--dry-run');
const filter = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!apiKey && !dryRun) {
  console.error('XI_API_KEY is required');
  process.exit(1);
}

const pending = Object.entries(CLIPS)
  .map(([id, clip]) => ({ id, file: `${id}.mp3`, ...clip }))
  .filter((job) => !filter || job.id.includes(filter))
  .filter((job) => !existsSync(join(OUT_DIR, job.file)));

console.log(`${pending.length} clips to render`);
if (dryRun) {
  for (const job of pending) console.log(`  ${job.file} (${job.seconds}s${job.loop ? ', loop' : ''}) ${job.prompt}`);
  process.exit(0);
}
mkdirSync(OUT_DIR, { recursive: true });

async function fetchClip(job, path) {
  const body = {
    text: job.prompt,
    duration_seconds: job.seconds,
    prompt_influence: 0.4,
    ...(job.loop ? { loop: true } : {}),
  };
  const res = await fetch('https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128', {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  writeFileSync(path, Buffer.from(await res.arrayBuffer()));
}

async function generate(job) {
  const raw = join(OUT_DIR, `${job.file}.raw`);
  await fetchClip(job, raw);
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'mp3', '-i', raw,
    '-af', job.loop ? BED_FILTER : HIT_FILTER, '-ar', '44100', '-c:a', 'libmp3lame', '-q:a', '4',
    ...CLEAN_MP3_ARGS, join(OUT_DIR, job.file)]);
  unlinkSync(raw);
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
