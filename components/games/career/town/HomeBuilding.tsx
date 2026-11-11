import { useRef } from 'react';
import TownFacadeBrokenPane from '@/components/games/career/town/TownFacadeBrokenPane';
import TownFacadeBulb from '@/components/games/career/town/TownFacadeBulb';
import TownFacadeCobweb from '@/components/games/career/town/TownFacadeCobweb';
import TownFacadeLamp from '@/components/games/career/town/TownFacadeLamp';
import TownFacadeLit from '@/components/games/career/town/TownFacadeLit';
import TownFacadeNight from '@/components/games/career/town/TownFacadeNight';
import TownFacadeWeeds from '@/components/games/career/town/TownFacadeWeeds';
import TownHotTub from '@/components/games/career/town/TownHotTub';
import TownSpaNeon from '@/components/games/career/town/TownSpaNeon';
import TownSpaTowelRack from '@/components/games/career/town/TownSpaTowelRack';
import useBuildingMotion from '@/components/games/career/town/useBuildingMotion';
import {
  FACADE_NIGHT_AT,
  FACADE_SHUTTER_AT,
  FACADE_SIGN_AT,
  FACADE_WINDOW_AT,
  FACADE_WINDOW_STEP,
} from '@/lib/constants/townFacade';
import { SEAT_COLOR_CLASSES, SEAT_COLOR_ORDER } from '@/lib/constants/rooms';
import type { TownBuildingMode, TownWindow } from '@/lib/types/town';
import { facadeTint } from '@/lib/utils/townFacade';

const WINDOW_COUNT = 8;
const PLATE_CHARS = 6;

function seatWindow(windows: TownWindow[], i: number): TownWindow {
  return (
    windows[i] ?? { state: 'empty', color: SEAT_COLOR_ORDER[i], name: null }
  );
}

