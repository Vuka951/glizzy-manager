import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import TypedNotice from '@/components/games/career/TypedNotice';
import {
  SPONSOR_FAME_GATE,
  SPONSOR_FAME_GATE_UNTIL_YEAR,
  SPONSOR_IDS,
} from '@/data/games/careerSponsors';
import { GAMES_UI } from '@/data/games/locale';
import { NOTICE_TERM, NOTICE_TEXT } from '@/lib/constants/typedNotice';
import { fmt } from '@/lib/utils/format';

const SPONSORS = GAMES_UI.career.sponsors;

export default function SponsorInfoPanel() {
  return (
    <TypedNotice className="flex flex-col gap-3">
      <p className={NOTICE_TEXT}>
        {fmt(SPONSORS.info.intro, {
          gate: SPONSOR_FAME_GATE,
          year: SPONSOR_FAME_GATE_UNTIL_YEAR,
        })}
      </p>
      <div className="flex flex-col">
        {SPONSOR_IDS.map((id) => (
          <div
            key={id}
            className="flex items-start gap-2.5 border-t border-[#7d93a8]/40 py-2.5"
          >
            <SponsorEmblem sponsorId={id} className="mt-0.5 h-6 w-6 shrink-0" />
            <span className="flex min-w-0 flex-col">
              <span className={NOTICE_TERM}>
                {(SPONSORS.names as Record<string, string>)[id]}
              </span>
              <span className={NOTICE_TEXT}>
                {(SPONSORS.info.sponsors as Record<string, string>)[id]}
              </span>
            </span>
          </div>
        ))}
      </div>
    </TypedNotice>
  );
}
