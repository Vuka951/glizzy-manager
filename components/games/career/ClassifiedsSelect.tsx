import { useEffect } from 'react';
import PortraitHead from '@/components/games/PortraitHead';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import {
  playCharacterSelectSound,
  playPaperSound,
} from '@/lib/utils/gameSounds';
import { compareLocalized } from '@/lib/utils/sorting';

const SELECT = GAMES_UI.career.select;

// Page two of the newspaper: one plain grid of applicants, pick and go
export default function ClassifiedsSelect({
  characters,
  onSelect,
  taken,
  selected = null,
}: {
  characters: DuelCharacter[];
  onSelect: (slug: string) => void;
  // A shared room: faces another coach already took are crossed out, the
  // coach's own pick stays circled
  taken?: Set<string>;
  selected?: string | null;
}) {
  useEffect(() => {
    playPaperSound();
  }, []);
  return (
    <div className="w-full max-w-4xl rotate-[-0.5deg] rounded-sm bg-amber-50 p-5 text-slate-900 shadow-2xl animate-[bubblein_0.4s_ease-out] sm:p-7">
      <div className="border-y-2 border-slate-900 py-1.5 text-center">
        <p className="text-lg font-black uppercase tracking-[0.15em]">
          {SELECT.masthead}
        </p>
        <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-500">
          {SELECT.section}
        </p>
      </div>
      <p className="mt-2 text-center text-[11px] italic text-slate-600">
        {SELECT.hint}
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {[...characters]
          .sort((a, b) => compareLocalized(a.name, b.name))
          .map((character) => {
            const isTaken = taken?.has(character.slug) ?? false;
            const isSelected = selected === character.slug;
            return (
              <button
                key={character.slug}
                onClick={() => {
                  playCharacterSelectSound();
                  onSelect(character.slug);
                }}
                disabled={isTaken}
                className={`group/tile flex flex-col items-center gap-1.5 rounded-sm border px-2 py-3 transition-all duration-200 ${
                  isTaken
                    ? 'cursor-not-allowed border-dashed border-slate-900/20 bg-white/20 opacity-40'
                    : isSelected
                      ? 'border-2 border-red-700 bg-white shadow-md'
                      : 'border-slate-900/15 bg-white/50 hover:-translate-y-0.5 hover:border-slate-900/50 hover:bg-white hover:shadow-md'
                }`}
              >
                <PortraitHead
                  character={character}
                  className={`h-12 w-12 transition-all duration-200 ${
                    isSelected
                      ? 'grayscale-0'
                      : 'grayscale group-hover/tile:scale-105 group-hover/tile:grayscale-0'
                  }`}
                />
                <span
                  className={`text-[11px] font-bold leading-tight text-slate-900 ${
                    isTaken ? 'line-through' : ''
                  }`}
                >
                  {character.name}
                </span>
              </button>
            );
          })}
      </div>
    </div>
  );
}
