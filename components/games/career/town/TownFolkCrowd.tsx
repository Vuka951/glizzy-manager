import { useEffect, useRef, useState } from 'react';
import TownFolk, {
  type TownFolkLook,
} from '@/components/games/career/town/TownFolk';
import {
  TOWN_LAYOUTS,
  type TownLayoutKey,
} from '@/lib/constants/townLayout';
import useAmbientMotion from '@/components/games/useAmbientMotion';
import { prefersReducedMotion } from '@/lib/utils/motion';
import {
  pauseWhileHidden,
  townDoor,
  townRoute,
  type TownPoint,
} from '@/lib/utils/townFlow';

const LOOKS: TownFolkLook[] = [
  { coat: 'fill-sky-700', sleeve: 'stroke-sky-800', skin: 'fill-amber-200', hair: 'fill-amber-900', scarf: 'fill-red-500' },
  { coat: 'fill-rose-700', sleeve: 'stroke-rose-800', skin: 'fill-orange-300', hair: 'fill-slate-900', hat: 'fill-amber-300' },
  { coat: 'fill-emerald-700', sleeve: 'stroke-emerald-800', skin: 'fill-amber-100', hair: 'fill-yellow-200' },
  { coat: 'fill-amber-600', sleeve: 'stroke-amber-700', skin: 'fill-[#8d5524]', hair: 'fill-slate-950', scarf: 'fill-sky-300' },
  { coat: 'fill-violet-700', sleeve: 'stroke-violet-800', skin: 'fill-amber-200', hair: 'fill-red-900', hat: 'fill-red-500' },
  { coat: 'fill-slate-500', sleeve: 'stroke-slate-600', skin: 'fill-orange-200', hair: 'fill-slate-300' },
  { coat: 'fill-teal-600', sleeve: 'stroke-teal-700', skin: 'fill-amber-300', hair: 'fill-amber-800', scarf: 'fill-red-500' },
];

// Heights vary, the last one is a kid
const SIZES: Record<TownLayoutKey, string[]> = {
  desk: [
    'h-[28px] w-[13px]',
    'h-[31px] w-[14px]',
    'h-[26px] w-[12px]',
    'h-[30px] w-[14px]',
    'h-[27px] w-[13px]',
    'h-[29px] w-[14px]',
    'h-[20px] w-[9px]',
  ],
  phone: [
    'h-[18px] w-[8px]',
    'h-[20px] w-[9px]',
    'h-[17px] w-[8px]',
    'h-[19px] w-[9px]',
    'h-[17px] w-[8px]',
    'h-[19px] w-[9px]',
    'h-[13px] w-[6px]',
  ],
};

// Canvas pixels per millisecond, a stroll next to his walk
const SPEED: Record<TownLayoutKey, number> = { desk: 0.04, phone: 0.022 };
const STEP_MS = 240;
const FADE_MS = 350;
const FIRST_MS = 600;
const STAGGER_MS = 1300;
// Boarding is a brisk walk along the kerb to the bus door, nearest first;
// anyone still far up the road just heads off on foot
const BOARD_SPEED: Record<TownLayoutKey, number> = { desk: 0.09, phone: 0.05 };
const BOARD_STAGGER_MS = 320;
const BOARD_REACH: Record<TownLayoutKey, number> = { desk: 260, phone: 150 };

type Plan = { path: TownPoint[]; exits: boolean };

function planFor(layout: TownLayoutKey, index: number, toStop: boolean): Plan {
  const { folk } = TOWN_LAYOUTS[layout];
  const door = townDoor(layout, folk.from[index]);
  const exits = !toStop || index >= folk.gather.length;
  if (!exits)
    return { path: [door, ...townRoute(folk.lane, door, folk.gather[index])], exits };
  // Walking off the end of the road, fading out over its last stretch
  const path = [door, ...townRoute(folk.lane, door, { x: folk.exit, y: folk.lane })];
  const last = path[path.length - 1];
  const before = path[path.length - 2];
  path.splice(path.length - 1, 0, {
    x: before.x + (last.x - before.x) * 0.85,
    y: last.y,
  });
  return { path, exits };
}

const at = (p: TownPoint) => `translate(${p.x}px, ${p.y}px)`;

