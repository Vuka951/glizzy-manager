'use client';

import { useState } from 'react';
import MatchExitScene from '@/components/games/match/MatchExitScene';
import PreviewTriggerButton from '@/components/preview/PreviewTriggerButton';
import { SPONSOR_IDS } from '@/data/games/careerSponsors';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import type { SponsorId } from '@/lib/utils/careerSave';
import type { MatchForfeitReason } from '@/lib/utils/tournamentSim';

const SPONSOR_NAMES = GAMES_UI.career.sponsors.names as Record<
  SponsorId,
  string
>;

const EXIT_REASONS: { reason: MatchForfeitReason; label: string }[] = [
  { reason: 'meltdown', label: 'Meltdown' },
  { reason: 'police', label: 'Police' },
  { reason: 'overfull-forfeit', label: 'Overfull' },
  { reason: 'withdrawn', label: 'Withdrawn' },
  { reason: 'removed', label: 'Removed (party)' },
];

export default function MatchExitPreview({ loser }: { loser: DuelCharacter }) {
  const [exit, setExit] = useState<{
    reason: MatchForfeitReason;
    side: 'top' | 'bottom';
    key: number;
  }>({ reason: 'meltdown', side: 'bottom', key: 0 });
  const [exitParty, setExitParty] = useState<SponsorId>('red');

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {EXIT_REASONS.map(({ reason, label }) =>
          (['top', 'bottom'] as const).map((side) => (
            <PreviewTriggerButton
              key={`${reason}-${side}`}
              label={`${label} · ${side === 'top' ? 'top' : 'bottom'}`}
              active={exit.reason === reason && exit.side === side}
              onClick={() => setExit({ reason, side, key: exit.key + 1 })}
            />
          )),
        )}
        <PreviewTriggerButton
          label="Replay"
          onClick={() => setExit({ ...exit, key: exit.key + 1 })}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Who removes
        </span>
        {SPONSOR_IDS.map((id) => (
          <PreviewTriggerButton
            key={id}
            label={SPONSOR_NAMES[id]}
            active={exitParty === id}
            onClick={() => {
              setExitParty(id);
              setExit({
                reason: 'removed',
                side: exit.side,
                key: exit.key + 1,
              });
            }}
          />
        ))}
      </div>
      <div className="relative h-48 overflow-hidden rounded-2xl border border-sky-200/10 bg-slate-950/70">
        <MatchExitScene
          key={exit.key}
          reason={exit.reason}
          loser={loser}
          side={exit.side}
          party={exitParty}
          walkOff={
            exit.reason === 'meltdown' ||
            exit.reason === 'police' ||
            exit.reason === 'removed'
          }
        />
      </div>
    </>
  );
}
