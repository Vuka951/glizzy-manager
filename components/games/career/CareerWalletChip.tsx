import GlizzyIcon from '@/components/icons/GlizzyIcon';
import { GAMES_UI } from '@/data/games/locale';

export default function CareerWalletChip({ balance }: { balance: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/10 py-1 pl-1.5 pr-3 font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-300 xl:py-1.5 xl:pl-2 xl:pr-3.5 xl:text-[11px]">
      <GlizzyIcon variant={3} className="h-3.5 w-5 xl:h-4 xl:w-6" />
      {balance}
      <span className="hidden sm:inline">{GAMES_UI.career.hud.currency}</span>
    </span>
  );
}
