import CareerButton from '@/components/games/career/CareerButton';
import TypedNotice from '@/components/games/career/TypedNotice';
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
        <TypedNotice className="w-full">
          <p className="text-center font-serif text-[14px] font-bold leading-snug text-red-300">
            {START.deleteConfirm}
          </p>
        </TypedNotice>
        <div className="flex flex-wrap justify-center gap-2">
          <CareerButton
            tone="danger"
            className="min-h-11"
            onClick={onConfirm}
          >
            {START.deleteYes}
          </CareerButton>
          <CareerButton
            tone="quiet"
            className="min-h-11"
            onClick={onClose}
          >
            {START.confirmNo}
          </CareerButton>
        </div>
      </div>
    </GameModal>
  );
}
