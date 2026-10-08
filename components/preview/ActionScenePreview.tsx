'use client';

import { useState } from 'react';
import ActionCutscene from '@/components/games/career/ActionCutscene';
import type { ActionReceiptToast } from '@/components/games/career/ActionReceipt';
import ActionSceneStage from '@/components/games/career/ActionSceneStage';
import type { ActionIconKind } from '@/components/icons/ActionIcon';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import {
  ACTION_SCENE_IDS,
  ACTION_SCENES_WITH_BAD_OUTCOME,
  ACTION_SCENES_WITH_LEVEL_UP,
  type ActionSceneId,
  type ActionSceneOutcome,
} from '@/lib/constants/careerScenes';

const OUTCOME_LABELS: Record<ActionSceneOutcome, string> = {
  good: 'Napredak',
  'level-up': 'Nivo gore',
  bad: 'Neuspeh',
};

const OUTCOME_ACTIVE: Record<ActionSceneOutcome, string> = {
  good: 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200',
  'level-up': 'border-amber-400/60 bg-amber-500/15 text-amber-200',
  bad: 'border-red-500/60 bg-red-500/20 text-red-200',
};

const CAREER = GAMES_UI.career;

const LABELS: Record<ActionSceneId, string> = {
  'training-stomach': CAREER.trainings.stomach.name,
  'training-sniffer': CAREER.trainings.sniffer.name,
  'training-nutrition': CAREER.trainings.nutrition.name,
  'training-fans': CAREER.trainings.fans.name,
  'training-sparring': CAREER.trainings.sparring.name,
  rest: CAREER.trainings.rest.name,
  fast: CAREER.actions.fast,
  island: CAREER.actions.island,
  'media-interview': CAREER.actions.mediaInterview,
  'media-scandal': CAREER.actions.mediaScandal,
  guard: CAREER.actions.guard,
  'invest-security': CAREER.investments.names.security,
  'invest-spa': CAREER.investments.names.spa,
  'invest-assistant': CAREER.investments.names.assistant,
  'invest-scout': CAREER.investments.names.scout,
  'sabotage-1': `${CAREER.sabotage.action}: ${CAREER.sabotage.tiers[1].name}`,
  'sabotage-2': `${CAREER.sabotage.action}: ${CAREER.sabotage.tiers[2].name}`,
  'sabotage-3': `${CAREER.sabotage.action}: ${CAREER.sabotage.tiers[3].name}`,
};

const SEASONS = ['Zima', 'Proleće', 'Leto', 'Jesen'];

function iconFor(scene: ActionSceneId): ActionIconKind {
  if (scene.startsWith('training-')) return 'training';
  if (scene === 'rest' || scene === 'fast') return 'rest';
  if (scene === 'island') return 'island';
  if (scene.startsWith('media-')) return 'media';
  if (scene === 'guard') return 'guard';
  if (scene.startsWith('invest-')) return 'invest';
  return 'sabotage';
}

// A stand-in receipt so the modal has chips to stagger in
function mockToast(
  scene: ActionSceneId,
  outcome: ActionSceneOutcome,
): ActionReceiptToast {
  const good = outcome === 'good';
  return {
    title: LABELS[scene],
    icon: iconFor(scene),
    ok: good,
    lines: [
      { text: `${CAREER.meters.stress} +10`, good: false },
      {
        text: good ? `${CAREER.meters.fame} +6` : `${CAREER.meters.fame} -6`,
        good,
      },
      { text: `-55 glizara`, good: false },
    ],
  };
}

export default function ActionScenePreview({
  character,
}: {
  character: DuelCharacter;
}) {
  const [scene, setScene] = useState<ActionSceneId>('training-stomach');
  const [outcome, setOutcome] = useState<ActionSceneOutcome>('good');
  const [season, setSeason] = useState(0);
  const [replay, setReplay] = useState(0);
  const [modal, setModal] = useState(false);
  const hasBad = ACTION_SCENES_WITH_BAD_OUTCOME.has(scene);
  const hasLevelUp = ACTION_SCENES_WITH_LEVEL_UP.has(scene);
  const outcomes: ActionSceneOutcome[] = hasLevelUp
    ? ['good', 'level-up', 'bad']
    : hasBad
      ? ['good', 'bad']
      : ['good'];
  const effectiveOutcome = outcomes.includes(outcome) ? outcome : 'good';

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {ACTION_SCENE_IDS.map((id) => (
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
            {LABELS[id]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {outcomes.map((value) => (
          <button
            key={value}
            data-outcome={value}
            disabled={outcomes.length === 1}
            onClick={() => {
              setOutcome(value);
              setReplay(replay + 1);
            }}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
              effectiveOutcome === value
                ? OUTCOME_ACTIVE[value]
                : 'border-sky-200/20 bg-slate-800/60 text-slate-300 hover:border-sky-200/45 hover:text-white'
            }`}
          >
            {hasLevelUp || value !== 'good' ? OUTCOME_LABELS[value] : 'Uspeh'}
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-slate-700" />
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
          Ponovi
        </button>
        <button
          onClick={() => setModal(true)}
          className="rounded-lg border border-sky-200/20 bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-sky-200/45 hover:text-white"
        >
          Ceo prozor
        </button>
      </div>
      <div
        data-stage="action"
        className="overflow-hidden rounded-2xl border border-sky-200/10"
      >
        <ActionSceneStage
          key={`${scene}-${effectiveOutcome}-${season}-${replay}`}
          scene={scene}
          character={character}
          season={season}
          outcome={effectiveOutcome}
        />
      </div>
      {modal && (
        <ActionCutscene
          key={`modal-${replay}`}
          scene={scene}
          outcome={effectiveOutcome}
          toast={mockToast(scene, effectiveOutcome)}
          character={character}
          season={season}
          onClose={() => setModal(false)}
        />
      )}
    </div>
  );
}
