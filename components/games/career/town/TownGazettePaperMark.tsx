// What the edition leaves on the Gazette's paper itself, over the print:
// frost creeping in from the corners for the Frozen Edition, a pressed petal for
// the Eggplant Edition, a sun-faded edge and a glass ring for the Summer Edition, a spatter of blood
// for the Bloody Edition
export default function TownGazettePaperMark({ edition }: { edition: number }) {
  return (
    <svg
      viewBox="0 0 150 200"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      {edition === 0 && (
        <>
          <path d="M0 0H34C26 4 22 2 16 8S8 14 6 22 2 30 0 36Z" className="fill-[#bae6fd]/45" />
          <path d="M150 200H112C122 196 128 198 134 192S142 184 144 176 148 168 150 160Z" className="fill-[#bae6fd]/45" />
          <path d="M4 4l10 10M4 12l6 6M12 4l6 6M146 196l-10-10M146 188l-6-6M138 196l-6-6" strokeWidth="0.8" strokeLinecap="round" className="stroke-[#ffffff]" />
        </>
      )}
      {edition === 1 && (
        <g transform="translate(136 126) rotate(-24)">
          <ellipse rx="7" ry="3.4" className="fill-[#f472b6]/55" />
          <ellipse rx="7" ry="3.4" transform="rotate(70)" className="fill-[#f9a8d4]/55" />
          <circle r="1.6" className="fill-[#a21caf]/60" />
        </g>
      )}
      {edition === 2 && (
        <>
          <rect width="150" height="200" className="fill-none stroke-[#f59e0b]/25 [stroke-width:10]" />
          <circle cx="118" cy="128" r="13" fill="none" strokeWidth="2.4" className="stroke-[#92400e]/25" />
        </>
      )}
      {edition === 3 && (
        <>
          <circle cx="134" cy="112" r="5" className="fill-[#991b1b]/75" />
          <circle cx="126" cy="104" r="1.8" className="fill-[#991b1b]/75" />
          <circle cx="143" cy="120" r="1.4" className="fill-[#991b1b]/75" />
          <circle cx="140" cy="102" r="1.1" className="fill-[#991b1b]/75" />
          <path d="M132 116C133 124 131 128 133 134C134 138 136 134 135 128S136 118 135 116Z" className="fill-[#991b1b]/75" />
        </>
      )}
    </svg>
  );
}
