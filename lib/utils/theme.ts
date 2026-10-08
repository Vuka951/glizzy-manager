export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'theme';
const LIGHT_CLASS = 'light';

const listeners = new Set<() => void>();

// The html class is the source of truth: the inline script in the root
// layout sets it from localStorage before React runs, so a read here never
// disagrees with what is on screen
export const themeStore = {
  load(): Theme {
    return document.documentElement.classList.contains(LIGHT_CLASS)
      ? 'light'
      : 'dark';
  },
  set(theme: Theme): void {
    document.documentElement.classList.toggle(LIGHT_CLASS, theme === 'light');
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // storage unavailable, the theme still applies for this page view
    }
    listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getServerSnapshot(): Theme {
    return 'dark';
  },
};
