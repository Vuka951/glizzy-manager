'use client';

import { useMemo, useState } from 'react';
import OffseasonScreen from '@/components/games/career/OffseasonScreen';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import { sampleCareer } from '@/components/preview/sampleCareer';
import { SPONSOR_IDS } from '@/data/games/careerSponsors';
import { SEASON_THEME_INDEX } from '@/data/games/careerSeasons';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import type { TownLayoutKey } from '@/lib/constants/townLayout';
import type { CareerMoodActivity } from '@/lib/utils/careerMood';
import { moodSoundVariants, playMoodSound } from '@/lib/utils/moodSounds';
import type {
  CharacterCareerState,
  SavedCareer,
  SponsorId,
} from '@/lib/utils/careerSave';

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

const EDITIONS = [0, 1, 2, 3];

const LAYOUTS: { id: TownLayoutKey; label: string }[] = [
  { id: 'desk', label: 'Desktop' },
  { id: 'phone', label: 'Phone' },
];

// The stage picks its canvas from its own width, so the phone layout is a
// phone-wide box
const BOX: Record<TownLayoutKey, string> = {
  desk: 'w-full',
  phone: 'w-[390px] max-w-full',
};

const SPONSOR_NAMES = GAMES_UI.career.sponsors.names as Record<SponsorId, string>;

const noop = () => undefined;

function chipClass(on: boolean, tone: 'red' | 'emerald' | 'amber'): string {
  const active = {
    red: 'border-red-500/60 bg-red-500/20 text-red-200',
    emerald: 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200',
    amber: 'border-amber-300/60 bg-amber-400/15 text-amber-100',
  }[tone];
  return `flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
    on
      ? active
      : 'border-sky-200/20 bg-slate-800/60 text-slate-300 hover:border-sky-200/45 hover:text-white'
  }`;
}

// The real transfer window town with the player's meters set to each mood,
// so he walks to that mood's spot and plays its loop, and with any sponsor
// dressing him and the square
export default function MoodActivityPreview({
  characters,
  character,
}: {
  characters: DuelCharacter[];
  character: DuelCharacter;
}) {
  const [activity, setActivity] = useState<CareerMoodActivity>('relaxed');
  const [season, setSeason] = useState(0);
  const [layout, setLayout] = useState<TownLayoutKey>('desk');
  const [sponsorId, setSponsorId] = useState<SponsorId | null>(null);
  const selected = ACTIVITIES.find((item) => item.id === activity) ?? ACTIVITIES[0];
  const variants = moodSoundVariants(activity);
  const base = useMemo(
    () =>
      sampleCareer({
        slugs: characters.map((c) => c.slug),
        playerSlug: character.slug,
        year: 3,
        season,
      }),
    [characters, character.slug, season],
  );
  const career = useMemo<SavedCareer>(
    () => ({
      ...base,
      characters: {
        ...base.characters,
        [character.slug]: {
          ...base.characters[character.slug],
          ...selected.meters,
          sponsor: sponsorId ? { sponsorId } : null,
        },
      },
    }),
    [base, character.slug, selected.meters, sponsorId],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {ACTIVITIES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setActivity(item.id);
              playMoodSound(item.id);
            }}
            className={chipClass(activity === item.id, 'red')}
          >
            {item.label}
            {moodSoundVariants(item.id).length > 0 && (
              <span className="-ml-1 text-[10px] opacity-60">♪</span>
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
            type="button"
            onClick={() => playMoodSound(activity, index)}
            className={chipClass(false, 'red')}
          >
            {`Variant ${index + 1}`}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSponsorId(null)}
          className={chipClass(sponsorId === null, 'amber')}
        >
          {GAMES_UI.career.sponsors.none}
        </button>
        {SPONSOR_IDS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setSponsorId(id)}
            className={chipClass(sponsorId === id, 'amber')}
          >
            <SponsorEmblem sponsorId={id} className="h-5 w-5" />
            {SPONSOR_NAMES[id]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {EDITIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSeason(s)}
            className={chipClass(season === s, 'emerald')}
          >
            {GAMES_UI.cup.studio.themes[SEASON_THEME_INDEX[s]]}
          </button>
        ))}
        {LAYOUTS.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setLayout(l.id)}
            className={chipClass(layout === l.id, 'emerald')}
          >
            {l.label}
          </button>
        ))}
      </div>
      <div className="flex justify-center">
        <div
          key={layout}
          className={`group relative shrink-0 overflow-hidden rounded-3xl ${BOX[layout]}`}
        >
          <OffseasonScreen
            career={career}
            characters={characters}
            topBar={null}
            toast={null}
            cutscene={null}
            onCloseCutscene={noop}
            onOpenTable={noop}
            onOpenDossier={noop}
            pendingElection={false}
            pendingRival={false}
            onOpenElection={noop}
            onOpenRival={noop}
            onTrain={noop}
            onRest={noop}
            onMedia={noop}
            onIsland={noop}
            onGuard={noop}
            onInvest={noop}
            onBorrow={noop}
            onRepay={noop}
            onGlizzyBet={noop}
            onCancelGlizzyBet={noop}
            onSabotage={noop}
            onOpenNews={noop}
            onToCup={noop}
            onDismissToast={noop}
            onMarkMailRead={noop}
            onMarkAllMailRead={noop}
            onAcceptSponsor={noop}
            onDonate={noop}
          />
        </div>
      </div>
    </div>
  );
}
