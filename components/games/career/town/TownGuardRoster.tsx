import PaperSheet from '@/components/games/career/street/PaperSheet';
import { DARK_PAINT } from '@/lib/utils/careerFrameClasses';
import ActionIcon from '@/components/icons/ActionIcon';

// The security firm's duty roster on a hardboard clipboard with a brass clip:
// the firm's badge and the question at the top of the sheet, and under the
// rule what is already standing guard and what the price is marked up or
// down by
export default function TownGuardRoster({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative pt-3">
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-0 z-10 flex h-7 w-24 -translate-x-1/2 justify-center rounded-[5px] bg-gradient-to-b from-[#fde68a] via-[#d4a017] to-[#92400e] shadow-[0_3px_0_rgb(0_0_0/0.4)]"
      >
        <span className="mt-1.5 h-1.5 w-10 rounded-full bg-[#000000]/35 shadow-[inset_0_1px_1px_rgb(0_0_0/0.6)]" />
      </span>
      <div className="rounded-[6px] bg-[#7a5230] bg-[repeating-linear-gradient(100deg,transparent_0_14px,rgb(0_0_0/0.06)_14px_16px)] p-2 pt-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_4px_0_rgb(0_0_0/0.45)]">
        <PaperSheet className="px-3 pb-3 pt-2.5">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,transparent_0_21px,rgb(28_25_23/0.07)_21px_22px)]"
          />
          <div className="relative text-[#1c1917]">
            <div className="flex items-center gap-3 border-b-[3px] border-double border-[#1c1917] pb-2">
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1e3a8a] shadow-[0_2px_0_rgb(0_0_0/0.35)] ring-2 ring-[#d4af37] ${DARK_PAINT}`}
              >
                <ActionIcon kind="guard" className="h-6 w-6 text-[#fde68a]" />
              </span>
              <span className="font-serif text-sm font-black leading-snug">
                {title}
              </span>
            </div>
            {children && <div className="mt-2 flex flex-col gap-2">{children}</div>}
          </div>
        </PaperSheet>
      </div>
    </div>
  );
}
