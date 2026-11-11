import BallotMark from '@/components/games/career/BallotMark';
import ConstitutionCardOption from '@/components/games/career/ConstitutionCardOption';
import PaperSheet from '@/components/games/career/street/PaperSheet';
import { LAW_SCOPES } from '@/data/games/careerLaws';
import { GAMES_UI } from '@/data/games/locale';
import {
  conflictingLaws,
  lawEffectText,
  lawName,
  type LawCard,
  type LawInForce,
} from '@/lib/utils/careerLaws';
import { fmt } from '@/lib/utils/format';

const LAWS = GAMES_UI.career.laws;
const BALLOT = LAWS.ballot;
const SCOPES = LAWS.scopes as Record<string, string>;
// Papers on a desk never lie square
const TILTS = ['sm:-rotate-1', 'sm:rotate-[0.6deg]', 'sm:-rotate-[0.4deg]'];

// One bill on the ballot, printed on paper: the law, its text and whom it lands on, and any law on the books it would
// push out. A repeal is the law in force with a red line through it, and
// the constitution has a sheet of its own.
// Clickable while the picker is choosing. Printed drops the sheet, for a bill
// that is set in the ballot itself
export default function LawCardOption({
  card,
  laws = [],
  selected = false,
  featured = false,
  printed = false,
  index = 0,
  onSelect,
}: {
  card: LawCard;
  // The books as they stand, for the conflict line and the repeal's date
  laws?: LawInForce[];
  selected?: boolean;
  // The bill on the table once it is picked: bigger type, no tilt
  featured?: boolean;
  printed?: boolean;
  index?: number;
  onSelect?: () => void;
}) {
  if (card.action === 'constitution') {
    return (
      <ConstitutionCardOption
        card={card}
        selected={selected}
        featured={featured}
        printed={printed}
        onSelect={onSelect}
      />
    );
  }
  const repeal = card.action === 'repeal';
  const conflicts = conflictingLaws(card, laws);
  const since = laws.find((l) => l.id === card.law)?.year;
  const body = (
    <>
      <span
        className={`flex items-center gap-2 border-b-[3px] border-double pb-1.5 ${
          repeal ? 'border-red-300/70' : 'border-slate-200/70'
        }`}
      >
        <span
          className={`min-w-0 flex-1 font-sign text-[13px] font-bold uppercase leading-tight tracking-[0.08em] ${
            repeal ? 'text-red-300' : 'text-slate-100'
          }`}
        >
          {repeal ? BALLOT.repeal : BALLOT.pass}
        </span>
        {onSelect && <BallotMark marked={selected} className="h-6 w-6" />}
      </span>
      <span
        className={`relative block font-serif font-black leading-tight ${
          featured || printed ? 'text-lg sm:text-xl' : 'text-[15px]'
        } ${repeal ? 'text-slate-400' : 'text-slate-100'}`}
      >
        {lawName(card.law)}
        {repeal && (
          <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 -rotate-2 rounded-full bg-[#b91c1c]/85" />
        )}
      </span>
      <span
        className={`block leading-snug ${featured || printed ? 'text-xs' : 'text-[11px]'} ${
          repeal ? 'text-slate-400' : 'text-slate-300'
        }`}
      >
        {lawEffectText(card.law)}
      </span>
      <span className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
        <span
          className={`rounded-[2px] border px-1.5 py-px font-sign text-[12px] font-bold uppercase tracking-[0.06em] ${
            LAW_SCOPES[card.law] === 'everyone'
              ? 'border-slate-500 text-slate-300'
              : 'border-red-300/60 text-red-300'
          }`}
        >
          {SCOPES[LAW_SCOPES[card.law]]}
        </span>
        {repeal && since !== undefined && (
          <span className="font-sign text-[12px] font-semibold tabular-nums text-slate-400">
            {fmt(BALLOT.since, { year: since })}
          </span>
        )}
      </span>
      {conflicts.length > 0 && (
        <span className="flex flex-wrap items-center gap-1.5 rounded-[2px] border border-dashed border-red-300/60 px-1.5 py-1">
          <span className="font-sign text-[12px] font-bold uppercase tracking-[0.08em] text-red-300">
            {BALLOT.conflict}
          </span>
          {conflicts.map((id) => (
            <span
              key={id}
              className="font-serif text-[12px] font-bold text-slate-400 line-through decoration-[#b91c1c] decoration-2"
            >
              {lawName(id)}
            </span>
          ))}
        </span>
      )}
    </>
  );
  const column = 'relative flex h-full w-full flex-col items-stretch gap-1.5 text-left';
  if (printed) return <div className={column}>{body}</div>;
  const sheet = `h-full w-full transition duration-200 ${
    selected
      ? 'z-10 -translate-y-1 outline-[3px] outline-offset-1 outline-[#fcd34d]'
      : featured
        ? ''
        : TILTS[index % TILTS.length]
  } ${onSelect ? 'hover:-translate-y-1 sm:hover:rotate-0' : ''}`;
  const hatch = repeal && (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(135deg,transparent_0_10px,rgb(185_28_28/0.06)_10px_20px)]"
    />
  );
  return (
    <PaperSheet className={sheet}>
      {hatch}
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
