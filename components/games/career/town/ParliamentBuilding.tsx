import { useLayoutEffect, useRef } from 'react';
import ParliamentBanner from '@/components/games/career/town/ParliamentBanner';
import ParliamentWindows from '@/components/games/career/town/ParliamentWindows';
import TownFacadeCobweb from '@/components/games/career/town/TownFacadeCobweb';
import TownFacadeLamp from '@/components/games/career/town/TownFacadeLamp';
import TownFacadeLit from '@/components/games/career/town/TownFacadeLit';
import TownFacadeNight from '@/components/games/career/town/TownFacadeNight';
import TownFacadeWeeds from '@/components/games/career/town/TownFacadeWeeds';
import TownFlagCloth from '@/components/games/career/town/TownFlagCloth';
import TownParliamentCampaign from '@/components/games/career/town/TownParliamentCampaign';
import TownParliamentDropBanner from '@/components/games/career/town/TownParliamentDropBanner';
import useBuildingMotion from '@/components/games/career/town/useBuildingMotion';
import { PARTY_SEAT_ORDER } from '@/data/games/careerElections';
import { GAMES_UI } from '@/data/games/locale';
import {
  FACADE_NIGHT_AT,
  FACADE_SHUTTER_AT,
  FACADE_SIGN_AT,
} from '@/lib/constants/townFacade';
import { RALLY_UNROLL_STEP } from '@/lib/constants/townParliament';
import type { TownBuildingMode } from '@/lib/types/town';
import type { SavedCareer } from '@/lib/utils/careerSave';
import { prefersReducedMotion } from '@/lib/utils/motion';
import { facadeTint } from '@/lib/utils/townFacade';

const SIGNS = GAMES_UI.career.town.signs;

const UNROLL: Keyframe[] = [
  { transform: 'scaleY(0)' },
  { transform: 'scaleY(1.05)', offset: 0.8 },
  { transform: 'scaleY(0.98)', offset: 0.9 },
  { transform: 'scaleY(1)' },
];

