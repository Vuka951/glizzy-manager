import CoalitionSleeve from '@/components/games/career/quotes/CoalitionSleeve';
import type { SponsorId } from '@/lib/utils/careerSave';

// Each sleeve from its owner's shoulder into the tangle, left man, middle
// man, right man, and the hand it ends in somewhere it should not be
const SLEEVES = [
  { path: 'M12 12C34 12 50 40 70 36S86 16 72 16 58 30 50 40', hand: [50, 40] },
  { path: 'M88 8C80 24 60 20 58 28S84 42 82 26 66 10 64 5', hand: [64, 5] },
  { path: 'M128 12C106 12 92 40 72 40S54 20 66 18 88 30 94 40', hand: [94, 40] },
] as const;
// A piece of the left sleeve laid back over the others so the three read as
// woven, not stacked
const OVERPASS = 'M58 25C62 33 66 36 70 36';

// Three handshakes gone wrong: the government's arms in one knot over the
// table. Laid out in a 140 by 50 box between the outer men's shoulders
export default function CoalitionArmKnot({
  parties,
  className = '',
}: {
  parties: [SponsorId, SponsorId, SponsorId];
  className?: string;
}) {
  return (
    <svg viewBox="0 0 140 50" aria-hidden="true" className={`absolute overflow-visible ${className}`}>
      {SLEEVES.map((sleeve, index) => (
        <CoalitionSleeve key={sleeve.path} d={sleeve.path} party={parties[index]} />
      ))}
      <CoalitionSleeve d={OVERPASS} party={parties[0]} />
      {SLEEVES.map(({ hand: [x, y] }) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="5.5" className="fill-amber-200 stroke-slate-950/40" strokeWidth="1" />
      ))}
    </svg>
  );
}
