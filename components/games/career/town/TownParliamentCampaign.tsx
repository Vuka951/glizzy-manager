import TownParliamentEmblem from '@/components/games/career/town/TownParliamentEmblem';
import { GAMES_UI } from '@/data/games/locale';
import { PARTY_CLOTH } from '@/lib/constants/townParliament';
import type { SponsorId } from '@/lib/utils/careerSave';

const SLOGAN = GAMES_UI.career.town.campaignSlogan.toUpperCase();

// The governing party's campaign ad, strung across the parliament front
// between the wings on two ropes: its emblem and the slogan on its colours
export default function TownParliamentCampaign({
  party,
  at,
}: {
  party: SponsorId;
  at: number;
}) {
  const cloth = PARTY_CLOTH[party];
  return (
    <g>
      <path d="M68 117l4 10M192 117l-4 10" className="stroke-[#44403c]" strokeWidth="0.9" />
      <g data-unroll="" data-at={at} className="origin-top [transform-box:fill-box]">
        <rect x="70" y="126" width="120" height="18" rx="1" className={cloth.field} />
        <rect x="70" y="126" width="120" height="2" className={cloth.accent} />
        <rect x="70" y="142" width="120" height="2" className={cloth.accent} />
        <circle cx="81" cy="135" r="7" className="fill-[#f8fafc]" />
        <TownParliamentEmblem party={party} x={75.5} y={129.5} size={11} />
        <text
          x="137"
          y="138.8"
          textAnchor="middle"
          fontSize="10"
          textLength="94"
          lengthAdjust="spacingAndGlyphs"
          className={`font-sans font-black ${cloth.accent}`}
        >
          {SLOGAN}
        </text>
      </g>
    </g>
  );
}
