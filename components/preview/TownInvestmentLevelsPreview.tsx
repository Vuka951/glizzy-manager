'use client';

import { useState } from 'react';
import HomeBuilding from '@/components/games/career/town/HomeBuilding';
import KioskBuilding from '@/components/games/career/town/KioskBuilding';
import SecurityFirmBuilding from '@/components/games/career/town/SecurityFirmBuilding';
import TownCctvPole from '@/components/games/career/town/TownCctvPole';
import TownEscortDog from '@/components/games/career/town/TownEscortDog';
import TownGuardBooth from '@/components/games/career/town/TownGuardBooth';
import TownSpyVanArt from '@/components/games/career/town/TownSpyVanArt';
import TownTacticsBoard from '@/components/games/career/town/TownTacticsBoard';
import TrainingCenterBuilding from '@/components/games/career/town/TrainingCenterBuilding';
import TownBuildingTile from '@/components/preview/TownBuildingTile';
import {
  INVESTMENT_DEFS,
  INVESTMENT_ORDER,
  type InvestmentId,
} from '@/data/games/careerInvestments';
import { GAMES_UI } from '@/data/games/locale';
import { SEAT_COLOR_ORDER } from '@/lib/constants/rooms';
import type { TownBuildingMode, TownWindow } from '@/lib/types/town';

const NAMES = GAMES_UI.career.investments.names;

const WINDOWS: TownWindow[] = [
  { state: 'done', color: SEAT_COLOR_ORDER[0], name: 'Ana' },
];

const CHIP = 'rounded-lg border px-3 py-1.5 text-xs font-semibold transition';
const CHIP_IDLE =
  'border-sky-200/30 bg-slate-800/70 text-slate-200 hover:border-sky-200/60 hover:text-white';
const CHIP_ON = 'border-sky-200/70 bg-sky-400/20 text-white';

const MODES: { mode: TownBuildingMode; label: string }[] = [
  { mode: 'open', label: 'Open' },
  { mode: 'shut', label: 'Shut for the night' },
];

// Full static class strings so Tailwind picks them up
const BOX: Record<InvestmentId, string> = {
  assistant: 'h-[72%] aspect-[200/150]',
  spa: 'h-[66%] aspect-[220/210]',
  security: 'h-[72%] aspect-[180/140]',
  scout: 'h-[78%] aspect-[124/100]',
};

// The contracts' pieces that stand out in town, away from any building
const STREET: {
  label: string;
  box: string;
  art: (mode: TownBuildingMode) => React.ReactNode;
}[] = [
  {
    label: 'Coach 3: board',
    box: 'h-[62%] aspect-[136/68]',
    art: (mode) => <TownTacticsBoard mode={mode} />,
  },
  {
    label: 'Escort 1: booth',
    box: 'h-[62%] aspect-[34/50]',
    art: (mode) => <TownGuardBooth mode={mode} />,
  },
  {
    label: 'Escort 2: camera',
    box: 'h-[72%] aspect-[34/84]',
    art: (mode) => <TownCctvPole mode={mode} />,
  },
  {
    label: 'Escort 1: dog',
    box: 'h-[40%] aspect-[26/23]',
    art: () => <TownEscortDog flip={false} />,
  },
  {
    label: 'Informant 3: van',
    box: 'h-[56%] aspect-[90/52]',
    art: (mode) => <TownSpyVanArt mode={mode} />,
  },
];

function art(id: InvestmentId, level: number, mode: TownBuildingMode) {
  if (id === 'assistant') {
    return <TrainingCenterBuilding mode={mode} assistantLevel={level} />;
  }
  if (id === 'scout') {
    return <KioskBuilding mode={mode} fresh={false} scoutLevel={level} />;
  }
  if (id === 'security') {
    return (
      <SecurityFirmBuilding mode={mode} wall={false} securityLevel={level} />
    );
  }
  return (
    <HomeBuilding mode={mode} windows={WINDOWS} plates spaLevel={level} />
  );
}

// Every level of the four standing contracts side by side on the building
// that wears it, from nothing bought up to the top level
export default function TownInvestmentLevelsPreview() {
  const [mode, setMode] = useState<TownBuildingMode>('open');
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {MODES.map((m) => (
          <button
            key={m.mode}
            type="button"
            onClick={() => setMode(m.mode)}
            className={`${CHIP} ${mode === m.mode ? CHIP_ON : CHIP_IDLE}`}
          >
            {m.label}
          </button>
        ))}
      </div>
      {INVESTMENT_ORDER.map((id) => {
        const levels = Array.from(
          { length: INVESTMENT_DEFS[id].maxLevel + 1 },
          (_, n) => n,
        );
        return (
          <div key={id} className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
              {NAMES[id]}
            </span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {levels.map((n) => (
                <div key={n} className="relative">
                  <TownBuildingTile box={BOX[id]}>
                    {art(id, n, mode)}
                  </TownBuildingTile>
                  <span className="absolute left-2 top-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                    {n === 0 ? 'Bez' : `Nivo ${n}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
          Around town
        </span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {STREET.map((piece) => (
            <div key={piece.label} className="relative">
              <TownBuildingTile box={piece.box}>
                {piece.art(mode)}
              </TownBuildingTile>
              <span className="absolute left-2 top-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                {piece.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
