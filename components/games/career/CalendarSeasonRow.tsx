import ActionIcon from '@/components/icons/ActionIcon';
import BallotBoxIcon from '@/components/icons/BallotBoxIcon';
import BowlIcon from '@/components/icons/BowlIcon';
import GlizzyIcon from '@/components/icons/GlizzyIcon';
import Icon from '@/components/icons/Icon';
import TrainingIcon from '@/components/icons/TrainingIcon';
import CalendarResultBadge from '@/components/games/career/CalendarResultBadge';
import CalendarSeasonMark from '@/components/games/career/CalendarSeasonMark';
import { ELECTION_SEASON } from '@/data/games/careerElections';
import { GAMES_UI } from '@/data/games/locale';
import {
  ACTION_STYLES,
  type CalendarActionStyle,
  ELECTION_MARK_TONE,
  ISLAND_MARK_TONE,
} from '@/lib/constants/calendarActions';
import { isElectionYear } from '@/lib/utils/careerElections';
import { actionLabel } from '@/lib/utils/careerCalendar';
import type { SavedCareer, SlotAction } from '@/lib/utils/careerSave';
import {
  seasonPriceFavorable,
  isOpeningWindow,
  seasonPricePct,
  seasonPriceRule,
} from '@/lib/utils/careerSeasonPrices';
import { seasonName } from '@/lib/utils/localeNames';
import { fmt, signedPct } from '@/lib/utils/format';

const OS = GAMES_UI.career.offseason;
const YC = OS.yearCalendar;
const SP = OS.seasonPrices;
const A = GAMES_UI.career.actions;
const PARL = GAMES_UI.career.parliament;

// The printer's four season inks for winter, spring, summer and autumn: the
// month boxes, and a heavier pull of the same ink for the cup that closes them
const SEASON_PAPER = [
  'bg-[#e6e6dc]',
  'bg-[#eddfd6]',
  'bg-[#f3e5ba]',
  'bg-[#f0dabc]',
];
const SEASON_CUP_PAPER = [
  'bg-[#ced4cd]',
  'bg-[#ddcbc4]',
  'bg-[#e6d395]',
  'bg-[#e4c69c]',
];

// The night board's action colours are too pale for paper, so the calendar
// writes every kind of month in its own ink
const ACTION_INK: Record<SlotAction['kind'], string> = {
  training: 'text-[#5b21b6]',
  ego: 'text-[#86198f]',
  slump: 'text-[#86198f]',
  rest: 'text-[#166534]',
  fast: 'text-[#9a3412]',
  media: 'text-[#854d0e]',
  guard: 'text-[#713f12]',
  sabotage: 'text-[#a11919]',
  island: 'text-[#155e75]',
};

const PENCIL_RING =
  'pointer-events-none absolute inset-1 -rotate-1 rounded-[48%_52%_50%_50%/54%_48%_52%_46%] border-2 border-[#1e40af]';

const PRICE_STAMP =
  'max-w-full rounded-[2px] border px-1 text-center font-sign text-[12px] font-semibold leading-tight tabular-nums tracking-[0.02em]';

// This season's rolled swing, or the range the other seasons roll from
function SeasonPriceChip({
  career,
  year,
  quarter,
  isCurrentSeason,
}: {
  career: SavedCareer;
  year: number;
  quarter: number;
  isCurrentSeason: boolean;
}) {
  if (isOpeningWindow(year, quarter)) {
    return (
      <span className={`${PRICE_STAMP} border-slate-500 text-slate-400`}>
        {SP.chipNone}
      </span>
    );
  }
  const rule = seasonPriceRule(quarter);
  const category = SP.categories[rule.category];
  const isPast =
    year < career.year || (year === career.year && quarter < career.season);
  const rolled = isPast ? career.seasonPriceByYear?.[year]?.[quarter] : undefined;
  const pct = isCurrentSeason ? seasonPricePct(career) : rolled;
  const tone =
    pct === undefined
      ? 'border-slate-500 text-slate-400'
      : seasonPriceFavorable(rule.category, pct)
        ? 'border-emerald-300 text-emerald-300'
        : 'border-red-300 text-red-300';
  return (
    <span className={`${PRICE_STAMP} ${tone}`}>
      {pct !== undefined
        ? fmt(SP.chipNow, { category, pct: signedPct(pct) })
        : fmt(SP.chipRange, {
            category,
            min: signedPct(rule.minPct).replace('%', ''),
            max: signedPct(rule.maxPct),
          })}
    </span>
  );
}

function ActionGlyph({
  action,
  style,
  ink,
}: {
  action: SlotAction;
  style: CalendarActionStyle;
  ink: string;
}) {
  if (action.trainingId === 'stomach')
    return <GlizzyIcon variant={0} className="h-3 w-5 shrink-0" />;
  if (action.trainingId)
    return (
      <TrainingIcon id={action.trainingId} className="h-3.5 w-3.5 shrink-0" />
    );
  if (style.icon === 'fast' || action.slumpAction === 'fast')
    return <BowlIcon className="h-3.5 w-3.5 shrink-0" />;
  return (
    <ActionIcon
      kind={style.icon}
      className={`h-3.5 w-3.5 shrink-0 ${ink}`}
    />
  );
}

