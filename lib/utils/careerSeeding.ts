import type { CupMatch } from '@/lib/utils/tournamentSim';

// Standard seeded pairing: 1 and 2 can only meet in the final
const SEED_PAIRS = [
  [0, 15],
  [7, 8],
  [3, 12],
  [4, 11],
  [1, 14],
  [6, 9],
  [2, 13],
  [5, 10],
];

// The table seeds the bracket as it stands: the whole league goes straight
// from the paper to the round of sixteen
export function seededRounds(seeds: string[]): CupMatch[][] {
  const rounds: CupMatch[][] = [];
  for (let size = SEED_PAIRS.length; size >= 1; size = Math.floor(size / 2)) {
    rounds.push(
      Array.from({ length: size }, (_, index) => ({
        round: rounds.length,
        index,
        a: null,
        b: null,
        result: null,
      }))
    );
  }
  rounds[0].forEach((match, i) => {
    match.a = seeds[SEED_PAIRS[i][0]];
    match.b = seeds[SEED_PAIRS[i][1]];
  });
  return rounds;
}
