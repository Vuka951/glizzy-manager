import TypedNotice from '@/components/games/career/TypedNotice';
import { REST_EGO_TARGET, REST_FAME_DROP } from '@/data/games/careerEconomy';
import {
  SPONSOR_FAME_GATE,
  SPONSOR_FAME_GATE_UNTIL_YEAR,
} from '@/data/games/careerSponsors';
import { GAMES_UI } from '@/data/games/locale';
import { NOTICE_HEADING, NOTICE_TERM, NOTICE_TEXT } from '@/lib/constants/typedNotice';
import { fmt } from '@/lib/utils/format';

const M = GAMES_UI.career.meters;
const T = GAMES_UI.career.trainings;

const METER_ROWS = [
  { name: M.stress, text: M.info.stress },
  { name: M.appetite, text: M.info.appetite },
  { name: M.ambition, text: M.info.ambition },
  { name: M.ego, text: fmt(M.info.ego, { target: REST_EGO_TARGET }) },
  {
    name: M.fame,
    text: fmt(M.info.fame, {
      drop: REST_FAME_DROP,
      gate: SPONSOR_FAME_GATE,
      year: SPONSOR_FAME_GATE_UNTIL_YEAR,
    }),
  },
];

const SKILL_ROWS = [
  { name: T.stomach.name, text: T.stomach.desc },
  { name: T.sniffer.name, text: T.sniffer.desc },
  { name: T.nutrition.name, text: T.nutrition.desc },
  { name: T.fans.name, text: T.fans.desc },
];

export default function MetersInfoPanel() {
  return (
    <TypedNotice className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {METER_ROWS.map((row) => (
          <div key={row.name} className="flex flex-col">
            <span className={NOTICE_TERM}>{row.name}</span>
            <span className={NOTICE_TEXT}>{row.text}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <span className={NOTICE_HEADING}>{M.info.skillsTitle}</span>
        <p className={NOTICE_TEXT}>{M.info.skillsIntro}</p>
        {SKILL_ROWS.map((row) => (
          <div key={row.name} className="flex flex-col">
            <span className={NOTICE_TERM}>{row.name}</span>
            <span className={NOTICE_TEXT}>{row.text}</span>
          </div>
        ))}
      </div>
    </TypedNotice>
  );
}
