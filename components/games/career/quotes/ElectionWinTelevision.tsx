// A wall-mounted set in the dark: the bezel, a dead screen and whatever the
// caller tunes in on top of it
export default function ElectionWinTelevision({
  className,
  children,
}: {
  className: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`absolute rounded-[3px] bg-slate-800 shadow-[0_4px_10px_rgba(2,6,23,0.7)] ring-1 ring-slate-950 ${className}`}
    >
      <div className="absolute inset-[3px] overflow-hidden rounded-[1px] bg-gradient-to-br from-slate-900 to-slate-950">
        <span className="absolute -left-2 top-0 h-full w-4 rotate-12 bg-slate-50/5" />
        {children}
      </div>
      <span className="absolute bottom-[1px] right-[3px] h-[1px] w-[2px] rounded-full bg-red-500/70" />
    </div>
  );
}
