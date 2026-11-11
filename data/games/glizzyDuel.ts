export type HidingSpotId = 'hat' | 'sock' | 'box';

export type HidingSpot = { id: HidingSpotId };

export const HIDING_SPOTS: HidingSpot[] = [
  { id: 'hat' },
  { id: 'sock' },
  { id: 'box' },
];

export const SPOT_VARIANT_COUNT = 3;
export const GLIZZY_VARIANT_COUNT = 4;
export const STARTING_LIVES = 3;
// A lifted object shows the glizzy after the land, then the table holds
// the sight before the next turn
export const REVEAL_LAND_MS = 700;
export const REVEAL_HOLD_MS = 1700;

export type DuelCharacter = {
  slug: string;
  name: string;
};

export type SpotPreference = Partial<Record<HidingSpotId, number>>;

export type DuelAiProfile = {
  hide: SpotPreference;
  seek: SpotPreference;
};

// Weights multiply the base chance per spot, for both hiding and grabbing.
// Every character rates all three spots, rolled from his name: a favourite,
// a fallback and one he avoids. The usual band keeps a read paying off often
// enough to be worth acting on; at the trait chance he leans harder
export const AI_FAVOURITE_MIN = 1.9;
export const AI_FAVOURITE_MAX = 2.15;
export const AI_TRAIT_FAVOURITE = 2.3;
export const AI_TRAIT_CHANCE = 0.12;
export const AI_FALLBACK_MIN = 0.95;
export const AI_FALLBACK_MAX = 1.05;
export const AI_AVOID_MIN = 0.7;
export const AI_AVOID_MAX = 0.8;
