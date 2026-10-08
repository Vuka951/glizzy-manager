import ActionIcon, { type ActionIconKind } from '@/components/icons/ActionIcon';
import BowlIcon from '@/components/icons/BowlIcon';
import GlizzyIcon from '@/components/icons/GlizzyIcon';
import Icon from '@/components/icons/Icon';
import TrainingIcon from '@/components/icons/TrainingIcon';
import CalendarResultBadge from '@/components/games/career/CalendarResultBadge';
import { ELECTION_SEASON } from '@/data/games/careerElections';
import { GAMES_UI } from '@/data/games/locale';
import { isElectionYear } from '@/lib/utils/careerElections';
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
const T = GAMES_UI.career.trainings;
const A = GAMES_UI.career.actions;
const SAB = GAMES_UI.career.sabotage;
const PARL = GAMES_UI.career.parliament;

// Winter, spring, summer, autumn row tints
const SEASON_TINTS = [
  'border-slate-100/25 bg-slate-100/10',
  'border-purple-400/25 bg-purple-500/10',
  'border-amber-300/15 bg-amber-500/5',
  'border-orange-300/15 bg-orange-500/5',
];

type ActionStyle = {
  tint: string;
  text: string;
  icon: ActionIconKind | 'fast';
};

const ACTION_STYLES: Record<SlotAction['kind'], ActionStyle> = {
  training: {
    tint: 'border-violet-400/30 bg-violet-500/10',
    text: 'text-violet-200',
    icon: 'training',
  },
  ego: {
    tint: 'border-fuchsia-400/30 bg-fuchsia-500/10',
    text: 'text-fuchsia-200',
    icon: 'training',
  },
  slump: {
    tint: 'border-fuchsia-400/30 bg-fuchsia-500/10',
    text: 'text-fuchsia-200',
    icon: 'guard',
  },
  rest: {
    tint: 'border-emerald-400/30 bg-emerald-500/10',
    text: 'text-emerald-200',
    icon: 'rest',
  },
  fast: {
    tint: 'border-orange-400/30 bg-orange-500/10',
    text: 'text-orange-200',
    icon: 'fast',
  },
  media: {
    tint: 'border-amber-400/30 bg-amber-500/10',
    text: 'text-amber-200',
    icon: 'media',
  },
  guard: {
    tint: 'border-yellow-400/30 bg-yellow-500/10',
    text: 'text-yellow-200',
    icon: 'guard',
  },
  sabotage: {
    tint: 'border-red-400/30 bg-red-500/10',
    text: 'text-red-200',
    icon: 'sabotage',
  },
  island: {
    tint: 'border-cyan-400/30 bg-cyan-500/10',
    text: 'text-cyan-200',
    icon: 'island',
  },
};

