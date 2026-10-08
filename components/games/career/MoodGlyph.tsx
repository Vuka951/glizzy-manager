import type { CareerMoodSvg } from '@/lib/utils/careerMood';

export default function MoodGlyph({
  name,
  className,
}: {
  name: CareerMoodSvg;
  className: string;
}) {
  if (name === 'conflicted') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <circle cx="12" cy="12" r="9.5" className="fill-amber-200 stroke-slate-800" strokeWidth="1.4" />
        <path d="M12 2.5a9.5 9.5 0 0 0 0 19Z" className="fill-sky-200" />
        <path d="M8 9.5h2M14 9.5h2" className="stroke-slate-800" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M7.5 15q2-2 4 0t4 0" className="fill-none stroke-slate-800" strokeWidth="1.5" strokeLinecap="round" />
        <path d="m5.5 5.5 2-1.2M16.5 4.3l2 1.2" className="stroke-slate-800" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="11.5" cy="12" r="9.2" className="fill-violet-200 stroke-slate-800" strokeWidth="1.4" />
      <path d="M6.5 9c1.5-2.5 4 0 2 1.5-1.5 1-2.5-1-1-2m7 0c1.5-2.5 4 0 2 1.5-1.5 1-2.5-1-1-2" className="fill-none stroke-violet-800" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M7.5 16q2-2 4 0t4 0" className="fill-none stroke-slate-800" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M19 5.5c2 2.2 2.5 4 .6 5.5-2.3-1.2-2.3-3.2-.6-5.5Z" className="fill-sky-400 stroke-sky-700" strokeWidth="0.8" />
      <path d="m5 5-2-1m17 10 2 1M5 19l-2 1" className="stroke-red-500" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}
