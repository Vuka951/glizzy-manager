// A rubber stamp on the roster: green ink when it lowers the price, red
// when it raises it
export default function TownGuardStamp({
  label,
  cheaper,
}: {
  label: string;
  cheaper: boolean;
}) {
  return (
    <span
      className={`-rotate-3 rounded-[3px] border-2 px-2 py-0.5 font-sign text-[13px] font-bold uppercase tabular-nums tracking-[0.06em] opacity-90 even:rotate-2 ${
        cheaper
          ? 'border-[#047857] text-[#047857]'
          : 'border-[#b91c1c] text-[#b91c1c]'
      }`}
    >
      {label}
    </span>
  );
}
