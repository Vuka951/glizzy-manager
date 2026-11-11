'use client';

import CareerButton from '@/components/games/career/CareerButton';
import { GAMES_UI } from '@/data/games/locale';

const D = GAMES_UI.rooms.done;

// Done is a toggle: on says the seat is finished with the phase, off says
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
    <CareerButton
      tone={done ? 'good' : 'danger'}
      onClick={() => onToggle(!done)}
      disabled={busy}
      className={`min-h-11 ${done ? '' : 'motion-safe:animate-pulse hover:animate-none'}`}
    >
      {done ? D.undo : (label ?? D.toggle)}
    </CareerButton>
  );
}
