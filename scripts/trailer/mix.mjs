// Trailer sound: the narration paragraphs on their cues and the effects of
// sfx-cues.mjs under them, no music. Every effect clip is peak-normalized to
// -9 dBFS, then takes its cue's volume times SFX_GAIN, a 50 ms fade in and a
// 350 ms fade out from the cue's fade point; the narration sits at about
// -16 LUFS (narrate.mjs levels each paragraph) and a limiter holds the master
// under -1 dBTP.
//
// Effects in scripts/trailer/sfx come from the author's own effects bank,
// stripped of their metadata: soft_whoosh, sfx_whoosh (screen cuts),
// soft_boom (impacts), soft_chime and sfx_chime (reveals), sfx_plink (chips),
// sfx_tick and sfx_ding (the character spin), sfx_grab (grabs), sfx_buzzer
// (the loss), sfx_stamp (the hook and the sign-off), sfx_sting (the crown),
// sfx_scratch (the ego). The game's own chomp-1, coins-medium, coins-small,
// paper-1 and trophy-1 play from public/games/audio/sfx.
import { execFileSync, spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { ROOT, SCRIPT_DIR } from './paths.mjs';

const SFX_GAIN = 0.35;
const TARGET_PEAK_DB = -9;
const LIMIT = 0.84;

const clipFile = (clip) =>
  clip.startsWith('game:')
    ? join(ROOT, 'public', 'games', 'audio', 'sfx', `${clip.slice(5)}.mp3`)
    : join(SCRIPT_DIR, 'sfx', `${clip}.mp3`);

// The gain that brings a clip's peak to TARGET_PEAK_DB, held to x0.15..x3
function normGain(file) {
  const { stderr } = spawnSync('ffmpeg', ['-hide_banner', '-i', file, '-af', 'volumedetect', '-f', 'null', '-'], { encoding: 'utf8' });
  const peak = Number(/max_volume: (-?[\d.]+) dB/.exec(stderr)?.[1] ?? TARGET_PEAK_DB);
  return Math.min(3, Math.max(0.15, 10 ** ((TARGET_PEAK_DB - peak) / 20)));
}

export function mixAudio({ paragraphs, cues, duration, out }) {
  const clips = [...new Set(cues.map(([clip]) => clip))];
  const gains = new Map(clips.map((clip) => [clip, normGain(clipFile(clip))]));
  // A silent bed as long as the video sets the mix's length
  const inputs = [
    ...paragraphs.flatMap((p) => ['-i', p.file]),
    ...clips.flatMap((clip) => ['-i', clipFile(clip)]),
    '-f', 'lavfi', '-t', duration.toFixed(3), '-i', 'anullsrc=r=48000:cl=stereo',
  ];
  const graph = [];
  const labels = [`[${paragraphs.length + clips.length}:a]`];
  paragraphs.forEach((p, i) => {
    const ms = Math.round(p.start * 1000);
    graph.push(`[${i}:a]aresample=48000,aformat=channel_layouts=stereo,adelay=${ms}:all=1[v${i}]`);
    labels.push(`[v${i}]`);
  });
  clips.forEach((clip, k) => {
    const uses = cues.filter(([c]) => c === clip);
    const split = uses.map((_, u) => `[c${k}_${u}]`).join('');
    graph.push(`[${paragraphs.length + k}:a]aresample=48000,aformat=channel_layouts=stereo,asplit=${uses.length}${split}`);
    uses.forEach(([, at, volume, fadeAt], u) => {
      const ms = Math.round(Math.max(0, at) * 1000);
      const gain = volume * SFX_GAIN * gains.get(clip);
      graph.push(
        `[c${k}_${u}]afade=t=in:st=0:d=0.05,afade=t=out:st=${fadeAt}:d=0.35,atrim=0:${(fadeAt + 0.35).toFixed(3)},` +
          `adelay=${ms}:all=1,volume=${gain.toFixed(4)}[s${k}_${u}]`,
      );
      labels.push(`[s${k}_${u}]`);
    });
  });
  graph.push(
    `${labels.join('')}amix=inputs=${labels.length}:duration=first:normalize=0,alimiter=limit=${LIMIT}:level=0[out]`,
  );
  execFileSync('ffmpeg', [
    '-y', '-v', 'error', ...inputs,
    '-filter_complex', graph.join(';'),
    '-map', '[out]', '-c:a', 'pcm_s16le', '-ar', '48000', out,
  ]);
  console.log(`mix: ${paragraphs.length} paragraphs, ${cues.length} effect cues from ${clips.length} clips`);
  return out;
}
