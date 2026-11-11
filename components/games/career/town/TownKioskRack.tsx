const PAPERS = [
  { tilt: '-rotate-2', head: 'bg-[#b91c1c]', size: 'h-[4.75rem] w-[3.75rem]' },
  { tilt: 'rotate-1', head: 'bg-[#1e3a8a]', size: 'h-[5.25rem] w-[4.25rem]' },
  { tilt: '-rotate-1', head: 'bg-[#1c1917]', size: 'h-[4.75rem] w-[3.5rem]' },
  { tilt: 'rotate-2', head: 'bg-[#166534]', size: 'h-[5rem] w-[4rem]' },
  { tilt: '-rotate-2', head: 'bg-[#a16207]', size: 'h-[4.5rem] w-[3.75rem]' },
  { tilt: 'rotate-1', head: 'bg-[#b91c1c]', size: 'h-[5.25rem] w-[4.25rem]' },
  { tilt: '-rotate-1', head: 'bg-[#1e3a8a]', size: 'h-[4.75rem] w-[3.75rem]' },
];

const SWEETS = [
  'bg-[#b91c1c]', 'bg-[#f1e8d3]', 'bg-[#1e3a8a]', 'bg-[#a16207]', 'bg-[#166534]',
  'bg-[#f1e8d3]', 'bg-[#b91c1c]', 'bg-[#1c1917]', 'bg-[#1e3a8a]', 'bg-[#f1e8d3]',
  'bg-[#a16207]', 'bg-[#b91c1c]', 'bg-[#166534]', 'bg-[#1c1917]', 'bg-[#f1e8d3]',
  'bg-[#1e3a8a]', 'bg-[#b91c1c]', 'bg-[#a16207]',
];

// Behind the kiosk's counter: last week's papers pegged on a wire, the small
// print of their columns all that reads from here, and a shelf of sweets
// boxes. Dressing only, so the counter never looks cleared out
export default function TownKioskRack() {
  return (
    <div
      aria-hidden="true"
      className="relative overflow-hidden border-b-4 border-[#2b1d14] bg-[#1d2a24] bg-[repeating-linear-gradient(90deg,transparent_0_30px,rgb(0_0_0/0.18)_30px_32px)] shadow-[inset_0_8px_12px_rgb(0_0_0/0.5)]"
    >
      <span className="absolute inset-x-0 top-3 h-0.5 bg-[#94a3b8]/70" />
      <div className="relative flex justify-center gap-[3%] px-2 pt-[0.6rem]">
        {PAPERS.map((paper, i) => (
          <span
            key={i}
            className={`relative block shrink-0 origin-top rounded-[1px] bg-[#e9e0c9] p-1 shadow-[0_3px_0_rgb(0_0_0/0.35)] ${paper.tilt} ${paper.size} ${
              i > 3 ? 'hidden sm:block' : ''
            }`}
          >
            <span className="absolute -top-1 left-1/2 h-3 w-1.5 -translate-x-1/2 rounded-[1px] bg-[#b8862f] shadow-[0_1px_0_rgb(0_0_0/0.5)]" />
            <span className={`mt-1 block h-2 ${paper.head}`} />
            <span className="mt-1 block h-1 w-full bg-[#1c1408]/55" />
            <span className="mt-1 block h-[3px] w-4/5 bg-[#1c1408]/30" />
            <span className="mt-[3px] block h-[3px] w-full bg-[#1c1408]/30" />
            <span className="mt-[3px] block h-[3px] w-3/5 bg-[#1c1408]/30" />
            <span className="mt-[3px] block h-[3px] w-full bg-[#1c1408]/30" />
          </span>
        ))}
      </div>
      <div className="relative mt-2 flex justify-center gap-[3px] overflow-hidden px-3">
        {SWEETS.map((box, i) => (
          <span
            key={i}
            className={`h-5 w-6 shrink-0 rounded-t-[1px] shadow-[inset_0_-6px_0_rgb(0_0_0/0.14),inset_0_4px_0_rgb(255_255_255/0.22)] ${box}`}
          />
        ))}
      </div>
      <span className="relative block h-2 bg-[#5b3a1e] shadow-[inset_0_1px_0_rgb(255_255_255/0.14)]" />
    </div>
  );
}
