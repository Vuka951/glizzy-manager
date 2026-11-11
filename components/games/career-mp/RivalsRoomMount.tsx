import GameHoverSounds from '@/components/games/GameHoverSounds';
import CareerFramesProvider from '@/components/games/career/CareerFramesProvider';
import CareerMpRoom from '@/components/games/career-mp/CareerMpRoom';
import TownTrophiesProvider from '@/components/games/career/town/TownTrophiesProvider';
import RoomQueryProvider from '@/components/games/rooms/RoomQueryProvider';
import ClientOnly from '@/components/shared/ClientOnly';

// The room reads its text from the browser's dictionary, so it mounts
// client-side; the fallback keeps the page from collapsing
export default function RivalsRoomMount({ code }: { code: string }) {
  return (
    <ClientOnly fallback={<div className="min-h-96 w-full" />}>
      <GameHoverSounds className="w-full">
        <RoomQueryProvider>
          <CareerFramesProvider>
            <TownTrophiesProvider>
              <CareerMpRoom code={code} />
            </TownTrophiesProvider>
          </CareerFramesProvider>
        </RoomQueryProvider>
      </GameHoverSounds>
    </ClientOnly>
  );
}
