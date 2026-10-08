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
      className="inline-flex rotate-[-3deg] items-center rounded-sm border-[3px] border-red-700 px-5 py-2 text-sm font-black uppercase tracking-[0.2em] text-red-700 shadow-[0_0_0_2px_rgba(185,28,28,0.15)] transition enabled:hover:rotate-0 enabled:hover:bg-red-700 enabled:hover:text-amber-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-not-allowed disabled:opacity-35"
    >
      {label}
    </button>
  );
}
