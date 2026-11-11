export type TownStatsLeader = { slug: string; name: string; points: number };

const BARS = [38, 62, 48, 80, 56, 92, 70];

// The league's stats insert, folded once and lying flat on the counter: the
// pink sports newsprint, the title in heavy serif, the top of the table
// already printed on the front, and a bar chart down the fold
export default function TownStatsCover({
  title,
  sub,
  leaders,
}: {
  title: string;
  sub: string;
  leaders: TownStatsLeader[];
}) {
  return (
    <span className="@container relative grid aspect-[16/5] w-full grid-cols-[1fr_auto_1.15fr] items-stretch gap-[3cqw] overflow-hidden bg-[#f6d9c9] px-[4cqw] py-[2.5cqw] text-left text-[#1c1917]">
      <span className="flex min-w-0 flex-col justify-center border-r border-dashed border-[#1c1917]/25 pr-[3cqw]">
        <span className="font-serif text-[5.4cqw] font-black uppercase leading-[0.95] tracking-tight">
          {title}
        </span>
        <span className="mt-[1cqw] border-t-[3px] border-double border-[#1c1917] pt-[0.8cqw] text-[max(9px,2cqw)] font-bold uppercase tracking-[0.14em] text-[#9f1239]">
          {sub}
        </span>
      </span>
      <svg viewBox="0 0 70 100" aria-hidden="true" className="h-full w-[10cqw] self-center">
        {BARS.map((h, i) => (
          <rect
            key={i}
            x={i * 10 + 1}
            y={100 - h}
            width="7"
            height={h}
            className={i === BARS.length - 2 ? 'fill-[#be123c]' : 'fill-[#1c1917]/70'}
          />
        ))}
      </svg>
      <span className="flex min-w-0 flex-col justify-center gap-[0.6cqw]">
        {leaders.map((leader, i) => (
          <span
            key={leader.slug}
            className={`flex items-baseline gap-[1.2cqw] text-[max(9px,2.6cqw)] font-black uppercase leading-tight ${
              i === 0 ? 'text-[#9f1239]' : ''
            }`}
          >
            <span className="w-[2.4cqw] shrink-0 font-mono">{i + 1}</span>
            <span className="min-w-0 truncate">{leader.name}</span>
            <span className="min-w-[2cqw] flex-1 border-b border-dotted border-[#1c1917]/40" />
            <span className="shrink-0 font-mono">{leader.points}</span>
          </span>
        ))}
      </span>
    </span>
  );
}
