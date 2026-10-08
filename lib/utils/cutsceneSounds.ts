import type {
  ActionSceneId,
  ActionSceneOutcome,
  SabotageHitSceneId,
} from '@/lib/constants/careerScenes';
import {
  ARENA_CROWD_BED_SRC,
  CUTSCENE_AUDIO_DIR,
  CUTSCENE_SOUNDTRACKS,
  SABOTAGE_HIT_SOUNDTRACKS,
  type CutsceneClipId,
  type CutsceneCue,
  type CutsceneSoundtrack,
  type ExistingSfx,
} from '@/lib/constants/cutsceneSounds';
import type {
  QuoteBedId,
  QuoteSoundtrack,
} from '@/lib/constants/quoteCutscenes';
import { gameAudio } from '@/lib/utils/gameAudio';
import {
  playBooSound,
  playCheerSound,
  playChompSound,
  playLiftSound,
  playPaperSound,
  playPlaceSound,
  playPukeSound,
  playShutterSound,
  playTrophySound,
} from '@/lib/utils/gameSounds';

const BED_FADE_MS = 700;
const BED_BASE_VOLUME = 0.5;
const HIT_BASE_VOLUME = 0.5;

// The cue's volume scales the one-shots the quote scenes reuse; the rest
// keep their own level
const EXISTING: Record<ExistingSfx, (volume?: number) => void> = {
  chomp: (volume = 1) => playChompSound(0.5 * volume),
  puke: playPukeSound,
  cheer: () => playCheerSound(0.8),
  boo: () => playBooSound(0.8),
  shutter: (volume = 1) => playShutterSound(0.25 * volume),
  paper: playPaperSound,
  place: playPlaceSound,
  'lift-hat': () => playLiftSound('hat'),
  'lift-sock': () => playLiftSound('sock'),
  'lift-box': () => playLiftSound('box'),
  trophy: playTrophySound,
};

type Soundtrack = Omit<CutsceneSoundtrack, 'bed'> & { bed: QuoteBedId };

function bedSrc(bed: QuoteBedId): string {
  return bed === 'arena-crowd'
    ? ARENA_CROWD_BED_SRC
    : `${CUTSCENE_AUDIO_DIR}/${bed}.mp3`;
}

function cueApplies(cue: CutsceneCue, outcome: ActionSceneOutcome): boolean {
  if (cue.only && !cue.only.includes(outcome)) return false;
  return cue.chance === undefined || Math.random() < cue.chance;
}

function playCue(cue: CutsceneCue): void {
  if (cue.sfx) {
    EXISTING[cue.sfx](cue.volume);
    return;
  }
  if (cue.clip) playCutsceneClip(cue.clip, cue.volume);
}

// One bank clip at the level of a scene cue; the caller keeps the element
// when it has to cut the clip short
export function playCutsceneClip(
  clip: CutsceneClipId,
  volume = 1,
): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  const level = gameAudio.scaled(HIT_BASE_VOLUME * volume, 'sfx');
  if (level <= 0.01) return null;
  const audio = new Audio(`${CUTSCENE_AUDIO_DIR}/${clip}.mp3`);
  audio.volume = level;
  audio.play().catch(() => {});
  return audio;
}

// Starts the scene's ambience bed and schedules its hits against the
// animation clock. The returned stop fades the bed and drops pending hits
export function playCutsceneSounds(
  scene: ActionSceneId,
  outcome: ActionSceneOutcome,
): () => void {
  return playSoundtrack(CUTSCENE_SOUNDTRACKS[scene], outcome);
}

// A hit on your own man has one outcome: it happened
export function playSabotageHitSounds(scene: SabotageHitSceneId): () => void {
  return playSoundtrack(SABOTAGE_HIT_SOUNDTRACKS[scene], 'bad');
}

// The ambience under a quote line runs for the whole scene and fades with
// it; the typed subtitle is the modal's business
export function playQuoteSounds(
  track: QuoteSoundtrack,
  sceneMs: number,
  variant?: string,
): () => void {
  const dressing = variant ? 'variant' : 'plain';
  const cues = track.cues.filter(
    (cue) =>
      (!cue.dressing || cue.dressing === dressing) &&
      (!cue.variants || (variant !== undefined && cue.variants.includes(variant))),
  );
  return playSoundtrack({ ...track, cues, bedMs: sceneMs }, 'good');
}

function playSoundtrack(
  track: Soundtrack,
  outcome: ActionSceneOutcome,
): () => void {
  if (typeof window === 'undefined') return () => {};
  const timers = track.cues
    .filter((cue) => cueApplies(cue, outcome))
    .map((cue) => window.setTimeout(() => playCue(cue), cue.at));

  const bedVolume = gameAudio.scaled(
    BED_BASE_VOLUME * (track.bedVolume ?? 1),
    'sfx',
  );
  let bed: HTMLAudioElement | null = null;
  let bedTimer: number | null = null;
  if (bedVolume > 0.01) {
    bed = new Audio(bedSrc(track.bed));
    bed.loop = true;
    bed.volume = 0;
    bed.play().catch(() => {});
    const started = performance.now();
    const fadeIn = () => {
      if (!bed) return;
      const t = Math.min(1, (performance.now() - started) / BED_FADE_MS);
      bed.volume = bedVolume * t;
      if (t < 1) requestAnimationFrame(fadeIn);
    };
    requestAnimationFrame(fadeIn);
  }

  const stopBed = () => {
    const current = bed;
    bed = null;
    if (!current) return;
    const from = current.volume;
    const started = performance.now();
    const fadeOut = () => {
      const t = Math.min(1, (performance.now() - started) / BED_FADE_MS);
      current.volume = from * (1 - t);
      if (t < 1) requestAnimationFrame(fadeOut);
      else {
        current.pause();
        current.src = '';
      }
    };
    requestAnimationFrame(fadeOut);
  };
  if (bed) bedTimer = window.setTimeout(stopBed, track.bedMs);

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    if (bedTimer !== null) window.clearTimeout(bedTimer);
    stopBed();
  };
}
