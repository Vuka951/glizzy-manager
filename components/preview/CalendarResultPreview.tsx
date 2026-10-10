import CalendarResultBadge from '@/components/games/career/CalendarResultBadge';

const RESULTS = [1, 2, 3, 4, 5, 9];

export default function CalendarResultPreview() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
      {RESULTS.map((place) => (
        <div
          key={place}
          className="flex min-h-16 flex-col items-center justify-between gap-2 rounded-xl border border-amber-400/30 bg-amber-500/5 p-2 text-center"
        >
          <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-slate-500">
            Frozen Edition
          </span>
          <CalendarResultBadge place={place} />
        </div>
      ))}
    </div>
  );
}
