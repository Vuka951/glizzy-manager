// The printed voting square, and once it is picked the pen's cross over it.
// The cross draws itself in on mount, the square never changes size
export default function BallotMark({
  marked,
  className = 'h-7 w-7',
}: {
  marked: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`relative block shrink-0 rounded-[1px] border-2 border-slate-200 bg-[#fffaf0] ${className}`}
    >
      {marked && (
        <svg
          viewBox="0 0 20 20"
          className="absolute -left-[15%] -top-[15%] h-[130%] w-[130%] overflow-visible"
        >
          {['M2 3C7 7 13 13 18 18', 'M18 2C14 8 8 13 3 18'].map((d) => (
            <path
              key={d}
              d={d}
              pathLength={1}
              strokeWidth="3"
              strokeLinecap="round"
              className="fill-none stroke-[#1e3a8a] transition-[stroke-dashoffset] duration-300 ease-out [stroke-dasharray:1] [stroke-dashoffset:0] motion-reduce:transition-none starting:[stroke-dashoffset:1]"
            />
          ))}
        </svg>
      )}
    </span>
  );
}
