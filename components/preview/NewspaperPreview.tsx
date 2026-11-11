'use client';

import { useMemo, useState } from 'react';
import NewspaperSpread from '@/components/games/career/NewspaperSpread';
import PreviewTriggerButton from '@/components/preview/PreviewTriggerButton';
import { sampleArticles } from '@/components/preview/sampleArticles';
import type { DuelCharacter } from '@/data/games/glizzyDuel';

export default function NewspaperPreview({
  characters,
  characterBySlug,
}: {
  characters: DuelCharacter[];
  characterBySlug: Map<string, DuelCharacter>;
}) {
  const [newspaperKey, setNewspaperKey] = useState(0);
  const news = useMemo(() => sampleArticles(characters), [characters]);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <PreviewTriggerButton
          label="Replay the spin"
          onClick={() => setNewspaperKey(newspaperKey + 1)}
        />
      </div>
      <div className="flex justify-center">
        <NewspaperSpread
          key={newspaperKey}
          news={news}
          season={1}
          year={2}
          characterBySlug={characterBySlug}
          onDone={() => setNewspaperKey(newspaperKey + 1)}
        />
      </div>
    </>
  );
}
