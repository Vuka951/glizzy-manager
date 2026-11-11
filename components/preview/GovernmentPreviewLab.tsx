'use client';

import { useMemo } from 'react';
import GovernmentEffectsInfoPanel from '@/components/games/career/GovernmentEffectsInfoPanel';
import ParliamentPanel from '@/components/games/career/ParliamentPanel';
import CoalitionVotePreview from '@/components/preview/CoalitionVotePreview';
import ElectionCalendarPreview from '@/components/preview/ElectionCalendarPreview';
import ElectionNewsPreview from '@/components/preview/ElectionNewsPreview';
import PartyFavorCupPreview from '@/components/preview/PartyFavorCupPreview';
import PreviewSection from '@/components/preview/PreviewSection';
import { previewRoster } from '@/components/preview/previewRoster';
import { sampleCareer } from '@/components/preview/sampleCareer';

export default function GovernmentPreviewLab() {
  const characters = previewRoster();
  const characterBySlug = useMemo(
    () => new Map(characters.map((c) => [c.slug, c])),
    [characters],
  );
  const career = useMemo(
    () =>
      sampleCareer({
        slugs: characters.map((c) => c.slug),
        phase: 'offseason',
        year: 3,
        season: 0,
      }),
    [characters],
  );

  return (
    <div className="flex flex-col gap-5">
      <PreviewSection
        title="Election news"
        note="NewspaperSpread with town news only: the election year, the poll, the result, the glizzy price and party favors, each with its own picture."
      >
        <ElectionNewsPreview
          characters={characters}
          characterBySlug={characterBySlug}
        />
      </PreviewSection>

      <PreviewSection
        title="Coalition vote"
        note="With no majority the coaches on the winning list pick a partner: a ballot with every majority coalition, coaches dropping their ballots into the box one by one, the government formed and the Gazette headline. Three modes: the player votes, the player only watches, a room of three with a clock. The Count only button plays just the ballot box scene."
      >
        <CoalitionVotePreview characterBySlug={characterBySlug} />
      </PreviewSection>

      <PreviewSection
        title="Assembly in the career"
        note="ParliamentPanel, both tabs side by side: the assembly with a Red and Blue government and the pre-election poll, then popularity with the till, scandals, the rating and the rating chart. Below, the info panel with the effects of each party in power."
      >
        <div className="mx-auto grid w-full max-w-3xl gap-6 sm:grid-cols-2">
          <ParliamentPanel career={career} characterBySlug={characterBySlug} />
          <ParliamentPanel
            career={career}
            characterBySlug={characterBySlug}
            initialTab="popularity"
          />
        </div>
        <div className="mx-auto w-full max-w-sm">
          <GovernmentEffectsInfoPanel
            leader={career.parliament?.government[0] ?? null}
          />
        </div>
      </PreviewSection>

      <PreviewSection
        title="Calendar with elections"
        note="YearCalendar: the ELECTIONS mark on the election year's last cup (years 2 and 4). Below, the town Bank with the glizzy rate on its light strip and the panel it opens."
      >
        <ElectionCalendarPreview career={career} />
      </PreviewSection>

      <PreviewSection
        title="Cup with a party favor"
        note="CareerCupPhase live: the player donates to the leading party, so there is a Call the party button before the match. Play or watch the matches, the AI uses favors too."
      >
        <PartyFavorCupPreview
          characters={characters}
          characterBySlug={characterBySlug}
        />
      </PreviewSection>
    </div>
  );
}
