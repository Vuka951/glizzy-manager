import ActionIcon from '@/components/icons/ActionIcon';
import BallotBoxIcon from '@/components/icons/BallotBoxIcon';
import BowlIcon from '@/components/icons/BowlIcon';
import GlizzyIcon from '@/components/icons/GlizzyIcon';
import Icon from '@/components/icons/Icon';
import TrainingIcon from '@/components/icons/TrainingIcon';
import CalendarResultBadge from '@/components/games/career/CalendarResultBadge';
import CalendarSeasonMark from '@/components/games/career/CalendarSeasonMark';
import { OFFSEASON_SLOTS } from '@/data/games/careerEconomy';
import { ELECTION_SEASON } from '@/data/games/careerElections';
import { GAMES_UI } from '@/data/games/locale';
import { ACTION_STYLES } from '@/lib/constants/calendarActions';
import { actionLabel } from '@/lib/utils/careerCalendar';
import { isElectionYear } from '@/lib/utils/careerElections';
import type { SavedCareer, SlotAction } from '@/lib/utils/careerSave';
import {
  isOpeningWindow,
  seasonPriceFavorable,
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

function actionGlyph(action: SlotAction) {
  const style = ACTION_STYLES[action.kind];
  if (action.trainingId === 'stomach')
    return <GlizzyIcon variant={0} className="h-2.5 w-4 shrink-0" />;
  if (action.trainingId)
    return <TrainingIcon id={action.trainingId} className="h-3.5 w-3.5 shrink-0" />;
  if (style.icon === 'fast' || action.slumpAction === 'fast')
    return <BowlIcon className="h-3.5 w-3.5 shrink-0" />;
  return (
    <ActionIcon kind={style.icon} className={`h-3.5 w-3.5 shrink-0 ${style.text}`} />
  );
}

// The running quarter on a rail: a tear-off leaf per month, torn away down to
// its stub once the month is spent, with the action it went on left on the
// wood; the months still free in a brass counter; and the cup that closes the
// quarter on an enamel plate with its price swing. Everything names itself on
// hover
export default function TownCalendarCompactRow({
  career,
  stretch = false,
}: {
  career: SavedCareer;
  // Phone: the strip spans the bar and the months share the spare room
  stretch?: boolean;
}) {
  const year = career.year;
  const quarter = career.season;
  const months = OS.months[quarter] ?? [];
  const actions = career.slotLog.filter((action) => action.kind !== 'island');
  const island = career.slotLog.some((action) => action.kind === 'island');
  const record = career.standingsHistory.find(
    (r) => r.year === year && r.season === quarter,
  );
  const isCupNow = !record && career.phase !== 'offseason';
  const election = isElectionYear(year) && quarter === ELECTION_SEASON;
  const opening = isOpeningWindow(year, quarter);
  const rule = seasonPriceRule(quarter);
  const pct = seasonPricePct(career);
  const priceTone = opening
    ? 'text-[#cbd5e1]'
    : seasonPriceFavorable(rule.category, pct)
      ? 'text-[#86efac]'
      : 'text-[#fca5a5]';
  const cupName = seasonName(quarter).split(' ')[0];
  const left = Math.max(0, OFFSEASON_SLOTS - career.slotsUsed);

  return (
    <div
      className={`flex items-center gap-1.5 ${stretch ? 'w-full' : 'w-fit'}`}
    >
      <div className={`flex items-center gap-1 ${stretch ? 'flex-1' : ''}`}>
        {months.map((month, i) => {
          const action = actions[i];
          const isCurrentMonth = i === career.slotsUsed;
          const label = action ? actionLabel(action) : YC.free;
          return (
            <div
              key={month}
              title={`${month}: ${label}`}
              aria-label={`${month}: ${label}`}
              className={`relative flex h-9 min-w-8 flex-col rounded-[2px] min-[380px]:min-w-10 ${
                stretch ? 'flex-1' : ''
              } ${
                isCurrentMonth
                  ? 'shadow-[0_0_0_1.5px_#e8c066,0_3px_0_rgb(0_0_0/0.5)]'
                  : action
                    ? ''
                    : 'shadow-[0_1px_0_#a8987a,0_2px_0_#8a7a5f,0_3px_0_rgb(0_0_0/0.45)]'
              }`}
            >
              <span
                className={`flex h-[13px] shrink-0 items-center justify-center rounded-t-[2px] font-sign text-[11px] font-bold uppercase leading-none tracking-[0.08em] ${
                  isCurrentMonth
                    ? 'bg-[#b91c1c] text-[#ffffff]'
                    : action
                      ? 'bg-[#8a7a5f] text-[#1c1408]'
                      : 'bg-[#7f2a20] text-[#fdf0c8]'
                }`}
              >
                {month.slice(0, 3)}
              </span>
              {action ? (
                <span
                  className={`relative flex min-h-0 flex-1 items-center justify-center rounded-b-[2px] shadow-[inset_0_1px_3px_rgb(0_0_0/0.8)] ${
                    action.outcome === 'regression'
                      ? 'bg-[#3b0d0d]'
                      : 'bg-[#1f140b]'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(135deg,#8a7a5f_50%,transparent_50%),linear-gradient(225deg,#8a7a5f_50%,transparent_50%)] bg-size-[6px_6px] bg-position-[0_-3px]"
                  />
                  {actionGlyph(action)}
                </span>
              ) : (
                <span
                  className={`flex min-h-0 flex-1 items-center justify-center rounded-b-[2px] ${
                    isCurrentMonth ? 'bg-[#f1e8d3]' : 'bg-[#cdbf9f]'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isCurrentMonth ? 'bg-[#b91c1c]' : 'bg-[#8a7a5f]'
                    }`}
                  />
                </span>
              )}
            </div>
          );
        })}
      </div>
      <span className="flex h-9 shrink-0 items-stretch rounded-[4px] bg-gradient-to-b from-[#e8c066] to-[#a8782a] p-[3px] shadow-[inset_0_1px_0_rgb(255_255_255/0.5),0_2px_0_rgb(2_6_23/0.65)]">
        <span className="flex min-w-8 items-center justify-center gap-px rounded-[2px] bg-[#140d07] px-1.5 font-sign font-bold tabular-nums shadow-[inset_0_1px_3px_rgb(0_0_0/0.9)]">
          <span
            className={`text-[19px] leading-none ${left > 0 ? 'text-[#fdf0c8]' : 'text-[#8a7a5f]'}`}
          >
            {left}
          </span>
          <span className="pt-1 text-[12px] leading-none text-[#b8a888]">
            /{OFFSEASON_SLOTS}
          </span>
        </span>
      </span>
      <div
        title={seasonName(quarter)}
        className={`flex h-9 min-w-0 items-center gap-1.5 rounded-[4px] border-2 bg-[#1e3a8a] px-1.5 shadow-[0_2px_0_rgb(2_6_23/0.65)] ${
          record || isCupNow ? 'border-[#e8c066]' : 'border-[#e2e8f0]'
        }`}
      >
        {record ? (
          <CalendarResultBadge place={record.playerPlace} />
        ) : (
          <Icon
            name="trophy"
            className="h-3.5 w-3.5 shrink-0 text-[#fde68a] max-[379px]:hidden"
          />
        )}
        <span className="flex min-w-0 flex-col items-start gap-0.5">
          <span className="max-w-20 truncate font-sign text-[13px] font-extrabold uppercase leading-none tracking-[0.06em] text-[#ffffff]">
            {cupName}
          </span>
          <span
            className={`max-w-24 truncate font-sign text-[12px] font-semibold leading-none tabular-nums ${priceTone}`}
          >
            {opening
              ? SP.chipNone
              : fmt(SP.chipNow, {
                  category: SP.categories[rule.category],
                  pct: signedPct(pct),
                })}
          </span>
        </span>
        {election && (
          <CalendarSeasonMark
            label={PARL.calendarMark}
            tone="scale-75 border-red-400/50 text-red-300"
          >
            <BallotBoxIcon className="h-3.5 w-3.5" />
          </CalendarSeasonMark>
        )}
        {island && (
          <CalendarSeasonMark
            label={A.island}
            tone="scale-75 border-cyan-400/40 text-cyan-200"
          >
            <ActionIcon kind="island" className="h-3 w-3" />
          </CalendarSeasonMark>
        )}
      </div>
    </div>
  );
}
