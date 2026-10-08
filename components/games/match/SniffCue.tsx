import { useEffect, useState } from 'react';
import BubbleTail from '@/components/games/BubbleTail';
import NoseIcon from '@/components/icons/NoseIcon';
import { GAMES_UI } from '@/data/games/locale';

// The nose working: air gets pulled in from the table side in waves, and the
// whole bubble flinches back the way the hand is about to go
export default function SniffCue({
  tailSide,
  className = '',
}: {
  tailSide: 'left' | 'right';
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  const pullBack = tailSide === 'left' ? 'translate-x-2' : '-translate-x-2';

  return (
    <div
      className={`pointer-events-none z-30 ${className}`}
      aria-label={GAMES_UI.cup.viewer.sniffLabel}
    >
      <span
        className={`relative flex h-9 w-12 items-center justify-center rounded-full border border-lime-300/70 bg-lime-950/90 shadow-lg shadow-lime-400/20 backdrop-blur-sm transition-transform duration-500 motion-reduce:transition-none ${
          tailSide === 'left' ? 'pr-1.5' : 'pl-1.5'
        } ${mounted ? 'translate-x-0' : pullBack}`}
      >
        <BubbleTail side={tailSide} className="fill-lime-950 stroke-lime-300/70" />
        <span className="absolute inset-0 animate-ping rounded-full border-2 border-lime-300/50 motion-reduce:animate-none" />
        <span className="relative z-10 flex items-center gap-0.5">
          <NoseIcon className="h-5 w-5 animate-pulse text-lime-200 motion-reduce:animate-none" />
          {/* air being drawn in, one wisp after the other */}
          <svg
            viewBox="0 0 12 20"
            className={`h-5 w-3 ${tailSide === 'left' ? '' : '-order-1 -scale-x-100'}`}
            aria-hidden="true"
          >
            <path
              d="M2 7q3 3 0 6"
              className="animate-pulse fill-none stroke-lime-200 motion-reduce:animate-none"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d="M6 4.5q4 5.5 0 11"
              className="animate-pulse fill-none stroke-lime-300/80 [animation-delay:150ms] motion-reduce:animate-none"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d="M10 2q5 8 0 16"
              className="animate-pulse fill-none stroke-lime-300/50 [animation-delay:300ms] motion-reduce:animate-none"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </span>
    </div>
  );
}
