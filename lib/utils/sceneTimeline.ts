import type { SceneAnimationSpec } from '@/lib/constants/sceneAnimations';

// One move laid out on the scene clock: every frame sits on its millisecond
// mark and eases into the next one on its own. An easing on the whole run
// would bend the clock and push the marks off their beats
export function sceneTimeline(
  totalMs: number,
  frames: [number, Keyframe][],
  easing = 'ease-in-out',
): SceneAnimationSpec {
  return {
    keyframes: frames.map(([ms, frame]) => ({
      ...frame,
      offset: ms / totalMs,
      easing,
    })),
    options: { duration: totalMs, easing: 'linear', fill: 'both' },
  };
}
