import TownGatePill from '@/components/games/career/town/TownGatePill';
import { GAMES_UI } from '@/data/games/locale';

const TOWN = GAMES_UI.career.town;

// The election night broadcast holds the window until it is watched. The new
// rival is picked at the TV station instead, from the bottom gate
export default function TownAlarmChips({
  pendingElection,
  onOpenElection,
}: {
  pendingElection: boolean;
  onOpenElection: () => void;
}) {
  if (!pendingElection) return null;
  return (
    <TownGatePill
      tone="alarm"
      pulse
      onClick={onOpenElection}
      className="h-9 min-w-0 px-4 uppercase pointer-coarse:h-11"
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-300" />
      <span className="truncate">{TOWN.electionAlarm}</span>
    </TownGatePill>
  );
}