// The parliament on the back of the square: stone wings, a columned centre and
// the clock tower. Leskovac flies on the tower, Pčinja on both wings,
// the governing party and its partner on the corner poles. Once a party
// governs, its rally sheets hang down both wings and its campaign ad is
// strung across the front; a new government unrolls them from the roof.
// Shut, the blinds come down and the doors close, the clock face left lit;
// abandoned, the clock has stopped and weeds climb the steps
export default function ParliamentBuilding({
  career,
  mode,
  election,
}: {
  career: SavedCareer;
  mode: TownBuildingMode;
  election: boolean;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const open = mode === 'open';
  const abandoned = mode === 'abandoned';
  const government = career.parliament?.government ?? [];
  const [lead, partner] = government;
  const governmentKey = government.join(',');
  const electionLabel = SIGNS.election.toUpperCase();
  useBuildingMotion(ref, mode);

  const previousGovernment = useRef(governmentKey);
  // A layout effect so a new government's sheets never paint before they unroll
  useLayoutEffect(() => {
    const before = previousGovernment.current;
    previousGovernment.current = governmentKey;
    const root = ref.current;
    if (!root || before === governmentKey || prefersReducedMotion()) return;
    const unrolls = Array.from(
      root.querySelectorAll<SVGElement>('[data-unroll]'),
      (el) =>
        el.animate(UNROLL, {
          duration: 1100,
          delay: Number(el.dataset.at) || 0,
          easing: 'cubic-bezier(0.3, 0, 0.4, 1)',
          fill: 'backwards',
        }),
    );
    return () => unrolls.forEach((a) => a.cancel());
  }, [governmentKey]);

  return (
    <svg
      ref={ref}
      viewBox="0 0 260 205"
      className={`h-full w-full overflow-visible ${facadeTint(mode)}`}
      aria-hidden="true"
    >
      <ellipse cx="130" cy="202" rx="128" ry="5" className="fill-[rgba(0,0,0,0.35)]" />

      <path d="M60 88V58M200 88V58M130 4V-18" className="stroke-[#cbd5e1]" strokeWidth="1.6" />
      {lead && <path d="M234 88V62" className="stroke-[#cbd5e1]" strokeWidth="1.4" />}
      {partner && <path d="M26 88V62" className="stroke-[#cbd5e1]" strokeWidth="1.4" />}
      <circle cx="130" cy="-18" r="1.8" className="fill-[#fcd34d]" />

      <rect x="18" y="92" width="224" height="106" className="fill-[#9a9487]" />
      <rect x="18" y="88" width="224" height="6" className="fill-[#7c776c]" />
      <rect x="98" y="66" width="64" height="132" className="fill-[#a8a294]" />
      <rect x="113" y="44" width="34" height="24" className="fill-[#948e81]" />
      <path d="M92 68L130 46l38 22z" className="fill-[#7c776c]" />
      <path d="M104 64L130 50l26 14z" className="fill-[#8c867a]" />
      <rect x="114" y="21" width="32" height="23" className="fill-[#a8a294]" />
      <rect x="110" y="42" width="40" height="4" className="fill-[#7c776c]" />
      <rect x="111" y="19" width="38" height="3" className="fill-[#7c776c]" />
      <path d="M112 19h36l-18-15z" className="fill-[#3f4a5a]" />

      <circle
        cx="130"
        cy="32"
        r="9"
        className={`stroke-[#78716c] ${abandoned ? 'fill-[#8a8270]' : 'fill-[#e7dcc0]'}`}
        strokeWidth="2"
      />
      {abandoned && (
        <path d="M124 27l5 4-1 4 4 3" className="fill-none stroke-[#44403c]" strokeWidth="0.7" />
      )}
      {!abandoned && (
        <circle
          cx="130"
          cy="32"
          r="12"
          className={`fill-[#fde68a] ${open ? 'opacity-15 transition-opacity duration-300 group-hover/building:opacity-40' : 'opacity-25'}`}
        />
      )}
      <g className="stroke-[#1c1917]" strokeLinecap="round">
        <line
          x1="130"
          y1="32"
          x2={abandoned ? 133.5 : 130}
          y2={abandoned ? 28.5 : 27}
          strokeWidth="2"
          className={`origin-bottom [transform-box:fill-box] ${open ? 'motion-safe:animate-[spin_720s_linear_infinite] motion-lite:animate-none!' : ''}`}
        />
        <line
          x1="130"
          y1="32"
          x2={abandoned ? 124 : 130}
          y2={abandoned ? 34 : 25}
          strokeWidth="1.3"
          className={`origin-bottom [transform-box:fill-box] ${open ? 'motion-safe:animate-[spin_60s_linear_infinite] motion-lite:animate-none!' : ''}`}
        />
      </g>

      <rect x="102" y="68" width="56" height="11" className="fill-[#5b5750]" />
      <text
        x="130"
        y="76.6"
        textAnchor="middle"
        fontSize="8.4"
        textLength="50"
        lengthAdjust="spacingAndGlyphs"
        className={`font-sans font-black ${abandoned ? 'fill-[#3f3b35]' : 'fill-[#a8a29e]'}`}
      >
        {SIGNS.parliament.toUpperCase()}
      </text>
      <TownFacadeLit mode={mode} at={FACADE_SIGN_AT}>
        <text
          x="130"
          y="76.6"
          textAnchor="middle"
          fontSize="8.4"
          textLength="50"
          lengthAdjust="spacingAndGlyphs"
          className="fill-[#fde68a] font-sans font-black drop-shadow-[0_0_2px_#fbbf24]"
        >
          {SIGNS.parliament.toUpperCase()}
        </text>
      </TownFacadeLit>

      <TownFacadeLit mode={mode} at={FACADE_SHUTTER_AT}>
        <circle
          cx="130"
          cy="146"
          r="62"
          className="fill-[#fbbf24] opacity-15 blur-[6px] transition-opacity duration-300 group-hover/building:opacity-40"
        />
        <ellipse
          cx="130"
          cy="202"
          rx="46"
          ry="4"
          className="fill-[#fde68a] opacity-25 transition-opacity duration-300 group-hover/building:opacity-45"
        />
      </TownFacadeLit>
      <g
        className={
          open
            ? 'opacity-80 transition-opacity duration-300 group-hover/building:opacity-100'
            : ''
        }
      >
        <ParliamentWindows x0={28} y0={104} cols={5} rows={2} w={9} h={22} gx={13} gy={40} seed={1} lit="fill-[#fbbf24]" mode={mode} />
        <ParliamentWindows x0={167} y0={104} cols={5} rows={2} w={9} h={22} gx={13} gy={40} seed={4} lit="fill-[#fbbf24]" mode={mode} />
        <ParliamentWindows x0={108} y0={82} cols={3} rows={1} w={10} h={22} gx={16} gy={0} seed={0} lit="fill-[#fde68a]" mode={mode} />
        <rect
          x="116"
          y="150"
          width="28"
          height="32"
          className={abandoned ? 'fill-[#1c1712]' : 'fill-[#fbbf24]'}
        />
      </g>
      {mode === 'shut' && (
        <g data-facade-down="" data-at={FACADE_SHUTTER_AT} className="origin-top [transform-box:fill-box]">
          <rect x="116" y="150" width="28" height="32" className="fill-[#4a2e17]" />
          <path d="M119 153h9v12h-9zM132 153h9v12h-9zM119 168h9v11h-9zM132 168h9v11h-9z" className="fill-none stroke-[#2f1c0e]" strokeWidth="1" />
        </g>
      )}
      {abandoned && (
        <path d="M116 150h13v32h-13z" className="fill-[#3b2615]" />
      )}
      <g className="fill-[#c4bfb3]">
        <rect x="104" y="114" width="7" height="68" />
        <rect x="119" y="114" width="7" height="68" />
        <rect x="134" y="114" width="7" height="68" />
        <rect x="149" y="114" width="7" height="68" />
      </g>
      <rect x="100" y="110" width="60" height="5" className="fill-[#7c776c]" />
      <path d="M130 150v32" className="stroke-[#78350f]" strokeWidth="1.4" />
      <rect x="92" y="182" width="76" height="6" className="fill-[#7c776c]" />
      <rect x="84" y="188" width="92" height="6" className="fill-[#6b665c]" />
      <rect x="76" y="194" width="108" height="6" className="fill-[#5b5750]" />
      <TownFacadeNight mode={mode} at={FACADE_NIGHT_AT}>
        <rect x="116" y="146" width="28" height="3" className="fill-[#7c776c]" />
        <TownFacadeLamp x={130} y={143} r={1.8} drop={39} />
      </TownFacadeNight>

      {lead && (
        <>
          <TownParliamentDropBanner party={lead} x={26} y={94} w={24} h={74} at={0} />
          <TownParliamentDropBanner party={lead} x={210} y={94} w={24} h={74} at={RALLY_UNROLL_STEP} />
          {!election && <TownParliamentCampaign party={lead} at={RALLY_UNROLL_STEP * 2} />}
        </>
      )}

      <TownFlagCloth flag="leskovac" x={131} y={-17} w={24} h={21} wave={2} still={!open} />
      <TownFlagCloth flag="pcinja" x={61} y={58} w={26} h={16} wave={0} still={!open} />
      <TownFlagCloth flag="pcinja" x={201} y={58} w={26} h={16} wave={1} still={!open} />
      {lead && <TownFlagCloth flag={lead} x={235} y={63} w={20} h={13} wave={1} still={!open} />}
      {partner && <TownFlagCloth flag={partner} x={27} y={63} w={20} h={13} wave={0} still={!open} />}
      {abandoned && (
        <>
          <TownFacadeCobweb x={111.5} y={115} r={12} flip />
          <TownFacadeCobweb x={149} y={115} r={10} />
          <TownFacadeCobweb x={18.5} y={94.5} r={14} />
          <TownFacadeWeeds x={74} y={200} w={112} seed={2} />
          <TownFacadeWeeds x={20} y={198} w={52} seed={5} />
          <TownFacadeWeeds x={190} y={198} w={50} seed={8} />
        </>
      )}

      {election && (
        <g>
          <ParliamentBanner x={22} label={electionLabel} />
          <ParliamentBanner x={168} label={electionLabel} />
          {PARTY_SEAT_ORDER.map((party, i) => {
            const px = [30, 52, 186, 208][i];
            return (
              <g key={party}>
                <rect x={px} y="164" width="18" height="24" className="fill-[#f8fafc]" />
                <TownFlagCloth flag={party} x={px + 2} y={166} w={14} h={11} still />
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
}
