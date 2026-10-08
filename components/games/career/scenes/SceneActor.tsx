import PortraitHead from '@/components/games/PortraitHead';
import type { DuelCharacter } from '@/data/games/glizzyDuel';

// The player's head on stage. The outer box carries the position and the
// travel animation, the inner one the pose, so the two never fight
export default function SceneActor({
  character,
  className = '',
  anim,
  animDelay,
  animDuration,
  animIterations,
  pose = '',
  size = 'h-20 w-20 sm:h-24 sm:w-24',
  children,
}: {
  character: DuelCharacter;
  className?: string;
  anim?: string;
  animDelay?: number | string;
  animDuration?: number;
  animIterations?: number | string;
  pose?: string;
  size?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`absolute z-20 ${className}`}>
      <div
        data-anim={anim}
        data-anim-delay={animDelay}
        data-anim-duration={animDuration}
        data-anim-iterations={animIterations}
        className="relative"
      >
        <div className={`relative ${pose}`}>
          <PortraitHead
            character={character}
            className={`${size} ring-2 ring-slate-950/50`}
          />
        </div>
        {children}
      </div>
    </div>
  );
}
