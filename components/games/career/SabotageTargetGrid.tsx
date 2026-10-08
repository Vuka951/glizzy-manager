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

// The hit list as a grid of faces in table order. Every face carries the one
// thing that decides whether the job is worth it: how much of it the target's
// people at the door will stop
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
      const base = fmt(SAB.guardZidari, { pct: sponsorPct });
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
    <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5 md:grid-cols-6">
      {order.map((slug) => {
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
            className={`group relative flex flex-col items-center gap-1 rounded-xl border px-1.5 pb-1.5 pt-2 text-center transition ${
              isSelected
                ? 'border-red-400/80 bg-red-500/15 shadow-[0_0_0_1px_rgb(248_113_113/0.5)]'
                : 'border-sky-200/10 bg-slate-950/40 hover:border-red-400/40 hover:bg-slate-800/60'
            }`}
          >
            <span className="absolute left-1.5 top-1 font-mono text-[9px] font-bold text-slate-500">
              {place}
            </span>
            {state.sponsor && (
              <span className="absolute right-1.5 top-1">
                <SponsorEmblem
                  sponsorId={state.sponsor.sponsorId}
                  className="h-3.5 w-3.5"
                />
              </span>
            )}
            <PortraitHead
              character={character}
              className={`h-10 w-10 transition ${
                isSelected ? '' : 'grayscale group-hover:grayscale-0'
              }`}
            />
            <span
              className={`w-full truncate text-[10px] font-semibold leading-tight ${
                isSelected ? 'text-white' : 'text-slate-200'
              }`}
            >
              {character.name}
            </span>
            <span
              className={`rounded-full px-1.5 py-px font-mono text-[8px] font-bold ${
                guard.sponsor > 0
                  ? 'bg-blue-500/15 text-blue-200'
                  : guard.unknown
                    ? 'bg-slate-800 text-slate-400'
                    : block > 0
                      ? 'bg-amber-500/15 text-amber-300'
                      : 'bg-emerald-500/10 text-emerald-300'
              }`}
            >
              {guardLabel(slug)}
            </span>
            {isRival && (
              <span className="rounded-full border border-red-500/40 bg-red-500/10 px-1.5 py-px text-[8px] font-bold uppercase tracking-widest text-red-300">
                {SAB.rival}
              </span>
            )}
            {plotted.has(slug) && (
              <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-1.5 py-px text-[8px] font-bold uppercase tracking-widest text-amber-300">
                {SAB.plotted}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
