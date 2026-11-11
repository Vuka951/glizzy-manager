import { electionWinPalette } from '@/lib/constants/electionWinPalette';
import type { SponsorId } from '@/lib/utils/careerSave';

const RAYS = [
  'rotate-0',
  'rotate-[25.7deg]',
  'rotate-[51.4deg]',
  'rotate-[77.1deg]',
  'rotate-[102.9deg]',
  'rotate-[128.6deg]',
  'rotate-[154.3deg]',
  'rotate-180',
  'rotate-[205.7deg]',
  'rotate-[231.4deg]',
  'rotate-[257.1deg]',
  'rotate-[282.9deg]',
  'rotate-[308.6deg]',
  'rotate-[334.3deg]',
];

// A rocket in the party's colours: the trail climbs to the caller's spot and
// the burst opens there. The scene times both moves by name
export default function ElectionWinFirework({
  party,
  className,
  trailAnim,
  burstAnim,
}: {
  party: SponsorId;
  className: string;
  trailAnim: string;
  burstAnim: string;
}) {
  const palette = electionWinPalette[party];
  return (
    <div className={`absolute h-0 w-0 ${className}`}>
      <span
        data-anim={trailAnim}
        className="absolute left-[-1.5px] top-0 h-[10px] w-[3px] rounded-full bg-gradient-to-b from-amber-100 to-amber-100/0 opacity-0"
      />
      <span
        data-anim={burstAnim}
        className="absolute left-0 top-0 h-0 w-0 opacity-0"
      >
        <span className="absolute left-[-20px] top-[-20px] h-[40px] w-[40px] rounded-full bg-slate-50/25 blur-md" />
        {RAYS.map((rotation, index) => (
          <span
            key={rotation}
            className={`absolute left-[-1.5px] top-[-34px] h-[14px] w-[3px] origin-[50%_34px] rounded-full ${palette.sparks[index % 3]} ${rotation}`}
          />
        ))}
      </span>
    </div>
  );
}
