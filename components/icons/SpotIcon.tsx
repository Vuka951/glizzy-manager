import type { HidingSpotId } from '@/data/games/glizzyDuel';

const HAT_VARIANTS = [
  <g key="top-hat">
    <ellipse cx="32" cy="48" rx="24" ry="6" className="fill-gray-600" />
    <rect x="18" y="14" width="28" height="34" rx="3" className="fill-gray-700" />
    <rect x="18" y="37" width="28" height="7" className="fill-red-400" />
    <rect x="18" y="14" width="6" height="34" rx="3" className="fill-gray-500/60" />
  </g>,
  <g key="wizard-hat">
    <path d="M32 4 L49 48 H15 Z" className="fill-sky-400" />
    <ellipse cx="32" cy="49" rx="25" ry="6" className="fill-sky-300" />
    <circle cx="30" cy="26" r="2.5" className="fill-yellow-400" />
    <circle cx="37" cy="38" r="2" className="fill-yellow-400" />
    <circle cx="26" cy="40" r="1.6" className="fill-yellow-400" />
  </g>,
  <g key="beret">
    <path d="M11 42 Q14 14 32 12 Q50 14 53 42 Z" className="fill-red-400" />
    <ellipse cx="32" cy="43" rx="22" ry="5.5" className="fill-red-300" />
    <circle cx="32" cy="10" r="3" className="fill-red-300" />
    <path d="M18 32 Q22 20 32 18" className="fill-none stroke-red-300" strokeWidth="2" strokeLinecap="round" />
  </g>,
];

const SOCK_VARIANTS = [
  <g key="red-sock">
    <path d="M24 10 h16 v22 c0 4 2 6 5 8 c6 3.5 6 12 -1 14.5 c-6 2 -13 1 -16.5 -3 c-2.5 -3 -3.5 -6 -3.5 -10 Z" className="fill-red-400" />
    <rect x="22" y="6" width="20" height="8" rx="2.5" className="fill-white" />
    <circle cx="41" cy="47" r="4.5" className="fill-white" />
  </g>,
  <g key="striped-sock">
    <path d="M24 10 h16 v22 c0 4 2 6 5 8 c6 3.5 6 12 -1 14.5 c-6 2 -13 1 -16.5 -3 c-2.5 -3 -3.5 -6 -3.5 -10 Z" className="fill-green-400" />
    <rect x="24" y="18" width="16" height="4" className="fill-white/80" />
    <rect x="24" y="27" width="16" height="4" className="fill-white/80" />
    <rect x="22" y="6" width="20" height="8" rx="2.5" className="fill-green-300" />
  </g>,
  <g key="dotted-sock">
    <path d="M24 10 h16 v22 c0 4 2 6 5 8 c6 3.5 6 12 -1 14.5 c-6 2 -13 1 -16.5 -3 c-2.5 -3 -3.5 -6 -3.5 -10 Z" className="fill-sky-400" />
    <circle cx="30" cy="22" r="2" className="fill-white/85" />
    <circle cx="36" cy="30" r="2" className="fill-white/85" />
    <circle cx="30" cy="38" r="2" className="fill-white/85" />
    <circle cx="38" cy="45" r="2" className="fill-white/85" />
    <rect x="22" y="6" width="20" height="8" rx="2.5" className="fill-sky-200" />
  </g>,
];

const BOX_VARIANTS = [
  <g key="crate">
    <rect x="10" y="16" width="44" height="38" rx="3" className="fill-amber-600" />
    <rect x="10" y="26" width="44" height="3" className="fill-amber-700" />
    <rect x="10" y="40" width="44" height="3" className="fill-amber-700" />
    <path d="M12 52 L52 18" className="stroke-amber-700" strokeWidth="3" strokeLinecap="round" />
    <rect x="10" y="16" width="44" height="38" rx="3" className="fill-none stroke-amber-700" strokeWidth="2.5" />
  </g>,
  <g key="gift">
    <rect x="12" y="26" width="40" height="28" rx="2" className="fill-red-400" />
    <rect x="9" y="18" width="46" height="9" rx="2" className="fill-red-300" />
    <rect x="29" y="18" width="6" height="36" className="fill-sky-300" />
    <circle cx="27" cy="14" r="4.5" className="fill-none stroke-sky-300" strokeWidth="3" />
    <circle cx="37" cy="14" r="4.5" className="fill-none stroke-sky-300" strokeWidth="3" />
  </g>,
  <g key="cardboard">
    <rect x="12" y="24" width="40" height="30" rx="2" className="fill-amber-400" />
    <path d="M12 24 L22 12 H42 L52 24 Z" className="fill-amber-500" />
    <rect x="29" y="24" width="6" height="30" className="fill-yellow-400/60" />
    <path d="M32 12 V24" className="stroke-amber-600" strokeWidth="2" />
  </g>,
];

const VARIANTS_BY_SPOT: Record<HidingSpotId, React.ReactElement[]> = {
  hat: HAT_VARIANTS,
  sock: SOCK_VARIANTS,
  box: BOX_VARIANTS,
};

export default function SpotIcon({
  spot,
  variant,
  className = 'h-12 w-12',
}: {
  spot: HidingSpotId;
  variant: number;
  className?: string;
}) {
  const variants = VARIANTS_BY_SPOT[spot];
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      {variants[variant % variants.length]}
    </svg>
  );
}
