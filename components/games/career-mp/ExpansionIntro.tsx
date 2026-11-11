'use client';

import { useEffect, useRef } from 'react';
import PortraitHead from '@/components/games/PortraitHead';
import CareerButton from '@/components/games/career/CareerButton';
import PaperSheet from '@/components/games/career/street/PaperSheet';
import useBoardFocus from '@/components/games/career/street/useBoardFocus';
import SeatTag from '@/components/games/rooms/SeatTag';
import type { OverlordPoints } from '@/data/games/careerEconomy';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import { COACH_COLOR_CLASSES } from '@/lib/constants/careerMp';
import type { CoachPublic } from '@/lib/types/careerMp';
import { fmt, plural } from '@/lib/utils/format';
import { playPaperSound } from '@/lib/utils/gameSounds';
import { characterEpithet } from '@/lib/utils/localeNames';

const E = GAMES_UI.careerMp.expansion;

// The special issue that opens a shared league: every coach and the
// character they brought back, on the front page, once per browser
export default function ExpansionIntro({
  coaches,
  characterBySlug,
  points,
  onDone,
}: {
  coaches: CoachPublic[];
  characterBySlug: Map<string, DuelCharacter>;
  points: OverlordPoints;
  onDone: () => void;
}) {
  useEffect(() => {
    playPaperSound();
  }, []);
  const boardRef = useRef<HTMLDivElement | null>(null);
  useBoardFocus(boardRef, onDone);
  const count = coaches.length;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#060912]/75 p-3">
      <div
        ref={boardRef}
        data-street-dialog
        role="dialog"
        aria-modal
        aria-label={E.headline}
        tabIndex={-1}
        className="w-full max-w-2xl outline-none"
      >
        <PaperSheet className="max-h-[calc(90vh/var(--game-zoom,1))] w-full rotate-[-0.5deg] overflow-y-auto overflow-x-hidden p-4 text-left motion-safe:animate-[bubblein_0.4s_ease-out] sm:p-7">
          <div className="border-y-[3px] border-double border-[#1c1408]/70 py-2 text-center">
            <p className="font-serif text-2xl font-black uppercase tracking-[0.08em] text-slate-100 sm:text-3xl">
              {E.masthead}
            </p>
            <p className="mt-0.5 font-sign text-[13px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              {E.issue}
            </p>
          </div>
          <p className="mt-4 font-serif text-3xl font-black uppercase leading-tight text-slate-100 sm:text-4xl">
            {E.headline}
          </p>
          <p className="mt-2 font-serif text-[15px] leading-relaxed text-slate-300">
            {plural(E.lead, count, {
              count,
              points,
            })}
          </p>
          <p className="mt-4 border-b-[3px] border-double border-[#1c1408]/70 pb-1 font-sign text-[14px] font-bold uppercase tracking-[0.1em] text-slate-300">
            {E.roster}
          </p>
          <ul className="grid sm:grid-cols-2 sm:gap-x-6">
            {coaches.map((coach) => {
              const character = coach.slug ? characterBySlug.get(coach.slug) : null;
              if (!character) return null;
              return (
                <li
                  key={coach.id}
                  className="flex items-center gap-3 border-b border-[#7d93a8]/35 py-2"
                >
                  <PortraitHead
                    character={character}
                    className={`h-12 w-12 ring-2 ${COACH_COLOR_CLASSES[coach.color].ring}`}
                  />
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate font-serif text-[15px] font-bold text-slate-100">
                      {character.name}
                    </span>
                    <span className="truncate font-sign text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                      {characterEpithet(character.slug)}
                    </span>
                    <span className="flex items-center gap-1.5 font-serif text-[12px] text-slate-300">
                      {fmt(E.coachLine, { coach: '' }).trim()}
                      <SeatTag name={coach.name} color={coach.color} />
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 flex justify-center">
            <CareerButton onClick={onDone} className="min-h-11">
              {E.cta}
            </CareerButton>
          </div>
        </PaperSheet>
      </div>
    </div>
  );
}
