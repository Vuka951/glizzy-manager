'use client';

import { useState } from 'react';
import MatchViewer from '@/components/games/match/MatchViewer';
import PreviewTriggerButton from '@/components/preview/PreviewTriggerButton';
import { SPONSOR_IDS } from '@/data/games/careerSponsors';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import type { SponsorId } from '@/lib/utils/careerSave';
import type {
  CupMatchResult,
  CupTurn,
  MatchForfeitReason,
} from '@/lib/utils/tournamentSim';

const SPONSOR_NAMES = GAMES_UI.career.sponsors.names as Record<
  SponsorId,
  string
>;

type ViewerScenario = {
  id: string;
  label: string;
  result: CupMatchResult;
};

function turn(
  matchRound: number,
  seeker: 'a' | 'b',
  picked: CupTurn['picked'],
  hidden: CupTurn['hidden'],
): CupTurn {
  return { matchRound, seeker, picked, hidden, hit: picked === hidden };
}

function forfeitResult(
  reason: MatchForfeitReason,
  removedBy?: SponsorId,
): CupMatchResult {
  return {
    ...(removedBy ? { removedBy } : {}),
    turns: [turn(1, 'a', 'hat', 'sock'), turn(1, 'b', 'box', 'box')],
    livesA: 3,
    livesB: 2,
    winner: 'a',
    reason,
    events:
      reason === 'withdrawn' || reason === 'removed'
        ? []
        : [{ afterTurn: 1, side: 'b', kind: reason }],
    livesCapA: 3,
    livesCapB: 3,
  };
}

const VIEWER_SCENARIOS: ViewerScenario[] = [
  {
    id: 'normal',
    label: 'Regular match',
    result: {
      turns: [
        turn(1, 'a', 'hat', 'sock'),
        turn(1, 'b', 'box', 'box'),
        turn(2, 'a', 'sock', 'sock'),
        turn(2, 'b', 'hat', 'hat'),
        turn(3, 'a', 'box', 'hat'),
        turn(3, 'b', 'sock', 'sock'),
      ],
      livesA: 2,
      livesB: 0,
      winner: 'a',
      reason: null,
      livesCapA: 3,
      livesCapB: 3,
    },
  },
  {
    id: 'sniff',
    label: 'The nose on both sides',
    result: {
      // Three dodges: the top seat twice, the bottom seat once, each one a
      // turn where the nose caught the spot and the hand went elsewhere
      turns: [
        turn(1, 'a', 'hat', 'sock'),
        turn(1, 'b', 'box', 'hat'),
        turn(2, 'a', 'box', 'sock'),
        turn(2, 'b', 'sock', 'box'),
        turn(3, 'a', 'sock', 'sock'),
        turn(3, 'b', 'hat', 'hat'),
      ],
      events: [
        { afterTurn: 0, side: 'a', kind: 'sniff-dodge' },
        { afterTurn: 1, side: 'b', kind: 'sniff-dodge' },
        { afterTurn: 2, side: 'a', kind: 'sniff-dodge' },
        { afterTurn: 3, side: 'b', kind: 'sniff-dodge' },
      ],
      livesA: 2,
      livesB: 2,
      winner: 'a',
      reason: null,
      livesCapA: 3,
      livesCapB: 3,
    },
  },
  {
    id: 'tiebreak',
    label: 'Sudden death',
    // Level at the seek cap, so the sixth round is sudden death
    result: {
      turns: [
        turn(1, 'a', 'hat', 'sock'),
        turn(1, 'b', 'box', 'hat'),
        turn(2, 'a', 'sock', 'sock'),
        turn(2, 'b', 'hat', 'hat'),
        turn(3, 'a', 'box', 'hat'),
        turn(3, 'b', 'sock', 'box'),
        turn(4, 'a', 'hat', 'box'),
        turn(4, 'b', 'box', 'sock'),
        turn(5, 'a', 'sock', 'hat'),
        turn(5, 'b', 'hat', 'sock'),
        { ...turn(6, 'a', 'box', 'sock'), secondHidden: 'hat' },
        { ...turn(6, 'b', 'sock', 'sock'), secondHidden: 'box' },
      ],
      livesA: 2,
      livesB: 2,
      winner: 'a',
      reason: null,
      livesCapA: 3,
      livesCapB: 3,
    },
  },
  { id: 'meltdown', label: 'Meltdown', result: forfeitResult('meltdown') },
  { id: 'police', label: 'Police', result: forfeitResult('police') },
  {
    id: 'overfull-forfeit',
    label: 'Overfull',
    result: forfeitResult('overfull-forfeit'),
  },
  { id: 'withdrawn', label: 'Withdrawn', result: forfeitResult('withdrawn') },
  {
    id: 'removed',
    label: 'Removed (party)',
    result: forfeitResult('removed', 'red'),
  },
];

export default function MatchViewerPreview({
  a,
  b,
}: {
  a: DuelCharacter;
  b: DuelCharacter;
}) {
  const [viewer, setViewer] = useState<{ id: string; key: number } | null>(
    null,
  );
  const [matchSponsor, setMatchSponsor] = useState<SponsorId | null>('blue');
  const [opponentSponsor, setOpponentSponsor] = useState<SponsorId | null>(
    'green',
  );
  const viewerScenario = viewer
    ? VIEWER_SCENARIOS.find((s) => s.id === viewer.id)
    : null;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {VIEWER_SCENARIOS.map((scenario) => (
          <PreviewTriggerButton
            key={scenario.id}
            label={scenario.label}
            active={viewer?.id === scenario.id}
            onClick={() =>
              setViewer({ id: scenario.id, key: (viewer?.key ?? 0) + 1 })
            }
          />
        ))}
        {viewer && (
          <PreviewTriggerButton label="Hide" onClick={() => setViewer(null)} />
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Top player
        </span>
        <PreviewTriggerButton
          label="No sponsor"
          active={matchSponsor === null}
          onClick={() => setMatchSponsor(null)}
        />
        {SPONSOR_IDS.map((id) => (
          <PreviewTriggerButton
            key={id}
            label={SPONSOR_NAMES[id]}
            active={matchSponsor === id}
            onClick={() => setMatchSponsor(id)}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Bottom player
        </span>
        <PreviewTriggerButton
          label="No sponsor"
          active={opponentSponsor === null}
          onClick={() => setOpponentSponsor(null)}
        />
        {SPONSOR_IDS.map((id) => (
          <PreviewTriggerButton
            key={id}
            label={SPONSOR_NAMES[id]}
            active={opponentSponsor === id}
            onClick={() => setOpponentSponsor(id)}
          />
        ))}
      </div>
      {viewer && viewerScenario && (
        <MatchViewer
          key={`${viewer.id}-${viewer.key}`}
          a={a}
          b={b}
          result={viewerScenario.result}
          betSlug={a.slug}
          supportedSlug={a.slug}
          sponsorA={matchSponsor}
          sponsorB={opponentSponsor}
          onDone={() => setViewer(null)}
        />
      )}
    </>
  );
}
