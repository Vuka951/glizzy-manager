import { useRef } from 'react';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import TownFacadeBrokenPane from '@/components/games/career/town/TownFacadeBrokenPane';
import TownFacadeCobweb from '@/components/games/career/town/TownFacadeCobweb';
import TownFacadeDoorLight from '@/components/games/career/town/TownFacadeDoorLight';
import TownFacadeLamp from '@/components/games/career/town/TownFacadeLamp';
import TownFacadeLit from '@/components/games/career/town/TownFacadeLit';
import TownFacadeNight from '@/components/games/career/town/TownFacadeNight';
import TownFacadeShutter from '@/components/games/career/town/TownFacadeShutter';
import TownFacadeWeeds from '@/components/games/career/town/TownFacadeWeeds';
import TownNeonSign from '@/components/games/career/town/TownNeonSign';
import TownSearchlight from '@/components/games/career/town/TownSearchlight';
import TownWindowGrid from '@/components/games/career/town/TownWindowGrid';
import useBuildingMotion from '@/components/games/career/town/useBuildingMotion';
import { SECURITY_SEARCHLIGHT_LEVEL } from '@/data/games/careerInvestments';
import { GAMES_UI } from '@/data/games/locale';
import {
  FACADE_NIGHT_AT,
  FACADE_SHUTTER_AT,
  FACADE_SIGN_AT,
  FACADE_WINDOW_AT,
} from '@/lib/constants/townFacade';
import type { TownBuildingMode } from '@/lib/types/town';
import { facadeTint } from '@/lib/utils/townFacade';

const S = GAMES_UI.career.town.signs;

const WALL_JOINTS =
  'M-2 130h74M108 130h10' +
  'M10 122v8M28 122v8M46 122v8M64 122v8M114 122v8' +
  'M1 130v8M19 130v8M37 130v8M55 130v8M111 130v8';

