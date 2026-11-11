'use client';

import { useEffect } from 'react';
import CutsceneBoard from '@/components/games/career/CutsceneBoard';
import CutsceneReceiptLines from '@/components/games/career/CutsceneReceiptLines';
import SabotageHitStage from '@/components/games/career/SabotageHitStage';
import BrassPlate from '@/components/games/career/street/BrassPlate';
import ActionIcon from '@/components/icons/ActionIcon';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import type { SabotageHitSceneId } from '@/lib/constants/careerScenes';
import type { NewsItem } from '@/lib/utils/careerSave';
import { playSabotageHitSounds } from '@/lib/utils/cutsceneSounds';
import { fmt, plural } from '@/lib/utils/format';

const CUT = GAMES_UI.career.cutscene;
const HIT = GAMES_UI.career.hitCutscene;
const METERS = GAMES_UI.career.meters as unknown as Record<string, string>;
const TRAININGS = GAMES_UI.career.trainings as Record<string, { name: string }>;
const HEADLINES = GAMES_UI.career.newspaper.headlines as Record<string, string>;

const METER_KEYS = ['stress', 'appetite', 'ambition', 'ego', 'fame'];
const CHIP_DELAYS = [
  '[animation-delay:3600ms]',
  '[animation-delay:3800ms]',
  '[animation-delay:4000ms]',
  '[animation-delay:4200ms]',
  '[animation-delay:4400ms]',
];

type Chip = { text: string; good: boolean };

// The receipt under the scene, read off the story's params: the meters that
// moved and the training that took the hit
function receiptChips(item: NewsItem): Chip[] {
  const chips: Chip[] = [];
  const training = item.params.training;
  const trainingName =
    typeof training === 'string' ? (TRAININGS[training]?.name ?? training) : '';
  if (trainingName && typeof item.params.levels === 'number') {
    chips.push({
      text: plural(HIT.levels, item.params.levels, { training: trainingName, n: -item.params.levels }),
      good: false,
    });
  } else if (trainingName && typeof item.params.sessions === 'number') {
    chips.push({
      text: plural(HIT.sessions, item.params.sessions, {
        training: trainingName,
        n: -item.params.sessions,
      }),
      good: false,
    });
  }
  for (const key of METER_KEYS) {
    const delta = item.params[key];
    if (typeof delta !== 'number' || delta === 0) continue;
    chips.push({
      text: `${METERS[key]} ${delta > 0 ? '+' : ''}${delta}`,
      good: key === 'stress' ? delta < 0 : delta > 0,
    });
  }
  return chips;
}

// One story from the morning paper played out before the issue opens: the
// scene on top, the damage underneath, and it holds until the player taps
export default function SabotageHitCutscene({
  item,
  scene,
  character,
  season,
  counter,
  onClose,
}: {
  item: NewsItem;
  scene: SabotageHitSceneId;
  character: DuelCharacter;
  season: number;
  counter?: { n: number; total: number };
  onClose: () => void;
}) {
  useEffect(() => playSabotageHitSounds(scene), [scene]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Enter') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const chips = receiptChips(item);
  const blocked = scene === 'hit-blocked';

  return (
    <CutsceneBoard
      title={HIT.kicker}
      titleExtra={
        counter &&
        counter.total > 1 && (
          <BrassPlate className="shrink-0 tabular-nums">
            {fmt(HIT.counter, counter)}
          </BrassPlate>
        )
      }
      continueLabel={CUT.continue}
      onClose={onClose}
      stage={
        <SabotageHitStage scene={scene} character={character} season={season} />
      }
    >
      <div className="flex items-start gap-2.5">
        <ActionIcon
          kind={blocked ? 'guard' : 'sabotage'}
          className={`h-7 w-7 shrink-0 ${blocked ? 'text-emerald-300' : 'text-red-400'}`}
        />
        <span
          className={`min-w-0 self-center font-serif text-base font-bold uppercase leading-tight ${blocked ? 'text-slate-100' : 'text-red-300'}`}
        >
          {HEADLINES[item.templateKey] ?? ''}
        </span>
      </div>
      <CutsceneReceiptLines lines={chips} delays={CHIP_DELAYS} />
    </CutsceneBoard>
  );
}
