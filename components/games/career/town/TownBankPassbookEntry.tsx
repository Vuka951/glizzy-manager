// One line entered in the passbook: the label, a dotted leader and the
// figure at the right margin
export default function TownBankPassbookEntry({
  label,
  value,
  note,
  tone = 'text-[#1c1917]',
}: {
  label: string;
  value: string | number;
  note?: string;
  tone?: string;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-sign text-[13px] font-semibold uppercase tracking-[0.06em] text-[#57534e]">
        {label}
      </span>
      {note && (
        <span className="font-sign text-[12px] tabular-nums text-[#57534e]">{note}</span>
      )}
      <span className="mb-[3px] min-w-4 flex-1 border-b border-dotted border-[#1c1917]/35" />
      <span className={`font-sign text-[16px] font-bold tabular-nums ${tone}`}>
        {value}
      </span>
    </div>
  );
}
