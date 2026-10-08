'use client';

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
  const tones = {
    clip: 'border-sky-200/20 bg-slate-800/60 text-slate-200 hover:border-sky-200/45',
    round: 'border-amber-400/30 bg-amber-500/10 text-amber-200 hover:border-amber-300',
    cup: 'border-red-500/30 bg-red-500/10 text-red-300 hover:border-red-500/60 hover:text-red-200',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition disabled:cursor-not-allowed disabled:opacity-35 ${
        on ? 'ring-2 ring-white/40' : ''
      } ${tones[tone]}`}
    >
      {label}
    </button>
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
    <div className="flex min-h-9 flex-wrap items-center justify-center gap-2">
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
    </div>
  );
}
