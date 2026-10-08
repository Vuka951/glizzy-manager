export default function MailboxIcon({
  className = 'h-7 w-8',
  flag = false,
}: {
  className?: string;
  flag?: boolean;
}) {
  return (
    <svg viewBox="0 0 32 28" className={className} aria-hidden="true" focusable="false">
      <rect x="3" y="8" width="22" height="14" rx="7" className="fill-red-800" />
      <rect x="3" y="8" width="22" height="14" rx="7" className="fill-none stroke-red-950" strokeWidth="1.5" />
      <path d="M14 8h11a7 7 0 0 1 7 7v7H21v-7a7 7 0 0 0-7-7z" className="fill-red-700" />
      <rect x="24" y="12" width="5" height="3" rx="1" className="fill-amber-200" />
      <rect x="8" y="24" width="3" height="4" className="fill-slate-600" />
      {flag && (
        <path d="M6 2v7M6 2h5l-1.5 1.75L11 5.5H6" className="fill-amber-400 stroke-amber-400" strokeWidth="1.4" strokeLinejoin="round" />
      )}
    </svg>
  );
}
