'use client';

import MatchTablePreview from '@/components/preview/MatchTablePreview';
import PreviewSection from '@/components/preview/PreviewSection';
import TownBuildingStatesPreview from '@/components/preview/TownBuildingStatesPreview';
import TownEditionsPreview from '@/components/preview/TownEditionsPreview';
import TownFlowPreview from '@/components/preview/TownFlowPreview';
import TownInvestmentLevelsPreview from '@/components/preview/TownInvestmentLevelsPreview';
import TownKioskPreview from '@/components/preview/TownKioskPreview';
import TownPanelsPreview from '@/components/preview/TownPanelsPreview';
import TownWalkersPreview from '@/components/preview/TownWalkersPreview';
import { previewRoster } from '@/components/preview/previewRoster';

export default function TownPreviewLab() {
  const characters = previewRoster();
  return (
    <div className="flex flex-col gap-5">
      <PreviewSection title="Editions">
        <TownEditionsPreview />
      </PreviewSection>
      <PreviewSection title="Buildings">
        <TownBuildingStatesPreview characters={characters} />
      </PreviewSection>
      <PreviewSection title="Investments">
        <TownInvestmentLevelsPreview />
      </PreviewSection>
      <PreviewSection title="Town">
        <TownFlowPreview characters={characters} />
      </PreviewSection>
      <PreviewSection title="Walkers">
        <TownWalkersPreview characters={characters} />
      </PreviewSection>
      <PreviewSection title="Kiosk">
        <TownKioskPreview characters={characters} />
      </PreviewSection>
      <PreviewSection title="Panels">
        <TownPanelsPreview characters={characters} />
      </PreviewSection>
      <PreviewSection title="Table">
        <MatchTablePreview characters={characters} />
      </PreviewSection>
    </div>
  );
}
