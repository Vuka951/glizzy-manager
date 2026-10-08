'use client';

import { GAMES_UI } from '@/data/games/locale';

const CB = GAMES_UI.careerMp.coachBar;

// Done is a toggle: on says the coach is finished with the phase, off says
// there is more to do. It never undoes anything
export default function DoneToggle({
  done,
  label,
  busy = false,
  onToggle,
}: {
  done: boolean;
  label?: string;
  busy?: boolean;
  onToggle: (done: boolean) => void;
}) {
  return (
    <button
      onClick={() => onToggle(!done)}
      disabled={busy}
      className={`rounded-xl border px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition disabled:opacity-60 ${
        done
          ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-200 hover:border-emerald-300'
          : 'animate-pulse border-red-500/50 bg-red-500/15 text-red-200 hover:animate-none hover:border-red-400 hover:text-white'
      }`}
    >
      {done ? CB.undoDone : (label ?? CB.doneToggle)}
    </button>
  );
}
