
export type CareerChipTone = 'plain' | 'alarm';

// A HUD chip that opens something, the calendar, the coach, an alarm: a small
// enamel plate bolted on at its two top corners. Size and padding come from
// the caller; the paint and the lettering are the plate's own, so they win
// over the caller's. The inner wrapper reprints any sky ink as brass cream
export default function CareerChip({
  tone = 'plain',
  className = '',
  children,
  type = 'button',
  ...rest
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
  tone?: CareerChipTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type={type}
      {...rest}
      className={`relative rounded-[4px] border-2 shadow-[0_2px_0_rgba(2,6,23,0.6)] transition before:absolute before:left-[2px] before:top-[2px] before:size-[3px] before:rounded-full before:bg-[#cbd5e1] after:absolute after:right-[2px] after:top-[2px] after:size-[3px] after:rounded-full after:bg-[#cbd5e1] enabled:active:translate-y-px enabled:active:shadow-[0_1px_0_rgba(2,6,23,0.6)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fde68a] ${
        tone === 'alarm'
          ? 'border-[#ffffff] bg-[#b91c1c] enabled:hover:border-[#fde68a]'
          : 'border-[#e2e8f0] bg-[#1e3a8a] enabled:hover:border-[#fde68a]'
      } ${className} font-sign! text-[14px]! font-bold! leading-none! tracking-[0.07em]! text-[#ffffff]!`}
    >
      <span aria-hidden="true" className="absolute -inset-x-2 -inset-y-3" />
      <span className="contents [--color-sky-300:#fde9b0]">{children}</span>
    </button>
  );
}
