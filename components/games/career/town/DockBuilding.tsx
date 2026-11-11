import { useEffect, useRef } from 'react';
import TownDockEnsign from '@/components/games/career/town/TownDockEnsign';
import TownFacadeLit from '@/components/games/career/town/TownFacadeLit';
import TownFacadeNight from '@/components/games/career/town/TownFacadeNight';
import TownFacadeShutter from '@/components/games/career/town/TownFacadeShutter';
import useBuildingMotion from '@/components/games/career/town/useBuildingMotion';
import { GAMES_UI } from '@/data/games/locale';
import {
  FACADE_NIGHT_AT,
  FACADE_SHUTTER_AT,
  FACADE_SIGN_AT,
  FACADE_WINDOW_AT,
  FACADE_WINDOW_STEP,
} from '@/lib/constants/townFacade';
import type { TownBuildingMode } from '@/lib/types/town';
import { prefersReducedMotion } from '@/lib/utils/motion';
import { facadeTint } from '@/lib/utils/townFacade';

const SIGNS = GAMES_UI.career.town.signs;
const SAIL_MS = 3600;

const HULL = 'M22 56H168q16 0 28-6l-12 26H40q-12 0-18-10z';
const DECK = 'M40 56l10-16h92l18 16z';
const BRIDGE = 'M70 40l8-12h46l12 12z';
const CABIN_WINDOWS = [
  { x: 58, w: 18 },
  { x: 80, w: 22 },
  { x: 106, w: 22 },
  { x: 132, w: 14 },
];
const PORTHOLES = [118, 132, 146, 160];
const LIGHTS = [34, 46, 58, 70, 82, 94, 106, 118, 130, 142, 154, 166, 178];

