import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import type { SponsorId } from '@/lib/utils/careerSave';

export type TownCity = 'pcinja' | 'leskovac';
export type TownFlag = SponsorId | TownCity;

// The Pčinja flag, drawn flat: the white mountain range on navy, with the
// dark gullies running down the snow. In unit coordinates, scaled onto the
// cloth
const PCINJA_RANGE =
  'M0.1 0.72L0.3 0.3L0.36 0.34L0.48 0.12L0.55 0.18L0.6 0.38L0.68 0.3L0.75 0.42L0.9 0.72z';
const PCINJA_GULLIES = 'M0.21 0.72L0.3 0.46M0.3 0.72L0.38 0.52M0.42 0.72L0.47 0.4M0.53 0.72L0.6 0.5';
// The town's own mark for Leskovac: a cream chevron on crimson with a red
// pepper hung in the notch, in unit coordinates like the Pčinja range
const LESKOVAC_CHEVRON = 'M0 0.18L0.5 0.62L1 0.18V0.4L0.5 0.84L0 0.4z';
const LESKOVAC_PEPPER = 'M0.5 0.1q0.1 0.02 0.08 0.14q-0.02 0.2 -0.1 0.28q0.03 -0.16 -0.04 -0.3q0 -0.1 0.06 -0.12z';

const FIELD: Record<SponsorId, string> = {
  blue: 'fill-[#f8fafc]',
  green: 'fill-[#065f46]',
  yellow: 'fill-[#0b0f19]',
  red: 'fill-[#b91c1c]',
};

const BAND: Record<SponsorId, string> = {
  blue: 'fill-[#2563eb]',
  green: 'fill-[#fde68a]',
  yellow: 'fill-[#facc15]',
  red: 'fill-[#fef2f2]',
};

const WAVE = [
  'motion-safe:animate-[flagwave_2.4s_ease-in-out_infinite] motion-lite:animate-none!',
  'motion-safe:animate-[flagwave_2.9s_ease-in-out_infinite] motion-lite:animate-none!',
  'motion-safe:animate-[flagwave_3.4s_ease-in-out_infinite] motion-lite:animate-none!',
];

// A flag flying right off a pole at its left edge, drawn in SVG so it can sit
// inside the building art. The two towns fly their own flags, the parties
// their emblem on a field in the party's colours, banded top and bottom
export default function TownFlagCloth({
  flag,
  x,
  y,
  w,
  h,
  wave = 0,
  still = false,
}: {
  flag: TownFlag;
  x: number;
  y: number;
  w: number;
  h: number;
  wave?: 0 | 1 | 2;
  still?: boolean;
}) {
  const mark = h * 0.72;
  const markX = x + w / 2 - mark / 2;
  const markY = y + h / 2 - mark / 2;
  return (
    <g
      className={`origin-left [transform-box:fill-box] ${still ? '' : WAVE[wave]}`}
    >
      {flag === 'pcinja' ? (
        <>
          <rect x={x} y={y} width={w} height={h} className="fill-[#16243c]" />
          <svg x={x} y={y + h * 0.1} width={w} height={h * 0.8} viewBox="0 0 1 1" preserveAspectRatio="none">
            <path d={PCINJA_RANGE} className="fill-[#f5f1e6]" />
            <path d={PCINJA_GULLIES} className="fill-none stroke-[#16243c]" strokeWidth="0.035" />
          </svg>
        </>
      ) : flag === 'leskovac' ? (
        <>
          <rect x={x} y={y} width={w} height={h} className="fill-[#9f1239]" />
          <svg x={x} y={y} width={w} height={h} viewBox="0 0 1 1" preserveAspectRatio="none">
            <path d={LESKOVAC_CHEVRON} className="fill-[#f5f1e6]" />
            <path d={LESKOVAC_PEPPER} className="fill-[#dc2626]" />
            <path d="M0.5 0.1q-0.02 -0.05 0.03 -0.08" className="fill-none stroke-[#15803d]" strokeWidth="0.03" />
          </svg>
        </>
      ) : (
        <>
          <rect x={x} y={y} width={w} height={h} className={FIELD[flag]} />
          <rect
            x={x}
            y={y + h * 0.08}
            width={w}
            height={h * 0.1}
            className={BAND[flag]}
          />
          <rect
            x={x}
            y={y + h * 0.82}
            width={w}
            height={h * 0.1}
            className={BAND[flag]}
          />
          <svg x={markX} y={markY} width={mark} height={mark}>
            <SponsorEmblem sponsorId={flag} className="h-full w-full" />
          </svg>
        </>
      )}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        className="fill-none stroke-[#0b0f19]/40"
        strokeWidth="0.6"
      />
    </g>
  );
}
