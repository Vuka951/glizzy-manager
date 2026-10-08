import type { ReactNode } from 'react';
import Link from 'next/link';
import Icon from '@/components/icons/Icon';

export default function GameCard({
  href,
  art,
  mode,
  title,
  playLabel,
}: {
  href: string;
  art: ReactNode;
  mode: string;
  title: string;
  playLabel: string;
}) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col gap-5 overflow-hidden rounded-3xl border border-frost-border/40 bg-gradient-to-br from-card-strong/60 via-card-deep/80 to-card-strong/60 text-left shadow-2xl transition duration-300 hover:-translate-y-0.5 hover:border-frost-border/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
    >
      <div className="relative border-b border-frost-border/20 bg-slate-950/60 transition duration-300 group-hover:brightness-110">
        {art}
        <p className="absolute left-4 top-3 rounded-full border border-sky-200/15 bg-slate-950/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300 backdrop-blur-sm">
          {mode}
        </p>
      </div>

      <h2 className="px-6 text-xl font-bold text-white sm:px-7">{title}</h2>

      <span className="mb-6 mt-auto ml-6 inline-flex items-center gap-1.5 self-start rounded-full border border-red-300/40 bg-red-400/10 px-4 py-2 text-sm font-bold text-red-200 transition group-hover:border-red-300/70 group-hover:bg-red-400/20 sm:mb-7 sm:ml-7">
        {playLabel}
        <Icon
          name="arrowRight"
          className="h-4 w-4 transition group-hover:translate-x-0.5"
        />
      </span>
    </Link>
  );
}
