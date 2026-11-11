import GameHoverSounds from '@/components/games/GameHoverSounds';
import CareerFramesProvider from '@/components/games/career/CareerFramesProvider';
import GliziCareerGame from '@/components/games/career/GliziCareerGame';
import TownTrophiesProvider from '@/components/games/career/town/TownTrophiesProvider';
import ClientOnly from '@/components/shared/ClientOnly';

// The game reads its text from the browser's dictionary and its league from
// the browser's saves, so it mounts client-side; the fallback keeps the page from collapsing
export default function ManagerGameMount() {
  return (
    <ClientOnly fallback={<div className="min-h-96 w-full" />}>
      <GameHoverSounds className="w-full">
        <CareerFramesProvider>
          <TownTrophiesProvider>
            <GliziCareerGame />
          </TownTrophiesProvider>
        </CareerFramesProvider>
      </GameHoverSounds>
    </ClientOnly>
  );
}
