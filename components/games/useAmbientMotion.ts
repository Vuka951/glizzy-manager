import { useSyncExternalStore } from 'react';
import { subscribeGameSettings } from '@/lib/utils/gameSettings';
import { ambientMotionEnabled } from '@/lib/utils/motion';

const serverSnapshot = () => true;

// Whether decorative loops may run, following the animation level setting
// live as the viewer changes it
export default function useAmbientMotion(): boolean {
  return useSyncExternalStore(subscribeGameSettings, ambientMotionEnabled, serverSnapshot);
}

