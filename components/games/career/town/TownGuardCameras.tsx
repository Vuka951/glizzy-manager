const FEED =
  'relative h-9 overflow-hidden rounded-[3px] bg-[#0a120f] shadow-[inset_0_1px_4px_rgb(0_0_0/0.9)] ring-1 ring-[#000000]/70 sm:h-11';
const SCANLINES =
  'pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgb(255_255_255/0.05)_0_1px,transparent_1px_3px)]';

// The row of camera feeds over the guard console: the firm's door, the yard
// fence and the parked patrol car, grey on the night screen, the first one
// recording
export default function TownGuardCameras() {
  return (
    <div aria-hidden="true" className="grid grid-cols-3 gap-1">
      <div className={FEED}>
        <svg viewBox="0 0 60 34" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <path d="M0 24 L60 22 L60 34 L0 34 Z" className="fill-[#1f2d27]" />
          <rect x="22" y="6" width="14" height="17" className="fill-[#2b3a33]" />
          <rect x="24" y="8" width="10" height="15" className="fill-[#0d1714]" />
          <path d="M20 4 L38 4 L44 24 L14 24 Z" className="fill-[#c8d6cf]/10" />
          <rect x="18" y="3" width="22" height="2" className="fill-[#6b7f76]" />
        </svg>
        <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#ef4444] shadow-[0_0_4px_rgb(239_68_68/0.9)] motion-safe:animate-pulse" />
        <span className={SCANLINES} />
      </div>
      <div className={FEED}>
        <svg viewBox="0 0 60 34" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <path d="M0 26 L60 26 L60 34 L0 34 Z" className="fill-[#1f2d27]" />
          <rect x="0" y="12" width="60" height="1.5" className="fill-[#4b5d55]" />
          <rect x="0" y="19" width="60" height="1.5" className="fill-[#4b5d55]" />
          {[4, 14, 24, 34, 44, 54].map((x) => (
            <rect key={x} x={x} y="9" width="2" height="17" className="fill-[#5b6e65]" />
          ))}
        </svg>
        <span className={SCANLINES} />
      </div>
      <div className={FEED}>
        <svg viewBox="0 0 60 34" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <path d="M0 22 L60 20 L60 34 L0 34 Z" className="fill-[#1f2d27]" />
          <path d="M12 25 L16 18 L36 18 L42 22 L48 23 L48 28 L12 28 Z" className="fill-[#5b6e65]" />
          <rect x="20" y="15.5" width="8" height="2.5" className="fill-[#7f948a]" />
          <circle cx="19" cy="28" r="3" className="fill-[#0d1714]" />
          <circle cx="41" cy="28" r="3" className="fill-[#0d1714]" />
        </svg>
        <span className={SCANLINES} />
      </div>
    </div>
  );
}
