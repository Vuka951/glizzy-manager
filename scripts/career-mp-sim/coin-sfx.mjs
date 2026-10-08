// Three coin sounds for a won bet, from the ElevenLabs sound endpoint,
// loudness-matched like the cutscene bank. Key comes from XI_API_KEY
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const KEY = process.env.XI_API_KEY;
if (!KEY) throw new Error('XI_API_KEY missing');
const OUT = path.resolve('public/games/audio/sfx');
const JOBS = [
  { id: 'coins-small', seconds: 1.5, text: 'Three or four gold coins dropping one after another onto a wooden table, short bright metallic clinks, no music, clean' },
  { id: 'coins-medium', seconds: 2.2, text: 'A handful of gold coins poured onto a pile of coins, cascading metallic jingle, satisfying, no music, clean' },
  { id: 'coins-jackpot', seconds: 3.2, text: 'Slot machine jackpot payout: a bright winning chime followed by a long cascade of gold coins pouring into a metal tray, celebratory, no voices' },
];
const tmp = mkdtempSync(path.join(tmpdir(), 'coins-'));
for (const job of JOBS) {
  let ok = false;
  for (let attempt = 0; attempt < 3 && !ok; attempt++) {
    const res = await fetch('https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128', {
      method: 'POST',
      headers: { 'xi-api-key': KEY, 'content-type': 'application/json' },
      body: JSON.stringify({ text: job.text, duration_seconds: job.seconds, prompt_influence: 0.4 }),
    });
    if (!res.ok) { console.error(job.id, res.status, (await res.text()).slice(0, 200)); continue; }
    const raw = path.join(tmp, `${job.id}.mp3`);
    writeFileSync(raw, Buffer.from(await res.arrayBuffer()));
    if (statSync(raw).size < 4000) { console.error(job.id, 'too small, re-rolling'); continue; }
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'mp3', '-i', raw, '-af', 'loudnorm=I=-18:TP=-1.5:LRA=11', '-ar', '44100', '-b:a', '128k', path.join(OUT, `${job.id}.mp3`)]);
    ok = true;
    console.log(job.id, 'ok', statSync(path.join(OUT, `${job.id}.mp3`)).size, 'bytes');
  }
}
