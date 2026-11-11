import TownFacadeBrokenPane from '@/components/games/career/town/TownFacadeBrokenPane';
import TownFacadeShutter from '@/components/games/career/town/TownFacadeShutter';
import {
  FACADE_WINDOW_AT,
  FACADE_WINDOW_STEP,
} from '@/lib/constants/townFacade';
import type { TownBuildingMode } from '@/lib/types/town';
import { facadeOrder } from '@/lib/utils/townFacade';

// Which windows burn late, a fixed pattern so the facade never reshuffles
const LIT = [1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1];

// A block of the parliament's tall windows. Shut, a blind drops in each one
// after another; abandoned, the glass is dark and broken
export default function ParliamentWindows({
  x0,
  y0,
  cols,
  rows,
  w,
  h,
  gx,
  gy,
  seed,
  lit,
  mode,
}: {
  x0: number;
  y0: number;
  cols: number;
  rows: number;
  w: number;
  h: number;
  gx: number;
  gy: number;
  seed: number;
  lit: string;
  mode: TownBuildingMode;
}) {
  const count = rows * cols;
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const x = x0 + (i % cols) * gx;
        const y = y0 + Math.floor(i / cols) * gy;
        if (mode === 'abandoned') {
          return (
            <TownFacadeBrokenPane key={i} x={x} y={y} w={w} h={h} seed={i + seed} />
          );
        }
        const on = LIT[(i + seed) % LIT.length];
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              className={on ? lit : 'fill-[#3a3a3a]'}
            />
            {mode === 'shut' && (
              <TownFacadeShutter
                x={x}
                y={y}
                w={w}
                h={h}
                kind="blind"
                at={FACADE_WINDOW_AT + facadeOrder(i, count, seed) * FACADE_WINDOW_STEP}
              />
            )}
          </g>
        );
      })}
    </>
  );
}