// The months the character spent on his own terms say so, next to what he did
function actionLabel(action: SlotAction): string {
  if (action.kind === 'ego' && action.trainingId)
    return fmt(YC.egoSlot, { training: T[action.trainingId].name });
  if (action.kind === 'slump')
    return fmt(YC.slumpSlot, {
      action: action.slumpAction === 'fast' ? A.fast : A.guard,
    });
  if (action.kind === 'rest') return T.rest.name;
  if (action.kind === 'fast') return A.fast;
  if (action.kind === 'island') return A.island;
  if (action.kind === 'guard') return A.guard;
  if (action.kind === 'media') return A.media;
  if (action.kind === 'sabotage') return SAB.action;
  return action.trainingId ? T[action.trainingId].name : '';
}

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
      <span className="max-w-full rounded-full border border-sky-200/15 bg-slate-800/60 px-1.5 py-0.5 text-center text-[8px] font-bold leading-tight text-slate-400">
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
      ? 'border-sky-200/15 bg-slate-800/60 text-slate-400'
      : seasonPriceFavorable(rule.category, pct)
        ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300'
        : 'border-red-500/40 bg-red-500/10 text-red-300';
  return (
    <span
      className={`max-w-full rounded-full border px-1.5 py-0.5 text-center text-[8px] font-bold leading-tight ${tone}`}
    >
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
}: {
  action: SlotAction;
  style: ActionStyle;
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
      className={`h-3.5 w-3.5 shrink-0 ${style.text}`}
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
  const isCurrentYear = year === career.year;
  const isCurrentSeason = isCurrentYear && quarter === career.season;
  const isFuture = isCurrentYear && quarter > career.season;
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

  return (
    <div
      className={`grid grid-cols-2 gap-1.5 rounded-2xl border p-2 sm:grid-cols-4 ${
        SEASON_TINTS[quarter]
      } ${isCurrentSeason ? 'ring-1 ring-sky-300/40' : ''}`}
    >
      {months.map((month, i) => {
        const action = actions[i];
        const style = action ? ACTION_STYLES[action.kind] : null;
        const isCurrentMonth = isCurrentSeason && i === career.slotsUsed;
        return (
          <div
            key={month}
            className={`flex min-h-14 flex-col items-center justify-between gap-1 rounded-xl border p-2 text-center ${
              isCurrentMonth
                ? 'border-sky-300 bg-sky-400/10 ring-2 ring-sky-300/40'
                : action && style
                  ? action.outcome === 'regression'
                    ? 'border-red-500/40 bg-red-500/10'
                    : style.tint
                  : 'border-sky-200/5 bg-slate-900/30'
            } ${isFuture ? 'opacity-50' : ''}`}
          >
            <span
              className={`text-[9px] font-bold uppercase tracking-widest ${
                isCurrentMonth ? 'text-sky-300' : 'text-slate-500'
              }`}
            >
              {month}
            </span>
            <span className="flex max-w-full items-center justify-center gap-1.5">
              {action && style && <ActionGlyph action={action} style={style} />}
              <span
                className={`truncate text-[10px] font-semibold ${
                  action && style
                    ? action.outcome === 'regression'
                      ? 'text-red-300'
                      : style.text
                    : 'text-slate-600'
                }`}
              >
                {action ? actionLabel(action) : YC.free}
              </span>
            </span>
          </div>
        );
      })}
      <div
        className={`flex min-h-14 flex-col items-center justify-between gap-1 rounded-xl border p-2 text-center ${
          record
            ? 'border-amber-400/30 bg-amber-500/5'
            : isCupNow
              ? 'border-sky-300 bg-sky-400/10 ring-2 ring-sky-300/40'
              : isCurrentSeason
                ? 'border-red-500/30 bg-red-500/5'
                : 'border-sky-200/5 bg-slate-900/30'
        } ${isFuture ? 'opacity-50' : ''}`}
      >
        <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-slate-500">
          <Icon
            name="trophy"
            className={`h-3 w-3 ${record ? 'text-amber-300' : isCupNow ? 'text-sky-300' : ''}`}
          />
          {seasonName(quarter)}
        </span>
        <SeasonPriceChip
          career={career}
          year={year}
          quarter={quarter}
          isCurrentSeason={isCurrentSeason}
        />
        {isElectionYear(year) && quarter === ELECTION_SEASON && (
          <span className="rounded-full border border-red-400/50 bg-red-500/10 px-1.5 py-px text-[8px] font-black uppercase tracking-widest text-red-300">
            {PARL.calendarMark}
          </span>
        )}
        {island && (
          <span className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-1.5 py-px text-[8px] font-black uppercase tracking-widest text-cyan-200">
            {A.island}
          </span>
        )}
        {record ? (
          <CalendarResultBadge place={record.playerPlace} />
        ) : (
          <span
            className={`text-[10px] font-semibold ${
              isCupNow
                ? 'text-sky-300'
                : isCurrentSeason
                  ? 'text-red-300'
                  : 'text-slate-600'
            }`}
          >
            {isCupNow ? YC.cupLive : YC.cupSoon}
          </span>
        )}
      </div>
    </div>
  );
}
