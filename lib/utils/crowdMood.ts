// The hall has no loyalty, only a preference. It leans toward the bigger name
// without ever fully committing, so an unknown can still have the room.
export const CROWD_LEAN = 1.4;
export const CROWD_MIN_CHANCE = 0.15;
// A nobody lifting the trophy is met with more silence than noise; a star
// gets the hall shaking. Multiplies the base sound volume.
export const CROWD_QUIET = 0.55;
export const CROWD_LOUD = 1.3;
// The final is the final: whatever the room was going to do, it does harder
export const FINAL_CROWD_BOOST = 1.35;
// Below this, the crowd would rather boo the winner than celebrate a stranger
export const CROWD_CHEER_FAME_PIVOT = 45;
// Some nights the hall simply does not react. Never in a final, where
// somebody in the room always has something to say
export const CROWD_CRICKETS_CHANCE = 0.12;

export function crowdGoesQuiet(isFinal: boolean): boolean {
  return !isFinal && Math.random() < CROWD_CRICKETS_CHANCE;
}

export const NEUTRAL_FAME = 50;

const clamp01to100 = (value: number) => Math.max(0, Math.min(100, value));

// How likely the crowd is to back the first name over the second
export function crowdFavourChance(fame: number, rivalFame: number): number {
  const raw = 0.5 + ((fame - rivalFame) / 200) * CROWD_LEAN;
  return Math.max(CROWD_MIN_CHANCE, Math.min(1 - CROWD_MIN_CHANCE, raw));
}

// Whom the hall came to see. Weighted by fame, decided by the coin
export function pickCrowdFavourite(
  slugA: string,
  fameA: number,
  slugB: string,
  fameB: number,
): string {
  return Math.random() < crowdFavourChance(fameA, fameB) ? slugA : slugB;
}

// How loud the room is about it, before the final gets its boost
export function crowdIntensity(fame: number, boost = 1): number {
  const share = clamp01to100(fame) / 100;
  return (CROWD_QUIET + (CROWD_LOUD - CROWD_QUIET) * share) * boost;
}

// How many of his own people turn up. A nobody brings a couple of cousins,
// a star fills both sides of the table
export const CROWD_MIN_SIZE = 2;
export const CROWD_MAX_SIZE = 14;

export function crowdSize(fame: number): number {
  const share = clamp01to100(fame) / 100;
  return CROWD_MIN_SIZE + Math.round(share * (CROWD_MAX_SIZE - CROWD_MIN_SIZE));
}

// How worked up a character's own stand is: a star's fans jump faster and
// wave harder, an unknown's section barely moves
export function crowdHype(fame: number): {
  bounce: string;
  opacity: string;
} {
  const share = clamp01to100(fame) / 100;
  if (share >= 0.7) {
    return { bounce: '[animation-duration:0.9s]', opacity: 'opacity-100' };
  }
  if (share >= 0.35) {
    return { bounce: '[animation-duration:1.8s]', opacity: 'opacity-100' };
  }
  return { bounce: '[animation-duration:3.2s]', opacity: 'opacity-70' };
}

// Whether the podium celebrates the champion or lets them know the room
// wanted someone else. Fame decides the odds, the coin decides the night
export function crowdCheersChampion(fame: number): boolean {
  const share = clamp01to100(fame) / 100;
  const pivot = CROWD_CHEER_FAME_PIVOT / 100;
  const chance = Math.max(
    CROWD_MIN_CHANCE,
    Math.min(1 - CROWD_MIN_CHANCE, 0.5 + (share - pivot) * CROWD_LEAN),
  );
  return Math.random() < chance;
}
