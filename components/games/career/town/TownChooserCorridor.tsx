
// The door sizes are handed down as variables: on a `fill` corridor they come
// off the box the corridor fills, so the doors grow with the board and stand
// tall in it; otherwise off its width, and the corridor takes the doors' height
const FILL_DOORS =
  '[container-type:size] h-full [--door-w:min(29cqw,10rem+12cqw)] [--door-h:min(58cqh,calc(var(--door-w)*2.4))]';
const SIZED_DOORS =
  '@container [--door-w:min(40cqw,9rem)] [--door-h:calc(var(--door-w)*1.75)]';

// The stretch of old plastered hallway a building's doors stand in, filling
// the board: a moulded ceiling, the wall, the doors side by side and centred
// under their lamps, a lone door in the middle with wall either side. Each
// door paints its lamp, the dado and the floor out to the corridor's edges
// from its own lines, so the floor always meets the sills however the doors
// come out. A `fill` corridor stretches to its box
export default function TownChooserCorridor({
  fill = false,
  children,
}: {
  fill?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative isolate flex flex-col overflow-hidden bg-[#8a7c60] bg-[repeating-linear-gradient(90deg,transparent_0_38px,rgb(0_0_0/0.035)_38px_40px)] px-3 shadow-[inset_0_3px_8px_rgb(0_0_0/0.5)] ${fill ? FILL_DOORS : `pt-20 ${SIZED_DOORS}`}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-4 border-b-[3px] border-[#6f6349] bg-gradient-to-b from-[#51472f] to-[#a79a7b] shadow-[0_3px_0_rgb(255_255_255/0.08),0_6px_8px_rgb(0_0_0/0.25)]"
      />
      {fill && <span aria-hidden="true" className="min-h-20 flex-[3]" />}
      <div className="relative flex shrink-0 items-start justify-center gap-3 *:min-w-0 sm:gap-6">
        {children}
      </div>
      <span aria-hidden="true" className={`block ${fill ? 'min-h-4 flex-[2]' : 'h-4'}`} />
    </div>
  );
}
