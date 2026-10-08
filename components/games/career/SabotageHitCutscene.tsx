'use client';

import { useEffect } from 'react';
import SabotageHitStage from '@/components/games/career/SabotageHitStage';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <button
        aria-label={CUT.continue}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-slate-950/80 backdrop-blur-sm"
      />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-frost-border/40 bg-slate-900 shadow-2xl animate-[bubblein_0.25s_ease-out]">
        <SabotageHitStage scene={scene} character={character} season={season} />
        <div className="flex flex-col gap-2.5 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span
              className={`text-[9px] font-bold uppercase tracking-[0.35em] ${blocked ? 'text-emerald-300' : 'text-red-400'}`}
            >
              {HIT.kicker}
            </span>
            {counter && counter.total > 1 && (
              <span className="font-mono text-[9px] font-bold text-slate-500">
                {fmt(HIT.counter, counter)}
              </span>
            )}
          </div>
          <div className="flex items-start gap-2.5">
            <ActionIcon
              kind={blocked ? 'guard' : 'sabotage'}
              className={`h-7 w-7 shrink-0 ${blocked ? 'text-emerald-300' : 'text-red-400'}`}
            />
            <span
              className={`min-w-0 self-center text-sm font-black uppercase leading-tight tracking-wide ${blocked ? 'text-slate-100' : 'text-red-200'}`}
            >
              {HEADLINES[item.templateKey] ?? ''}
            </span>
          </div>
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {chips.map((chip, i) => (
                <span
                  key={`${chip.text}-${i}`}
                  className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold opacity-0 [animation-fill-mode:forwards] animate-[bubblein_0.35s_ease-out] ${
                    chip.good
                      ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300'
                      : 'border-red-500/40 bg-red-500/10 text-red-300'
                  } ${i === 0 ? '[animation-delay:3600ms]' : i === 1 ? '[animation-delay:3800ms]' : i === 2 ? '[animation-delay:4000ms]' : i === 3 ? '[animation-delay:4200ms]' : '[animation-delay:4400ms]'}`}
                >
                  {chip.text}
                </span>
              ))}
            </div>
          )}
          <button
            onClick={onClose}
            className="mt-1 w-full rounded-xl border border-sky-200/25 bg-slate-800/70 py-2 text-[11px] font-black uppercase tracking-[0.3em] text-sky-200 transition hover:border-sky-200/50 hover:bg-slate-800 hover:text-white"
          >
            {CUT.continue}
          </button>
        </div>
      </div>
    </div>
  );
}
