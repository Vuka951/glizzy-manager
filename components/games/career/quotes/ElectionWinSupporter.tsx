import ElectionWinPennant from '@/components/games/career/quotes/ElectionWinPennant';
import ElectionWinGlizzy from '@/components/games/career/quotes/ElectionWinGlizzy';
import { electionWinPalette } from '@/lib/constants/electionWinPalette';
import type { SponsorId } from '@/lib/utils/careerSave';

// One of the bussed-in faithful: the same tracksuit, the same party cap, the
// same banner and the same glizzy as the man beside him. The scene drives
// the walk in by name and the chant through the crowd-* moves
export default function ElectionWinSupporter({
  party,
  className,
  walkAnim,
  jumpAnim = 'crowd-jump',
  headAnim,
  hands = true,
  bodyClassName = '',
  children,
}: {
  party: SponsorId;
  className: string;
  walkAnim?: string;
  jumpAnim?: string;
  headAnim?: string;
  hands?: boolean;
  bodyClassName?: string;
  children?: React.ReactNode;
}) {
  const palette = electionWinPalette[party];
  return (
    <div
      data-anim={walkAnim}
      className={`absolute h-[54px] w-[24px] ${className}`}
    >
      <div className={`absolute inset-0 ${bodyClassName}`}>
        <div data-anim={jumpAnim} className="absolute inset-0">
          <span className="absolute bottom-0 left-[6px] h-[11px] w-[5px] rounded-b-[2px] bg-slate-800" />
          <span className="absolute bottom-0 left-[13px] h-[11px] w-[5px] rounded-b-[2px] bg-slate-800" />
          <span className="absolute bottom-[9px] left-[3px] h-[18px] w-[18px] overflow-hidden rounded-t-[7px] bg-slate-500 ring-1 ring-slate-950/50">
            <span className="absolute inset-y-0 left-[4px] w-px bg-slate-200/80" />
            <span className="absolute inset-y-0 right-[4px] w-px bg-slate-200/80" />
          </span>
          <span
            data-anim={headAnim}
            className="absolute bottom-[25px] left-[5px] h-[14px] w-[14px] origin-bottom rounded-full bg-orange-200 ring-1 ring-slate-950/50"
          >
            <span className="absolute left-[3px] top-[6px] h-[2px] w-[2px] rounded-full bg-slate-950" />
            <span className="absolute right-[3px] top-[6px] h-[2px] w-[2px] rounded-full bg-slate-950" />
            <span
              data-anim="crowd-mouth"
              className="absolute bottom-[2px] left-1/2 h-[1.5px] w-[4px] -translate-x-1/2 rounded-full bg-slate-950"
            />
            <span
              className={`absolute inset-x-[-1px] top-[-2px] h-[6px] rounded-t-full ring-1 ring-slate-950/40 ${palette.cloth}`}
            />
            <span
              className={`absolute right-[-4px] top-[2px] h-[2px] w-[6px] rounded-full ${palette.cloth}`}
            />
          </span>
          {hands && (
            <>
              <span
                data-anim="banner-pump"
                className="absolute bottom-[18px] left-[19px] h-[36px] w-[2px] bg-amber-700"
              >
                <ElectionWinPennant
                  party={party}
                  className="absolute right-[2px] top-0 h-[13px] w-[19px]"
                />
                <span className="absolute bottom-[-2px] left-[-2px] h-[5px] w-[5px] rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
              </span>
              <span className="absolute bottom-[12px] left-[-3px] h-[5px] w-[5px] rounded-full bg-orange-200 ring-1 ring-slate-950/40">
                <ElectionWinGlizzy className="left-[-5px] top-[-5px]" />
              </span>
            </>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
