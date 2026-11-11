import { INK } from '@/lib/constants/creatures/ink';
import type { CreatureSpec } from '@/lib/utils/creatureAvatar';

const GARLAND = [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1];

// Things around the body: the loser's eggplant or a fly at the side, and at the
// neck a gold chain, a tournament medal, a string of drying peppers or a woven
// scarf
export default function CreatureProp({ spec }: { spec: CreatureSpec }) {
  const { species } = spec;
  const side = species.side ?? { x: 84, y: 66 };
  const { neck } = species;
  const cx = species.face.x;

  const y = neck.y;
  const half = neck.w / 2;
  return (
    <g>
      {spec.neckwear === 'chain' && (
        <g>
          <path d={`M ${cx - half} ${y} Q ${cx} ${y + 9} ${cx + half} ${y}`} fill="none" stroke={INK.goldDark} strokeWidth="3.2" strokeLinecap="round" />
          <path d={`M ${cx - half} ${y} Q ${cx} ${y + 9} ${cx + half} ${y}`} fill="none" stroke={INK.gold} strokeWidth="2" strokeDasharray="2.2 1.4" strokeLinecap="round" />
          <circle cx={cx} cy={y + 6} r="3.2" fill={INK.gold} stroke={INK.goldDark} strokeWidth="1" />
        </g>
      )}
      {spec.neckwear === 'medal' && (
        <g>
          <path d={`M ${cx - half * 0.7} ${y - 3} L ${cx} ${y + 4} L ${cx + half * 0.7} ${y - 3}`} fill="none" stroke={INK.ketchup} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={cx} cy={y + 6.5} r="4.4" fill={INK.gold} stroke={INK.goldDark} strokeWidth="1.2" />
        </g>
      )}
      {spec.neckwear === 'garland' && (
        <g>
          <path d={`M ${cx - half} ${y - 1} Q ${cx} ${y + 8} ${cx + half} ${y - 1}`} fill="none" stroke={INK.bone} strokeWidth="1.2" />
          {GARLAND.map((t) => {
            const px = cx + t * half;
            const py = y - 1 + (1 - t * t) * 4.5;
            return (
              <path
                key={t}
                d={`M ${px - 1.8} ${py} C ${px - 2.2} ${py + 3} ${px - 0.6} ${py + 5.6} ${px} ${py + 6.8} C ${px + 0.6} ${py + 5.6} ${px + 2.2} ${py + 3} ${px + 1.8} ${py} Z`}
                fill={INK.ketchup}
                stroke="#7a1d14"
                strokeWidth="0.8"
                strokeLinejoin="round"
              />
            );
          })}
        </g>
      )}
      {spec.neckwear === 'wovenScarf' && (
        <g fill="none" strokeLinecap="round">
          <path d={`M ${cx - half} ${y} Q ${cx} ${y + 9} ${cx + half} ${y}`} stroke={INK.black} strokeWidth="8.4" />
          <path d={`M ${cx - half} ${y} Q ${cx} ${y + 9} ${cx + half} ${y}`} stroke={INK.ketchup} strokeWidth="6.4" />
          <path d={`M ${cx - half} ${y} Q ${cx} ${y + 9} ${cx + half} ${y}`} stroke={INK.black} strokeWidth="3.4" strokeDasharray="3 3" strokeLinecap="butt" />
          <path d={`M ${cx - half} ${y} Q ${cx} ${y + 9} ${cx + half} ${y}`} stroke={INK.cream} strokeWidth="1.2" strokeDasharray="3 3" strokeLinecap="butt" />
        </g>
      )}
      {spec.sideProp === 'eggplant' && (
        <g transform={`rotate(24 ${side.x} ${side.y})`}>
          <ellipse cx={side.x} cy={side.y} rx="6" ry="11" fill="#7b3fa8" stroke="#2c1242" strokeWidth="1.8" />
          <path d={`M ${side.x - 2.4} ${side.y - 4} Q ${side.x - 3.4} ${side.y + 1} ${side.x - 1.4} ${side.y + 6}`} fill="none" stroke="#b78ad8" strokeWidth="1.6" strokeLinecap="round" />
          <path d={`M ${side.x - 5.4} ${side.y - 9.6} Q ${side.x} ${side.y - 14.6} ${side.x + 5.4} ${side.y - 9.6} Q ${side.x} ${side.y - 7.4} ${side.x - 5.4} ${side.y - 9.6} Z`} fill={INK.leaf} stroke={INK.leafDark} strokeWidth="1.2" strokeLinejoin="round" />
        </g>
      )}
      {spec.sideProp === 'fly' && (
        <g transform="translate(16 26)">
          <path d="M 3 4 q 6 6 12 -2" fill="none" stroke={INK.steel} strokeWidth="1" strokeDasharray="1.5 1.5" opacity="0.8" />
          <ellipse cx="-2.5" cy="-2.4" rx="3.4" ry="1.8" fill={INK.sky} opacity="0.9" transform="rotate(-30 -2.5 -2.4)" />
          <ellipse cx="2.5" cy="-2.4" rx="3.4" ry="1.8" fill={INK.sky} opacity="0.9" transform="rotate(30 2.5 -2.4)" />
          <ellipse cx="0" cy="0" rx="3" ry="2.3" fill={INK.black} />
          <circle cx="-1.2" cy="-0.7" r="0.7" fill={INK.ketchup} />
        </g>
      )}
    </g>
  );
}
