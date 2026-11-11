'use client';

import CareerToggle from '@/components/games/career/CareerToggle';
import RoomPlank from '@/components/games/career-mp/RoomPlank';
import { GAMES_UI } from '@/data/games/locale';
import type { RoomView } from '@/lib/types/careerMp';
import { fmt } from '@/lib/utils/format';

const SK = GAMES_UI.careerMp.skip;

function voteButton(
  label: string,
  on: boolean,
  onClick: () => void,
  tone: 'clip' | 'round' | 'cup',
  disabled = false,
) {
  const tones = { clip: 'sky', round: 'amber', cup: 'red' } as const;
  return (
    <CareerToggle
      selected={on}
      tone={tones[tone]}
      onClick={onClick}
      disabled={disabled}
      className="min-h-11 w-full font-sign uppercase leading-tight tracking-[0.06em] sm:w-auto"
    >
      {label}
    </CareerToggle>
  );
}

// The three skips: one clip by majority, the rest of the round and the rest
// of the cup by every connected coach. Each shows its count. The fast
// forward stays in place and only greys out until a clip is running
export default function SkipVotes({
  view,
  showClip,
  onVoteClip,
  onVoteRound,
  onVoteCup,
}: {
  view: RoomView;
  showClip: boolean;
  onVoteClip: () => void;
  onVoteRound: (on: boolean) => void;
  onVoteCup: (on: boolean) => void;
}) {
  const connected = view.coaches.filter((c) => c.connected).map((c) => c.id);
  const total = Math.max(1, connected.length);
  const clipVotes =
    view.phase.kind === 'match-clip' ? view.phase.playback.skipVotes : [];
  const roundOn = view.skipVotes.round.includes(view.coachId);
  const cupOn = view.skipVotes.cup.includes(view.coachId);
  const count = (votes: string[]) =>
    votes.filter((id) => connected.includes(id)).length;
  const skipped =
    view.phase.kind === 'match-clip' &&
    view.phase.playback.skippedAt !== undefined;
  return (
    <RoomPlank className="grid w-full grid-cols-3 items-stretch gap-1.5 sm:flex sm:w-auto sm:items-center sm:justify-center">
      {voteButton(
        fmt(SK.clip, { votes: count(clipVotes), total }),
        clipVotes.includes(view.coachId),
        onVoteClip,
        'clip',
        !showClip || skipped,
      )}
      {voteButton(
        fmt(SK.round, { votes: count(view.skipVotes.round), total }),
        roundOn,
        () => onVoteRound(!roundOn),
        'round',
      )}
      {voteButton(
        fmt(SK.cup, { votes: count(view.skipVotes.cup), total }),
        cupOn,
        () => onVoteCup(!cupOn),
        'cup',
      )}
    </RoomPlank>
  );
}
