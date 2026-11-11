import TownBankScrews from '@/components/games/career/town/TownBankScrews';

// The walnut board every career screen hangs on: a sawn frame and brass
// corners. Size and placement come from the caller
export default function StreetBoard({
  className = '',
  dialogLabel,
  ref,
  children,
}: {
  className?: string;
  // Makes the board a modal dialog of that name, focusable from code
  dialogLabel?: string;
  ref?: React.Ref<HTMLDivElement>;
  children: React.ReactNode;
}) {
  return (
    <div
      ref={ref}
      {...(dialogLabel
        ? {
            'data-street-dialog': true,
            role: 'dialog',
            'aria-modal': true,
            'aria-label': dialogLabel,
            tabIndex: -1,
          }
        : {})}
      className={`relative rounded-[9px] outline-none bg-[#40291a] bg-[repeating-linear-gradient(94deg,transparent_0_17px,rgb(0_0_0/0.1)_17px_19px,transparent_19px_31px,rgb(255_255_255/0.025)_31px_32px)] p-1.5 text-slate-300 shadow-[inset_0_1px_0_rgb(255_255_255/0.14),inset_0_-2px_0_rgb(0_0_0/0.45),0_0_0_1px_#160c05,0_26px_50px_-14px_rgb(0_0_0/0.9)] sm:p-2 ${className}`}
    >
      <TownBankScrews brass />
      {children}
    </div>
  );
}
