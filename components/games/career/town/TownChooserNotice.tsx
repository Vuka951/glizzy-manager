// A slip of paper left at a chooser door: what the room offers and its price
// or state. It goes grey on a door that is shut
export default function TownChooserNotice({
  desc,
  sub,
  dim,
}: {
  desc?: string;
  sub: string | null;
  dim: boolean;
}) {
  if (!desc && !sub) return null;
  return (
    <span
      className={`relative mt-1 flex w-full -rotate-1 flex-col gap-1 rounded-[2px] px-2 py-1.5 text-center shadow-[0_3px_0_rgba(0,0,0,0.4)] ${
        dim ? 'bg-[#b9ad93] text-[#2a2012]' : 'bg-[#f1e8d3] text-[#1c1408]'
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute -top-1.5 left-1/2 h-2.5 w-7 -translate-x-1/2 rotate-2 ${
          dim ? 'bg-[#d6c9ac]/70' : 'bg-[#fef9c3]/80'
        }`}
      />
      {desc && (
        <span className="text-[10px] font-medium leading-snug">{desc}</span>
      )}
      {sub && (
        <span className="break-words font-sign text-[13px] font-bold leading-tight tabular-nums">
          {sub}
        </span>
      )}
    </span>
  );
}
