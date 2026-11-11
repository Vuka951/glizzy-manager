'use client';

import MoodActivityPreview from '@/components/preview/MoodActivityPreview';
import MoodPreviewGrid from '@/components/preview/MoodPreviewGrid';
import PreviewSection from '@/components/preview/PreviewSection';
import SeasonBackdropPreview from '@/components/preview/SeasonBackdropPreview';
import { previewLead, previewRoster } from '@/components/preview/previewRoster';

export default function CharactersPreviewLab() {
  const characters = previewRoster();
  const character = previewLead(characters);

  return (
    <div className="flex flex-col gap-5">
      <PreviewSection
        title="Mood bubbles"
        note="Every reaction to cholesterol, appetite, ambition, ego and fame, with the values that trigger them."
      >
        <MoodPreviewGrid character={character} />
      </PreviewSection>

      <PreviewSection
        title="Mood and sponsor in town"
        note="The real transfer window town: the character walks to the spot of their mood and repeats the pose there, and the sponsor dresses them and hangs flags on the square. The other town states are on /preview/town."
      >
        <MoodActivityPreview characters={characters} character={character} />
      </PreviewSection>

      <PreviewSection
        title="Seasons"
        note="Living backdrops, atmospheric light and seasonal details."
      >
        <SeasonBackdropPreview />
      </PreviewSection>
    </div>
  );
}
