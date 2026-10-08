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

export type DuelCharacter = {
  slug: string;
  name: string;
  portrait: string | null;
};

export type SpotPreference = Partial<Record<HidingSpotId, number>>;

export type DuelAiProfile = {
  hide: SpotPreference;
  seek: SpotPreference;
};

export const DEFAULT_AI_PROFILE: DuelAiProfile = {
  hide: {},
  seek: {},
};

// Weights multiply the base chance per spot, for both hiding and grabbing.
// Every character rates all three spots: a favourite, a fallback and one he
// avoids. The usual band is 2 / 1 / 0.75, so a read pays off often enough to
// be worth acting on; the trait characters lean harder.
export const DUEL_AI_PROFILES: Record<string, DuelAiProfile> = {
  vuka: {
    hide: { box: 2.1, hat: 1, sock: 0.75 },
    seek: { hat: 2, box: 1, sock: 0.8 },
  },
  dax: {
    hide: { hat: 2, box: 1, sock: 0.75 },
    seek: { box: 2, sock: 0.95, hat: 0.8 },
  },
  kosta: {
    hide: { hat: 1.9, sock: 1.05, box: 0.8 },
    seek: { sock: 2, hat: 1, box: 0.75 },
  },
  cone: {
    hide: { box: 2.1, sock: 0.95, hat: 0.75 },
    seek: { sock: 2, box: 1, hat: 0.75 },
  },
  dusan: {
    hide: { sock: 2, box: 1, hat: 0.75 },
    seek: { hat: 2.1, box: 0.95, sock: 0.75 },
  },
  nikola: {
    hide: { sock: 2.1, box: 1, hat: 0.7 },
    seek: { box: 2.05, hat: 0.95, sock: 0.75 },
  },
  'jovan': {
    hide: { hat: 2.05, sock: 0.95, box: 0.8 },
    seek: { box: 2.1, hat: 0.95, sock: 0.75 },
  },
  'bane': {
    hide: { box: 2.1, hat: 1, sock: 0.75 },
    seek: { sock: 2, box: 1, hat: 0.75 },
  },
  'tax-inspector': {
    hide: { hat: 1.9, box: 1, sock: 0.8 },
    seek: { box: 2.3, sock: 0.9, hat: 0.7 },
  },
  steva: {
    hide: { sock: 2.1, box: 1, hat: 0.75 },
    seek: { box: 2, hat: 1, sock: 0.75 },
  },
  'dzamila': {
    hide: { box: 2.05, sock: 1, hat: 0.75 },
    seek: { hat: 2.05, sock: 0.95, box: 0.8 },
  },
  'zeka': {
    hide: { box: 2, hat: 0.95, sock: 0.8 },
    seek: { sock: 2.3, hat: 0.95, box: 0.75 },
  },
  'halvard': {
    hide: { sock: 2.15, box: 0.95, hat: 0.75 },
    seek: { hat: 2, box: 1, sock: 0.75 },
  },
  'stojan': {
    hide: { box: 2.15, sock: 0.95, hat: 0.75 },
    seek: { hat: 2, box: 1, sock: 0.8 },
  },
  'tihomir': {
    hide: { hat: 2.05, box: 1, sock: 0.75 },
    seek: { box: 2, hat: 1, sock: 0.8 },
  },
  'miki': {
    hide: { hat: 1.9, sock: 1.05, box: 0.75 },
    seek: { box: 2.1, hat: 0.95, sock: 0.75 },
  },
};
