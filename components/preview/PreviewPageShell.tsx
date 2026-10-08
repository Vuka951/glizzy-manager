import type { ReactNode } from "react";
import ClientOnly from "@/components/shared/ClientOnly";

type PreviewPageShellProps = {
  eyebrow: string;
  title: string;
  note: string;
  widthClassName?: string;
  children: ReactNode;
};

export default function PreviewPageShell({
  eyebrow,
  title,
  note,
  widthClassName = "max-w-5xl",
  children,
}: PreviewPageShellProps) {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className={`mx-auto flex flex-col gap-5 ${widthClassName}`}>
        <div className="flex flex-col gap-1 text-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-sky-300">
            {eyebrow}
          </span>
          <h1 className="text-2xl font-black uppercase tracking-widest sm:text-3xl">
            {title}
          </h1>
          <p className="mx-auto max-w-xl text-xs leading-relaxed text-slate-400">
            {note}
          </p>
        </div>
        <ClientOnly>{children}</ClientOnly>
      </div>
    </div>
  );
}
