import { useRef } from 'react';
import TownFacadeBrokenPane from '@/components/games/career/town/TownFacadeBrokenPane';
import TownFacadeCobweb from '@/components/games/career/town/TownFacadeCobweb';
import TownFacadeDoorLight from '@/components/games/career/town/TownFacadeDoorLight';
import TownFacadeLamp from '@/components/games/career/town/TownFacadeLamp';
import TownFacadeLit from '@/components/games/career/town/TownFacadeLit';
import TownFacadeNight from '@/components/games/career/town/TownFacadeNight';
import TownFacadeShutter from '@/components/games/career/town/TownFacadeShutter';
import TownFacadeWeeds from '@/components/games/career/town/TownFacadeWeeds';
import TownNeonSign from '@/components/games/career/town/TownNeonSign';
import TownPartyPoster from '@/components/games/career/town/TownPartyPoster';
import TownWindowGrid from '@/components/games/career/town/TownWindowGrid';
import useBuildingMotion from '@/components/games/career/town/useBuildingMotion';
import { GAMES_UI } from '@/data/games/locale';
import {
  FACADE_NIGHT_AT,
  FACADE_SHUTTER_AT,
  FACADE_SIGN_AT,
} from '@/lib/constants/townFacade';
import type { TownBuildingMode } from '@/lib/types/town';
import { facadeTint } from '@/lib/utils/townFacade';

const S = GAMES_UI.career.town.signs;
const VAN = GAMES_UI.shared.broadcast.title;

const LATTICE =
  'M56 210L70 22M88 210L74 22' +
  'M57.5 190h29M59.7 160h24.6M62 130h20M64.2 100h15.6M66.4 70h11.2M68.7 40h6.6' +
  'M57.5 190L84.3 160M59.7 160L82 130M62 130L79.8 100M64.2 100L77.6 70M66.4 70L75.3 40' +
  'M86.5 190L59.7 160M84.3 160L62 130';

