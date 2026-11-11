'use client';

import { useMemo, useState } from 'react';
import CreatureAvatar from '@/components/games/CreatureAvatar';
import PortraitHead from '@/components/games/PortraitHead';
import CreatureTraitCard, {
  creatureTraits,
} from '@/components/preview/CreatureTraitCard';
import PreviewSection from '@/components/preview/PreviewSection';
import { CREATURE_SPECIES } from '@/lib/constants/creatures/creatureSpecies';
import { creatureNameForSpecies } from '@/lib/utils/creatureAvatar';

// Sample names, places and job titles, to see what a crowd of players
// lands on
const GALLERY = [
  'Brumko',
  'Tavi',
  'Lorna',
  'Pelko',
  'Mirta',
  'Zubo',
  'Pčinja',
  'Tax Inspector',
  'Leskovac',
  'Gorvin',
  'Nela',
  'Ostin',
  'Bibo',
  'Grandpa Ferdo',
  'Kalu',
  'Bruno Grom',
  'Mr Unknown',
];

// Names a letter apart, to show the hash spreads them
const NEIGHBOURS = ['Igor', 'Igor2', 'igor', 'Igor ', 'Bob', 'bob', 'Bobi', 'Boban'];

const SIZES = ['h-6 w-6', 'h-10 w-10', 'h-16 w-16', 'h-28 w-28', 'h-44 w-44'];

const SYLLABLES = [
  'ba', 'ce', 'chi', 'do', 'du', 'ga', 'ja', 'ko', 'lu', 'mi', 'ne', 'pa',
  'ra', 'so', 'shu', 'ta', 'vi', 'za', 'zo', 'ki', 'le', 'mo', 'nu', 'pe',
];

function randomName(): string {
  const count = 2 + Math.floor(Math.random() * 2);
  let name = '';
  for (let i = 0; i < count; i++) {
    name += SYLLABLES[Math.floor(Math.random() * SYLLABLES.length)];
  }
  return name.charAt(0).toUpperCase() + name.slice(1);
}

const FIELD =
  'w-full rounded-lg border border-sky-200/15 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-sky-200/45';

export default function CreaturesPreviewLab() {
  const [name, setName] = useState('Glizi');
  const [rolled, setRolled] = useState<string[]>([]);
  const shown = name.trim() || 'Mr Unknown';
  const speciesNames = useMemo(
    () =>
      CREATURE_SPECIES.map((species) => creatureNameForSpecies(species.id)).filter(
        (entry): entry is string => entry !== null,
      ),
    [],
  );

  return (
    <div className="flex flex-col gap-5">
      <PreviewSection
        title="Type a name"
        note="The same generator every character uses: lib/utils/creatureAvatar.ts and components/games/CreatureAvatar.tsx."
      >
        <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
          <div className="flex flex-col gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              placeholder="Name"
              aria-label="Name"
              className={`${FIELD} text-center font-semibold`}
            />
            <div className="flex items-center justify-center gap-4">
              <PortraitHead
                character={{ slug: 'preview', name: shown }}
                className="h-20 w-20"
              />
              <div className="h-20 w-20 overflow-hidden rounded-2xl border border-sky-200/15">
                <CreatureAvatar name={shown} />
              </div>
            </div>
            <p className="text-center text-xs text-slate-400">
              {creatureTraits(shown).join(' · ')}
            </p>
          </div>
          <div className="flex flex-wrap items-end justify-center gap-4">
            {SIZES.map((size) => (
              <div
                key={size}
                className={`overflow-hidden rounded-full border-2 border-frost-border/50 shadow-lg ${size}`}
              >
                <CreatureAvatar name={shown} />
              </div>
            ))}
          </div>
        </div>
      </PreviewSection>

      <PreviewSection
        title="Every species"
        note="One name for each species. The table, animals, landscapes and things from home and the road."
      >
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8">
          {speciesNames.map((entry) => (
            <CreatureTraitCard key={entry} name={entry} compact />
          ))}
        </div>
      </PreviewSection>

      <PreviewSection
        title="Small size"
        note="How the species read on a seat at the table, 32 and 48 pixels."
      >
        <div className="flex flex-wrap gap-2">
          {speciesNames.map((entry) => (
            <div key={entry} className="h-8 w-8 overflow-hidden rounded-full border border-frost-border/50">
              <CreatureAvatar name={entry} />
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {speciesNames.map((entry) => (
            <div key={entry} className="h-12 w-12 overflow-hidden rounded-full border border-frost-border/50">
              <CreatureAvatar name={entry} />
            </div>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection
        title="Gallery"
        note="A crowd of made-up names, places and job titles, each rolled like any other name."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {GALLERY.map((entry) => (
            <CreatureTraitCard key={entry} name={entry} />
          ))}
        </div>
      </PreviewSection>

      <PreviewSection
        title="Neighbouring names"
        note="Case and spaces are dropped before the hash, so Igor and igor share a creature and Igor2 does not."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {NEIGHBOURS.map((entry) => (
            <CreatureTraitCard key={entry} name={entry} />
          ))}
        </div>
      </PreviewSection>

      <PreviewSection
        title="Random names"
        note="A new string of syllables on every click, to see how much the creatures differ without picking."
      >
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setRolled(Array.from({ length: 12 }, randomName))}
            className="w-fit rounded-xl border border-sky-200/20 bg-slate-800/50 px-5 py-2 text-sm font-semibold text-slate-200 transition hover:border-sky-200/40 hover:text-white"
          >
            Draw 12 names
          </button>
          {rolled.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {rolled.map((entry, i) => (
                <CreatureTraitCard key={`${entry}-${i}`} name={entry} />
              ))}
            </div>
          )}
        </div>
      </PreviewSection>

    </div>
  );
}
