import BallotMark from '@/components/games/career/BallotMark';
import PaperSheet from '@/components/games/career/street/PaperSheet';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import { GAMES_UI } from '@/data/games/locale';
import type { ConstitutionCard } from '@/lib/utils/careerLaws';
import type { SponsorId } from '@/lib/utils/careerSave';
import { fmt } from '@/lib/utils/format';

const LAWS = GAMES_UI.career.laws;
const BALLOT = LAWS.ballot;
const SCOPES = LAWS.scopes as Record<string, string>;
const NAMES = GAMES_UI.career.sponsors.names as Record<SponsorId, string>;
const SHORT_NAMES = GAMES_UI.career.sponsors.shortNames as Record<
  SponsorId,
  string
>;

// The constitution on the ballot: a heavier sheet than a bill, sealed with
// the party's mark in red wax, the one card that ends the campaign
export default function ConstitutionCardOption({
  card,
  selected = false,
  featured = false,
  printed = false,
  onSelect,
}: {
  card: ConstitutionCard;
  selected?: boolean;
  featured?: boolean;
  printed?: boolean;
  onSelect?: () => void;
}) {
  const body = (
    <>
      <span className="flex items-center gap-2 border-b-[3px] border-double border-red-300/80 pb-1.5">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#991b1b] shadow-[0_0_0_2px_rgb(127_29_29/0.35)]"
        >
          <SponsorEmblem sponsorId={card.party} className="h-4.5 w-4.5" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="font-sign text-[13px] font-bold uppercase leading-tight tracking-[0.08em] text-red-300">
            {BALLOT.constitution}
          </span>
          <span className="truncate font-sign text-[12px] font-semibold uppercase leading-tight tracking-[0.06em] text-slate-400">
            {SHORT_NAMES[card.party]}
          </span>
        </span>
        {onSelect && <BallotMark marked={selected} className="h-6 w-6" />}
      </span>
      <span
        className={`block font-serif font-black uppercase leading-tight tracking-wide text-slate-100 ${
          featured || printed ? 'text-lg sm:text-xl' : 'text-[15px]'
        }`}
      >
        {BALLOT.constitutionName}
      </span>
      <span
        className={`block leading-snug text-slate-300 ${featured || printed ? 'text-xs' : 'text-[11px]'}`}
      >
        {fmt(BALLOT.constitutionEffect, { party: NAMES[card.party] })}
      </span>
      <span className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
        <span className="rounded-[2px] border border-red-300/70 px-1.5 py-px font-sign text-[12px] font-bold uppercase tracking-[0.06em] text-red-300">
          {SCOPES.constitution}
        </span>
      </span>
    </>
  );
  const column = 'relative flex h-full w-full flex-col items-stretch gap-1.5 text-left';
  if (printed) return <div className={column}>{body}</div>;
  const sheet = `h-full w-full bg-[#e8d9b0] transition duration-200 ${
    selected
      ? 'z-10 -translate-y-1 outline-[3px] outline-offset-1 outline-[#fcd34d]'
      : featured
        ? ''
        : 'sm:rotate-[0.8deg]'
  } ${onSelect ? 'hover:-translate-y-1 sm:hover:rotate-0' : ''}`;
  return (
    <PaperSheet className={sheet}>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-1 rounded-[1px] border border-red-300/40"
      />
      {onSelect ? (
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          className={`${column} p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e3a8a]`}
        >
          {body}
        </button>
      ) : (
        <div className={`${column} p-3`}>{body}</div>
      )}
    </PaperSheet>
  );
}
