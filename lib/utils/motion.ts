import { readGameSettings } from '@/lib/utils/gameSettings';

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// False when the viewer picked the lite animation level: decorative,
// always-running loops stay still, motion that carries the game still plays
export function ambientMotionEnabled(): boolean {
  return readGameSettings().townMotion !== 'lite';
}
