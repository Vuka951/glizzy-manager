import { useCareerFrames } from '@/components/games/career/careerFrames';
import BrassPlate from '@/components/games/career/street/BrassPlate';

export default function SettingsSection({
  label,
  first = false,
  children,
}: {
  label: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  const street = useCareerFrames() === 'street';
  if (street) {
    return (
      <div className="flex flex-col items-start gap-1.5">
        <BrassPlate>{label}</BrassPlate>
        {children}
      </div>
    );
  }
  return (
    <div
      className={`flex flex-col gap-2 ${
        first ? '' : 'border-t border-sky-200/10 pt-3'
      }`}
    >
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
        {label}
      </span>
      {children}
    </div>
  );
}
