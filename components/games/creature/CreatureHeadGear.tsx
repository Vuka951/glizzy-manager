import { INK } from '@/lib/constants/creatures/ink';
import type { CreatureSpec } from '@/lib/utils/creatureAvatar';

// Local coordinates: the origin is the middle of the spot the gear sits on,
// up is negative, and a width of about 36 fits a head of width 36. The gear is
// drawn at scale from the seat of the species
export default function CreatureHeadGear({ spec }: { spec: CreatureSpec }) {
  const { colors, species } = spec;
  if (spec.gear === 'none') return null;
  const { seat } = species;
  const scale = Math.max(0.6, Math.min(1.15, seat.w / 36));
  const place = `translate(${seat.x} ${seat.y}) rotate(${spec.gearTilt}) scale(${Math.round(scale * 100) / 100})`;

  return (
    <g transform={place} strokeLinejoin="round" strokeLinecap="round">
      {spec.gear === 'hat' && (
        <g>
          <rect x="-12" y="-21" width="24" height="21" rx="2.5" fill="#39414a" stroke={INK.black} strokeWidth="1.8" />
          <rect x="-12" y="-8" width="24" height="5.4" fill={INK.ketchup} />
          <rect x="-10" y="-20" width="4.5" height="12" rx="1.6" fill={INK.white} opacity="0.16" />
          <ellipse cx="0" cy="0" rx="20" ry="4.2" fill="#39414a" stroke={INK.black} strokeWidth="1.8" />
        </g>
      )}
      {spec.gear === 'sock' && (
        <g stroke={colors.outline} strokeWidth="1.8">
          <path d="M -14 0 C -15 -14 -6 -18 2 -17 C 10 -16 13 -12 16 -8 C 24 -6 25 2 19 3 C 15 4 13 2 12 0 Z" fill={colors.accent} />
          <circle cx="21" cy="0" r="3.6" fill={INK.white} />
          <rect x="-16" y="-3" width="30" height="6.4" rx="3" fill={INK.white} />
        </g>
      )}
      {spec.gear === 'box' && (
        <g>
          <rect x="-12" y="-16" width="24" height="17" rx="1.5" fill={INK.bun} stroke={INK.bunDark} strokeWidth="1.8" />
          <path d="M -12 -16 L -6 -22 H 6 L 12 -16 Z" fill="#e8b36c" stroke={INK.bunDark} strokeWidth="1.8" />
          <rect x="-2" y="-16" width="4" height="17" fill={INK.mustard} opacity="0.7" />
        </g>
      )}
      {spec.gear === 'egg' && (
        <g>
          <path d="M 0 -18 C 7 -18 10 -8 10 -4 C 10 2 5 4 0 4 C -5 4 -10 2 -10 -4 C -10 -8 -7 -18 0 -18 Z" fill={INK.cream} stroke={INK.bunDark} strokeWidth="1.7" />
          <ellipse cx="-3" cy="-9" rx="2" ry="3.2" fill={INK.white} />
        </g>
      )}
      {spec.gear === 'crown' && (
        <g>
          <path d="M -15 2 L -15 -11 L -7.5 -4 L 0 -14 L 7.5 -4 L 15 -11 L 15 2 Z" fill={INK.gold} stroke={INK.goldDark} strokeWidth="1.7" />
          <rect x="-15" y="-1" width="30" height="4" rx="1" fill={INK.gold} stroke={INK.goldDark} strokeWidth="1.2" />
          <circle cx="-15" cy="-12" r="2" fill={INK.gold} />
          <circle cx="0" cy="-15" r="2" fill={INK.gold} />
          <circle cx="15" cy="-12" r="2" fill={INK.gold} />
          <circle cx="0" cy="-3" r="2" fill={INK.ketchup} />
        </g>
      )}
      {spec.gear === 'fieldCap' && (
        <g>
          <path d="M -19 2 C -18 -3 -16 -9 -11 -11 C -6 -14 6 -14 11 -11 C 16 -9 18 -3 19 2 C 8 5 -8 5 -19 2 Z" fill="#6c6f45" stroke="#2d2f19" strokeWidth="1.8" />
          <path d="M 0 -13 C -2 -8 -2 -2 0 3" fill="none" stroke="#2d2f19" strokeWidth="1.4" />
          <path d="M -16 -2 C -8 1 8 1 16 -2" fill="none" stroke="#2d2f19" strokeWidth="1.2" opacity="0.7" />
        </g>
      )}
      {spec.gear === 'furHat' && (
        <path
          d="M -18 2 C -22 -4 -19 -10 -16 -11 C -17 -17 -10 -20 -7 -17 C -5 -22 3 -22 5 -18 C 9 -21 16 -17 15 -12 C 20 -10 22 -3 18 2 C 10 5 -10 5 -18 2 Z"
          fill="#2f2622"
          stroke={INK.black}
          strokeWidth="1.8"
        />
      )}
      {spec.gear === 'scarf' && (
        <g>
          <path d="M -20 5 C -20 -9 -10 -13 0 -13 C 10 -13 20 -9 20 5 C 12 0 -12 0 -20 5 Z" fill={INK.ketchup} stroke="#7a1d14" strokeWidth="1.8" />
          <circle cx="-9" cy="-5" r="1.5" fill={INK.white} />
          <circle cx="0" cy="-9" r="1.5" fill={INK.white} />
          <circle cx="9" cy="-5" r="1.5" fill={INK.white} />
          <circle cx="0" cy="-3" r="1.5" fill={INK.mustard} />
          <path d="M 18 3 L 25 10 L 19 11 Z" fill={INK.ketchup} stroke="#7a1d14" strokeWidth="1.5" />
        </g>
      )}
      {spec.gear === 'beanie' && (
        <g>
          <path d="M -16 0 C -16 -14 -8 -17 0 -17 C 8 -17 16 -14 16 0 Z" fill={colors.accent} stroke={colors.accentDark} strokeWidth="1.8" />
          <rect x="-18" y="-3" width="36" height="6.4" rx="2" fill={INK.cream} stroke={colors.accentDark} strokeWidth="1.4" />
          <circle cx="0" cy="-19" r="4" fill={INK.cream} stroke={colors.accentDark} strokeWidth="1.4" />
        </g>
      )}
    </g>
  );
}
