export default function PoliceOfficer({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 40"
      className={`h-9 w-auto ${flip ? '-scale-x-100' : ''}`}
      aria-hidden="true"
    >
      <rect x="7" y="14" width="10" height="16" rx="3" className="fill-blue-900" />
      <circle cx="12" cy="9" r="5" className="fill-amber-200" />
      <path d="M6 7.5h12l-1.6-4H7.6z" className="fill-blue-950" />
      <rect x="5.4" y="7" width="13.2" height="1.8" rx="0.9" className="fill-blue-950" />
      <rect x="9" y="30" width="2.6" height="8" className="fill-slate-800" />
      <rect x="12.4" y="30" width="2.6" height="8" className="fill-slate-800" />
      <rect x="4.5" y="16" width="3" height="9" rx="1.5" className="fill-blue-900" />
      <rect x="16.5" y="16" width="3" height="9" rx="1.5" className="fill-blue-900" />
      <circle cx="12" cy="18" r="1.2" className="fill-amber-300" />
    </svg>
  );
}
