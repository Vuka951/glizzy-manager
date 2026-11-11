import { GAMES_UI } from '@/data/games/locale';
import type { SlotAction } from '@/lib/utils/careerSave';
import { fmt } from '@/lib/utils/format';

const YC = GAMES_UI.career.offseason.yearCalendar;
const T = GAMES_UI.career.trainings;
const A = GAMES_UI.career.actions;
const SAB = GAMES_UI.career.sabotage;

// The months the character spent on his own terms say so, next to what he did
export function actionLabel(action: SlotAction): string {
  if (action.kind === 'ego' && action.trainingId)
    return fmt(YC.egoSlot, { training: T[action.trainingId].name });
  if (action.kind === 'slump')
    return fmt(YC.slumpSlot, {
      action: action.slumpAction === 'fast' ? A.fast : A.guard,
    });
  if (action.kind === 'rest') return T.rest.name;
  if (action.kind === 'fast') return A.fast;
  if (action.kind === 'island') return A.island;
  if (action.kind === 'guard') return A.guard;
  if (action.kind === 'media') return A.media;
  if (action.kind === 'sabotage') return SAB.action;
  return action.trainingId ? T[action.trainingId].name : '';
}
