'use client';

import { useState } from 'react';
import TrainingScene from '@/components/games/career/TrainingScene';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { newCharacterState } from '@/lib/utils/careerMeters';
import type { CareerMoodActivity } from '@/lib/utils/careerMood';
import { moodSoundVariants, playMoodSound } from '@/lib/utils/moodSounds';
import type { CharacterCareerState } from '@/lib/utils/careerSave';

type MoodMeters = Pick<
  CharacterCareerState,
  'stress' | 'appetite' | 'ambition' | 'ego' | 'fame'
>;

const BASE_METERS: MoodMeters = {
  stress: 45,
  appetite: 50,
  ambition: 50,
  ego: 45,
  fame: 50,
};

const ACTIVITIES: Array<{
  id: CareerMoodActivity;
  label: string;
  meters: MoodMeters;
}> = [
  { id: 'sick', label: 'Nausea', meters: { ...BASE_METERS, stress: 95, appetite: 10 } },
  { id: 'frantic', label: 'Panic', meters: { ...BASE_METERS, stress: 95 } },
  { id: 'anxious', label: 'Nerves', meters: { ...BASE_METERS, stress: 95, ambition: 95 } },
  { id: 'defeated', label: 'Defeat', meters: { ...BASE_METERS, ambition: 5 } },
  { id: 'shy', label: 'Hiding', meters: { ...BASE_METERS, fame: 10 } },
  { id: 'proud', label: 'Pride', meters: { ...BASE_METERS, ego: 95 } },
  { id: 'energized', label: 'Energy', meters: { ...BASE_METERS, ambition: 95 } },
  { id: 'hungry', label: 'Hunger', meters: { ...BASE_METERS, appetite: 95 } },
  { id: 'relaxed', label: 'Rest', meters: { ...BASE_METERS, stress: 10 } },
  { id: 'celebrating', label: 'Celebration', meters: { ...BASE_METERS, stress: 25 } },
  { id: 'idle', label: 'Calm', meters: BASE_METERS },
];

const SEASONS = ['Winter', 'Spring', 'Summer', 'Autumn'];

export default function MoodActivityPreview({
  character,
}: {
  character: DuelCharacter;
}) {
  const [activity, setActivity] = useState<CareerMoodActivity>('relaxed');
  const [season, setSeason] = useState(0);
  const selected = ACTIVITIES.find((item) => item.id === activity) ?? ACTIVITIES[0];
  const variants = moodSoundVariants(activity);
  const mood: CharacterCareerState = {
    ...newCharacterState(character.slug),
    ...selected.meters,
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {ACTIVITIES.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActivity(item.id);
              playMoodSound(item.id);
            }}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              activity === item.id
                ? 'border-red-500/60 bg-red-500/20 text-red-200'
                : 'border-sky-200/20 bg-slate-800/60 text-slate-300 hover:border-sky-200/45 hover:text-white'
            }`}
          >
            {item.label}
            {moodSoundVariants(item.id).length > 0 && (
              <span className="ml-1 text-[10px] opacity-60">♪</span>
            )}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          {variants.length > 0 ? 'Sound' : 'No sound'}
        </span>
        {variants.map((_, index) => (
          <button
            key={index}
            onClick={() => playMoodSound(activity, index)}
            className="rounded-lg border border-sky-200/20 bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-sky-200/45 hover:text-white"
          >
            {`Variant ${index + 1}`}
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
          sponsorId={null}
          mood={mood}
          className="h-80 sm:h-96"
        />
      </div>
    </div>
  );
}
