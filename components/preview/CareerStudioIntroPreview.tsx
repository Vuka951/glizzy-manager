'use client';

import { useMemo, useState } from 'react';
import BroadcastOpenPanel from '@/components/games/career/BroadcastOpenPanel';
import PreviewTriggerButton from '@/components/preview/PreviewTriggerButton';
import { sampleCareer } from '@/components/preview/sampleCareer';
import { SEASON_COUNT } from '@/data/games/careerSeasons';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { seasonName } from '@/lib/utils/localeNames';

// Four shapes of form: a losing run, a winning run, and two mixed bags
const SAMPLE_RUNS: ('w' | 'l')[][] = [
  ['w', 'w', 'l', 'l', 'l'],
  ['l', 'w', 'w', 'w', 'w'],
  ['w', 'l', 'w', 'l', 'w'],
  ['l', 'l', 'w', 'w', 'l'],
];

export default function CareerStudioIntroPreview({
  characters,
  characterBySlug,
}: {
  characters: DuelCharacter[];
  characterBySlug: Map<string, DuelCharacter>;
}) {
  const [openSeason, setOpenSeason] = useState(1);
  const [openYear, setOpenYear] = useState(3);
  const [openKey, setOpenKey] = useState(0);
  const [showOpen, setShowOpen] = useState(false);
  // Recent results and edition records so the streaks and season cards have
  // something to show
  const openCareer = useMemo(() => {
    const base = sampleCareer({
      slugs: characters.map((c) => c.slug),
      phase: 'cup',
      year: openYear,
      season: openSeason,
    });
    const states = Object.fromEntries(
      Object.entries(base.characters).map(([slug, ch], i) => [
        slug,
        {
          ...ch,
          recentResults: SAMPLE_RUNS[i % SAMPLE_RUNS.length],
          editionRecord: {
            [openSeason]: [3 + (i % 5), 1 + (i % 3)] as [number, number],
          },
        },
      ]),
    );
    return { ...base, characters: states };
  }, [characters, openYear, openSeason]);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: SEASON_COUNT }, (_, season) => (
          <PreviewTriggerButton
            key={season}
            label={seasonName(season)}
            active={openSeason === season}
            onClick={() => setOpenSeason(season)}
          />
        ))}
        <PreviewTriggerButton
          label={`Year ${openYear}: new forecast`}
          onClick={() => setOpenYear((y) => y + 1)}
        />
        <PreviewTriggerButton
          label="Show"
          onClick={() => {
            setOpenKey((k) => k + 1);
            setShowOpen(true);
          }}
        />
      </div>
      {showOpen && (
        <BroadcastOpenPanel
          key={openKey}
          career={openCareer}
          characterBySlug={characterBySlug}
          preview
        />
      )}
    </>
  );
}
