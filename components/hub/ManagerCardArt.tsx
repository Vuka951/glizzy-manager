import CardCoach from '@/components/hub/CardCoach';

// The Manager card banner: one coach alone at the table under two
// spotlights, the season's cup on one side and the next glizzy on the other
export default function ManagerCardArt() {
  return (
    <svg viewBox="0 0 320 140" className="h-auto w-full" aria-hidden="true" focusable="false">
      <rect width="320" height="140" className="fill-slate-800" />
      <path d="M70 0 20 104h120Z" className="fill-sky-200/10" />
      <path d="M250 0l50 104H180Z" className="fill-sky-200/10" />
      <path d="M0 14q160 26 320 0" className="fill-none stroke-slate-600" strokeWidth="2" />
      <path d="M34 18l6 13 6-12Z" className="fill-red-500" />
      <path d="M74 22l6 13 6-12Z" className="fill-sky-400" />
      <path d="M114 25l6 13 6-12Z" className="fill-amber-200" />
      <path d="M194 25l6 13 6-12Z" className="fill-red-500" />
      <path d="M234 22l6 13 6-12Z" className="fill-sky-400" />
      <path d="M274 18l6 13 6-12Z" className="fill-amber-200" />
      <rect y="104" width="320" height="36" className="fill-slate-900" />
      <CardCoach x={160} y={108} jersey="fill-red-500" scale={1.15} />
      <rect x="56" y="96" width="208" height="12" rx="3" className="fill-amber-700" />
      <rect x="62" y="108" width="196" height="24" className="fill-amber-800" />
      <path d="M62 114h196" className="stroke-amber-900" strokeWidth="2" />
      <circle cx="131" cy="100" r="7" className="fill-amber-200" />
      <circle cx="189" cy="100" r="7" className="fill-amber-200" />
      <ellipse cx="96" cy="94" rx="26" ry="6" className="fill-stone-100" />
      <path d="M80 91h32" className="stroke-amber-500" strokeWidth="9" strokeLinecap="round" />
      <path d="M76 89.5h40" className="stroke-red-500" strokeWidth="5" strokeLinecap="round" />
      <path d="M82 90l4-2.5 4 2.5 4-2.5 4 2.5 4-2.5 4 2.5" className="fill-none stroke-amber-100" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="216" y="91" width="28" height="5" rx="1.5" className="fill-amber-500" />
      <rect x="226" y="82" width="8" height="9" className="fill-amber-400" />
      <path d="M215 52h30v14a15 15 0 0 1-30 0Z" className="fill-amber-300" />
      <path d="M215 57h-5a7 7 0 0 0 6 11M245 57h5a7 7 0 0 1-6 11" className="fill-none stroke-amber-300" strokeWidth="3.5" strokeLinecap="round" />
      <path d="m230 60 2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7Z" className="fill-amber-600" />
    </svg>
  );
}
