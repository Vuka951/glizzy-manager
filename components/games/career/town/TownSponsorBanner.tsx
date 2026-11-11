import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import BrassPlate from '@/components/games/career/street/BrassPlate';
import { GAMES_UI } from '@/data/games/locale';
import { SPONSOR_THEMES } from '@/lib/constants/sponsorThemes';
import type { SponsorId } from '@/lib/utils/careerSave';

const SPONSORS = GAMES_UI.career.sponsors;

// The cloth takes the sponsor's chart colour; the band and hem its second colour
const TRIM: Record<SponsorId, { band: string; hem: string }> = {
  blue: { band: 'fill-blue-50', hem: 'stroke-blue-50' },
  green: { band: 'fill-amber-200', hem: 'stroke-amber-200' },
  yellow: { band: 'fill-zinc-950', hem: 'stroke-zinc-950' },
  red: { band: 'fill-red-50', hem: 'stroke-red-50' },
};

// The contract's banner hanging off a brass rod in the corner of the town, its
// name on a plate under it, or a bare grey one while nobody sponsors him
export default function TownSponsorBanner({
  sponsorId,
  onOpen,
}: {
  sponsorId: SponsorId | null;
  onOpen: () => void;
}) {
  const name = sponsorId ? SPONSORS.names[sponsorId] : SPONSORS.none;
  return (
    <button
      onClick={onOpen}
      title={SPONSORS.title}
      className="group/banner flex w-28 flex-col items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fde68a]"
    >
      <span className="relative block h-[84px] w-[57px] @min-[1100px]:h-[112px] @min-[1100px]:w-[76px] transition group-hover/banner:-translate-y-0.5">
        <svg
          viewBox="0 0 80 118"
          className="absolute inset-0 h-full w-full overflow-visible"
          aria-hidden="true"
        >
          <path
            d="M8 4 40-6 72 4"
            className="fill-none stroke-[#8a6420]"
            strokeWidth="1"
          />
          <circle cx="40" cy="-6" r="1.6" className="fill-[#e8c066]" />
          <path
            d="M4 4h72"
            className="stroke-[#b8862f]"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 origin-top motion-safe:animate-[flagwave_4s_ease-in-out_infinite] motion-lite:animate-none!">
          <svg
            viewBox="0 0 80 118"
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <path
              d="M10 6h60v92l-30-14-30 14z"
              className={sponsorId ? SPONSOR_THEMES[sponsorId].bar : 'fill-slate-600'}
            />
            <path
              d="M10 6h60v8H10z"
              className={sponsorId ? TRIM[sponsorId].band : 'fill-slate-500'}
            />
            <path
              d="M10 92l30-14 30 14"
              className={`fill-none opacity-80 ${sponsorId ? TRIM[sponsorId].hem : 'stroke-slate-500'}`}
              strokeWidth="2.5"
            />
          </svg>
          <span className="absolute left-1/2 top-[24%] flex h-10 w-10 -translate-x-1/2 items-center justify-center overflow-hidden rounded-full bg-[#020617]/40">
            {sponsorId ? (
              <SponsorEmblem sponsorId={sponsorId} className="h-8 w-8" />
            ) : (
              <span className="font-sign text-xl font-bold text-[#fdf0c8]">?</span>
            )}
          </span>
        </span>
      </span>
      <span className="hidden @min-[1100px]:block">
        <BrassPlate className="justify-center text-center">
          {name}
        </BrassPlate>
      </span>
    </button>
  );
}
