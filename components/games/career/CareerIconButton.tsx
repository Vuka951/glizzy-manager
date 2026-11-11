'use client';

import { useCareerFrames } from '@/components/games/career/careerFrames';

const SIZE = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-9 w-9',
} as const;

// Street keys are drawn small on the plate, but the finger gets 44px. The
// insets count from inside the plate's 2px border
const HIT_AREA = {
  sm: 'before:-inset-3',
  md: 'before:-inset-2',
  lg: 'before:-inset-1.5',
} as const;

// A small square of a control holding one glyph: close, info, the table, the
// tape, a stepper's minus and plus. Glass is a frosted round key, street a
// small enamel plate; `active` lights it while what it opens is open
export default function CareerIconButton({
  label,
  size = 'md',
  active = false,
  className = '',
  children,
  type = 'button',
  ...rest
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
  label: string;
  size?: keyof typeof SIZE;
  active?: boolean;
  // Placement only
  className?: string;
  children: React.ReactNode;
}) {
  const street = useCareerFrames() === 'street';
  const look = street
    ? `${/\b(absolute|fixed|sticky)\b/.test(className) ? '' : 'relative'} rounded-[4px] border-2 shadow-[0_2px_0_rgba(2,6,23,0.6)] before:absolute before:content-[''] ${HIT_AREA[size]} enabled:active:translate-y-px enabled:active:shadow-[0_1px_0_rgba(2,6,23,0.6)] disabled:border-[#475569] disabled:text-[#64748b] disabled:shadow-none ${
        active
          ? 'border-[#ffffff] bg-[#b91c1c] text-[#ffffff]'
          : 'border-[#cbd5e1] bg-[#1e3a8a] text-[#ffffff] enabled:hover:border-[#ffffff]'
      }`
    : `rounded-full border shadow-[inset_0_1px_0_rgb(255_255_255/0.06)] backdrop-blur-sm enabled:active:translate-y-px disabled:opacity-30 ${
        active
          ? 'border-red-400/70 bg-red-500/20 text-red-200'
          : 'border-frost-border/20 bg-slate-950/70 text-slate-300 enabled:hover:border-frost-border/50 enabled:hover:text-white'
      }`;
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      {...rest}
      className={`flex shrink-0 items-center justify-center transition focus-visible:outline-2 focus-visible:outline-offset-2 ${street ? 'focus-visible:outline-[#fcd34d]' : 'focus-visible:outline-sky-300'} disabled:cursor-not-allowed ${SIZE[size]} ${look} ${className}`}
    >
      {children}
    </button>
  );
}
