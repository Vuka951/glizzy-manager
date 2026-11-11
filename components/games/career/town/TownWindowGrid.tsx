import TownFacadeBrokenPane from '@/components/games/career/town/TownFacadeBrokenPane';
import TownFacadeShutter from '@/components/games/career/town/TownFacadeShutter';
import {
  FACADE_WINDOW_AT,
  FACADE_WINDOW_STEP,
} from '@/lib/constants/townFacade';
import type { TownBuildingMode } from '@/lib/types/town';
import { facadeOrder } from '@/lib/utils/townFacade';

// Which panes of a grid are lit, repeated across the grid from a per-building
// seed so neighbouring buildings never light the same pattern
const LIT = [1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1];

// A grid of office windows at night. Open: some lit, a few flickering, all
// brighter on hover. Shut: every blind comes down, one pane at a time.
// Abandoned: dark grimy glass, cracked or missing a shard here and there
export default function TownWindowGrid({
  x,
  y,
  cols,
  rows,
  w,
  h,
  gapX,
  gapY = 0,
  on,
  off,
  seed = 0,
  mode,
}: {
  x: number;
  y: number;
  cols: number;
  rows: number;
  w: number;
  h: number;
  gapX: number;
  gapY?: number;
  on: string;
  off: string;
  seed?: number;
  mode: TownBuildingMode;
}) {
  const count = rows * cols;
  const panes = Array.from({ length: count }, (_, k) => {
    const i = k + seed;
    return {
      key: k,
      x: x + (k % cols) * gapX,
      y: y + Math.floor(k / cols) * gapY,
      on: LIT[i % LIT.length] === 1,
      flick: i % 7 === 3,
      order: facadeOrder(k, count, seed),
      seed: i,
    };
  });
  if (mode === 'abandoned') {
    return (
      <g>
        {panes.map((p) => (
          <TownFacadeBrokenPane key={p.key} x={p.x} y={p.y} w={w} h={h} seed={p.seed} />
        ))}
      </g>
    );
  }
  const shut = mode === 'shut';
  return (
    <g>
      {panes.map((p) => (
        <g key={p.key}>
          <rect
            x={p.x}
            y={p.y}
            width={w}
            height={h}
            data-flick={p.on && p.flick && !shut ? '' : undefined}
            className={
              p.on
                ? `${on} opacity-85 transition-opacity group-hover/building:opacity-100`
                : off
            }
          />
          {shut && (
            <TownFacadeShutter
              x={p.x}
              y={p.y}
              w={w}
              h={h}
              kind="blind"
              at={FACADE_WINDOW_AT + p.order * FACADE_WINDOW_STEP}
            />
          )}
        </g>
      ))}
    </g>
  );
}
