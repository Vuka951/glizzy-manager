import TownParliamentEmblem from '@/components/games/career/town/TownParliamentEmblem';
import { PARTY_CLOTH } from '@/lib/constants/townParliament';
import type { SponsorId } from '@/lib/utils/careerSave';

// One tall rally sheet dropped down the parliament wall from the roofline, in
// the governing party's colours with its emblem, cut in a swallowtail at the
// foot. It unrolls from its rod when the government changes
export default function TownParliamentDropBanner({
  party,
  x,
  y,
  w,
  h,
  at,
}: {
  party: SponsorId;
  x: number;
  y: number;
  w: number;
  h: number;
  at: number;
}) {
  const cloth = PARTY_CLOTH[party];
  const notch = w * 0.28;
  const sheet = `M${x} ${y}h${w}v${h}l${-w / 2} ${-notch}l${-w / 2} ${notch}z`;
  const mark = w * 0.72;
  const stripe = w * 0.1;
  return (
    <g>
      <g data-unroll="" data-at={at} className="origin-top [transform-box:fill-box]">
        <path d={sheet} className={cloth.field} />
        <rect x={x + stripe * 0.8} y={y} width={stripe} height={h - notch * 0.4} className={cloth.accent} />
        <rect x={x + w - stripe * 1.8} y={y} width={stripe} height={h - notch * 0.4} className={cloth.accent} />
        <rect x={x} y={y + h * 0.3} width={w} height={stripe * 1.3} className={cloth.accent} />
        <circle cx={x + w / 2} cy={y + h * 0.56} r={mark * 0.62} className={cloth.accent} />
        <circle cx={x + w / 2} cy={y + h * 0.56} r={mark * 0.54} className="fill-[#f8fafc]" />
        <TownParliamentEmblem party={party} x={x + w / 2 - mark / 2} y={y + h * 0.56 - mark / 2} size={mark} />
        <path
          d={`M${x + w * 0.33} ${y}v${h - notch * 0.6}M${x + w * 0.67} ${y}v${h - notch * 0.6}`}
          className="stroke-[#000000] opacity-10"
          strokeWidth={w * 0.06}
        />
      </g>
      <rect x={x - 1.5} y={y - 1.6} width={w + 3} height="2.4" rx="1" className="fill-[#44403c]" />
    </g>
  );
}
