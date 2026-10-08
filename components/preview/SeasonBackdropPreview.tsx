"use client";

import SeasonBackdrop from "@/components/games/SeasonBackdrop";

const seasons = ["Zima", "Proleće", "Leto", "Jesen"];

export default function SeasonBackdropPreview() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {seasons.map((label, season) => (
        <section
          key={label}
          className="group relative aspect-video overflow-hidden rounded-3xl border border-sky-200/20 bg-slate-900 shadow-2xl"
        >
          <SeasonBackdrop season={season} />
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent px-5 pb-4 pt-14">
            <div className="flex flex-col items-start">
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-sky-200/70">
                Sezona {season + 1}
              </span>
              <h2 className="text-xl font-black uppercase tracking-widest text-white drop-shadow-lg">
                {label}
              </h2>
            </div>
            <span className="rounded-full border border-white/15 bg-slate-950/50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-slate-300 backdrop-blur-sm">
              Animirano
            </span>
          </div>
        </section>
      ))}
    </div>
  );
}
