'use client';

import { useMemo } from 'react';
import CareerTable from '@/components/games/career/CareerTable';
import AchievementToastPreview from '@/components/preview/AchievementToastPreview';
import CalendarResultPreview from '@/components/preview/CalendarResultPreview';
import CampaignEndPreview from '@/components/preview/CampaignEndPreview';
import CareerIntroPreview from '@/components/preview/CareerIntroPreview';
import LawCatalogPreview from '@/components/preview/LawCatalogPreview';
import OverlordPreview from '@/components/preview/OverlordPreview';
import PreviewSection from '@/components/preview/PreviewSection';
import RivalChoicePreview from '@/components/preview/RivalChoicePreview';
import SponsorTermsPreview from '@/components/preview/SponsorTermsPreview';
import WalletCreditPreview from '@/components/preview/WalletCreditPreview';
import { previewLead, previewRoster } from '@/components/preview/previewRoster';
import { sampleCareer } from '@/components/preview/sampleCareer';
import { primeMinister } from '@/lib/utils/careerLaws';

export default function CareerPreviewLab() {
  const characters = previewRoster();
  const characterBySlug = useMemo(
    () => new Map(characters.map((c) => [c.slug, c])),
    [characters],
  );
  const character = previewLead(characters);
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
        title="Intro scene"
        note="CareerIntroCutscene: the paper that spins in at the start of a career."
      >
        <CareerIntroPreview />
      </PreviewSection>

      <PreviewSection
        title="Rival choice"
        note="RivalChoiceDialog: the press conference and the call-out from the table."
      >
        <RivalChoicePreview
          characters={characters}
          characterBySlug={characterBySlug}
          player={character}
        />
      </PreviewSection>

      <PreviewSection
        title="Career table"
        note="CareerTable: the league table with sponsors and the rival, without party colors."
      >
        <CareerTable
          characters={career.characters}
          characterBySlug={characterBySlug}
          playerSlug={career.playerSlug}
          lastCupRanks={career.lastCupRanks}
          rivalSlug={career.rivalSlug}
          primeMinisterSlug={primeMinister(career)}
        />
      </PreviewSection>

      <PreviewSection
        title="Wallet and counter"
        note="CareerWalletChip and TownBankOffice: the account for everyone, Yellow Party credit by party standing, repayment and deadlines in debt."
      >
        <WalletCreditPreview career={career} />
      </PreviewSection>

      <PreviewSection
        title="Sponsor terms"
        note="CharacterDossier with the Yellow Party contract and SponsorInfoPanel with every sponsor's terms."
      >
        <SponsorTermsPreview character={character} />
      </PreviewSection>

      <PreviewSection
        title="Every law"
        note="LawCardOption for every law: the text with real numbers, who it applies to and the area."
      >
        <LawCatalogPreview />
      </PreviewSection>

      <PreviewSection
        title="Calendar results"
        note="Every placing mark shown after a finished cup."
      >
        <CalendarResultPreview />
      </PreviewSection>

      <PreviewSection
        title="Glizzy Overlord"
        note="OverlordCelebration: the celebration for the first character to collect the points for the crown."
      >
        <OverlordPreview character={character} />
      </PreviewSection>

      <PreviewSection
        title="Campaign end"
        note="OverlordCelebration, then the campaign report on a click: the single-player version and the room version (Glizzy Rivals)."
      >
        <CampaignEndPreview characters={characters} />
      </PreviewSection>

      <PreviewSection
        title="Achievements"
        note="Every achievement on a click, without unlocking it."
      >
        <AchievementToastPreview />
      </PreviewSection>
    </div>
  );
}
