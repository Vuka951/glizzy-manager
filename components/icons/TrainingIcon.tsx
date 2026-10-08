import GlizzyIcon from '@/components/icons/GlizzyIcon';
import Icon from '@/components/icons/Icon';
import type { TrainingId } from '@/data/games/careerTraining';

// A visual promise of what each training changes, so the cards need no text
export default function TrainingIcon({
  id,
  className = 'h-9 w-9',
}: {
  id: TrainingId;
  className?: string;
}) {
  if (id === 'stomach') {
    return (
      <span className={`flex items-center justify-center gap-1 ${className}`}>
        <GlizzyIcon variant={0} className="h-5 w-8" />
        <svg viewBox="0 0 12 12" className="h-4 w-4" aria-hidden="true">
          <path d="M6 1l4 5H7.5v5h-3V6H2z" className="fill-emerald-400" />
        </svg>
      </span>
    );
  }
  if (id === 'sniffer') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path d="M12 3c0 6-5 8-5 13a5 5 0 0 0 10 0c0-5-5-7-5-13z" className="fill-amber-200" />
        <circle cx="10" cy="17" r="1.3" className="fill-slate-900" />
        <circle cx="14" cy="17" r="1.3" className="fill-slate-900" />
        <path d="M17 6q3 -1 4 -3M17.5 9q3 0 5 -1.5M17.5 12q2.5 1 4.5 0.5" className="fill-none stroke-sky-300" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
  if (id === 'nutrition') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path d="M20 4C10 4 4 10 4 19c9 0 15-6 16-15z" className="fill-emerald-400" />
        <path d="M6 18C9 13 13 9 18 6" className="fill-none stroke-emerald-900" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
  if (id === 'fans') return <Icon name="megaphone" className={`${className} text-sky-300`} />;
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="0.5" y="5" width="8.5" height="7" rx="3.2" className="fill-red-500" transform="rotate(-18 5 8.5)" />
      <rect x="15" y="12" width="8.5" height="7" rx="3.2" className="fill-sky-400" transform="rotate(-18 19 15.5)" />
      <path
        d="M12 5.5l1 3.1 3.1-1.1-2 2.7 2.7 2-3.3.3-.4 3.3-1.7-2.9-3 1.3 1.8-2.9-2.7-1.9 3.3-.2z"
        className="fill-amber-300"
      />
    </svg>
  );
}
