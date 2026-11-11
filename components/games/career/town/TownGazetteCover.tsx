import TownGazettePaperMark from '@/components/games/career/town/TownGazettePaperMark';
import TownGazettePhoto from '@/components/games/career/town/TownGazettePhoto';
import { GAZETTE_HEADLINE_SIZES, townGazetteCovers } from '@/lib/constants/townMagazines';
import { headlineTier } from '@/lib/utils/townPapers';

// The league paper as a tabloid front page: a serif masthead over a double
// rule, the edition's ribbon carrying the issue line, the headline, the
// photo in the edition's duotone and the next stories set in two columns.
// The paper takes the edition's tint and carries its mark
export default function TownGazetteCover({
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
  const theme = townGazetteCovers[edition];
  return (
    <span
      className={`@container relative flex aspect-[3/4] w-full flex-col overflow-hidden px-[5cqw] pb-[4cqw] pt-[4cqw] text-left text-[#0f172a] ${theme.paper}`}
    >
      <span
        className={`whitespace-nowrap border-b-[3px] border-double pb-[1.5cqw] text-center font-serif text-[8cqw] font-black uppercase leading-none tracking-[0.02em] ${theme.rule}`}
      >
        {title}
      </span>
      <span
        className={`-mx-[5cqw] mt-[1.5cqw] px-[5cqw] py-[1cqw] text-center text-balance text-[max(9px,4cqw)] font-bold uppercase leading-tight tracking-[0.06em] @min-[140px]:tracking-[0.14em] ${theme.ribbon}`}
      >
        {sub}
      </span>
      {headline && (
        <span
          className={`mt-[2.5cqw] break-normal font-serif font-black uppercase leading-[0.95] ${GAZETTE_HEADLINE_SIZES[headlineTier(headline)]}`}
        >
          {headline}
        </span>
      )}
      <span
        aria-hidden="true"
        className={`relative mt-[2.5cqw] min-h-[24cqw] flex-1 overflow-hidden border ${theme.rule}`}
      >
        <TownGazettePhoto edition={edition} />
      </span>
      {lines.length > 0 && (
        <span className="mt-[2cqw] hidden grid-cols-2 gap-x-[3cqw] @min-[140px]:grid">
          {lines.slice(0, 2).map((line, i) => (
            <span
              key={line}
              className={`break-normal border-t pt-[1cqw] font-serif text-[3.8cqw] font-bold uppercase leading-[1.05] ${theme.rule} ${
                i === 0 ? theme.kicker : ''
              } ${lines.length === 1 ? 'col-span-2' : ''}`}
            >
              {line}
            </span>
          ))}
        </span>
      )}
      <TownGazettePaperMark edition={edition} />
    </span>
  );
}
