import TownGatePill from '@/components/games/career/town/TownGatePill';
import ActionIcon from '@/components/icons/ActionIcon';
import Icon from '@/components/icons/Icon';
import { GAMES_UI } from '@/data/games/locale';

const OS = GAMES_UI.career.offseason;
const TOWN = GAMES_UI.career.town;

// The way out of town at the bottom: in a room it is the room's own gate, in
// single player a shortcut to the kiosk for the league paper and then to the
// cup bus once the month is spent. While a new rival waits to be picked, his
// pill leads to the TV station first, in both. Each sends him walking there
export default function TownGate({
  gate,
  slotsFull,
  busy,
  newsSeen,
  rivalReady,
  blocked,
  onOpenNews,
  onToCup,
  onOpenRival,
}: {
  gate?: React.ReactNode;
  slotsFull: boolean;
  busy: boolean;
  newsSeen: boolean;
  rivalReady: boolean;
  // He is already on his way somewhere
  blocked: boolean;
  onOpenNews: () => void;
  onToCup: () => void;
  onOpenRival: () => void;
}) {
  const rival = rivalReady && (
    <TownGatePill
      tone="alarm"
      pulse
      onClick={onOpenRival}
      disabled={blocked}
      title={TOWN.rivalAlarm}
      className="h-12 px-5"
    >
      <ActionIcon kind="media" className="h-5 w-5 shrink-0" />
      <span className="uppercase">
        {TOWN.rivalAlarm}
      </span>
    </TownGatePill>
  );
  if (gate) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2">
        {rival}
        {gate}
      </div>
    );
  }
  if (rival) return rival;
  if (!slotsFull || busy) return null;
  return (
    <div className="flex items-center justify-center gap-2">
      <TownGatePill
        tone={newsSeen ? 'plain' : 'alarm'}
        pulse={!newsSeen}
        onClick={onOpenNews}
        disabled={blocked}
        title={OS.newsButton}
        className={newsSeen ? 'h-11 w-11' : 'h-12 px-5'}
      >
        <ActionIcon kind="news" className="h-5 w-5 shrink-0" />
        {!newsSeen && (
          <span className="uppercase">
            {OS.newsButton}
          </span>
        )}
      </TownGatePill>
      {newsSeen && (
        <TownGatePill
          tone="cup"
          pulse
          onClick={onToCup}
          disabled={blocked}
          title={OS.cupButton}
          className="h-12 px-6"
        >
          <Icon name="trophy" className="h-5 w-5 shrink-0" />
          <span className="uppercase">
            {TOWN.goToCup}
          </span>
        </TownGatePill>
      )}
    </div>
  );
}
