import TownCupTrophy from '@/components/games/career/town/TownCupTrophy';

const FLAKE = 'M0 -3V3M-2.6 -1.5L2.6 1.5M-2.6 1.5L2.6 -1.5';
const SPARK = 'M0 -4L1 -1L4 0L1 1L0 4L-1 1L-4 0L-1 -1Z';

const FLAKES: [number, number, number][] = [
  [14, 52, 1], [30, 88, 0.7], [20, 128, 0.9], [124, 48, 0.8], [138, 96, 1],
  [118, 132, 0.7], [44, 40, 0.6], [104, 30, 0.6], [8, 104, 0.6], [142, 62, 0.6],
];
const PETALS: [number, number, number][] = [
  [16, 50, 30], [34, 92, -20], [12, 120, 60], [128, 46, -40], [140, 90, 20],
  [120, 122, 80], [46, 36, 10], [108, 28, -60],
];
const DRIPS: [number, number, number][] = [
  [10, 20, 2.2], [32, 14, 1.6], [46, 30, 2.4], [70, 16, 1.8], [96, 36, 2.6], [118, 18, 1.8], [140, 26, 2.2],
];
const RAYS = Array.from({ length: 12 }, (_, i) => i * 30);

// Where the hover sparkles catch the light, per edition
const SPARKS: [number, number][][] = [
  [[50, 60], [104, 74], [88, 120], [58, 104]],
  [[50, 62], [102, 70], [92, 118], [60, 108]],
  [[48, 64], [104, 66], [92, 116], [58, 106]],
  [[52, 60], [100, 76], [90, 122], [60, 102]],
];

const TROPHIES = [
  { body: 'fill-[#cfe8fb]', shine: 'fill-[#ffffff]/90', handle: 'stroke-[#a5d0f0]', foot: 'fill-[#7aa7d6]', plinth: 'fill-[#1e3a6b]' },
  { body: 'fill-[#fbbf24]', shine: 'fill-[#fef3c7]/90', handle: 'stroke-[#f59e0b]', foot: 'fill-[#b45309]', plinth: 'fill-[#3b0f4a]' },
  { body: 'fill-[#f59e0b] stroke-[#7c2d12] [stroke-width:1.2]', shine: 'fill-[#fffbeb]/90', handle: 'stroke-[#b45309]', foot: 'fill-[#92400e]', plinth: 'fill-[#422006]' },
  { body: 'fill-[#3f3f46]', shine: 'fill-[#d4d4d8]/40', handle: 'stroke-[#52525b]', foot: 'fill-[#27272a]', plinth: 'fill-[#120406]' },
];

