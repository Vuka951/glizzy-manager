import PortraitHead from '@/components/games/PortraitHead';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import type { Ballot } from '@/lib/utils/careerParliamentVote';

// One coach's voice on the open board: his face, the weight of his vote when
// it is more than one, and whether he has voted yet
export default function CoalitionVoterChip({
  ballot,
  character,
  own = false,
  state,
  className = '',
}: {
  ballot: Ballot;
  character: DuelCharacter | undefined;
  own?: boolean;
  state?: 'voted' | 'waiting';
  className?: string;
}) {
  return (
    <span
      title={character?.name}
      className={`relative inline-flex shrink-0 ${
        state === 'waiting' ? 'motion-safe:animate-pulse opacity-60' : ''
      } ${className}`}
    >
      {character ? (
        <PortraitHead
          character={character}
          className={`aspect-square w-8 ${own ? 'ring-2 ring-[#b8862f]' : ''}`}
        />
      ) : (
        <span className="aspect-square w-8 rounded-full border-2 border-slate-500 bg-slate-800" />
      )}
      {ballot.weight > 1 && (
        <span className="absolute -bottom-1 -right-1.5 rounded-[2px] bg-[#1c1408] px-1 font-sign text-[11px] font-bold leading-tight text-[#fcd34d] shadow-[0_1px_0_rgb(0_0_0/0.5)]">
          ×{ballot.weight}
        </span>
      )}
      {state === 'voted' && (
        <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#047857] ring-2 ring-[#fffaf0]">
          <svg viewBox="0 0 10 10" className="h-2 w-2" aria-hidden="true">
            <path
              d="M2 5.2 4.1 7.2 8 2.8"
              className="fill-none stroke-[#ffffff]"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </span>
  );
}
