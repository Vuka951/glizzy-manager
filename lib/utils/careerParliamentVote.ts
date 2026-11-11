import { AI_VOTE_WEIGHT, HUMAN_VOTE_WEIGHT } from '@/data/games/careerElections';

// One coach's voice in a chamber vote. The choice is any key the vote is
// about: a coalition, yes or no on a law
export type Ballot<C extends string = string> = {
  slug: string;
  human: boolean;
  weight: number;
  choice: C | null;
  // A human who let the clock run out; the AI voted in his name
  auto?: boolean;
  // Only on a redacted copy of an open vote: the choice is hidden but the
  // coach has voted
  voted?: boolean;
};

// The weight of a voice: the vote's own base for the seat, times five for a
// human coach
function voteWeight(human: boolean, base = AI_VOTE_WEIGHT): number {
  return base * (human ? HUMAN_VOTE_WEIGHT : 1);
}

export function newBallot<C extends string>(
  slug: string,
  human: boolean,
  base = AI_VOTE_WEIGHT,
): Ballot<C> {
  return { slug, human, weight: voteWeight(human, base), choice: null };
}

export function hasVoted(ballot: Ballot): boolean {
  return ballot.choice !== null || ballot.voted === true;
}

// The voter's choice goes in; anyone not on the roll is ignored
export function castBallot<C extends string>(
  ballots: Ballot<C>[],
  slug: string,
  choice: C,
): Ballot<C>[] {
  return ballots.map((b) =>
    b.slug === slug ? { ...b, choice, auto: undefined } : b,
  );
}

// Humans still to vote, in roll order
export function pendingHumans(ballots: Ballot[]): string[] {
  return ballots.filter((b) => b.human && !hasVoted(b)).map((b) => b.slug);
}

// Every empty ballot gets the AI's choice; the humans among them are marked
// so the result can say the clock voted for them
export function fillBallots<C extends string>(
  ballots: Ballot<C>[],
  aiChoice: (slug: string) => C,
): Ballot<C>[] {
  return ballots.map((b) =>
    b.choice !== null
      ? b
      : { ...b, choice: aiChoice(b.slug), ...(b.human ? { auto: true } : {}) },
  );
}

// Weighted votes per choice, every choice present even at zero
export function tallyBallots<C extends string>(
  ballots: Ballot<C>[],
  choices: C[],
): Record<C, number> {
  const tally = Object.fromEntries(choices.map((c) => [c, 0])) as Record<
    C,
    number
  >;
  ballots.forEach((b) => {
    if (b.choice !== null && b.choice in tally) tally[b.choice] += b.weight;
  });
  return tally;
}

// Most weight wins; a tie goes to whichever tied choice comes first in the
// given order
export function ballotWinner<C extends string>(
  tally: Record<C, number>,
  order: C[],
): C {
  return order.reduce((best, c) => (tally[c] > tally[best] ? c : best), order[0]);
}

// An open vote as one coach may see it: his own choice, and only whether
// everyone else has voted
export function redactBallots<C extends string>(
  ballots: Ballot<C>[],
  viewerSlug: string,
): Ballot<C>[] {
  return ballots.map((b) =>
    b.slug === viewerSlug
      ? b
      : { ...b, choice: null, auto: undefined, voted: hasVoted(b) },
  );
}

// The AI's pick: the best score after a random nudge of up to noise
export function aiPreferencePick<C extends string>(
  choices: C[],
  score: (choice: C) => number,
  noise: number,
  random: () => number = Math.random,
): C {
  let best = choices[0];
  let bestScore = -Infinity;
  choices.forEach((c) => {
    const s = score(c) + random() * noise;
    if (s > bestScore) {
      best = c;
      bestScore = s;
    }
  });
  return best;
}

// The order a closed vote is read out in: the humans spread evenly through
// the roll, the AI taken in turns across the choices so the count stays
// close, and the winning side held back to the end of every pass
export function countOrder<C extends string>(
  ballots: Ballot<C>[],
  winner: C | null,
): Ballot<C>[] {
  const late = (b: Ballot<C>) => (b.choice === winner ? 1 : 0);
  const humans = ballots.filter((b) => b.human).sort((a, b) => late(a) - late(b));
  const groups = new Map<C | null, Ballot<C>[]>();
  ballots
    .filter((b) => !b.human)
    .sort((a, b) => late(a) - late(b))
    .forEach((b) => groups.set(b.choice, [...(groups.get(b.choice) ?? []), b]));
  const ai: Ballot<C>[] = [];
  const queues = [...groups.values()];
  while (queues.some((q) => q.length > 0)) {
    queues.forEach((q) => {
      const next = q.shift();
      if (next) ai.push(next);
    });
  }
  const humanAt = new Set(
    humans.map((_, j) => Math.round(((j + 1) * ballots.length) / humans.length) - 1),
  );
  let h = 0;
  let a = 0;
  return ballots.map((_, i) => (humanAt.has(i) ? humans[h++] : ai[a++]));
}
