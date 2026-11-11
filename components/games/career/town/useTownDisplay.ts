import { useSyncExternalStore } from 'react';
import {
  readGameSettings,
  readServerGameSettings,
  subscribeGameSettings,
  type TownCard,
  type TownLabels,
} from '@/lib/utils/gameSettings';

export function useTownDisplay(): {
  labels: TownLabels;
  card: TownCard;
} {
  const settings = useSyncExternalStore(
    subscribeGameSettings,
    readGameSettings,
    readServerGameSettings,
  );
  return {
    labels: settings.townLabels,
    card: settings.townCard,
  };
}
