import { useEffect, useRef } from 'react';
import useAmbientMotion from '@/components/games/useAmbientMotion';
import ActionIcon from '@/components/icons/ActionIcon';
import Icon from '@/components/icons/Icon';
import type { TownLayoutKey } from '@/lib/constants/townLayout';
import { prefersReducedMotion } from '@/lib/utils/motion';
import { pauseWhileHidden } from '@/lib/utils/townFlow';

export type TownSpotlightTarget = 'media' | 'kiosk' | 'bus';

// Per target and layout: the warm pool on the ground under it, the marker
// floating over it (kept clear of the building labels), and the centre the
// rest of the town dims away from
const SPOTS: Record<
  TownSpotlightTarget,
  Record<TownLayoutKey, { pool: string; mark: string; dim: string }>
> = {
  media: {
    desk: {
      pool: 'left-[690px] top-[376px] w-[130px] h-[26px] z-[374]',
      mark: 'left-[711px] top-[300px]',
      dim: '-left-[300px] -top-[100px] h-[860px] w-[1600px] bg-[radial-gradient(circle_at_1011px_430px,transparent_90px,rgb(2_6_23/0.45)_340px)]',
    },
    phone: {
      pool: 'left-[262px] top-[364px] w-[84px] h-[18px] z-[362]',
      mark: 'left-[268px] top-[326px]',
      dim: '-left-[200px] -top-[100px] h-[1020px] w-[790px] bg-[radial-gradient(circle_at_462px_420px,transparent_56px,rgb(2_6_23/0.45)_240px)]',
    },
  },
  kiosk: {
    desk: {
      pool: 'left-[695px] top-[638px] w-[150px] h-[30px] z-[636]',
      mark: 'left-[695px] top-[554px]',
      dim: '-left-[300px] -top-[100px] h-[860px] w-[1600px] bg-[radial-gradient(circle_at_995px_700px,transparent_80px,rgb(2_6_23/0.45)_340px)]',
    },
    phone: {
      pool: 'left-[201px] top-[656px] w-[96px] h-[20px] z-[654]',
      mark: 'left-[201px] top-[604px]',
      dim: '-left-[200px] -top-[100px] h-[1020px] w-[790px] bg-[radial-gradient(circle_at_401px_730px,transparent_52px,rgb(2_6_23/0.45)_240px)]',
    },
  },
  bus: {
    desk: {
      pool: 'left-[812px] top-[556px] w-[200px] h-[30px] z-[554]',
      mark: 'left-[848px] top-[509px]',
      dim: '-left-[300px] -top-[100px] h-[860px] w-[1600px] bg-[radial-gradient(circle_at_1120px_634px,transparent_100px,rgb(2_6_23/0.45)_360px)]',
    },
    phone: {
      pool: 'left-[292px] top-[556px] w-[124px] h-[20px] z-[554]',
      mark: 'left-[364px] top-[532px]',
      dim: '-left-[200px] -top-[100px] h-[1020px] w-[790px] bg-[radial-gradient(circle_at_500px_644px,transparent_62px,rgb(2_6_23/0.45)_250px)]',
    },
  },
};

// The town's next required stop, picked out: the new rival at the TV station,
// the paper at the kiosk before the cup, then the bus to it. A warm pool
// pulses on the ground, a marker bobs over it and the rest of the town dims
// slightly toward it. Static under reduced motion and on the lite animation
// level
export default function TownSpotlight({
  layout,
  target,
}: {
  layout: TownLayoutKey;
  target: TownSpotlightTarget;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const poolRef = useRef<HTMLSpanElement | null>(null);
  const markRef = useRef<HTMLSpanElement | null>(null);
  const spot = SPOTS[target][layout];
  const ambient = useAmbientMotion();

  useEffect(() => {
    const root = rootRef.current;
    const pool = poolRef.current;
    const mark = markRef.current;
    if (!root || !pool || !mark || !ambient || prefersReducedMotion()) return;
    const unpause = pauseWhileHidden(root);
    const pulse = pool.animate(
      [
        { opacity: 0.55, scale: '0.9' },
        { opacity: 1, scale: '1.06' },
      ],
      { duration: 1400, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' },
    );
    const bob = mark.animate(
      [{ transform: 'translateY(0)' }, { transform: 'translateY(-6px)' }],
      { duration: 800, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' },
    );
    return () => {
      unpause();
      pulse.cancel();
      bob.cancel();
    };
  }, [layout, target, ambient]);

  return (
    <div ref={rootRef} className="pointer-events-none absolute left-0 top-0">
      <span
        aria-hidden="true"
        className={`absolute z-[895] transition-opacity duration-700 starting:opacity-0 ${spot.dim}`}
      />
      <span
        ref={poolRef}
        aria-hidden="true"
        className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(253_230_138/0.9),rgb(251_191_36/0.4)_60%,transparent)] ${spot.pool}`}
      />
      <span
        aria-hidden="true"
        className={`absolute z-[905] -translate-x-1/2 -translate-y-full ${spot.mark}`}
      >
        <span ref={markRef} className="flex flex-col items-center">
          <span
            className={`flex items-center justify-center rounded-full border-2 border-[#2a1a0a] bg-gradient-to-b from-[#e8c066] to-[#a8782a] text-[#2a1a0a] shadow-[inset_0_1px_0_rgb(255_255_255/0.5),0_2px_0_rgb(2_6_23/0.65)] ${
              layout === 'phone' ? 'h-5 w-5' : 'h-7 w-7'
            }`}
          >
            {target === 'media' ? (
              <ActionIcon kind="media" className={layout === 'phone' ? 'h-3 w-3' : 'h-4 w-4'} />
            ) : target === 'kiosk' ? (
              <ActionIcon kind="news" className={layout === 'phone' ? 'h-3 w-3' : 'h-4 w-4'} />
            ) : (
              <Icon name="trophy" className={layout === 'phone' ? 'h-3 w-3' : 'h-4 w-4'} />
            )}
          </span>
          <span className="-mt-px h-0 w-0 border-x-[5px] border-t-[6px] border-x-transparent border-t-[#2a1a0a]" />
        </span>
      </span>
    </div>
  );
}
