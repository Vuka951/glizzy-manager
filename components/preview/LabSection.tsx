export default function LabSection({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-3xl border border-sky-200/15 bg-slate-900/50 p-4 sm:p-5">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-sm font-black uppercase tracking-widest text-sky-200">
          {title}
        </h2>
        {note && <p className="text-xs text-slate-400">{note}</p>}
      </div>
      {children}
    </section>
  );
}
