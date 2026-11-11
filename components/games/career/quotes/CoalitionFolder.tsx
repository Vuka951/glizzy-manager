// The open leather folder a signing ceremony puts in front of a man, its
// page waiting for the ink. Signatures and seals go in as children
export default function CoalitionFolder({
  className = '',
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <span
      className={`absolute block rounded-[3px] bg-red-950 p-[2px] shadow-md ring-1 ring-slate-950/60 ${className}`}
    >
      <span className="relative block h-full w-full rounded-[1px] bg-slate-50">
        <span className="absolute inset-y-0 left-1/2 w-px bg-slate-300" />
        <span className="absolute left-[10%] right-[56%] top-[25%] h-px bg-slate-400" />
        <span className="absolute left-[10%] right-[56%] top-[50%] h-px bg-slate-400" />
        <span className="absolute left-[10%] right-[60%] top-[75%] h-px bg-slate-400" />
        {children}
      </span>
    </span>
  );
}
