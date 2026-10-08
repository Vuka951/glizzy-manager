import { useEffect, useRef } from 'react';
import BlackDwarfMark from '@/components/games/career/sponsors/BlackDwarfMark';
import { GAMES_UI } from '@/data/games/locale';
import { playPaperSound } from '@/lib/utils/gameSounds';

// Press photo for the lead story: a crane lowers the corporation's sign
// back onto its tower while the first deal is already being shaken on
function SponsorPressPhoto() {
  return (
    <svg
      viewBox="0 0 96 72"
      className="h-20 w-[6.7rem] rounded-sm border border-slate-900/40 bg-slate-100"
      aria-hidden="true"
    >
      <rect x="12" y="16" width="26" height="44" className="fill-slate-600" />
      <path d="M16 22h18M16 29h18M16 36h18M16 43h18M16 50h18" className="stroke-slate-300" strokeWidth="2.6" strokeDasharray="3 2.75" />
      <rect x="22" y="54" width="6" height="6" className="fill-slate-800" />
      <path d="M66 60V12" className="stroke-slate-700" strokeWidth="2.4" />
      <path d="M40 12h48" className="stroke-slate-700" strokeWidth="2" />
      <path d="M66 6l-10 6M66 6l10 6M66 6v6" className="fill-none stroke-slate-700" strokeWidth="1.4" />
      <path d="M83 12v6M49 12v5" className="stroke-slate-700" strokeWidth="1" />
      <path d="M62 56h8l1 4h-10z" className="fill-slate-700" />
      <BlackDwarfMark x="41" y="17" width="16" height="16" className="" />
      <path d="M4 60h88" className="stroke-slate-700" strokeWidth="1.5" />
      <circle cx="47" cy="49.5" r="2.6" className="fill-slate-800" />
      <path d="M43.8 60c0-4.4 1.6-7 3.2-7 1.1 0 2.1.9 2.7 2.6" className="fill-slate-800" />
      <circle cx="56" cy="49.5" r="2.6" className="fill-slate-800" />
      <path d="M59.2 60c0-4.4-1.6-7-3.2-7-1.1 0-2.1.9-2.7 2.6" className="fill-slate-800" />
      <path d="M49 54.5l2.5 1.3M54 54.5l-2.5 1.3" className="stroke-slate-800" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

// Press chart for the price-crisis story: rising bars with a red trend line
function PriceGraph() {
  return (
    <svg viewBox="0 0 56 44" className="h-14 w-[4.5rem]" aria-hidden="true">
      <path d="M6 3v36h47" className="fill-none stroke-slate-900" strokeWidth="1.4" />
      <path d="M6 29h47M6 19h47M6 9h47" className="stroke-slate-900/15" strokeWidth="0.8" strokeDasharray="2 2.5" />
      <rect x="10" y="31" width="7" height="8" className="fill-slate-400" />
      <rect x="21" y="26" width="7" height="13" className="fill-slate-400" />
      <rect x="32" y="20" width="7" height="19" className="fill-slate-500" />
      <rect x="43" y="11" width="7" height="28" className="fill-slate-500" />
      <path
        d="M9 30 L22 25 L31 27 L48 7"
        className="fill-none stroke-red-700"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M42.5 6.5h6v6"
        className="fill-none stroke-red-700"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const INTRO = GAMES_UI.career.intro;
const SELECT = GAMES_UI.career.select;

// The classic movie opening: a newspaper spins onto the screen, front page
// full of league gossip, with the coach-wanted ad as the call to action
export default function CareerIntroCutscene({ onDone }: { onDone: () => void }) {
  const paperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = paperRef.current;
    if (!el) return;
    playPaperSound();
    const animation = el.animate(
      [
        { transform: 'rotate(-540deg) scale(0.05)', opacity: 0 },
        { transform: 'rotate(-1deg) scale(1)', opacity: 1 },
      ],
      { duration: 1100, easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)', fill: 'both' },
    );
    return () => animation.cancel();
  }, []);

  return (
    <div
      ref={paperRef}
      className="w-full max-w-2xl rotate-[-1deg] rounded-sm bg-amber-50 p-5 text-left text-slate-900 shadow-2xl sm:p-7"
    >
      <div className="border-y-4 border-double border-slate-900 py-2 text-center">
        <p className="text-3xl font-black uppercase tracking-[0.15em]">
          {SELECT.masthead}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="border-b border-slate-900/20 pb-2.5 opacity-0 [animation-delay:1100ms] [animation-fill-mode:forwards] animate-[bubblein_0.4s_ease-out] sm:col-span-2 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-3.5">
          <p className="text-base font-black uppercase leading-tight sm:text-lg">
            {INTRO.headlines[0].title}
          </p>
          <div className="mt-2 flex items-start gap-3">
            <p className="min-w-0 flex-1 text-[11px] leading-relaxed text-slate-600">
              {INTRO.headlines[0].text}
            </p>
            <span className="shrink-0">
              <SponsorPressPhoto />
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="border-b border-slate-900/20 pb-2.5 opacity-0 [animation-delay:1400ms] [animation-fill-mode:forwards] animate-[bubblein_0.4s_ease-out]">
            <p className="text-xs font-black uppercase leading-tight">
              {INTRO.headlines[1].title}
            </p>
            <div className="mt-1.5 flex items-start gap-2">
              <p className="min-w-0 flex-1 text-[10px] leading-relaxed text-slate-600">
                {INTRO.headlines[1].text}
              </p>
              <span className="shrink-0">
                <PriceGraph />
              </span>
            </div>
          </div>
          <div className="opacity-0 [animation-delay:1700ms] [animation-fill-mode:forwards] animate-[bubblein_0.4s_ease-out]">
            <p className="text-xs font-black uppercase leading-tight">
              {INTRO.headlines[2].title}
            </p>
            <p className="mt-1.5 text-[10px] leading-relaxed text-slate-600">
              {INTRO.headlines[2].text}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 border-4 border-slate-900 p-3 text-center opacity-0 [animation-delay:2100ms] [animation-fill-mode:forwards] animate-[bubblein_0.4s_ease-out]">
        <p className="text-xl font-black uppercase tracking-widest">
          {INTRO.ad.title}
        </p>
        <p className="mx-auto mt-1 max-w-xs text-[11px] leading-relaxed text-slate-600">
          {INTRO.ad.text}
        </p>
        <button
          onClick={onDone}
          className="mt-3 rounded-sm bg-slate-900 px-6 py-2 text-xs font-black uppercase tracking-widest text-amber-50 transition hover:bg-slate-700"
        >
          {INTRO.ad.cta}
        </button>
      </div>
    </div>
  );
}
