'use client';

import CareerMpProvider from '@/components/games/career-mp/CareerMpProvider';
import CareerMpRoom from '@/components/games/career-mp/CareerMpRoom';
import ClientOnly from '@/components/shared/ClientOnly';
import { CHARACTER_ROSTER } from '@/data/games/roster';

// The room reads its text and its roster from the browser's dictionary, so
// it mounts client-side; the fallback keeps the page from collapsing
export default function RivalsRoomMount({ code }: { code: string }) {
  return (
    <ClientOnly fallback={<div className="min-h-96 w-full" />}>
      <CareerMpProvider>
        <CareerMpRoom code={code} characters={CHARACTER_ROSTER} />
      </CareerMpProvider>
    </ClientOnly>
  );
}
