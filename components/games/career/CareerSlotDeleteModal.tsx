import GameModal from '@/components/games/GameModal';
import { GAMES_UI } from '@/data/games/locale';
import type { CareerSlot } from '@/lib/utils/careerSave';
import { fmt } from '@/lib/utils/format';

const START = GAMES_UI.career.start;

export default function CareerSlotDeleteModal({
  slot,
  onConfirm,
  onClose,
}: {
  slot: CareerSlot;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <GameModal title={fmt(START.deleteTitle, { n: slot })} onClose={onClose}>
      <div className="flex flex-col items-center gap-3">
        <p className="text-center text-sm font-semibold text-red-200">
          {START.deleteConfirm}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={onConfirm}
            className="rounded-lg border border-red-500/40 bg-red-500/15 px-4 py-1.5 text-xs font-semibold text-red-200 transition hover:border-red-500/60 hover:text-white"
          >
            {START.deleteYes}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-sky-200/20 bg-slate-800/60 px-4 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-sky-200/40 hover:text-white"
          >
            {START.confirmNo}
          </button>
        </div>
      </div>
    </GameModal>
  );
}
