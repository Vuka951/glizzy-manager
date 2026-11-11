// Clicks on the town's animals, kept for the trophies across sessions and
// saves, outside any career
export type TownPokeKind = 'cat' | 'dog';

const STORAGE_KEY = 'glizzy-town-pokes';

function readPokes(): Partial<Record<TownPokeKind, number>> {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}

// Adds one click and returns the running total for that animal
export function recordTownPoke(kind: TownPokeKind): number {
  if (typeof window === 'undefined') return 0;
  const pokes = readPokes();
  const stored = pokes[kind];
  const total =
    (typeof stored === 'number' && Number.isFinite(stored) ? stored : 0) + 1;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...pokes, [kind]: total }),
    );
  } catch {
    // localStorage can be unavailable (private mode); the count stays at one
  }
  return total;
}
