import SeasonBackdrop from '@/components/games/SeasonBackdrop';

// The stage every action cutscene plays on: a fixed-height letterbox with
// either the outdoor season sky or an indoor gradient behind the actors
export default function SceneFrame({
  season,
  indoor,
  floor = 'bg-slate-800',
  className = '',
  children,
}: {
  season?: number;
  indoor?: string;
  floor?: string | null;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative h-56 w-full overflow-hidden bg-slate-900 sm:h-64 ${className}`}
    >
      {season !== undefined && <SeasonBackdrop season={season} />}
      {indoor && <div className={`absolute inset-0 ${indoor}`} />}
      {floor && (
        <div
          className={`absolute inset-x-0 bottom-0 h-[18%] ${floor} shadow-[0_-8px_24px_rgba(2,6,23,0.6)]`}
        />
      )}
      {children}
    </div>
  );
}
