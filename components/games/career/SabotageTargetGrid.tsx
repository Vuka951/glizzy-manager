'use client';

import PortraitHead from '@/components/games/PortraitHead';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import { rankBySeeding } from '@/lib/utils/careerPoints';
import { visibleGuardBlock } from '@/lib/utils/careerSabotage';
import { scoutReveal } from '@/lib/utils/careerScouting';
import type { SavedCareer } from '@/lib/utils/careerSave';
import { fmt } from '@/lib/utils/format';

const SAB = GAMES_UI.career.sabotage;

// The hit list as mugshots laid out on the dossier in table order. Every print
// carries the one thing that decides whether the job is worth it: how much of
// it the target's people at the door will stop. The pick is ringed in red pencil
export default function SabotageTargetGrid({
  career,
  characters,
  selected,
  onSelect,
}: {
  career: SavedCareer;
  characters: DuelCharacter[];
  selected: string | null;
  onSelect: (slug: string) => void;
}) {
  const bySlug = new Map(characters.map((c) => [c.slug, c]));
  const ranked = rankBySeeding(career.characters, career.playerSlug);
  const order = ranked.filter(
    (slug) => slug !== career.playerSlug && bySlug.has(slug),
  );
  const revealDetail = scoutReveal(
    career.characters[career.playerSlug],
    false,
  ).detail;
  const plotted = new Set(
    career.pendingSabotages
      .filter((s) => s.bySlug === career.playerSlug)
      .map((s) => s.targetSlug),
  );
  const guardLabel = (slug: string) => {
    const guard = visibleGuardBlock(career, slug, revealDetail);
    const sponsorPct = Math.round(guard.sponsor * 100);
    const standingPct = Math.round((guard.standing ?? 0) * 100);
    if (sponsorPct > 0) {
      const base = fmt(SAB.guardBlue, { pct: sponsorPct });
      if (guard.unknown) return `${base} ${SAB.guardMore}`;
      return standingPct > sponsorPct
        ? `${base} ${fmt(SAB.guardStanding, { pct: standingPct })}`
        : base;
    }
    if (guard.unknown) return SAB.guardUnknown;
    return standingPct > 0
      ? fmt(SAB.guardStanding, { pct: standingPct })
      : SAB.unguardedTag;
  };
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6">
      {order.map((slug, index) => {
        const character = bySlug.get(slug) as DuelCharacter;
        const state = career.characters[slug];
        const place = ranked.indexOf(slug) + 1;
        const guard = visibleGuardBlock(career, slug, revealDetail);
        const block = Math.round(guard.known * 100);
        const isSelected = selected === slug;
        const isRival = slug === career.rivalSlug;
        return (
          <button
            key={slug}
            onClick={() => onSelect(slug)}
            aria-pressed={isSelected}
            className={`group relative flex flex-col items-center gap-1 rounded-[2px] bg-[#fbf6e9] px-1 pb-1.5 pt-2.5 text-center shadow-[0_0_0_1px_rgb(28_20_8/0.2),0_2px_0_rgb(28_20_8/0.35)] transition hover:rotate-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e3a8a] motion-reduce:transition-none ${
              index % 3 === 0
                ? '-rotate-1'
                : index % 3 === 1
                  ? 'rotate-[0.6deg]'
                  : ''
            }`}
          >
            <span className="absolute left-1 top-0.5 font-sign text-[13px] font-bold leading-none tabular-nums text-slate-300">
              {place}
            </span>
            {state.sponsor && (
              <span className="absolute right-1 top-1">
                <SponsorEmblem
                  sponsorId={state.sponsor.sponsorId}
                  className="h-3.5 w-3.5"
                />
              </span>
            )}
            <span className="relative">
              <PortraitHead
                character={character}
                className={`h-10 w-10 transition motion-reduce:transition-none ${
                  isSelected ? '' : 'grayscale group-hover:grayscale-0'
                }`}
              />
              {isSelected && (
                <span
                  aria-hidden="true"
                  className="absolute -inset-x-2 -inset-y-1.5 -rotate-6 rounded-[50%] border-[2.5px] border-[#b91c1c]"
                />
              )}
            </span>
            <span className="w-full text-balance font-serif text-[11px] font-bold leading-tight text-slate-100 [overflow-wrap:anywhere]">
              {character.name}
            </span>
            <span
              className={`font-sign text-[11px] font-semibold leading-[1.1] ${
                guard.sponsor > 0
                  ? 'text-sky-300'
                  : guard.unknown
                    ? 'text-slate-400'
                    : block > 0
                      ? 'text-amber-300'
                      : 'text-emerald-300'
              }`}
            >
              {guardLabel(slug)}
            </span>
            {isRival && (
              <span className="-rotate-3 rounded-[1px] border border-[#b91c1c] px-1 font-sign text-[11px] font-bold uppercase leading-[14px] tracking-[0.05em] text-[#b91c1c]">
                {SAB.rival}
              </span>
            )}
            {plotted.has(slug) && (
              <span className="rotate-2 rounded-[1px] border border-amber-400 px-1 font-sign text-[11px] font-bold uppercase leading-[14px] tracking-[0.03em] text-amber-400">
                {SAB.plotted}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
