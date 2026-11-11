// The citizen's midnight milk, placed and sized by the caller
export default function ElectionWinMilkCarton({
  className = '',
}: {
  className?: string;
}) {
  return (
    <span
      className={`absolute h-[20px] w-[12px] bg-slate-50 ring-1 ring-slate-950/40 [clip-path:polygon(0_24%,50%_0,100%_24%,100%_100%,0_100%)] ${className}`}
    >
      <span className="absolute inset-x-0 top-[9px] h-[5px] bg-sky-500" />
    </span>
  );
}
