import type { ReactNode } from 'react';

type PreviewSectionProps = {
  title: string;
  note?: string;
  children: ReactNode;
};

export default function PreviewSection({
  title,
  note,
  children,
}: PreviewSectionProps) {
  return (
    <section className="flex flex-col gap-3 rounded-3xl border border-frost-border/40 bg-slate-900/70 p-4 sm:p-5">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-sky-200">
          {title}
        </h2>
        {note && <p className="text-xs text-slate-400">{note}</p>}
      </div>
      {children}
    </section>
  );
}
