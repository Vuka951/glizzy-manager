import type { ReactNode } from 'react';

export default function PageIntro({
  mark,
  eyebrow,
  title,
  intro,
  noteTitle,
  note,
}: {
  mark?: ReactNode;
  eyebrow: string;
  title: string;
  intro?: string;
  noteTitle?: string;
  note?: string;
}) {
  return (
    <section className="flex flex-col items-center gap-4 pt-4 text-center">
      {mark}
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-sky-400">
        {eyebrow}
      </p>
      <h1 className="bg-gradient-to-r from-red-200 via-white to-green-200 bg-clip-text text-4xl font-bold text-transparent drop-shadow-sm sm:text-5xl">
        {title}
      </h1>
      {intro ? (
        <p className="max-w-lg text-sm leading-relaxed text-slate-400">{intro}</p>
      ) : null}
      {note ? (
        <aside className="mt-2 max-w-xl rounded-3xl border border-frost-border/30 bg-slate-900/60 px-5 py-4 text-left">
          {noteTitle ? (
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
              {noteTitle}
            </p>
          ) : null}
          <p className="mt-1 text-sm leading-relaxed text-slate-300">{note}</p>
        </aside>
      ) : null}
    </section>
  );
}
