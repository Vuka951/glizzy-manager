'use client';

import { useEffect, useMemo, useState } from 'react';
import SabotageHitCutscene from '@/components/games/career/SabotageHitCutscene';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import {
  SABOTAGE_HIT_SCENE_BY_NEWS,
  type SabotageHitSceneId,
} from '@/lib/constants/careerScenes';
import type { NewsItem } from '@/lib/utils/careerSave';
import { sabotageHitsAgainst } from '@/lib/utils/careerSabotage';

// Every story the paper printed about your own man, one scene after
// another, before the issue itself opens. Nothing to show hands straight
// back to the paper
export default function SabotageHitReel({
  news,
  slug,
  character,
  season,
  onDone,
}: {
  news: NewsItem[];
  slug: string;
  character: DuelCharacter;
  season: number;
  onDone: () => void;
}) {
  const hits = useMemo(
    () =>
      sabotageHitsAgainst(news, slug)
        .map((item) => ({
          item,
          scene: SABOTAGE_HIT_SCENE_BY_NEWS[item.templateKey] as
            SabotageHitSceneId | undefined,
        }))
        .filter(
          (hit): hit is { item: NewsItem; scene: SabotageHitSceneId } =>
            hit.scene !== undefined,
        ),
    [news, slug],
  );
  const [index, setIndex] = useState(0);
  const finished = index >= hits.length;

  useEffect(() => {
    if (finished) onDone();
  }, [finished, onDone]);

  if (finished) return null;
  const hit = hits[index];
  return (
    <SabotageHitCutscene
      key={`${hit.item.templateKey}-${index}`}
      item={hit.item}
      scene={hit.scene}
      character={character}
      season={season}
      counter={{ n: index + 1, total: hits.length }}
      onClose={() => setIndex(index + 1)}
    />
  );
}
