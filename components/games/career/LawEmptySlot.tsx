// A free place on the books, drawn as a blank article of the gazette so the
// page reads as five paragraphs whether two are taken or none
export default function LawEmptySlot({
  label,
  className = '',
}: {
  label: string;
  className?: string;
}) {
  return (
    <li
      className={`flex min-h-20 flex-col gap-2 border-b border-slate-500 px-1 py-3 @3xl:px-3 ${className}`}
    >
      <span className="font-serif text-[12px] font-black text-slate-500">
        {label}
      </span>
      <span aria-hidden="true" className="flex flex-col gap-2">
        <span className="h-px w-full bg-slate-700" />
        <span className="h-px w-5/6 bg-slate-700" />
        <span className="h-px w-2/3 bg-slate-700" />
      </span>
    </li>
  );
}
