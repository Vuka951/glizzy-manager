'use client';

import { useEffect } from 'react';
import type { ActionReceiptToast } from '@/components/games/career/ActionReceipt';
import ActionSceneStage from '@/components/games/career/ActionSceneStage';
import ActionSceneIcon from '@/components/games/career/ActionSceneIcon';
import CutsceneBoard from '@/components/games/career/CutsceneBoard';
import CutsceneReceiptLines from '@/components/games/career/CutsceneReceiptLines';
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
const LINE_DELAYS = [
  '[animation-delay:900ms]',
  '[animation-delay:1100ms]',
  '[animation-delay:1300ms]',
  '[animation-delay:1500ms]',
  '[animation-delay:1700ms]',
];

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
    <CutsceneBoard
      title={CUT.kicker}
      continueLabel={CUT.continue}
      onClose={onClose}
      stage={
        <ActionSceneStage
          scene={scene}
          character={character}
          season={season}
          outcome={outcome}
        />
      }
    >
      <div className="flex items-start gap-2.5">
        <ActionSceneIcon
          scene={scene}
          className={`h-7 w-7 shrink-0 ${toast.ok ? 'text-sky-300' : 'text-red-400'}`}
        />
        <span
          className={`min-w-0 self-center font-serif text-base font-bold leading-tight ${toast.ok ? 'text-slate-100' : 'text-red-300'}`}
        >
          {toast.title}
        </span>
      </div>
      <CutsceneReceiptLines lines={toast.lines} delays={LINE_DELAYS} />
    </CutsceneBoard>
  );
}
