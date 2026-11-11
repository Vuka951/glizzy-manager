import {
  TOWN_ART_SIZE,
  TOWN_DOOR,
  TOWN_LAYOUTS,
  type TownBuildingId,
  type TownLayoutKey,
} from '@/lib/constants/townLayout';

export type TownPoint = { x: number; y: number };

// The spot just in front of a building's door, in canvas pixels
export function townDoor(layout: TownLayoutKey, id: TownBuildingId): TownPoint {
  const p = TOWN_LAYOUTS[layout].buildings[id];
  return {
    x: p.x + TOWN_ART_SIZE[id].w * p.scale * TOWN_DOOR[id],
    y: p.ground + 6,
  };
}

// Down to a lane, along it, then up to the target
export function townRoute(lane: number, from: TownPoint, to: TownPoint): TownPoint[] {
  const legs: TownPoint[] = [];
  if (Math.abs(from.y - lane) > 14) legs.push({ x: from.x, y: lane });
  legs.push({ x: to.x, y: lane });
  if (Math.abs(to.y - lane) > 4) legs.push(to);
  return legs;
}

// Holds every animation under `root` while the tab is hidden, so nothing
// jumps ahead when the player comes back. Returns the cleanup
export function pauseWhileHidden(root: Element): () => void {
  let held: Animation[] = [];
  const onChange = () => {
    if (document.hidden) {
      held = root
        .getAnimations({ subtree: true })
        .filter((a) => a.playState === 'running');
      held.forEach((a) => a.pause());
    } else {
      held.forEach((a) => {
        if (a.playState === 'paused') a.play();
      });
      held = [];
    }
  };
  document.addEventListener('visibilitychange', onChange);
  return () => document.removeEventListener('visibilitychange', onChange);
}
