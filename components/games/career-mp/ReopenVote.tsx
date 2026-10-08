'use client';

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
    <button
      onClick={() => onVote(!on)}
      className={`rounded-xl border px-6 py-2.5 text-sm font-semibold transition ${
        on
          ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-200'
          : 'border-red-500/40 bg-red-500/15 text-red-200 hover:border-red-500/60 hover:bg-red-500/25 hover:text-white'
      }`}
    >
      {fmt(F.reopen, { votes, total: Math.max(1, connected.length) })}
    </button>
  );
}
