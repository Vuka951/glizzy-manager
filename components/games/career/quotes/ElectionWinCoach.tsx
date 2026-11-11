const WINDOWS = ['left-[28px]', 'left-[44px]', 'left-[60px]', 'left-[76px]'];

// A hired coach facing left, its door at the front where the faithful step
// off. The scene drives it in by name, or leaves it parked
export default function ElectionWinCoach({
  className,
  anim,
}: {
  className: string;
  anim?: string;
}) {
  return (
    <div
      data-anim={anim}
      className={`absolute h-[42px] w-[100px] ${className}`}
    >
      <span className="absolute inset-x-0 bottom-[6px] top-0 rounded-[6px] rounded-tl-[12px] bg-gradient-to-b from-slate-200 to-slate-300 shadow-lg ring-1 ring-slate-950/60" />
      <span className="absolute inset-x-0 bottom-[14px] h-[4px] bg-red-600" />
      <span className="absolute left-[2px] top-[5px] h-[13px] w-[10px] rounded-tl-[9px] bg-sky-900 ring-1 ring-slate-950/50" />
      {WINDOWS.map((left) => (
        <span
          key={left}
          className={`absolute top-[5px] h-[13px] w-[14px] overflow-hidden rounded-[2px] bg-sky-900 ring-1 ring-slate-950/50 ${left}`}
        >
          <span className="absolute bottom-[-3px] left-[3px] h-[9px] w-[8px] rounded-full bg-slate-950/60" />
        </span>
      ))}
      <span className="absolute bottom-[8px] left-[14px] h-[24px] w-[10px] rounded-[1px] bg-slate-950/80 ring-1 ring-slate-400" />
      <span className="absolute bottom-[10px] left-[1px] h-[3px] w-[4px] rounded-full bg-amber-100 shadow-[0_0_8px_rgba(254,243,199,0.9)]" />
      <span className="absolute bottom-0 left-[26px] h-[13px] w-[13px] rounded-full bg-slate-900 ring-2 ring-slate-600" />
      <span className="absolute bottom-0 left-[74px] h-[13px] w-[13px] rounded-full bg-slate-900 ring-2 ring-slate-600" />
    </div>
  );
}
