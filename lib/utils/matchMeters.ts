import type {
  CupMatchResult,
  MatchMeterSnapshot,
} from "@/lib/utils/tournamentSim";

export type MeterDelta = {
  side: "a" | "b";
  stress: number;
  appetite: number;
};

// The meters as they stand once this many turns have been revealed; null for
// results played before the sim recorded them
export function liveMatchMeters(
  result: CupMatchResult,
  revealedCount: number,
): MatchMeterSnapshot | null {
  const track = result.meters;
  if (!track?.length) return null;
  return track[Math.min(revealedCount, track.length - 1)];
}

// What one turn did to its seeker's meters; null when nothing moved
export function matchMeterDelta(
  result: CupMatchResult,
  turnIndex: number,
): MeterDelta | null {
  const track = result.meters;
  if (!track || turnIndex + 1 >= track.length) return null;
  const before = track[turnIndex];
  const after = track[turnIndex + 1];
  const side = result.turns[turnIndex].seeker;
  const stress =
    side === "a"
      ? after.stressA - before.stressA
      : after.stressB - before.stressB;
  const appetite =
    side === "a"
      ? after.appetiteA - before.appetiteA
      : after.appetiteB - before.appetiteB;
  if (stress === 0 && appetite === 0) return null;
  return { side, stress, appetite };
}
