import { INK } from '@/lib/constants/creatures/ink';
import type { CreatureScene, CreatureSpec } from '@/lib/utils/creatureAvatar';

const SUN_RAYS = Array.from({ length: 12 }, (_, i) => i * 30);
const WOVEN_ROWS = [12, 34, 56, 78, 100];
const WOVEN_COLS = [-6, 16, 38, 60, 82, 104];
const CHECKS = Array.from({ length: 9 }, (_, i) => i * 12 - 4);
const PEPPER_STRINGS = [
  { x: 9, length: 7 },
  { x: 19, length: 5 },
  { x: 81, length: 5 },
  { x: 91, length: 7 },
];

const PLAIN_TINTS = ['#3b1c22', '#1f3327', '#33261a', '#1e2a3d', '#403017'];

const SKY: Record<Exclude<CreatureScene, 'plain'>, readonly [string, string]> = {
  tower: ['#2e2447', '#7a4a4f'],
  gorge: ['#46625c', '#a5b5a4'],
  bridge: ['#2f5364', '#7c9ca0'],
  peaks: ['#2b4a72', '#8db0cc'],
  sun: ['#a4601f', '#c98a36'],
  woven: ['#6e1f1a', '#6e1f1a'],
  tablecloth: ['#2a3a2c', '#2a3a2c'],
  peppers: ['#8a7355', '#6e5a41'],
  grill: ['#1d1613', '#3a1e12'],
  night: ['#0c1430', '#1d2a55'],
};

