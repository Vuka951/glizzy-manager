import { useCallback, useId, useRef, useState } from 'react';
import TownFountainSplash from '@/components/games/career/town/TownFountainSplash';
import useSceneMotion from '@/components/games/useSceneMotion';
import { GAMES_UI } from '@/data/games/locale';
import { playSplashSound } from '@/lib/utils/gameSounds';
import { prefersReducedMotion } from '@/lib/utils/motion';

// The square's fountain with a gilded glizzy on top; a click makes it splash
export default function TownFountain() {
  const rootRef = useRef<HTMLButtonElement | null>(null);
  const bodyRef = useRef<SVGGElement | null>(null);
  const uid = `townFountain${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const [splashes, setSplashes] = useState<number[]>([]);
  const nextSplash = useRef(0);

  useSceneMotion(rootRef, 0, false, '', true);

  const removeSplash = useCallback((id: number) => {
    setSplashes((list) => list.filter((splash) => splash !== id));
  }, []);

  const splash = () => {
    playSplashSound();
    if (prefersReducedMotion()) return;
    bodyRef.current?.animate(
      [
        { transform: 'scale(1, 1)' },
        { transform: 'scale(1.04, 0.95)', offset: 0.3 },
        { transform: 'scale(0.98, 1.03)', offset: 0.65 },
        { transform: 'scale(1, 1)' },
      ],
      { duration: 520, easing: 'ease-out' },
    );
    const id = nextSplash.current;
    nextSplash.current += 1;
    setSplashes((list) => [...list.slice(-2), id]);
  };

  return (
    <button
      ref={rootRef}
      type="button"
      aria-label={GAMES_UI.career.town.fountain}
      onClick={splash}
      className="block h-full w-full cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
    >
      <svg viewBox="0 0 110 96" className="h-full w-full overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fde68a" />
            <stop offset="0.45" stopColor="#f2c230" />
            <stop offset="1" stopColor="#b7791f" />
          </linearGradient>
        </defs>
        <ellipse cx="55" cy="92" rx="54" ry="6" className="fill-slate-950/40" />
        <g ref={bodyRef} className="origin-bottom [transform-box:fill-box]">
          <ellipse cx="55" cy="86" rx="50" ry="9" className="fill-[#6b7280]" />
          <path d="M5 82v6q50 14 100 0v-6" className="fill-[#4b5563]" />
          <ellipse cx="55" cy="82" rx="46" ry="7" className="fill-sky-400/55" />
          <g data-shimmer>
            <path d="M28 82q8-2 16 0M62 84q10-2 20 0M46 79q6-1.5 12 0" className="fill-none stroke-sky-100/60" strokeWidth="1.2" />
          </g>
          <rect x="49" y="44" width="12" height="38" className="fill-[#9ca3af]" />
          <rect x="49" y="44" width="4" height="38" className="fill-slate-100/20" />
          <ellipse cx="55" cy="46" rx="20" ry="5" className="fill-[#9ca3af]" />
          <ellipse cx="55" cy="44" rx="17" ry="3.5" className="fill-sky-300/60" />
          <g
            data-jet
            className="fill-none stroke-sky-200/80"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="6 5"
          >
            <path d="M50 36q-14 6-22 44" />
            <path d="M60 36q14 6 22 44" />
            <path d="M52 40q-6 4-8 8M58 40q6 4 8 8" />
          </g>
          <g transform="rotate(-12 55 24)">
            <rect x="40" y="18" width="30" height="13" rx="6.5" className="fill-[#d4a017]" />
            <rect x="43" y="14" width="24" height="11" rx="5.5" fill={`url(#${uid}-gold)`} />
            <path d="M47 19l3 2 3-2 3 2 3-2 3 2" className="fill-none stroke-amber-800" strokeWidth="1.3" />
            <rect x="46" y="15.5" width="10" height="2" rx="1" className="fill-amber-50/70" />
          </g>
          <path
            data-star
            d="M73 10l1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2 3-1.2z"
            className="origin-center fill-amber-50 [transform-box:fill-box]"
          />
        </g>
        {splashes.map((id) => (
          <TownFountainSplash key={id} id={id} onDone={removeSplash} />
        ))}
      </svg>
    </button>
  );
}
