import { cookies } from 'next/headers';
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  dictionaryFor,
  isLocale,
  type Dictionary,
  type Locale,
} from '@/data/games/locale';

// Server components only: the language of the current request, read off the
// cookie the language switch writes
export async function requestLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function requestDictionary(): Promise<Dictionary> {
  return dictionaryFor(await requestLocale());
}
