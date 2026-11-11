'use client';

import { useState } from 'react';
import CareerButton from '@/components/games/career/CareerButton';
import TownBankChooser from '@/components/games/career/town/TownBankChooser';
import TownBankFolder from '@/components/games/career/town/TownBankFolder';
import TownBankTicker from '@/components/games/career/town/TownBankTicker';
import { GAMES_UI } from '@/data/games/locale';

const TOWN = GAMES_UI.career.town;

type TownBankRoom = 'glizzflation' | 'invest' | 'office';

// The bank's corridor of offices, then the one picked with a way back out
// to the doors, each office dressed as the thing it is: the market board,
// the contract folder, the counter with the passbook. Closing the panel
// unmounts it, so it reopens at the doors.
// The doors and every office are laid on the same spot and only the open
// one shows, so the modal keeps the tallest room's size, capped to what the
// modal's frame leaves of the screen, instead of jumping on the way in and
// back; an office taller than that scrolls inside its own room
export default function TownBankPanel({
  trend,
  glizzflationSub,
  officeSub,
  glizzflation,
  invest,
  office,
}: {
  trend: 'up' | 'flat' | 'down';
  glizzflationSub: string;
  officeSub: string | null;
  glizzflation: React.ReactNode;
  invest: React.ReactNode | null;
  office: React.ReactNode;
}) {
  const [room, setRoom] = useState<TownBankRoom | null>(null);
  const open = room === 'invest' && !invest ? null : room;
  const rooms: TownBankRoom[] = invest
    ? ['glizzflation', 'invest', 'office']
    : ['glizzflation', 'office'];
  return (
    <div className="grid max-h-[calc(80vh/var(--game-zoom,1)_-_5.5rem)] w-full grid-rows-[minmax(0,1fr)] phone-landscape:max-h-[calc(100dvh/var(--game-zoom,1)_-_6.25rem)]">
      <div
        inert={open !== null}
        className={`[grid-area:1/1] ${open === null ? '' : 'invisible'}`}
      >
        <TownBankChooser
          trend={trend}
          glizzflationSub={glizzflationSub}
          officeSub={officeSub}
          invest={Boolean(invest)}
          onGlizzflation={() => setRoom('glizzflation')}
          onInvest={() => setRoom('invest')}
          onOffice={() => setRoom('office')}
        />
      </div>
      {rooms.map((id) => (
        <div
          key={id}
          inert={open !== id}
          className={`flex min-h-0 flex-col gap-3 overflow-y-auto overscroll-contain p-3 [grid-area:1/1] ${
            open === id ? '' : 'invisible'
          }`}
        >
          <CareerButton
            tone="quiet"
            className="min-h-11 self-start"
            onClick={() => setRoom(null)}
          >
            {TOWN.bankBack}
          </CareerButton>
          {id === 'glizzflation' ? (
            <TownBankTicker trend={trend}>{glizzflation}</TownBankTicker>
          ) : id === 'invest' ? (
            <TownBankFolder>{invest}</TownBankFolder>
          ) : (
            office
          )}
        </div>
      ))}
    </div>
  );
}
