import MatchTableTrim from '@/components/games/match/MatchTableTrim';
import { studioAccents } from '@/lib/constants/studioThemes';

const STUDS = [
  'left-[7px] top-[7px]',
  'right-[7px] top-[7px]',
  'bottom-[7px] left-[7px]',
  'bottom-[7px] right-[7px]',
];

// The table in the edition's own material: a rim with a lit bevel, felt under
// the hall lamp, an apron with a neon underglow, legs and a shadow on the floor
export default function MatchTableSurface({
  theme,
  top,
  bottom,
  children,
}: {
  theme: number;
  // Each seat's place setting, laid at its own end of the felt
  top: React.ReactNode;
  bottom: React.ReactNode;
  children: React.ReactNode;
}) {
  const accent = studioAccents(theme);
  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -inset-x-14 -bottom-10 top-[20%] -z-10 rounded-[50%] blur-2xl ${accent.tableFloor}`}
      />
      <div
        className={`relative rounded-[20px] bg-gradient-to-b p-2 ${accent.tableRim} ${accent.tableShadow}`}
      >
        <span
          aria-hidden="true"
          className={`absolute inset-x-6 top-px h-px rounded-full ${accent.tableEdge}`}
        />
        {STUDS.map((spot) => (
          <span
            key={spot}
            aria-hidden="true"
            className={`absolute h-1 w-1 rounded-full shadow-[0_1px_0_rgba(0,0,0,0.6)] ${accent.tableStud} ${spot}`}
          />
        ))}
        <div className="relative rounded-[13px]">
          <div
            aria-hidden="true"
            className={`absolute inset-0 overflow-hidden rounded-[13px] shadow-[inset_0_2px_10px_rgba(0,0,0,0.7)] ${accent.tableFelt}`}
          >
            <span
              className={`absolute inset-0 bg-[length:5px_5px] ${accent.tableWeave}`}
            />
            <span className={`absolute inset-0 ${accent.tableLamp}`} />
            <MatchTableTrim theme={theme} place="felt" />
          </div>
          <div className="relative flex flex-col gap-2 px-2.5 py-2">
            {top}
            <div className="grid grid-cols-3 gap-2">{children}</div>
            {bottom}
          </div>
        </div>
      </div>
      <div
        className={`relative mx-3 h-2.5 rounded-b-lg bg-gradient-to-b ${accent.tableApron}`}
      >
        <span
          aria-hidden="true"
          className={`absolute inset-x-4 bottom-0 h-px rounded-full ${accent.tableNeon}`}
        />
        <MatchTableTrim theme={theme} place="apron" />
      </div>
      <div className="relative flex justify-between px-8">
        <span
          aria-hidden="true"
          className="absolute inset-x-3 -bottom-1 -z-10 h-3 rounded-[50%] bg-[#000]/50 blur-[3px]"
        />
        <div
          className={`h-6 w-2.5 rounded-b-md bg-gradient-to-b ${accent.tableLeg}`}
        />
        <div
          className={`h-6 w-2.5 rounded-b-md bg-gradient-to-b ${accent.tableLeg}`}
        />
      </div>
    </div>
  );
}
