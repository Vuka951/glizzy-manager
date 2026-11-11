// A hired bodyguard in a dark suit, sunglasses and an earpiece. Same
// silhouette as the police officer and the party escort, taller so he
// stands at the walker's shoulder
export default function TownEscort({ side }: { side: 'left' | 'right' }) {
  return (
    <span
      className={`block h-full w-full origin-bottom motion-safe:animate-[fanbob_2.4s_ease-in-out_infinite] motion-lite:animate-none! ${
        side === 'right' ? '[animation-delay:-1.2s]' : ''
      }`}
    >
      <svg
        viewBox="0 0 24 48"
        className={`h-full w-full overflow-visible ${side === 'right' ? '-scale-x-100' : ''}`}
        aria-hidden="true"
      >
        <ellipse cx="12" cy="47" rx="8" ry="1.6" className="fill-black/40" />
        <rect x="8.4" y="31" width="3.2" height="15" className="fill-slate-950" />
        <rect x="12.4" y="31" width="3.2" height="15" className="fill-slate-950" />
        <rect x="7.4" y="45" width="4.4" height="2" rx="1" className="fill-black" />
        <rect x="12.2" y="45" width="4.4" height="2" rx="1" className="fill-black" />
        <path d="M6.6 16q0-2.6 2.6-2.6h5.6q2.6 0 2.6 2.6l.8 16H5.8z" className="fill-slate-900" />
        <rect x="3.8" y="15" width="3.2" height="14" rx="1.6" className="fill-slate-900" />
        <rect x="17" y="15" width="3.2" height="14" rx="1.6" className="fill-slate-900" />
        <circle cx="5.4" cy="29.4" r="1.5" className="fill-amber-200" />
        <circle cx="18.6" cy="29.4" r="1.5" className="fill-amber-200" />
        <path d="M9.8 13.4h4.4L12 20z" className="fill-slate-100" />
        <path d="M11.4 14.6h1.2l.6 5.6-1.2 1.4-1.2-1.4z" className="fill-slate-950" />
        <circle cx="12" cy="8" r="5" className="fill-amber-200" />
        <path d="M7 7.4a5 5 0 0 1 10 0V6a5 5 0 0 0-10 0z" className="fill-slate-800" />
        <rect x="8" y="7.4" width="8" height="1.9" rx="0.9" className="fill-slate-950" />
        <circle cx="16.7" cy="9.2" r="0.8" className="fill-slate-300" />
        <path
          d="M16.9 9.8q1.6 2.4.2 5"
          className="fill-none stroke-slate-300"
          strokeWidth="0.6"
        />
      </svg>
    </span>
  );
}
