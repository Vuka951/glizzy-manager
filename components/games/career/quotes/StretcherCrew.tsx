import SceneActor from '@/components/games/career/scenes/SceneActor';
import MedicCross from '@/components/games/career/quotes/MedicCross';
import SceneExtra from '@/components/games/career/quotes/SceneExtra';
import XEyes from '@/components/games/career/quotes/XEyes';
import type { DuelCharacter } from '@/data/games/glizzyDuel';

const MEDIC_TORSO = 'bg-gradient-to-b from-slate-50 to-slate-300';
const HAND =
  'absolute bottom-[19px] h-3.5 w-3.5 rounded-full bg-orange-200 ring-1 ring-slate-950/40';

// Two medics at the actors' scale with the stretcher between them at chest
// height. The fallen man already lies on it, hidden until the lift, so he
// travels with the crew instead of chasing it on a track of his own
export default function StretcherCrew({
  loser,
  className,
}: {
  loser: DuelCharacter;
  className: string;
}) {
  return (
    <div
      data-anim="crew-walk crew-step"
      className={`absolute h-28 w-[212px] sm:w-[240px] ${className}`}
    >
      <SceneExtra torso={MEDIC_TORSO} hair="bg-slate-50" className="left-0">
        <MedicCross />
      </SceneExtra>
      <SceneExtra
        torso={MEDIC_TORSO}
        hair="bg-slate-50"
        className="left-[148px] sm:left-[176px]"
      >
        <MedicCross />
      </SceneExtra>
      <span className="absolute bottom-[22px] left-[36px] h-2 w-[140px] rounded-sm sm:w-[168px] bg-slate-400 shadow">
        <span className="absolute inset-x-3 -top-1 h-1.5 rounded-t-sm bg-slate-50" />
      </span>
      <span className={`${HAND} left-[38px]`} />
      <span className={`${HAND} left-[162px] sm:left-[190px]`} />
      <div
        data-anim="on-stretcher"
        className="absolute bottom-[28px] left-[72px] h-16 w-28 opacity-0"
      >
        <span className="absolute bottom-0 left-[44px] h-6 w-12 rounded-full sm:w-16 bg-gradient-to-b from-sky-700 to-sky-900 ring-1 ring-slate-950/40" />
        <span className="absolute bottom-0 left-0 h-14 w-14 -rotate-90 sm:h-16 sm:w-16">
          <SceneActor
            character={loser}
            className="bottom-0 left-0"
            size="h-14 w-14 sm:h-16 sm:w-16"
          >
            <span className="absolute inset-0 rounded-full bg-red-600 opacity-70 mix-blend-multiply" />
            <XEyes anim="x-in" />
          </SceneActor>
        </span>
      </div>
    </div>
  );
}
