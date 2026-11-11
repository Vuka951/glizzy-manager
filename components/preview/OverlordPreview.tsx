'use client';

import { useState } from 'react';
import OverlordCelebration from '@/components/games/career/OverlordCelebration';
import PreviewTriggerButton from '@/components/preview/PreviewTriggerButton';
import { OVERLORD_POINTS } from '@/data/games/careerEconomy';
import type { DuelCharacter } from '@/data/games/glizzyDuel';

export default function OverlordPreview({
  character,
}: {
  character: DuelCharacter;
}) {
  const [overlordKey, setOverlordKey] = useState(0);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <PreviewTriggerButton
          label="Replay"
          onClick={() => setOverlordKey(overlordKey + 1)}
        />
      </div>
      <div className="flex justify-center">
        <OverlordCelebration
          key={overlordKey}
          character={character}
          player={character}
          playerPlace={1}
          points={OVERLORD_POINTS}
          onContinue={() => setOverlordKey(overlordKey + 1)}
        />
      </div>
    </>
  );
}
