const GLIZZY_VARIANTS = [
  <g key="classic">
    <path d="M9 21 Q32 38 55 21" className="fill-none stroke-amber-500" strokeWidth="13" strokeLinecap="round" />
    <path d="M7 16 Q32 31 57 16" className="fill-none stroke-red-400" strokeWidth="10.5" strokeLinecap="round" />
    <path d="M13 16 q4 5 8 1.5 t8 1.5 t8 1.5 t8 1.5" className="fill-none stroke-yellow-400" strokeWidth="2.5" strokeLinecap="round" />
  </g>,
  <g key="golden">
    <path d="M7 16 Q32 33 57 16" className="fill-none stroke-yellow-400/30" strokeWidth="17" strokeLinecap="round" />
    <path d="M9 21 Q32 38 55 21" className="fill-none stroke-amber-400" strokeWidth="13" strokeLinecap="round" />
    <path d="M7 16 Q32 31 57 16" className="fill-none stroke-amber-300" strokeWidth="10.5" strokeLinecap="round" />
    <path d="M10 6 l1.4 3 l3 1.4 l-3 1.4 l-1.4 3 l-1.4 -3 l-3 -1.4 l3 -1.4 Z" className="fill-yellow-400" />
    <path d="M52 4 l1.2 2.6 l2.6 1.2 l-2.6 1.2 l-1.2 2.6 l-1.2 -2.6 l-2.6 -1.2 l2.6 -1.2 Z" className="fill-yellow-400" />
    <circle cx="32" cy="8" r="1.5" className="fill-yellow-400" />
  </g>,
  <g key="spicy">
    <path d="M9 21 Q32 38 55 21" className="fill-none stroke-amber-600" strokeWidth="13" strokeLinecap="round" />
    <path d="M7 16 Q32 31 57 16" className="fill-none stroke-red-400" strokeWidth="10.5" strokeLinecap="round" />
    <path d="M13 16 q4 5 8 1.5 t8 1.5 t8 1.5 t8 1.5" className="fill-none stroke-green-400" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M15 12 h4 M27 15 h4 M41 14 h4" className="stroke-red-300" strokeWidth="2" strokeLinecap="round" />
  </g>,
  <g key="mystic">
    <path d="M7 16 Q32 33 57 16" className="fill-none stroke-cyan-200/30" strokeWidth="17" strokeLinecap="round" />
    <path d="M9 21 Q32 38 55 21" className="fill-none stroke-amber-500" strokeWidth="13" strokeLinecap="round" />
    <path d="M7 16 Q32 31 57 16" className="fill-none stroke-purple-500" strokeWidth="10.5" strokeLinecap="round" />
    <path d="M13 16 q4 5 8 1.5 t8 1.5 t8 1.5 t8 1.5" className="fill-none stroke-cyan-200" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 5 l1.3 2.8 l2.8 1.3 l-2.8 1.3 l-1.3 2.8 l-1.3 -2.8 l-2.8 -1.3 l2.8 -1.3 Z" className="fill-cyan-200" />
    <circle cx="50" cy="6" r="1.6" className="fill-cyan-200" />
  </g>,
];

export default function GlizzyIcon({
  variant = 0,
  className = 'h-8 w-12',
}: {
  variant?: number;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 64 40" className={className} aria-hidden="true" focusable="false">
      {GLIZZY_VARIANTS[variant % GLIZZY_VARIANTS.length]}
    </svg>
  );
}
