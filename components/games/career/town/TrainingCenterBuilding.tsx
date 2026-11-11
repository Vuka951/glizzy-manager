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
import TownTrainingKit from '@/components/games/career/town/TownTrainingKit';
import useBuildingMotion from '@/components/games/career/town/useBuildingMotion';
import { GAMES_UI } from '@/data/games/locale';
import {
  FACADE_NIGHT_AT,
  FACADE_SHUTTER_AT,
  FACADE_SIGN_AT,
  FACADE_WINDOW_AT,
} from '@/lib/constants/townFacade';
import { ASSISTANT_TACTICS_LEVEL } from '@/data/games/careerInvestments';
import type { TownBuildingMode } from '@/lib/types/town';
import { facadeTint } from '@/lib/utils/townFacade';

const S = GAMES_UI.career.town.signs;

// The glizzy eating training centre: a giant glizzy on the roof, and behind
// the big front window a competitor eating against the stopwatch next to the
// sniffing station, where a blindfolded eater sniffs out the cloche.
// Shut, the shutter comes down over the hall; abandoned, the hall stands
// empty behind broken glass and the roof glizzy has slipped. The assistant coach
// shows by level: the coach at the door, then the kit out front, until the
// coach leaves for the chalkboard on the lawn
export default function TrainingCenterBuilding({
  assistantLevel,
  mode,
}: {
  assistantLevel: number;
  mode: TownBuildingMode;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const abandoned = mode === 'abandoned';
  useBuildingMotion(ref, mode, `coach${assistantLevel}`);

  return (
    <svg
      ref={ref}
      viewBox="0 0 200 150"
      className={`h-full w-full overflow-visible ${facadeTint(mode)}`}
      aria-hidden="true"
    >
      <ellipse cx="100" cy="147" rx="98" ry="5" className="fill-black opacity-35" />
      <TownFacadeLit mode={mode} at={FACADE_SHUTTER_AT}>
        <ellipse
          cx="72"
          cy="148"
          rx="64"
          ry="4"
          className="fill-cyan-100 opacity-10 transition-opacity group-hover/building:opacity-25"
        />
        <TownFacadeDoorLight cx={172} cy={148} rx={20} tone="fill-sky-100" />
      </TownFacadeLit>

      <rect x="8" y="54" width="184" height="94" className="fill-[#3f4a5c]" />
      <rect x="184" y="54" width="8" height="94" className="fill-[#354052]" />
      <rect x="4" y="48" width="192" height="8" className="fill-[#2b3444]" />

      <TownFacadeLit mode={mode} at={FACADE_SIGN_AT}>
        <path
          d="M22 47L52 6h22zM178 47L148 6h-22z"
          className="fill-amber-100 opacity-10 transition-opacity group-hover/building:opacity-20"
        />
        <ellipse
          cx="94"
          cy="17"
          rx="58"
          ry="17"
          className="fill-orange-400 opacity-15 transition-opacity group-hover/building:opacity-30"
        />
      </TownFacadeLit>
      <rect x="18" y="44" width="8" height="4" rx="1" className="fill-slate-300" />
      <rect x="174" y="44" width="8" height="4" rx="1" className="fill-slate-300" />
      <g transform={abandoned ? 'translate(48 9) rotate(7)' : 'translate(46 4)'}>
        <rect x="0" y="8" width="96" height="20" rx="10" className="fill-[#e0a458]" />
        <rect x="6" y="22" width="84" height="3" rx="1.5" className="fill-[#b97f3e]" />
        <rect x="8" y="3" width="80" height="18" rx="9" className="fill-[#c2412d]" />
        <rect x="14" y="5" width="66" height="3" rx="1.5" className="fill-[#e0634a]" />
        <path
          d="M16 11l6 4 6-4 6 4 6-4 6 4 6-4 6 4 6-4 6 4 6-4 6 4"
          className="fill-none stroke-yellow-400"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      <path d="M60 30v18M128 30v18" className="stroke-slate-800" strokeWidth="2" />
      <rect x="36" y="29" width="116" height="17" rx="2" className="fill-[#0b1220]" />
      <TownNeonSign
        x={94}
        y={41.5}
        text={S.training}
        size={10.5}
        fit={104}
        ink="fill-cyan-200"
        halo="stroke-cyan-300"
        mode={mode}
        buzz
      />

      {abandoned ? (
        <TownFacadeBrokenPane x={16} y={62} w={112} h={62} seed={1} />
      ) : (
        <>
          <rect
            x="16"
            y="62"
            width="112"
            height="62"
            className="fill-[#d7ebf3] transition-colors group-hover/building:fill-[#f1fbff]"
          />
          <rect x="16" y="62" width="112" height="5" className="fill-[#bcd6e2]" />
        </>
      )}

      <circle cx="68" cy="78" r="9" className="fill-slate-900" />
      <circle cx="68" cy="78" r="7" className="fill-slate-100" />
      <rect x="66" y="66" width="4" height="3" className="fill-slate-900" />
      <g data-spin="8000" className="origin-center [transform-box:fill-box]">
        <circle cx="68" cy="78" r="6" className="fill-transparent" />
        <path
          d="M68 78V72.5"
          className="stroke-red-600"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </g>
      <circle cx="68" cy="78" r="1.2" className="fill-red-600" />

      <rect x="20" y="108" width="104" height="5" className="fill-[#57534e]" />
      <rect x="24" y="113" width="3" height="11" className="fill-[#44403c]" />
      <rect x="117" y="113" width="3" height="11" className="fill-[#44403c]" />
      {!abandoned && (
        <>
        <rect x="26" y="102" width="16" height="6" rx="3" className="fill-[#c2412d]" />
        <rect x="27" y="97" width="15" height="6" rx="3" className="fill-[#b4432a]" />
        <rect x="28" y="92" width="13" height="6" rx="3" className="fill-[#c2412d]" />

        <circle cx="54" cy="90" r="6" className="fill-slate-800" />
        <path d="M43 108q11-20 22 0z" className="fill-slate-800" />
        <g data-bob="5" data-speed="450">
          <path
            d="M58 101l5-7"
            className="stroke-slate-800"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <rect x="59" y="88" width="12" height="5" rx="2.5" className="fill-[#c2412d]" />
        </g>

        <path d="M96 107a11 10 0 0 1 22 0z" className="fill-slate-300" />
        <rect x="105" y="94" width="4" height="3" className="fill-slate-400" />
        <rect x="94" y="107" width="26" height="1.6" className="fill-slate-400" />
        <g className="fill-slate-500">
          <circle data-smoke="12" cx="104" cy="92" r="1.4" className="opacity-0 origin-center [transform-box:fill-box]" />
          <circle data-smoke="12" cx="110" cy="91" r="1.2" className="opacity-0 origin-center [transform-box:fill-box]" />
          <circle data-smoke="12" cx="107" cy="90" r="1.3" className="opacity-0 origin-center [transform-box:fill-box]" />
        </g>
        <g data-bob="1.5" data-speed="1300">
          <circle cx="88" cy="93" r="5.5" className="fill-slate-800" />
          <path d="M82.5 92h11" className="stroke-red-500" strokeWidth="2.2" />
          <path d="M93 95l2.4 1.4-2.6.6z" className="fill-slate-800" />
        </g>
        <path d="M79 108q9-17 18 0z" className="fill-slate-800" />
        </>
      )}

      <path d="M50 62v62M90 62v62" className="stroke-slate-500" strokeWidth="2.5" />
      <rect x="8" y="124" width="124" height="24" className="fill-[#2b3444]" />
      <path d="M8 124h124" className="stroke-[#556178]" strokeWidth="1.5" />
      {mode === 'shut' && (
        <TownFacadeShutter x={16} y={62} w={112} h={62} at={FACADE_SHUTTER_AT} />
      )}
      {abandoned && (
        <>
          <TownFacadeCobweb x={16.5} y={62.5} r={16} />
          <TownFacadeCobweb x={127.5} y={62.5} r={11} flip />
          <path d="M100 124l8-9 6 3 5-5" className="fill-none stroke-[#1c2029]" strokeWidth="2" />
        </>
      )}

      <rect x="134" y="60" width="20" height="50" className="fill-blue-900" />
      <path
        d={abandoned ? 'M134 110l3-6 4 3 3-8 4 6 3-4 3 9z' : 'M134 110l10-5 10 5z'}
        className="fill-blue-900"
      />
      <path d="M137 60v46M151 60v46" className="stroke-amber-400" strokeWidth="1" />
      <path
        d="M139 70h10v5a5 5 0 0 1-10 0zM142 80h4v4h-4zM140 84h8v2h-8z"
        className="fill-amber-400"
      />
      <path
        d="M139 72h-2.5a2 2 0 0 0 2.5 3M149 72h2.5a2 2 0 0 1-2.5 3"
        className="fill-none stroke-amber-400"
        strokeWidth="1"
      />
      <TownNeonSign
        x={144}
        y={99}
        text={S.cup}
        size={7.5}
        ink="fill-amber-200"
        halo="stroke-amber-300"
        tracking="tracking-[0.04em]"
        mode={mode}
      />

      <TownFacadeLit mode={mode} at={FACADE_WINDOW_AT}>
        <circle
          cx="172"
          cy="70"
          r="12"
          className="fill-amber-200 opacity-20 transition-opacity group-hover/building:opacity-40"
        />
      </TownFacadeLit>
      {abandoned ? (
        <TownFacadeBulb x={172} y={66} />
      ) : (
        <rect x="168" y="66" width="8" height="5" rx="1" className="fill-amber-300" />
      )}
      <rect x="158" y="76" width="28" height="72" className="fill-slate-800" />
      {abandoned ? (
        <TownFacadeBrokenPane x={162} y={80} w={20} h={40} seed={0} />
      ) : (
        <rect
          x="162"
          y="80"
          width="20"
          height="40"
          className="fill-sky-200 opacity-60 transition-opacity group-hover/building:opacity-85"
        />
      )}
      {mode === 'shut' && (
        <TownFacadeShutter x={162} y={80} w={20} h={40} kind="blind" at={FACADE_WINDOW_AT} />
      )}
      <rect x="178" y="122" width="2" height="8" rx="1" className="fill-slate-400" />
      <TownFacadeNight mode={mode} at={FACADE_NIGHT_AT}>
        <TownFacadeLamp x={172} y={68} r={2} drop={80} />
      </TownFacadeNight>
      {abandoned && (
        <>
          <TownFacadeCobweb x={162.5} y={80.5} r={9} />
          <TownFacadeWeeds x={10} y={148} w={60} seed={2} />
          <TownFacadeWeeds x={120} y={148} w={76} seed={5} />
        </>
      )}

      {assistantLevel >= 2 && !abandoned && <TownTrainingKit />}
      {assistantLevel >= 1 && assistantLevel < ASSISTANT_TACTICS_LEVEL && !abandoned && (
        <g data-bob="1" data-speed="1600">
          <circle cx="193" cy="116" r="5.5" className="fill-[#e2b48a]" />
          <path d="M187.5 114a5.5 5 0 0 1 11 0z" className="fill-red-800" />
          <path d="M186.5 114.5h10" className="stroke-red-800" strokeWidth="1.4" />
          <path d="M186 148l1-26h12l1 26z" className="fill-red-700" />
          <path d="M188.5 123v25M197.5 123v25" className="stroke-slate-50" strokeWidth="1" />
          <path d="M189 123l4 6 4-6" className="fill-none stroke-slate-200" strokeWidth="0.8" />
          <rect x="197" y="126" width="8" height="11" rx="1" className="fill-amber-900" />
          <rect x="198" y="128" width="6" height="8" className="fill-slate-50" />
          <path d="M199 130h4M199 132h4M199 134h3" className="stroke-slate-400" strokeWidth="0.6" />
          <g data-swing="14" data-speed="700" className="origin-top [transform-box:fill-box]">
            <path d="M193 129v3" className="stroke-slate-200" strokeWidth="0.6" />
            <rect x="191.6" y="131.6" width="3.4" height="2" rx="0.8" className="fill-amber-300" />
          </g>
        </g>
      )}
    </svg>
  );
}
