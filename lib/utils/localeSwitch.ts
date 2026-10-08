import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE_SECONDS,
  type Locale,
} from '@/data/games/locale';

// The dictionary is picked while the modules load, so a new language only
// takes effect on a full reload
export function switchLocale(locale: Locale): void {
  document.cookie = `${LOCALE_COOKIE}=${locale}; Max-Age=${LOCALE_COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`;
  window.location.reload();
}
