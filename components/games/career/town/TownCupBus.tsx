import { useEffect, useRef } from 'react';
import TownCupBusArt from '@/components/games/career/town/TownCupBusArt';
import TownSign from '@/components/games/career/town/TownSign';
import { GAMES_UI } from '@/data/games/locale';
import {
  TOWN_LAYOUTS,
  type TownLayoutKey,
} from '@/lib/constants/townLayout';
import type { TownLabels } from '@/lib/utils/gameSettings';
import {
  playBusArriveSound,
  playBusLeaveSound,
  playHoverSound,
} from '@/lib/utils/gameSounds';
import { ambientMotionEnabled, prefersReducedMotion } from '@/lib/utils/motion';
import { pauseWhileHidden } from '@/lib/utils/townFlow';

const TOWN = GAMES_UI.career.town;
const ARRIVE_MS = 2600;
const LEAVE_MS = 1900;
const SPIN: Keyframe[] = [
  { transform: 'rotate(0deg)' },
  { transform: 'rotate(360deg)' },
];

function spinWheels(wheels: (SVGGElement | null)[], duration: number) {
  return wheels.map((wheel) =>
    wheel?.animate(SPIN, { duration, iterations: Infinity }),
  );
}

// The bus to the cup: it pulls in along the road and waits at the stop with
// the engine running. Tapping it sends him aboard; once `leaving` it drives
// off the far end of the road and `onGone` takes the league to the cup
export default function TownCupBus({
  layout,
  leaving,
  blocked,
  labels,
  onBoard,
  onGone,
}: {
  layout: TownLayoutKey;
  leaving: boolean;
  blocked: boolean;
  labels: TownLabels;
  onBoard: () => void;
  onGone: () => void;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const puffRef = useRef<SVGGElement | null>(null);
  const wheelsRef = useRef<(SVGGElement | null)[]>([]);
  const idleRef = useRef<Animation | null>(null);
  const onGoneRef = useRef(onGone);
  const layoutRef = useRef(layout);
  const leavingRef = useRef(false);
  // The league goes to the cup once, however often the leaving effect runs
  const goneRef = useRef(false);
  const place = TOWN_LAYOUTS[layout].cupBus;

  useEffect(() => {
    onGoneRef.current = onGone;
    layoutRef.current = layout;
  });

  // Pulls in once, when it first appears, then idles with the engine running
  // (still on the lite animation level)
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const unpause = pauseWhileHidden(root);
    if (prefersReducedMotion()) return unpause;
    const from = -(TOWN_LAYOUTS[layoutRef.current].cupBus.x + root.offsetWidth + 120);
    const spin = spinWheels(wheelsRef.current, 260);
    const engine = playBusArriveSound();
    const drive = root.animate(
      [{ transform: `translateX(${from}px)` }, { transform: 'translateX(0)' }],
      { duration: ARRIVE_MS, easing: 'cubic-bezier(0.15, 0.6, 0.3, 1)' },
    );
    drive.finished.then(
      () => {
        spin.forEach((a) => a?.cancel());
        if (leavingRef.current || !ambientMotionEnabled()) return;
        idleRef.current =
          bodyRef.current?.animate(
            [{ transform: 'translateY(0)' }, { transform: 'translateY(-0.6px)' }],
            { duration: 130, direction: 'alternate', iterations: Infinity },
          ) ?? null;
      },
      () => undefined,
    );
    return () => {
      unpause();
      engine?.pause();
      drive.cancel();
      spin.forEach((a) => a?.cancel());
      idleRef.current?.cancel();
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!leaving || !root) return;
    leavingRef.current = true;
    const gone = () => {
      if (goneRef.current) return;
      goneRef.current = true;
      onGoneRef.current();
    };
    if (prefersReducedMotion()) {
      gone();
      return;
    }
    idleRef.current?.cancel();
    const L = TOWN_LAYOUTS[layoutRef.current];
    const to = L.w - L.cupBus.x + 120;
    const puff = puffRef.current?.animate(
      [
        { opacity: 0, transform: 'translateX(0) scale(0.6)' },
        { opacity: 1, transform: 'translateX(-4px) scale(1)', offset: 0.3 },
        { opacity: 0, transform: 'translateX(-14px) scale(1.4)' },
      ],
      { duration: 900, easing: 'ease-out' },
    );
    const spin = spinWheels(wheelsRef.current, 320);
    const engine = playBusLeaveSound();
    const drive = root.animate(
      [{ transform: 'translateX(0)' }, { transform: `translateX(${to}px)` }],
      {
        duration: LEAVE_MS,
        delay: 350,
        easing: 'cubic-bezier(0.55, 0, 0.8, 0.4)',
        fill: 'forwards',
      },
    );
    drive.finished.then(gone, () => undefined);
    return () => {
      // Once he is off to the cup the engine fades out on its own
      if (!goneRef.current) engine?.pause();
      drive.cancel();
      puff?.cancel();
      spin.forEach((a) => a?.cancel());
    };
  }, [leaving]);

  return (
    <div ref={rootRef} className={`absolute ${place.box}`}>
      <button
        type="button"
        aria-label={TOWN.labels.bus}
        aria-disabled={blocked || leaving}
        onClick={() => {
          playHoverSound(0.045);
          if (blocked || leaving) return;
          onBoard();
        }}
        className="group/building block h-full w-full cursor-pointer rounded-sm outline-none transition-[translate,filter] duration-200 ease-out hover:-translate-y-0.5 hover:brightness-110 focus-visible:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#fde68a]"
      >
        <div ref={bodyRef} className="h-full w-full">
          <TownCupBusArt
            puffRef={puffRef}
            wheelRef={(el, i) => {
              wheelsRef.current[i] = el;
            }}
          />
        </div>
        <TownSign
          name={layout === 'phone' ? TOWN.short.bus : TOWN.labels.bus}
          sub={null}
          labels={labels}
          mode="open"
          muted={false}
          placement="below"
        />
      </button>
    </div>
  );
}