// The island yacht moored at the bottom of the town, the island weekend
// painted on its hull. He boards over the gangway at its middle and a trip
// sails it off to the right and back. Open, the cabin glows and a string of
// lights runs over it; shut, the blinds are down and only the anchor light
// burns; abandoned, it lists under a tarp with rust running down the hull.
// While the Green Party is in government the yacht is dressed in the party's colours:
// its ensign at the stern, an emerald boot stripe and an emerald and white
// lifebuoy on the hull, and the string lights alternating emerald and sand
export default function DockBuilding({
  mode,
  sailing,
  partyDressed,
}: {
  mode: TownBuildingMode;
  sailing: boolean;
  partyDressed: boolean;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const boatRef = useRef<SVGGElement>(null);
  const open = mode === 'open';
  const abandoned = mode === 'abandoned';
  useBuildingMotion(ref, mode, `${sailing}${partyDressed}`);

  useEffect(() => {
    const boat = boatRef.current;
    if (!boat || !sailing) return;
    if (prefersReducedMotion()) return;
    const trip = boat.animate(
      [
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: 'translate(260px, -18px) scale(0.35)', opacity: 0, offset: 0.45 },
        { transform: 'translate(260px, -18px) scale(0.35)', opacity: 0, offset: 0.55 },
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      ],
      { duration: SAIL_MS, easing: 'ease-in-out' },
    );
    return () => trip.cancel();
  }, [sailing]);

  return (
    <svg
      ref={ref}
      viewBox="0 0 200 90"
      className={`h-full w-full overflow-visible ${facadeTint(mode)}`}
      aria-hidden="true"
    >
      <path d="M14 84q10-3 20 0t20 0 20 0M120 86q10-3 20 0t20 0 20 0" className="fill-none stroke-[#7dd3fc]/30" strokeWidth="1.2" />
      <TownFacadeLit mode={mode} at={FACADE_SHUTTER_AT}>
        <path
          data-shimmer=""
          d="M60 80h30M70 84h20M104 81h40M116 85h22"
          className="stroke-[#fde68a] opacity-50"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </TownFacadeLit>

      <g ref={boatRef} className="origin-bottom [transform-box:fill-box]">
        <ellipse cx="108" cy="79" rx="92" ry="5" className="fill-[#020617] opacity-40" />
        <g
          transform={abandoned ? 'rotate(-3 108 76)' : undefined}
          className={`origin-bottom [transform-box:fill-box] ${open && !sailing ? 'motion-safe:animate-[fanbob_3s_ease-in-out_infinite] motion-lite:animate-none!' : ''}`}
        >
          <path d="M112 28V8" className="stroke-[#94a3b8]" strokeWidth="1.4" />
          <path d="M112 9l12 3.4-12 3.4z" className="fill-[#fcd34d]" />
          {!abandoned && (
            <path d="M112 12L30 54M112 12L184 54" className="stroke-[#64748b]" strokeWidth="0.5" />
          )}
          <TownFacadeLit mode={mode} at={FACADE_SIGN_AT}>
            {LIGHTS.map((lx, i) => {
              const ly = lx < 112 ? 12 + ((112 - lx) / 82) * 42 : 12 + ((lx - 112) / 72) * 42;
              return (
                <circle
                  key={lx}
                  cx={lx}
                  cy={ly}
                  r="1.3"
                  className={partyDressed && i % 2 === 0 ? 'fill-[#6ee7b7]' : 'fill-[#fde68a]'}
                />
              );
            })}
          </TownFacadeLit>

          <path d={HULL} className={abandoned ? 'fill-[#cbd5e1]' : 'fill-[#f8fafc]'} />
          <path d="M28 66H186" className={partyDressed ? 'stroke-[#059669]' : 'stroke-[#0e7490]'} strokeWidth="2.6" />
          <path d="M40 76h144l3-6H34z" className={partyDressed ? 'fill-[#065f46]' : 'fill-[#1e3a8a]'} />
          <text
            x="65"
            y="63.4"
            textAnchor="middle"
            fontSize="6.4"
            textLength="52"
            lengthAdjust="spacingAndGlyphs"
            className={`font-sans font-black ${abandoned ? 'fill-[#64748b]' : 'fill-[#0e7490]'}`}
          >
            {SIGNS.dock.toUpperCase()}
          </text>
          {PORTHOLES.map((px) => (
            <circle key={px} cx={px} cy="61" r="2.2" className="fill-[#1e293b] stroke-[#94a3b8]" strokeWidth="0.6" />
          ))}
          {partyDressed && (
            <g transform="translate(108.5 61.5)">
              <circle r="4.4" className="fill-none stroke-[#f8fafc]" strokeWidth="2.4" />
              <circle
                r="4.4"
                className="fill-none stroke-[#059669]"
                strokeWidth="2.4"
                strokeDasharray="3.46 3.46"
              />
              <circle r="5.6" className="fill-none stroke-[#fcd34d]/70" strokeWidth="0.5" />
            </g>
          )}
          <TownFacadeLit mode={mode} at={FACADE_WINDOW_AT}>
            {PORTHOLES.map((px) => (
              <circle key={px} cx={px} cy="61" r="1.6" className="fill-[#fcd34d]" />
            ))}
          </TownFacadeLit>

          <path d={DECK} className="fill-[#e2e8f0]" />
          <path d="M46 52h112" className="stroke-[#94a3b8]" strokeWidth="0.6" />
          {CABIN_WINDOWS.map((win, i) => (
            <g key={win.x}>
              <path
                d={`M${win.x + 2} 44h${win.w}l2 8H${win.x}z`}
                className={open ? 'fill-[#fcd34d] opacity-90 transition-opacity group-hover/building:opacity-100' : 'fill-[#1e293b]'}
              />
              {mode === 'shut' && (
                <TownFacadeShutter
                  x={win.x}
                  y={44}
                  w={win.w + 4}
                  h={8}
                  kind="blind"
                  at={FACADE_WINDOW_AT + i * FACADE_WINDOW_STEP}
                />
              )}
            </g>
          ))}
          <path d={BRIDGE} className="fill-[#f1f5f9]" />
          <path d="M82 31h40l6 7H76z" className={open ? 'fill-[#38bdf8]/80' : 'fill-[#334155]'} />
          <path d="M136 40l-6-12" className="stroke-[#94a3b8]" strokeWidth="1.2" />
          <path d="M28 54V48M28 48H44M176 54l-4-6M172 48h-16" className="fill-none stroke-[#cbd5e1]" strokeWidth="0.9" />
          {partyDressed && <TownDockEnsign x={26} y={56} mode={mode} />}

          {open && !sailing && (
            <path d="M100 56l-4 22h3l4-22z" className="fill-[#a8a29e]" />
          )}
          <TownFacadeNight mode={mode} at={FACADE_NIGHT_AT}>
            <circle cx="112" cy="8" r="5" className="fill-[#f8fafc] opacity-25" />
            <circle cx="112" cy="8" r="1.6" className="fill-[#f8fafc]" />
            <path d="M24 66q-10 4-16 12M190 62q6 6 8 16" className="fill-none stroke-[#d6d3d1]" strokeWidth="1" />
          </TownFacadeNight>

          {abandoned && (
            <g>
              <path d="M44 57l8-19h52l4-12h30l4 14 20 17q-58 5-118 0z" className="fill-[#3f4a3a]" />
              <path d="M58 57l6-17M84 58V38M110 58l2-30M136 57l2-29M156 57l-6-14" className="stroke-[#2c3528]" strokeWidth="1" />
              <path d="M52 52h104M60 44h80" className="stroke-[#a8a29e]" strokeWidth="0.7" />
              <path d="M50 66l2 9M96 67l-1 8M140 66l3 9M170 64l1 8" className="stroke-[#9a3412]" strokeWidth="1.6" />
              <path d="M44 76q6 3 12 0t12 0M120 76q6 3 12 0t12 0" className="fill-none stroke-[#3f6212]" strokeWidth="1.4" />
            </g>
          )}

          {sailing && (
            <g>
              <path d="M150 56l2-10h8l2 10z" className="fill-[#b91c1c]" />
              <circle cx="156" cy="42" r="4.2" className="fill-[#e8b98f]" />
              <path d="M151.8 41q4.2-6 8.4 0z" className="fill-[#1c1917]" />
              <path d="M160 49l6-6" className="stroke-[#e8b98f]" strokeWidth="1.8" strokeLinecap="round" />
            </g>
          )}
        </g>
      </g>
    </svg>
  );
}
