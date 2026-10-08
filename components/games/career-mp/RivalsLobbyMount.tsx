'use client';

import { Suspense } from 'react';
import CareerMpLobby from '@/components/games/career-mp/CareerMpLobby';
import CareerMpProvider from '@/components/games/career-mp/CareerMpProvider';
import RoomClosedNotice from '@/components/games/career-mp/RoomClosedNotice';
import ClientOnly from '@/components/shared/ClientOnly';

// The lobby reads its text from the browser's dictionary, so it mounts
// client-side; the fallback keeps the page from collapsing
export default function RivalsLobbyMount() {
  return (
    <ClientOnly fallback={<div className="min-h-96 w-full" />}>
      <CareerMpProvider>
        <CareerMpLobby />
      </CareerMpProvider>
      <Suspense>
        <RoomClosedNotice />
      </Suspense>
    </ClientOnly>
  );
}