// One quarter of a career year: its three months and the cup that closes it
export default function CalendarSeasonRow({
  career,
  year,
  quarter,
}: {
  career: SavedCareer;
  year: number;
  quarter: number;
}) {
  const months = OS.months[quarter] ?? [];
  const isCurrentSeason = year === career.year && quarter === career.season;
  const log = isCurrentSeason
    ? career.slotLog
    : ((career.logsByYear?.[year] ?? [[], [], [], []])[quarter] ?? []);
  // The island weekend takes no month of its own, so it hangs off the season
  const actions = log.filter((action) => action.kind !== 'island');
  const island = log.some((action) => action.kind === 'island');
  const record = career.standingsHistory.find(
    (r) => r.year === year && r.season === quarter,
  );
  const isCupNow = isCurrentSeason && !record && career.phase !== 'offseason';
  const election = isElectionYear(year) && quarter === ELECTION_SEASON;

  return (
    <div
      className={`grid grid-cols-2 gap-px border-t-2 border-[#1c1408]/60 bg-[#1c1408]/30 last:rounded-b-[2px] sm:grid-cols-4 ${
        isCurrentSeason ? 'shadow-[inset_5px_0_0_#1e3a8a]' : ''
      }`}
    >
      {months.map((month, i) => {
        const action = actions[i];
        const style = action ? ACTION_STYLES[action.kind] : null;
        const isCurrentMonth = isCurrentSeason && i === career.slotsUsed;
        const regression = action?.outcome === 'regression';
        const ink = action
          ? regression
            ? 'text-[#a11919]'
            : ACTION_INK[action.kind]
          : '';
        return (
          <div
            key={month}
            className={`relative flex min-h-[5.25rem] flex-col items-center justify-between gap-1 p-2 text-center ${SEASON_PAPER[quarter]}`}
          >
            {isCurrentMonth && (
              <span aria-hidden="true" className={PENCIL_RING} />
            )}
            <span
              className={`font-sign text-[14px] font-bold uppercase leading-none tracking-[0.08em] ${
                isCurrentMonth ? 'text-[#1e40af]' : 'text-slate-400'
              }`}
            >
              {month}
            </span>
            <span className="flex h-5 max-w-full items-center justify-center gap-1.5">
              {action && style && (
                <ActionGlyph action={action} style={style} ink={ink} />
              )}
              <span
                className={`truncate font-serif text-[12px] ${
                  action
                    ? `font-bold ${ink}`
                    : isCurrentMonth
                      ? 'font-bold text-[#1e40af]'
                      : 'italic text-slate-500'
                }`}
              >
                {action ? actionLabel(action) : YC.free}
              </span>
            </span>
          </div>
        );
      })}
      <div
        className={`relative flex min-h-[5.25rem] flex-col items-center justify-between gap-1 p-2 text-center ${SEASON_CUP_PAPER[quarter]}`}
      >
        {isCupNow && <span aria-hidden="true" className={PENCIL_RING} />}
        <span className="flex items-center gap-1 font-sign text-[14px] font-bold uppercase leading-none tracking-[0.05em] text-slate-300">
          <Icon
            name="trophy"
            className={`h-3 w-3 shrink-0 ${
              record
                ? 'text-amber-300'
                : isCupNow
                  ? 'text-[#1e40af]'
                  : 'text-slate-400'
            }`}
          />
          {seasonName(quarter)}
        </span>
        <SeasonPriceChip
          career={career}
          year={year}
          quarter={quarter}
          isCurrentSeason={isCurrentSeason}
        />
        <span className="flex h-5 items-center justify-center gap-1">
          {record ? (
            <CalendarResultBadge place={record.playerPlace} />
          ) : (
            <span
              className={`font-serif text-[12px] ${
                isCupNow
                  ? 'font-bold text-[#1e40af]'
                  : isCurrentSeason
                    ? 'font-bold text-[#a11919]'
                    : 'italic text-slate-500'
              }`}
            >
              {isCupNow ? YC.cupLive : YC.cupSoon}
            </span>
          )}
          {election && (
            <CalendarSeasonMark label={PARL.calendarMark} tone={ELECTION_MARK_TONE}>
              <BallotBoxIcon className="h-3.5 w-3.5" />
            </CalendarSeasonMark>
          )}
          {island && (
            <CalendarSeasonMark label={A.island} tone={ISLAND_MARK_TONE}>
              <ActionIcon kind="island" className="h-3 w-3" />
            </CalendarSeasonMark>
          )}
        </span>
      </div>
    </div>
  );
}
