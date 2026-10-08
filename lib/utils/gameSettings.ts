export type GameSettings = { commentator: boolean; cutscenes: boolean };

const STORAGE_KEY = 'glizzy-game-settings';

const DEFAULT_SETTINGS: GameSettings = { commentator: true, cutscenes: true };

const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cachedSettings: GameSettings = DEFAULT_SETTINGS;
let cacheInitialized = false;
let memoryOnly = false;

function parseSettings(raw: string | null): GameSettings {
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(raw) as Partial<GameSettings>;
    return {
      commentator: parsed.commentator !== false,
      cutscenes: parsed.cutscenes !== false,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// Returns the same object until the stored value changes, so it can serve as
// a useSyncExternalStore snapshot
export function readGameSettings(): GameSettings {
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

export function readServerGameSettings(): GameSettings {
  return DEFAULT_SETTINGS;
}

export function writeGameSettings(patch: Partial<GameSettings>): void {
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
