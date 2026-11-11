import SwitchboardKey from '@/components/games/career/switchboard/SwitchboardKey';
import { useCareerFrames } from '@/components/games/career/careerFrames';

export default function ChoiceChip({
  active,
  label,
  onClick,
  className = '',
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  const street = useCareerFrames() === 'street';
  if (street) {
    return (
      <SwitchboardKey pressed={active} aria-pressed={active} onClick={onClick}>
        {label}
      </SwitchboardKey>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold transition ${
        active
          ? 'border-amber-400/60 bg-amber-500/20 text-amber-200'
          : 'border-sky-200/15 bg-slate-800/50 text-slate-400 hover:border-sky-200/40 hover:text-slate-200'
      } ${className}`}
    >
      {label}
    </button>
  );
}
