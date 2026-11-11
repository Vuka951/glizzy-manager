'use client';

import { useState } from 'react';
import RivalChoiceDialog from '@/components/games/career/RivalChoiceDialog';
import PreviewTriggerButton from '@/components/preview/PreviewTriggerButton';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import type { RivalCandidate } from '@/lib/utils/careerSave';

export default function RivalChoicePreview({
  characters,
  characterBySlug,
  player,
}: {
  characters: DuelCharacter[];
  characterBySlug: Map<string, DuelCharacter>;
  player: DuelCharacter;
}) {
  const [rivalKey, setRivalKey] = useState(0);
  const [showRival, setShowRival] = useState(false);
  const pick = (i: number) => characters[i % characters.length];
  const rivalShortlist: RivalCandidate[] = [
    { slug: pick(1).slug, reason: 'eliminated' },
    { slug: pick(2).slug, reason: 'sabotage' },
    { slug: pick(3).slug, reason: 'champion' },
  ];

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <PreviewTriggerButton
          label={showRival ? 'Replay' : 'Show'}
          onClick={() => {
            setShowRival(true);
            setRivalKey(rivalKey + 1);
          }}
        />
        {showRival && (
          <PreviewTriggerButton
            label="Hide"
            onClick={() => setShowRival(false)}
          />
        )}
      </div>
      {showRival && (
        <RivalChoiceDialog
          key={rivalKey}
          candidates={rivalShortlist}
          characterBySlug={characterBySlug}
          player={player}
          onChoose={() => setShowRival(false)}
        />
      )}
    </>
  );
}
