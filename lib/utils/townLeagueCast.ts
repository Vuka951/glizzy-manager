import type { SavedCareer } from '@/lib/utils/careerSave';

// How fast a walker's odds fall off, place by place, down the ranked names,
// and how much each time he has already been out takes off them
const FALLOFF = 0.85;
const REPEAT = 0.5;

// Who can walk in town, and the ranked ones among them: the other coaches'
// characters first, then the rest of the league in its own order. The
// player's own character is the big one in town and never one of them
export function townLeagueCast(
  career: SavedCareer,
  humanSlugs: string[],
  include: (slug: string) => boolean,
): { everyone: string[]; ranked: string[] } {
  const others = Object.keys(career.characters).filter(
    (slug) => slug !== career.playerSlug && include(slug),
  );
  const ranked = [
    ...new Set([
      ...humanSlugs.filter((slug) => others.includes(slug)),
      ...others,
    ]),
  ];
  return { everyone: ranked, ranked };
}

// One of `pool`, likelier the higher he stands in `ranked` and the less he
// has been out already, so the top names turn up most and the rest still do
export function townLeagueCastPick(
  ranked: string[],
  pool: string[],
  shown: (slug: string) => number,
  random: () => number = Math.random,
): string | null {
  const weights = pool.map((slug) => {
    const place = ranked.indexOf(slug);
    return FALLOFF ** (place < 0 ? ranked.length : place) / (1 + REPEAT * shown(slug));
  });
  let roll = random() * weights.reduce((sum, w) => sum + w, 0);
  for (let i = 0; i < pool.length; i += 1) {
    roll -= weights[i];
    if (roll < 0) return pool[i];
  }
  return pool[pool.length - 1] ?? null;
}

// The first faces out in town: the other coaches' characters, then a
// weighted draw that holds for the whole window
export function townLeagueFirstCast(
  { everyone, ranked }: { everyone: string[]; ranked: string[] },
  humanSlugs: string[],
  count: number,
  seed: number,
): string[] {
  let state = Math.imul(seed ^ 2166136261, 16777619) >>> 0;
  const random = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const cast = ranked.filter((slug) => humanSlugs.includes(slug)).slice(0, count);
  while (cast.length < count) {
    const slug = townLeagueCastPick(
      ranked,
      everyone.filter((s) => !cast.includes(s)),
      () => 0,
      random,
    );
    if (!slug) break;
    cast.push(slug);
  }
  return cast;
}
