import type { AchievementId } from '@/data/games/achievements';

// One store shared by both game modes: an id maps to the moment it was earned
export type UnlockedAchievements = Partial<Record<AchievementId, number>>;

const STORAGE_KEY = 'glizzy-achievements';

const EMPTY: UnlockedAchievements = {};

const listeners = new Set<() => void>();
const toastListeners = new Set<(id: AchievementId) => void>();

let cachedRaw: string | null = null;
let cachedUnlocked: UnlockedAchievements = EMPTY;
let cacheInitialized = false;

function parseUnlocked(raw: string | null): UnlockedAchievements {
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
      return EMPTY;
    return Object.fromEntries(
      Object.entries(parsed).filter(([, t]) => Number.isFinite(t)),
    ) as UnlockedAchievements;
  } catch {
    return EMPTY;
  }
}

export const achievementStore = {
  load(): UnlockedAchievements {
    if (typeof window === 'undefined') return EMPTY;
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      return EMPTY;
    }
    if (!cacheInitialized || raw !== cachedRaw) {
      cacheInitialized = true;
      cachedRaw = raw;
      cachedUnlocked = parseUnlocked(raw);
    }
    return cachedUnlocked;
  },
  // Returns true the first time an id is earned; the toast fires only then
  unlock(id: AchievementId): boolean {
    if (typeof window === 'undefined') return false;
    const current = achievementStore.load();
    if (current[id]) return false;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...current, [id]: Date.now() }),
      );
    } catch {
      // localStorage can be unavailable (private mode); the trophy still shows
    }
    listeners.forEach((listener) => listener());
    toastListeners.forEach((listener) => listener(id));
    return true;
  },
  // Shows the toast without touching the store, for the preview page
  preview(id: AchievementId): void {
    toastListeners.forEach((listener) => listener(id));
  },
  clear(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // best-effort
    }
    listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  subscribeToasts(listener: (id: AchievementId) => void): () => void {
    toastListeners.add(listener);
    return () => {
      toastListeners.delete(listener);
    };
  },
  getServerSnapshot(): UnlockedAchievements {
    return EMPTY;
  },
};

export function unlockedCount(
  unlocked: UnlockedAchievements,
  ids: AchievementId[],
): number {
  return ids.filter((id) => Boolean(unlocked[id])).length;
}
