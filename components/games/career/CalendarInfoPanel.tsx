import CalendarSeasonMark from '@/components/games/career/CalendarSeasonMark';
import SeasonPriceInfoPanel from '@/components/games/career/SeasonPriceInfoPanel';
import TypedNotice from '@/components/games/career/TypedNotice';
import ActionIcon from '@/components/icons/ActionIcon';
import BallotBoxIcon from '@/components/icons/BallotBoxIcon';
import {
  ELECTION_EVERY_YEARS,
  ELECTION_FIRST_YEAR,
  ELECTION_SEASON,
} from '@/data/games/careerElections';
import { GAMES_UI } from '@/data/games/locale';
import { ELECTION_MARK_TONE, ISLAND_MARK_TONE } from '@/lib/constants/calendarActions';
import { NOTICE_HEADING, NOTICE_TEXT } from '@/lib/constants/typedNotice';
import type { SavedCareer } from '@/lib/utils/careerSave';
import { seasonName } from '@/lib/utils/localeNames';
import { fmt } from '@/lib/utils/format';

const YC = GAMES_UI.career.offseason.yearCalendar;
const I = YC.info;
const PARL = GAMES_UI.career.parliament;
const A = GAMES_UI.career.actions;

// The calendar explained: how a year is laid out, what the marks on a cup
// mean, then what every edition does to the prices
export default function CalendarInfoPanel({
  career,
}: {
  career: SavedCareer;
}) {
  const marks = [
    {
      key: 'election',
      text: fmt(I.election, {
        season: seasonName(ELECTION_SEASON),
        every: ELECTION_EVERY_YEARS,
        first: ELECTION_FIRST_YEAR,
      }),
      badges: (
        <CalendarSeasonMark
          label={PARL.calendarMark}
          tone={ELECTION_MARK_TONE}
        >
          <BallotBoxIcon className="h-3.5 w-3.5" />
        </CalendarSeasonMark>
      ),
    },
    {
      key: 'island',
      text: I.island,
      badges: (
        <CalendarSeasonMark
          label={A.island}
          tone={ISLAND_MARK_TONE}
        >
          <ActionIcon kind="island" className="h-3 w-3" />
        </CalendarSeasonMark>
      ),
    },
  ];
  return (
    <TypedNotice className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span className={NOTICE_HEADING}>{I.layoutTitle}</span>
        {[I.rows, I.months, I.cups].map((text) => (
          <p key={text} className={NOTICE_TEXT}>
            {text}
          </p>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <span className={NOTICE_HEADING}>{I.marksTitle}</span>
        {marks.map((mark) => (
          <div key={mark.key} className="flex items-start gap-2.5">
            <span className="flex w-11 shrink-0 gap-0.5 pt-0.5">
              {mark.badges}
            </span>
            <p className={NOTICE_TEXT}>{mark.text}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        <span className={NOTICE_HEADING}>{I.pricesTitle}</span>
        <SeasonPriceInfoPanel career={career} />
      </div>
    </TypedNotice>
  );
}
