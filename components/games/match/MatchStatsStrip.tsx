'use client';

import { useCareerFrames } from '@/components/games/career/careerFrames';
import MatchSkillItem from '@/components/games/match/MatchSkillItem';
import MatchStatFlag from '@/components/games/match/MatchStatFlag';
import MatchStatsHint from '@/components/games/match/MatchStatsHint';
import { GAMES_UI } from '@/data/games/locale';
import type { ScoutReveal } from '@/lib/utils/careerScouting';
import type { CharacterCareerState } from '@/lib/utils/careerSave';
import {
  MATCH_SKILL_ORDER,
  matchSkillLevels,
  matchStatFlags,
} from '@/lib/utils/matchStats';

const MS = GAMES_UI.career.matchStats;

function Divider({ street }: { street: boolean }) {
  return (
    <span
      className={`h-2.5 w-px ${street ? 'bg-[#7a6232]' : 'bg-sky-200/20'}`}
    />
  );
}

// What the seat says about the fighter sitting in it: the skills he built,
// then whatever his meters are shouting about tonight. An untrained skill
// fades out and an ordinary meter says nothing, so a plain competitor on a
// plain night barely marks the screen. Anything the coach has not paid to see
// is a question mark that says what would buy it
export default function MatchStatsStrip({
  ch,
  reveal,
  seat,
}: {
  ch: CharacterCareerState;
  reveal: ScoutReveal;
  // Which side of the table this strip sits on, so its hints open inward
  seat: 'top' | 'bottom';
}) {
  const street = useCareerFrames() === 'street';
  const levels = matchSkillLevels(ch);
  const flags = reveal.meters ? matchStatFlags(ch) : [];
  const placement = seat === 'top' ? 'down' : 'up';
  const readings = (
    <>
      {reveal.skills ? (
        <span className="flex items-center gap-1.5">
          {MATCH_SKILL_ORDER.map((skill) => (
            <MatchSkillItem key={skill} skill={skill} level={levels[skill]} />
          ))}
        </span>
      ) : (
        <MatchStatsHint text={MS.needSkills} placement={placement} />
      )}
      {reveal.skills && !reveal.meters && (
        <>
          <Divider street={street} />
          <MatchStatsHint text={MS.needMeters} placement={placement} />
        </>
      )}
      {flags.length > 0 && (
        <>
          <Divider street={street} />
          <span className="flex items-center gap-1">
            {flags.map((flag) => (
              <MatchStatFlag key={flag.id} flag={flag} />
            ))}
          </span>
        </>
      )}
    </>
  );
  if (street) {
    return (
      <span
        className="inline-flex rounded-[3px] bg-gradient-to-b from-[#e8c066] to-[#a8782a] p-[2px] shadow-[inset_0_1px_0_rgb(255_255_255/0.5),0_2px_0_rgb(2_6_23/0.65)]"
      >
        <span className="flex items-center gap-1.5 rounded-[2px] bg-[#140d07] px-2 py-1 shadow-[inset_0_1px_3px_rgb(0_0_0/0.9)]">
          {readings}
        </span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-sky-200/15 bg-slate-950/70 px-2 py-1 backdrop-blur-sm">
      {readings}
    </span>
  );
}
