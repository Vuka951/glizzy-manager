import { GAMES_UI } from '@/data/games/locale';
import type { NewsItem, SavedCareer } from '@/lib/utils/careerSave';

export type TownIssue = { news: NewsItem[]; season: number; year: number };

// A paper the kiosk can hand over this window. `printed` is false only for
// the league paper that is ready but not out yet: reading it prints it
export type TownPaper = {
  key: 'league' | 'last' | 'prev';
  issue: TownIssue;
  printed: boolean;
  // A cup recap rather than a pre-cup paper
  recap: boolean;
};

const isRecap = (issue: TownIssue) =>
  issue.news.some((item) => item.kind === 'recap');

// Every Glizzy Gazette issue on the kiosk's counter: this window's league
// paper once the month is spent (`leagueReady`), the last issue the league
// printed (the previous cup's recap, or the paper that led into it when the
// cup made no news), and the pre-cup paper that recap replaced. Newest first
export function townPapers(
  career: SavedCareer,
  leagueReady: boolean,
): TownPaper[] {
  const papers: TownPaper[] = [];
  if (leagueReady) {
    papers.push({
      key: 'league',
      issue: {
        news: career.newsQueue,
        season: career.season,
        year: career.year,
      },
      printed: career.newsSeen === true,
      recap: false,
    });
  }
  if (career.lastIssue) {
    papers.push({
      key: 'last',
      issue: career.lastIssue,
      printed: true,
      recap: isRecap(career.lastIssue),
    });
  }
  if (career.prevIssue) {
    papers.push({
      key: 'prev',
      issue: career.prevIssue,
      printed: true,
      recap: false,
    });
  }
  return papers;
}

const HEADLINES = GAMES_UI.career.newspaper.headlines as Record<string, string>;
const STORIES = GAMES_UI.career.news as unknown as Record<string, string>;

// Every headline an issue prints, its lead first, picked the way the paper
// itself picks its lead: the coalition vote, league news, then a story with
// a photo, then a signing or a firing. `headlineOf` is the paper's own
// headline, which can name the reader's premier
export function paperHeadlines(
  news: NewsItem[],
  headlineOf: (item: NewsItem) => string,
): string[] {
  const valid = news.filter(
    (item) => STORIES[item.templateKey] && HEADLINES[item.templateKey],
  );
  const lead =
    valid.find((item) => item.templateKey === 'election-coalition') ??
    valid.find((item) => item.kind === 'league') ??
    valid.find((item) => item.freezeframe) ??
    valid.find((item) => item.kind === 'signing' || item.kind === 'fired');
  const ordered = lead ? [lead, ...valid.filter((item) => item !== lead)] : valid;
  return [...new Set(ordered.map(headlineOf))];
}

// How large a cover can set a headline: the longest word decides, so a long
// word shrinks the type instead of breaking, and a long line drops a size
export function headlineTier(headline: string): 0 | 1 | 2 | 3 {
  const longest = Math.max(...headline.split(/\s+/).map((word) => word.length));
  const tier = longest <= 7 ? 0 : longest <= 9 ? 1 : longest <= 12 ? 2 : 3;
  return headline.length > 22 ? (Math.max(tier, 2) as 2 | 3) : tier;
}
