'use client';

import { useMemo, useState } from 'react';
import OverlordCelebration from '@/components/games/career/OverlordCelebration';
import FinalReportPreview from '@/components/preview/FinalReportPreview';
import PreviewTriggerButton from '@/components/preview/PreviewTriggerButton';
import { previewLead } from '@/components/preview/previewRoster';
import { sampleFinishedCareer } from '@/components/preview/sampleCareer';
import { OVERLORD_POINTS } from '@/data/games/careerEconomy';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { rankBySeeding } from '@/lib/utils/careerPoints';

export default function CampaignEndPreview({
  characters,
}: {
  characters: DuelCharacter[];
}) {
  const [reportWinner, setReportWinner] = useState<'ai' | 'player'>('ai');
  const slugs = useMemo(() => characters.map((c) => c.slug), [characters]);
  const finishedCareer = useMemo(
    () => sampleFinishedCareer(slugs, reportWinner === 'ai' ? slugs[1] : slugs[0]),
    [slugs, reportWinner],
  );
  const fallback = previewLead(characters);
  const finishedOverlord =
    characters.find((c) => c.slug === finishedCareer.overlordSlug) ?? fallback;
  const finishedPlayer =
    characters.find((c) => c.slug === finishedCareer.playerSlug) ?? fallback;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <PreviewTriggerButton
          label="Crown to an AI character"
          active={reportWinner === 'ai'}
          onClick={() => setReportWinner('ai')}
        />
        <PreviewTriggerButton
          label="Crown to the player"
          active={reportWinner === 'player'}
          onClick={() => setReportWinner('player')}
        />
      </div>
      <div className="flex justify-center">
        <OverlordCelebration
          key={reportWinner}
          character={finishedOverlord}
          player={finishedPlayer}
          playerPlace={
            rankBySeeding(
              finishedCareer.characters,
              finishedCareer.playerSlug,
            ).indexOf(finishedCareer.playerSlug) + 1
          }
          points={OVERLORD_POINTS}
          onContinue={() => undefined}
        />
      </div>
      <FinalReportPreview career={finishedCareer} characters={characters} />
    </>
  );
}
