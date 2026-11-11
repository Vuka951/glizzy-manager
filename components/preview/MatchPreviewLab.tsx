'use client';

import BracketBetsPreview from '@/components/preview/BracketBetsPreview';
import BracketEndingsPreview from '@/components/preview/BracketEndingsPreview';
import MatchEventPreview from '@/components/preview/MatchEventPreview';
import MatchExitPreview from '@/components/preview/MatchExitPreview';
import MatchStatsPreview from '@/components/preview/MatchStatsPreview';
import MatchViewerPreview from '@/components/preview/MatchViewerPreview';
import PreviewSection from '@/components/preview/PreviewSection';
import SniffPreview from '@/components/preview/SniffPreview';
import { previewLead, previewRoster } from '@/components/preview/previewRoster';

export default function MatchPreviewLab() {
  const characters = previewRoster();
  const charA = previewLead(characters);
  const charB = characters.find((c) => c.slug !== charA.slug) ?? charA;

  return (
    <div className="flex flex-col gap-5">
      <PreviewSection
        title="Full match"
        note="MatchViewer with the crowd, random banners and sponsor fans."
      >
        <MatchViewerPreview a={charA} b={charB} />
      </PreviewSection>

      <MatchStatsPreview />

      <PreviewSection
        title="Events during the match"
        note="MatchEventOverlay: comic interruptions over the table."
      >
        <MatchEventPreview />
      </PreviewSection>

      <PreviewSection
        title="The nose at the match"
        note="SniffCue: the Super Sniffer smells the glizzy and keeps the hand off that box."
      >
        <SniffPreview />
      </PreviewSection>

      <PreviewSection
        title="Exit scene after the match"
        note="MatchExitScene: the stretcher, the arrest, the puke and the white flag, top or bottom."
      >
        <MatchExitPreview loser={charB} />
      </PreviewSection>

      <PreviewSection
        title="Match end in the bracket"
        note="A whole cup played in advance, with every way a match can end other than a plain win."
      >
        <BracketEndingsPreview />
      </PreviewSection>

      <PreviewSection
        title="Bets at the cup"
        note="CupBetBoard over the bracket: betting open in the round of 16, two played matches with a won and a lost bet."
      >
        <BracketBetsPreview characters={characters} />
      </PreviewSection>

    </div>
  );
}
