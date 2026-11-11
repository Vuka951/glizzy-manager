'use client';

import { Suspense } from 'react';
import GameHoverSounds from '@/components/games/GameHoverSounds';
import CareerFramesProvider from '@/components/games/career/CareerFramesProvider';
import CareerMpLobby from '@/components/games/career-mp/CareerMpLobby';
import RoomClosedNotice from '@/components/games/rooms/RoomClosedNotice';
import RoomQueryProvider from '@/components/games/rooms/RoomQueryProvider';
import ClientOnly from '@/components/shared/ClientOnly';
import { GAMES_UI } from '@/data/games/locale';
import { RIVALS_PATH } from '@/lib/constants/routes';

// The lobby reads its text from the browser's dictionary, so it mounts
// client-side; the fallback keeps the page from collapsing
export default function RivalsLobbyMount() {
  return (
    <ClientOnly fallback={<div className="min-h-96 w-full" />}>
      <CareerFramesProvider>
        <GameHoverSounds className="w-full">
          <RoomQueryProvider>
            <CareerMpLobby />
          </RoomQueryProvider>
          <Suspense>
            <RoomClosedNotice
              lobbyPath={RIVALS_PATH}
              title={GAMES_UI.careerMp.lobby.title}
            />
          </Suspense>
        </GameHoverSounds>
      </CareerFramesProvider>
    </ClientOnly>
  );
}
