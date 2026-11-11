'use client';

export type HouseRuleOption = {
  key: string;
  label: string;
  selected: boolean;
  onPick: () => void;
};

// One line of a typed form: the choices printed in a row, the picked one
// circled in red pencil. The circle is always there, only its ink changes, so
// the row never reflows
export default function HouseRuleRow({
  label,
  options,
  disabled,
}: {
  label: string;
  options: HouseRuleOption[];
  disabled: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-[#7d93a8]/35 py-1.5 sm:flex-row sm:items-center sm:gap-3">
      <span className="shrink-0 font-sign text-[14px] font-semibold uppercase tracking-[0.04em] text-slate-300 sm:w-28">
        {label}
      </span>
      <div
        role="radiogroup"
        aria-label={label}
        className="flex flex-wrap gap-x-0.5"
      >
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            role="radio"
            aria-checked={option.selected}
            disabled={disabled}
            onClick={option.onPick}
            className={`min-h-11 rounded-[50%] border-2 px-2.5 font-sign text-[15px] font-semibold tabular-nums transition focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1e3a8a] disabled:cursor-default motion-reduce:transition-none ${
              option.selected
                ? '-rotate-2 border-[#b91c1c] text-slate-100'
                : 'border-transparent text-slate-400 enabled:hover:border-[#1c1408]/30 enabled:hover:text-slate-100'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
