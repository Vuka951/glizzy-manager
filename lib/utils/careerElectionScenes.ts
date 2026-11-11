import type { ElectionResult } from '@/data/games/careerElections';
import { SPONSOR_IDS } from '@/data/games/careerSponsors';
import { houseSponsor } from '@/lib/utils/characterTraits';
import {
  ELECTION_LOSS_SCENES,
  ELECTION_WIN_SCENES,
  GOVERNMENT_VARIANT_SEPARATOR,
  type CoalitionSceneId,
  type ElectionLossSceneId,
  type ElectionWinSceneId,
} from '@/lib/constants/electionCutscenes';
import { rankBySeeding, seedingKey } from '@/lib/utils/careerPoints';
import type { SavedCareer, SponsorId } from '@/lib/utils/careerSave';
import type { QuotePlayback } from '@/lib/utils/quoteCutsceneTriggers';

// The face a party shows when nobody signed to it can stand in: the first
// of its house men in the league, when it has one
function partyFigurehead(state: SavedCareer, party: SponsorId): string | undefined {
  return Object.keys(state.characters).find(
    (slug) => houseSponsor(slug)?.sponsor === party,
  );
}

type Rng = () => number;

const pickOf = <T,>(items: readonly T[], rng: Rng): T =>
  items[Math.floor(rng() * items.length)];

// Who walks out for the party on election night: whoever put the most into
// its chest this time, else its best man on the table, else its figurehead,
// else the man at the top of the table
export function partyTopPerson(state: SavedCareer, party: SponsorId): string {
  const table = rankBySeeding(state.characters, seedingKey(state));
  const members = table.filter(
    (slug) => state.characters[slug].sponsor?.sponsorId === party,
  );
  const donors = state.parliament?.donors ?? {};
  const topDonor = members
    .filter((slug) => (donors[slug] ?? 0) > 0)
    .sort((a, b) => donors[b] - donors[a])[0];
  return topDonor ?? members[0] ?? partyFigurehead(state, party) ?? table[0];
}

// The night's loser: the leader the count threw out, else the list that
// lost the most seats, else the smallest one
function electionLoser(
  state: SavedCareer,
  result: ElectionResult,
): SponsorId {
  const before = state.parliament;
  const oldLeader = before?.government[0];
  if (before && before.elections > 0 && oldLeader && oldLeader !== result.government[0])
    return oldLeader;
  const drop = (party: SponsorId) =>
    (before && before.elections > 0 ? before.seats[party] : 0) -
    result.seats[party];
  return [...SPONSOR_IDS]
    .filter((party) => party !== result.government[0])
    .sort(
      (a, b) =>
        drop(b) - drop(a) ||
        result.seats[a] - result.seats[b] ||
        a.localeCompare(b),
    )[0];
}

function winScenePool(result: ElectionResult): ElectionWinSceneId[] {
  return ELECTION_WIN_SCENES.filter(
    (id) => id !== 'election-all-channels' || result.government.length === 1,
  );
}

function coalitionSceneFor(
  result: ElectionResult,
  rng: Rng = Math.random,
): CoalitionSceneId | null {
  if (result.government.length >= 3) return 'coalition-three-way';
  if (result.government.length < 2) return null;
  return rng() < 0.5 ? 'coalition-small-chair' : 'coalition-reconciliation';
}

// Every count airs one story from a winner or a loser, a coin decides
// which, and a government of several lists signs on camera after it.
// Reads the save from before the result is applied, while the donors and
// the old chamber are still on it
export function electionScenes(
  state: SavedCareer,
  result: ElectionResult,
  rng: Rng = Math.random,
): QuotePlayback[] {
  const winner = result.government[0];
  const loser = electionLoser(state, result);
  const plays: QuotePlayback[] = [
    rng() < 0.5
      ? {
          id: pickOf<ElectionWinSceneId>(winScenePool(result), rng),
          speaker: partyTopPerson(state, winner),
          variant: winner,
          lineRoll: rng(),
        }
      : {
          id: pickOf<ElectionLossSceneId>(ELECTION_LOSS_SCENES, rng),
          speaker: partyTopPerson(state, loser),
          variant: [loser, winner].join(GOVERNMENT_VARIANT_SEPARATOR),
          lineRoll: rng(),
        },
  ];
  const coalition = coalitionSceneFor(result, rng);
  if (coalition) {
    const [speaker, other, third] = result.government.map((party) =>
      partyTopPerson(state, party),
    );
    plays.push({
      id: coalition,
      speaker,
      other,
      ...(third ? { third } : {}),
      variant: result.government.join(GOVERNMENT_VARIANT_SEPARATOR),
      lineRoll: rng(),
    });
  }
  return plays;
}

// A loss scene carries the loser and the night's winner, in that order
export function lossOfVariant(variant: string | undefined): {
  loser: SponsorId;
  winner: SponsorId;
} {
  const [loser = 'red', named] = governmentOfVariant(variant);
  const winner = named ?? SPONSOR_IDS.find((party) => party !== loser);
  return { loser, winner: winner ?? 'blue' };
}

// A coalition scene's variant back as the parties it seats, leader first
export function governmentOfVariant(variant: string | undefined): SponsorId[] {
  return (variant ?? '')
    .split(GOVERNMENT_VARIANT_SEPARATOR)
    .filter((party): party is SponsorId =>
      (SPONSOR_IDS as string[]).includes(party),
    );
}
