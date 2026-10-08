import PortraitHead from '@/components/games/PortraitHead';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import type { RivalReason } from '@/lib/utils/careerSave';

const RIVAL = GAMES_UI.career.rival;

// One name in the pick-a-rival modal: a row on a phone, a card once there is
// room to stand them side by side
export default function RivalChoiceOption({
  character,
  reason,
  onChoose,
}: {
  character: DuelCharacter;
  reason: RivalReason;
  onChoose: () => void;
}) {
  return (
    <button
      onClick={onChoose}
      className="group flex w-full items-center gap-2 rounded-xl border border-frost-border/25 bg-card-strong/50 p-1.5 text-left transition hover:border-red-300/60 hover:bg-card-strong/90 focus-visible:border-red-300/60 sm:w-auto sm:flex-1 sm:flex-col sm:gap-0.5 sm:px-0.5 sm:pb-1 sm:pt-1 sm:text-center sm:hover:-translate-y-0.5"
    >
      <PortraitHead
        character={character}
        className="aspect-square w-10 shrink-0 sm:w-8"
      />
      <span className="min-w-0 flex-1 sm:flex-none">
        <span className="block truncate text-xs font-bold text-slate-100 sm:line-clamp-2 sm:whitespace-normal sm:text-[10px] sm:leading-tight">
          {character.name}
        </span>
        <span className="block truncate text-[9px] uppercase tracking-wide text-sky-200/70 sm:line-clamp-2 sm:whitespace-normal sm:text-[8px] sm:leading-tight">
          {RIVAL.reasons[reason]}
        </span>
      </span>
      <span className="shrink-0 rounded-full border border-red-300/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-red-300 transition group-hover:bg-red-400/20 sm:mt-auto sm:px-1.5 sm:py-0 sm:text-[8px]">
        {RIVAL.choose}
      </span>
    </button>
  );
}
