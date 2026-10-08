import { ACTIVE_LOCALE, type Locale } from '@/data/games/locale';

// Languages with a rendered voice bank under public/. Everywhere else the
// commentator's lines show as captions only. To turn a language on, in this
// order: pick a voice with `npm run commentary:voices`, render the bank with
// `npm run commentary:render` (English; pass `--locale sr` for Serbian), add
// the locale here (for example `['en']`), then run `npm run check:audio`,
// which expects every line's clip under that locale's folder
export const COMMENTARY_VOICE_LOCALES: readonly Locale[] = ['en', 'sr'];

export const COMMENTARY_VOICED = COMMENTARY_VOICE_LOCALES.includes(ACTIVE_LOCALE);

export const COMMENTARY_CLIP_BASE = `/games/audio/commentary/career/${ACTIVE_LOCALE}`;
