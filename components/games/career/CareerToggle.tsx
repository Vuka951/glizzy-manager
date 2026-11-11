'use client';

import { useCareerFrames } from '@/components/games/career/careerFrames';

export type CareerToggleTone = 'sky' | 'red' | 'amber' | 'emerald';

const GLASS_ON: Record<CareerToggleTone, string> = {
  sky: 'border-sky-300/70 bg-sky-400/20 text-white ring-1 ring-sky-300/50',
  red: 'border-red-400/70 bg-red-500/20 text-white ring-1 ring-red-400/50',
  amber: 'border-amber-300/70 bg-amber-400/20 text-amber-100 ring-1 ring-amber-300/50',
  emerald: 'border-emerald-300/70 bg-emerald-400/20 text-white ring-1 ring-emerald-300/50',
};

const GLASS_OFF: Record<CareerToggleTone, string> = {
  sky: 'text-slate-300 enabled:hover:border-sky-300/50 enabled:hover:text-white',
  red: 'text-slate-300 enabled:hover:border-red-400/50 enabled:hover:text-white',
  amber: 'text-slate-300 enabled:hover:border-amber-300/50 enabled:hover:text-white',
  emerald: 'text-slate-300 enabled:hover:border-emerald-300/50 enabled:hover:text-white',
};

const STREET_ON: Record<CareerToggleTone, string> = {
  sky: 'border-[#ffffff] bg-[#1e40af] text-[#ffffff]',
  red: 'border-[#ffffff] bg-[#b91c1c] text-[#ffffff]',
  amber: 'border-[#ffffff] bg-[#a16207] text-[#ffffff]',
  emerald: 'border-[#ffffff] bg-[#047857] text-[#ffffff]',
};

const SIZE = {
  lg: 'px-4 py-3 text-base',
  md: 'px-3 py-1.5 text-xs',
  sm: 'px-2 py-0.5 text-[11px]',
} as const;

const STREET_SIZE: Record<keyof typeof SIZE, string> = {
  lg: 'px-4 py-3 text-lg',
  md: 'px-3 py-1.5 text-[14px]',
  sm: 'px-2 py-0.5 text-[13px]',
};

// A choice among several: a stake, a step, a tab, a size, a yes or a no. The
// picked one is lit in its colour; glass draws it as a frosted chip, street
// as an enamel plate. The box never changes between states
export default function CareerToggle({
  selected,
  tone = 'sky',
  size = 'md',
  className = '',
  children,
  type = 'button',
  ...rest
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
  selected: boolean;
  tone?: CareerToggleTone;
  size?: keyof typeof SIZE;
  // Layout and type only (width, flex, font family); the frame stays the
  // primitive's
  className?: string;
  children: React.ReactNode;
}) {
  const street = useCareerFrames() === 'street';
  const look = street
    ? `${STREET_SIZE[size]} rounded-[4px] border-2 font-sign pointer-coarse:min-h-11 tracking-[0.03em] shadow-[0_2px_0_rgba(2,6,23,0.6)] enabled:active:translate-y-px enabled:active:shadow-[0_1px_0_rgba(2,6,23,0.6)] disabled:border-[#475569] disabled:bg-[#1e293b] disabled:text-[#64748b] disabled:shadow-none ${
        selected
          ? STREET_ON[tone]
          : 'border-[#94a3b8] bg-[#1e293b] text-[#e2e8f0] enabled:hover:border-[#ffffff]'
      }`
    : `${SIZE[size]} rounded-lg border enabled:active:translate-y-px disabled:opacity-35 ${
        selected
          ? GLASS_ON[tone]
          : `border-sky-200/15 bg-slate-900/50 ${GLASS_OFF[tone]}`
      }`;
  return (
    <button
      type={type}
      aria-pressed={rest.role ? undefined : selected}
      {...rest}
      className={`font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 ${street ? 'focus-visible:outline-[#fcd34d]' : 'focus-visible:outline-sky-300'} disabled:cursor-not-allowed ${look} ${className}`}
    >
      {children}
    </button>
  );
}
