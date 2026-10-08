import PortraitHead from '@/components/games/PortraitHead';
import CrowdTokenEffect, {
  effectVariant,
} from '@/components/games/career-mp/CrowdTokenEffect';
import { CAREER_BET_STAKES } from '@/data/games/careerEconomy';
import { COACH_COLOR_CLASSES } from '@/lib/constants/careerMp';
import type { CrowdTokenData } from '@/lib/types/careerMp';

// How much a coach moves in the stand: one step per rung of the stake
// ladder, from a nod at the smallest stake to bouncing all over at the top
const STAKE_MOTION = [
  'animate-[fanbob_2.6s_ease-in-out_infinite]',
  'animate-[fanhop_1.8s_ease-in-out_infinite]',
  'animate-[fanjump_1.2s_ease-in-out_infinite]',
  'animate-[fanwild_0.9s_ease-in-out_infinite]',
];

function motionFor(token: CrowdTokenData): string {
  if (token.outcome === 'won')
    return 'animate-[fancheer_0.7s_ease-in-out_infinite]';
  if (token.outcome === 'lost')
    return 'animate-[fansulk_2.8s_ease-in-out_infinite]';
  const rung = CAREER_BET_STAKES.findIndex((s) => token.stake <= s);
  return STAKE_MOTION[rung < 0 ? STAKE_MOTION.length - 1 : rung];
}

// A coach sitting down in the stand he backed: his character's face in his
// color, the name and the stake under it. He jumps by his stake, and once
// the result is in he throws confetti or sheds tears
export default function CrowdToken({
  token,
  still = false,
}: {
  token: CrowdTokenData;
  // On the pre-match card the coach only sits; the jumping is for the stands
  still?: boolean;
}) {
  const classes = COACH_COLOR_CLASSES[token.color];
  return (
    <span
      data-crowd-token={token.outcome ?? 'live'}
      className={`relative flex w-10 flex-col items-center gap-0.5 ${still ? '' : motionFor(token)}`}
    >
      <PortraitHead
        character={token.character}
        className={`h-6 w-6 ring-2 ${classes.ring} ${
          token.outcome === 'lost' ? 'grayscale' : ''
        }`}
      />
      {token.outcome && !still && (
        <CrowdTokenEffect
          outcome={token.outcome}
          variant={effectVariant(token.coachId)}
        />
      )}
      <span
        className={`max-w-full truncate text-[7px] font-bold uppercase leading-none tracking-wider ${classes.text}`}
      >
        {token.name}
      </span>
      {token.stake > 0 && (
        <span className="font-mono text-[7px] font-bold leading-none text-amber-300">
          {token.stake}
        </span>
      )}
    </span>
  );
}
