import TownBankScrews from '@/components/games/career/town/TownBankScrews';

// A short length of the town's walnut screwed up over the scene: what the
// small HUD pieces hang on. Size and padding come from the caller, who keeps
// the corners clear for the screws
export default function TownHudRail({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative rounded-[6px] bg-[#40291a] bg-[repeating-linear-gradient(94deg,transparent_0_17px,rgb(0_0_0/0.1)_17px_19px,transparent_19px_31px,rgb(255_255_255/0.025)_31px_32px)] shadow-[inset_0_1px_0_rgb(255_255_255/0.14),inset_0_-2px_0_rgb(0_0_0/0.45),0_0_0_1px_#160c05,0_4px_0_rgb(2_6_23/0.55)] ${className}`}
    >
      <TownBankScrews brass />
      {children}
    </div>
  );
}
