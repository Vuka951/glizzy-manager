import CareerButton from '@/components/games/career/CareerButton';
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
    <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
      {left && <span className="mr-auto min-w-0">{left}</span>}
      <CareerButton tone="quiet" onClick={onCancel}>
        {A.cancel}
      </CareerButton>
      <CareerButton
        tone={confirmTone}
        disabled={confirmDisabled}
        onClick={onConfirm}
      >
        {confirmLabel}
      </CareerButton>
    </div>
  );
}
