'use client';

import { useEffect, useRef } from 'react';
import type { LawVerdict } from '@/lib/utils/careerLaws';

const INK: Record<LawVerdict, { dark: string; paper: string }> = {
  passed: {
    dark: 'border-emerald-400 text-emerald-300 bg-emerald-950',
    paper: 'border-emerald-700 text-emerald-700',
  },
  failed: {
    dark: 'border-red-400 text-red-300 bg-red-950',
    paper: 'border-red-700 text-red-700',
  },
  repealed: {
    dark: 'border-amber-300 text-amber-200 bg-amber-950',
    paper: 'border-amber-700 text-amber-700',
  },
};

const SIZES = {
  sm: 'border-2 px-1.5 py-px text-[12px] tracking-[0.12em] rounded-[3px]',
  md: 'border-[3px] px-2.5 py-0.5 text-[17px] tracking-[0.14em] rounded-[4px]',
  lg: 'border-4 px-4 py-1 text-4xl tracking-[0.12em] rounded-[6px] sm:px-6 sm:text-6xl',
} as const;

// The rubber stamp on a bill: the verdict in a thick tilted frame, in the
// ink of the verdict. With slam it lands on mount
export default function LawStamp({
  verdict,
  text,
  size = 'md',
  onPaper = false,
  slam = false,
  className = '',
}: {
  verdict: LawVerdict;
  text: string;
  size?: keyof typeof SIZES;
  onPaper?: boolean;
  slam?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!slam || !el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const landing = el.animate(
      [
        { transform: 'scale(3) rotate(-18deg)', opacity: 0 },
        { transform: 'scale(0.9) rotate(-9deg)', opacity: 1, offset: 0.7 },
        { transform: 'scale(1) rotate(-9deg)', opacity: 1 },
      ],
      { duration: 380, easing: 'cubic-bezier(0.5, 0, 0.75, 0)' },
    );
    return () => landing.cancel();
  }, [slam]);
  const ink = onPaper ? INK[verdict].paper : INK[verdict].dark;
  return (
    <span
      ref={ref}
      className={`inline-block rotate-[-9deg] whitespace-nowrap font-sign font-extrabold uppercase leading-tight ${
        onPaper ? 'opacity-80 mix-blend-multiply' : 'shadow-[3px_3px_0_rgb(0_0_0/0.55)]'
      } ${SIZES[size]} ${ink} ${className}`}
    >
      {text}
    </span>
  );
}
