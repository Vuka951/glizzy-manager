import { createContext, useContext } from 'react';

export type CareerFrames = 'glass' | 'street';

// Which look the shared game controls wear. The career and the Rivals room
// provide street; the same controls inside the Duel or the Cup game fall back
// to glass
export const CareerFramesContext = createContext<CareerFrames>('glass');

export function useCareerFrames(): CareerFrames {
  return useContext(CareerFramesContext);
}
