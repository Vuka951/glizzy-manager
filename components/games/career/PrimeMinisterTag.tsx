import { GAMES_UI } from '@/data/games/locale';

const PRIME_MINISTER = GAMES_UI.career.parliament.primeMinister;

// The office next to a name in a list, a rubber stamp on the paper
export default function PrimeMinisterTag() {
  return (
    <span className="shrink-0 rounded-[2px] border-[1.5px] border-[#1e3a8a] px-1 font-sign text-[10px] font-bold uppercase leading-[1.25] tracking-[0.08em] text-[#1e3a8a]">
      {PRIME_MINISTER}
    </span>
  );
}
