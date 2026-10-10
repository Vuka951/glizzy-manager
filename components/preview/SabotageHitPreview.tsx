'use client';

import { useState } from 'react';
import SabotageHitCutscene from '@/components/games/career/SabotageHitCutscene';
import SabotageHitReel from '@/components/games/career/SabotageHitReel';
import SabotageHitStage from '@/components/games/career/SabotageHitStage';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import {
  SABOTAGE_HIT_SCENE_IDS,
  type SabotageHitSceneId,
} from '@/lib/constants/careerScenes';
import type { NewsItem } from '@/lib/utils/careerSave';

const HEADLINES = GAMES_UI.career.newspaper.headlines as Record<string, string>;
const SEASONS = ['Winter', 'Spring', 'Summer', 'Autumn'];

// The story behind every scene, with the receipt a real hit would carry
const story = (templateKey: string, params: NewsItem['params']): NewsItem => ({
  kind: 'sabotage',
  templateKey,
  params,
  slugs: [],
});

const STORY_BY_SCENE: Record<SabotageHitSceneId, NewsItem> = {
  'hit-poison-glizimaker': story('poison-glizimaker', {
    training: 'stomach',
    levels: -1,
    stress: 12,
  }),
  'hit-poison-kafana': story('poison-kafana', {
    training: 'stomach',
    sessions: -2,
    appetite: -18,
  }),
  'hit-curse': story('witch-curse', {
    training: 'sniffer',
    levels: -1,
    stress: 14,
  }),
  'hit-bribe': story('nutrition-bribed', {
    training: 'nutrition',
    sessions: -2,
    appetite: -13,
  }),
  'hit-rumor': story('fans-rumor', {
    training: 'fans',
    levels: -1,
    fame: -16,
    ego: -9,
    stress: 8,
  }),
  'hit-catfish-date': story('catfish-date', { stress: 28, fame: -13 }),
  'hit-catfish-zeka': story('catfish-zeka', { stress: 33, ego: -12 }),
  'hit-catfish-demons': story('catfish-demons', { stress: 30, ambition: -17 }),
  'hit-raid-tax': story('police-tax', { fame: -9 }),
  'hit-raid-stash': story('police-stash', { fame: -11 }),
  'hit-raid-island': story('police-island', { fame: -8 }),
  'hit-raid-smuggling': story('police-smuggling', { fame: -10 }),
  'hit-blocked': story('sabotageBlocked', {}),
};

const REEL_SAMPLE: SabotageHitSceneId[] = [
  'hit-curse',
  'hit-catfish-zeka',
  'hit-blocked',
];

export default function SabotageHitPreview({
  character,
}: {
  character: DuelCharacter;
}) {
  const [scene, setScene] = useState<SabotageHitSceneId>(
    'hit-poison-glizimaker',
  );
  const [season, setSeason] = useState(0);
  const [replay, setReplay] = useState(0);
  const [modal, setModal] = useState(false);
  const [reel, setReel] = useState(false);
  const current = {
    ...STORY_BY_SCENE[scene],
    slugs: [character.slug],
  };
  const reelNews = REEL_SAMPLE.map((id) => ({
    ...STORY_BY_SCENE[id],
    slugs: [character.slug],
  }));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {SABOTAGE_HIT_SCENE_IDS.map((id) => (
          <button
            key={id}
            data-scene={id}
            onClick={() => {
              setScene(id);
              setReplay(replay + 1);
            }}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              scene === id
                ? 'border-red-500/60 bg-red-500/20 text-red-200'
                : 'border-sky-200/20 bg-slate-800/60 text-slate-300 hover:border-sky-200/45 hover:text-white'
            }`}
          >
            {HEADLINES[STORY_BY_SCENE[id].templateKey]}
            <span className="ml-1.5 font-mono text-[9px] text-slate-500">
              {id.slice('hit-'.length)}
            </span>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {SEASONS.map((label, index) => (
          <button
            key={label}
            onClick={() => {
              setSeason(index);
              setReplay(replay + 1);
            }}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              season === index
                ? 'border-amber-400/60 bg-amber-500/15 text-amber-200'
                : 'border-sky-200/20 bg-slate-800/60 text-slate-300 hover:border-sky-200/45 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-slate-700" />
        <button
          onClick={() => setReplay(replay + 1)}
          className="rounded-lg border border-sky-200/20 bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-sky-200/45 hover:text-white"
        >
          Replay
        </button>
        <button
          onClick={() => setModal(true)}
          className="rounded-lg border border-sky-200/20 bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-sky-200/45 hover:text-white"
        >
          Full window
        </button>
        <button
          onClick={() => setReel(true)}
          className="rounded-lg border border-sky-200/20 bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-sky-200/45 hover:text-white"
        >
          Full reel (3 hits)
        </button>
      </div>
      <div
        data-stage="hit"
        className="overflow-hidden rounded-2xl border border-sky-200/10"
      >
        <SabotageHitStage
          key={`${scene}-${season}-${replay}`}
          scene={scene}
          character={character}
          season={season}
        />
      </div>
      {modal && (
        <SabotageHitCutscene
          key={`modal-${replay}`}
          item={current}
          scene={scene}
          character={character}
          season={season}
          onClose={() => setModal(false)}
        />
      )}
      {reel && (
        <SabotageHitReel
          key={`reel-${replay}`}
          news={reelNews}
          slug={character.slug}
          character={character}
          season={season}
          onDone={() => setReel(false)}
        />
      )}
    </div>
  );
}
