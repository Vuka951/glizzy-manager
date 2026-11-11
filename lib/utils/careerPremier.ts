import {
  PARTY_SEAT_ORDER,
  type ElectionResult,
} from '@/data/games/careerElections';
import { GAMES_UI } from '@/data/games/locale';
import {
  PREMIER_CLIPS,
  premierClipSrc,
  type PremierClip,
} from '@/lib/constants/electionPremier';
import { electedPremier } from '@/lib/utils/careerElections';
import type { SavedCareer, SponsorId } from '@/lib/utils/careerSave';
import { isSponsorId } from '@/lib/utils/careerSponsors';
import { fmt } from '@/lib/utils/format';

// Who the new premier blames: the list that governed before him, the
// strongest list he beat when his own was re-elected, or the Savez when
// the town has never had a government
export type PremierBlame = 'previous' | 'rival' | 'first';

export type PremierSpeech = {
  slug: string;
  party: SponsorId;
  blame: PremierBlame;
  target: SponsorId | null;
  // Picks the line, from the premier and the date so a replay says the same
  // but the first election of every career does not
  seed: number;
};

const PREMIER = GAMES_UI.career.premier;
const NEWS_QUOTES = PREMIER.quotes.news as Record<PremierBlame, string[]>;
const CLIP_LINES = PREMIER.quotes.cutscene as Record<string, string>;
const BLAMES: PremierBlame[] = ['previous', 'rival', 'first'];

function blameOf(
  state: SavedCareer,
  result: ElectionResult,
): Pick<PremierSpeech, 'blame' | 'target'> {
  const leader = result.government[0];
  const previous =
    state.parliament?.government[0] ??
    state.governments?.at(-1)?.government[0] ??
    null;
  if (previous && previous !== leader) {
    return { blame: 'previous', target: previous };
  }
  const beaten = PARTY_SEAT_ORDER.filter(
    (id) => !result.government.includes(id),
  ).sort((a, b) => result.seats[b] - result.seats[a]);
  if (previous && beaten.length > 0) {
    return { blame: 'rival', target: beaten[0] };
  }
  return { blame: 'first', target: null };
}

// Read before the count is applied: the state still holds the outgoing
// government
export function electionPremier(
  state: SavedCareer,
  result: ElectionResult,
): PremierSpeech | null {
  const party = result.government[0];
  const slug = electedPremier(state, result);
  if (!party || !slug) return null;
  return {
    slug,
    party,
    ...blameOf(state, result),
    seed:
      state.year * 4 +
      state.season +
      [...slug].reduce((sum, char) => sum + char.charCodeAt(0), 0),
  };
}

function premierQuote(speech: PremierSpeech): string {
  const lines = NEWS_QUOTES[speech.blame];
  const forms = speech.target
    ? PREMIER.colors[speech.target]
    : {};
  return fmt(lines[speech.seed % lines.length], forms);
}

// The recorded broadcast line: the clip naming the blamed list's colour when
// there is one, otherwise a generic one
export function premierClip(
  speech: PremierSpeech,
): PremierClip & { src: string; text: string } {
  const color = speech.target;
  const named = PREMIER_CLIPS.filter((clip) => clip.color === color);
  const pool =
    color && named.length > 0
      ? named
      : PREMIER_CLIPS.filter((clip) => clip.color === null);
  const clip = pool[speech.seed % pool.length];
  return {
    ...clip,
    src: premierClipSrc(clip.id),
    text: CLIP_LINES[clip.id],
  };
}

export function premierNewsParams(
  speech: PremierSpeech,
): Record<string, string | number> {
  return {
    premier: speech.slug,
    blame: speech.blame,
    target: speech.target ?? '',
    seed: speech.seed,
  };
}

// Stories printed before the office carry no premier and read as they did
export function premierFromParams(
  params: Record<string, string | number>,
  party: SponsorId | undefined,
): PremierSpeech | null {
  const slug = params.premier;
  const blame = BLAMES.find((b) => b === params.blame);
  if (typeof slug !== 'string' || !slug || !blame || !party) return null;
  const target = String(params.target ?? '');
  return {
    slug,
    party,
    blame,
    target: isSponsorId(target) ? target : null,
    seed: Number(params.seed) || 0,
  };
}

export function premierArticleTail(
  speech: PremierSpeech,
  name: string,
): string {
  return `${fmt(PREMIER.news.line, { premier: name })} ${fmt(
    PREMIER.news.quote,
    { quote: premierQuote(speech) },
  )}`;
}
