import { INK } from '@/lib/constants/creatures/ink';

const WOVEN_STEP = 9;

// A woven band: a row of stacked diamonds on a red strip
export default function CreatureWovenBand({ y }: { y: number }) {
  const diamonds = Array.from({ length: 13 }, (_, i) => i * WOVEN_STEP - 4);
  return (
    <g>
      <rect x="-5" y={y} width="110" height="11" fill={INK.ketchup} />
      <rect x="-5" y={y} width="110" height="1.4" fill={INK.black} />
      <rect x="-5" y={y + 9.6} width="110" height="1.4" fill={INK.black} />
      {diamonds.map((x) => (
        <path key={x} d={`M ${x} ${y + 5.5} L ${x + 4} ${y + 2} L ${x + 8} ${y + 5.5} L ${x + 4} ${y + 9} Z`} fill={INK.black} />
      ))}
      {diamonds.map((x) => (
        <path key={x} d={`M ${x + 2.2} ${y + 5.5} L ${x + 4} ${y + 4} L ${x + 5.8} ${y + 5.5} L ${x + 4} ${y + 7} Z`} fill={INK.cream} />
      ))}
    </g>
  );
}
