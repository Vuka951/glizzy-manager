import { useRef } from 'react';
import BankYellowDressing from '@/components/games/career/town/BankYellowDressing';
import TownFacadeBrokenPane from '@/components/games/career/town/TownFacadeBrokenPane';
import TownFacadeCobweb from '@/components/games/career/town/TownFacadeCobweb';
import TownFacadeLit from '@/components/games/career/town/TownFacadeLit';
import TownFacadeShutter from '@/components/games/career/town/TownFacadeShutter';
import TownFacadeWeeds from '@/components/games/career/town/TownFacadeWeeds';
import TownNeonSign from '@/components/games/career/town/TownNeonSign';
import TownWindowGrid from '@/components/games/career/town/TownWindowGrid';
import useBuildingMotion from '@/components/games/career/town/useBuildingMotion';
import {
  GLIZZY_BET_PAYOUTS,
  GLIZZY_CALLS,
  type GlizzyCall,
} from '@/data/games/careerGlizzflationBets';
import { GAMES_UI } from '@/data/games/locale';
import {
  FACADE_SHUTTER_AT,
  FACADE_SIGN_AT,
} from '@/lib/constants/townFacade';
import type { TownBuildingMode } from '@/lib/types/town';
import { glizzyMarketOpen } from '@/lib/utils/careerGlizzflationBets';
import type { SavedCareer } from '@/lib/utils/careerSave';
import { gliziPricePct } from '@/lib/utils/careerSeasonPrices';
import { fmt, signedPct } from '@/lib/utils/format';
import { facadeTint } from '@/lib/utils/townFacade';

const S = GAMES_UI.career.town.signs;
const G = GAMES_UI.career.offseason.glizacija;
const B = GAMES_UI.career.offseason.glizzflationBet;
const SPARK_POINTS = 8;
const SEPARATOR = '  ·  ';

const CALL_LABEL: Record<GlizzyCall, string> = {
  up: B.callUp,
  flat: B.callFlat,
  down: B.callDown,
};

type TickerPart = { text: string; tone: string };

