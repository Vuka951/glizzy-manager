import TownDockMap from '@/components/games/career/town/TownDockMap';
import TownDockTicket from '@/components/games/career/town/TownDockTicket';
import ActionIcon from '@/components/icons/ActionIcon';
import { GAMES_UI } from '@/data/games/locale';

const A = GAMES_UI.career.actions;

// The pier's trip as a boat ticket on a holiday map: the Green Party sponsor's
// free island
export default function TownDockChooser({
  islandDesc,
  disabled,
  onIsland,
}: {
  islandDesc: string;
  disabled: boolean;
  onIsland: () => void;
}) {
  return (
    <TownDockMap>
      <TownDockTicket
        icon={<ActionIcon kind="island" className="h-4 w-4" />}
        title={A.island}
        desc={islandDesc}
        sub={A.islandFree}
        disabled={disabled}
        onTake={onIsland}
      />
    </TownDockMap>
  );
}
