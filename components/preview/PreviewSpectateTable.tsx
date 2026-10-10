import MatchStatsStrip from "@/components/games/match/MatchStatsStrip";
import SpectateTable from "@/components/games/match/SpectateTable";
import type { DuelCharacter, HidingSpotId } from "@/data/games/glizzyDuel";
import { FULL_REVEAL, type ScoutReveal } from "@/lib/utils/careerScouting";
import type { CharacterCareerState } from "@/lib/utils/careerSave";

const spotVariants: Record<HidingSpotId, number> = { box: 0, hat: 1, sock: 2 };

export default function PreviewSpectateTable({
  top,
  bottom,
  topState,
  bottomState,
  topReveal = FULL_REVEAL,
  bottomReveal = FULL_REVEAL,
}: {
  top: DuelCharacter;
  bottom: DuelCharacter;
  topState: CharacterCareerState;
  bottomState: CharacterCareerState;
  topReveal?: ScoutReveal;
  bottomReveal?: ScoutReveal;
}) {
  return (
    <SpectateTable
      top={top}
      bottom={bottom}
      topLives={3}
      bottomLives={2}
      topCap={4}
      bottomCap={3}
      topMood={topState}
      bottomMood={bottomState}
      topFame={topState.fame}
      bottomFame={bottomState.fame}
      spotVariants={spotVariants}
      glizzyVariant={0}
      phase={{ kind: "think", seeker: "bottom" }}
      outcome={null}
      betSlug={top.slug}
      topStats={<MatchStatsStrip ch={topState} reveal={topReveal} seat="top" />}
      bottomStats={
        <MatchStatsStrip ch={bottomState} reveal={bottomReveal} seat="bottom" />
      }
    />
  );
}
