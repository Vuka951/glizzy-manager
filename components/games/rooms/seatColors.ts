'use client';

import { createContext, useContext } from 'react';
import type { SeatTagMap } from '@/lib/types/rooms';

// Which seat plays whom, by character slug, for every portrait in a shared
// room. Outside a room the map is empty and portraits render as they always did
export const SeatColorsContext = createContext<SeatTagMap>({});

export function useSeatColors(): SeatTagMap {
  return useContext(SeatColorsContext);
}