// Where the creature stands: the hills, walls and tables of the south. Scenery
// stays at the rim and stays muted, so the silhouette is what reads
export default function CreatureBackdrop({ spec }: { spec: CreatureSpec }) {
  const { scene, sceneDots, id } = spec;
  const gradientId = `${id}-bg`;
  const [top, bottom] = scene === 'plain'
    ? [PLAIN_TINTS[spec.sceneTint], PLAIN_TINTS[spec.sceneTint]]
    : SKY[scene];

  return (
    <g>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={top} />
          <stop offset="100%" stopColor={bottom} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${gradientId})`} />

      {scene === 'tower' && (
        <g>
          <path d="M 6 66 L 6 40 L 10 40 L 10 44 L 13 44 L 13 38 L 17 38 L 17 44 L 21 42 L 23 48 L 23 70 Z" fill="#241c33" />
          <path d="M 12 56 L 16 56 L 16 62 L 12 62 Z" fill={INK.ember} opacity="0.7" />
          <path d="M -5 74 C 14 60 34 64 52 72 C 72 80 92 68 105 72 L 105 105 L -5 105 Z" fill="#1c1527" />
          <path d={`M 80 16 A 7 7 0 1 0 88 26 A 8 8 0 0 1 80 16 Z`} fill={INK.cream} opacity="0.85" />
        </g>
      )}
      {scene === 'gorge' && (
        <g>
          <path d="M -5 6 L 16 30 L 12 50 L 22 74 L 18 105 L -5 105 Z" fill="#2f4a3d" />
          <path d="M 105 14 L 86 34 L 90 52 L 78 76 L 84 105 L 105 105 Z" fill="#2a4438" />
          <path d="M -5 50 C 20 42 40 54 60 48 C 80 42 95 50 105 46 L 105 62 C 80 58 60 66 40 60 C 20 56 8 64 -5 60 Z" fill={INK.white} opacity="0.32" />
          <path d="M -5 74 C 20 66 42 80 66 74 C 82 70 94 76 105 72 L 105 90 C 80 88 50 96 28 88 C 14 84 4 88 -5 88 Z" fill={INK.white} opacity="0.28" />
        </g>
      )}
      {scene === 'bridge' && (
        <g>
          <path d="M -5 56 L 105 56 L 105 70 C 92 70 88 86 84 105 L 72 105 C 70 88 66 70 50 70 C 34 70 30 88 28 105 L 16 105 C 12 86 8 70 -5 70 Z" fill="#6d6250" stroke="#3f382c" strokeWidth="1.4" />
          <path d="M -5 62 L 105 62" stroke="#3f382c" strokeWidth="0.9" opacity="0.8" />
          <path d="M -5 94 C 8 90 14 96 28 94 M 72 94 C 86 90 94 96 105 92" fill="none" stroke={INK.sky} strokeWidth="1.2" opacity="0.6" />
        </g>
      )}
      {scene === 'peaks' && (
        <g>
          <path d="M -5 70 L 14 40 L 26 58 L 40 34 L 58 62 L 74 38 L 92 64 L 105 50 L 105 105 L -5 105 Z" fill="#3e5a7a" />
          <path d="M 14 40 L 20 50 L 15 48 L 9 49 Z M 74 38 L 81 48 L 75 46 L 68 47 Z" fill={INK.white} opacity="0.9" />
          <g fill={INK.white} opacity="0.85">
            {sceneDots.map((dot, i) => (
              <circle key={i} cx={dot.cx} cy={dot.cy} r={dot.r} />
            ))}
          </g>
        </g>
      )}
      {scene === 'sun' && (
        <g>
          <g fill={INK.ember} opacity="0.16">
            {SUN_RAYS.map((angle) => (
              <path key={angle} d="M 50 50 L 44 -14 L 56 -14 Z" transform={`rotate(${angle} 50 50)`} />
            ))}
          </g>
          <circle cx="50" cy="48" r="32" fill={INK.ember} opacity="0.18" />
          <path d="M -5 82 C 18 72 38 78 60 84 C 78 88 94 78 105 80 L 105 105 L -5 105 Z" fill="#5d4a1e" />
          <path d="M 8 80 L 8 74 M 92 80 L 92 74" stroke={INK.woodDark} strokeWidth="1.4" />
          <circle cx="8" cy="71" r="5" fill="#3f5a23" />
          <circle cx="92" cy="71" r="5" fill="#3f5a23" />
        </g>
      )}
      {scene === 'woven' && (
        <g>
          {WOVEN_ROWS.flatMap((y, row) =>
            WOVEN_COLS.map((x) => {
              const cx = x + (row % 2 === 0 ? 0 : 11);
              return (
                <g key={`${x}-${y}`}>
                  <path d={`M ${cx} ${y - 10} L ${cx + 10} ${y} L ${cx} ${y + 10} L ${cx - 10} ${y} Z`} fill="#561a15" />
                  <path d={`M ${cx} ${y - 5.4} L ${cx + 5.4} ${y} L ${cx} ${y + 5.4} L ${cx - 5.4} ${y} Z`} fill="#7f3a24" />
                  <path d={`M ${cx} ${y - 2.4} L ${cx + 2.4} ${y} L ${cx} ${y + 2.4} L ${cx - 2.4} ${y} Z`} fill="#6e1f1a" />
                </g>
              );
            }),
          )}
        </g>
      )}
      {scene === 'tablecloth' && (
        <g>
          <path d="M 0 16 L 100 16 M 0 34 L 100 34 M 0 52 L 100 52" stroke="#1a261c" strokeWidth="1.4" />
          <rect x="0" y="72" width="100" height="30" fill="#e7dcc6" />
          {[0, 1, 2].flatMap((row) =>
            CHECKS.filter((_, col) => (col + row) % 2 === 0).map((x) => (
              <rect key={`${x}-${row}`} x={x} y={72 + row * 10} width="12" height="10" fill="#b23a2e" />
            )),
          )}
        </g>
      )}
      {scene === 'peppers' && (
        <g>
          <path d="M 0 0 L 100 0 L 100 10 L 0 10 Z" fill={INK.woodDark} />
          <path d="M 0 22 L 100 22 M 0 44 L 100 44 M 0 66 L 100 66" stroke="#5c4a34" strokeWidth="0.8" opacity="0.5" />
          {PEPPER_STRINGS.map((string) => (
            <g key={string.x}>
              <path d={`M ${string.x} 8 L ${string.x} ${14 + string.length * 9}`} stroke={INK.bone} strokeWidth="1" />
              {Array.from({ length: string.length }, (_, i) => {
                const y = 14 + i * 9;
                const flip = i % 2 === 0 ? -1 : 1;
                return (
                  <path
                    key={i}
                    d={`M ${string.x} ${y} C ${string.x + flip * 4} ${y} ${string.x + flip * 5} ${y + 5} ${string.x + flip * 2} ${y + 10} C ${string.x + flip * 1} ${y + 7} ${string.x - flip} ${y + 4} ${string.x} ${y} Z`}
                    fill="#b5271c"
                    stroke="#5a100a"
                    strokeWidth="0.7"
                    strokeLinejoin="round"
                  />
                );
              })}
            </g>
          ))}
        </g>
      )}
      {scene === 'grill' && (
        <g>
          <path d="M 10 60 C 4 50 16 44 10 34 C 6 26 14 20 10 10" fill="none" stroke={INK.steel} strokeWidth="3" opacity="0.2" strokeLinecap="round" />
          <path d="M 90 66 C 96 54 84 48 90 38 C 94 30 86 24 90 14" fill="none" stroke={INK.steel} strokeWidth="3" opacity="0.2" strokeLinecap="round" />
          <rect x="0" y="82" width="100" height="20" fill="#1a0e0a" />
          <path d="M 0 82 L 100 82 M 0 88 L 100 88" stroke={INK.steelDark} strokeWidth="1.5" />
          <g fill={INK.flame}>
            {[6, 18, 30, 44, 58, 70, 82, 94].map((x) => (
              <circle key={x} cx={x} cy={x % 4 === 0 ? 94 : 92} r="2.6" opacity="0.85" />
            ))}
          </g>
        </g>
      )}
      {scene === 'night' && (
        <g>
          <g fill={INK.cream}>
            {sceneDots.map((dot, i) => (
              <circle key={i} cx={dot.cx} cy={dot.cy * 0.8} r={dot.r * 0.7} opacity="0.9" />
            ))}
          </g>
          <path d="M 18 12 A 8 8 0 1 0 28 22 A 9 9 0 0 1 18 12 Z" fill={INK.cream} />
          <path d="M -5 84 C 20 76 42 82 60 86 C 78 90 92 80 105 82 L 105 105 L -5 105 Z" fill="#070c1f" />
        </g>
      )}
      {scene !== 'plain' && <rect width="100" height="100" fill="#0b1120" opacity="0.26" />}
    </g>
  );
}
