// A small engraved brass plate: the heading of a section on a board
export default function BrassPlate({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[3px] bg-gradient-to-b from-[#e8c066] to-[#a8782a] px-2 py-0.5 font-sign text-[13px] font-bold uppercase leading-tight tracking-[0.08em] text-[#2a1a0a] shadow-[inset_0_1px_0_rgb(255_255_255/0.45),0_1px_0_rgb(0_0_0/0.6)] ${className}`}
    >
      {children}
    </span>
  );
}
