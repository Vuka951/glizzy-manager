import { INK } from '@/lib/constants/creatures/ink';
import { creaturePaint, type CreatureSpec } from '@/lib/utils/creatureAvatar';

// Two eyes, always: this is a yard and a table, not outer space. Eyes, brows,
// mustache and mouth sit on the anchors of the species, and the eyewear and
// whatever is being chewed go on last
export default function CreatureFace({ spec }: { spec: CreatureSpec }) {
  const { colors, species } = spec;
  const { face } = species;
  const outline = colors.outline;
  const lid = creaturePaint(colors, face.lid ?? 'base');
  const iris = species.iris ? creaturePaint(colors, species.iris) : INK.white;
  const r = face.eyeR;
  const left = face.x - face.eyeGap;
  const right = face.x + face.eyeGap;
  const eyeY = face.eyeY;
  const mouthY = face.mouthY;
  const half = face.mouthW / 2;
  const x = face.x;
  const showEyes = !species.fixedEyes;
  const hiddenEyes = spec.eyewear === 'sunglasses';

  const eye = (cx: number, side: -1 | 1) => {
    if (spec.eyes === 'happy') {
      return (
        <path
          d={`M ${cx - r} ${eyeY + 1.5} Q ${cx} ${eyeY - r * 1.2} ${cx + r} ${eyeY + 1.5}`}
          fill="none"
          stroke={spec.ink === INK.black ? outline : spec.ink}
          strokeWidth="2.8"
          strokeLinecap="round"
        />
      );
    }
    if (spec.eyes === 'dot') {
      return (
        <g>
          <circle cx={cx} cy={eyeY} r={r * 0.62} fill={INK.black} />
          <circle cx={cx - r * 0.2} cy={eyeY - r * 0.22} r={r * 0.18} fill={INK.white} />
        </g>
      );
    }
    return (
      <g>
        <circle cx={cx} cy={eyeY} r={r} fill={iris} stroke={outline} strokeWidth="1.8" />
        <circle cx={cx + spec.gaze * r} cy={eyeY + r * 0.12} r={r * 0.48} fill={INK.black} />
        <circle cx={cx + spec.gaze * r - r * 0.18} cy={eyeY - r * 0.12} r={r * 0.15} fill={INK.white} />
        {spec.eyes === 'sleepy' && (
          <path d={`M ${cx - r - 0.6} ${eyeY - r * 0.1} A ${r + 0.6} ${r + 0.6} 0 0 1 ${cx + r + 0.6} ${eyeY - r * 0.1} Z`} fill={lid} stroke={outline} strokeWidth="1.8" strokeLinejoin="round" />
        )}
        {spec.eyes === 'angry' && (
          <path
            d={`M ${cx - r - 0.6} ${eyeY - r * 0.25} A ${r + 0.6} ${r + 0.6} 0 0 1 ${cx + r + 0.6} ${eyeY - r * 0.25} Z`}
            transform={`rotate(${side === -1 ? 20 : -20} ${cx} ${eyeY})`}
            fill={lid}
            stroke={outline}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        )}
      </g>
    );
  };

  const browY = eyeY - r - 3.4;

  return (
    <g>
      {showEyes && !hiddenEyes && eye(left, -1)}
      {showEyes && !hiddenEyes && eye(right, 1)}

      {spec.eyewear === 'sunglasses' && (
        <g>
          <path d={`M ${left + r} ${eyeY - 1} L ${right - r} ${eyeY - 1}`} stroke={spec.ink === INK.black ? INK.black : INK.steel} strokeWidth="2.2" />
          {[left, right].map((cx) => (
            <g key={cx}>
              <rect x={cx - r * 1.3} y={eyeY - r * 0.95} width={r * 2.6} height={r * 1.9} rx={r * 0.6} fill={INK.black} stroke={spec.ink === INK.black ? 'none' : INK.steel} strokeWidth="1" />
              <path d={`M ${cx - r * 0.8} ${eyeY - r * 0.35} L ${cx - r * 0.2} ${eyeY - r * 0.55}`} stroke={INK.sky} strokeWidth="1.4" strokeLinecap="round" opacity="0.75" />
            </g>
          ))}
        </g>
      )}
      {spec.eyewear === 'specs' && (
        <g fill="none" stroke={spec.ink} strokeWidth="1.6">
          <circle cx={left} cy={eyeY} r={r + 1.8} />
          <circle cx={right} cy={eyeY} r={r + 1.8} />
          <path d={`M ${left + r + 1.8} ${eyeY - 1} Q ${x} ${eyeY - 3} ${right - r - 1.8} ${eyeY - 1}`} />
        </g>
      )}

      {showEyes && spec.brows === 'thick' && (
        <g stroke={spec.ink} strokeWidth="3" strokeLinecap="round">
          <path d={`M ${left - 5} ${browY} L ${left + 5} ${browY}`} transform={`rotate(${spec.browTilt} ${left} ${browY})`} />
          <path d={`M ${right - 5} ${browY} L ${right + 5} ${browY}`} transform={`rotate(${-spec.browTilt} ${right} ${browY})`} />
        </g>
      )}
      {showEyes && spec.brows === 'unibrow' && (
        <path d={`M ${left - 6} ${browY + 0.6} Q ${x} ${browY + 3.4} ${right + 6} ${browY + 0.6}`} fill="none" stroke={spec.ink} strokeWidth="3.2" strokeLinecap="round" />
      )}

      {spec.rare === 'stubble' && (
        <g fill={spec.ink} opacity="0.55">
          {[-1.3, -0.8, -0.3, 0.3, 0.8, 1.3].map((step) => (
            <circle key={step} cx={x + step * half} cy={mouthY + 7 - Math.abs(step) * 2} r="0.7" />
          ))}
          {[-1.05, -0.55, 0, 0.55, 1.05].map((step) => (
            <circle key={step} cx={x + step * half} cy={mouthY + 10 - Math.abs(step) * 2} r="0.7" />
          ))}
        </g>
      )}

      {spec.mouth === 'grin' && (
        <g>
          <path d={`M ${x - half} ${mouthY} Q ${x} ${mouthY + half * 1.1} ${x + half} ${mouthY} Z`} fill={INK.black} stroke={outline} strokeWidth="1.8" strokeLinejoin="round" />
          <path d={`M ${x - half * 0.72} ${mouthY + 0.6} L ${x + half * 0.72} ${mouthY + 0.6} L ${x + half * 0.6} ${mouthY + 2.4} L ${x - half * 0.6} ${mouthY + 2.4} Z`} fill={INK.white} />
          {spec.rare === 'goldTooth' && <rect x={x + half * 0.12} y={mouthY + 0.6} width={half * 0.34} height="2" fill={INK.gold} />}
        </g>
      )}
      {spec.mouth === 'smirk' && (
        <path d={`M ${x - half} ${mouthY + 2} Q ${x + half * 0.2} ${mouthY + 4.5} ${x + half} ${mouthY - 2.5}`} fill="none" stroke={spec.ink} strokeWidth="2.6" strokeLinecap="round" />
      )}
      {spec.mouth === 'flat' && (
        <path d={`M ${x - half * 0.8} ${mouthY + 1} L ${x + half * 0.8} ${mouthY + 1}`} stroke={spec.ink} strokeWidth="2.6" strokeLinecap="round" />
      )}
      {spec.mouth === 'o' && (
        <ellipse cx={x} cy={mouthY + 2} rx={half * 0.38} ry={half * 0.5} fill={INK.black} stroke={outline} strokeWidth="1.2" />
      )}
      {spec.mouth === 'tusks' && (
        <g>
          <path d={`M ${x - half} ${mouthY + 2} Q ${x} ${mouthY + 5} ${x + half} ${mouthY + 2}`} fill="none" stroke={spec.ink} strokeWidth="2.6" strokeLinecap="round" />
          <path d={`M ${x - half * 0.7} ${mouthY + 3} L ${x - half * 0.48} ${mouthY - 3} L ${x - half * 0.26} ${mouthY + 3.6} Z`} fill={INK.bone} stroke={outline} strokeWidth="1" strokeLinejoin="round" />
          <path d={`M ${x + half * 0.7} ${mouthY + 3} L ${x + half * 0.48} ${mouthY - 3} L ${x + half * 0.26} ${mouthY + 3.6} Z`} fill={INK.bone} stroke={outline} strokeWidth="1" strokeLinejoin="round" />
        </g>
      )}
      {spec.mouth === 'gap' && (
        <g>
          <path d={`M ${x - half} ${mouthY} Q ${x} ${mouthY + half * 1.2} ${x + half} ${mouthY} Z`} fill={INK.black} stroke={outline} strokeWidth="1.8" strokeLinejoin="round" />
          <rect x={x - half * 0.32} y={mouthY + 0.4} width={half * 0.36} height="3.2" rx="0.6" fill={spec.rare === 'goldTooth' ? INK.gold : INK.white} />
        </g>
      )}
      {spec.rare === 'goldTooth' && (spec.mouth === 'smirk' || spec.mouth === 'flat' || spec.mouth === 'o' || spec.mouth === 'tusks') && (
        <rect x={x + half * 0.2} y={mouthY + 1.2} width="2.6" height="2.6" rx="0.5" fill={INK.gold} stroke={outline} strokeWidth="0.6" />
      )}

      {spec.mustache === 'brush' && (
        <path d={`M ${x - half * 0.9} ${mouthY - 2.5} Q ${x} ${mouthY - 7.5} ${x + half * 0.9} ${mouthY - 2.5} Q ${x} ${mouthY - 1} ${x - half * 0.9} ${mouthY - 2.5} Z`} fill={spec.ink} stroke={spec.ink} strokeWidth="1.4" strokeLinejoin="round" />
      )}
      {spec.mustache === 'handlebar' && (
        <path
          d={`M ${x - half * 1.5} ${mouthY - 6} Q ${x - half * 1.35} ${mouthY - 1} ${x - half * 0.7} ${mouthY - 2} Q ${x - half * 0.3} ${mouthY - 3} ${x} ${mouthY - 5.4} Q ${x + half * 0.3} ${mouthY - 3} ${x + half * 0.7} ${mouthY - 2} Q ${x + half * 1.35} ${mouthY - 1} ${x + half * 1.5} ${mouthY - 6} Q ${x + half * 1.45} ${mouthY + 2.4} ${x + half * 0.7} ${mouthY + 0.4} Q ${x + half * 0.3} ${mouthY - 0.4} ${x} ${mouthY - 1.6} Q ${x - half * 0.3} ${mouthY - 0.4} ${x - half * 0.7} ${mouthY + 0.4} Q ${x - half * 1.45} ${mouthY + 2.4} ${x - half * 1.5} ${mouthY - 6} Z`}
          fill={spec.ink}
          stroke={spec.ink}
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
      )}
      {spec.mustache === 'walrus' && (
        <path d={`M ${x} ${mouthY - 6} C ${x - half * 0.7} ${mouthY - 7} ${x - half * 1.3} ${mouthY - 3} ${x - half * 1.25} ${mouthY + 5} C ${x - half * 0.9} ${mouthY + 3} ${x - half * 0.3} ${mouthY + 2} ${x} ${mouthY + 1} C ${x + half * 0.3} ${mouthY + 2} ${x + half * 0.9} ${mouthY + 3} ${x + half * 1.25} ${mouthY + 5} C ${x + half * 1.3} ${mouthY - 3} ${x + half * 0.7} ${mouthY - 7} ${x} ${mouthY - 6} Z`} fill={spec.ink} stroke={spec.ink} strokeWidth="0.8" strokeLinejoin="round" />
      )}

      {spec.mouthItem === 'glizzy' && (
        <g transform={`rotate(-10 ${x} ${mouthY + 3})`}>
          <path d={`M ${x - 11} ${mouthY + 3} Q ${x} ${mouthY + 8} ${x + 11} ${mouthY + 3}`} fill="none" stroke={INK.bunDark} strokeWidth="8" strokeLinecap="round" />
          <path d={`M ${x - 11} ${mouthY + 3} Q ${x} ${mouthY + 8} ${x + 11} ${mouthY + 3}`} fill="none" stroke={INK.bun} strokeWidth="6" strokeLinecap="round" />
          <path d={`M ${x - 12} ${mouthY + 1.4} Q ${x} ${mouthY + 6.4} ${x + 12} ${mouthY + 1.4}`} fill="none" stroke={INK.ketchup} strokeWidth="3.6" strokeLinecap="round" />
          <path d={`M ${x - 8} ${mouthY + 2.4} l 2 1.8 l 2 -1 l 2 1.8 l 2 -1 l 2 1.4 l 2 -1 l 2 1 `} fill="none" stroke={INK.mustard} strokeWidth="1.1" strokeLinecap="round" />
        </g>
      )}
      {spec.mouthItem === 'toothpick' && (
        <path d={`M ${x + half * 0.5} ${mouthY + 2} L ${x + half + 8} ${mouthY - 5}`} stroke={INK.bun} strokeWidth="1.6" strokeLinecap="round" />
      )}
      {spec.rare === 'freckle' && (
        <circle cx={x + face.eyeGap + r * 0.3} cy={eyeY + r + 4} r="1.8" fill={INK.stem} />
      )}
      {spec.rare === 'scar' && (
        <g stroke={spec.ink} strokeWidth="1.4" strokeLinecap="round" opacity="0.85">
          <path d={`M ${right - r * 0.9} ${eyeY + r + 4.5} L ${right + r * 1.1} ${eyeY + r + 3}`} />
          <path d={`M ${right - r * 0.5} ${eyeY + r + 2.6} L ${right - r * 0.4} ${eyeY + r + 6}`} />
          <path d={`M ${right + r * 0.1} ${eyeY + r + 2.2} L ${right + r * 0.2} ${eyeY + r + 5.6}`} />
          <path d={`M ${right + r * 0.7} ${eyeY + r + 1.8} L ${right + r * 0.8} ${eyeY + r + 5.2}`} />
        </g>
      )}
      {spec.rare === 'plaster' && (
        <g transform={`rotate(-24 ${left - r * 0.2} ${eyeY + r + 5})`}>
          <rect x={left - r * 0.2 - 5.4} y={eyeY + r + 3.2} width="10.8" height="3.8" rx="1.4" fill={INK.bone} stroke={outline} strokeWidth="0.7" />
          <rect x={left - r * 0.2 - 1.6} y={eyeY + r + 3.2} width="3.2" height="3.8" fill={INK.bun} opacity="0.6" />
        </g>
      )}
    </g>
  );
}
