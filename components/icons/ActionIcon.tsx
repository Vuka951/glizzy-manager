import Icon from '@/components/icons/Icon';

export type ActionIconKind =
  | 'training'
  | 'rest'
  | 'media'
  | 'sabotage'
  | 'island'
  | 'news'
  | 'stats'
  | 'table'
  | 'calendar'
  | 'guard'
  | 'invest'
  | 'scout';

export default function ActionIcon({
  kind,
  className = 'h-7 w-7',
}: {
  kind: ActionIconKind;
  className?: string;
}) {
  if (kind === 'training') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <rect x="2" y="9" width="3" height="6" rx="1" className="fill-current" />
        <rect x="5" y="7" width="3" height="10" rx="1" className="fill-current" />
        <rect x="16" y="7" width="3" height="10" rx="1" className="fill-current" />
        <rect x="19" y="9" width="3" height="6" rx="1" className="fill-current" />
        <rect x="8" y="11" width="8" height="2" className="fill-current" />
      </svg>
    );
  }
  if (kind === 'rest') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path
          d="M20.4 14.2A8.5 8.5 0 0 1 9.8 3.6a8.5 8.5 0 1 0 10.6 10.6z"
          className="fill-current"
        />
        <path d="M14 4h4l-4 4h4" className="fill-none stroke-current" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === 'sabotage') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path d="M13 3l8 8-2.2 2.2-8-8z" className="fill-current" />
        <path d="M9.4 7.6 4 13l7 7 5.4-5.4z" className="fill-current opacity-60" />
        <path d="M4.5 19.5 3 21" className="fill-none stroke-current" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === 'island') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path d="M2 19c4-2.5 16-2.5 20 0v3H2z" className="fill-current opacity-60" />
        <path d="M11.5 17c.3-5 .7-7.5 3-10" className="fill-none stroke-current" strokeWidth="2" strokeLinecap="round" />
        <path d="M14.5 7q-3.6-1.8-6 .6 3.5-.4 6 1M14.5 7q1.2-3.1 4.3-3.1-1.9 1.6-2.2 3.6M14.5 7q3.8-.5 5.3 2.2-2.7-1.1-5.6-.3" className="fill-current" />
      </svg>
    );
  }
  if (kind === 'calendar') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <rect x="3" y="5" width="18" height="16" rx="2" className="fill-none stroke-current" strokeWidth="2" />
        <path d="M3 9h18M8 3v4M16 3v4" className="fill-none stroke-current" strokeWidth="2" strokeLinecap="round" />
        <rect x="7" y="12" width="3" height="3" className="fill-current" />
        <rect x="12" y="12" width="3" height="3" className="fill-current opacity-60" />
      </svg>
    );
  }
  if (kind === 'stats') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path
          d="M12 21S4 14.7 4 9.5C4 6.4 6.4 4 9.2 4c1.6 0 2.8 1 2.8 1s1.2-1 2.8-1C17.6 4 20 6.4 20 9.5c0 5.2-8 11.5-8 11.5z"
          className="fill-current"
        />
        <path d="M5 12h4l1.5-3 2.5 5 1.5-2h4.5" className="fill-none stroke-slate-900" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === 'table') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path d="M4 5h4v16H4zM10 9h4v12h-4zM16 12h4v9h-4z" className="fill-current" />
      </svg>
    );
  }
  if (kind === 'guard') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path d="M12 2l8 3.5V11c0 5.2-3.4 9-8 11-4.6-2-8-5.8-8-11V5.5z" className="fill-current" />
        <path d="M8.5 12l2.5 2.5 4.5-5" className="fill-none stroke-slate-900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === 'invest') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" className="fill-current" />
        <circle cx="12" cy="12" r="4" className="fill-none stroke-slate-900" strokeWidth="2" />
        <path d="M12 8v8M10 10.5h4M10 13.5h4" className="fill-none stroke-slate-900" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === 'scout') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path d="M4 9h5l1 8a3.5 3.5 0 0 1-7 0z" className="fill-current" />
        <path d="M15 9h5l-1 8a3.5 3.5 0 0 1-7 0z" className="fill-current" />
        <path d="M6 9V6a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v3M15 9V6a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v3" className="fill-none stroke-current" strokeWidth="1.6" />
        <path d="M10 12h4" className="fill-none stroke-current" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="6.5" cy="15.5" r="1.6" className="fill-slate-900" />
        <circle cx="17.5" cy="15.5" r="1.6" className="fill-slate-900" />
      </svg>
    );
  }
  if (kind === 'media') return <Icon name="tv" className={className} />;
  return <Icon name="megaphone" className={className} />;
}
