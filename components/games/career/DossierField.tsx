// One filled-in line of the personnel file's form
export default function DossierField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span className="flex min-w-0 flex-col border-b border-[#1c1408]/40 pb-0.5">
      <span className="truncate font-sign text-[12px] font-semibold uppercase leading-tight tracking-[0.06em] text-slate-400">
        {label}
      </span>
      <span className="font-sign text-[19px] font-bold leading-none tabular-nums text-slate-100">
        {children}
      </span>
    </span>
  );
}