function swingLimbs(
  el: Element,
  options: KeyframeAnimationOptions,
  track: (a: Animation) => void,
) {
  el.querySelectorAll('[data-leg]').forEach((leg, k) => {
    const deg = k ? -22 : 22;
    track(leg.animate([{ transform: `rotate(${deg}deg)` }, { transform: `rotate(${-deg}deg)` }], options));
  });
  el.querySelectorAll('[data-arm]').forEach((arm, k) => {
    const deg = k ? 16 : -16;
    track(arm.animate([{ transform: `rotate(${deg}deg)` }, { transform: `rotate(${-deg}deg)` }], options));
  });
}

// Closing time: the townsfolk step out of the buildings one by one and walk
// the kerb to the bus stop, a couple of them on off down the road toward the
// cup. Without a bus (`toStop` off, a shared room) they all walk off down the
// road. `waiting` starts them already gathered at the stop. Once `boarding`,
// the ones at the stop file onto the cup bus and `onBoarded` fires
export default function TownFolkCrowd({
  layout,
  toStop,
  waiting,
  boarding,
  onBoarded,
}: {
  layout: TownLayoutKey;
  toStop: boolean;
  waiting: boolean;
  boarding: boolean;
  onBoarded: () => void;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const folkRef = useRef<(HTMLDivElement | null)[]>([]);
  const [startGathered] = useState(waiting);
  // When the walk began, so a remount or a layout switch picks it up where
  // it was instead of starting over
  const startRef = useRef<number | null>(null);
  const from = TOWN_LAYOUTS[layout].folk.from;
  const layoutRef = useRef(layout);
  const onBoardedRef = useRef(onBoarded);
  // Once they file onto the bus the walk to the stop is over for good, even
  // if the layout switches mid-boarding
  const boardingRef = useRef(false);
  const ambient = useAmbientMotion();
  const ambientRef = useRef(ambient);

  useEffect(() => {
    layoutRef.current = layout;
    onBoardedRef.current = onBoarded;
    ambientRef.current = ambient;
  });

  // Switching to lite stills the bob and the sway at the stop; the walk to
  // it goes on
  useEffect(() => {
    if (ambient) return;
    rootRef.current
      ?.querySelectorAll('[data-folk-body]')
      .forEach((body) => body.getAnimations().forEach((a) => a.cancel()));
  }, [ambient]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || boardingRef.current) return;
    const unpause = pauseWhileHidden(root);
    const running: Animation[] = [];
    const animate = (
      el: Element,
      frames: Keyframe[],
      options: KeyframeAnimationOptions,
    ) => {
      const a = el.animate(frames, options);
      running.push(a);
      return a;
    };
    const still = startGathered || prefersReducedMotion();
    const ambient = ambientRef.current;
    startRef.current ??= document.timeline.currentTime as number;
    const elapsed = (document.timeline.currentTime as number) - startRef.current;

    folkRef.current.forEach((el, i) => {
      if (!el) return;
      const { path, exits } = planFor(layout, i, toStop);
      const end = path[path.length - 1];
      if (still) {
        el.style.transform = at(end);
        el.style.zIndex = String(Math.round(end.y));
        el.style.opacity = exits ? '0' : '1';
        return;
      }
      const lengths = path.slice(1).map((p, k) =>
        Math.hypot(p.x - path[k].x, p.y - path[k].y),
      );
      const total = lengths.reduce((a, b) => a + b, 0);
      const walkMs = total / SPEED[layout];
      const duration = FADE_MS + walkMs;
      const delay = FIRST_MS + i * STAGGER_MS + ((i * 337) % 500);
      let covered = 0;
      const frames: Keyframe[] = [
        { transform: at(path[0]), zIndex: Math.round(path[0].y), opacity: 0, offset: 0 },
        { transform: at(path[0]), zIndex: Math.round(path[0].y), opacity: 1, offset: FADE_MS / duration },
        ...path.slice(1).map((p, k) => {
          covered += lengths[k];
          return {
            transform: at(p),
            zIndex: Math.round(p.y),
            opacity: exits && k === lengths.length - 1 ? 0 : 1,
            offset: (FADE_MS + (covered / total) * walkMs) / duration,
          };
        }),
      ];
      animate(el, frames, { duration, delay, fill: 'both', easing: 'linear' });
      const steps = Math.max(2, Math.round(walkMs / STEP_MS));
      const swing = { duration: STEP_MS, delay: delay + FADE_MS, iterations: steps, direction: 'alternate' as const, easing: 'ease-in-out' };
      swingLimbs(el, swing, (a) => running.push(a));
      const body = el.querySelector('[data-folk-body]');
      // The lite animation level keeps the walk but drops the bob and the
      // idle sway at the stop
      if (body && ambient) {
        animate(body, [{ transform: 'translateY(0)' }, { transform: 'translateY(-1px)' }], { ...swing, iterations: steps * 2, duration: STEP_MS / 2 });
        if (!exits)
          animate(
            body,
            [{ transform: 'rotate(-2deg)' }, { transform: 'rotate(2deg)' }],
            { duration: 1800 + i * 160, delay: delay + duration, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' },
          );
      }
    });

    running.forEach((a) => {
      a.currentTime = elapsed;
    });

    return () => {
      unpause();
      running.forEach((a) => a.cancel());
    };
  }, [layout, startGathered, toStop]);

  useEffect(() => {
    if (!boarding) return;
    boardingRef.current = true;
    const L = TOWN_LAYOUTS[layoutRef.current];
    const speed = BOARD_SPEED[layoutRef.current];
    const reach = BOARD_REACH[layoutRef.current];
    const door = L.cupBus.door;
    const reduced = prefersReducedMotion();
    const running: Animation[] = [];
    const riders: { el: HTMLDivElement; pos: TownPoint }[] = [];
    folkRef.current.forEach((el, i) => {
      if (!el || i >= L.folk.gather.length) return;
      el.getAnimations().forEach((a) => {
        a.commitStyles();
        a.cancel();
      });
      const style = getComputedStyle(el);
      const m = new DOMMatrixReadOnly(style.transform);
      const pos = { x: m.m41, y: m.m42 };
      if (reduced || Number(style.opacity) < 0.5 || Math.abs(pos.x - door.x) > reach) {
        el.style.opacity = '0';
        return;
      }
      riders.push({ el, pos });
    });
    riders.sort((a, b) => Math.abs(a.pos.x - door.x) - Math.abs(b.pos.x - door.x));
    const boarded = riders.map(({ el, pos }, k) => {
      const target = { x: door.x + (k % 2 ? 3 : -3), y: door.y };
      const path = [pos, ...townRoute(L.folk.lane, pos, target)];
      const lengths = path.slice(1).map((p, j) => Math.hypot(p.x - path[j].x, p.y - path[j].y));
      const total = Math.max(1, lengths.reduce((a, b) => a + b, 0));
      const walkMs = total / speed;
      const duration = walkMs + FADE_MS;
      const delay = k * BOARD_STAGGER_MS;
      let covered = 0;
      const frames: Keyframe[] = [
        { transform: at(path[0]), zIndex: Math.round(path[0].y), opacity: 1, offset: 0 },
        ...path.slice(1).map((p, j) => {
          covered += lengths[j];
          return {
            transform: at(p),
            zIndex: Math.round(p.y),
            opacity: 1,
            offset: ((covered / total) * walkMs) / duration,
          };
        }),
        { transform: at(target), zIndex: Math.round(target.y), opacity: 0, offset: 1 },
      ];
      const walk = el.animate(frames, { duration, delay, fill: 'both', easing: 'linear' });
      running.push(walk);
      swingLimbs(
        el,
        { duration: STEP_MS / 1.4, delay, iterations: Math.max(2, Math.round(walkMs / (STEP_MS / 1.4))), direction: 'alternate', easing: 'ease-in-out' },
        (a) => running.push(a),
      );
      return walk.finished;
    });
    let live = true;
    Promise.all(boarded).then(
      () => {
        if (live) onBoardedRef.current();
      },
      () => undefined,
    );
    return () => {
      live = false;
      running.forEach((a) => a.cancel());
    };
  }, [boarding]);

  return (
    <div ref={rootRef} className="pointer-events-none absolute left-0 top-0">
      {from.map((id, i) => (
        <div
          key={`${id}-${i}`}
          ref={(el) => {
            folkRef.current[i] = el;
          }}
          className="absolute left-0 top-0 opacity-0"
        >
          <div
            className={`absolute bottom-0 left-0 -translate-x-1/2 ${SIZES[layout][i % SIZES[layout].length]}`}
          >
            <div data-folk-body className="h-full w-full origin-bottom">
              <TownFolk look={LOOKS[i % LOOKS.length]} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
