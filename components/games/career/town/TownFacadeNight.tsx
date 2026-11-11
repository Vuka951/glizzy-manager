import type { TownBuildingMode } from '@/lib/types/town';

// Parts that only appear once a building has shut for the night, such as the
// small lamp left on or the chairs stacked on the tables. They fade in at the
// end of the closing animation
export default function TownFacadeNight({
  mode,
  at = 0,
  children,
}: {
  mode: TownBuildingMode;
  at?: number;
  children: React.ReactNode;
}) {
  if (mode !== 'shut') return null;
  return (
    <g data-facade-on="" data-at={at}>
      {children}
    </g>
  );
}
