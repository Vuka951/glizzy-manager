import BallotInkStamp from '@/components/games/career/BallotInkStamp';
import PaperSheet from '@/components/games/career/street/PaperSheet';

// An official sheet issued for one vote or one decree: torn off a perforated
// pad, a printed keyline, the wax seal and the heading over a double rule and
// the office's ink stamp struck across the corner. What it is about goes
// inside
export default function BallotPaper({
  seal,
  heading,
  sub,
  stamp,
  stampInk = 'text-[#1e3a8a]/65',
  className = '',
  children,
}: {
  seal: React.ReactNode;
  heading: React.ReactNode;
  sub?: React.ReactNode;
  stamp: string;
  stampInk?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <PaperSheet className={`w-full px-3.5 pb-4 pt-5 sm:px-5 ${className}`}>
      <span
        aria-hidden="true"
        className="absolute inset-x-1 top-1 h-1.5 bg-[radial-gradient(circle,#2b1a0f_1.7px,transparent_2.2px)] bg-[length:10px_6px] bg-repeat-x"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-1.5 bottom-1.5 top-3.5 border border-slate-500/60"
      />
      <BallotInkStamp
        text={stamp}
        className={`absolute right-2.5 top-[1.125rem] h-[3.75rem] w-[3.75rem] -rotate-12 sm:right-4 sm:h-[4.5rem] sm:w-[4.5rem] ${stampInk}`}
      />
      <header className="relative flex min-h-14 items-center gap-2.5 border-b-[3px] border-double border-slate-200 pb-2 pr-14 sm:pr-[4.5rem]">
        {seal}
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="font-serif text-[15px] font-black uppercase lining-nums leading-tight tracking-[0.04em] text-slate-100 [overflow-wrap:anywhere] sm:text-[17px]">
            {heading}
          </span>
          {sub && (
            <span className="font-sign text-[13px] font-semibold uppercase leading-tight tracking-[0.06em] text-slate-400">
              {sub}
            </span>
          )}
        </span>
      </header>
      <div className="relative flex flex-col gap-3 pt-3">{children}</div>
    </PaperSheet>
  );
}
