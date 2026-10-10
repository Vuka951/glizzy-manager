import type { ReactNode } from "react";

export default function PreviewCase({
  label,
  note,
  children,
}: {
  label: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <div className="flex w-[26rem] max-w-full flex-col items-center gap-3">
      <span className="rounded-full border border-sky-200/20 bg-slate-950/70 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-sky-200">
        {label}
      </span>
      <p className="max-w-xs text-center text-[11px] leading-relaxed text-slate-400">
        {note}
      </p>
      {children}
    </div>
  );
}
