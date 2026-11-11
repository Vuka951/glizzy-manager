import CareerIconButton from '@/components/games/career/CareerIconButton';
import GearIcon from '@/components/icons/GearIcon';
import { GAMES_UI } from '@/data/games/locale';

export default function GearButton({ onClick }: { onClick: () => void }) {
  return (
    <CareerIconButton
      label={GAMES_UI.shared.settings}
      onClick={onClick}
    >
      <GearIcon />
    </CareerIconButton>
  );
}
