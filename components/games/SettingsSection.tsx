export default function SettingsSection({
  label,
  first = false,
  children,
}: {
  label: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-col gap-2 ${
        first ? '' : 'border-t border-sky-200/10 pt-3'
      }`}
    >
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
        {label}
      </span>
      {children}
    </div>
  );
}
