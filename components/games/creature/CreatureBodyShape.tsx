import CreatureShapeList from '@/components/games/creature/CreatureShapeList';
import CreatureWovenBand from '@/components/games/creature/CreatureWovenBand';
import { GAMES_UI } from '@/data/games/locale';
import { INK } from '@/lib/constants/creatures/ink';
import { creaturePaint, type CreatureSpec } from '@/lib/utils/creatureAvatar';
import { zigzagPath } from '@/lib/utils/svgPaths';

// Everything a species is made of, plus the patterns a name can roll on top:
// cholesterol running down from the top, a mustard line or a woven band
export default function CreatureBodyShape({
  spec,
  clipId,
}: {
  spec: CreatureSpec;
  clipId: string;
}) {
  const { colors, species } = spec;
  const { face, seat } = species;
  const bandY = face.mouthY + 11;
  const cheekY = face.eyeY + face.eyeR + 5;
  const cheekX = face.eyeGap + face.eyeR * 0.9;
  const mustardStroke = species.tones[0].h > 30 && species.tones[0].h < 60 ? INK.ketchup : INK.mustard;

  return (
    <g>
      <CreatureShapeList shapes={species.behind ?? []} colors={colors} outlined />
      <path d={species.body} fill={colors.base} stroke={colors.outline} strokeWidth="3" strokeLinejoin="round" />
      <g clipPath={`url(#${clipId})`}>
        <CreatureShapeList shapes={species.marks ?? []} colors={colors} outlined={false} />
        {spec.pattern === 'zigzag' && (
          <path d={zigzagPath(0, 100, bandY + 4, 6.5, 3.2)} fill="none" stroke={mustardStroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {spec.pattern === 'woven' && <CreatureWovenBand y={bandY} />}
        {spec.pattern === 'drips' && (
          <g fill={colors.light} opacity="0.75">
            <rect x="0" y={seat.y - 4} width="100" height="9" />
            {spec.drips.map((drip, i) => (
              <rect key={i} x={drip.x - 2.5} y={seat.y} width="5" height={drip.length + 4} rx="2.5" />
            ))}
          </g>
        )}
        {spec.sheen && (
          <g fill={INK.white} opacity="0.45">
            <ellipse cx={face.x + 20} cy={face.eyeY - 12} rx="5" ry="8" transform={`rotate(-28 ${face.x + 20} ${face.eyeY - 12})`} />
            <circle cx={face.x - 22} cy={face.mouthY + 8} r="2.6" />
          </g>
        )}
      </g>
      <CreatureShapeList shapes={species.front ?? []} colors={colors} outlined />
      {species.sign && spec.signKey && (
        <text
          aria-hidden="true"
          x={species.sign.x}
          y={species.sign.y}
          fontSize={species.sign.size}
          fontWeight="800"
          fontFamily="Arial, Helvetica, sans-serif"
          letterSpacing="0.3"
          textAnchor="middle"
          fill={creaturePaint(colors, species.sign.fill)}
        >
          {GAMES_UI.creatures.signs[spec.signKey]}
        </text>
      )}
      {spec.blush !== 'none' && !species.fixedEyes && (
        <g fill={spec.blush === 'soft' ? INK.pink : INK.ketchup} opacity={spec.blush === 'soft' ? 0.55 : 0.5}>
          <ellipse cx={face.x - cheekX} cy={cheekY} rx="5.4" ry="3.2" />
          <ellipse cx={face.x + cheekX} cy={cheekY} rx="5.4" ry="3.2" />
        </g>
      )}
    </g>
  );
}
