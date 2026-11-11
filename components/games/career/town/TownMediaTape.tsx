import CareerButton from '@/components/games/career/CareerButton';
import ActionIcon from '@/components/icons/ActionIcon';
import BoltIcon from '@/components/icons/BoltIcon';
import { GAMES_UI } from '@/data/games/locale';
import { plural } from '@/lib/utils/format';

const OS = GAMES_UI.career.offseason;
const SPOKES = [0, 60, 120];

const KINDS = {
  interview: {
    band: 'bg-[#0369a1]',
    icon: <ActionIcon kind="media" className="h-6 w-6 text-[#e0f2fe]" />,
    tone: 'neutral',
  },
  scandal: {
    band: 'bg-[#b91c1c]',
    icon: <BoltIcon className="h-6 w-6 text-[#fee2e2]" />,
    tone: 'danger',
  },
} as const;

// One programme on the studio desk as a tape cassette: the paper label with
// a coloured band, the segment's name, what it pays stamped in the corner
// and its rundown, then the reel window and the key that sends it to air
export default function TownMediaTape({
  kind,
  title,
  desc,
  pay,
  label,
  onPlay,
}: {
  kind: keyof typeof KINDS;
  title: string;
  desc: string;
  pay: number;
  label: string;
  onPlay: () => void;
}) {
  const K = KINDS[kind];
  return (
    <div className="group/tape rounded-[6px] bg-gradient-to-b from-[#2a2e37] to-[#15171c] p-2 shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_3px_0_rgb(0_0_0/0.8)] ring-1 ring-[#000000]">
      <div className="flex overflow-hidden rounded-[3px] bg-[#fbf6e6] text-[#1c1917] shadow-[0_1px_0_rgb(0_0_0/0.6)]">
        <span
          className={`flex w-10 shrink-0 items-start justify-center pt-2.5 shadow-[inset_-2px_0_3px_rgb(0_0_0/0.25)] ${K.band}`}
        >
          {K.icon}
        </span>
        <div className="min-w-0 flex-1 bg-[repeating-linear-gradient(to_bottom,transparent_0_17px,rgb(28_25_23/0.08)_17px_18px)] px-2.5 pb-2.5 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b-2 border-[#1c1917] pb-1">
            <span className="font-sign text-[16px] font-bold uppercase leading-tight tracking-[0.04em]">
              {title}
            </span>
            <span className="-rotate-2 rounded-[3px] border-2 border-[#047857] px-1.5 font-sign text-[13px] font-bold tabular-nums text-[#047857]">
              +{plural(OS.cost, pay, { cost: pay })}
            </span>
          </div>
          <p className="mt-1.5 text-[11px] font-medium leading-snug text-[#44403c]">
            {desc}
          </p>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span
          aria-hidden="true"
          className="flex h-9 min-w-0 max-w-24 flex-1 items-center justify-around overflow-hidden rounded-[3px] bg-[#05070a] shadow-[inset_0_1px_4px_rgb(0_0_0/0.9)] ring-1 ring-[#3f4652]/60"
        >
          {[0, 1].map((reel) => (
            <svg
              key={reel}
              viewBox="0 0 20 20"
              className="h-6 w-6 shrink-0 motion-safe:group-hover/tape:animate-[spin_2.4s_linear_infinite]"
            >
              <circle cx="10" cy="10" r="9" className="fill-[#3b2f2a]" />
              <circle cx="10" cy="10" r="4.5" className="fill-[#d6d3d1]" />
              {SPOKES.map((deg) => (
                <rect
                  key={deg}
                  x="9.2"
                  y="5.5"
                  width="1.6"
                  height="9"
                  transform={`rotate(${deg} 10 10)`}
                  className="fill-[#57534e]"
                />
              ))}
              <circle cx="10" cy="10" r="1.6" className="fill-[#05070a]" />
            </svg>
          ))}
        </span>
        <CareerButton tone={K.tone} className="min-h-11 shrink-0" onClick={onPlay}>
          {label}
        </CareerButton>
      </div>
    </div>
  );
}
