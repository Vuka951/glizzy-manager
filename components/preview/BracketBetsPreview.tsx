"use client";

import { useState } from "react";
import CupBetBoard from "@/components/games/career/CupBetBoard";
import TournamentBracket from "@/components/games/tournament/TournamentBracket";
import { CAREER_BET_STAKE } from "@/data/games/careerEconomy";
import type { DuelCharacter } from "@/data/games/glizzyDuel";
import {
  cupBetKey,
  type CupMatch,
  type CupMatchBet,
} from "@/lib/utils/tournamentSim";

const START_BALANCE = 300;

const ODDS = { a: 1.4, b: 2.6 };

function sampleRounds(slugs: string[]): CupMatch[][] {
  const opening = Array.from({ length: 8 }, (_, index): CupMatch => ({
    round: 0,
    index,
    a: slugs[index * 2],
    b: slugs[index * 2 + 1],
    result:
      index < 2
        ? { turns: [], livesA: 2, livesB: 1, winner: index === 0 ? "a" : "b" }
        : null,
  }));
  const empty = (round: number, count: number) =>
    Array.from({ length: count }, (_, index): CupMatch => ({
      round,
      index,
      a: round === 1 && index === 0 ? opening[0].a : null,
      b: round === 1 && index === 0 ? opening[1].b : null,
      result: null,
    }));
  return [opening, empty(1, 4), empty(2, 2), empty(3, 1)];
}

const SETTLED: Record<string, CupMatchBet> = {
  [cupBetKey(0, 0)]: { side: "a", stake: 10, odds: 1.4, won: true, payout: 14 },
  [cupBetKey(0, 1)]: { side: "a", stake: 25, odds: 1.4, won: false },
};

// The career's round of sixteen with the bookie open: two matches already
// played and settled, the rest waiting for a side
export default function BracketBetsPreview({
  characters,
}: {
  characters: DuelCharacter[];
}) {
  const [rounds] = useState(() => sampleRounds(characters.map((c) => c.slug)));
  const [bets, setBets] = useState<Record<string, CupMatchBet>>(SETTLED);
  const [stake, setStake] = useState(CAREER_BET_STAKE);
  const characterBySlug = new Map(characters.map((c) => [c.slug, c]));
  const balance =
    START_BALANCE -
    Object.values(bets)
      .filter((bet) => bet.won === undefined)
      .reduce((sum, bet) => sum + bet.stake, 0);

  const toggleBet = (index: number, side: "a" | "b") => {
    const key = cupBetKey(0, index);
    setBets((prev) => {
      const next = { ...prev };
      if (prev[key]?.side === side) delete next[key];
      else next[key] = { side, stake, odds: ODDS[side] };
      return next;
    });
  };

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-sky-200/10 bg-slate-950/70 p-4">
      <CupBetBoard
        matches={rounds[0]}
        round={0}
        characterBySlug={characterBySlug}
        matchBets={bets}
        playerSlug={rounds[0][2].a as string}
        stake={stake}
        balance={balance}
        oddsFor={() => ODDS}
        onPickStake={setStake}
        onToggleBet={toggleBet}
        onWatch={() => undefined}
      />
      <TournamentBracket
        rounds={rounds}
        characterBySlug={characterBySlug}
        betSlug={rounds[0][2].a}
        currentRound={0}
        matchBets={bets}
      />
    </div>
  );
}
