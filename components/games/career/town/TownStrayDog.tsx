import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import TownBarkBubble from '@/components/games/career/town/TownBarkBubble';
import { TownTrophiesContext } from '@/components/games/career/town/townTrophies';
import useAmbientMotion from '@/components/games/useAmbientMotion';
import { CAREER_DOG_POKES } from '@/data/games/achievements';
import { GAMES_UI } from '@/data/games/locale';
import type { TownLayoutKey } from '@/lib/constants/townLayout';
import { achievementStore } from '@/lib/utils/achievements';
import { playDogSound } from '@/lib/utils/gameSounds';
import { prefersReducedMotion } from '@/lib/utils/motion';
import { recordTownPoke } from '@/lib/utils/townPokes';

// Feet sit on the lower lane of the road (desk road 506-552, phone 514-552),
// and z follows the feet, so the parked cup bus on the kerb side is in front
const BOX: Record<TownLayoutKey, string> = {
  desk: 'top-[516px] h-[30px] w-[44px] z-[547]',
  phone: 'top-[526px] h-[22px] w-[32px] z-[549]',
};

const WALK: Record<TownLayoutKey, { min: number; max: number; speed: number }> = {
  desk: { min: 10, max: 946, speed: 46 },
  phone: { min: 6, max: 352, speed: 26 },
};

// Far legs first so the near ones overlap them. The trot swings every other
// leg together, which pairs each hind leg with the opposite foreleg
const LEGS = [
  { x: 14, near: false },
  { x: 33, near: false },
  { x: 30, near: true },
  { x: 11, near: true },
];

// Where along his stretch of road he turns up when the town opens
const STARTS = [0.1, 0.28, 0.45, 0.62, 0.84];

// At closing time he trots along with the townsfolk and waits on the road
// just behind the bus; when it pulls away he gives chase for a few steps and
// barks after it
const AT_STOP: Record<TownLayoutKey, { wait: number; chase: number }> = {
  desk: { wait: 694, chase: 880 },
  phone: { wait: 204, chase: 300 },
};

