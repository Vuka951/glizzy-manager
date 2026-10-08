import GlizzyIcon from '@/components/icons/GlizzyIcon';
import { STARTING_LIVES } from '@/data/games/glizzyDuel';

export default function LivesRow({
  lives,
  cap = STARTING_LIVES,
}: {
  lives: number;
  cap?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: cap }, (_, i) => (
        <GlizzyIcon
          key={i}
          variant={0}
          className={`h-4 w-6 transition-all duration-500 sm:h-5 sm:w-7 ${
            i < lives ? 'opacity-100' : 'scale-75 opacity-25 grayscale'
          }`}
        />
      ))}
    </div>
  );
}
