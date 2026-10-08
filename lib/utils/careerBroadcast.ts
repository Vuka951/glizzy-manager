import {
  BROADCAST_OPEN_UNLOCK_CUPS,
  COMMENTARY_UNLOCK_CUPS,
  MATCH_TAPE_UNLOCK_CUPS,
} from '@/lib/constants/careerCommentary';
import type { SavedCareer } from '@/lib/utils/careerSave';

export type BroadcastUnlocks = {
  commentary: boolean;
  tape: boolean;
  open: boolean;
};

// The league's TV production grows with the career: first a lone commentator,
// then the pre-match tale of the tape, then the full studio open
export function broadcastUnlocks(career: SavedCareer): BroadcastUnlocks {
  const cups = career.standingsHistory.length;
  return {
    commentary: cups >= COMMENTARY_UNLOCK_CUPS,
    tape: cups >= MATCH_TAPE_UNLOCK_CUPS,
    open: cups >= BROADCAST_OPEN_UNLOCK_CUPS,
  };
}
