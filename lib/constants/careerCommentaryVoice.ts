import { ACTIVE_LOCALE, GAMES_UI, type Locale } from '@/data/games/locale';

// Languages with a rendered voice bank under public/. Everywhere else the
// commentator's lines show as captions only. `npm run check:audio` expects
// every line's clip under each listed locale's folder
export const COMMENTARY_VOICE_LOCALES: readonly Locale[] = ['en', 'sr'];

export const COMMENTARY_VOICED = COMMENTARY_VOICE_LOCALES.includes(ACTIVE_LOCALE);

export const COMMENTARY_CLIP_BASE = `/games/audio/commentary/career/${ACTIVE_LOCALE}`;

// Lines a take cannot say: the league is drawn at random, so no recording
// knows a character's name or epithet. Both locales carry the same
// placeholders, so the active dictionary decides for every language
export const CHARACTER_NAMING_LINES: ReadonlySet<string> = new Set(
  Object.entries(GAMES_UI.commentary.lines)
    .filter(([, copy]) => /\{(?:name|epithet)\}/.test(copy.text))
    .map(([id]) => id),
);

// Lines that show as captions only: the ones naming a character, and the
// election lines whose takes were recorded under the parties' old names,
// until the bank is re-rendered
export const CAPTION_ONLY_LINES: ReadonlySet<string> = new Set([
  ...CHARACTER_NAMING_LINES,
  ...['blue', 'green', 'yellow', 'red'].flatMap((party) =>
    [1, 2, 3].map((take) => `election-${party}-${take}`),
  ),
]);
