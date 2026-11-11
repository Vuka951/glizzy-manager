import PortraitHead from '@/components/games/PortraitHead';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import { PAPER_PAINT } from '@/lib/utils/careerFrameClasses';
import type { RivalReason } from '@/lib/utils/careerSave';

const RIVAL = GAMES_UI.career.rival;

// One name on the shortlist, a paper slip with a red stamp to bring down on it:
// a row on a phone, a slip standing up once there is room for them side by side
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
      className={`group flex min-h-11 w-full items-center gap-2 rounded-[2px] bg-[#f1e8d3] p-1.5 text-left shadow-[0_2px_0_rgb(0_0_0/0.6)] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fdf0c8] enabled:active:translate-y-px sm:w-auto sm:flex-1 sm:flex-col sm:gap-0.5 sm:px-1 sm:text-center sm:hover:-translate-y-0.5 motion-reduce:sm:hover:translate-y-0 ${PAPER_PAINT}`}
    >
      <PortraitHead
        character={character}
        className="aspect-square w-10 shrink-0 sm:w-9"
      />
      <span className="min-w-0 flex-1 sm:flex-none">
        <span className="block truncate font-serif text-[13px] font-bold leading-tight text-slate-100 sm:line-clamp-2 sm:whitespace-normal">
          {character.name}
        </span>
        <span className="block truncate font-sign text-[12px] font-semibold uppercase leading-tight tracking-[0.04em] text-slate-400 sm:line-clamp-2 sm:whitespace-normal">
          {RIVAL.reasons[reason]}
        </span>
      </span>
      <span className="shrink-0 -rotate-3 rounded-[2px] border-2 border-red-300 px-1.5 font-sign text-[13px] font-extrabold uppercase leading-tight tracking-[0.06em] text-red-300 transition group-hover:bg-[#a11919] group-hover:text-[#fdf6e3] sm:mt-auto">
        {RIVAL.choose}
      </span>
    </button>
  );
}
