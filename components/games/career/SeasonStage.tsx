import SeasonBackdrop from '@/components/games/SeasonBackdrop';

// The shared stage: every career view sits on the season's living backdrop
// with the HUD bar overlaid on top
export default function SeasonStage({
  season,
  topBar,
  children,
}: {
  season: number;
  topBar: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[calc(100dvh/var(--game-zoom,1)_-_10rem)] w-full overflow-hidden group-fullscreen:min-h-[calc(100dvh/var(--game-zoom,1))]">
      <div className="absolute inset-0 z-0">
        <SeasonBackdrop season={season} />
        <div className="absolute inset-0 bg-[#060912]/55" />
      </div>
      <div className="absolute inset-x-2 top-2 z-40">{topBar}</div>
      <div className="relative mx-auto flex min-h-[calc(100dvh/var(--game-zoom,1)_-_10rem)] w-full flex-col items-center justify-center gap-4 px-3 pb-8 pt-20 sm:pt-16 group-fullscreen:min-h-[calc(100dvh/var(--game-zoom,1))]">
        {children}
      </div>
    </div>
  );
}
