import type { TownBuildingMode } from '@/lib/types/town';

// The whole art's tint per mode: an abandoned place fades to a dusty grey;
// a shut one keeps its colours, its blinds and lamp say it is closed
export function facadeTint(mode: TownBuildingMode): string {
  return mode === 'abandoned' ? 'saturate-[0.3] brightness-[0.62] sepia-[0.3]' : '';
}

// A stable shuffle of pane indices so the windows go dark in a scattered
// order instead of reading left to right
export function facadeOrder(index: number, count: number, seed = 0): number {
  return (index * 7 + seed * 3) % Math.max(1, count);
}
