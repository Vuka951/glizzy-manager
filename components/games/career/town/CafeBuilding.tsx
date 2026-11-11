import { useRef } from 'react';
import TownFacadeBrokenPane from '@/components/games/career/town/TownFacadeBrokenPane';
import TownFacadeBulb from '@/components/games/career/town/TownFacadeBulb';
import TownFacadeCobweb from '@/components/games/career/town/TownFacadeCobweb';
import TownFacadeDoorLight from '@/components/games/career/town/TownFacadeDoorLight';
import TownFacadeLamp from '@/components/games/career/town/TownFacadeLamp';
import TownFacadeLit from '@/components/games/career/town/TownFacadeLit';
import TownFacadeNight from '@/components/games/career/town/TownFacadeNight';
import TownFacadeShutter from '@/components/games/career/town/TownFacadeShutter';
import TownFacadeWeeds from '@/components/games/career/town/TownFacadeWeeds';
import TownNeonSign from '@/components/games/career/town/TownNeonSign';
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
const AWNING_SCALLOPS = `M14 81.5${'q5 5 10 0'.repeat(15)}z`;
const TORN_SCALLOPS =
  'M14 81.5q5 5 10 0q5 5 10 0l2 9-3 1zM44 81.5q5 5 10 0q5 4 8 1zM72 81.5q5 5 10 0q5 5 10 0q5 5 10 0l1 7-2 2zM124 81.5q5 5 10 0l2 12-4-1zM146 81.5q5 5 10 0q5 5 10 0z';

