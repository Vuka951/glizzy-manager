'use client';

import { useEffect } from 'react';
import PortraitHead from '@/components/games/PortraitHead';
import CoachTag from '@/components/games/career-mp/CoachTag';
import { OVERLORD_POINTS } from '@/data/games/careerEconomy';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import { COACH_COLOR_CLASSES } from '@/lib/constants/careerMp';
import type { CoachPublic } from '@/lib/types/careerMp';
import { fmt, plural } from '@/lib/utils/format';
import { playPaperSound } from '@/lib/utils/gameSounds';
import { characterEpithet } from '@/lib/utils/localeNames';

const E = GAMES_UI.careerMp.expansion;

// The special issue that opens a shared league: every coach and the man he
// brought back, on the front page, once per browser
export default function ExpansionIntro({
  coaches,
  characterBySlug,
  onDone,
}: {
  coaches: CoachPublic[];
  characterBySlug: Map<string, DuelCharacter>;
  onDone: () => void;
}) {
  useEffect(() => {
    playPaperSound();
  }, []);
  const count = coaches.length;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rotate-[-0.5deg] rounded-sm bg-amber-50 p-5 text-left text-slate-900 shadow-2xl animate-[bubblein_0.4s_ease-out] sm:p-7">
        <div className="border-y-4 border-double border-slate-900 py-2 text-center">
          <p className="text-2xl font-black uppercase tracking-[0.15em] sm:text-3xl">
            {E.masthead}
          </p>
          <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.25em] text-slate-500">
            {E.issue}
          </p>
        </div>
        <p className="mt-4 text-2xl font-black uppercase leading-tight sm:text-3xl">
          {E.headline}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          {plural(E.lead, count, {
            count,
            points: OVERLORD_POINTS,
          })}
        </p>
        <p className="mt-4 border-b border-slate-900/30 pb-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
          {E.roster}
        </p>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {coaches.map((coach) => {
            const character = coach.slug ? characterBySlug.get(coach.slug) : null;
            if (!character) return null;
            return (
              <li
                key={coach.id}
                className="flex items-center gap-3 rounded-sm border border-slate-900/15 bg-white/50 px-3 py-2"
              >
                <PortraitHead
                  character={character}
                  className={`h-12 w-12 ring-2 ${COACH_COLOR_CLASSES[coach.color].ring}`}
                />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-sm font-bold">{character.name}</span>
                  <span className="truncate text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    {characterEpithet(character.slug)}
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-slate-700">
                    {fmt(E.coachLine, { coach: '' }).trim()}
                    <CoachTag name={coach.name} color={coach.color} onPaper />
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
        <div className="mt-5 flex justify-center">
          <button
            onClick={onDone}
            className="rounded-sm bg-slate-900 px-7 py-2.5 text-xs font-black uppercase tracking-widest text-amber-50 transition hover:bg-slate-700"
          >
            {E.cta}
          </button>
        </div>
      </div>
    </div>
  );
}
