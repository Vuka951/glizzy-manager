import TournamentBracket from "@/components/games/tournament/TournamentBracket";
import MatchEndBadge, {
  type MatchEnding,
} from "@/components/games/tournament/MatchEndBadge";
import { previewRoster } from "@/components/preview/previewRoster";
import { GAMES_UI } from "@/data/games/locale";
import type { SponsorId } from "@/lib/utils/careerSave";
import type {
  CupMatch,
  CupMatchResult,
  CupTurn,
} from "@/lib/utils/tournamentSim";

const TURN: CupTurn = {
  matchRound: 1,
  seeker: "a",
  picked: "hat",
  hidden: "sock",
  hit: false,
};

// Past the regulation cap of any two characters, so the bracket reads it as a
// sudden-death finish
const SUDDEN_DEATH_TURNS = 30;

type Ending = MatchEnding | "normal";

function resultFor(
  winner: "a" | "b",
  ending: Ending,
  removedBy?: SponsorId,
): CupMatchResult {
  const base: CupMatchResult = {
    turns:
      ending === "tiebreak" ? Array(SUDDEN_DEATH_TURNS).fill(TURN) : [TURN, TURN],
    livesA: winner === "a" ? 2 : 0,
    livesB: winner === "b" ? 1 : 0,
    winner,
  };
  if (ending === "normal" || ending === "tiebreak") return base;
  return removedBy
    ? { ...base, reason: ending, removedBy }
    : { ...base, reason: ending };
}

type Plan = { winner: "a" | "b"; ending: Ending; removedBy?: SponsorId };

const PLAN: Plan[][] = [
  [
    { winner: "a", ending: "police" },
    { winner: "b", ending: "meltdown" },
    { winner: "a", ending: "overfull-forfeit" },
    { winner: "b", ending: "withdrawn" },
    { winner: "a", ending: "removed", removedBy: "red" },
    { winner: "b", ending: "tiebreak" },
    { winner: "a", ending: "normal" },
    { winner: "b", ending: "removed" },
  ],
  [
    { winner: "a", ending: "removed", removedBy: "blue" },
    { winner: "b", ending: "overfull-forfeit" },
    { winner: "a", ending: "normal" },
    { winner: "b", ending: "removed", removedBy: "yellow" },
  ],
  [
    { winner: "a", ending: "meltdown" },
    { winner: "b", ending: "removed", removedBy: "green" },
  ],
  [{ winner: "a", ending: "tiebreak" }],
];

// Plays the plan through the bracket, each winner moving on to the next
// round's slot
function sampleRounds(slugs: string[]): CupMatch[][] {
  const rounds: CupMatch[][] = [];
  let entrants = slugs.slice(0, 16);
  PLAN.forEach((plans, round) => {
    const matches = plans.map((plan, index): CupMatch => ({
      round,
      index,
      a: entrants[index * 2],
      b: entrants[index * 2 + 1],
      result: resultFor(plan.winner, plan.ending, plan.removedBy),
    }));
    rounds.push(matches);
    entrants = matches.map((m) => (m.result!.winner === "a" ? m.a! : m.b!));
  });
  return rounds;
}

const LEGEND: { ending: MatchEnding; removedBy?: SponsorId; label: string }[] =
  [
    { ending: "police", label: GAMES_UI.cup.viewer.reasons.police },
    { ending: "meltdown", label: GAMES_UI.cup.viewer.reasons.meltdown },
    {
      ending: "overfull-forfeit",
      label: GAMES_UI.cup.viewer.reasons["overfull-forfeit"],
    },
    { ending: "withdrawn", label: GAMES_UI.cup.viewer.reasons.withdrawn },
    {
      ending: "removed",
      removedBy: "red",
      label: `${GAMES_UI.cup.viewer.reasons.removed} (party)`,
    },
    {
      ending: "removed",
      label: `${GAMES_UI.cup.viewer.reasons.removed} (no party)`,
    },
    { ending: "tiebreak", label: GAMES_UI.cup.bracket.suddenDeath },
  ];

export default function BracketEndingsPreview() {
  const roster = previewRoster();
  const characterBySlug = new Map(roster.map((c) => [c.slug, c]));
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-sky-200/10 bg-slate-950/70 p-4">
        <TournamentBracket
          rounds={sampleRounds(roster.map((c) => c.slug))}
          characterBySlug={characterBySlug}
          betSlug={null}
        />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {LEGEND.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-xl border border-sky-200/10 bg-slate-900/40 px-3 py-2"
          >
            <MatchEndBadge
              ending={item.ending}
              label={item.label}
              removedBy={item.removedBy}
              dense={false}
            />
            <span className="text-xs text-slate-300">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
