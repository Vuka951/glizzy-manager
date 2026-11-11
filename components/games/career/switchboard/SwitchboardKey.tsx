// A bakelite station key, the row of them on an old radio: only one stays
// pressed in, showing its cream face
export default function SwitchboardKey({
  pressed = false,
  className = '',
  children,
  type = 'button',
  ...rest
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
  pressed?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type={type}
      {...rest}
      className={`flex min-h-11 items-center justify-center rounded-[3px] px-2 font-sign text-[14px] font-bold leading-none tracking-[0.03em] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0dca8] motion-reduce:transition-none ${
        pressed
          ? 'translate-y-0.5 bg-gradient-to-b from-[#d9cbaa] to-[#f3ead4] text-[#2a1a0a] shadow-[inset_0_2px_3px_rgb(0_0_0/0.45)]'
          : 'bg-gradient-to-b from-[#463625] to-[#21170e] text-[#efe4cc] shadow-[inset_0_1px_0_rgb(255_255_255/0.22),0_2px_0_#050302] hover:from-[#54412d] active:translate-y-0.5 active:shadow-[inset_0_1px_0_rgb(255_255_255/0.1)]'
      } ${className}`}
    >
      {children}
    </button>
  );
}
