import { useEffect, useState } from 'react';

// Two hops on the spot before the full cheer; the table's hop class runs at
// half this, so the hand-off lands with the winner's feet on the ground
export const VICTORY_HOP_MS = 1900;

export type VictoryBeat = 'hop' | 'cheer';

// The winner's celebration once a match is decided: a couple of hops in
// place, then a cheer that loops until the table goes away. The winner stays
// at their own seat the whole time.
export function useVictoryAnimation({
  active,
}: {
  active: boolean;
}): VictoryBeat | null {
  const [cheering, setCheering] = useState(false);

  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(() => setCheering(true), VICTORY_HOP_MS);
    return () => window.clearTimeout(timer);
  }, [active]);

  if (!active) return null;
  return cheering ? 'cheer' : 'hop';
}
