export type GameSettings = { commentator: boolean; cutscenes: boolean };

export type TownLabels = 'always' | 'hover';
// Lite keeps only the motion that carries the game; ambient loops stop
export type TownMotion = 'full' | 'lite';
// The desktop player card folded down to its five meter values
export type TownCard = 'open' | 'collapsed';

// The broadcast toggles plus the per-viewer look of the transfer window town;
// GameSettings stays the on/off list the broadcast panel walks
export type StoredGameSettings = GameSettings & {
  townLabels: TownLabels;
  townMotion: TownMotion;
  townCard: TownCard;
};

const STORAGE_KEY = 'glizzy-game-settings';

const DEFAULT_SETTINGS: StoredGameSettings = {
  commentator: true,
  cutscenes: true,
  townLabels: 'hover',
  townMotion: 'full',
  townCard: 'open',
};

const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cachedSettings: StoredGameSettings = DEFAULT_SETTINGS;
let cacheInitialized = false;
let memoryOnly = false;

function parseSettings(raw: string | null): StoredGameSettings {
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredGameSettings>;
    return {
      commentator: parsed.commentator !== false,
      cutscenes: parsed.cutscenes !== false,
      townLabels: parsed.townLabels === 'always' ? 'always' : 'hover',
      townMotion: parsed.townMotion === 'lite' ? 'lite' : 'full',
      townCard: parsed.townCard === 'collapsed' ? 'collapsed' : 'open',
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// Returns the same object until the stored value changes, so it can serve as
// a useSyncExternalStore snapshot
export function readGameSettings(): StoredGameSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  if (memoryOnly) return cachedSettings;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    memoryOnly = true;
    return cachedSettings;
  }
  if (!cacheInitialized || raw !== cachedRaw) {
    cacheInitialized = true;
    cachedRaw = raw;
    cachedSettings = parseSettings(raw);
  }
  return cachedSettings;
}

export function readServerGameSettings(): StoredGameSettings {
  return DEFAULT_SETTINGS;
}

export function writeGameSettings(
  patch: Partial<StoredGameSettings>,
): void {
  if (typeof window === 'undefined') return;
  const next = { ...readGameSettings(), ...patch };
  const raw = JSON.stringify(next);
  cacheInitialized = true;
  cachedRaw = raw;
  cachedSettings = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    // localStorage can be unavailable (private mode); the change then lives
    // in memory for this tab only
    memoryOnly = true;
  }
  listeners.forEach((listener) => listener());
}

function handleStorage(event: StorageEvent): void {
  if (event.key !== null && event.key !== STORAGE_KEY) return;
  listeners.forEach((listener) => listener());
}

export function subscribeGameSettings(listener: () => void): () => void {
  if (listeners.size === 0 && typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
    }
  };
}
