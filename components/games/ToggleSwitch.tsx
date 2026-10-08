export default function ToggleSwitch({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition ${
        checked
          ? 'border-amber-400/60 bg-amber-500/40'
          : 'border-sky-200/20 bg-slate-800 hover:border-sky-200/40'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full shadow transition-transform ${
          checked ? 'translate-x-6 bg-amber-200' : 'translate-x-1 bg-slate-400'
        }`}
      />
    </button>
  );
}
