import SponsorEmblem from '@/components/games/career/SponsorEmblem';

// The Yellow Party in government moves into the bank: gold trim on the cornice,
// its banner down the side bay and a black carpet edged in gold between
// velvet ropes at the door. Drawn in the bank's own 170 by 175 box; abandoned, the banner hangs
// faded and torn and the carpet is gone
export default function BankYellowDressing({
  abandoned,
}: {
  abandoned: boolean;
}) {
  return (
    <g>
      <rect
        x="6"
        y="36"
        width="158"
        height="2"
        className={abandoned ? 'fill-[#713f12]' : 'fill-[#facc15]'}
      />
      <rect
        x="6"
        y="40"
        width="158"
        height="1"
        className={abandoned ? 'fill-[#713f12]' : 'fill-[#ca8a04]'}
      />

      <g className={abandoned ? 'opacity-55 saturate-50' : ''}>
        <rect x="140" y="69" width="20" height="2" rx="1" className="fill-[#cbd5e1]" />
        <path
          d={
            abandoned
              ? 'M142 71h16v40l-3 6-2-4-3 9-8-6z'
              : 'M142 71h16v57l-8-5-8 5z'
          }
          className="fill-[#0b0f19]"
        />
        <path
          d={
            abandoned
              ? 'M143 71v49M157 71v42'
              : 'M143 71v55.5M157 71v55.5'
          }
          className="stroke-[#facc15]"
          strokeWidth="1"
        />
        <svg x="144" y="76" width="12" height="12" viewBox="0 0 24 24">
          <SponsorEmblem sponsorId="yellow" className="h-full w-full" />
        </svg>
        <path
          d={abandoned ? 'M150 92v14' : 'M150 92v24'}
          className="stroke-[#facc15]"
          strokeWidth="1.6"
        />
        <path
          d={abandoned ? 'M147 95v8M153 95v8' : 'M147 95v18M153 95v18'}
          className="stroke-[#f8fafc]"
          strokeWidth="0.8"
        />
      </g>

      {!abandoned && (
        <>
          <path d="M58 171.5h44l6 3.5H52z" className="fill-[#0b0f19]" />
          <path d="M58 171.5h44" className="stroke-[#facc15] opacity-80" strokeWidth="0.6" />
          {[44, 52, 108, 116].map((x) => (
            <g key={x}>
              <rect x={x - 0.8} y="163" width="1.6" height="9" className="fill-[#eab308]" />
              <rect x={x - 2} y="171" width="4" height="1.5" rx="0.5" className="fill-[#a16207]" />
              <circle cx={x} cy="162.6" r="1.4" className="fill-[#fde047]" />
            </g>
          ))}
          <path
            d="M44 164q4 4 8 0M108 164q4 4 8 0"
            className="fill-none stroke-[#1c1917]"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </>
      )}
    </g>
  );
}
