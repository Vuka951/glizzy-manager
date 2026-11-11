import ActionIcon, { type ActionIconKind } from '@/components/icons/ActionIcon';
import Icon from '@/components/icons/Icon';
import type { IconName } from '@/lib/constants/icons';

// A section of the paper report: a heavy rule, the title in small caps, an
// optional glyph, and room on the right for the controls that belong to it
export default function PaperSection({
  title,
  icon,
  action,
  aside,
  children,
}: {
  title: string;
  icon?: IconName;
  action?: ActionIconKind;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex w-full flex-col gap-3 border-t-2 border-slate-900 pt-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 font-sign text-[14px] font-bold uppercase tracking-[0.08em] text-slate-700">
          {icon && <Icon name={icon} className="h-3.5 w-3.5 text-red-800" />}
          {action && (
            <ActionIcon kind={action} className="h-3.5 w-3.5 text-red-800" />
          )}
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}
