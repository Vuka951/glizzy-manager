import PortraitHead from '@/components/games/PortraitHead';
import Icon from '@/components/icons/Icon';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import { campaignOverlord } from '@/lib/utils/careerPoints';
import type { CareerSlot, SavedCareer } from '@/lib/utils/careerSave';
import { seasonName } from '@/lib/utils/localeNames';
import { fmt, plural } from '@/lib/utils/format';

const CAREER = GAMES_UI.career;

export default function CareerSlotCard({
  slot,
  career,
  characterBySlug,
  onNew,
  onContinue,
  onDelete,
}: {
  slot: CareerSlot;
  career: SavedCareer | null;
  characterBySlug: Map<string, DuelCharacter>;
  onNew: () => void;
  onContinue: () => void;
  onDelete: () => void;
}) {
  const label = (
    <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-sky-300">
      {fmt(CAREER.start.slot, { n: slot })}
    </span>
  );

  if (!career) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-3xl border border-dashed border-sky-200/25 bg-slate-950/55 p-3 backdrop-blur-sm sm:flex-col sm:justify-center sm:gap-4 sm:p-4">
        {label}
        <button
          onClick={onNew}
          className="rounded-xl border border-red-500/40 bg-red-500/15 px-5 py-2 text-xs font-semibold text-red-200 transition hover:border-red-500/60 hover:bg-red-500/25 hover:text-white"
        >
          {CAREER.start.button}
        </button>
      </div>
    );
  }

  const character = characterBySlug.get(career.playerSlug) ?? null;
  const overlordSlug = campaignOverlord(career);
  const overlord = overlordSlug
    ? (characterBySlug.get(overlordSlug) ?? null)
    : null;

  return (
    <div className="flex items-center gap-3 rounded-3xl border border-frost-border/40 bg-gradient-to-br from-card-strong/60 via-card-deep/80 to-card-strong/60 p-3 text-left shadow-2xl backdrop-blur-sm sm:flex-col sm:items-stretch sm:gap-3 sm:p-4 sm:text-center">
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:flex-col sm:gap-2">
        {character ? (
          <PortraitHead
            character={character}
            className="h-11 w-11 shrink-0 sm:h-14 sm:w-14"
          />
        ) : (
          <span className="h-11 w-11 shrink-0 rounded-full border-2 border-frost-border/50 bg-slate-800 sm:h-14 sm:w-14" />
        )}
        <span className="flex min-w-0 flex-col gap-0.5 sm:items-center">
          {label}
          <span className="truncate text-sm font-bold text-emerald-200">
            {character?.name ?? career.playerSlug}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
            {seasonName(career.season)} ·{' '}
            {fmt(CAREER.hud.year, { year: career.year })}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
            {plural(CAREER.hud.balance, career.balance, { amount: career.balance })}
          </span>
          {overlord && (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-amber-300">
              <Icon name="trophy" className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {fmt(CAREER.hud.overlordBy, { name: overlord.name })}
              </span>
            </span>
          )}
        </span>
      </div>
      <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row sm:justify-center">
        <button
          onClick={onContinue}
          className="rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-2 text-xs font-semibold text-emerald-200 transition hover:border-emerald-400/70 hover:bg-emerald-500/25 hover:text-white"
        >
          {CAREER.start.resume}
        </button>
        <button
          onClick={onDelete}
          className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-2 text-xs font-semibold text-red-300/80 transition hover:border-red-500/60 hover:text-red-200"
        >
          {CAREER.start.delete}
        </button>
      </div>
    </div>
  );
}
