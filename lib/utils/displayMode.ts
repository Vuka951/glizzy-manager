import {
  DEFAULT_DISPLAY_MODE,
  displayModes,
  type DisplayMode,
} from '@/lib/constants/displayMode';

const STORAGE_KEY = 'glizzy-display-mode';

const listeners = new Set<() => void>();

// What a failed write leaves behind, so the pick still holds for this tab
let memoryMode: DisplayMode | null = null;

function isDisplayMode(value: string | null): value is DisplayMode {
  return displayModes.includes(value as DisplayMode);
}

export function readDisplayMode(): DisplayMode {
  if (typeof window === 'undefined') return DEFAULT_DISPLAY_MODE;
  if (memoryMode) return memoryMode;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return isDisplayMode(raw) ? raw : DEFAULT_DISPLAY_MODE;
  } catch {
    return DEFAULT_DISPLAY_MODE;
  }
}

export function readServerDisplayMode(): DisplayMode {
  return DEFAULT_DISPLAY_MODE;
}

export function writeDisplayMode(mode: DisplayMode): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
    memoryMode = null;
  } catch {
    memoryMode = mode;
  }
  listeners.forEach((listener) => listener());
}

function handleStorage(event: StorageEvent): void {
  if (event.key !== null && event.key !== STORAGE_KEY) return;
  listeners.forEach((listener) => listener());
}

export function subscribeDisplayMode(listener: () => void): () => void {
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
