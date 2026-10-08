// Trailer narration: node scripts/trailer/narrate.mjs
// Renders each paragraph of narration.txt once with ElevenLabs (the English
// commentator voice, eleven_v4, the with-timestamps endpoint so the karaoke
// captions know when every word is spoken), trims the lead-in by the first
// word's start, normalizes, and writes paragraph mp3s plus alignment.json
// (word start and end times per paragraph) into the work folder. A paragraph
// whose mp3 and alignment already exist for the same text is skipped, so a
// rebuild never bills the voice again and an edited paragraph is the only one
// rendered anew; delete the work folder to re-render all. Needs XI_API_KEY.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { NARRATION_FILE, WORK_DIR, paragraphsOf } from './paths.mjs';

const VOICE_ID = process.env.TRAILER_VOICE_ID ?? 'gnPxliFHTp6OK6tcoA6i';
const MODEL_ID = 'eleven_v4';
const LEAD_IN_SECONDS = 0.12;
const CLEAN_MP3_ARGS = ['-map_metadata', '-1', '-id3v2_version', '0', '-write_id3v1', '0', '-fflags', '+bitexact'];

const apiKey = process.env.XI_API_KEY;
const outDir = join(WORK_DIR, 'narration');
mkdirSync(outDir, { recursive: true });

const paragraphs = paragraphsOf(readFileSync(NARRATION_FILE, 'utf8'));
const alignment = [];
let billed = 0;

for (const [index, text] of paragraphs.entries()) {
  const base = join(outDir, `para-${index}`);
  const cached = existsSync(`${base}.mp3`) && existsSync(`${base}.json`)
    && JSON.parse(readFileSync(`${base}.json`, 'utf8')).text === text;
  if (!cached) {
    if (!apiKey) throw new Error('XI_API_KEY is not set and the narration is not rendered yet');
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps`, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        voice_settings: { stability: 0.5 },
      }),
    });
    if (!res.ok) throw new Error(`paragraph ${index}: ${res.status} ${await res.text()}`);
    const payload = await res.json();
    writeFileSync(`${base}.raw.mp3`, Buffer.from(payload.audio_base64, 'base64'));
    const words = wordsOf(payload.alignment);
    const trim = Math.max(0, (words[0]?.start ?? 0) - LEAD_IN_SECONDS);
    execFileSync('ffmpeg', [
      '-y', '-v', 'error', '-i', `${base}.raw.mp3`,
      '-af', `atrim=start=${trim},asetpts=PTS-STARTPTS,loudnorm=I=-16:TP=-1.5:LRA=11`,
      '-ar', '44100', '-c:a', 'libmp3lame', '-q:a', '2', ...CLEAN_MP3_ARGS, `${base}.mp3`,
    ]);
    const shifted = words.map((w) => ({ ...w, start: round(w.start - trim), end: round(w.end - trim) }));
    writeFileSync(`${base}.json`, JSON.stringify({ text, words: shifted }, null, 1));
    const cost = Number(res.headers.get('character-cost') ?? text.length);
    billed += cost;
    console.log(`rendered paragraph ${index}: ${text.length} characters, ${cost} billed, ${shifted.length} words`);
  }
  const para = JSON.parse(readFileSync(`${base}.json`, 'utf8'));
  const duration = Number(execFileSync('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', `${base}.mp3`,
  ]).toString().trim());
  alignment.push({ index, text: para.text, file: `${base}.mp3`, duration: round(duration), words: para.words });
}

writeFileSync(join(outDir, 'alignment.json'), JSON.stringify(alignment, null, 1));
console.log(`${paragraphs.length} paragraphs, ${billed} credits billed this run, alignment at ${join(outDir, 'alignment.json')}`);

function round(n) {
  return Math.round(n * 1000) / 1000;
}

// The endpoint aligns characters; words are the runs between spaces
function wordsOf(align) {
  const words = [];
  let current = null;
  align.characters.forEach((ch, i) => {
    if (ch === ' ' || ch === '\n') {
      if (current) words.push(current);
      current = null;
      return;
    }
    const start = align.character_start_times_seconds[i];
    const end = align.character_end_times_seconds[i];
    if (!current) current = { text: ch, start, end };
    else {
      current.text += ch;
      current.end = end;
    }
  });
  if (current) words.push(current);
  return words;
}
