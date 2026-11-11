import type { SeatColor } from '@/lib/constants/rooms';
import type { TownBuildingId } from '@/lib/constants/townLayout';

// One window of the home per seat, in SEAT_COLOR_ORDER with the viewer first
export type TownWindowState = 'done' | 'choosing' | 'offline' | 'empty';

export type TownWindow = {
  state: TownWindowState;
  color: SeatColor;
  name: string | null;
};

// A walk from his mood spot to a building's door and back; a new key starts
// a new walk. The island trip boards the boat at the dock before returning
export type TownTrip = {
  key: number;
  building: TownBuildingId;
  island?: boolean;
};

// How a building's art is drawn. `open` is lit and usable, `abandoned` is a
// place the career has not opened yet (dark, dusty, overgrown), `shut` is a
// place done for this window, closed up for the night while the town heads
// to the cup
export type TownBuildingMode = 'open' | 'abandoned' | 'shut';
