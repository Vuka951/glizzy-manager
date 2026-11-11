import PortraitHead from '@/components/games/PortraitHead';
import type { DuelCharacter } from '@/data/games/glizzyDuel';

// One line of the draw sheet: the seed it is, and who holds it today
export default function BracketGuideSlot({
  tag,
  character,
  label,
  mine,
}: {
  tag: string;
  character: DuelCharacter | null;
  label: string;
  mine: boolean;
}) {
  return (
    <div
      className={`flex h-7 items-center gap-1.5 px-1 ${
        mine ? 'bg-[#fde047]/60' : ''
      }`}
    >
      <span
        className="w-6 shrink-0 border-r-2 border-r-[#b91c1c]/50 pr-1 text-right font-sign text-[14px] font-bold leading-none tabular-nums text-emerald-300"
      >
        {tag}
      </span>
      {character ? (
        <PortraitHead
          character={character}
          className={`h-5 w-5 shrink-0 ${mine ? 'ring-1 ring-[#1c1408]' : ''}`}
        />
      ) : (
        <span className="h-5 w-5 shrink-0 rounded-full border border-dashed border-slate-500" />
      )}
      <span
        className={`min-w-0 flex-1 truncate font-serif text-[12.5px] ${
          mine
            ? 'font-bold text-slate-100'
            : character
              ? 'text-slate-200'
              : 'italic text-slate-500'
        }`}
      >
        {label}
      </span>
    </div>
  );
}
