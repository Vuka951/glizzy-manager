import { useId } from 'react';
import TownSceneryGround from '@/components/games/career/town/TownSceneryGround';
import TownScenerySky from '@/components/games/career/town/TownScenerySky';
import TownSceneryTrees from '@/components/games/career/town/TownSceneryTrees';
import type { BackdropFraming } from '@/lib/utils/backdropFraming';

// One edition of the town scenery without the town, dimmed and desaturated
// so the screen on top reads first; the snow edition's bright ground dims more
export default function TownSceneryBackdropScene({ season, framing }: { season: number; framing: BackdropFraming }) {
  const uid = `backdrop${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg
      viewBox={framing.viewBox}
      preserveAspectRatio="xMidYMax slice"
      className={`absolute inset-0 h-full w-full saturate-[0.78] ${season === 0 ? 'brightness-[0.76]' : 'brightness-[0.88]'}`}
    >
      <TownScenerySky season={season} layout={framing.layout} uid={`${uid}s`} lite />
      <TownSceneryGround season={season} layout={framing.layout} uid={`${uid}g`} square={false} />
      <TownSceneryTrees season={season} layout={framing.layout} backdrop={[framing.left, framing.width]} />
    </svg>
  );
}
