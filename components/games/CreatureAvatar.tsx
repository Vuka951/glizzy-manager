import CreatureBackdrop from '@/components/games/creature/CreatureBackdrop';
import CreatureBodyShape from '@/components/games/creature/CreatureBodyShape';
import CreatureFace from '@/components/games/creature/CreatureFace';
import CreatureHeadGear from '@/components/games/creature/CreatureHeadGear';
import CreatureProp from '@/components/games/creature/CreatureProp';
import { creatureSpec } from '@/lib/utils/creatureAvatar';

// An avatar is a picture: every color is an SVG attribute, because the light
// theme remaps the Tailwind palette and would flip a fill class. Ids carry the
// name hash, so different names never collide and the same name twice shares
// its defs
export default function CreatureAvatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const spec = creatureSpec(name);
  const clipId = `${spec.id}-clip`;
  const discId = `${spec.id}-disc`;
  const lift =
    spec.shrink < 1
      ? `translate(50 100) scale(${spec.shrink}) translate(-50 -100)`
      : undefined;

  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label={name}
      className={className ?? 'h-full w-full'}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={spec.species.body} />
        </clipPath>
        <clipPath id={discId}>
          <circle cx="50" cy="50" r="50" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${discId})`}>
        <CreatureBackdrop spec={spec} />
        <g transform={lift}>
          <CreatureBodyShape spec={spec} clipId={clipId} />
          <CreatureFace spec={spec} />
          <CreatureProp spec={spec} />
          <CreatureHeadGear spec={spec} />
        </g>
      </g>
    </svg>
  );
}