// The bank: the Glizzflation index, its trend and the exchange's state crawl along
// the LED band under the sign, and a window screen charts the last windows.
// While the Yellow Party is in government it dresses the front in its colours.
// Shut, the band goes dark and the shutter comes down, leaving only the ATM
// lit; abandoned, every screen is dead and the glass cracked
export default function BankBuilding({
  career,
  mode,
  yellow = false,
}: {
  career: SavedCareer;
  mode: TownBuildingMode;
  yellow?: boolean;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const abandoned = mode === 'abandoned';
  const pct = gliziPricePct(career);
  const history = career.gliziPriceHistory ?? [];
  const previous = history.length > 1 ? history[history.length - 2] : 1;
  const current = career.gliziPriceIndex ?? 1;
  const trend = current > previous ? 1 : current < previous ? -1 : 0;
  const tone =
    pct > 0 ? 'fill-red-300' : pct < 0 ? 'fill-emerald-300' : 'fill-slate-300';
  const stroke =
    pct > 0
      ? 'stroke-red-300'
      : pct < 0
        ? 'stroke-emerald-300'
        : 'stroke-slate-400';
  const marketOpen = glizzyMarketOpen(career);

  const parts: TickerPart[] = [
    { text: `${G.title} `, tone: 'fill-amber-200' },
    {
      text: `${trend > 0 ? '▲' : trend < 0 ? '▼' : ''}${signedPct(pct)}`,
      tone,
    },
    { text: SEPARATOR, tone: 'fill-slate-600' },
    {
      text: fmt(G.info.now, {
        scale: current.toFixed(2),
        pct: signedPct(pct),
      }),
      tone: 'fill-slate-300',
    },
    { text: SEPARATOR, tone: 'fill-slate-600' },
    ...(marketOpen
      ? [
          { text: `${B.title} `, tone: 'fill-sky-200' },
          {
            text: GLIZZY_CALLS.map(
              (call) =>
                `${CALL_LABEL[call]} ${fmt(B.multiplier, { x: GLIZZY_BET_PAYOUTS[call] })}`,
            ).join(' / '),
            tone: 'fill-sky-300',
          },
        ]
      : [{ text: B.locked, tone: 'fill-slate-400' }]),
    ...(career.glizzyBet
      ? [
          { text: SEPARATOR, tone: 'fill-slate-600' },
          {
            text: `${B.ticket}: ${fmt(B.callStake, {
              call: CALL_LABEL[career.glizzyBet.call],
              stake: career.glizzyBet.stake,
            })}`,
            tone: 'fill-amber-300',
          },
        ]
      : []),
    { text: SEPARATOR, tone: 'fill-slate-600' },
  ];
  const tickerKey = parts.map((p) => p.text).join('');
  useBuildingMotion(ref, mode, tickerKey);

  const spark = history.slice(-SPARK_POINTS);
  const lo = Math.min(1, ...spark);
  const hi = Math.max(1, ...spark);
  const sparkPath =
    spark.length > 1
      ? spark
          .map((v, i) => {
            const sx = 119 + (i / (spark.length - 1)) * 28;
            const sy = hi === lo ? 149 : 154 - ((v - lo) / (hi - lo)) * 10;
            return `${sx.toFixed(1)},${sy.toFixed(1)}`;
          })
          .join(' ')
      : '119,149 147,149';

  return (
    <svg
      ref={ref}
      viewBox="0 0 170 175"
      className={`h-full w-full overflow-visible ${facadeTint(mode)}`}
      aria-hidden="true"
    >
      <ellipse cx="85" cy="172" rx="83" ry="5" className="fill-black opacity-35" />

      <rect x="10" y="40" width="150" height="132" className="fill-slate-700" />
      <rect x="140" y="40" width="20" height="132" className="fill-[#283548]" />
      <rect x="6" y="36" width="158" height="6" className="fill-slate-800" />

      <path d="M58 34v-4M112 34v-4" className="stroke-slate-800" strokeWidth="2" />
      <rect x="38" y="7" width="94" height="26" rx="2" className="fill-[#0b1220]" />
      <TownNeonSign
        x={85}
        y={27.5}
        text={S.bank}
        size={19}
        fit={74}
        ink="fill-slate-100"
        halo="stroke-sky-200"
        tracking="tracking-[0.12em]"
        mode={mode}
        buzz
      />

      <rect x="10" y="47" width="150" height="19" className="fill-[#020617]" />
      <TownFacadeLit mode={mode} at={FACADE_SIGN_AT}>
        <svg x="12" y="48" width="146" height="17" viewBox="0 0 146 17">
          <g data-ticker="">
            <text
              x="4"
              y="12.5"
              fontSize="10"
              className="font-mono font-black"
            >
              {[0, 1].map((copy) =>
                parts.map((part, i) => (
                  <tspan key={`${copy}-${i}`} className={part.tone}>
                    {part.text.toUpperCase()}
                  </tspan>
                )),
              )}
            </text>
          </g>
        </svg>
      </TownFacadeLit>
      {abandoned && (
        <path d="M60 47l6 7-3 4 7 8M118 47l-4 9 5 3" className="fill-none stroke-[#334155]" strokeWidth="1" />
      )}
      <path d="M10 47h150M10 66h150" className="stroke-slate-600" strokeWidth="1" />

      <TownWindowGrid
        x={20}
        y={74}
        cols={5}
        rows={3}
        w={20}
        h={16}
        gapX={24}
        gapY={20}
        on="fill-sky-200"
        off="fill-[#1e3a5f]"
        seed={5}
        mode={mode}
      />
      <path d="M18 72h120M18 92h120M18 112h120" className="stroke-slate-500" strokeWidth="1.5" />

      <TownFacadeLit mode={mode} at={FACADE_SHUTTER_AT}>
        <circle
          cx="80"
          cy="150"
          r="30"
          className="fill-sky-200 opacity-15 transition-opacity group-hover/building:opacity-30"
        />
        <ellipse
          cx="80"
          cy="173"
          rx="30"
          ry="3"
          className="fill-sky-100 opacity-20 transition-opacity group-hover/building:opacity-40"
        />
      </TownFacadeLit>
      <rect x="56" y="132" width="48" height="40" className="fill-slate-800" />
      {abandoned ? (
        <TownFacadeBrokenPane x={58} y={134} w={44} h={38} seed={0} />
      ) : (
        <rect
          x="58"
          y="134"
          width="44"
          height="38"
          className="fill-sky-200 opacity-75 transition-opacity group-hover/building:opacity-95"
        />
      )}
      <path d="M80 134v38M58 152h44" className="stroke-slate-700" strokeWidth="2" />
      {mode === 'shut' && (
        <TownFacadeShutter x={58} y={134} w={44} h={38} at={FACADE_SHUTTER_AT} />
      )}
      <rect x="52" y="129" width="56" height="5" className="fill-slate-500" />

      <rect x="18" y="140" width="22" height="31" rx="2" className="fill-slate-800" />
      {abandoned ? (
        <rect x="22" y="144" width="14" height="9" className="fill-[#0f172a]" />
      ) : (
        <>
          <circle cx="29" cy="148.5" r="9" className="fill-sky-400 opacity-15" />
          <rect
            x="22"
            y="144"
            width="14"
            height="9"
            className="fill-sky-400 opacity-90 transition-opacity group-hover/building:opacity-100"
          />
        </>
      )}
      <rect x="23" y="156" width="12" height="2" className="fill-slate-500" />
      <TownNeonSign
        x={29}
        y={167}
        text={S.atm}
        size={6.5}
        ink="fill-sky-300"
        halo="stroke-sky-400"
        tracking="tracking-[0.06em]"
        mode={abandoned ? 'abandoned' : 'open'}
      />

      <rect x="115" y="140" width="36" height="19" rx="2" className="fill-[#0b1220]" />
      <path d="M118 149h30" className="stroke-slate-700" strokeWidth="0.6" strokeDasharray="1.5 1.5" />
      <TownFacadeLit mode={mode} at={FACADE_SIGN_AT}>
        <polyline
          points={sparkPath}
          className={`fill-none ${stroke}`}
          strokeWidth="1.6"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </TownFacadeLit>
      {yellow && <BankYellowDressing abandoned={abandoned} />}
      {abandoned && (
        <>
          <TownFacadeCobweb x={10.5} y={66.5} r={14} />
          <TownFacadeCobweb x={101.5} y={134.5} r={10} flip />
          <TownFacadeWeeds x={12} y={172} w={44} seed={2} scale={1.2} />
          <TownFacadeWeeds x={108} y={172} w={52} seed={7} scale={1.2} />
        </>
      )}
    </svg>
  );
}
