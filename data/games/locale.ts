import en from './locales/en.json';
import sr from './locales/sr.json';

export const LOCALES = ['en', 'sr'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_COOKIE = 'locale';
export const LOCALE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export type Dictionary = typeof en;

// Both files must carry the same key tree: each one is checked against the
// other's shape, so a key missing on either side fails compilation. JSON
// imports are typed with plain string and array types, so the wording and
// the array lengths are free to differ (scripts/locale-check.mjs covers those)
const dictionaries: Record<Locale, Dictionary> = {
  en: en satisfies typeof sr,
  sr: sr satisfies typeof en,
};

export function isLocale(value: unknown): value is Locale {
  return LOCALES.some((locale) => locale === value);
}

export function dictionaryFor(locale: Locale): Dictionary {
  return dictionaries[locale];
}

// The browser reads the choice once, while this module is first evaluated,
// so every module-level capture of GAMES_UI sees the right dictionary; a
// language switch reloads the page. The server and the simulators have no
// document and get the default: server components must go through
// dictionaryFor with the request's cookie instead of using GAMES_UI
function readBrowserLocale(): Locale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]+)`),
  );
  const value = match?.[1];
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export const ACTIVE_LOCALE: Locale = readBrowserLocale();

export const GAMES_UI: Dictionary = dictionaryFor(ACTIVE_LOCALE);
