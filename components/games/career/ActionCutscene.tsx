'use client';

import { useEffect } from 'react';
import type { ActionReceiptToast } from '@/components/games/career/ActionReceipt';
import ActionSceneStage from '@/components/games/career/ActionSceneStage';
import ActionSceneIcon from '@/components/games/career/ActionSceneIcon';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import type {
  ActionSceneId,
  ActionSceneOutcome,
} from '@/lib/constants/careerScenes';
import { playCutsceneSounds } from '@/lib/utils/cutsceneSounds';

export type ActionCutsceneState = {
  scene: ActionSceneId;
  outcome: ActionSceneOutcome;
  toast: ActionReceiptToast;
  key: number;
};

const CUT = GAMES_UI.career.cutscene;

// The month's action as a short scene over the off-season screen: the
// animation on top, the receipt underneath, and it holds until the player
// taps through
export default function ActionCutscene({
  scene,
  outcome,
  toast,
  character,
  season,
  onClose,
}: {
  scene: ActionSceneId;
  outcome: ActionSceneOutcome;
  toast: ActionReceiptToast;
  character: DuelCharacter;
  season: number;
  onClose: () => void;
}) {
  useEffect(() => playCutsceneSounds(scene, outcome), [scene, outcome]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Enter') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <button
        aria-label={CUT.continue}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-slate-950/80 backdrop-blur-sm"
      />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-frost-border/40 bg-slate-900 shadow-2xl animate-[bubblein_0.25s_ease-out]">
        <ActionSceneStage
          scene={scene}
          character={character}
          season={season}
          outcome={outcome}
        />
        <div className="flex flex-col gap-2.5 p-4 sm:p-5">
          <span className="text-[9px] font-bold uppercase tracking-[0.35em] text-sky-400">
            {CUT.kicker}
          </span>
          <div className="flex items-start gap-2.5">
            <ActionSceneIcon
              scene={scene}
              className={`h-7 w-7 shrink-0 ${toast.ok ? 'text-sky-300' : 'text-red-400'}`}
            />
            <span
              className={`min-w-0 self-center text-sm font-black leading-tight ${toast.ok ? 'text-slate-100' : 'text-red-200'}`}
            >
              {toast.title}
            </span>
          </div>
          {toast.lines.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {toast.lines.map((line, i) => (
                <span
                  key={`${line.text}-${i}`}
                  className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold opacity-0 [animation-fill-mode:forwards] animate-[bubblein_0.35s_ease-out] ${
                    line.good
                      ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300'
                      : 'border-red-500/40 bg-red-500/10 text-red-300'
                  } ${i === 0 ? '[animation-delay:900ms]' : i === 1 ? '[animation-delay:1100ms]' : i === 2 ? '[animation-delay:1300ms]' : i === 3 ? '[animation-delay:1500ms]' : '[animation-delay:1700ms]'}`}
                >
                  {line.text}
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
