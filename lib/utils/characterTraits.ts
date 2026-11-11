import {
  EQUILIBRIUM_ROLLS,
  type MeterEquilibrium,
} from '@/data/games/careerEquilibria';
import { LORE_RIVAL_COUNTS } from '@/data/games/careerRivals';
import {
  SEASON_BUFF_CHANCE,
  SEASON_BUFF_WEIGHTS,
} from '@/data/games/careerSeasons';
import {
  AFFINITY_FAN_CHANCE,
  AFFINITY_FAN_MAX,
  AFFINITY_FAN_MIN,
  AFFINITY_LUKEWARM_CHANCE,
  AFFINITY_LUKEWARM_WEIGHT,
  AFFINITY_REFUSE_CHANCE,
  HOUSE_CHANCE,
  HOUSE_PARTIES,
  HOUSE_SHARE,
  SPONSOR_DEFS,
  SPONSOR_IDS,
} from '@/data/games/careerSponsors';
import {
  AI_AVOID_MAX,
  AI_AVOID_MIN,
  AI_FALLBACK_MAX,
  AI_FALLBACK_MIN,
  AI_FAVOURITE_MAX,
  AI_FAVOURITE_MIN,
  AI_TRAIT_CHANCE,
  AI_TRAIT_FAVOURITE,
  HIDING_SPOTS,
  type DuelAiProfile,
  type HidingSpotId,
  type SpotPreference,
} from '@/data/games/glizzyDuel';
import type { SponsorId } from '@/lib/utils/careerSave';
import { seededRandom, textHash } from '@/lib/utils/seededRandom';

// Everything a character is, beyond his meters, is a roll from his slug,
// which is his name in plain letters. Each trait draws from its own stream,
// so tuning one never reshuffles the others
function traitRandom(slug: string, trait: string): () => number {
  return seededRandom(textHash(`${trait}|${slug}`));
}

function between(random: () => number, min: number, max: number): number {
  return min + random() * (max - min);
}

function pickIndex(random: () => number, weights: readonly number[]): number {
  let cursor = random() * weights.reduce((sum, w) => sum + w, 0);
  for (let i = 0; i < weights.length; i += 1) {
    cursor -= weights[i];
    if (cursor < 0) return i;
  }
  return weights.length - 1;
}

const roundTo = (value: number, step: number) => Math.round(value / step) * step;

// The sims and the match engine ask for the same few slugs thousands of
// times, so each trait is rolled once per slug
const TRAIT_CACHE_LIMIT = 1024;

function cached<T>(roll: (slug: string) => T): (slug: string) => T {
  const cache = new Map<string, T>();
  return (slug) => {
    if (cache.has(slug)) return cache.get(slug) as T;
    if (cache.size >= TRAIT_CACHE_LIMIT) cache.clear();
    const value = roll(slug);
    cache.set(slug, value);
    return value;
  };
}

// The resting points the meters drift back to
export const equilibriumFor = cached((slug): MeterEquilibrium => {
  const random = traitRandom(slug, 'equilibrium');
  const drive = random() * 2 - 1;
  const roll = (meter: keyof MeterEquilibrium) => {
    const { center, drive: lean, spread, min, max, step } = EQUILIBRIUM_ROLLS[meter];
    const value = center + lean * drive + between(random, -spread, spread);
    return Math.max(min, Math.min(max, roundTo(value, step)));
  };
  return {
    stress: roll('stress'),
    appetite: roll('appetite'),
    ambition: roll('ambition'),
    ego: roll('ego'),
    fame: roll('fame'),
  };
});

// The calendar season this character is in form in, or null for none
export const inFormSeason = cached((slug): number | null => {
  const random = traitRandom(slug, 'season');
  if (random() >= SEASON_BUFF_CHANCE) return null;
  return pickIndex(random, SEASON_BUFF_WEIGHTS);
});

export const houseSponsor = cached(
  (slug): { sponsor: SponsorId; share: number } | null => {
    const random = traitRandom(slug, 'house');
    if (random() >= HOUSE_CHANCE) return null;
    return {
      sponsor: HOUSE_PARTIES[Math.floor(random() * HOUSE_PARTIES.length)],
      share: HOUSE_SHARE,
    };
  },
);

const affinityOverrides = cached((slug): Partial<Record<SponsorId, number>> => {
  const random = traitRandom(slug, 'affinity');
  const kind = random();
  const party = () => SPONSOR_IDS[Math.floor(random() * SPONSOR_IDS.length)];
  if (kind < AFFINITY_FAN_CHANCE) {
    return {
      [party()]: Math.round(between(random, AFFINITY_FAN_MIN, AFFINITY_FAN_MAX) * 100) / 100,
    };
  }
  if (kind < AFFINITY_FAN_CHANCE + AFFINITY_LUKEWARM_CHANCE) {
    const first = party();
    const rest = SPONSOR_IDS.filter((id) => id !== first);
    const second = rest[Math.floor(random() * rest.length)];
    return { [first]: AFFINITY_LUKEWARM_WEIGHT, [second]: AFFINITY_LUKEWARM_WEIGHT };
  }
  if (kind < AFFINITY_FAN_CHANCE + AFFINITY_LUKEWARM_CHANCE + AFFINITY_REFUSE_CHANCE) {
    return { [party()]: 0 };
  }
  return {};
});

export function sponsorInterest(slug: string, id: SponsorId): number {
  return affinityOverrides(slug)[id] ?? SPONSOR_DEFS[id].baseInterest;
}

function spotWeights(random: () => number): SpotPreference {
  const order = HIDING_SPOTS.map((spot) => spot.id)
    .map((id) => ({ id, key: random() }))
    .sort((a, b) => a.key - b.key)
    .map(({ id }) => id);
  const favourite =
    random() < AI_TRAIT_CHANCE
      ? AI_TRAIT_FAVOURITE
      : between(random, AI_FAVOURITE_MIN, AI_FAVOURITE_MAX);
  const weights: [HidingSpotId, number][] = [
    [order[0], favourite],
    [order[1], between(random, AI_FALLBACK_MIN, AI_FALLBACK_MAX)],
    [order[2], between(random, AI_AVOID_MIN, AI_AVOID_MAX)],
  ];
  return Object.fromEntries(
    weights.map(([id, weight]) => [id, Math.round(weight * 20) / 20]),
  );
}

export const duelAiProfile = cached((slug): DuelAiProfile => {
  const random = traitRandom(slug, 'duel');
  const hide = spotWeights(random);
  return { hide, seek: spotWeights(random) };
});

// The old feuds a character brings into his league: a few of the others,
// the same ones every time this league plays
export function loreRivals(slug: string, leagueSlugs: readonly string[]): string[] {
  const random = traitRandom(slug, 'rivals');
  const count = LORE_RIVAL_COUNTS[Math.floor(random() * LORE_RIVAL_COUNTS.length)];
  return leagueSlugs
    .filter((other) => other !== slug)
    .map((other) => ({ other, key: textHash(`rival|${slug}|${other}`) }))
    .sort((a, b) => a.key - b.key)
    .slice(0, count)
    .map(({ other }) => other);
}