// The TV station: a lattice transmitter with blinking aircraft lights and a
// dish, the live screen on the studio front and the outside broadcast van.
// While the party is in government its poster is pasted on the studio wall
// beside the door. Shut, the screen switches off and only the aircraft light
// on the mast keeps burning; abandoned, the screen is smashed, the mast dark
// and the van left to rot
export default function TvStationBuilding({
  partyPoster,
  mode,
}: {
  partyPoster: boolean;
  mode: TownBuildingMode;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const abandoned = mode === 'abandoned';
  const shut = mode === 'shut';
  const beacon = abandoned ? 'fill-[#3f1d1d]' : 'fill-red-500';
  useBuildingMotion(ref, mode);

  return (
    <svg
      ref={ref}
      viewBox="0 0 150 290"
      className={`h-full w-full overflow-visible ${facadeTint(mode)}`}
      aria-hidden="true"
    >
      <ellipse cx="75" cy="287" rx="73" ry="5" className="fill-black opacity-35" />

      <path d={LATTICE} className="fill-none stroke-slate-400" strokeWidth="2.2" />
      <path d="M72 24V6" className="stroke-slate-300" strokeWidth="1.6" />
      <rect x="61" y="98" width="22" height="3" className="fill-slate-500" />
      <g transform={abandoned ? 'translate(77 76) rotate(38)' : 'translate(77 72) rotate(-24)'}>
        <path d="M0 0a13 13 0 0 0 22 9z" className="fill-slate-200" />
        <path d="M11 4.5l5-6" className="stroke-slate-300" strokeWidth="1" />
      </g>
      <g transform="translate(70 128) rotate(20)">
        <path d="M0 0a9 9 0 0 0-15 6z" className="fill-slate-300" />
      </g>

      {!abandoned && (
        <circle
          cx="72"
          cy="6"
          r="12"
          className={`fill-red-500 transition-opacity ${shut ? 'opacity-20' : 'opacity-30 group-hover/building:opacity-55'}`}
        />
      )}
      <circle data-blink="1300" cx="72" cy="6" r="3.8" className={beacon} />
      <g className={shut ? 'opacity-30' : ''}>
        <circle data-blink="1300" data-delay="650" cx="64" cy="100" r="2.6" className={beacon} />
        <circle data-blink="1300" data-delay="650" cx="80" cy="100" r="2.6" className={beacon} />
        <circle data-blink="1300" data-delay="300" cx="59.7" cy="160" r="2.4" className={beacon} />
        <circle data-blink="1300" data-delay="300" cx="84.3" cy="160" r="2.4" className={beacon} />
      </g>

      <rect x="8" y="206" width="118" height="80" className="fill-slate-700" />
      <rect x="116" y="206" width="10" height="80" className="fill-[#2b384b]" />
      <rect x="4" y="200" width="126" height="8" className="fill-slate-800" />
      <path d="M112 200v-6" className="stroke-slate-400" strokeWidth="1.4" />
      <path d="M104 196a10 10 0 0 0 16-6z" className="fill-slate-200" />

      <rect x="14" y="212" width="70" height="42" rx="1.5" className="fill-slate-900" />
      {abandoned ? (
        <TownFacadeBrokenPane x={17} y={215} w={64} h={36} seed={1} />
      ) : (
        <rect x="17" y="215" width="64" height="36" className="fill-[#172033]" />
      )}
      <TownFacadeLit mode={mode} at={FACADE_SIGN_AT}>
        <rect x="17" y="215" width="64" height="36" className="fill-sky-900" />
        <rect
          data-flick=""
          x="17"
          y="215"
          width="64"
          height="36"
          className="fill-sky-500 opacity-50 transition-opacity group-hover/building:opacity-75"
        />
        <circle data-blink="1100" cx="25" cy="223.5" r="2.8" className="fill-red-500" />
        <TownNeonSign
          x={50}
          y={227}
          text={S.live}
          size={9}
          ink="fill-red-100"
          halo="stroke-red-400"
          tracking="tracking-[0.06em]"
          mode="open"
        />
        <rect x="24" y="234" width="32" height="9" rx="4.5" className="fill-[#e0a458]" />
        <rect x="26" y="235.5" width="28" height="6" rx="3" className="fill-[#b4432a]" />
        <circle cx="69" cy="236" r="4" className="fill-sky-950" />
        <path d="M62 246q7-9 14 0z" className="fill-sky-950" />
        <rect x="17" y="245" width="64" height="6" className="fill-red-600 opacity-85" />
      </TownFacadeLit>
      {shut && (
        <path d="M17 238l22-23h10l-32 33zM44 251l37-36v6l-31 30z" className="fill-[#94a3b8] opacity-10" />
      )}
      <TownFacadeNight mode={mode} at={FACADE_NIGHT_AT}>
        <circle cx="77.5" cy="248" r="1.2" className="fill-red-500" />
      </TownFacadeNight>
      {abandoned && <TownFacadeCobweb x={17.5} y={215.5} r={12} />}
      {partyPoster && <TownPartyPoster x={12} y={257} w={32} h={26} mode={mode} />}

      <rect x="88" y="212" width="30" height="17" rx="2" className="fill-[#0b1220]" />
      <TownNeonSign
        x={103}
        y={225}
        text={S.media}
        size={12}
        ink="fill-cyan-200"
        halo="stroke-cyan-300"
        mode={mode}
        buzz
      />
      <rect x="90" y="234" width="28" height="26" className="fill-slate-800" />
      <TownWindowGrid
        x={92}
        y={236}
        cols={2}
        rows={2}
        w={11}
        h={10}
        gapX={13}
        gapY={12}
        on="fill-sky-200"
        off="fill-[#1e293b]"
        seed={0}
        mode={mode}
      />

      <TownFacadeLit mode={mode} at={FACADE_SHUTTER_AT}>
        <circle
          cx="60"
          cy="260"
          r="12"
          className="fill-sky-100 opacity-15 transition-opacity group-hover/building:opacity-30"
        />
        <TownFacadeDoorLight cx={60} cy={287} rx={18} tone="fill-sky-100" />
      </TownFacadeLit>
      <rect x="48" y="262" width="24" height="24" className="fill-slate-800" />
      {abandoned ? (
        <TownFacadeBrokenPane x={51} y={265} w={18} h={21} seed={0} />
      ) : (
        <rect
          x="51"
          y="265"
          width="18"
          height="21"
          className="fill-sky-200 opacity-50 transition-opacity group-hover/building:opacity-75"
        />
      )}
      <path d="M60 265v21" className="stroke-slate-800" strokeWidth="1.4" />
      {shut && <TownFacadeShutter x={51} y={265} w={18} h={21} at={FACADE_SHUTTER_AT} />}
      <TownFacadeNight mode={mode} at={FACADE_NIGHT_AT}>
        <TownFacadeLamp x={60} y={258.6} r={1.8} drop={28.4} />
      </TownFacadeNight>

      <g>
        <rect x="90" y="263" width="58" height="22" rx="3" className="fill-slate-200" />
        <path d="M132 263h12l4 8v4h-16z" className="fill-slate-300" />
        <path d="M134 265h9l3 6h-12z" className="fill-sky-900" />
        <rect x="90" y="267" width="42" height="4" className="fill-red-600" />
        <text
          x="111"
          y="280.5"
          textAnchor="middle"
          fontSize="7"
          className="fill-slate-800 font-black tracking-[0.08em]"
        >
          {VAN.toUpperCase()}
        </text>
        <path d="M108 263v-4" className="stroke-slate-400" strokeWidth="1.2" />
        <path d="M100 260a8 8 0 0 0 14-3z" className="fill-slate-300" />
        <rect
          data-blink="900"
          x="123"
          y="260"
          width="5"
          height="3"
          rx="1"
          className={mode === 'open' ? 'fill-amber-400' : 'fill-[#57534e]'}
        />
        {abandoned && (
          <path d="M92 266l6 4-3 5 7 3M140 268l-5 6 4 4" className="fill-none stroke-[#7c2d12]" strokeWidth="1.6" />
        )}
        <circle cx="101" cy={abandoned ? 286 : 285} r="4.2" className="fill-slate-950" />
        <circle cx="137" cy="285" r="4.2" className="fill-slate-950" />
        <circle cx="101" cy="285" r="1.6" className="fill-slate-500" />
        <circle cx="137" cy="285" r="1.6" className="fill-slate-500" />
      </g>
      {abandoned && (
        <>
          <TownFacadeWeeds x={10} y={287} w={40} seed={3} scale={1.2} />
          <TownFacadeWeeds x={86} y={287} w={60} seed={6} scale={1.2} />
          <TownFacadeWeeds x={20} y={200} w={30} seed={1} scale={0.8} />
        </>
      )}
    </svg>
  );
}
