'use client';

import { useEffect, useState } from 'react';
import PortraitHead from '@/components/games/PortraitHead';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import type { SponsorId } from '@/lib/utils/careerSave';
import { fmt } from '@/lib/utils/format';
import { playPaperSound } from '@/lib/utils/gameSounds';

const FAVOR = GAMES_UI.career.favor;
const SPONSOR_NAMES = GAMES_UI.career.sponsors.names as Record<
  SponsorId,
  string
>;

export type FavorCandidate = {
  slug: string;
  index: number;
  // Reachable by the favor; the others are shown but cannot be picked
  ok: boolean;
  // Why not, when not: the party's own man or a protected seat
  blocked?: 'own' | 'protected';
  // Sits across the table from the player this round
  opponent: boolean;
};

// The party's request form, laid out like the classifieds page the career
// opened on: a grid of faces, one gets circled, then the form is signed
export default function FavorPicker({
  party,
  candidates,
  characterBySlug,
  onConfirm,
  onClose,
}: {
  party: SponsorId;
  candidates: FavorCandidate[];
  characterBySlug: Map<string, DuelCharacter>;
  onConfirm: (slug: string, index: number) => void;
  onClose: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const reason = (FAVOR.reasons as Record<string, string>)[party] ?? '';
  const chosen = candidates.find((c) => c.slug === picked) ?? null;
  const chosenCharacter = chosen ? characterBySlug.get(chosen.slug) : null;

  useEffect(() => {
    playPaperSound();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Enter' && chosen) onConfirm(chosen.slug, chosen.index);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [chosen, onClose, onConfirm]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <button
        aria-label={FAVOR.cancel}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-slate-950/80 backdrop-blur-sm"
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-sm bg-amber-50 p-5 text-slate-900 shadow-2xl animate-[bubblein_0.35s_ease-out] sm:p-7">
        <div className="flex items-center justify-between gap-3 border-y-2 border-slate-900 py-2">
          <div className="flex items-center gap-2.5">
            <SponsorEmblem sponsorId={party} className="h-7 w-7" />
            <div>
              <p className="text-base font-black uppercase leading-none tracking-[0.12em]">
                {FAVOR.title}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-slate-600">
                {SPONSOR_NAMES[party]}
              </p>
            </div>
          </div>
          <span className="rotate-[-6deg] border-2 border-red-700 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.15em] text-red-700">
            {reason}
          </span>
        </div>
        <p className="mt-2 text-center text-[11px] italic text-slate-600">
          {FAVOR.pick}
        </p>

        {candidates.length === 0 ? (
          <p className="my-8 text-center text-sm italic text-slate-500">
            {FAVOR.noTargets}
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {candidates.map((candidate) => {
              const character = characterBySlug.get(candidate.slug);
              if (!character) return null;
              const selected = candidate.slug === picked;
              const tag = candidate.ok
                ? candidate.opponent
                  ? FAVOR.opponentTag
                  : ''
                : candidate.blocked === 'own'
                  ? FAVOR.ownTag
                  : FAVOR.protectedTag;
              return (
                <button
                  key={candidate.slug}
                  disabled={!candidate.ok}
                  aria-pressed={selected}
                  onClick={() => setPicked(selected ? null : candidate.slug)}
                  className={`group relative flex flex-col items-center gap-1.5 rounded-sm border px-2 py-3 transition-all duration-200 ${
                    !candidate.ok
                      ? 'cursor-not-allowed border-dashed border-slate-900/15 bg-transparent opacity-45'
                      : selected
                        ? 'border-red-700 bg-white shadow-md ring-2 ring-red-700/60'
                        : 'border-slate-900/15 bg-white/50 hover:-translate-y-0.5 hover:border-slate-900/50 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <PortraitHead
                    character={character}
                    className={`h-12 w-12 transition-all duration-200 ${
                      selected
                        ? 'scale-105 grayscale-0'
                        : 'grayscale group-enabled:group-hover:scale-105 group-enabled:group-hover:grayscale-0'
                    }`}
                  />
                  <span className="text-[11px] font-bold leading-tight text-slate-900">
                    {character.name}
                  </span>
                  {tag && (
                    <span
                      className={`text-[9px] font-semibold leading-none ${
                        candidate.ok ? 'text-red-700' : 'text-slate-500'
                      }`}
                    >
                      {tag}
                    </span>
                  )}
                  {!candidate.ok && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-1 top-1/2 h-px -translate-y-1/2 rotate-[-12deg] bg-slate-900/30"
                    />
                  )}
                  {selected && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-1.5 -top-1.5 h-5 w-5 rounded-full border-2 border-red-700 bg-red-700 text-center text-[11px] font-black leading-4 text-amber-50"
                    >
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-900/20 pt-3">
          <p className="min-w-0 flex-1 text-[11px] text-slate-600">
            {chosenCharacter
              ? fmt(FAVOR.chosenLine, { name: chosenCharacter.name, reason })
              : FAVOR.nobodyLine}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-sm border border-slate-900/30 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
            >
              {FAVOR.cancel}
            </button>
            <button
              disabled={!chosen}
              onClick={() => chosen && onConfirm(chosen.slug, chosen.index)}
              className="rounded-sm bg-slate-900 px-5 py-2 text-[10px] font-black uppercase tracking-widest text-amber-50 transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:hover:bg-slate-400"
            >
              {chosenCharacter
                ? fmt(FAVOR.confirm, { name: chosenCharacter.name })
                : FAVOR.confirmEmpty}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
