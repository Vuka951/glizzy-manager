import { GAMES_UI } from '@/data/games/locale';

const SIGNS = GAMES_UI.career.town.signs;

const WINDOWS = [14, 34, 54, 74, 94];
// Who is already on board, by window: a head and its colour, or nobody
const RIDERS: (string | null)[] = [
  'fill-slate-700',
  null,
  'fill-rose-900',
  'fill-slate-800',
  null,
];
const WHEELS = [30, 146];

// The cup bus side on: cream top, red skirt with a gold stripe, a trophy and
// a glizzy for livery, the cup on the destination board and its headlights
// throwing a beam down the road. Faces right
export default function TownCupBusArt({
  wheelRef,
  puffRef,
}: {
  wheelRef: (el: SVGGElement | null, index: number) => void;
  puffRef: React.Ref<SVGGElement>;
}) {
  return (
    <svg
      viewBox="0 0 160 56"
      className="h-full w-full overflow-visible"
      aria-hidden="true"
    >
      <ellipse cx="80" cy="54" rx="80" ry="3" className="fill-black/40" />
      <path
        d="M156 37 L226 26 L232 56 L156 46 Z"
        className="fill-amber-100/15 blur-[3px]"
      />
      <ellipse
        cx="200"
        cy="54"
        rx="30"
        ry="3"
        className="fill-amber-100/20 blur-[2px]"
      />

      <g ref={puffRef} className="opacity-0">
        <circle cx="-4" cy="46" r="3" className="fill-slate-400/50" />
        <circle cx="-10" cy="43" r="4" className="fill-slate-400/35" />
        <circle cx="-17" cy="40" r="5" className="fill-slate-400/20" />
      </g>

      <rect x="44" y="1.5" width="40" height="5" rx="1.5" className="fill-slate-400" />
      <rect x="47" y="2.5" width="34" height="1" className="fill-slate-500" />

      <path
        d="M10 5 H144 Q153 5 154.6 13 L157.4 40 Q158 48 151 48 H8 Q4 48 4 44 V11 Q4 5 10 5 Z"
        className="fill-[#efe6d2]"
      />
      <path
        d="M4 31 H156.2 L157.4 40 Q158 48 151 48 H8 Q4 48 4 44 Z"
        className="fill-red-600"
      />
      <rect x="4" y="30" width="153" height="2.4" className="fill-amber-400" />
      <rect x="4" y="44.6" width="153.6" height="1.4" className="fill-red-800" />

      {WINDOWS.map((x, i) => (
        <g key={x}>
          <rect x={x} y="10" width="17" height="15" rx="1.5" className="fill-slate-900" />
          <rect
            x={x + 1.2}
            y="11.2"
            width="14.6"
            height="12.6"
            rx="1"
            className="fill-amber-100/85"
          />
          {RIDERS[i] && (
            <>
              <circle cx={x + 8.5} cy="18" r="3" className={RIDERS[i]} />
              <rect
                x={x + 4}
                y="20.6"
                width="9"
                height="3.4"
                rx="1.5"
                className={RIDERS[i]}
              />
            </>
          )}
        </g>
      ))}

      <rect x="119" y="9" width="17" height="37" rx="1.5" className="fill-slate-900" />
      <rect x="120.4" y="10.6" width="6.4" height="33.8" className="fill-amber-100/70" />
      <rect x="128.2" y="10.6" width="6.4" height="33.8" className="fill-amber-100/70" />
      <rect x="127" y="10.6" width="1" height="33.8" className="fill-slate-700" />

      <path d="M140 10 H151 Q153.6 10 154 13 L156 29 H140 Z" className="fill-slate-900" />
      <path d="M141.4 11.6 H150.6 Q152.4 11.6 152.6 13.6 L154.2 27.6 H141.4 Z" className="fill-sky-200/40" />
      <path d="M143 13 L147 13 L144 26 L142.6 26 Z" className="fill-white/25" />

      <rect x="96" y="5.6" width="38" height="3.2" className="fill-slate-900" />
      <text
        x="115"
        y="8.2"
        textAnchor="middle"
        fontSize="3.2"
        className="fill-amber-300 font-mono font-black tracking-[0.3em] drop-shadow-[0_0_1.5px_#fbbf24]"
      >
        {SIGNS.cup.toUpperCase()}
      </text>

      <path d="M63 34.5 h9 v2.4 q0 3.6 -3.4 4.2 v2 h2 v1.4 h-6.2 v-1.4 h2 v-2 q-3.4 -0.6 -3.4 -4.2 Z" className="fill-amber-300" />
      <path d="M63 35.4 q-2.6 0 -2.6 2 q0 1.6 2.8 2" className="fill-none stroke-amber-300" strokeWidth="0.9" />
      <path d="M72 35.4 q2.6 0 2.6 2 q0 1.6 -2.8 2" className="fill-none stroke-amber-300" strokeWidth="0.9" />
      <rect x="80" y="35.6" width="30" height="6.4" rx="3.2" className="fill-amber-700" />
      <rect x="82" y="36.8" width="26" height="4" rx="2" className="fill-orange-400" />
      <path
        d="M84 39 l2.4 -1.4 l2.4 1.4 l2.4 -1.4 l2.4 1.4 l2.4 -1.4 l2.4 1.4 l2.4 -1.4 l2.4 1.4"
        className="fill-none stroke-yellow-300"
        strokeWidth="0.9"
        strokeLinecap="round"
      />

      <rect x="4" y="34" width="3" height="7" rx="1" className="fill-red-400" />
      <circle cx="5.5" cy="37.5" r="4" className="fill-red-500/40 blur-[2px]" />
      <rect x="153.6" y="35.4" width="4" height="4.6" rx="1.2" className="fill-amber-50" />
      <circle cx="156" cy="37.6" r="4.4" className="fill-amber-100/50 blur-[2px]" />
      <path d="M154.6 12 h3.4 v5 h-1.2" className="fill-none stroke-slate-900" strokeWidth="1.2" />

      {WHEELS.map((cx, i) => (
        <g key={cx}>
          <path
            d={`M${cx - 10} 48 a10 10 0 0 1 20 0 Z`}
            className="fill-slate-950"
          />
          <circle cx={cx} cy="48" r="7.4" className="fill-slate-900" />
          <g
            ref={(el) => wheelRef(el, i)}
            className="origin-center [transform-box:fill-box]"
          >
            <circle cx={cx} cy="48" r="3.6" className="fill-slate-400" />
            <rect x={cx - 0.6} y="44.4" width="1.2" height="7.2" className="fill-slate-600" />
            <rect x={cx - 3.6} y="47.4" width="7.2" height="1.2" className="fill-slate-600" />
          </g>
        </g>
      ))}
    </svg>
  );
}
