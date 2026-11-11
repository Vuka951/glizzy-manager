'use client';

import { useMemo } from 'react';
import FreezeframePreview from '@/components/preview/FreezeframePreview';
import MailboxPreview from '@/components/preview/MailboxPreview';
import NewspaperPreview from '@/components/preview/NewspaperPreview';
import PreviewSection from '@/components/preview/PreviewSection';
import { sampleCareer } from '@/components/preview/sampleCareer';
import { previewRoster } from '@/components/preview/previewRoster';

export default function NewspaperPreviewLab() {
  const characters = previewRoster();
  const characterBySlug = useMemo(
    () => new Map(characters.map((c) => [c.slug, c])),
    [characters],
  );
  const mail = useMemo(
    () =>
      sampleCareer({
        slugs: characters.map((c) => c.slug),
        phase: 'offseason',
        year: 3,
        season: 0,
      }).mail,
    [characters],
  );

  return (
    <div className="flex flex-col gap-5">
      <PreviewSection
        title="Newspaper"
        note="NewspaperSpread: a sample issue with every kind of article and picture."
      >
        <NewspaperPreview
          characters={characters}
          characterBySlug={characterBySlug}
        />
      </PreviewSection>

      <PreviewSection
        title="Newspaper pictures"
        note="FreezeframeGraphic: every scene that can land in the paper."
      >
        <FreezeframePreview characters={characters} />
      </PreviewSection>

      <PreviewSection
        title="Mail"
        note="CareerMailbox: one letter of each kind, including the poll, the donation, the election result, the favor, the tax, the refund, the interest and the Yellow Party's warning."
      >
        <MailboxPreview initialMail={mail} />
      </PreviewSection>
    </div>
  );
}
