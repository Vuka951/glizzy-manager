import Icon from '@/components/icons/Icon';

// One of the two mode cards on the tour's last step: the game's name, a
// one-line pitch and the play label, the whole card clickable
export default function OnboardingModeButton({
  title,
  description,
  playLabel,
  onClick,
}: {
  title: string;
  description: string;
  playLabel: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col gap-1 rounded-xl border border-frost-border/30 bg-slate-800/40 p-3 text-left transition hover:border-red-300/60 hover:bg-slate-800/70"
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-white">{title}</span>
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-red-200">
          {playLabel}
          <Icon
            name="arrowRight"
            className="h-3.5 w-3.5 transition group-hover:translate-x-0.5"
          />
        </span>
      </span>
      <span className="text-xs leading-relaxed text-slate-400">{description}</span>
    </button>
  );
}
