'use client';

import { useMemo, useState } from 'react';
import NewspaperSpread from '@/components/games/career/NewspaperSpread';
import { sampleArticles } from '@/components/preview/sampleArticles';
import type { DuelCharacter } from '@/data/games/glizzyDuel';

export default function ElectionNewsPreview({
  characters,
  characterBySlug,
}: {
  characters: DuelCharacter[];
  characterBySlug: Map<string, DuelCharacter>;
}) {
  const [newspaperKey, setNewspaperKey] = useState(0);
  const news = useMemo(
    () =>
      sampleArticles(characters).filter(
        (item) =>
          item.templateKey.startsWith('election') ||
          item.templateKey.startsWith('glizi-price') ||
          item.templateKey.startsWith('removal-'),
      ),
    [characters],
  );

  return (
    <div className="flex justify-center">
      <NewspaperSpread
        key={newspaperKey}
        news={news}
        season={0}
        year={3}
        characterBySlug={characterBySlug}
        onDone={() => setNewspaperKey(newspaperKey + 1)}
      />
    </div>
  );
}
