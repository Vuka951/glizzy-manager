'use client';

import DoneToggle from '@/components/games/career-mp/DoneToggle';
import PhaseTimer from '@/components/games/career-mp/PhaseTimer';
import { GAMES_UI } from '@/data/games/locale';
import type { CoachPublic, RoomView } from '@/lib/types/careerMp';
import { fmt } from '@/lib/utils/format';

const CB = GAMES_UI.careerMp.coachBar;

function gateOf(view: RoomView): 'done' | 'passed' | null {
  switch (view.phase.kind) {
    case 'window':
    case 'paper':
    case 'cup-pre':
    case 'season-end':
      return 'done';
    case 'match-bets':
      return 'passed';
    default:
      return null;
  }
}

// The room's gate in one line: how many coaches are done, the countdown and
// the coach's own Done toggle. Who exactly is done sits in the tooltip; the
// coaches themselves live in the league table
export default function CoachBar({
  view,
  serverOffset,
  busy,
  onDone,
}: {
  view: RoomView;
  serverOffset: number;
  busy: boolean;
  onDone: (done: boolean) => void;
}) {
  const gate = gateOf(view);
  const flagOf = (c: CoachPublic) => (gate === 'passed' ? c.passed : c.done);
  const done = gate ? view.coaches.filter(flagOf) : [];
  const missing = gate ? view.coaches.filter((c) => !flagOf(c)) : [];
  const me = view.coaches.find((c) => c.id === view.coachId);
  const deadline = 'deadline' in view.phase ? view.phase.deadline : null;
  if (!gate && deadline === null) return null;
  const names = (list: CoachPublic[]) =>
    list.length > 0 ? list.map((c) => c.name).join(', ') : CB.nobody;
  const tooltip = `${fmt(CB.doneNames, { names: names(done) })}\n${fmt(CB.waitingNames, { names: names(missing) })}`;
  return (
    <div className="flex max-w-full flex-wrap items-center justify-center gap-2">
      {gate && (
        <span
          title={tooltip}
          className="cursor-help rounded-full border border-sky-200/20 bg-slate-950/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-sky-200 backdrop-blur-sm"
        >
          {fmt(CB.done, { done: done.length, total: view.coaches.length })}
        </span>
      )}
      <PhaseTimer deadline={deadline} serverOffset={serverOffset} />
      {gate === 'done' && me && (
        <span title={tooltip}>
          <DoneToggle done={me.done} busy={busy} onToggle={onDone} />
        </span>
      )}
    </div>
  );
}
