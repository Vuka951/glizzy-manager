import TownBankScrews from '@/components/games/career/town/TownBankScrews';
import { GAMES_UI } from '@/data/games/locale';

const TOWN = GAMES_UI.career.town;

// Up is red on the Glizzflation, because up means everything costs more
const LAMPS = [
  {
    trend: 'up',
    on: 'bg-[#ef4444] shadow-[0_0_8px_rgb(239_68_68/0.9)]',
    off: 'bg-[#3b0d0d]',
  },
  {
    trend: 'flat',
    on: 'bg-[#fbbf24] shadow-[0_0_8px_rgb(251_191_36/0.9)]',
    off: 'bg-[#3a2606]',
  },
  {
    trend: 'down',
    on: 'bg-[#34d399] shadow-[0_0_8px_rgb(52_211_153/0.9)]',
    off: 'bg-[#06302a]',
  },
] as const;

// The Glizzflation office as a market board on the wall: an LED strip bolted to
// the wood, naming the index with a lamp lit for where it is heading, and the
// chart and the exchange hung below it
export default function TownBankTicker({
  trend,
  children,
}: {
  trend: 'up' | 'flat' | 'down';
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative flex items-center justify-between gap-3 rounded-[3px] bg-[#07090d] bg-[radial-gradient(rgb(251_191_36/0.12)_1px,transparent_1.2px)] bg-[length:4px_4px] px-5 py-1.5 shadow-[0_0_0_2px_#1f140b,0_3px_0_2px_rgb(0_0_0/0.45)]">
        <TownBankScrews brass />
        <span className="font-mono text-[11px] font-black uppercase tracking-[0.35em] text-[#fbbf24]">
          {TOWN.bankGlizzflation}
        </span>
        <span aria-hidden="true" className="flex gap-1.5">
          {LAMPS.map((lamp) => (
            <span
              key={lamp.trend}
              className={`h-2 w-2 rounded-full ${trend === lamp.trend ? lamp.on : lamp.off}`}
            />
          ))}
        </span>
      </div>
      {children}
    </div>
  );
}
