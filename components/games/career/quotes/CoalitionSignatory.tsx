import CoalitionArm from '@/components/games/career/quotes/CoalitionArm';
import CoalitionSuit from '@/components/games/career/quotes/CoalitionSuit';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import type { SponsorId } from '@/lib/utils/careerSave';
import { characterBySlug } from '@/lib/utils/duelCharacters';

// The leader stands on the left, the partner on the right
export type SignatorySide = 1 | -1;

const STEAM = [
  { cls: 'left-[2px]', after: 0 },
  { cls: 'right-[2px]', after: 200 },
  { cls: 'left-[20px]', after: 400 },
];

const FIZZ = ['left-[-5px]', 'left-[2px]', 'left-[8px]'];

// One man of the reconciliation: his suit, his head with the fury and the
// song on it, the arm with the tumbler or the bottle and the arm that signs.
// The data-anim names are the scene's moves
export default function CoalitionSignatory({
  side,
  party,
  slug,
  enterMs,
  capMs,
  swayMs,
}: {
  side: SignatorySide;
  party: SponsorId;
  slug: string;
  enterMs: number;
  capMs: number;
  swayMs: number;
}) {
  const name = side === 1 ? 'leader' : 'partner';
  return (
    <div
      data-anim={`${name}-stride`}
      className={`absolute bottom-[56px] h-[110px] w-[52px] ${side === 1 ? 'left-[120px]' : 'left-[168px]'}`}
    >
      <CoalitionSuit party={party} className="bottom-0 left-[4px] h-[44px] w-[44px]" />
      <SceneActor
        character={characterBySlug(slug)}
        className="bottom-[36px] left-0"
        anim={`${name}-head`}
        pose="origin-bottom"
        size="h-[52px] w-[52px]"
      >
        <span data-anim="fury" className="absolute inset-x-0 top-[-4px] block h-0 opacity-0">
          {STEAM.map((puff) => (
            <span
              key={puff.cls}
              data-anim="steam"
              data-anim-delay={enterMs + puff.after}
              className={`absolute h-[12px] w-[12px] rounded-full bg-slate-200/80 ${puff.cls}`}
            />
          ))}
        </span>
        <span data-anim="singing" className="absolute bottom-[8px] left-1/2 block h-[9px] w-[11px] -translate-x-1/2 opacity-0">
          <span data-anim="mouth" data-anim-delay={side === 1 ? 0 : swayMs / 2} className="absolute inset-0 rounded-[50%] bg-slate-950 ring-1 ring-red-900">
            <span className="absolute inset-x-[2px] bottom-[1px] h-[3px] rounded-t-full bg-red-500" />
          </span>
        </span>
      </SceneActor>
      <CoalitionArm
        party={party}
        anim={`${name}-outer`}
        className={`bottom-[30px] w-[28px] ${side === 1 ? 'left-[8px] [transform:rotate(85deg)]' : 'left-[36px] [transform:rotate(95deg)]'}`}
      >
        {side === 1 ? (
          <span data-anim="toast" className="absolute left-0 top-0 block h-0 w-0 rotate-[140deg] opacity-0">
            <span className="absolute bottom-[-3px] left-[-5px] block h-[13px] w-[10px] rounded-b-[2px] bg-slate-100/25 ring-1 ring-slate-100/70">
              <span className="absolute inset-x-[1px] bottom-[1px] h-[8px] rounded-b-[1px] bg-orange-400/90" />
              <span className="absolute left-[2px] top-[3px] h-[2px] w-[2px] rounded-full bg-orange-100" />
            </span>
          </span>
        ) : (
          <span data-anim="toast" className="absolute left-0 top-0 block h-0 w-0 rotate-[55deg] opacity-0">
            <span className="absolute bottom-[-6px] left-[-5px] block h-[26px] w-[10px]">
              <span className="absolute bottom-0 left-0 h-[15px] w-[10px] rounded-b-[2px] rounded-t-[5px] bg-orange-500 ring-1 ring-slate-950/50" />
              <span className="absolute bottom-[4px] left-0 h-[5px] w-[10px] bg-slate-50" />
              <span className="absolute bottom-[14px] left-[3px] h-[8px] w-[4px] bg-orange-500" />
              <span data-anim="cap-on" className="absolute bottom-[22px] left-[2px] h-[3px] w-[6px] rounded-[1px] bg-red-600 opacity-0 ring-1 ring-red-900" />
              <span data-anim="cap" className="absolute bottom-[22px] left-[2px] h-[3px] w-[6px] rounded-[1px] bg-red-600 opacity-0 ring-1 ring-red-900" />
              <span data-anim="ring-out" data-anim-delay={capMs} className="absolute bottom-[17px] left-[-5px] h-[20px] w-[20px] rounded-full border-2 border-orange-100 opacity-0" />
              {FIZZ.map((cls) => (
                <span
                  key={cls}
                  data-anim="fizz"
                  data-anim-delay={capMs}
                  className={`absolute bottom-[21px] h-[5px] w-[5px] rounded-full bg-orange-100 opacity-0 ${cls}`}
                />
              ))}
            </span>
          </span>
        )}
      </CoalitionArm>
      <CoalitionArm
        party={party}
        anim={`${name}-inner`}
        className={`z-30 bottom-[30px] w-[28px] ${side === 1 ? 'left-[36px] [transform:rotate(95deg)]' : 'left-[8px] [transform:rotate(85deg)]'}`}
      >
        <span data-anim="pen" className="absolute left-[-1px] top-[-11px] block h-[12px] w-[3px] rotate-[25deg] rounded-full bg-slate-900 opacity-0 ring-1 ring-amber-300" />
      </CoalitionArm>
    </div>
  );
}
