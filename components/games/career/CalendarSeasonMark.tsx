import type { ReactNode } from 'react';

// A small round stamp on a calendar box's bottom line, so a vote or a weekend
// on the island never makes the box taller
export default function CalendarSeasonMark({
  label,
  tone,
  children,
}: {
  label: string;
  tone: string;
  children: ReactNode;
}) {
  return (
    <span
      title={label}
      aria-label={label}
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] bg-slate-950 ${tone}`}
    >
      {children}
    </span>
  );
}
