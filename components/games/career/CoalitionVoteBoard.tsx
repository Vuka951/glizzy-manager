import CoalitionEmblems from '@/components/games/career/CoalitionEmblems';
import CoalitionVoterChip from '@/components/games/career/CoalitionVoterChip';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import {
  coalitionPartners,
  coalitionSeats,
  type CoalitionBallot,
} from '@/lib/utils/careerCoalition';
import { hasVoted } from '@/lib/utils/careerParliamentVote';
import type { SponsorId } from '@/lib/utils/careerSave';
import { STREET_TRAY } from '@/lib/utils/careerFrameClasses';

// The partner vote on the broadcast while it is open: the list's coaches
// sit along the top, lit once they have voted, and the viewer's own pick
// sits in its row. The picks of everyone else stay hidden until the close
export default function CoalitionVoteBoard({
  ballot,
  seats,
  characterBySlug,
  viewerSlug,
}: {
  ballot: CoalitionBallot;
  seats: Record<SponsorId, number>;
  characterBySlug: Map<string, DuelCharacter>;
  viewerSlug?: string;
}) {
  const shown = ballot.ballots.filter(
    (b) => b.slug === viewerSlug && b.choice !== null
  );
  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="flex flex-wrap items-center justify-center gap-1.5 pb-1">
        {ballot.ballots.map((b) => (
          <CoalitionVoterChip
            key={b.slug}
            ballot={b}
            character={characterBySlug.get(b.slug)}
            own={b.slug === viewerSlug}
            state={hasVoted(b) ? 'voted' : 'waiting'}
          />
        ))}
      </div>
      {ballot.options.map((key) => {
        const votes = shown.filter((b) => b.choice === key);
        return (
          <div
            key={key}
            className={`flex h-10 items-center gap-2 px-2 py-1 ${STREET_TRAY}`}
          >
            <CoalitionEmblems
              leader={ballot.leader}
              partners={coalitionPartners(key)}
              size="h-4 w-4"
              leaderSize="h-3 w-3"
            />
            <span className="w-6 shrink-0 font-sign text-[15px] font-bold tabular-nums text-slate-300">
              {coalitionSeats(seats, ballot.leader, key)}
            </span>
            <span className="flex min-w-0 flex-1 items-center -space-x-1.5 overflow-hidden py-0.5 pl-1">
              {votes.map((b) => (
                <CoalitionVoterChip
                  key={b.slug}
                  ballot={b}
                  character={characterBySlug.get(b.slug)}
                  own
                  className="animate-[podiumrise_0.45s_ease-out_both]"
                />
              ))}
            </span>
          </div>
        );
      })}
    </div>
  );
}
