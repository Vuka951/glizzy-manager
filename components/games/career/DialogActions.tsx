import BuyButton from '@/components/games/career/BuyButton';
import { GAMES_UI } from '@/data/games/locale';

const A = GAMES_UI.career.actions;

// The footer every configured purchase ends on: back out, or pay
export default function DialogActions({
  left,
  confirmLabel,
  confirmTone = 'buy',
  confirmDisabled = false,
  onConfirm,
  onCancel,
}: {
  left?: React.ReactNode;
  confirmLabel: string;
  confirmTone?: 'buy' | 'danger' | 'neutral';
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {left && <span className="mr-auto min-w-0">{left}</span>}
      <button
        onClick={onCancel}
        className="rounded-lg border border-sky-200/20 bg-slate-800/60 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-300 transition hover:border-sky-200/40 hover:text-white"
      >
        {A.cancel}
      </button>
      <BuyButton
        label={confirmLabel}
        tone={confirmTone}
        disabled={confirmDisabled}
        onClick={onConfirm}
      />
    </div>
  );
}
