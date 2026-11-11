import BangBurst from '@/components/games/career/quotes/BangBurst';
import GlizzyPlate from '@/components/games/career/quotes/GlizzyPlate';
import StretcherCrew from '@/components/games/career/quotes/StretcherCrew';
import XEyes from '@/components/games/career/quotes/XEyes';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import type { TableCollapse as Collapse } from '@/lib/constants/tableCollapse';

const CROWD = Array.from({ length: 16 }, (_, index) => index);

// The hall, the long table and the loser's seat on its left end, for a
// scene where the loser eats himself out of the match. The scene puts the
// winner on the right end at z-10 (behind the table) or above, and feeds
// tableCollapseAnimations into its useSceneAnimation
export default function TableCollapse({
  loser,
  collapse,
}: {
  loser: DuelCharacter;
  collapse: Collapse;
}) {
  const burst = collapse === 'cholesterol';
  return (
    <>
      <div className="absolute inset-x-0 bottom-[52%] flex justify-around px-1">
        {CROWD.map((index) => (
          <span
            key={index}
            className={`h-5 w-6 rounded-t-full bg-slate-800/80 ${index % 2 ? 'mb-2' : ''}`}
          />
        ))}
      </div>
      <div className="absolute left-[4%] top-0 h-[82%] w-[44%] bg-gradient-to-b from-amber-200/15 to-amber-200/0 [clip-path:polygon(42%_0,58%_0,100%_100%,0_100%)]" />
      <div className="absolute right-[4%] top-0 h-[82%] w-[44%] bg-gradient-to-b from-amber-200/15 to-amber-200/0 [clip-path:polygon(42%_0,58%_0,100%_100%,0_100%)]" />

      {burst && (
        <StretcherCrew
          loser={loser}
          className="bottom-[30%] left-[calc(16%-76px)] z-[5] sm:left-[calc(16%-64px)]"
        />
      )}

      <div
        data-anim={burst ? 'slump' : 'heave'}
        className="absolute bottom-[30%] left-[16%] z-10 h-28 w-20 origin-bottom"
      >
        <span
          data-anim={burst ? undefined : 'belly-swell'}
          className="absolute -bottom-2 left-2 h-14 w-16 rounded-t-2xl bg-gradient-to-b from-sky-700 to-sky-900"
        />
        <SceneActor
          character={loser}
          className="bottom-[40px] left-2"
          anim={burst ? 'gobble tremble' : 'gobble bloat'}
          pose="origin-bottom"
          size="h-14 w-14 sm:h-16 sm:w-16"
        >
          <span
            data-anim={burst ? 'red-flush' : 'green-flush'}
            className={`absolute inset-0 rounded-full opacity-0 mix-blend-multiply ${burst ? 'bg-red-600' : 'bg-lime-500'}`}
          />
          {burst && <XEyes anim="x-in" />}
        </SceneActor>
        {!burst && (
          <span
            data-anim="spray"
            className="absolute bottom-[48px] left-[58px] h-5 w-16 origin-left bg-gradient-to-r from-lime-300 via-lime-500 to-lime-600 opacity-0 [clip-path:polygon(0_40%,100%_0,90%_50%,100%_100%,0_60%)] sm:bottom-[56px] sm:left-[64px]"
          />
        )}
      </div>
      {burst && (
        <span className="absolute bottom-[calc(30%+100px)] left-[calc(16%+62px)] z-10 h-12 w-7 sm:bottom-[calc(30%+108px)]">
          <span
            data-anim="gauge-burst"
            className="absolute inset-x-1.5 bottom-0 top-0 overflow-hidden rounded-full border-2 border-slate-400 bg-slate-900"
          >
            <span
              data-anim="gauge-fill"
              className="absolute inset-0 origin-bottom rounded-full bg-gradient-to-t from-red-700 to-red-500"
            />
          </span>
        </span>
      )}
      {burst && (
        <span className="absolute bottom-[calc(30%+64px)] left-[calc(16%+36px)] z-40">
          <BangBurst anim="bang-pop" />
        </span>
      )}

      <div className="absolute inset-x-[6%] bottom-0 z-20 h-[30%] rounded-t-md bg-gradient-to-b from-amber-800 to-amber-950 shadow-lg">
        <span className="absolute inset-x-0 top-0 h-1.5 rounded-t-md bg-amber-600" />
        <span className="absolute inset-x-[10%] top-[24%] h-px bg-amber-950/60" />
      </div>
      <span className="absolute bottom-[29%] left-[calc(16%+40px)] z-20">
        <GlizzyPlate eatable />
      </span>
      {!burst && (
        <span
          data-anim="puddle"
          className="absolute bottom-[28.5%] left-[calc(16%+64px)] z-20 h-2.5 w-24 origin-left rounded-[50%] bg-lime-600/90 opacity-0"
        >
          <span className="absolute left-[20%] top-[25%] h-1 w-2 rounded-full bg-amber-200/70" />
          <span className="absolute left-[60%] top-[35%] h-1 w-1.5 rounded-full bg-amber-200/60" />
        </span>
      )}
    </>
  );
}
