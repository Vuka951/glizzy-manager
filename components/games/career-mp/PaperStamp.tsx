'use client';

// The league's red stamp: the one loud thing on the entry form
export default function PaperStamp({
  label,
  disabled = false,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-11 rotate-[-3deg] items-center rounded-sm border-[3px] border-[#b91c1c] px-5 py-1.5 font-sign text-lg font-extrabold uppercase tracking-[0.14em] text-[#b91c1c] transition enabled:hover:rotate-0 enabled:hover:bg-[#b91c1c] enabled:hover:text-[#f1e8d3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
    >
      {label}
    </button>
  );
}
