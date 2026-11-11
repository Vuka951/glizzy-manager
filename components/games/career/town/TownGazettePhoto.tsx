const SNOW: [number, number][] = [
  [12, 14], [30, 28], [52, 10], [70, 34], [96, 18], [118, 30], [140, 12], [150, 38],
  [22, 46], [84, 50], [130, 52], [62, 22],
];
const BLOSSOM: [number, number, number][] = [
  [26, 34, 11], [40, 26, 12], [52, 38, 10], [34, 46, 9], [18, 46, 8], [46, 50, 7],
];
const CROWS: [number, number][] = [[58, 22], [72, 16], [104, 26]];

// The Gazette's front-page photo, a duotone print of the town in the
// edition's weather: snowed-in roofs under a cold moon for the Frozen Edition, a
// blossoming tree over the eggplant beds for the Eggplant Edition, sunset over the lake
// with a sail for the Summer Edition, a blood moon over bare trees and crows for the Bloody Edition
export default function TownGazettePhoto({ edition }: { edition: number }) {
  return (
    <svg
      viewBox="0 0 160 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    >
      {edition === 0 && (
        <>
          <rect width="160" height="100" className="fill-[#1e3a5f]" />
          <circle cx="124" cy="22" r="10" className="fill-[#e0f2fe]" />
          <circle cx="128" cy="19" r="9" className="fill-[#1e3a5f]" />
          <path d="M0 70L18 52L30 62L44 44L60 66L76 50L92 64L110 46L128 62L144 52L160 66V100H0Z" className="fill-[#2f5788]" />
          <path d="M12 100V72L26 60L40 72V100ZM46 100V66L62 54L78 66V100ZM88 100V74L100 64L112 74V100ZM118 100V68L134 56L150 68V100Z" className="fill-[#0f2440]" />
          <path d="M10 73L26 59L42 73L40 75L26 63L12 75ZM44 67L62 53L80 67L78 69L62 57L46 69ZM86 75L100 63L114 75L112 77L100 67L88 77ZM116 69L134 55L152 69L150 71L134 59L118 71Z" className="fill-[#f1f5f9]" />
          <path d="M20 80h4v5h-4zM56 76h5v5h-5zM96 82h4v5h-4zM130 78h5v5h-5z" className="fill-[#fde68a]" />
          <path d="M0 92C40 88 80 96 120 90S150 88 160 90V100H0Z" className="fill-[#f1f5f9]" />
          {SNOW.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.4 : 1} className="fill-[#ffffff]/90" />
          ))}
        </>
      )}
      {edition === 1 && (
        <>
          <rect width="160" height="100" className="fill-[#4c1d5e]" />
          <rect y="40" width="160" height="30" className="fill-[#83508f]" />
          <circle cx="118" cy="40" r="14" className="fill-[#f9a8d4]/70" />
          <path d="M0 64C40 56 80 66 120 58S150 56 160 60V100H0Z" className="fill-[#2f6b58]" />
          <path d="M0 76H160M0 86H160M0 96H160" strokeWidth="1.2" className="stroke-[#1a3242]" />
          {[[74, 74], [96, 72], [118, 76], [140, 72], [86, 86], [110, 84], [134, 88], [100, 96], [124, 97]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${i % 2 ? 20 : -20})`}>
              <ellipse rx="2.6" ry="4.6" className="fill-[#6b2fa0]" />
              <path d="M-2 -4L0 -6L2 -4Z" className="fill-[#65a30d]" />
            </g>
          ))}
          <path d="M34 100V54M34 66L24 56M34 60L44 50" fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-[#2e1a2e]" />
          {BLOSSOM.map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} className={i % 2 ? 'fill-[#f9a8d4]' : 'fill-[#fbcfe8]'} />
          ))}
          <path d="M60 30l1.2 2M74 44l1.2 2M88 22l1.2 2M66 56l1.2 2" strokeWidth="2" strokeLinecap="round" className="stroke-[#fbcfe8]" />
        </>
      )}
      {edition === 2 && (
        <>
          <rect width="160" height="100" className="fill-[#f2b862]" />
          <rect width="160" height="34" className="fill-[#c0694a]/60" />
          <circle cx="80" cy="56" r="18" className="fill-[#fff7d6]" />
          <path d="M0 58C20 48 40 54 56 50S90 46 104 52 140 44 160 50V62H0Z" className="fill-[#584272]" />
          <rect y="60" width="160" height="40" className="fill-[#2f6f86]" />
          <path d="M66 66h28M70 72h20M74 78h12M76 84h8" strokeWidth="2" strokeLinecap="round" className="stroke-[#fde68a]/80" />
          <path d="M22 70q8-2 16 0M120 74q10-2 20 0M30 88q10-2 20 0M110 90q10-2 20 0" fill="none" strokeWidth="1" strokeLinecap="round" className="stroke-[#bae6fd]/60" />
          <path d="M118 64V44L132 64Z" className="fill-[#ffffff]" />
          <path d="M112 65H138L134 70H116Z" className="fill-[#7c2d12]" />
          <path d="M28 24l4 3 4-3M44 16l3 2.4 3-2.4" fill="none" strokeWidth="1.2" strokeLinecap="round" className="stroke-[#3b2416]" />
        </>
      )}
      {edition === 3 && (
        <>
          <rect width="160" height="100" className="fill-[#33223d]" />
          <rect y="44" width="160" height="56" className="fill-[#93402c]/60" />
          <circle cx="106" cy="34" r="20" className="fill-[#ef4444]/25" />
          <circle cx="106" cy="34" r="14" className="fill-[#b91c1c]" />
          <path d="M0 74C30 66 60 76 90 70S140 64 160 70V100H0Z" className="fill-[#2a1219]" />
          <path d="M26 100V48M26 64L14 52M26 58L38 44M26 72L36 64M136 100V54M136 68L148 58M136 62L126 50" fill="none" strokeWidth="2.6" strokeLinecap="round" className="stroke-[#0b0908]" />
          {CROWS.map(([x, y]) => (
            <path key={x} d={`M${x - 5} ${y}q2.5-2.6 5 0q2.5-2.6 5 0`} fill="none" strokeWidth="1.4" strokeLinecap="round" className="stroke-[#0b0908]" />
          ))}
          <path d="M0 86C40 80 80 90 120 84S150 82 160 84" fill="none" strokeWidth="5" className="stroke-[#e7dcc0]/15" />
          <path d="M60 82l2 2M76 88l2 1M98 80l2 2" strokeWidth="2" strokeLinecap="round" className="stroke-[#e0802f]" />
        </>
      )}
    </svg>
  );
}
