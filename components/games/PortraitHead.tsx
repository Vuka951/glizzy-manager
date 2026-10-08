'use client';

import Image from 'next/image';
import { useCoachColors } from '@/components/games/career-mp/coachColors';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { COACH_COLOR_CLASSES } from '@/lib/constants/careerMp';

// Roster portraits ship with the site and go through next/image. A portrait
// the player supplied (an upload or a link to any image online) cannot, so it
// is rendered as a plain tag instead of being run through the optimizer.
function isOwnAsset(src: string): boolean {
  return src.startsWith('/');
}

export default function PortraitHead({
  character,
  className,
}: {
  character: DuelCharacter;
  className: string;
}) {
  // In a shared room a coached character wears his coach's color everywhere
  const coach = useCoachColors()[character.slug];
  const ring = coach ? `ring-2 ${COACH_COLOR_CLASSES[coach.color].ring}` : '';
  return (
    <div
      className={`relative overflow-hidden rounded-full border-2 border-frost-border/50 bg-slate-800 shadow-lg ${ring} ${className}`}
    >
      {character.portrait ? (
        isOwnAsset(character.portrait) ? (
          <Image
            src={character.portrait}
            alt={character.name}
            fill
            className="object-cover object-top"
            sizes="80px"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={character.portrait}
            alt={character.name}
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        )
      ) : (
        <span className="flex h-full w-full items-center justify-center text-xl font-bold text-slate-400">
          {character.name.charAt(0)}
        </span>
      )}
    </div>
  );
}
