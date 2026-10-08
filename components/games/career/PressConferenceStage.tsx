import { useCallback, useEffect, useRef } from 'react';
import PortraitHead from '@/components/games/PortraitHead';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import {
  PRESS_ARM_POINT,
  PRESS_ARM_REACH,
  PRESS_ARM_REST,
  PRESS_ARM_ROOTS,
} from '@/lib/constants/pressConference';
import { playShutterSound } from '@/lib/utils/gameSounds';
import { nearestTurn } from '@/lib/utils/pressConference';

const SLEEVE = 60;
const CUFF = 54;
const PALM = 72;

// One arm, drawn lying flat along +x from the portrait's edge so the whole
// thing can be aimed with a single rotation
function armShape(x: number, y: number) {
  return (
    <>
      <path
        d={`M${x} ${y} H${x + SLEEVE}`}
        strokeWidth="16"
        strokeLinecap="round"
        className="stroke-slate-600"
      />
      <rect
        x={x + CUFF}
        y={y - 9}
        width="6"
        height="18"
        rx="3"
        className="fill-frost-border"
      />
      <circle cx={x + PALM} cy={y} r="10" className="fill-slate-200" />
      <circle cx={x + PALM - 3} cy={y - 9} r="5" className="fill-slate-200" />
      <path
        d={`M${x + PALM + 6} ${y} H${x + PRESS_ARM_REACH - 4}`}
        strokeWidth="8"
        strokeLinecap="round"
        className="stroke-slate-200"
      />
      <path
        d={`M${x + 109} ${y - 8} l5 -4 M${x + 111} ${y} h6 M${x + 109} ${y + 8} l5 4`}
        strokeWidth="2.6"
        strokeLinecap="round"
        className="fill-none stroke-red-300"
      />
    </>
  );
}

// A hand parked on the lectern while the other one does the talking
function restingArmShape(from: number, control: number, to: number) {
  return (
    <>
      <path
        d={`M${from} 168 Q${control} 194 ${to} 213`}
        strokeWidth="16"
        strokeLinecap="round"
        className="stroke-slate-600"
      />
      <circle cx={to} cy={214} r="7" className="fill-slate-400" />
    </>
  );
}

// A microphone clamped to the lectern, tilted up toward the speaker
function micShape(baseX: number, tipX: number, flip: boolean) {
  return (
    <>
      <path
        d={`M${baseX} 216 L${tipX} 186`}
        strokeWidth="3"
        strokeLinecap="round"
        className="stroke-slate-600"
      />
      <rect
        x={tipX - 4.5}
        y={179}
        width="9"
        height="11"
        rx="4.5"
        className="fill-slate-500"
      />
      <rect
        x={tipX - 6}
        y={191}
        width="12"
        height="11"
        rx="2"
        className={flip ? 'fill-sky-200' : 'fill-red-300'}
      />
    </>
  );
}

