'use client';

import { useState } from 'react';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import TrainingScene from '@/components/games/career/TrainingScene';
import { SPONSOR_IDS } from '@/data/games/careerSponsors';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import { newCharacterState } from '@/lib/utils/careerMeters';
import type { SponsorId } from '@/lib/utils/careerSave';

const SEASONS = ['Zima', 'Proleće', 'Leto', 'Jesen'];
const SPONSOR_NAMES = GAMES_UI.career.sponsors.names as Record<SponsorId, string>;

export default function SponsorFlavorPreview({
  character,
}: {
  character: DuelCharacter;
}) {
  const [sponsorId, setSponsorId] = useState<SponsorId>('zidari');
  const [season, setSeason] = useState(0);
  const characterState = {
    ...newCharacterState(character.slug),
    stress: 10,
    sponsor: { sponsorId },
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {SPONSOR_IDS.map((id) => (
          <button
            key={id}
            onClick={() => setSponsorId(id)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              sponsorId === id
                ? 'border-amber-300/60 bg-amber-400/15 text-amber-100'
                : 'border-sky-200/20 bg-slate-800/60 text-slate-300 hover:border-sky-200/45 hover:text-white'
            }`}
          >
            <SponsorEmblem sponsorId={id} className="h-5 w-5" />
            {SPONSOR_NAMES[id]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {SEASONS.map((label, index) => (
          <button
            key={label}
            onClick={() => setSeason(index)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              season === index
                ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200'
                : 'border-sky-200/20 bg-slate-800/60 text-slate-300 hover:border-sky-200/45 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl border border-sky-200/10">
        <TrainingScene
          character={character}
          season={season}
          sponsorId={sponsorId}
          mood={characterState}
          className="h-80 sm:h-96"
        />
      </div>
    </div>
  );
}
