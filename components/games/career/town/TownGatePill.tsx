import TownBankScrews from '@/components/games/career/town/TownBankScrews';

export type TownGateTone = 'alarm' | 'cup' | 'plain';

// Road-sign paint: red for what needs him now, motorway green for the way to
// the cup, blue for the rest
const PAINT: Record<TownGateTone, string> = {
  alarm: 'bg-[#b91c1c]',
  cup: 'bg-[#166534]',
  plain: 'bg-[#1e40af]',
};

// A road sign at the town's edge that sends him somewhere: the paper, the
// cup, an alarm. It pulses while it is waiting for him. The lettering is the
// sign's own, so it wins over what the caller's labels ask for
export default function TownGatePill({
  tone,
  pulse = false,
  className = '',
  children,
  type = 'button',
  ...rest
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
  tone: TownGateTone;
  pulse?: boolean;
  // Size and padding only
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type={type}
      {...rest}
      className={`relative flex items-center justify-center gap-2 rounded-[6px] border-[3px] border-[#ffffff] font-sign text-[#ffffff] shadow-[0_0_0_2px_#0c1a44,0_5px_0_rgba(2,6,23,0.65)] transition enabled:hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#fde68a] disabled:pointer-events-none disabled:animate-none disabled:opacity-60 [&>span]:text-[16px]! [&>span]:font-extrabold! [&>span]:leading-none! [&>span]:tracking-[0.06em]! ${
        pulse ? 'motion-safe:animate-pulse hover:animate-none' : ''
      } ${PAINT[tone]} ${className}`}
    >
      <TownBankScrews />
      {children}
    </button>
  );
}
