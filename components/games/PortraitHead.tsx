'use client';

import CreatureAvatar from '@/components/games/CreatureAvatar';
import { useSeatColors } from '@/components/games/rooms/seatColors';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { SEAT_COLOR_CLASSES } from '@/lib/constants/rooms';

// Every character's face is the creature his name draws
export default function PortraitHead({
  character,
  className,
}: {
  character: DuelCharacter;
  className: string;
}) {
  // In a shared room a seated character wears his seat's color everywhere
  const seat = useSeatColors()[character.slug];
  const ring = seat ? `ring-2 ${SEAT_COLOR_CLASSES[seat.color].ring}` : '';
  return (
    <div
      className={`relative overflow-hidden rounded-full border-2 border-frost-border/50 bg-slate-800 shadow-lg ${ring} ${className}`}
    >
      <CreatureAvatar name={character.name} className="h-full w-full" />
    </div>
  );
}
