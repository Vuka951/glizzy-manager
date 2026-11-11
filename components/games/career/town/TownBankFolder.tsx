import { GAMES_UI } from '@/data/games/locale';

const TOWN = GAMES_UI.career.town;

// The investments office as the sponsor's worn manila contract folder: a tab
// naming it, a clip at the top and the standing contracts filed inside
export default function TownBankFolder({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative pt-6">
      <span className="absolute left-4 top-0 flex h-6 items-center rounded-t-[5px] bg-[#dcbf86] px-4 font-sign text-[14px] font-bold uppercase tracking-[0.08em] text-[#4a3716]">
        {TOWN.bankInvest}
      </span>
      <span
        aria-hidden="true"
        className="absolute right-8 top-2.5 z-10 h-8 w-3 rounded-full border-2 border-[#9ca3af]"
      />
      <div className="relative rounded-[5px] bg-gradient-to-b from-[#dcbf86] to-[#c29d5c] p-2.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_4px_0_rgb(0_0_0/0.45)] sm:p-3">
        {children}
      </div>
    </div>
  );
}
