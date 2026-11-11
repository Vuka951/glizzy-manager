import { useEffect } from 'react';
import PortraitHead from '@/components/games/PortraitHead';
import CareerButton from '@/components/games/career/CareerButton';
import OwnNameField from '@/components/games/career/OwnNameField';
import PaperSheet from '@/components/games/career/street/PaperSheet';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import {
  playCharacterSelectSound,
  playPaperSound,
} from '@/lib/utils/gameSounds';
import type { CharacterNameProblem } from '@/lib/utils/characterNames';
import { compareLocalized } from '@/lib/utils/sorting';

const SELECT = GAMES_UI.career.select;

// Page two of the newspaper: one plain grid of applicants, pick and go. The
// league is generated, so a new seed brings new faces, and the player can
// write himself in in place of one of them
export default function ClassifiedsSelect({
  characters,
  onSelect,
  onReroll,
  ownNameProblem,
  onOwnName,
  busy = false,
  taken,
  selected = null,
}: {
  characters: DuelCharacter[];
  onSelect: (slug: string) => void;
  onReroll: () => void;
  ownNameProblem: (name: string) => CharacterNameProblem | null;
  onOwnName: (name: string) => void;
  busy?: boolean;
  // A shared room: faces another coach already took are crossed out, the
  // coach's own pick stays circled
  taken?: Set<string>;
  selected?: string | null;
}) {
  useEffect(() => {
    playPaperSound();
  }, []);
  return (
    <PaperSheet className="w-full max-w-4xl rotate-[-0.5deg] p-4 animate-[bubblein_0.4s_ease-out] motion-reduce:animate-none sm:p-7">
      <div className="border-y-4 border-double border-[#1c1408] py-1.5 text-center">
        <p className="font-serif text-2xl font-black uppercase tracking-[0.1em] text-slate-100 sm:text-3xl">
          {SELECT.masthead}
        </p>
        <p className="font-sign text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          {SELECT.section}
        </p>
      </div>
      <div className="mt-3 flex justify-end">
        <CareerButton tone="quiet" disabled={busy} onClick={onReroll} className="min-h-11">
          {SELECT.newFaces}
        </CareerButton>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5 sm:gap-2 sm:grid-cols-4 md:grid-cols-5">
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
                disabled={isTaken || busy}
                className={`group/tile flex flex-col items-center gap-1.5 rounded-[2px] border px-2 py-3 transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1e3a8a] ${
                  isTaken
                    ? 'cursor-not-allowed border-dashed border-[#1c1408]/25 opacity-40'
                    : isSelected
                      ? 'border-2 border-[#a11919] bg-[#fbf6e6]'
                      : 'border-[#1c1408]/20 bg-[#fbf6e6]/50 hover:-translate-y-0.5 hover:border-[#1c1408]/60 hover:bg-[#fbf6e6] motion-reduce:hover:translate-y-0'
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
                  className={`font-serif text-[12.5px] font-bold leading-tight text-slate-100 ${
                    isTaken ? 'line-through' : ''
                  }`}
                >
                  {character.name}
                </span>
              </button>
            );
          })}
      </div>
      <div className="mt-4">
        <OwnNameField problemOf={ownNameProblem} onSubmit={onOwnName} disabled={busy} />
      </div>
    </PaperSheet>
  );
}
