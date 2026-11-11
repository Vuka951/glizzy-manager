'use client';

import { useEffect, useState } from 'react';
import PortraitHead from '@/components/games/PortraitHead';
import CareerButton from '@/components/games/career/CareerButton';
import PaperSheet from '@/components/games/career/street/PaperSheet';
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
        className="absolute inset-0 cursor-default bg-[#060912]/75"
      />
      <PaperSheet className="z-10 max-h-[calc(90vh/var(--game-zoom,1))] w-full max-w-3xl overflow-y-auto p-5 text-slate-100 animate-[bubblein_0.35s_ease-out] motion-reduce:animate-none sm:p-7">
        <div className="flex items-center justify-between gap-3 border-y-[3px] border-double border-[#1c1408] py-2">
          <div className="flex items-center gap-2.5">
            <SponsorEmblem sponsorId={party} className="h-7 w-7" />
            <div>
              <p className="font-serif text-lg font-black uppercase leading-none tracking-[0.08em]">
                {FAVOR.title}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-slate-400">
                {SPONSOR_NAMES[party]}
              </p>
            </div>
          </div>
          <span className="rotate-[-6deg] rounded-[2px] border-2 border-[#b91c1c] px-2 py-0.5 text-center font-sign text-[13px] font-extrabold uppercase leading-tight tracking-[0.08em] text-[#b91c1c]">
            {reason}
          </span>
        </div>
        <p className="mt-2 text-center text-[12px] text-slate-400">
          {FAVOR.pick}
        </p>

        {candidates.length === 0 ? (
          <p className="my-8 text-center font-serif text-sm text-slate-400">
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
                  className={`group relative flex flex-col items-center gap-1.5 rounded-[2px] px-2 py-3 transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e3a8a] motion-reduce:transition-none ${
                    !candidate.ok
                      ? 'cursor-not-allowed border border-dashed border-[#1c1408]/40'
                      : selected
                        ? 'bg-[#fbf6e9] shadow-[0_0_0_2px_#b91c1c,0_2px_0_2px_rgb(28_20_8/0.35)]'
                        : 'bg-[#fbf6e9]/70 shadow-[0_0_0_1px_rgb(28_20_8/0.25),0_2px_0_rgb(28_20_8/0.3)] hover:-translate-y-0.5 hover:bg-[#fbf6e9] motion-reduce:hover:translate-y-0'
                  }`}
                >
                  <PortraitHead
                    character={character}
                    className={`h-12 w-12 transition-all duration-200 ${
                      !candidate.ok ? 'opacity-50 grayscale' : selected
                        ? 'scale-105 grayscale-0'
                        : 'grayscale group-enabled:group-hover:scale-105 group-enabled:group-hover:grayscale-0'
                    }`}
                  />
                  <span
                    className={`font-serif text-[12px] font-bold leading-tight ${
                      candidate.ok ? 'text-slate-100' : 'text-slate-400'
                    }`}
                  >
                    {character.name}
                  </span>
                  {tag && (
                    <span
                      className={`font-sign text-[12px] font-semibold leading-none ${
                        candidate.ok ? 'text-[#b91c1c]' : 'text-slate-400'
                      }`}
                    >
                      {tag}
                    </span>
                  )}
                  {!candidate.ok && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-1 top-1/2 h-px -translate-y-1/2 rotate-[-12deg] bg-[#1c1408]/40"
                    />
                  )}
                  {selected && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-1.5 -top-1.5 h-5 w-5 rounded-full border-2 border-[#b91c1c] bg-[#b91c1c] text-center text-[11px] font-black leading-4 text-[#fbf6e9]"
                    >
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#1c1408]/30 pt-3">
          <p className="min-w-0 flex-1 font-serif text-[12px] text-slate-300">
            {chosenCharacter &&
              fmt(FAVOR.chosenLine, { name: chosenCharacter.name, reason })}
          </p>
          <div className="flex gap-2">
            <CareerButton tone="quiet" onClick={onClose} className="min-h-11">
              {FAVOR.cancel}
            </CareerButton>
            <CareerButton
              tone="danger"
              disabled={!chosen}
              onClick={() => chosen && onConfirm(chosen.slug, chosen.index)}
              className="min-h-11"
            >
              {chosenCharacter
                ? fmt(FAVOR.confirm, { name: chosenCharacter.name })
                : FAVOR.confirmEmpty}
            </CareerButton>
          </div>
        </div>
      </PaperSheet>
    </div>
  );
}
