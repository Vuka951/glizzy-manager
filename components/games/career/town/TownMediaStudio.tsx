import { GAMES_UI } from '@/data/games/locale';

const TOWN = GAMES_UI.career.town;
const VU = [
  'h-1.5 bg-[#22c55e]',
  'h-2 bg-[#22c55e]',
  'h-2.5 bg-[#22c55e]',
  'h-3 bg-[#facc15]',
  'h-3.5 bg-[#ef4444]',
];

// The TV station's control desk, filling the board: the lit live sign and a
// level meter on the back panel, and the rack in front where the night's
// programme tapes wait to go to air
export default function TownMediaStudio({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col text-left">
      <div className="flex items-center justify-between gap-3 border-b-2 border-[#000000] bg-[#07090d] px-3 py-2 shadow-[inset_0_3px_8px_rgb(0_0_0/0.8)]">
        <span className="flex items-center gap-2 rounded-[3px] border border-[#ef4444]/70 bg-[#7f1d1d] px-2.5 py-0.5 shadow-[0_0_12px_rgb(239_68_68/0.55)]">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-[#fecaca] shadow-[0_0_5px_rgb(254_202_202/0.9)] motion-safe:animate-pulse"
          />
          <span className="font-mono text-[11px] font-black uppercase tracking-[0.35em] text-[#fee2e2]">
            {TOWN.signs.live}
          </span>
        </span>
        <span aria-hidden="true" className="flex items-end gap-[3px]">
          {VU.map((bar) => (
            <span key={bar} className={`w-1 rounded-[1px] ${bar}`} />
          ))}
        </span>
      </div>
      <div className="flex flex-col gap-2.5 bg-[#0b0f16] bg-[repeating-linear-gradient(90deg,transparent_0_6px,rgb(255_255_255/0.025)_6px_7px)] p-2.5 sm:p-3">
        {children}
      </div>
    </div>
  );
}
