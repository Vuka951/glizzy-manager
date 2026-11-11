'use client';

import { useState } from 'react';
import MatchEventOverlay from '@/components/games/match/MatchEventOverlay';
import PreviewTriggerButton from '@/components/preview/PreviewTriggerButton';
import type { MatchEventKind } from '@/lib/utils/tournamentSim';

const EVENT_KINDS: MatchEventKind[] = [
  'police',
  'removed',
  'meltdown',
  'overfull-forfeit',
  'binge-grab',
  'random-pick',
  'tiebreak',
];

export default function MatchEventPreview() {
  const [event, setEvent] = useState<{ kind: MatchEventKind; key: number }>({
    kind: 'meltdown',
    key: 0,
  });

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {EVENT_KINDS.map((kind) => (
          <PreviewTriggerButton
            key={kind}
            label={kind}
            active={event.kind === kind}
            onClick={() => setEvent({ kind, key: event.key + 1 })}
          />
        ))}
        <PreviewTriggerButton
          label="Replay"
          onClick={() => setEvent({ ...event, key: event.key + 1 })}
        />
      </div>
      <div className="relative h-32 overflow-hidden rounded-2xl border border-sky-200/10 bg-slate-950/70">
        <MatchEventOverlay key={event.key} kind={event.kind} />
      </div>
    </>
  );
}
