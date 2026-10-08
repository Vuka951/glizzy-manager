'use client';

import { createContext, useContext } from 'react';
import type { CoachTagMap } from '@/lib/types/careerMp';

// Who coaches whom, by character slug, for every portrait in a shared room.
// Outside a room the map is empty and portraits render as they always did
export const CoachColorsContext = createContext<CoachTagMap>({});

export function useCoachColors(): CoachTagMap {
  return useContext(CoachColorsContext);
}
