'use client';

import { useEffect, useRef } from 'react';
import PortraitHead from '@/components/games/PortraitHead';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import type { LawVote } from '@/lib/utils/careerLaws';
import type { Ballot } from '@/lib/utils/careerParliamentVote';

// One coach's vote landing on his side of the board: his face in the colour
// of his vote, with an outer outline in the same colour that a room's seat
// ring on the portrait cannot cover, the weight of it on a tag. A human's voice is a bigger, heavier
// token that drops harder. With animate it falls in on mount
export default function LawVoteToken({
  ballot,
  character,
  own = false,
  animate = true,
}: {
  ballot: Ballot<LawVote>;
  character: DuelCharacter | undefined;
  own?: boolean;
  animate?: boolean;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const yes = ballot.choice === 'yes';
  const heavy = ballot.human;
  useEffect(() => {
    const el = ref.current;
    if (!animate || !el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const drop = el.animate(
      heavy
        ? [
            { transform: 'translateY(-70%) scale(1.8)', opacity: 0 },
            { transform: 'translateY(6%) scale(0.88)', opacity: 1, offset: 0.65 },
            { transform: 'translateY(-3%) scale(1.04)', offset: 0.82 },
            { transform: 'translateY(0) scale(1)', opacity: 1 },
          ]
        : [
            { transform: 'translateY(-60%) scale(1.3)', opacity: 0 },
            { transform: 'translateY(0) scale(0.95)', opacity: 1, offset: 0.7 },
            { transform: 'translateY(0) scale(1)', opacity: 1 },
          ],
      {
        duration: heavy ? 520 : 360,
        easing: 'cubic-bezier(0.3, 0, 0.6, 1)',
      },
    );
    return () => drop.cancel();
  }, [animate, heavy]);

  const size = heavy ? 'w-11 sm:w-12' : 'w-8 sm:w-9';
  return (
    <span
      ref={ref}
      title={character?.name}
      className="relative inline-flex shrink-0"
    >
      <span
        className={`rounded-full p-[3px] shadow-lg outline outline-[3px] outline-offset-2 ${
          yes
            ? 'bg-emerald-400 outline-emerald-400'
            : 'bg-red-500 outline-red-500'
        } ${own ? 'ring-2 ring-amber-300 ring-offset-[7px] ring-offset-slate-950' : ''}`}
      >
        {character ? (
          <PortraitHead character={character} className={`aspect-square ${size}`} />
        ) : (
          <span
            className={`block aspect-square rounded-full bg-slate-800 ${size}`}
          />
        )}
      </span>
      <span
        className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-full border px-1 font-mono font-black leading-tight tabular-nums shadow ${
          heavy
            ? 'border-amber-200 bg-amber-300 text-[10px] text-slate-950'
            : yes
              ? 'border-emerald-300/70 bg-slate-950 text-[8px] text-emerald-200'
              : 'border-red-300/70 bg-slate-950 text-[8px] text-red-200'
        }`}
      >
        ×{ballot.weight}
      </span>
    </span>
  );
}
