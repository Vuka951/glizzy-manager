'use client';

import { useMemo } from 'react';
import ActionScenePreview from '@/components/preview/ActionScenePreview';
import PreviewSection from '@/components/preview/PreviewSection';
import QuoteScenePreview from '@/components/preview/QuoteScenePreview';
import SabotageHitPreview from '@/components/preview/SabotageHitPreview';
import { previewLead, previewRoster } from '@/components/preview/previewRoster';

export default function ScenesPreviewLab() {
  const characters = previewRoster();
  const characterBySlug = useMemo(
    () => new Map(characters.map((c) => [c.slug, c])),
    [characters],
  );
  const character = previewLead(characters);

  return (
    <div className="flex flex-col gap-5">
      <PreviewSection
        title="Monthly activity scenes"
        note="ActionCutscene: a short scene for every training, rest, media, security, investment and sabotage. Full window opens the real modal with the receipt."
      >
        <ActionScenePreview character={character} />
      </PreviewSection>

      <PreviewSection
        title="Sabotage against you"
        note="SabotageHitReel: before the paper opens, one scene for every story about a hit on your character. Full window opens the modal with the receipt, the full reel plays three in a row."
      >
        <SabotageHitPreview character={character} />
      </PreviewSection>

      <PreviewSection
        title="Quote scenes"
        note="QuoteCutscene: a character's line after a cup event. Full window plays the clip and the caption as in the game."
      >
        <QuoteScenePreview characterBySlug={characterBySlug} />
      </PreviewSection>
    </div>
  );
}
