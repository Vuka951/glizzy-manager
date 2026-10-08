import InfoIcon from '@/components/icons/InfoIcon';

export default function InfoButton({
  label,
  onClick,
  className = '',
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`rounded-full border border-sky-200/15 bg-slate-800/60 p-1 text-slate-400 transition hover:border-sky-200/40 hover:text-white ${className}`}
    >
      <InfoIcon className="h-3 w-3" />
    </button>
  );
}
