import TownCupCoverArt from '@/components/games/career/town/TownCupCoverArt';
import { CUP_HEADLINE_SIZES, townCupCovers } from '@/lib/constants/townMagazines';
import { headlineTier } from '@/lib/utils/townPapers';

const BARS = [3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2];

// The cup recap as a glossy sports magazine: the masthead slammed across the
// top, the edition's art bleeding to every edge with the trophy at its heart,
// the headline over a dark scrim at the foot, one more story on a strip and a
// barcode in the corner
export default function TownCupCover({
  title,
  sub,
  headline,
  lines,
  edition,
}: {
  title: string;
  sub: string;
  headline: string | null;
  lines: string[];
  edition: number;
}) {
  const theme = townCupCovers[edition];
  return (
    <span
      className={`@container relative flex aspect-[3/4] w-full flex-col overflow-hidden text-left ${theme.sky}`}
    >
      <TownCupCoverArt edition={edition} />
      <span className="relative flex flex-col px-[5cqw] pt-[4cqw]">
        <span
          className={`whitespace-nowrap text-[11.5cqw] font-black italic uppercase leading-[0.9] tracking-[-0.03em] ${theme.masthead}`}
        >
          {title}
        </span>
        <span
          className={`mt-[1.5cqw] text-balance text-[max(9px,4.2cqw)] font-bold uppercase leading-tight tracking-[0.06em] @min-[140px]:tracking-[0.12em] ${theme.dateline}`}
        >
          {sub}
        </span>
      </span>
      <span
        className={`relative mt-auto flex flex-col gap-[2cqw] bg-gradient-to-t to-transparent px-[5cqw] pb-[4cqw] pt-[14cqw] ${theme.scrim}`}
      >
        {headline && (
          <span
            className={`break-normal font-black italic uppercase leading-[0.92] tracking-[-0.02em] text-[#ffffff] [text-shadow:0_2px_0_rgb(0_0_0/0.45)] ${CUP_HEADLINE_SIZES[headlineTier(headline)]}`}
          >
            {headline}
          </span>
        )}
        <span className="flex items-end justify-between gap-[3cqw]">
          {lines[0] ? (
            <span
              className={`hidden min-w-0 break-normal rounded-[1px] px-[2cqw] py-[0.8cqw] text-[4cqw] @min-[140px]:block font-black uppercase leading-tight ${theme.strip}`}
            >
              {lines[0]}
            </span>
          ) : (
            <span />
          )}
          <span aria-hidden="true" className="hidden h-[8cqw] shrink-0 items-stretch gap-[0.5cqw] bg-[#ffffff] px-[1cqw] py-[0.8cqw] @min-[140px]:flex">
            {BARS.map((w, i) => (
              <span
                key={i}
                className={`bg-[#0f172a] ${w === 3 ? 'w-[0.9cqw]' : w === 2 ? 'w-[0.6cqw]' : 'w-[0.3cqw]'}`}
              />
            ))}
          </span>
        </span>
      </span>
    </span>
  );
}
