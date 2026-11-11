import InfoTip from '@/components/games/career/InfoTip';
import TownGuardCameras from '@/components/games/career/town/TownGuardCameras';
import MinusIcon from '@/components/icons/MinusIcon';
import PlusIcon from '@/components/icons/PlusIcon';
import { STREET_TRAY } from '@/lib/utils/careerFrameClasses';

const KEY =
  'flex h-12 w-12 shrink-0 items-center justify-center rounded-[4px] border-2 border-[#ffffff] bg-[#a16207] text-[#ffffff] shadow-[0_3px_0_rgba(2,6,23,0.65)] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fcd34d] active:translate-y-[2px] active:shadow-[0_1px_0_rgba(2,6,23,0.65)] disabled:pointer-events-none disabled:opacity-30';

// The guard booth's console, let into the wood: the camera feeds along the
// top, the monitor reading out how much of an attack the paid coverage stops,
// and the deck with the two keys and the lamp row of steps already paid for
export default function TownGuardConsole({
  label,
  caption,
  note,
  hint,
  pct,
  steps,
  filled,
  onLess,
  onMore,
}: {
  label: string;
  caption: string;
  note: string;
  hint: string;
  pct: number;
  steps: number;
  filled: number;
  onLess: () => void;
  onMore: () => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className={`flex flex-col gap-1 p-1.5 ${STREET_TRAY}`}>
        <TownGuardCameras />
        <div className="relative overflow-hidden rounded-[3px] bg-[#05090c] px-3 pb-3 pt-2.5 shadow-[inset_0_2px_10px_rgb(0_0_0/0.8)] ring-1 ring-[#000000]/70">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgb(255_255_255/0.03)_0_1px,transparent_1px_3px)]"
          />
          <div className="relative flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 font-sign text-[13px] font-semibold uppercase tracking-[0.06em] text-[#cbd5e1]">
              {label}
              <InfoTip text={hint} />
            </span>
            <span className="font-mono text-[10px] font-bold text-[#fcd34d]">
              {note}
            </span>
          </div>
          <div className="relative mt-2 flex flex-col items-center gap-1">
            <span className="font-mono text-4xl font-black leading-none tabular-nums text-[#fcd34d]">
              {pct}%
            </span>
            <span className="text-center font-sign text-[13px] font-semibold uppercase tracking-[0.06em] text-[#cbd5e1]">
              {caption}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <button onClick={onLess} disabled={filled <= 1} aria-label={caption} className={KEY}>
          <MinusIcon className="h-4 w-4" />
        </button>
        <span className={`flex min-w-0 flex-1 gap-[3px] p-1.5 ${STREET_TRAY}`}>
          {Array.from({ length: steps }).map((_, i) => (
            <span
              key={i}
              className={`h-2.5 flex-1 rounded-[2px] transition-colors ${
                i < filled
                  ? 'bg-[#fbbf24] shadow-[0_0_6px_rgb(251_191_36/0.7)]'
                  : 'bg-[#2a1d07]'
              }`}
            />
          ))}
        </span>
        <button onClick={onMore} disabled={filled >= steps} aria-label={caption} className={KEY}>
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
