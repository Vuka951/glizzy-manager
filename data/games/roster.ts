import { GAMES_UI } from '@/data/games/locale';
import type { DuelCharacter } from '@/data/games/glizzyDuel';

// The order is the league's seeding order and stays in code. The names are
// words like any other (the tax inspector is a job title) and come from the dictionary,
// so on the server they are the default language's: the server deals in slugs
const ROSTER_SLUGS = [
  'vuka',
  'dax',
  'kosta',
  'cone',
  'dusan',
  'nikola',
  'jovan',
  'bane',
  'tax-inspector',
  'steva',
  'dzamila',
  'zeka',
  'halvard',
  'stojan',
  'tihomir',
  'miki',
] as const satisfies readonly (keyof typeof GAMES_UI.roster.names)[];

export const CHARACTER_ROSTER: DuelCharacter[] = ROSTER_SLUGS.map(
  (slug) => ({
    slug,
    name: GAMES_UI.roster.names[slug],
    portrait: `/characters/${slug}.svg`,
  }),
);
