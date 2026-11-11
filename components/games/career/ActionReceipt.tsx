import CareerIconButton from '@/components/games/career/CareerIconButton';
import PaperSheet from '@/components/games/career/street/PaperSheet';
import ActionIcon, { type ActionIconKind } from '@/components/icons/ActionIcon';
import Icon from '@/components/icons/Icon';
import { GAMES_UI } from '@/data/games/locale';

const A = GAMES_UI.career.actions;

export type ActionReceiptToast = {
  title: string;
  lines: { text: string; good: boolean }[];
  icon: ActionIconKind;
  ok: boolean;
};

// The receipt for the last off-season action as a carbon slip torn off the
// pad: the action's glyph stamped in ink, what happened and the deltas in one
// tight row. It waits until the next one lands, the timer runs out, or the
// player waves it away. Without onDismiss it is a slip in the window's log,
// full width and never cut short
export default function ActionReceipt({
  toast,
  onDismiss,
}: {
  toast: ActionReceiptToast;
  onDismiss?: () => void;
}) {
  const row = !onDismiss;
  return (
    <PaperSheet
      className={`flex items-center gap-2 py-1.5 pl-1.5 text-left ${
        row ? 'w-full pr-2.5' : 'mx-auto w-fit max-w-full pr-1.5'
      }`}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[3px] border-[1.5px] ${
          toast.ok
            ? 'border-slate-300 text-slate-200'
            : 'border-red-400 text-red-400'
        }`}
      >
        <ActionIcon kind={toast.icon} className="h-4 w-4" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          title={row ? undefined : toast.title}
          className={`font-serif text-[12px] font-bold leading-tight ${row ? '' : 'line-clamp-2'} ${
            toast.ok ? 'text-slate-100' : 'text-red-300'
          }`}
        >
          {toast.title}
        </span>
        {toast.lines.length > 0 && (
          <span className="flex flex-wrap gap-x-2 font-sign text-[12px] font-bold leading-tight tabular-nums">
            {toast.lines.map((line, i) => (
              <span
                key={i}
                className={line.good ? 'text-emerald-300' : 'text-red-300'}
              >
                {line.text}
              </span>
            ))}
          </span>
        )}
      </span>
      {onDismiss && (
        <CareerIconButton label={A.close} size="sm" onClick={onDismiss}>
          <Icon name="close" className="h-3 w-3" />
        </CareerIconButton>
      )}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 -bottom-1 h-2 bg-[linear-gradient(135deg,#f1e8d3_50%,transparent_50%),linear-gradient(225deg,#f1e8d3_50%,transparent_50%)] bg-size-[8px_8px]"
      />
    </PaperSheet>
  );
}
