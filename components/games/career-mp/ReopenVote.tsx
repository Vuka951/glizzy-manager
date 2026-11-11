'use client';

import CareerButton from '@/components/games/career/CareerButton';
import { GAMES_UI } from '@/data/games/locale';
import type { RoomView } from '@/lib/types/careerMp';
import { fmt } from '@/lib/utils/format';

const F = GAMES_UI.careerMp.finished;

// A majority of the connected room reopens it for endless play
export default function ReopenVote({
  view,
  onVote,
}: {
  view: RoomView;
  onVote: (on: boolean) => void;
}) {
  if (view.phase.kind !== 'finished') return null;
  const connected = view.coaches.filter((c) => c.connected).map((c) => c.id);
  const votes = view.phase.reopenVotes.filter((id) => connected.includes(id)).length;
  const on = view.phase.reopenVotes.includes(view.coachId);
  return (
    <CareerButton
      tone={on ? 'good' : 'danger'}
      size="lg"
      className="min-h-11"
      onClick={() => onVote(!on)}
    >
      {fmt(F.reopen, { votes, total: Math.max(1, connected.length) })}
    </CareerButton>
  );
}
