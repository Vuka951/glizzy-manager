'use client';

import { useEffect, useState } from 'react';
import { useCareerFrames } from '@/components/games/career/careerFrames';
import PartyEscort from '@/components/games/career/PartyEscort';
import PoliceOfficer from '@/components/games/career/PoliceOfficer';
import { GAMES_UI } from '@/data/games/locale';
import type { SponsorId } from '@/lib/utils/careerSave';
import type { MatchEventKind } from '@/lib/utils/tournamentSim';

function Medic() {
  return (
    <svg viewBox="0 0 24 40" className="h-9 w-auto" aria-hidden="true">
      <rect x="7" y="13" width="10" height="17" rx="3" className="fill-slate-100" />
      <circle cx="12" cy="8" r="5" className="fill-amber-200" />
      <rect x="9.5" y="2.5" width="5" height="3.5" rx="1" className="fill-slate-100" />
      <path d="M11 17h2v6h-2zM8 19.5h8v2H8z" className="fill-red-500" />
      <rect x="9" y="30" width="2.6" height="8" className="fill-slate-300" />
      <rect x="12.4" y="30" width="2.6" height="8" className="fill-slate-300" />
    </svg>
  );
}

function Stretcher() {
  return (
    <svg viewBox="0 0 60 24" className="h-6 w-auto" aria-hidden="true">
      <rect x="4" y="8" width="52" height="5" rx="2.5" className="fill-slate-200" />
      <rect x="8" y="4" width="18" height="6" rx="3" className="fill-red-300" />
      <circle cx="14" cy="19" r="4" className="fill-slate-500" />
      <circle cx="46" cy="19" r="4" className="fill-slate-500" />
    </svg>
  );
}

// Sudden death: the clock has run out and a glizzy in the hand now loses
function Stopwatch() {
  return (
    <svg viewBox="0 0 32 36" className="h-9 w-auto" aria-hidden="true">
      <rect x="13" y="0" width="6" height="4" rx="1" className="fill-slate-300" />
      <rect x="22" y="3" width="6" height="3" rx="1.5" className="fill-slate-300" transform="rotate(40 25 4.5)" />
      <circle cx="16" cy="19" r="14" className="fill-slate-200" />
      <circle cx="16" cy="19" r="11.5" className="fill-red-600" />
      <path d="M16 19V10" className="stroke-slate-100" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 19l6 3" className="stroke-slate-100" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="19" r="1.5" className="fill-slate-100" />
    </svg>
  );
}

function Skull() {
  return (
    <svg viewBox="0 0 24 26" className="h-7 w-auto animate-pulse" aria-hidden="true">
      <path d="M12 1a10 10 0 0 0-10 10c0 4 2 6.5 4 8v4h12v-4c2-1.5 4-4 4-8A10 10 0 0 0 12 1z" className="fill-slate-100" />
      <circle cx="8.5" cy="11.5" r="2.6" className="fill-slate-900" />
      <circle cx="15.5" cy="11.5" r="2.6" className="fill-slate-900" />
      <path d="M11 15.5l1-2 1 2z" className="fill-slate-900" />
      <path d="M9 20v3M12 20v3M15 20v3" className="stroke-slate-900" strokeWidth="1.2" />
    </svg>
  );
}

