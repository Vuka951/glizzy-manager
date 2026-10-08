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

// The receipt for the last off-season action: it waits until the next one
// lands, the timer runs out, or the player waves it away
export default function ActionReceipt({
  toast,
  onDismiss,
}: {
  toast: ActionReceiptToast;
  onDismiss: () => void;
}) {
  return (
    <div
      className={`flex max-w-72 items-start gap-2.5 rounded-2xl border bg-slate-950/90 py-2.5 pl-3.5 pr-2 shadow-xl backdrop-blur-sm xl:max-w-80 xl:gap-3 xl:py-3 xl:pl-4 ${
        toast.ok ? 'border-sky-200/25' : 'border-red-500/50'
      }`}
    >
      <ActionIcon
        kind={toast.icon}
        className={`mt-0.5 h-5 w-5 shrink-0 xl:h-6 xl:w-6 ${
          toast.ok ? 'text-sky-300' : 'text-red-400'
        }`}
      />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span
          className={`text-[11px] font-bold xl:text-xs ${
            toast.ok ? 'text-slate-100' : 'text-red-200'
          }`}
        >
          {toast.title}
        </span>
        {toast.lines.length > 0 && (
          <span className="flex flex-wrap gap-1">
            {toast.lines.map((line, i) => (
              <span
                key={i}
                className={`rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold xl:text-[10px] ${
                  line.good
                    ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300'
                    : 'border-red-500/40 bg-red-500/10 text-red-300'
                }`}
              >
                {line.text}
              </span>
            ))}
          </span>
        )}
      </span>
      <button
        onClick={onDismiss}
        title={A.close}
        aria-label={A.close}
        className="-mt-0.5 shrink-0 rounded-full border border-sky-200/15 p-1 text-slate-500 transition hover:border-sky-200/40 hover:text-white"
      >
        <Icon name="close" className="h-3 w-3 xl:h-3.5 xl:w-3.5" />
      </button>
    </div>
  );
}
