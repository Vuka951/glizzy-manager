import type { CreatureShape } from '@/lib/types/creature';
import { creaturePaint, type CreatureColors } from '@/lib/utils/creatureAvatar';

// Species parts are data. Shapes that carry a fill get the species outline
// unless they say otherwise, so every part reads as the same sticker
export default function CreatureShapeList({
  shapes,
  colors,
  outlined,
}: {
  shapes: readonly CreatureShape[];
  colors: CreatureColors;
  outlined: boolean;
}) {
  return (
    <>
      {shapes.map((shape, i) => (
        <path
          key={i}
          d={shape.d}
          fill={creaturePaint(colors, shape.fill ?? 'none')}
          stroke={creaturePaint(colors, shape.stroke ?? (outlined ? 'outline' : 'none'))}
          strokeWidth={shape.width ?? 2.2}
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity={shape.opacity}
        />
      ))}
    </>
  );
}
