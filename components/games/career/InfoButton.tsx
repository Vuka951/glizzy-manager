import CareerIconButton from '@/components/games/career/CareerIconButton';
import InfoIcon from '@/components/icons/InfoIcon';

export default function InfoButton({
  label,
  onClick,
  className = '',
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <CareerIconButton
      label={label}
      size="sm"
      onClick={onClick}
      className={className}
    >
      <InfoIcon className="h-3 w-3" />
    </CareerIconButton>
  );
}
