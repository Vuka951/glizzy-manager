'use client';

import { useCareerFrames } from '@/components/games/career/careerFrames';

export type CareerButtonTone = 'buy' | 'danger' | 'neutral' | 'quiet' | 'good';

// Glass: the frosted key with a coloured lip drawn as a shadow, so pressing it
// never changes the box and nothing around it moves. Street: an enamel plate
// like the town's street signs
const GLASS: Record<CareerButtonTone, string> = {
  buy: 'border-amber-400/50 [--lip:rgb(217_119_6)] bg-gradient-to-b from-amber-400/30 to-amber-500/10 text-amber-100 enabled:hover:border-amber-300/80 enabled:hover:from-amber-400/40 enabled:hover:text-white',
  danger:
    'border-red-500/50 [--lip:rgb(185_28_28)] bg-gradient-to-b from-red-500/30 to-red-500/10 text-red-100 enabled:hover:border-red-400/80 enabled:hover:from-red-500/40 enabled:hover:text-white',
  neutral:
    'border-sky-200/30 [--lip:rgb(3_105_161)] bg-gradient-to-b from-sky-400/20 to-sky-500/5 text-sky-100 enabled:hover:border-sky-200/60 enabled:hover:from-sky-400/30 enabled:hover:text-white',
  quiet:
    'border-slate-600/60 [--lip:rgb(51_65_85)] bg-slate-800/50 text-slate-300 enabled:hover:border-slate-500 enabled:hover:text-white',
  good: 'border-emerald-400/50 [--lip:rgb(4_120_87)] bg-gradient-to-b from-emerald-400/25 to-emerald-500/5 text-emerald-200 enabled:hover:border-emerald-300/80 enabled:hover:text-white',
};

const STREET: Record<CareerButtonTone, string> = {
  buy: 'border-[#ffffff] bg-[#166534] text-[#ffffff]',
  danger: 'border-[#ffffff] bg-[#b91c1c] text-[#ffffff]',
  neutral: 'border-[#ffffff] bg-[#1e40af] text-[#ffffff]',
  quiet: 'border-[#cbd5e1] bg-[#1e293b] text-[#e2e8f0]',
  good: 'border-[#ffffff] bg-[#047857] text-[#ffffff]',
};

// Street keys stand on objects, so anything but the small scene key is a full
// finger tall
const STREET_MIN_HEIGHT = {
  lg: 'min-h-11',
  md: 'min-h-11',
  sm: 'pointer-coarse:min-h-11',
} as const;

const SIZE = {
  lg: 'px-6 py-2.5 text-xs tracking-[0.2em]',
  md: 'px-4 py-2 text-[11px] tracking-[0.2em]',
  sm: 'px-2 py-0.5 text-[9px] tracking-[0.2em] sm:text-[10px]',
} as const;

// The one button the career's purchases, dialogs, scenes and cup screens end
// on, so every confirm, cancel, continue and skip reads as the same family.
// Street in the career and Rivals, glass in the Duel and the Cup
export default function CareerButton({
  children,
  tone = 'neutral',
  size = 'md',
  full = false,
  className = '',
  type = 'button',
  ...rest
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
  children: React.ReactNode;
  tone?: CareerButtonTone;
  // sm is the small key that sits on top of a running scene
  size?: keyof typeof SIZE;
  full?: boolean;
  // Placement only (margins, absolute position, flex); the look stays the
  // primitive's
  className?: string;
}) {
  const street = useCareerFrames() === 'street';
  const lip = size === 'sm' ? 2 : 3;
  const shape = street
    ? `rounded-[4px] border-2 shadow-[0_3px_0_rgba(2,6,23,0.65)] enabled:hover:brightness-110 enabled:active:translate-y-[2px] enabled:active:shadow-[0_1px_0_rgba(2,6,23,0.65)] disabled:border-[#64748b] disabled:bg-[#334155] disabled:text-[#94a3b8] disabled:shadow-none ${STREET_MIN_HEIGHT[size]} ${STREET[tone]}`
    : `border backdrop-blur-sm disabled:border-slate-700 disabled:bg-none disabled:bg-slate-800/40 disabled:text-slate-500 disabled:shadow-none ${
        lip === 3
          ? 'rounded-xl shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_3px_0_var(--lip)] enabled:active:translate-y-[2px] enabled:active:shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_1px_0_var(--lip)]'
          : 'rounded-md shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_2px_0_var(--lip)] enabled:active:translate-y-px enabled:active:shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_1px_0_var(--lip)]'
      } ${GLASS[tone]}`;
  return (
    <button
      type={type}
      {...rest}
      className={`font-black uppercase transition focus-visible:outline-2 focus-visible:outline-offset-2 ${street ? 'focus-visible:outline-[#fcd34d]' : 'focus-visible:outline-sky-300'} disabled:cursor-not-allowed ${SIZE[size]} ${full ? 'w-full' : ''} ${shape} ${className}`}
    >
      {children}
    </button>
  );
}