// His house, which doubles as the room's readiness board: one window per
// seat, two floors of four, lit in the seat colour once that coach is done,
// dim and blinking while they choose, dark when offline or empty. Shut for
// the night the curtains draw but the seat lights stay readable; abandoned,
// the glass is broken and the door hangs off its hinge. The spa card grows
// from a tub to a towel rack, a lit spa and a neon
export default function HomeBuilding({
  windows,
  plates,
  spaLevel,
  mode,
}: {
  windows: TownWindow[];
  plates: boolean;
  spaLevel: number;
  mode: TownBuildingMode;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const abandoned = mode === 'abandoned';
  const shut = mode === 'shut';
  const seats = Array.from({ length: WINDOW_COUNT }, (_, i) =>
    seatWindow(windows, i),
  );
  useBuildingMotion(
    ref,
    mode,
    `${seats.map((w) => w.state).join('')}${spaLevel}`,
  );

  return (
    <svg
      ref={ref}
      viewBox="0 0 220 210"
      className={`h-full w-full overflow-visible ${facadeTint(mode)}`}
      aria-hidden="true"
    >
      <ellipse cx="110" cy="207" rx="108" ry="5" className="fill-black opacity-35" />

      <g className="fill-slate-300">
        <circle data-smoke="" cx="178" cy="8" r="5" className="opacity-0 origin-center [transform-box:fill-box]" />
        <circle data-smoke="" cx="178" cy="8" r="5" className="opacity-0 origin-center [transform-box:fill-box]" />
        <circle data-smoke="" cx="178" cy="8" r="5" className="opacity-0 origin-center [transform-box:fill-box]" />
      </g>
      <rect x="172" y="10" width="13" height="34" className="fill-gray-500" />
      <rect x="170" y="8" width="17" height="4" className="fill-gray-600" />

      <rect x="12" y="58" width="196" height="150" className="fill-[#a39888]" />
      <rect x="190" y="58" width="18" height="150" className="fill-[#8a8072]" />
      <path d="M0 60L110 16l110 44z" className="fill-[#7c2d12]" />
      <path
        d="M26 50h168M52 40h116M78 30h64"
        className="stroke-[#5c1f0c]"
        strokeWidth="2"
      />
      {abandoned && (
        <path d="M52 40l8-3 4 6-9 2zM150 46l9-2 3 5-8 1z" className="fill-[#3b1a0d]" />
      )}
      {spaLevel >= 4 && <TownSpaNeon mode={mode} />}
      <circle cx="110" cy="44" r="5.5" className="fill-[#5c1f0c]" />
      <circle cx="110" cy="44" r="4" className="fill-[#1c1410]" />
      <TownFacadeLit mode={mode} at={FACADE_SIGN_AT}>
        <circle
          cx="110"
          cy="44"
          r="10"
          className="fill-amber-200 opacity-15 transition-opacity group-hover/building:opacity-30"
        />
        <circle
          cx="110"
          cy="44"
          r="4"
          className="fill-amber-300 opacity-80 transition-opacity group-hover/building:opacity-100"
        />
      </TownFacadeLit>

      {seats.map((seat, i) => {
        const x = 20 + (i % 4) * 46;
        const y = 66 + Math.floor(i / 4) * 52;
        const fill = SEAT_COLOR_CLASSES[seat.color].fill;
        const showPlate =
          plates && !abandoned && seat.state !== 'empty' && seat.name;
        if (abandoned) {
          return (
            <g key={i}>
              <rect x={x - 2} y={y - 2} width="42" height="30" className="fill-[#6b6459]" />
              <TownFacadeBrokenPane x={x} y={y} w={38} h={26} seed={i * 2 + 1} />
              <path d={`M${x + 19} ${y}v26`} className="stroke-[#5b554b]" strokeWidth="2" />
              <rect x={x - 3} y={y + 26} width="44" height="4" className="fill-[#5f584e]" />
            </g>
          );
        }
        return (
          <g key={i}>
            {seat.state === 'done' && (
              <TownFacadeLit mode={mode} at={FACADE_WINDOW_AT + i * FACADE_WINDOW_STEP}>
                <circle
                  cx={x + 19}
                  cy={y + 13}
                  r="25"
                  className={`${fill} opacity-25 transition-opacity group-hover/building:opacity-50`}
                />
              </TownFacadeLit>
            )}
            <rect x={x - 2} y={y - 2} width="42" height="30" className="fill-[#6b6459]" />
            <rect x={x} y={y} width="38" height="26" className="fill-[#11141c]" />
            {seat.state === 'done' && (
              <>
                <rect
                  x={x}
                  y={y}
                  width="38"
                  height="26"
                  className={`${fill} opacity-90 transition-opacity group-hover/building:opacity-100`}
                />
                <rect x={x} y={y} width="38" height="6" className="fill-white opacity-25" />
                <path
                  d={`M${x} ${y}h7l-3 26h-4zM${x + 38} ${y}h-7l3 26h4z`}
                  className="fill-black/25"
                />
              </>
            )}
            {seat.state === 'choosing' && (
              <g data-blink="1800" data-delay={i * 230}>
                <rect
                  x={x}
                  y={y}
                  width="38"
                  height="26"
                  className={`${fill} opacity-35`}
                />
              </g>
            )}
            <TownFacadeNight
              mode={mode}
              at={FACADE_WINDOW_AT + ((i * 3) % WINDOW_COUNT) * FACADE_WINDOW_STEP}
            >
              <path
                d={`M${x} ${y}h11q-2 13 1 26h-12zM${x + 38} ${y}h-11q2 13-1 26h12z`}
                className="fill-[#2a2438]"
              />
              <path
                d={`M${x + 4} ${y}v26M${x + 8} ${y}v26M${x + 34} ${y}v26M${x + 30} ${y}v26`}
                className="stroke-[#1a1626]"
                strokeWidth="0.8"
              />
              <rect x={x} y={y} width="38" height="3" className="fill-[#1a1626]" />
            </TownFacadeNight>
            <path d={`M${x + 19} ${y}v26`} className="stroke-[#5b554b]" strokeWidth="2" />
            <rect x={x - 3} y={y + 26} width="44" height="4" className="fill-[#5f584e]" />
            {showPlate && (
              <>
                <rect
                  x={x + 1}
                  y={y + 31}
                  width="36"
                  height="13"
                  rx="2"
                  className="fill-[#1c1917] opacity-85"
                />
                <text
                  x={x + 19}
                  y={y + 41.2}
                  textAnchor="middle"
                  fontSize="10"
                  className={`font-black tracking-[0.02em] ${
                    seat.state === 'offline'
                      ? 'fill-slate-500'
                      : seat.state === 'done'
                        ? 'fill-slate-50'
                        : 'fill-slate-300'
                  }`}
                >
                  {seat.name?.slice(0, PLATE_CHARS)}
                </text>
              </>
            )}
          </g>
        );
      })}

      <TownFacadeLit mode={mode} at={FACADE_SHUTTER_AT}>
        <circle
          cx="110"
          cy="161"
          r="14"
          className="fill-amber-200 opacity-30 transition-opacity group-hover/building:opacity-55"
        />
        <ellipse
          cx="110"
          cy="209"
          rx="26"
          ry="3"
          className="fill-amber-100 opacity-25 transition-opacity group-hover/building:opacity-45"
        />
      </TownFacadeLit>
      {abandoned ? (
        <TownFacadeBulb x={110} y={156} drop={4} />
      ) : (
        <rect
          x="107"
          y="157"
          width="6"
          height="7"
          rx="1"
          className={shut ? 'fill-[#57534e]' : 'fill-amber-300'}
        />
      )}
      <rect x="94" y="166" width="32" height="42" className="fill-[#6b6459]" />
      {abandoned ? (
        <>
          <rect x="96" y="168" width="28" height="40" className="fill-[#0b0908]" />
          <path d="M96 168l20 4v35l-20 1z" className="fill-[#3a2618]" />
          <path d="M99 174l14 2.6v11l-14-1zM99 191l14 1.2v11l-14 .8z" className="fill-none stroke-[#2a1b10]" strokeWidth="1.2" />
          <TownFacadeCobweb x={123.5} y={168.5} r={8} flip />
        </>
      ) : (
        <>
          <rect x="96" y="168" width="28" height="40" className="fill-[#4a3122]" />
          <path d="M99 172h22v14H99zM99 190h22v14H99z" className="fill-none stroke-[#3a2618]" strokeWidth="1.4" />
          <circle cx="119" cy="189" r="1.6" className="fill-amber-400" />
        </>
      )}
      <rect x="90" y="204" width="40" height="4" className="fill-[#6b6459]" />
      <TownFacadeNight mode={mode} at={FACADE_NIGHT_AT}>
        <TownFacadeLamp x={110} y={158} r={2} drop={50} />
      </TownFacadeNight>

      {spaLevel < 1 && (
        <g>
          <rect x="30" y="196" width="40" height="8" className="fill-[#6b4a32]" />
          <g className={abandoned ? 'fill-[#5c4a32]' : 'fill-emerald-800'}>
            <circle cx="38" cy="194" r="3.5" />
            <circle cx="62" cy="194" r="3.5" />
          </g>
          <circle cx="50" cy="193" r="4" className={abandoned ? 'fill-[#4a3b28]' : 'fill-emerald-700'} />
        </g>
      )}
      <g>
        <rect x="150" y="196" width="40" height="8" className="fill-[#6b4a32]" />
        <g className={abandoned ? 'fill-[#5c4a32]' : 'fill-emerald-800'}>
          <circle cx="158" cy="194" r="3.5" />
          <circle cx="182" cy="194" r="3.5" />
        </g>
        <circle cx="170" cy="193" r="4" className={abandoned ? 'fill-[#4a3b28]' : 'fill-emerald-700'} />
      </g>
      {abandoned && (
        <>
          <TownFacadeWeeds x={14} y={208} w={74} seed={1} scale={1.3} />
          <TownFacadeWeeds x={134} y={208} w={70} seed={4} scale={1.3} />
          <TownFacadeCobweb x={20} y={66} r={14} />
        </>
      )}

      {spaLevel >= 1 && <TownHotTub level={spaLevel} mode={mode} />}
      {spaLevel >= 2 && !abandoned && <TownSpaTowelRack />}

    </svg>
  );
}
