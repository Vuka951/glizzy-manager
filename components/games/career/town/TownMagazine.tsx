export type TownMagazineGlow = 'pulse' | 'soft' | null;

const TILT = {
  left: '-rotate-2',
  right: 'rotate-2',
  none: '',
} as const;

// One item lying on the kiosk's counter, its cover in the children. Under
// the finger it lifts, straightens and grows a little while its shadow
// deepens, a gloss sweeps across and the bottom corner curls up; pressing
// pushes it back down. Reduced motion keeps only the lit rim, the lite
// animation level only the lift. The paper the town waits on pulses in the
// spotlight's warm light, the newest one keeps a steady glow, and an unread
// one still wears the distributor's red clip
export default function TownMagazine({
  label,
  tilt = 'none',
  glow = null,
  clip = false,
  flap,
  shape = 'rounded-[3px]',
  onOpen,
  children,
}: {
  label: string;
  tilt?: keyof typeof TILT;
  glow?: TownMagazineGlow;
  clip?: boolean;
  // The colour of the paper's back, seen where the corner curls
  flap: string;
  shape?: string;
  onOpen: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={label}
      className={`group/mag @container relative block w-full outline-none [-webkit-tap-highlight-color:transparent] ${TILT[tilt]}`}
    >
      {glow && (
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute -inset-[9%] rounded-[18px] bg-[radial-gradient(closest-side,rgb(253_230_138/0.9),rgb(251_191_36/0.5)_55%,transparent)] blur-md ${
            glow === 'pulse'
              ? 'motion-safe:animate-pulse motion-lite:animate-none!'
              : 'opacity-60'
          }`}
        />
      )}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[3%] left-[8%] right-[8%] h-[5%] rounded-[50%] bg-[rgb(0_0_0/0.45)] blur-[3px] transition duration-300 motion-safe:group-hover/mag:scale-x-90 motion-safe:group-hover/mag:opacity-50 motion-safe:group-focus-visible/mag:scale-x-90 motion-safe:group-focus-visible/mag:opacity-50 motion-reduce:transition-none"
      />
      <span
        className={`relative block drop-shadow-[0_4px_5px_rgb(0_0_0/0.5)] transition-[translate,rotate,scale,filter] duration-300 ease-out motion-reduce:transition-none group-hover/mag:drop-shadow-[0_16px_14px_rgb(0_0_0/0.55)] group-focus-visible/mag:drop-shadow-[0_16px_14px_rgb(0_0_0/0.55)] motion-safe:group-hover/mag:-translate-y-[7%] motion-safe:group-hover/mag:scale-[1.04] motion-safe:group-focus-visible/mag:-translate-y-[7%] motion-safe:group-focus-visible/mag:scale-[1.04] motion-safe:group-active/mag:-translate-y-[2%] motion-safe:group-active/mag:scale-[0.97] motion-safe:group-active/mag:drop-shadow-[0_3px_3px_rgb(0_0_0/0.55)] motion-lite:scale-100! motion-lite:rotate-0! ${
          tilt === 'left'
            ? 'motion-safe:group-hover/mag:rotate-2 motion-safe:group-focus-visible/mag:rotate-2'
            : tilt === 'right'
              ? 'motion-safe:group-hover/mag:-rotate-2 motion-safe:group-focus-visible/mag:-rotate-2'
              : 'motion-safe:group-hover/mag:-rotate-1 motion-safe:group-focus-visible/mag:-rotate-1'
        }`}
      >
        <span
          className={`relative block overflow-hidden transition-[clip-path] duration-300 ease-out [clip-path:polygon(0_0,100%_0,100%_100%,100%_100%,0_100%)] motion-reduce:transition-none motion-safe:group-hover/mag:[clip-path:polygon(0_0,100%_0,100%_calc(100%_-_min(14cqw,2rem)),calc(100%_-_min(14cqw,2rem))_100%,0_100%)] motion-safe:group-focus-visible/mag:[clip-path:polygon(0_0,100%_0,100%_calc(100%_-_min(14cqw,2rem)),calc(100%_-_min(14cqw,2rem))_100%,0_100%)] motion-lite:[clip-path:none]! ${shape}`}
        >
          {children}
          {glow && (
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 shadow-[inset_0_0_0_2px_#fcd34d,inset_0_0_14px_rgb(251_191_36/0.65)] ${shape}`}
            />
          )}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -translate-x-full skew-x-[-18deg] bg-gradient-to-r from-transparent via-[#ffffff]/45 to-transparent opacity-0 transition-[translate,opacity] duration-700 ease-out group-hover/mag:translate-x-[260%] group-hover/mag:opacity-100 group-focus-visible/mag:translate-x-[260%] group-focus-visible/mag:opacity-100 motion-reduce:hidden motion-lite:hidden"
          />
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 ring-2 ring-inset ring-transparent transition-shadow duration-200 group-hover/mag:ring-[#fde68a] group-focus-visible/mag:ring-[#fde68a] ${shape}`}
          />
        </span>
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute bottom-0 right-0 hidden aspect-square w-0 drop-shadow-[-2px_-2px_2px_rgb(0_0_0/0.35)] transition-[width] duration-300 ease-out motion-safe:block group-hover/mag:w-[min(14cqw,2rem)] group-focus-visible/mag:w-[min(14cqw,2rem)] motion-lite:hidden! ${flap}`}
        />
        {clip && (
          <span
            aria-hidden="true"
            className="absolute -top-2.5 left-[10%] h-3 w-6 rounded-[2px] bg-gradient-to-b from-[#ef4444] to-[#991b1b] shadow-[0_2px_3px_rgb(0_0_0/0.5)] after:absolute after:inset-x-1 after:-top-1.5 after:h-2 after:rounded-t-full after:border-2 after:border-b-0 after:border-[#cbd5e1]"
          />
        )}
      </span>
    </button>
  );
}