// The private security firm, dressed like a police station: blue light on
// the roof, the badge on the stripe, a guard at the door and the patrol car
// with its light bar going. While the Blue Party is in government its wall,
// capped in blue under a blue and white flag, rings it. The full retainer puts a searchlight on the roof.
// Shut, the blinds are down and the car sits dark; abandoned, the beacon is
// dead, the glass broken and the car on a flat tyre
export default function SecurityFirmBuilding({
  mode,
  wall,
  securityLevel,
}: {
  mode: TownBuildingMode;
  wall: boolean;
  securityLevel: number;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const lit = mode === 'open';
  const abandoned = mode === 'abandoned';
  useBuildingMotion(ref, mode, `${wall ? 'wall' : ''}${securityLevel}`);

  return (
    <svg
      ref={ref}
      viewBox="0 0 180 140"
      className={`h-full w-full overflow-visible ${facadeTint(mode)}`}
      aria-hidden="true"
    >
      <ellipse cx="90" cy="137" rx="88" ry="5" className="fill-black opacity-35" />

      <rect x="10" y="40" width="130" height="98" className="fill-slate-800" />
      <rect x="132" y="40" width="8" height="98" className="fill-[#17202f]" />
      <rect x="6" y="36" width="138" height="6" className="fill-slate-900" />

      {securityLevel >= SECURITY_SEARCHLIGHT_LEVEL && (
        <g transform="translate(-20 6.4)">
          <TownSearchlight mode={mode} />
        </g>
      )}
      <rect x="62" y="24" width="26" height="12" rx="2" className="fill-slate-900" />
      <g data-blink="1300">
        <TownFacadeLit mode={mode} at={FACADE_SIGN_AT}>
          <circle
            cx="75"
            cy="30"
            r="13"
            className="fill-blue-500 opacity-35 transition-opacity group-hover/building:opacity-60"
          />
        </TownFacadeLit>
        <rect
          x="64"
          y="26"
          width="22"
          height="8"
          rx="2"
          className={lit ? 'fill-blue-500' : abandoned ? 'fill-[#1e293b]' : 'fill-slate-600'}
        />
      </g>
      {abandoned && <path d="M70 26l4 4-2 4" className="fill-none stroke-slate-500" strokeWidth="0.8" />}

      <rect x="16" y="45" width="118" height="19" rx="2" className="fill-[#0b1220]" />
      <TownNeonSign
        x={75}
        y={58.8}
        text={S.security}
        size={11}
        fit={106}
        ink="fill-sky-50"
        halo="stroke-blue-400"
        mode={mode}
        buzz
      />

      <TownWindowGrid
        x={20}
        y={70}
        cols={5}
        rows={1}
        w={16}
        h={12}
        gapX={22}
        on="fill-blue-200"
        off="fill-slate-700"
        seed={2}
        mode={mode}
      />

      <rect x="10" y="86" width="130" height="7" className="fill-blue-700" />
      <rect x="10" y="88" width="130" height="1.5" className="fill-slate-50" />

      <path
        d="M24 98h16v9q-8 10-16 0z"
        className="fill-blue-700 stroke-slate-50"
        strokeWidth="1.4"
      />
      <path
        d="M32 100.5l1.3 2.8 3 .3-2.3 2 .7 3-2.7-1.6-2.7 1.6.7-3-2.3-2 3-.3z"
        className="fill-amber-300"
      />

      <TownFacadeLit mode={mode} at={FACADE_SHUTTER_AT}>
        <circle cx="54" cy="113" r="4" className="fill-[#0b0f19]" />
        <path d="M48.6 110.6h10.8l-1.2-3.4h-8.4z" className="fill-[#0b0f19]" />
        <path d="M48.5 138l1-20h9l1 20z" className="fill-[#0b0f19]" />
        <rect x="49.5" y="121" width="9" height="2" className="fill-blue-900" />
        <circle
          cx="90"
          cy="118"
          r="22"
          className="fill-blue-200 opacity-10 transition-opacity group-hover/building:opacity-25"
        />
        <TownFacadeDoorLight cx={90} cy={138} rx={22} tone="fill-blue-100" />
      </TownFacadeLit>
      <rect
        x="86"
        y="92.5"
        width="8"
        height="2"
        className={lit ? 'fill-amber-200' : 'fill-slate-600'}
      />
      <rect x="74" y="96" width="32" height="42" className="fill-slate-900" />
      {abandoned ? (
        <TownFacadeBrokenPane x={76} y={98} w={28} h={40} seed={1} />
      ) : (
        <rect
          x="76"
          y="98"
          width="28"
          height="40"
          className="fill-blue-200 opacity-70 transition-opacity group-hover/building:opacity-90"
        />
      )}
      <path d="M90 98v40" className="stroke-slate-800" strokeWidth="2" />
      {abandoned ? (
        <TownFacadeBrokenPane x={110} y={98} w={20} h={20} seed={2} />
      ) : (
        <rect x="110" y="98" width="20" height="20" className="fill-blue-200 opacity-55" />
      )}
      {mode === 'shut' && (
        <>
          <TownFacadeShutter x={76} y={98} w={28} h={40} at={FACADE_SHUTTER_AT} />
          <TownFacadeShutter x={110} y={98} w={20} h={20} kind="blind" at={FACADE_WINDOW_AT} />
        </>
      )}
      <TownFacadeNight mode={mode} at={FACADE_NIGHT_AT}>
        <TownFacadeLamp x={90} y={92} r={2} drop={46} />
      </TownFacadeNight>
      {abandoned && (
        <>
          <TownFacadeCobweb x={76.5} y={98.5} r={11} />
          <TownFacadeCobweb x={139.5} y={42.5} r={12} flip />
          <TownFacadeWeeds x={10} y={138} w={64} seed={1} />
          <TownFacadeWeeds x={104} y={138} w={20} seed={4} />
        </>
      )}

      <g transform="translate(118 136)">
        <path d="M0 0h60v-11l-9-1-8-9H16l-9 9-7 1z" className="fill-slate-50" />
        <rect x="0" y="-8" width="60" height="4" className="fill-blue-700" />
        <path d="M18 -19h10v7H13zM31 -19h8l6 7H31z" className="fill-slate-700" />
        <rect x="56" y="-9" width="4" height="3" className={lit ? 'fill-amber-200' : 'fill-slate-500'} />
        {abandoned && (
          <path d="M4 -10l6 3-2 4M40 -14l5 4 4-1" className="fill-none stroke-[#7c2d12]" strokeWidth="1.4" />
        )}
        <rect x="21" y="-21.5" width="20" height="2.5" className="fill-slate-700" />
        <g data-blink="1300">
          <TownFacadeLit mode={mode} at={FACADE_SIGN_AT}>
            <circle cx="26.5" cy="-23" r="7" className="fill-blue-500 opacity-35" />
          </TownFacadeLit>
          <rect x="22" y="-25" width="9" height="4" rx="1" className={lit ? 'fill-blue-500' : 'fill-slate-500'} />
        </g>
        <g data-blink="1300" data-delay="650">
          <TownFacadeLit mode={mode} at={FACADE_SIGN_AT}>
            <circle cx="35.5" cy="-23" r="7" className="fill-red-500 opacity-35" />
          </TownFacadeLit>
          <rect x="31" y="-25" width="9" height="4" rx="1" className={lit ? 'fill-red-500' : 'fill-slate-500'} />
        </g>
        <path d={abandoned ? 'M8.5 0a5.5 5.5 0 0 1 11 0l1 1.4h-13z' : 'M8.5 0a5.5 5.5 0 0 1 11 0a5.5 5.5 0 0 1-11 0z'} className="fill-slate-950" />
        <circle cx="46" cy="0" r="5.5" className="fill-slate-950" />
        <circle cx="14" cy="0" r="2" className="fill-slate-500" />
        <circle cx="46" cy="0" r="2" className="fill-slate-500" />
      </g>

      {wall && (
        <g>
          <path d="M-2 122l10-9v14l-10 11z" className="fill-slate-400" />
          <rect x="-2" y="122" width="74" height="16" className="fill-slate-300" />
          <rect x="108" y="122" width="10" height="16" className="fill-slate-300" />
          <path d={WALL_JOINTS} className="stroke-slate-400" strokeWidth="1.2" />
          <rect x="-2" y="120" width="74" height="2.5" className="fill-blue-600" />
          <rect x="108" y="120" width="10" height="2.5" className="fill-blue-600" />
          <rect x="68" y="116" width="7" height="22" className="fill-slate-200" />
          <rect x="105" y="116" width="7" height="22" className="fill-slate-200" />
          <rect x="67" y="114.5" width="9" height="2" className="fill-blue-600" />
          <rect x="104" y="114.5" width="9" height="2" className="fill-blue-600" />
          <rect x="27" y="123" width="18" height="14" rx="1.5" className="fill-blue-600" />
          <svg x="29.5" y="123.5" width="13" height="13" viewBox="0 0 24 24">
            <SponsorEmblem sponsorId="blue" className="h-full w-full" />
          </svg>
          <path d="M3 121V94" className="stroke-slate-200" strokeWidth="1.6" />
          <g transform="translate(3.8 94)">
            <g data-wave="" className="origin-left [transform-box:fill-box]">
              <rect x="0" y="0" width="24" height="16" className="fill-blue-50" />
              <rect x="0" y="2" width="24" height="2" className="fill-blue-600" />
              <rect x="0" y="12" width="24" height="2" className="fill-blue-600" />
              <svg x="8" y="4" width="8" height="8" viewBox="0 0 24 24">
                <SponsorEmblem sponsorId="blue" className="h-full w-full" />
              </svg>
            </g>
          </g>
        </g>
      )}
    </svg>
  );
}
