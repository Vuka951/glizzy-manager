import MatchEventOverlay from '@/components/games/match/MatchEventOverlay';
import MatchStatsStrip from '@/components/games/match/MatchStatsStrip';
import MatchTableFrame from '@/components/games/match/MatchTableFrame';
import SpectateTable, {
  type SpectatePhase,
} from '@/components/games/match/SpectateTable';
import type { DuelCharacter, HidingSpotId } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import { FULL_REVEAL, type ScoutReveal } from '@/lib/utils/careerScouting';
import type { CharacterCareerState } from '@/lib/utils/careerSave';
import { fmt } from '@/lib/utils/format';
import type { MatchEventKind } from '@/lib/utils/tournamentSim';

const SKILLS_ONLY: ScoutReveal = { skills: true, meters: false, detail: false };
const spotVariants: Record<HidingSpotId, number> = { box: 0, hat: 1, sock: 2 };

// One table of the match lab: a round between the two, mid phase, with an
// event overlay on top when one is given
export default function MatchTableStage({
  theme,
  top,
  bottom,
  topState,
  bottomState,
  phase,
  round,
  event = null,
}: {
  theme: number;
  top: DuelCharacter;
  bottom: DuelCharacter;
  topState: CharacterCareerState;
  bottomState: CharacterCareerState;
  phase: SpectatePhase;
  round: number;
  event?: MatchEventKind | null;
}) {
  return (
    <div className="w-[24rem] max-w-full">
      <MatchTableFrame
        theme={theme}
        label={fmt(GAMES_UI.cup.viewer.round, { round })}
      >
        <SpectateTable
          top={top}
          bottom={bottom}
          topLives={3}
          bottomLives={1}
          topCap={4}
          bottomCap={3}
          topSponsor={topState.sponsor?.sponsorId ?? null}
          bottomSponsor={bottomState.sponsor?.sponsorId ?? null}
          topMood={topState}
          bottomMood={bottomState}
          topFame={topState.fame}
          bottomFame={bottomState.fame}
          spotVariants={spotVariants}
          glizzyVariant={theme}
          phase={phase}
          outcome={null}
          betSlug={top.slug}
          theme={theme}
          topStats={
            <MatchStatsStrip ch={topState} reveal={FULL_REVEAL} seat="top" />
          }
          bottomStats={
            <MatchStatsStrip
              ch={bottomState}
              reveal={event ? FULL_REVEAL : SKILLS_ONLY}
              seat="bottom"
            />
          }
        />
        {event && <MatchEventOverlay kind={event} party="red" />}
      </MatchTableFrame>
    </div>
  );
}
