import CareerSlotCard from '@/components/games/career/CareerSlotCard';
import {
  CAREER_SLOTS,
  type CareerSlot,
  type CareerSlots,
} from '@/lib/utils/careerSave';

export default function CareerSlotPicker({
  slots,
  onNew,
  onContinue,
  onDelete,
}: {
  slots: CareerSlots;
  onNew: (slot: CareerSlot) => void;
  onContinue: (slot: CareerSlot) => void;
  onDelete: (slot: CareerSlot) => void;
}) {
  return (
    <div className="grid w-full max-w-3xl grid-cols-1 gap-1 sm:grid-cols-3 sm:gap-3">
      {CAREER_SLOTS.map((slot) => (
        <CareerSlotCard
          key={slot}
          slot={slot}
          career={slots[slot - 1]}
          onNew={() => onNew(slot)}
          onContinue={() => onContinue(slot)}
          onDelete={() => onDelete(slot)}
        />
      ))}
    </div>
  );
}
