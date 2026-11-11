const PLANTS: [number, number][] = [
  [18, 0],
  [40, 1],
  [62, 0],
];

// The Eggplant Edition's poke-able toy: a raised garden bed of eggplants on the square,
// drawn in a 80 by 60 box standing on its bottom edge
export default function TownSceneryEggplantBed() {
  return (
    <>
      <ellipse cx="40" cy="58" rx="40" ry="3" className="fill-slate-950/35" />
      <g data-poke>
        <path d="M2 44h76v14H2z" className="fill-[#6d4a33]" />
        <path d="M2 44h76v3H2z" className="fill-[#8a6244]" />
        <path d="M2 50h76" className="stroke-[#4a3022]" strokeWidth="1" />
        <path d="M27 44v14M53 44v14" className="stroke-[#4a3022]" strokeWidth="1" />
        <path d="M4 44q36-5 72 0" className="fill-[#3d2a20]" />
        {PLANTS.map(([x, tall]) => (
          <g key={x}>
            <path
              d={`M${x} 42V${tall ? 14 : 20}`}
              className="stroke-[#2f7a4f]"
              strokeWidth="2"
            />
            <path
              d={`M${x} ${tall ? 22 : 28}q-12-2-14-10q10-1 14 6zM${x} ${tall ? 18 : 24}q12-6 15-1q-7 6-15 5z`}
              className="fill-[#3f8f5a]"
            />
            <path d={`M${x} 34q-9-1-11-7q8 0 11 4z`} className="fill-[#4fa36a]" />
            <circle cx={x + 3} cy={tall ? 13 : 19} r="2.6" className="fill-[#c39be8]" />
            <path
              d={`M${x - 3} 34c-7 1-8 9-4 12c4 3 9 0 9-6c0-4-2-6-5-6z`}
              className="fill-[#5b2a86]"
            />
            <path
              d={`M${x + 4} 32c6 2 6 9 2 11c-4 2-7-1-6-6c0-3 2-5 4-5z`}
              className="fill-[#4a2370]"
            />
            <path d={`M${x - 4} 39q1-3 3-3`} className="fill-none stroke-[#c39be8]/70" strokeWidth="1.3" strokeLinecap="round" />
            <path d={`M${x - 3} 34l2-3 1 2 2-1-1 3z`} className="fill-[#3f8f5a]" />
          </g>
        ))}
      </g>
    </>
  );
}
