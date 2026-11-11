import { useRef } from 'react';
import TownFacadeBrokenPane from '@/components/games/career/town/TownFacadeBrokenPane';
import TownFacadeCobweb from '@/components/games/career/town/TownFacadeCobweb';
import TownFacadeDoorLight from '@/components/games/career/town/TownFacadeDoorLight';
import TownFacadeLamp from '@/components/games/career/town/TownFacadeLamp';
import TownFacadeLit from '@/components/games/career/town/TownFacadeLit';
import TownFacadeNight from '@/components/games/career/town/TownFacadeNight';
import TownFacadeShutter from '@/components/games/career/town/TownFacadeShutter';
import TownFacadeWeeds from '@/components/games/career/town/TownFacadeWeeds';
import TownInformant from '@/components/games/career/town/TownInformant';
import TownNeonSign from '@/components/games/career/town/TownNeonSign';
import useBuildingMotion from '@/components/games/career/town/useBuildingMotion';
import { GAMES_UI } from '@/data/games/locale';
import {
  FACADE_NIGHT_AT,
  FACADE_SHUTTER_AT,
} from '@/lib/constants/townFacade';
import type { TownBuildingMode } from '@/lib/types/town';
import { facadeTint } from '@/lib/utils/townFacade';

const SIGNS = GAMES_UI.career.town.signs;

