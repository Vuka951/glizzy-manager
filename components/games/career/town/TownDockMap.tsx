import { GAMES_UI } from '@/data/games/locale';

const TICKET = GAMES_UI.career.town.dockTicket;
const WAVES = [
  'M250 44q9-7 18 0t18 0',
  'M92 104q9-7 18 0t18 0',
  'M344 150q9-7 18 0t18 0',
  'M520 34q9-7 18 0t18 0',
  'M214 192q9-7 18 0t18 0',
  'M580 200q9-7 18 0t18 0',
];

// The holiday map the tickets lie on: a turquoise bay from the Leskovac pier to
// the island, the red route with the boat on it, the sun, a gull and a compass,
// printed in a brochure's loud colours. The sea runs on under the tickets
export default function TownDockMap({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="@container relative isolate flex flex-col overflow-hidden bg-[#22b8cf] bg-[repeating-linear-gradient(90deg,transparent_0_79px,rgb(255_255_255/0.16)_79px_80px),repeating-linear-gradient(0deg,transparent_0_79px,rgb(255_255_255/0.16)_79px_80px)]">
      <svg
        viewBox="0 0 640 240"
        aria-hidden="true"
        className="block w-full shrink-0"
      >
        <path d="M0 0h640v240H0z" className="fill-[#22b8cf]" />
        <path
          d="M80 0v240M160 0v240M240 0v240M320 0v240M400 0v240M480 0v240M560 0v240M0 80h640M0 160h640"
          className="stroke-white/20"
        />
        {WAVES.map((d) => (
          <path
            key={d}
            d={d}
            className="fill-none stroke-[#c9f6ff]"
            strokeWidth="3"
            strokeLinecap="round"
          />
        ))}
        <circle cx="330" cy="46" r="24" className="fill-[#fde047]" />
        <path
          d="M330 8v-8M330 92v-8M292 46h-8M376 46h-8M303 19l-6-6M363 79l-6-6M303 73l-6 6M363 13l-6 6"
          className="stroke-[#fde047]"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path d="M236 92q9-10 16 0 7-10 16 0" className="fill-none stroke-white" strokeWidth="3" strokeLinecap="round" />

        <path
          d="M0 120c34-8 62 4 84 28 18 20 28 46 24 92H0z"
          className="fill-[#fbe6a2]"
        />
        <path
          d="M0 138c26-6 48 4 66 24 14 16 22 44 18 78H0z"
          className="fill-[#4ade80]"
        />
        <path d="M14 196h40v30H14z" className="fill-[#f8fafc]" />
        <path d="M10 196l24-20 24 20z" className="fill-[#ef4444]" />
        <rect x="28" y="208" width="11" height="18" className="fill-[#1e40af]" />
        <path d="M92 196h46" className="stroke-[#92400e]" strokeWidth="6" strokeLinecap="round" />
        <path d="M104 196v18M126 196v18" className="stroke-[#92400e]" strokeWidth="4" />
        <circle cx="140" cy="196" r="7" className="fill-[#ef4444] stroke-white" strokeWidth="3" />
        <text x="10" y="170" className="fill-[#14532d] font-sign text-[20px] font-bold uppercase tracking-[0.04em]">
          {TICKET.from}
        </text>

        <path
          d="M498 150c-6-38 34-66 74-66s68 26 68 26v130H520c-14-28-16-58-22-90z"
          className="fill-[#fbe6a2]"
        />
        <path
          d="M526 150c-4-26 22-44 52-44s62 22 62 22v112H546c-10-24-16-62-20-90z"
          className="fill-[#22c55e]"
        />
        <path d="M578 100c2 24 2 44-2 66" className="fill-none stroke-[#92400e]" strokeWidth="6" strokeLinecap="round" />
        <path
          d="M578 100c-16-14-32-12-42-2 14-2 28 0 42 2zM578 100c16-14 32-12 42-2-14-2-28 0-42 2zM578 100c-12-20-26-22-36-20 12 4 24 12 36 20zM578 100c10-20 24-24 36-22-12 6-26 14-36 22z"
          className="fill-[#15803d]"
        />
        <text
          x="630"
          y="196"
          textAnchor="end"
          className="fill-[#14532d] font-sign text-[20px] font-bold uppercase tracking-[0.04em]"
        >
          {TICKET.to}
        </text>
        <path d="M548 204l12 12M560 204l-12 12" className="stroke-[#dc2626]" strokeWidth="4" strokeLinecap="round" />

        <path
          d="M146 192C230 132 320 214 412 150c44-30 92 0 126 56"
          className="fill-none stroke-[#dc2626]"
          strokeWidth="4"
          strokeDasharray="11 9"
          strokeLinecap="round"
        />
        <g transform="translate(330 164) rotate(-8)">
          <path d="M-34 0h68l-12 18h-44z" className="fill-white" />
          <path d="M-29 8h58l-5 7h-48z" className="fill-[#ef4444]" />
          <path d="M-16 0v-13h26l6 13z" className="fill-[#fde047]" />
          <path d="M-9 -8h6M2 -8h6" className="stroke-[#1e40af]" strokeWidth="3" />
          <path d="M-4 -13v-15l18 15z" className="fill-[#f97316]" />
        </g>

        <g transform="translate(44 44)">
          <circle r="26" className="fill-white/90 stroke-[#1e40af]" strokeWidth="2.5" />
          <path d="M0 -22l6 22H-6z" className="fill-[#dc2626]" />
          <path d="M0 22l6-22H-6z" className="fill-[#1e40af]" />
          <path d="M-22 0h44" className="stroke-[#1e40af]" strokeWidth="2" />
        </g>
      </svg>
      <div className="relative -mt-[2cqw] flex flex-col items-center gap-3 px-3 pb-4">
        {children}
      </div>
    </div>
  );
}