// The cup recap's cover photo: the trophy in the middle of the edition's
// weather. The Frozen Edition freezes it under snow and an aurora, the Eggplant Edition stands it
// between eggplants in falling petals, the Summer Edition holds it against the sun over
// the sea, the Bloody Edition sets it under a blood moon with drips running off the top.
// On hover the metal catches a few sparkles
export default function TownCupCoverArt({ edition }: { edition: number }) {
  return (
    <svg
      viewBox="0 0 150 200"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    >
      {edition === 0 && (
        <>
          <path d="M-10 70C20 52 50 78 80 60S130 44 160 58V84C130 72 110 92 80 84S20 92 -10 96Z" className="fill-[#67e8f9]/20" />
          <path d="M-10 86C30 74 60 96 90 82S140 72 160 80V96C130 90 110 104 80 98S30 104 -10 108Z" className="fill-[#a7f3d0]/15" />
          {FLAKES.map(([x, y, s], i) => (
            <path key={i} d={FLAKE} transform={`translate(${x} ${y}) scale(${s * 1.3})`} strokeWidth="0.9" strokeLinecap="round" className="stroke-[#e0f2fe]/80" />
          ))}
          <path d="M-10 150C20 140 50 152 80 146S130 136 160 146V210H-10Z" className="fill-[#bfd3ee]" />
          <path d="M-10 162C30 154 60 166 90 158S140 152 160 160V210H-10Z" className="fill-[#e7f0fb]" />
        </>
      )}
      {edition === 1 && (
        <>
          <circle cx="75" cy="88" r="56" className="fill-[#f9a8d4]/20" />
          <circle cx="75" cy="88" r="38" className="fill-[#f9a8d4]/25" />
          {PETALS.map(([x, y, r], i) => (
            <ellipse key={i} cx={x} cy={y} rx="3.2" ry="1.6" transform={`rotate(${r} ${x} ${y})`} className="fill-[#fbcfe8]/85" />
          ))}
          <path d="M-10 152C30 142 60 150 90 146S140 140 160 148V210H-10Z" className="fill-[#2a0f3d]" />
          <g transform="rotate(-24 26 140)">
            <path d="M26 104C36 104 40 120 38 138C36 156 30 164 26 164C22 164 16 156 14 138C12 120 16 104 26 104Z" className="fill-[#5b2a86]" />
            <path d="M21 116C19 126 19 140 22 152" fill="none" strokeWidth="2.4" strokeLinecap="round" className="stroke-[#a78bfa]/50" />
            <path d="M18 106L26 98L34 106L30 110L26 106L22 110Z" className="fill-[#65a30d]" />
            <path d="M25 99L24 92" strokeWidth="2.4" strokeLinecap="round" className="stroke-[#4d7c0f]" />
          </g>
          <g transform="rotate(26 124 140)">
            <path d="M124 108C133 108 137 122 135 138C133 154 128 162 124 162C120 162 115 154 113 138C111 122 115 108 124 108Z" className="fill-[#6b2fa0]" />
            <path d="M119 118C117 128 117 140 120 150" fill="none" strokeWidth="2.2" strokeLinecap="round" className="stroke-[#c4b5fd]/45" />
            <path d="M116 110L124 102L132 110L128 114L124 110L120 114Z" className="fill-[#65a30d]" />
            <path d="M123 103L122 96" strokeWidth="2.2" strokeLinecap="round" className="stroke-[#4d7c0f]" />
          </g>
        </>
      )}
      {edition === 2 && (
        <>
          <g transform="translate(75 88)">
            {RAYS.map((angle) => (
              <path key={angle} d="M-7 0L0 -140L7 0Z" transform={`rotate(${angle})`} className="fill-[#fff7d6]/30" />
            ))}
          </g>
          <circle cx="75" cy="88" r="42" className="fill-[#fef08a]" />
          <circle cx="75" cy="88" r="50" className="fill-[#fef08a]/30" />
          <path d="M18 34l4 3 4-3M110 26l3 2.4 3-2.4M124 40l3.4 2.6 3.4-2.6" fill="none" strokeWidth="1.2" strokeLinecap="round" className="stroke-[#7c2d12]" />
          <path d="M-10 148H160V210H-10Z" className="fill-[#0e7490]" />
          <path d="M-10 148H160V152H-10Z" className="fill-[#67e8f9]/60" />
          <path d="M8 160q8-3 16 0M40 168q10-3 20 0M96 162q10-3 20 0M118 174q8-3 16 0" fill="none" strokeWidth="1.2" strokeLinecap="round" className="stroke-[#a5f3fc]/70" />
          <path d="M126 146V128L138 146Z" className="fill-[#ffffff]" />
          <path d="M120 147H142L139 151H123Z" className="fill-[#7c2d12]" />
        </>
      )}
      {edition === 3 && (
        <>
          <circle cx="75" cy="80" r="50" className="fill-[#ef4444]/15" />
          <circle cx="75" cy="80" r="36" className="fill-[#b91c1c]" />
          <circle cx="64" cy="70" r="6" className="fill-[#7f1d1d]/60" />
          <circle cx="88" cy="92" r="8" className="fill-[#7f1d1d]/50" />
          <circle cx="86" cy="66" r="3.5" className="fill-[#7f1d1d]/60" />
          <path d="M0 154L6 120M6 132L-4 122M6 126L14 112M144 154L140 116M140 128L150 118M140 122L132 108" fill="none" strokeWidth="2" strokeLinecap="round" className="stroke-[#0b0506]" />
          <path d="M26 46l4 2.6 4-2.6M108 40l3.6 2.4 3.6-2.4M118 54l3 2 3-2" fill="none" strokeWidth="1.4" strokeLinecap="round" className="stroke-[#0b0506]" />
          <path d="M-10 150C30 144 60 152 90 148S140 142 160 150V210H-10Z" className="fill-[#1a0608]" />
          <path d="M-10 -10H160V7Q150 10 140 7T120 7T100 7T80 7T60 7T40 7T20 7T0 7T-10 7Z" className="fill-[#7f1d1d]" />
          {DRIPS.map(([x, length, w]) => (
            <path key={x} d={`M${x - w} 5V${length}a${w} ${w} 0 0 0 ${w * 2} 0V5Z`} className="fill-[#7f1d1d]" />
          ))}
        </>
      )}
      <TownCupTrophy {...TROPHIES[edition]} />
      {edition === 0 && (
        <path d="M47 59C52 53 60 56 64 54S76 52 82 55 96 52 103 59V61H47Z" className="fill-[#ffffff]" />
      )}
      {edition === 0 && (
        <path d="M52 64l2 7 2-7M64 64l1.6 5 1.6-5M84 64l2 8 2-8M96 64l1.6 5 1.6-5" className="fill-[#e0f2fe]" />
      )}
      {edition === 3 && (
        <path d="M70 62H80V70C80 76 78 80 76 82S74 86 74 92C74 96 70 96 70 92V62Z" className="fill-[#b91c1c]" />
      )}
      <g className="opacity-0 transition-opacity duration-300 group-hover/mag:opacity-100 group-focus-visible/mag:opacity-100 motion-reduce:hidden motion-lite:hidden">
        {SPARKS[edition].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <path
              d={SPARK}
              className={`origin-center fill-[#ffffff] [transform-box:fill-box] motion-safe:animate-[twinkle_1.4s_ease-in-out_infinite] ${
                ['', '[animation-delay:0.35s]', '[animation-delay:0.7s]', '[animation-delay:1.05s]'][i]
              }`}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
