'use client';

import { useState } from 'react';
import CareerCupPhase from '@/components/games/career/CareerCupPhase';
import PreviewTriggerButton from '@/components/preview/PreviewTriggerButton';
import { sampleCareer } from '@/components/preview/sampleCareer';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import type { SavedCareer } from '@/lib/utils/careerSave';

export default function PartyFavorCupPreview({
  characters,
  characterBySlug,
}: {
  characters: DuelCharacter[];
  characterBySlug: Map<string, DuelCharacter>;
}) {
  const [cupCareer, setCupCareer] = useState<SavedCareer | null>(null);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <PreviewTriggerButton
          label={cupCareer ? 'Again' : 'Show'}
          onClick={() =>
            setCupCareer(
              sampleCareer({
                slugs: characters.map((c) => c.slug),
                phase: 'cup',
                year: 3,
                season: 1,
              }),
            )
          }
        />
        {cupCareer && (
          <PreviewTriggerButton
            label="Hide"
            onClick={() => setCupCareer(null)}
          />
        )}
      </div>
      {cupCareer && (
        <div className="overflow-hidden rounded-2xl border border-sky-200/10">
          <CareerCupPhase
            career={cupCareer}
            characterBySlug={characterBySlug}
            topBar={null}
            onOpenTable={() => undefined}
            onUpdate={setCupCareer}
            onFinish={() => setCupCareer(null)}
          />
        </div>
      )}
    </>
  );
}