// The café under its pink neon, a terrace and the café cat out front, and
// the cellar door beside it. Shut, the shutter is down and
// the chairs are up on the tables; abandoned, the awning hangs in shreds over
// a dark, cracked window
export default function CafeBuilding({ mode }: { mode: TownBuildingMode }) {
  const ref = useRef<SVGSVGElement>(null);
  const abandoned = mode === 'abandoned';
  useBuildingMotion(ref, mode);

  return (
    <svg
      ref={ref}
      viewBox="0 0 180 140"
      className={`h-full w-full overflow-visible ${facadeTint(mode)}`}
      aria-hidden="true"
    >
      <ellipse cx="90" cy="137" rx="88" ry="5" className="fill-black opacity-35" />

      <rect x="10" y="42" width="160" height="96" className="fill-[#3a3f4b]" />
      <rect x="160" y="42" width="10" height="96" className="fill-[#30343e]" />
      <rect x="6" y="38" width="168" height="6" className="fill-[#262a33]" />

      <path d="M60 36v-4M120 36v-4" className="stroke-slate-800" strokeWidth="2" />
      <rect x="42" y="11" width="96" height="23" rx="3" className="fill-[#0b1220]" />
      <TownNeonSign
        x={90}
        y={28}
        text={S.cafe}
        size={14}
        fit={84}
        ink="fill-pink-300"
        halo="stroke-pink-400"
        mode={mode}
        buzz
      />

      <TownWindowGrid
        x={18}
        y={50}
        cols={6}
        rows={1}
        w={18}
        h={12}
        gapX={26}
        on="fill-amber-300"
        off="fill-[#1b2233]"
        seed={4}
        mode={mode}
      />

      <path d="M6 70h168l-8 12H14z" className="fill-[#14532d]" />
      <path
        d="M22 70l-2 12M42 70l-1 12M62 70v12M82 70v12M102 70v12M122 70l1 12M142 70l1 12M160 70l2 12"
        className="stroke-[#1f7a43]"
        strokeWidth="5"
      />
      <path d={abandoned ? TORN_SCALLOPS : AWNING_SCALLOPS} className="fill-[#14532d]" />
      {abandoned && (
        <path d="M58 70l-4 22 3-1 3-21zM112 72l2 16 2-2-1-14z" className="fill-[#1f7a43]" />
      )}

      <TownFacadeLit mode={mode} at={FACADE_SHUTTER_AT}>
        <circle
          cx="90"
          cy="108"
          r="38"
          className="fill-amber-500 opacity-20 transition-opacity group-hover/building:opacity-40"
        />
        <TownFacadeDoorLight cx={92} cy={138} rx={44} />
      </TownFacadeLit>
      <rect x="52" y="84" width="78" height="42" className="fill-[#262a33]" />
      {abandoned ? (
        <>
          <TownFacadeBrokenPane x={54} y={86} w={74} h={38} seed={1} />
          <path d="M58 96h66" className="stroke-[#3a2f1e]" strokeWidth="2" />
          <g className="fill-[#2a2a24]">
            <rect x="62" y="89" width="3" height="7" />
            <rect x="96" y="90" width="3" height="6" />
          </g>
          <TownFacadeCobweb x={54.5} y={86.5} r={13} />
        </>
      ) : (
        <>
          <rect
            x="54"
            y="86"
            width="74"
            height="38"
            className="fill-amber-300 transition-colors group-hover/building:fill-amber-200"
          />
          <path d="M58 96h66" className="stroke-amber-800" strokeWidth="2" />
          <g className="fill-emerald-800">
            <rect x="62" y="88" width="3" height="8" />
            <rect x="70" y="89" width="3" height="7" />
            <rect x="78" y="88" width="3" height="8" />
          </g>
          <g className="fill-amber-800">
            <rect x="88" y="89" width="3" height="7" />
            <rect x="96" y="88" width="3" height="8" />
            <rect x="114" y="89" width="6" height="7" rx="1" />
          </g>
          <circle cx="74" cy="108" r="4" className="fill-[#3f2a1e]" />
          <path d="M68 124q6-11 12 0" className="fill-[#3f2a1e]" />
          <circle cx="104" cy="106" r="4" className="fill-[#3f2a1e]" />
          <path d="M98 124q6-11 12 0" className="fill-[#3f2a1e]" />
        </>
      )}
      <path d="M91 86v38" className="stroke-[#262a33]" strokeWidth="2" />
      {mode === 'shut' && (
        <TownFacadeShutter x={54} y={86} w={74} h={38} at={FACADE_SHUTTER_AT} />
      )}

      <g className="fill-slate-900">
        <ellipse cx="68" cy="128" rx="7" ry="1.8" />
        <rect x="67.2" y="128" width="1.6" height="10" />
        <ellipse cx="96" cy="128" rx="7" ry="1.8" />
        <rect x="95.2" y="128" width="1.6" height="10" />
      </g>
      {abandoned ? (
        <path d="M56 138v-9h4v5h4v4M104 138l6-7 3 2.4-3.4 3.6 3 2.6-1.8 1.4z" className="fill-slate-900" />
      ) : (
        <TownFacadeLit mode={mode} at={FACADE_SHUTTER_AT}>
          <path d="M56 138v-9h4v5h4v4M108 138v-9h-4v5h-4v4" className="fill-slate-900" />
          <circle cx="68" cy="125.5" r="3" className="fill-amber-300 opacity-40" />
          <circle cx="96" cy="125.5" r="3" className="fill-amber-300 opacity-40" />
          <rect x="67.2" y="124.5" width="1.6" height="2.5" className="fill-amber-100" />
          <rect x="95.2" y="124.5" width="1.6" height="2.5" className="fill-amber-100" />
        </TownFacadeLit>
      )}
      <TownFacadeNight mode={mode} at={FACADE_NIGHT_AT}>
        <path d="M63 126.2v-6h3.4v-2.6h2.2v2.6h3.4v6M91 126.2v-6h3.4v-2.6h2.2v2.6h3.4v6" className="fill-slate-900" />
      </TownFacadeNight>

      <rect x="132" y="86" width="22" height="52" className="fill-stone-900" />
      {abandoned ? (
        <TownFacadeBrokenPane x={136} y={91} w={14} h={12} seed={0} />
      ) : (
        <rect x="136" y="91" width="14" height="12" className="fill-[#2b2a26]" />
      )}
      <TownFacadeLit mode={mode} at={FACADE_SHUTTER_AT}>
        <rect x="136" y="91" width="14" height="12" className="fill-amber-300 opacity-60" />
      </TownFacadeLit>
      <circle cx="150" cy="114" r="1.4" className="fill-amber-500" />

      <TownFacadeLit mode={mode} at={FACADE_SHUTTER_AT}>
        <circle cx="160" cy="112" r="4" className="fill-stone-900" />
        <path d="M155 138l2-20h7l2 20z" className="fill-blue-700" />
        <path d="M158 118v20M163 118v20" className="stroke-slate-50" strokeWidth="1" />
        <circle
          cx="167.5"
          cy="121"
          r="1.8"
          data-blink="2600"
          className="fill-orange-500"
        />
      </TownFacadeLit>
      {abandoned ? (
        <TownFacadeBulb x={143} y={84} drop={3} />
      ) : (
        <TownFacadeNight mode={mode} at={FACADE_NIGHT_AT}>
          <TownFacadeLamp x={143} y={84} r={1.8} drop={54} />
        </TownFacadeNight>
      )}

      <path d="M14 138v-16h34v16z" className="fill-[#0b0908]" />
      <path d="M18 138l4-12h22l4 12z" className="fill-[#1f0a0a]" />
      <TownFacadeLit mode={mode} at={FACADE_SIGN_AT}>
        <circle
          cx="31"
          cy="131"
          r="16"
          className="fill-red-500 opacity-30 transition-opacity group-hover/building:opacity-50"
        />
      </TownFacadeLit>
      <path d="M22 132h18M24 128h14M20 136h22" className="stroke-red-900" strokeWidth="1.6" />
      <rect x="13" y="102" width="36" height="14" rx="2" className="fill-[#0b1220]" />
      <TownNeonSign
        x={31}
        y={112.3}
        text={S.cellar}
        size={8}
        fit={28}
        ink="fill-red-200"
        halo="stroke-red-400"
        tracking="tracking-[0.04em]"
        mode={mode}
      />
      {abandoned && (
        <>
          <TownFacadeWeeds x={16} y={138} w={30} seed={3} />
          <TownFacadeWeeds x={150} y={138} w={24} seed={6} />
          <TownFacadeCobweb x={169.5} y={44.5} r={12} flip />
        </>
      )}

    </svg>
  );
}
