import { useSyncExternalStore } from 'react';
import {
  readGameSettings,
  readServerGameSettings,
  subscribeGameSettings,
} from '@/lib/utils/gameSettings';

// The commentator switch from the game settings; every commentary player and
// caption reads it through here
export default function useCommentatorEnabled(): boolean {
  return useSyncExternalStore(
    subscribeGameSettings,
    () => readGameSettings().commentator,
    () => readServerGameSettings().commentator,
  );
}
