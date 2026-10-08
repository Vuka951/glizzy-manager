import { useEffect, type RefObject } from 'react';
import {
  SCENE_ANIMATIONS,
  type SceneAnimationSpec,
} from '@/lib/constants/sceneAnimations';

// Drives every [data-anim] element under the root with the named move, so a
// scene reads as markup plus a few custom keyframe sets. Attributes:
// data-anim="name [name2]", data-anim-delay="ms [ms2]", data-anim-duration="ms",
// data-anim-iterations="n" (defaults to the preset). With several names on
// one node the moves compose, and each picks its own delay by position
export function useSceneAnimation(
  root: RefObject<HTMLElement | null>,
  custom: Record<string, SceneAnimationSpec> = {},
  deps: unknown[] = [],
): void {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const specs = { ...SCENE_ANIMATIONS, ...custom };
    const animations: Animation[] = [];
    el.querySelectorAll<HTMLElement>('[data-anim]').forEach((node) => {
      const names = (node.dataset.anim ?? '').split(/\s+/).filter(Boolean);
      const pick = (raw: string | undefined, index: number) => {
        const parts = (raw ?? '').split(/\s+/).filter(Boolean);
        return parts.length === 0
          ? undefined
          : Number(parts[Math.min(index, parts.length - 1)]);
      };
      names.forEach((name, index) => {
        const spec = specs[name];
        if (!spec) return;
        const delay =
          pick(node.dataset.animDelay, index) ?? spec.options.delay ?? 0;
        const duration =
          pick(node.dataset.animDuration, index) ?? spec.options.duration;
        const iterations =
          pick(node.dataset.animIterations, index) ?? spec.options.iterations;
        animations.push(
          node.animate(spec.keyframes, {
            ...spec.options,
            delay,
            duration,
            iterations,
            composite: names.length > 1 ? 'add' : 'replace',
          }),
        );
      });
    });
    return () => animations.forEach((animation) => animation.cancel());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
