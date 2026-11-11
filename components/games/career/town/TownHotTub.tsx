import TownFacadeLit from '@/components/games/career/town/TownFacadeLit';
import TownFacadeNight from '@/components/games/career/town/TownFacadeNight';
import { FACADE_NIGHT_AT, FACADE_SHUTTER_AT } from '@/lib/constants/townFacade';
import type { TownBuildingMode } from '@/lib/types/town';

const LEDS = [10, 21, 32, 44, 55, 66];

// The spa tub beside the house. The first card buys a wooden tub with one
// bather and a towel on the rim; from the third the tub is a wide graphite
// spa with a lit rim of LEDs and company in the water. Shut, a cover goes on
// and the lights flicker out; abandoned, the water stands dark
export default function TownHotTub({
  level,
  mode,
}: {
  level: number;
  mode: TownBuildingMode;
}) {
  const abandoned = mode === 'abandoned';
  const big = level >= 3;
  const rx = big ? 35 : 32;
  return (
    <g>
      <TownFacadeLit mode={mode} at={FACADE_SHUTTER_AT}>
        <ellipse
          cx="38"
          cy="196"
          rx={big ? 46 : 40}
          ry={big ? 14 : 12}
          className={`fill-cyan-300 transition-opacity group-hover/building:opacity-35 ${big ? 'opacity-30' : 'opacity-20'}`}
        />
      </TownFacadeLit>
      <g className="fill-sky-100">
        <circle data-smoke="34" cx="30" cy="190" r="5" className="opacity-0 origin-center [transform-box:fill-box]" />
        <circle data-smoke="34" cx="44" cy="190" r="5" className="opacity-0 origin-center [transform-box:fill-box]" />
        <circle data-smoke="34" cx="37" cy="189" r="4.5" className="opacity-0 origin-center [transform-box:fill-box]" />
      </g>
      {big ? (
        <>
          <path d="M3 192v13q35 9 70 0v-13z" className="fill-[#334155]" />
          <path
            d="M3 197q35 9 70 0M3 201.5q35 9 70 0"
            className="fill-none stroke-[#1e293b]"
            strokeWidth="1"
          />
          <ellipse cx="38" cy="192" rx={rx} ry="8" className="fill-[#e2e8f0]" />
        </>
      ) : (
        <>
          <path d="M6 193v11q32 9 64 0v-11z" className="fill-[#7c4a2d]" />
          <path
            d="M6 198q32 9 64 0M6 202.5q32 9 64 0"
            className="fill-none stroke-[#5b3520]"
            strokeWidth="1.4"
          />
          <path d="M18 196v13M30 197v13M46 197v13M58 196v13" className="stroke-[#6a3d24]" strokeWidth="1" />
          <ellipse cx="38" cy="193" rx={rx} ry="7.5" className="fill-[#9a6038]" />
        </>
      )}
      <ellipse
        cx="38"
        cy={big ? 192 : 193}
        rx={rx - 4}
        ry={big ? 6 : 5.8}
        className={abandoned ? 'fill-[#2a1d14]' : 'fill-cyan-300'}
      />
      {abandoned && (
        <path d="M18 193q10-3 18 1t16-1" className="fill-none stroke-[#4a3324]" strokeWidth="1" />
      )}
      <TownFacadeLit mode={mode} at={FACADE_SHUTTER_AT}>
        <ellipse cx="33" cy="192" rx="16" ry="2.4" className="fill-cyan-100 opacity-70" />
        <path d="M20 193q7-7 14 0z" className="fill-[#d6a77a]" />
        <circle cx="27" cy="186" r="4.8" className="fill-[#d6a77a]" />
        <path d="M22.5 184a4.8 4 0 0 1 9.4-.6z" className="fill-slate-50" />
        <path d="M33 192.5l7-3" className="stroke-[#d6a77a]" strokeWidth="2.2" strokeLinecap="round" />
        {big ? (
          <>
            <path d="M44 192.5q7-7 14 0z" className="fill-[#c08a5e]" />
            <circle cx="51" cy="185.6" r="4.6" className="fill-[#c08a5e]" />
            <path d="M46.4 185a4.6 4.4 0 0 1 9.2 0q-2-2.6-4.6-2.4t-4.6 2.4z" className="fill-[#3f2a1d]" />
            <path d="M46 191.6l-5-2.4" className="stroke-[#c08a5e]" strokeWidth="2" strokeLinecap="round" />
            {LEDS.map((x, i) => (
              <circle
                key={x}
                cx={x}
                cy={201 + Math.abs(x - 38) * -0.06}
                r="1.2"
                data-blink="2600"
                data-delay={i * 430}
                className={i % 2 ? 'fill-violet-300' : 'fill-cyan-200'}
              />
            ))}
          </>
        ) : (
          level < 2 && (
            <>
              <rect x="52" y="185" width="13" height="4.5" rx="1.2" className="fill-slate-50" />
              <rect x="52" y="187" width="13" height="1" className="fill-sky-300" />
            </>
          )
        )}
      </TownFacadeLit>
      <TownFacadeNight mode={mode} at={FACADE_NIGHT_AT}>
        <ellipse cx="38" cy="192" rx={rx - 2} ry="6.6" className="fill-[#475569]" />
        <path d={`M${40 - rx} 192h${rx * 2 - 4}`} className="stroke-[#334155]" strokeWidth="1" />
        <ellipse cx="38" cy="190.6" rx={rx - 5} ry="4.6" className="fill-[#64748b]" />
      </TownFacadeNight>
    </g>
  );
}