// The kiosk on the front row, the town's news stand. When there is news
// waiting it shows: a lamp over the counter, the new papers clipped up in the
// window, a fresh bundle at the door and the headline board out front.
// With the league informant bought, a man sits on the bench beside it peeking over his
// paper; he dresses the part at the second level and gets a dish on the
// kiosk roof at the third. Shut, the shutter is down; abandoned, the glass is
// broken and old posters peel off the front
export default function KioskBuilding({
  fresh,
  scoutLevel,
  mode,
}: {
  fresh: boolean;
  scoutLevel: number;
  mode: TownBuildingMode;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const abandoned = mode === 'abandoned';
  const news = fresh && mode === 'open';
  useBuildingMotion(ref, mode, `${news}${scoutLevel}`);

  return (
    <svg
      ref={ref}
      viewBox="0 0 124 100"
      className={`h-full w-full overflow-visible ${facadeTint(mode)}`}
      aria-hidden="true"
    >
      <ellipse cx="62" cy="97" rx="60" ry="5" className="fill-[rgba(0,0,0,0.35)]" />
      <TownFacadeLit mode={mode} at={FACADE_SHUTTER_AT}>
        <TownFacadeDoorLight cx={46} cy={97} rx={news ? 40 : 28} />
      </TownFacadeLit>
      <rect x="10" y="30" width="70" height="66" className="fill-[#0f766e]" />
      <rect x="6" y="24" width="78" height="8" className="fill-[#134e4a]" />
      <rect x="16" y="7" width="58" height="16" rx="2" className="fill-[#042f2e]" />
      <TownNeonSign
        x={45}
        y={19.4}
        text={SIGNS.kiosk}
        size={11}
        fit={52}
        ink="fill-[#f0fdfa]"
        halo="stroke-[#5eead4]"
        mode={mode}
        buzz
      />

      {abandoned ? (
        <rect x="16" y="38" width="58" height="34" className="fill-[#1b1f26]" />
      ) : (
        <>
          <rect
            x="14"
            y="34"
            width="62"
            height="42"
            className={`fill-[#fde68a] blur-[6px] transition-opacity duration-300 group-hover/building:opacity-50 ${news ? 'opacity-40' : 'opacity-0'}`}
          />
          <rect
            x="16"
            y="38"
            width="58"
            height="34"
            className={`transition-opacity duration-300 group-hover/building:opacity-100 ${news ? 'fill-[#fef3c7] opacity-100' : 'fill-[#fde68a] opacity-85'}`}
          />
        </>
      )}
      <g className={abandoned ? 'opacity-30' : ''}>
        <rect x="19" y="42" width="10" height="13" className="fill-[#ef4444]" />
        <rect x="20.5" y="44" width="7" height="2" className="fill-[#fef2f2]" />
        <rect x="31" y="41" width="10" height="14" className="fill-[#3b82f6]" />
        <circle cx="36" cy="49" r="3" className="fill-[#fde68a]" />
        <rect x="43" y="42" width="10" height="13" className="fill-[#f8fafc]" />
        <path d="M45 45h6M45 48h6M45 51h4" className="stroke-[#57534e]" strokeWidth="0.8" />
        <rect x="55" y="41" width="10" height="14" className="fill-[#a855f7]" />
        <rect x="56.5" y="43" width="7" height="2" className="fill-[#faf5ff]" />
        <rect x="21" y="57" width="12" height="12" className="fill-[#f8fafc]" />
        <rect x="22.5" y="58.5" width="9" height="3" className="fill-[#1c1917]" />
        <rect x="36" y="58" width="12" height="11" className="fill-[#22c55e]" />
      </g>
      {abandoned && (
        <>
          <TownFacadeBrokenPane x={16} y={38} w={58} h={34} seed={1} />
          <TownFacadeCobweb x={16.5} y={38.5} r={11} />
        </>
      )}

      {news && (
        <g>
          <path data-glow="" d="M40 36L18 72h54L50 36z" className="fill-[#fffbeb] opacity-30 origin-top [transform-box:fill-box]" />
          <rect x="44.6" y="32" width="0.8" height="2.4" className="fill-[#1f2937]" />
          <path d="M40.5 37.4l1.8-3.4h5.4l1.8 3.4z" className="fill-[#1f2937]" />
          <ellipse cx="45" cy="37.4" rx="3.4" ry="1.1" className="fill-[#fef9c3]" />
          <path d="M17 39.5q28 3 56 0" className="fill-none stroke-[#57534e]" strokeWidth="0.6" />
          {[
            { x: 50, w: 13, tone: 'fill-[#b91c1c]' },
            { x: 63.5, w: 9, tone: 'fill-[#1c1917]' },
          ].map((p) => (
            <g key={p.x} data-flutter="" className="origin-top [transform-box:fill-box]">
              <rect x={p.x} y="40" width={p.w} height="20" className="fill-[#f8fafc]" />
              <rect x={p.x + 1.2} y="42" width={p.w - 2.4} height="3.6" className={p.tone} />
              <path
                d={`M${p.x + 1.2} 48h${p.w - 2.4}M${p.x + 1.2} 51h${p.w - 2.4}M${p.x + 1.2} 54h${p.w - 4}M${p.x + 1.2} 57h${p.w - 2.4}`}
                className="stroke-[#78716c]"
                strokeWidth="0.8"
              />
              <rect x={p.x + p.w / 2 - 1} y="38.6" width="2" height="2.4" className="fill-[#a16207]" />
            </g>
          ))}
        </g>
      )}

      <rect x="14" y="72" width="62" height="4" className="fill-[#134e4a]" />
      {mode === 'shut' && (
        <TownFacadeShutter x={16} y={38} w={58} h={34} at={FACADE_SHUTTER_AT} />
      )}
      <rect x="20" y="78" width="16" height="18" className="fill-[#115e59]" />
      <circle cx="33" cy="87" r="0.9" className="fill-[#99f6e4]" />

      {news ? (
        <g>
          <ellipse data-glow="" cx="58" cy="86" rx="21" ry="11" className="fill-[#fde68a] opacity-20 origin-center [transform-box:fill-box]" />
          <path d="M44 97l3-21M72 97l-3-21" className="stroke-[#78350f]" strokeWidth="2" />
          <rect x="42" y="75" width="32" height="18" rx="1" className="fill-[#f8fafc] stroke-[#1c1917]" strokeWidth="1.2" />
          <rect x="45" y="78" width="26" height="4.4" className="fill-[#1c1917]" />
          <rect x="45" y="83.6" width="17" height="3.4" className="fill-[#b91c1c]" />
          <rect x="63.5" y="83.6" width="7.5" height="7" className="fill-[#94a3b8]" />
          <path d="M45 89h17" className="stroke-[#57534e]" strokeWidth="1" />

          <g transform="translate(-1 0)">
            <rect x="1" y="91" width="17" height="5.4" className="fill-[#e7e5e4]" />
            <rect x="2" y="86.4" width="16" height="5" className="fill-[#f5f5f4]" />
            <rect x="1.4" y="82" width="15.6" height="4.8" className="fill-[#fafaf9]" />
            <path d="M1.4 84h15.6M2 88.6h16M1 93.4h17" className="stroke-[#d6d3d1]" strokeWidth="0.5" />
            <path d="M9.4 82v14.4M1.4 89h16.6" className="stroke-[#a16207]" strokeWidth="0.9" />
            <rect x="3" y="82.6" width="5" height="1.4" className="fill-[#1c1917]" />
          </g>
        </g>
      ) : (
        !abandoned && (
          <g>
            <rect x="52" y="68" width="22" height="6" className="fill-[#e7e5e4]" />
            <path d="M54 70.5h18" className="stroke-[#78716c]" strokeWidth="1" />
          </g>
        )
      )}

      <TownFacadeNight mode={mode} at={FACADE_NIGHT_AT}>
        <TownFacadeLamp x={28} y={76.4} r={1.4} drop={19.6} />
      </TownFacadeNight>
      {abandoned && (
        <>
          <path d="M44 78l12-1 1 9-4 2-2 6-7-1z" className="fill-[#cbd5e1] opacity-60" />
          <path d="M60 80l9 1-1 6-3-1-3 4z" className="fill-[#fca5a5] opacity-50" />
          <path d="M46 80h8M46 82.4h6" className="stroke-[#475569]" strokeWidth="0.8" />
          <TownFacadeWeeds x={10} y={96} w={12} seed={1} />
          <TownFacadeWeeds x={38} y={96} w={42} seed={4} />
        </>
      )}

      {scoutLevel >= 1 && <TownInformant level={scoutLevel} mode={mode} />}
    </svg>
  );
}
