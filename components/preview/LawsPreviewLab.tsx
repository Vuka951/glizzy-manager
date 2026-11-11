'use client';

import { useMemo } from 'react';
import LawVotePreview from '@/components/preview/LawVotePreview';
import PreviewSection from '@/components/preview/PreviewSection';
import { previewRoster } from '@/components/preview/previewRoster';

export default function LawsPreviewLab() {
  const characters = previewRoster();
  const characterBySlug = useMemo(
    () => new Map(characters.map((c) => [c.slug, c])),
    [characters],
  );

  return (
    <div className="flex flex-col gap-5">
      <PreviewSection
        title="Laws"
        note="The ballot of proposed laws (you pick, someone else picks, a room with a clock), the assembly vote for every outcome (passed, rejected, repealed, passed while repealing another law, a room of two), the Laws in force panel full and empty, letters from the assembly and the per-law tally, and the Gazette with the vote news."
      >
        <LawVotePreview characterBySlug={characterBySlug} />
      </PreviewSection>
    </div>
  );
}
