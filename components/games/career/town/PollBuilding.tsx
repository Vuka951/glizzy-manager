import { useRef } from 'react';
import TownFacadeCobweb from '@/components/games/career/town/TownFacadeCobweb';
import TownFacadeLit from '@/components/games/career/town/TownFacadeLit';
import TownFacadeWeeds from '@/components/games/career/town/TownFacadeWeeds';
import TownParliamentEmblem from '@/components/games/career/town/TownParliamentEmblem';
import useBuildingMotion from '@/components/games/career/town/useBuildingMotion';
import { PARTY_SEAT_ORDER } from '@/data/games/careerElections';
import { GAMES_UI } from '@/data/games/locale';
import { SPONSOR_THEMES } from '@/lib/constants/sponsorThemes';
import { FACADE_SIGN_AT } from '@/lib/constants/townFacade';
import type { TownBuildingMode } from '@/lib/types/town';
import type { SponsorId } from '@/lib/utils/careerSave';
import { facadeTint } from '@/lib/utils/townFacade';

const SIGNS = GAMES_UI.career.town.signs;
const COL = 36;
const LEFT = 8;
const BASE = 74;
const TALL = 36;
// A bar this share of the vote or more reaches the top of the board
const FULL_SHARE = 40;

// The party poll board on the front strip, the standings board's smaller sister: the
// four parties' current share of the vote as bars, seated left to right as in
// the chamber, each over its emblem. Before the city has a parliament it
// stands dark, blank and peeling
export default function PollBuilding({
  votes,
  mode,
}: {
  votes: Record<SponsorId, number> | null;
  mode: TownBuildingMode;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const live = mode !== 'abandoned' && votes !== null;
  useBuildingMotion(ref, mode);
  const top = votes ? Math.max(FULL_SHARE, ...Object.values(votes)) : FULL_SHARE;

  return (
    <svg
      ref={ref}
      viewBox="0 0 160 135"
      className={`h-full w-full overflow-visible ${facadeTint(mode)}`}
      aria-hidden="true"
    >
      <ellipse cx="80" cy="132" rx="78" ry="5" className="fill-[rgba(0,0,0,0.35)]" />
      <rect x="34" y="92" width="7" height="41" className="fill-[#4b5563]" />
      <rect x="119" y="92" width="7" height="41" className="fill-[#4b5563]" />
      <path d="M37 108h86" className="stroke-[#374151]" strokeWidth="2" />
      <rect x="4" y="6" width="152" height="88" rx="2" className="fill-[#0b1220] stroke-[#374151]" strokeWidth="4" />
      <TownFacadeLit mode={mode} at={FACADE_SIGN_AT}>
        <path
          d="M40 2L20 94H60ZM120 2L100 94H140Z"
          className="fill-[#fef3c7] opacity-[0.07] transition-opacity duration-300 group-hover/building:opacity-[0.16]"
        />
      </TownFacadeLit>
      <path d="M40 4v-6M120 4v-6" className="stroke-[#6b7280]" strokeWidth="2" />
      <path
        d={live ? 'M34 -2h12M114 -2h12' : 'M34 -2h12M115 -1l9 5'}
        className={live ? 'stroke-[#fde68a]' : 'stroke-[#4b5563]'}
        strokeWidth="3"
        strokeLinecap="round"
      />

      {live && votes ? (
        <g>
          <text
            x="80"
            y="17.5"
            textAnchor="middle"
            fontSize="8"
            letterSpacing="1.6"
            className="fill-[#94a3b8] font-sans font-extrabold"
          >
            {SIGNS.poll.toUpperCase()}
          </text>
          <path d={`M${LEFT + 4} ${BASE}h${COL * 4 - 8}`} className="stroke-[#334155]" strokeWidth="1" />
          {PARTY_SEAT_ORDER.map((party, i) => {
            const cx = LEFT + COL * i + COL / 2;
            const h = Math.max(1.5, (votes[party] / top) * TALL);
            return (
              <g key={party}>
                <rect x={cx - 9} y={BASE - h} width="18" height={h} rx="1" className={SPONSOR_THEMES[party].bar} />
                <text
                  x={cx}
                  y={BASE - h - 3}
                  textAnchor="middle"
                  fontSize="11"
                  className="fill-[#f1f5f9] font-mono font-bold"
                >
                  {votes[party]}
                </text>
                <circle cx={cx} cy={BASE + 8} r="6.6" className="fill-[#f8fafc]" />
                <TownParliamentEmblem party={party} x={cx - 5.5} y={BASE + 2.5} size={11} />
              </g>
            );
          })}
        </g>
      ) : (
        <g>
          <path d="M12 18l36-2 3 22-6 5 2 14-30 2-5-16 3-8z" className="fill-[#94a3b8] opacity-40" />
          <path d="M64 12h46l-2 30-9-3-6 11-12-4-9 8-10-2z" className="fill-[#fca5a5] opacity-30" />
          <path d="M116 40l32-2 2 34-12 4-6-7-10 7-8-12z" className="fill-[#fde68a] opacity-25" />
          <path d="M88 52l4 28 4-2-2-26z" className="fill-[#cbd5e1] opacity-40" />
          <path d="M20 28h20M20 34h14M72 22h24M72 28h16" className="stroke-[#334155]" strokeWidth="2" />
          <path d="M8 58q4 16 2 30M150 10q-3 20 0 30" className="fill-none stroke-[#7c2d12] opacity-60" strokeWidth="1.4" />
          <TownFacadeCobweb x={6} y={8} r={14} />
          <TownFacadeWeeds x={28} y={133} w={20} seed={3} />
          <TownFacadeWeeds x={114} y={133} w={20} seed={6} />
        </g>
      )}
    </svg>
  );
}
