import { GAMES_UI } from '@/data/games/locale';

export type AchievementGame = 'manager';

export type AchievementId =
  | 'career-first-title'
  | 'career-perfect-year'
  | 'career-overlord'
  | 'career-underdog'
  | 'career-rival-down'
  | 'career-sponsored'
  | 'career-leader'
  | 'career-favor'
  | 'career-donor'
  | 'career-lost-cause'
  | 'career-investor'
  | 'career-rich'
  | 'career-maxed'
  | 'career-media-payday'
  | 'career-plot-hit'
  | 'career-guard'
  | 'career-island'
  | 'career-meltdown'
  | 'career-decade';

export type Achievement = {
  id: AchievementId;
  game: AchievementGame;
  title: string;
  description: string;
};

export const CAREER_RICH_BALANCE = 1000;
export const CAREER_LONG_YEAR = 10;
export const CAREER_MEDIA_PAYDAY = 100;
export const CAREER_LOST_CAUSE_DONATION = 500;

const ORDER: { id: AchievementId; game: AchievementGame }[] = [
  { id: 'career-first-title', game: 'manager' },
  { id: 'career-perfect-year', game: 'manager' },
  { id: 'career-overlord', game: 'manager' },
  { id: 'career-underdog', game: 'manager' },
  { id: 'career-rival-down', game: 'manager' },
  { id: 'career-sponsored', game: 'manager' },
  { id: 'career-leader', game: 'manager' },
  { id: 'career-favor', game: 'manager' },
  { id: 'career-donor', game: 'manager' },
  { id: 'career-lost-cause', game: 'manager' },
  { id: 'career-investor', game: 'manager' },
  { id: 'career-rich', game: 'manager' },
  { id: 'career-maxed', game: 'manager' },
  { id: 'career-media-payday', game: 'manager' },
  { id: 'career-plot-hit', game: 'manager' },
  { id: 'career-guard', game: 'manager' },
  { id: 'career-island', game: 'manager' },
  { id: 'career-meltdown', game: 'manager' },
  { id: 'career-decade', game: 'manager' },
];

const ITEMS = GAMES_UI.achievements.items as Record<
  AchievementId,
  { title: string; description: string }
>;

export const achievements: Achievement[] = ORDER.map(({ id, game }) => ({
  id,
  game,
  title: ITEMS[id].title,
  description: ITEMS[id].description,
}));

export function achievementsForGame(game: string): Achievement[] {
  return achievements.filter((a) => a.game === game);
}
