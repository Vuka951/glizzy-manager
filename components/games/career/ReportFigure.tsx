import Icon from '@/components/icons/Icon';
import type { IconName } from '@/lib/constants/icons';

// One figure in the front-page box score of a final report
export default function ReportFigure({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: IconName;
  children: React.ReactNode;
}) {
  return (
    <span className="flex min-w-0 flex-col items-center gap-0.5 px-2 py-2 text-center">
      <span className="truncate font-sign text-[13px] font-semibold uppercase tracking-[0.07em] text-slate-500">
        {label}
      </span>
      <span className="flex min-w-0 items-center justify-center gap-1.5 font-sign text-[28px] font-bold leading-none tabular-nums text-slate-900">
        {icon && (
          <Icon name={icon} className="h-4 w-4 shrink-0 text-slate-500" />
        )}
        {children}
      </span>
    </span>
  );
}