// A stray trotting the road: walks to a random spot, stops, sometimes sniffs,
// and barks when clicked
export default function TownStrayDog({
  layout,
  closing,
  chase,
}: {
  layout: TownLayoutKey;
  closing: boolean;
  chase: boolean;
}) {
  const walkerRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLSpanElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const headRef = useRef<SVGGElement | null>(null);
  const tailRef = useRef<SVGPathElement | null>(null);
  const xRef = useRef<{ layout: TownLayoutKey; x: number } | null>(null);
  const [bark, setBark] = useState<number | null>(null);
  // The lite animation level keeps him sitting still, apart from the trot to
  // the bus and the chase after it
  const ambient = useAmbientMotion();
  const clearBark = useCallback(() => setBark(null), []);
  const trophies = useContext(TownTrophiesContext);

  useEffect(() => {
    const walker = walkerRef.current;
    const body = bodyRef.current;
    const svg = svgRef.current;
    const head = headRef.current;
    const tail = tailRef.current;
    if (!walker || !body || !svg || !head || !tail) return;
    const { min, max, speed } = WALK[layout];
    const stop = AT_STOP[layout];
    const kept = xRef.current?.layout === layout ? xRef.current.x : null;
    let x =
      kept ??
      min + (max - min) * STARTS[Math.floor(Math.random() * STARTS.length)];
    const setX = (to: number) => {
      x = to;
      xRef.current = { layout, x };
      walker.style.transform = `translateX(${x}px)`;
    };
    if (prefersReducedMotion()) {
      setX(closing ? (chase ? stop.chase : stop.wait) : x);
      return;
    }
    setX(x);

    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const running = new Set<Animation>();
    const track = (animation: Animation) => {
      running.add(animation);
      const forget = () => running.delete(animation);
      animation.finished.then(forget, forget);
      return animation;
    };
    const rest = (ms: number) =>
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, ms);
      });
    const legs = Array.from(svg.querySelectorAll<SVGGElement>('[data-leg]'));
    const wag = (ms: number) =>
      track(
        tail.animate([{ transform: 'rotate(-12deg)' }, { transform: 'rotate(14deg)' }], {
          duration: ms,
          direction: 'alternate',
          iterations: Infinity,
          easing: 'ease-in-out',
        }),
      );
    const tailWag = ambient ? wag(320) : null;

    // Trots to `target` and resolves false if the effect was torn down
    const trotTo = async (target: number, pace = 1) => {
      if (Math.abs(target - x) < 1) return true;
      body.style.transform = target < x ? 'scaleX(-1)' : '';
      const step = 190 / pace;
      const trot = [
        ...legs.map((leg, i) =>
          track(
            leg.animate(
              [
                { transform: `rotate(${i % 2 ? 16 : -16}deg)` },
                { transform: `rotate(${i % 2 ? -16 : 16}deg)` },
              ],
              { duration: step, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' },
            ),
          ),
        ),
        track(
          svg.animate([{ transform: 'translateY(0px)' }, { transform: 'translateY(-1.5px)' }], {
            duration: step,
            direction: 'alternate',
            iterations: Infinity,
          }),
        ),
      ];
      const walk = track(
        walker.animate(
          [{ transform: `translateX(${x}px)` }, { transform: `translateX(${target}px)` }],
          {
            duration: (Math.abs(target - x) / (speed * pace)) * 1000,
            easing: pace > 1 ? 'cubic-bezier(0.3, 0, 0.4, 1)' : 'ease-in-out',
            fill: 'forwards',
          },
        ),
      );
      try {
        await walk.finished;
      } catch {
        return false;
      }
      setX(target);
      walk.cancel();
      trot.forEach((animation) => animation.cancel());
      return !stopped;
    };
    const sniff = async () => {
      const animation = track(
        head.animate(
          [
            { transform: 'rotate(0deg)' },
            { transform: 'rotate(24deg)', offset: 0.2 },
            { transform: 'rotate(17deg)', offset: 0.35 },
            { transform: 'rotate(25deg)', offset: 0.5 },
            { transform: 'rotate(17deg)', offset: 0.65 },
            { transform: 'rotate(24deg)', offset: 0.8 },
            { transform: 'rotate(0deg)' },
          ],
          { duration: 1700, easing: 'ease-in-out' },
        ),
      );
      try {
        await animation.finished;
        return true;
      } catch {
        return false;
      }
    };
    const lookUp = async () => {
      const animation = track(
        head.animate(
          [
            { transform: 'rotate(0deg)' },
            { transform: 'rotate(-16deg)', offset: 0.3 },
            { transform: 'rotate(-16deg)', offset: 0.75 },
            { transform: 'rotate(0deg)' },
          ],
          { duration: 1600, easing: 'ease-in-out' },
        ),
      );
      try {
        await animation.finished;
        return true;
      } catch {
        return false;
      }
    };

    const wander = async () => {
      while (!stopped) {
        let target = min + Math.random() * (max - min);
        if (Math.abs(target - x) < 80) target = x < (min + max) / 2 ? x + 160 : x - 160;
        target = Math.min(max, Math.max(min, target));
        if (!(await trotTo(target))) return;
        if (Math.random() < 0.55 && !(await sniff())) return;
        await rest(900 + Math.random() * 2800);
      }
    };

    const waitForBus = async () => {
      if (!(await trotTo(stop.wait))) return;
      body.style.transform = '';
      while (!stopped && ambient) {
        await rest(1200 + Math.random() * 2400);
        if (stopped) return;
        if (!(await (Math.random() < 0.6 ? lookUp() : sniff()))) return;
      }
    };

    const chaseBus = async () => {
      await rest(300);
      if (stopped) return;
      tailWag?.cancel();
      if (ambient) wag(140);
      if (!(await trotTo(Math.max(x, stop.chase), 3.2))) return;
      setBark((n) => (n ?? 0) + 1);
    };

    if (chase) chaseBus();
    else if (closing) waitForBus();
    else if (ambient) wander();

    return () => {
      stopped = true;
      clearTimeout(timer);
      // Keep him where a cut-off trot left him, so the next run starts there
      const at = new DOMMatrixReadOnly(getComputedStyle(walker).transform).m41;
      running.forEach((animation) => animation.cancel());
      setX(at);
    };
  }, [layout, closing, chase, ambient]);

  const onBark = () => {
    playDogSound();
    setBark((n) => (n ?? 0) + 1);
    if (trophies && recordTownPoke('dog') >= CAREER_DOG_POKES)
      achievementStore.unlock('career-dog');
    if (prefersReducedMotion()) return;
    svgRef.current?.animate(
      [
        { transform: 'translateY(0px)' },
        { transform: 'translateY(-6px)', offset: 0.35 },
        { transform: 'translateY(0px)' },
      ],
      { duration: 320, easing: 'ease-out', composite: 'add' },
    );
  };

  return (
    <div ref={walkerRef} className={`absolute left-0 ${BOX[layout]}`}>
      {bark !== null && <TownBarkBubble key={bark} onDone={clearBark} />}
      <button
        type="button"
        aria-label={GAMES_UI.career.town.dog}
        onClick={onBark}
        className="block h-full w-full cursor-pointer rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
      >
        <span ref={bodyRef} className="block h-full w-full">
          <svg ref={svgRef} viewBox="0 0 44 30" className="h-full w-full overflow-visible" aria-hidden="true">
            <ellipse cx="22" cy="29.4" rx="16" ry="1.6" className="fill-slate-950/40" />
            <path
              ref={tailRef}
              d="M9.5 15.5q-4.6-1.6-5.4-8.2"
              className="origin-bottom-right fill-none stroke-[#7a4a28] [transform-box:fill-box]"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            {LEGS.map((leg) => (
              <g key={leg.x} data-leg className="origin-top [transform-box:fill-box]">
                <path
                  d={`M${leg.x} 21v6.6`}
                  className={leg.near ? 'stroke-[#7a4a28]' : 'stroke-[#5c3a1e]'}
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />
                <ellipse
                  cx={leg.x + 0.5}
                  cy="28.2"
                  rx="1.7"
                  ry="0.95"
                  className={leg.near ? 'fill-[#ecdcc2]' : 'fill-[#4a2e17]'}
                />
              </g>
            ))}
            <path
              d="M10 14.5c3-1.6 15-1.8 21-.6 4 .8 5.6 3.4 5.4 6.2-.2 2.4-2.2 3.4-5 3.6H12c-3.4 0-5.4-1.6-5.4-4.4 0-2.6 1.4-4.2 3.4-4.8z"
              className="fill-[#8a5a34]"
            />
            <path
              d="M12 20.5c5 2 13 2 19 .2 0 1.8-1.4 2.8-3.4 2.9H13.5c-1.2 0-1.8-1.2-1.5-3.1z"
              className="fill-[#b9875a]"
            />
            <path
              d="M13 14.6c4-1 10-1.2 14-.5-1 2.2-5 3.2-9 2.8-2.6-.3-4.4-1-5-2.3z"
              className="fill-[#6b4226]"
            />
            <path d="M32.5 15.5c2 1 3.2 3 3 5.2-1.6.6-3 .2-3.8-1z" className="fill-[#ecdcc2]" />
            <g ref={headRef} className="origin-bottom-left [transform-box:fill-box]">
              <path
                d="M31 14c.4-3 2-5.4 4.6-6.4 2.6-1 5.4 0 6.6 2.2l1.2 2.2c.5 1-.1 2.2-1.2 2.4l-3.4.6c-1 1.6-3 2.6-5 2.4z"
                className="fill-[#8a5a34]"
              />
              <path
                d="M38.6 10.6c1.6-.2 3.2.4 4.4 1.6.5.6.2 1.6-.6 1.8l-3.4.6c-.8-1-1-2.4-.4-4z"
                className="fill-[#c79a6a]"
              />
              <path d="M40 13.9q1.4.6 2.6-.2" className="fill-none stroke-[#3b2412]" strokeWidth="0.6" strokeLinecap="round" />
              <ellipse cx="42.7" cy="11.9" rx="1" ry="0.8" className="fill-[#111]" />
              <circle cx="37.6" cy="9.6" r="1" className="fill-[#111]" />
              <circle cx="37.9" cy="9.25" r="0.35" className="fill-[#ffffff]" />
              <path
                d="M35.2 7.6c-1.8-.2-3 1.4-3 3.8 0 1.6.8 2.6 1.8 2.4.9-.2 1.5-1.4 1.8-3.4.2-1.2 0-2.2-.6-2.8z"
                className="fill-[#5c3a1e]"
              />
            </g>
            <path d="M30.6 12.8c1.4.9 3.4 1.2 5 .6l.2 2.3c-1.8.7-4 .4-5.6-.6z" className="fill-red-600" />
            <circle cx="33.4" cy="16" r="0.9" className="fill-amber-300" />
          </svg>
        </span>
      </button>
    </div>
  );
}