// Comedy interludes played over the table during an event frame. A removal
// brings the party's own people; without a party the police stand in
export default function MatchEventOverlay({
  kind,
  party = null,
}: {
  kind: MatchEventKind;
  party?: SponsorId | null;
}) {
  const street = useCareerFrames() === 'street';
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  const slideLeft = `transition-transform duration-700 ease-out ${
    mounted ? 'translate-x-0' : '-translate-x-24'
  }`;
  const slideRight = `transition-transform duration-700 ease-out ${
    mounted ? 'translate-x-0' : 'translate-x-24'
  }`;

  const caption = (GAMES_UI.cup.viewer.events as Record<string, string>)[kind];

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-2">
      <div
        className={`flex w-full max-w-[17rem] flex-col items-center overflow-hidden animate-[bubblein_0.3s_ease-out] ${
          street
            ? `rounded-[6px] border-2 border-[#f1f5f9] bg-[#0f172a] shadow-[0_0_0_2px_#450a0a,0_6px_0_rgb(0_0_0/0.55)]`
            : 'rounded-2xl border border-red-500/40 bg-slate-950/90 shadow-[0_18px_40px_-10px_rgba(0,0,0,0.85)] backdrop-blur-sm'
        }`}
      >
        <div className="relative flex min-h-[3.25rem] items-end sm:min-h-[4.5rem] justify-center gap-2 px-4 pb-2 pt-3">
          {kind === 'police' && (
            <>
              <span className="absolute left-1/2 top-1 flex -translate-x-1/2 gap-1.5">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-500 [animation-delay:300ms]" />
              </span>
              <span className={slideLeft}>
                <PoliceOfficer />
              </span>
              <span className={slideRight}>
                <PoliceOfficer flip />
              </span>
            </>
          )}
          {kind === 'removed' && (
            <>
              <span className={slideLeft}>
                {party ? <PartyEscort party={party} /> : <PoliceOfficer />}
              </span>
              <span className="h-9 w-3" />
              <span className={slideRight}>
                {party ? (
                  <PartyEscort party={party} flip />
                ) : (
                  <PoliceOfficer flip />
                )}
              </span>
            </>
          )}
          {kind === 'meltdown' && (
            <>
              <span className={slideLeft}>
                <Medic />
              </span>
              <span className={`${slideLeft} delay-100`}>
                <Stretcher />
              </span>
              <span className={slideRight}>
                <Medic />
              </span>
              <svg viewBox="0 0 32 12" className="absolute -top-1 right-6 h-3 w-auto rotate-[24deg]" aria-hidden="true">
                <rect x="2" y="4" width="20" height="4" rx="2" className="fill-sky-200" />
                <rect x="22" y="5" width="8" height="2" rx="1" className="fill-slate-400" />
                <rect x="0" y="2" width="3" height="8" rx="1" className="fill-slate-400" />
              </svg>
            </>
          )}
          {kind === 'overfull-forfeit' && (
            <span className={`flex items-end gap-1 ${slideLeft}`}>
              <svg viewBox="0 0 40 32" className="h-8 w-auto" aria-hidden="true">
                <circle cx="16" cy="12" r="10" className="fill-lime-300" />
                <circle cx="12" cy="10" r="1.6" className="fill-slate-800" />
                <circle cx="20" cy="10" r="1.6" className="fill-slate-800" />
                <path d="M11 17q5 4 10 0" className="fill-none stroke-slate-800" strokeWidth="1.6" transform="rotate(180 16 18)" />
                <path d="M18 20q4 6 12 8-6 2-14-2z" className="fill-lime-400" />
                <ellipse cx="30" cy="29" rx="8" ry="2.5" className="fill-lime-400/70" />
              </svg>
            </span>
          )}
          {kind === 'binge-grab' && (
            <span className="animate-pulse text-2xl font-black text-amber-300">{GAMES_UI.cup.viewer.bite}</span>
          )}
          {kind === 'random-pick' && (
            <span className="animate-pulse text-xl font-black text-red-300">?!</span>
          )}
          {kind === 'tiebreak' && (
            <span className={`flex items-center gap-2 ${slideLeft}`}>
              <Skull />
              <Stopwatch />
              <Skull />
            </span>
          )}
        </div>
        {caption && (
          <p
            className={
              street
                ? 'w-full border-t-2 border-[#f1f5f9] bg-[#b91c1c] px-3 py-1.5 text-center font-sign text-[15px] font-bold leading-tight tracking-[0.02em] text-[#ffffff]'
                : 'w-full border-t border-red-500/40 bg-red-950/90 px-3 py-1.5 text-center text-xs font-bold leading-snug text-red-200'
            }
          >
            {caption}
          </p>
        )}
      </div>
    </div>
  );
}
