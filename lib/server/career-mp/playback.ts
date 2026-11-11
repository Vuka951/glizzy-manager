import {
  CLIP_INTRO_ALLOWANCE_MS,
  CLIP_PRE_ROLL_MS,
} from '@/lib/constants/careerMp';
import { newPlayback } from '@/lib/server/rooms/playback';
import type { Playback } from '@/lib/types/rooms';
import { buildMatchFrames } from '@/lib/utils/matchFrames';
import type { CupMatchResult } from '@/lib/utils/tournamentSim';

// The medics, the police or the puke get their scene after the last frame
const EXIT_SCENE_MS = 3500;

// How long the viewer takes to play a result out, intro and exit included,
// so every screen in the room reaches the scoreboard at the same moment
function matchDurationMs(result: CupMatchResult): number {
  const frames = buildMatchFrames(result).reduce((sum, f) => sum + f.ms, 0);
  return (
    CLIP_INTRO_ALLOWANCE_MS + frames + (result.reason ? EXIT_SCENE_MS : 0)
  );
}

export function matchPlayback(result: CupMatchResult, now: number): Playback {
  return newPlayback(matchDurationMs(result), now, CLIP_PRE_ROLL_MS);
}
