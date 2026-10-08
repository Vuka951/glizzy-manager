import Link from "next/link";
import { previewPages } from "@/components/preview/previewPages";

export default function PreviewIndex() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {previewPages.map(({ href, title, note }) => (
        <Link
          key={href}
          href={href}
          className="flex flex-col gap-2 rounded-3xl border border-sky-200/15 bg-slate-900/40 p-5 transition hover:border-sky-200/40 hover:bg-slate-900/70"
        >
          <span className="text-[9px] font-bold uppercase tracking-widest text-sky-400">
            {href}
          </span>
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <p className="text-xs leading-relaxed text-slate-400">{note}</p>
        </Link>
      ))}
    </div>
  );
}
