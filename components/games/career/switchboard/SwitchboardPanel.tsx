import TownBankScrews from '@/components/games/career/town/TownBankScrews';

// A slab of black slate screwed to the walnut: what every switch and fader on
// the settings board is mounted in
export default function SwitchboardPanel({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative w-full rounded-[3px] bg-gradient-to-b from-[#26211c] to-[#14100c] text-left shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_2px_0_rgb(0_0_0/0.65)] ${className}`}
    >
      <TownBankScrews brass />
      {children}
    </div>
  );
}
