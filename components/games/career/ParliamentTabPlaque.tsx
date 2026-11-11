import TownBankScrews from '@/components/games/career/town/TownBankScrews';

// One tab of the parliament as an engraved brass plaque on the gallery rail:
// the open one polished and lit, the others dull
export default function ParliamentTabPlaque({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={`relative flex h-11 min-w-0 items-center justify-center rounded-[3px] px-2 font-sign text-[14px] font-bold uppercase tracking-[0.04em] shadow-[inset_0_1px_0_rgb(255_255_255/0.35),inset_0_-1px_0_rgb(0_0_0/0.35),0_2px_0_rgb(0_0_0/0.55)] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fde68a] @md:px-3 @md:text-[16px] @md:tracking-[0.1em] ${
        selected
          ? 'bg-gradient-to-b from-[#fde68a] via-[#d4a017] to-[#a16207] text-[#2a1a06] [text-shadow:0_1px_0_rgb(255_240_200/0.6)]'
          : 'bg-gradient-to-b from-[#6e5120] to-[#4a3412] text-[#f0dca6] hover:text-[#fde68a]'
      }`}
    >
      <TownBankScrews />
      <span className="truncate">{children}</span>
    </button>
  );
}
