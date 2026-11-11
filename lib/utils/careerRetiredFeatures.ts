import type {
  CharacterCareerState,
  MailItem,
  NewsItem,
  Parliament,
} from '@/lib/utils/careerSave';

// Saves and rooms from before the plots, the state of emergency and the
// island weekend law left the game still carry their fields and stories;
// they read without them
const RETIRED_TEMPLATE = /^(grand|emergency)-/;

type Issue = { news: NewsItem[]; year: number; season: number };

type SharedBooks = {
  characters: Record<string, CharacterCareerState>;
  parliament?: Parliament;
  newsQueue: NewsItem[];
  lastIssue?: Issue;
  prevIssue?: Issue;
};

function without<T extends object>(value: T, keys: string[]): T {
  if (!keys.some((key) => key in value)) return value;
  const out = { ...value } as Record<string, unknown>;
  keys.forEach((key) => delete out[key]);
  return out as T;
}

// Tolerates a list a damaged save left out
export function withoutRetiredStories<T extends NewsItem | MailItem>(
  items: T[],
): T[] {
  return Array.isArray(items)
    ? items.filter((item) => !RETIRED_TEMPLATE.test(item.templateKey))
    : items;
}

function currentIssue(issue: Issue | undefined): Issue | undefined {
  return issue && { ...issue, news: withoutRetiredStories(issue.news) };
}

export function withoutRetiredFeatures<T extends SharedBooks>(state: T): T {
  const characters = Object.fromEntries(
    Object.entries(state.characters).map(([slug, ch]) => [
      slug,
      without(ch, ['islandWeekendYear']),
    ]),
  );
  return without(
    {
      ...state,
      characters,
      ...(state.parliament
        ? { parliament: without(state.parliament, ['plotPenalties']) }
        : {}),
      newsQueue: withoutRetiredStories(state.newsQueue),
      ...(state.lastIssue ? { lastIssue: currentIssue(state.lastIssue) } : {}),
      ...(state.prevIssue ? { prevIssue: currentIssue(state.prevIssue) } : {}),
    },
    ['grandSabotage'],
  );
}

export function withoutRetiredSettings<T extends object>(settings: T): T {
  return without(settings, ['grandSeconds']);
}
