import GlizzyIcon from '@/components/icons/GlizzyIcon';
import { GAMES_UI } from '@/data/games/locale';

// The till on the coach's desk: a brass housing with the balance on drums
// behind a dark window. It runs red once the coach owes money
export default function CareerWalletChip({ balance }: { balance: number }) {
  return (
    <span className="inline-flex items-stretch rounded-[4px] bg-gradient-to-b from-[#e8c066] to-[#a8782a] p-[3px] shadow-[inset_0_1px_0_rgb(255_255_255/0.5),0_2px_0_rgb(2_6_23/0.65)]">
      <span className="flex items-center px-1 xl:px-1.5">
        <GlizzyIcon variant={3} className="h-3.5 w-5 xl:h-4 xl:w-6" />
      </span>
      <span
        className={`flex min-w-8 items-center justify-end rounded-[2px] bg-[#140d07] px-1.5 font-sign text-[15px] font-bold leading-none tabular-nums tracking-[0.06em] shadow-[inset_0_1px_3px_rgb(0_0_0/0.9)] xl:text-[17px] ${
          balance < 0 ? 'text-[#fca5a5]' : 'text-[#fdf0c8]'
        }`}
      >
        {balance}
      </span>
      <span className="hidden items-center px-1.5 font-sign text-[12px] font-extrabold uppercase leading-none tracking-[0.1em] text-[#2a1a0a] sm:flex xl:text-[13px]">
        {GAMES_UI.career.hud.currency}
      </span>
    </span>
  );
}