// The press pit crowding the front of the stage: one reporter behind a
// camera, one holding a phone up, one just craning for a look
function pressPitShape(flip: boolean, handUp: boolean) {
  const dir = flip ? -1 : 1;
  const at = (offset: number) => 200 + dir * offset;
  const head = (cx: number, cy: number, r: number) => (
    <>
      <circle cx={cx} cy={cy} r={r} className="fill-card-strong" />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        strokeWidth="1.5"
        strokeOpacity="0.35"
        className="fill-none stroke-frost-border"
      />
    </>
  );
  return (
    <>
      <g
        className={`transition-opacity duration-300 ${
          handUp ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <path
          d={`M${at(106)} 292 Q${at(98)} 276 ${at(96)} 262`}
          strokeWidth="7"
          strokeLinecap="round"
          className="stroke-slate-700"
        />
        <circle cx={at(96)} cy={258} r="5" className="fill-slate-500" />
      </g>
      {head(at(106), 294, 11)}
      {head(at(140), 290, 13)}
      <rect
        x={at(128) - 5}
        y={268}
        width="10"
        height="26"
        rx="2"
        className="fill-slate-700"
      />
      {head(at(179), 280, 16)}
      <rect
        x={at(179) - 13}
        y={262}
        width="26"
        height="20"
        rx="4"
        className="fill-slate-700"
      />
      <rect
        x={at(179) - 5}
        y={256}
        width="10"
        height="7"
        rx="2"
        className="fill-slate-700"
      />
      <circle cx={at(173)} cy={273} r="6" className="fill-slate-500" />
      <circle cx={at(173)} cy={273} r="2.5" className="fill-card-deep" />
    </>
  );
}

// One camera going off: the lens blows out white and the burst rings out
const FLASH_UNITS = [
  { x: 27, y: 273, r: 7, origin: '[transform-origin:27px_273px]' },
  { x: 373, y: 273, r: 7, origin: '[transform-origin:373px_273px]' },
  { x: 72, y: 270, r: 5, origin: '[transform-origin:72px_270px]' },
  { x: 328, y: 270, r: 5, origin: '[transform-origin:328px_270px]' },
];

function flashUnitShape(unit: (typeof FLASH_UNITS)[number]) {
  return (
    <>
      <circle
        cx={unit.x}
        cy={unit.y}
        r={unit.r * 2}
        fillOpacity="0.16"
        className="fill-white"
      />
      <circle cx={unit.x} cy={unit.y} r={unit.r} className="fill-white" />
      <circle
        cx={unit.x}
        cy={unit.y}
        r={unit.r + 1}
        strokeWidth="2.5"
        className={`fill-none stroke-white [transform-box:view-box] ${unit.origin}`}
      />
    </>
  );
}

// The new-year press conference. The player is the portrait circle at the
// lectern, arms out of its sides, pointing at whoever the cursor lands on
// while the pit keeps firing off flashes.
export default function PressConferenceStage({
  player,
  pointing,
  announced,
  angry,
  children,
}: {
  player: DuelCharacter | undefined;
  pointing: boolean;
  announced: boolean;
  angry: boolean;
  children: React.ReactNode;
}) {
  const rightArmRef = useRef<SVGGElement | null>(null);
  const flashRef = useRef<HTMLDivElement | null>(null);
  const flashesRef = useRef<SVGGElement | null>(null);
  const headRef = useRef<HTMLDivElement | null>(null);
  const anglesRef = useRef({ right: PRESS_ARM_REST.right as number });
  const armAnimRef = useRef<Animation | null>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const el = rightArmRef.current;
    if (!el) return;
    const from = anglesRef.current.right;
    const to = nearestTurn(from, pointing ? PRESS_ARM_POINT : PRESS_ARM_REST.right);
    if (to === from) return;
    anglesRef.current.right = to;
    armAnimRef.current?.cancel();
    armAnimRef.current = el.animate(
      [{ transform: `rotate(${from}deg)` }, { transform: `rotate(${to}deg)` }],
      {
        duration: reducedMotion ? 1 : 560,
        easing: 'cubic-bezier(0.34, 1.5, 0.5, 1)',
        fill: 'forwards',
      },
    );
  }, [pointing]);

  useEffect(() => () => armAnimRef.current?.cancel(), []);

  const popFlash = useCallback((index: number, volume: number) => {
    const unit = flashesRef.current?.children[index] as SVGGElement | undefined;
    if (!unit) return;
    playShutterSound(volume);
    const [glow, core, ring] = Array.from(unit.children) as SVGElement[];
    unit.animate(
      [{ opacity: 0 }, { opacity: 1, offset: 0.05 }, { opacity: 0 }],
      { duration: 460, easing: 'ease-out' },
    );
    glow.animate([{ opacity: 0.16 }, { opacity: 0 }], {
      duration: 460,
      easing: 'ease-out',
    });
    core.animate(
      [{ opacity: 1 }, { opacity: 0, offset: 0.35 }, { opacity: 0 }],
      { duration: 460, easing: 'ease-out' },
    );
    ring.animate(
      [
        { transform: 'scale(1)', opacity: 0.9 },
        { transform: 'scale(3.4)', opacity: 0 },
      ],
      { duration: 460, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' },
    );
    flashRef.current?.animate(
      [{ opacity: 0 }, { opacity: 0.09, offset: 0.12 }, { opacity: 0 }],
      { duration: 320, easing: 'ease-out' },
    );
  }, []);

  // The pit keeps working through the whole conference
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let timer = 0;
    const tick = () => {
      popFlash(Math.floor(Math.random() * FLASH_UNITS.length), 0.14);
      timer = window.setTimeout(tick, 1600 + Math.random() * 2400);
    };
    timer = window.setTimeout(tick, 700 + Math.random() * 1200);
    return () => window.clearTimeout(timer);
  }, [popFlash]);

  // The answer sets the whole room off at once
  useEffect(() => {
    if (!announced) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timers = Array.from({ length: 8 }, (_, index) =>
      window.setTimeout(
        () => popFlash((index * 3) % FLASH_UNITS.length, 0.28),
        index * 150,
      ),
    );
    const wash = flashRef.current?.animate(
      [
        { opacity: 0 },
        { opacity: 0.4, offset: 0.08 },
        { opacity: 0, offset: 0.25 },
        { opacity: 0.25, offset: 0.45 },
        { opacity: 0 },
      ],
      { duration: 1300, easing: 'linear' },
    );
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      wash?.cancel();
    };
  }, [announced, popFlash]);

  useEffect(() => {
    const el = headRef.current;
    if (!el || angry) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bob = el.animate(
      [
        { transform: 'translateY(0) rotate(0deg)' },
        { transform: 'translateY(-2.5px) rotate(1.5deg)', offset: 0.5 },
        { transform: 'translateY(0) rotate(0deg)' },
      ],
      { duration: 3400, iterations: Infinity, easing: 'ease-in-out' },
    );
    return () => bob.cancel();
  }, [angry]);

  // He takes the question personally
  useEffect(() => {
    const el = headRef.current;
    if (!angry || !el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const shake = el.animate(
      [
        { transform: 'rotate(0deg) scale(1)' },
        { transform: 'rotate(-7deg) scale(1.14)', offset: 0.12 },
        { transform: 'rotate(7deg) scale(1.14)', offset: 0.24 },
        { transform: 'rotate(-5deg) scale(1.1)', offset: 0.36 },
        { transform: 'rotate(4deg) scale(1.1)', offset: 0.48 },
        { transform: 'rotate(0deg) scale(1.06)' },
      ],
      { duration: 900, easing: 'ease-out', fill: 'forwards' },
    );
    return () => shake.cancel();
  }, [angry]);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-frost-border/40 shadow-2xl">
      <svg
        viewBox="0 0 400 300"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="pressWall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" className="[stop-color:var(--card-deep)]" />
            <stop offset="1" className="[stop-color:var(--background)]" />
          </linearGradient>
          <radialGradient id="pressGlow" cx="50%" cy="26%" r="70%">
            <stop offset="0" stopColor="#7dd3fc" stopOpacity="0.18" />
            <stop offset="1" stopColor="#7dd3fc" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="300" fill="url(#pressWall)" />
        <rect width="400" height="300" fill="url(#pressGlow)" />
        <path
          d="M60 0V300M200 0V300M340 0V300"
          strokeWidth="1.5"
          strokeOpacity="0.12"
          className="fill-none stroke-frost-border"
        />

        <circle cx="200" cy="162" r="28" className="fill-card-strong" />
        {micShape(148, 156, false)}
        {micShape(252, 244, true)}
        <rect
          x="118"
          y="210"
          width="164"
          height="12"
          rx="5"
          className="fill-slate-700"
        />
        <path d="M126 220H274L266 300H134Z" className="fill-card-strong" />
        <path
          d="M126 220H274L266 300H134Z"
          strokeWidth="1.5"
          strokeOpacity="0.35"
          className="fill-none stroke-frost-border"
        />
        <rect
          x="140"
          y="234"
          width="120"
          height="20"
          rx="5"
          className="fill-card-deep"
        />
        <rect
          x="140"
          y="234"
          width="120"
          height="20"
          rx="5"
          strokeWidth="1.5"
          strokeOpacity="0.4"
          className="fill-none stroke-frost-border"
        />

        {restingArmShape(178, 172, 170)}
        <g
          className={`transition-opacity duration-300 ${
            pointing ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {restingArmShape(222, 228, 230)}
        </g>

        {pressPitShape(false, !pointing)}
        {pressPitShape(true, !pointing)}
        <g ref={flashesRef}>
          {FLASH_UNITS.map((unit) => (
            <g key={`${unit.x}`} className="opacity-0">
              {flashUnitShape(unit)}
            </g>
          ))}
        </g>
      </svg>

      {player && (
        <p className="pointer-events-none absolute left-1/2 top-[81.3%] w-[28%] -translate-x-1/2 -translate-y-1/2 truncate text-center font-mono text-[8px] font-bold uppercase leading-none tracking-[0.12em] text-sky-200/90 sm:text-[10px]">
          {player.name}
        </p>
      )}
      {children}
      <svg
        viewBox="0 0 400 300"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <g
          ref={rightArmRef}
          className={`[transform-box:view-box] [transform-origin:222px_168px] [transform:rotate(84deg)] transition-opacity duration-200 ${
            pointing ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {armShape(PRESS_ARM_ROOTS.right.x, PRESS_ARM_ROOTS.right.y)}
        </g>
      </svg>
      <div
        ref={headRef}
        className="absolute left-1/2 top-[54%] aspect-square w-[14%] -translate-x-1/2 -translate-y-1/2"
      >
        {player && (
          <PortraitHead
            character={player}
            className={`h-full w-full transition duration-500 ${
              angry
                ? 'ring-4 ring-red-400 saturate-150'
                : 'ring-2 ring-frost-border/50'
            }`}
          />
        )}
        <span
          className={`pointer-events-none absolute inset-0 rounded-full bg-red-500 transition-opacity duration-500 ${
            angry ? 'opacity-40' : 'opacity-0'
          }`}
        />
        {angry && (
          <svg
            viewBox="0 0 18 18"
            className="absolute -right-2 -top-2 h-2/5 w-2/5 animate-[bubblein_0.3s_ease-out]"
            aria-hidden="true"
          >
            <path
              d="M3 8L8 3L8 8L13 3M3 15L8 10L8 15L13 10"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="fill-none stroke-red-400"
            />
          </svg>
        )}
      </div>
      <div
        ref={flashRef}
        className="pointer-events-none absolute inset-0 bg-white opacity-0"
      />

    </div>
  );
}
