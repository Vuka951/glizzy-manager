'use client';

import { useState } from 'react';
import CareerButton from '@/components/games/career/CareerButton';
import CreatureAvatar from '@/components/games/CreatureAvatar';
import { GAMES_UI } from '@/data/games/locale';
import {
  CHARACTER_NAME_MAX_LENGTH,
  CHARACTER_NAME_MIN_LENGTH,
} from '@/lib/constants/characterNames';
import {
  normalizeCharacterName,
  type CharacterNameProblem,
} from '@/lib/utils/characterNames';
import { fmt } from '@/lib/utils/format';

const SELECT = GAMES_UI.career.select;
const LIMITS = { min: CHARACTER_NAME_MIN_LENGTH, max: CHARACTER_NAME_MAX_LENGTH };

// The applicant who writes himself in: his face draws itself as he types,
// and the name signs up once it fits the league
export default function OwnNameField({
  problemOf,
  onSubmit,
  disabled = false,
}: {
  problemOf: (name: string) => CharacterNameProblem | null;
  onSubmit: (name: string) => void;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState('');
  const name = normalizeCharacterName(draft);
  const problem = name ? problemOf(name) : null;
  const ready = name.length > 0 && problem === null && !disabled;

  return (
    <form
      className="flex flex-col gap-1.5 border-t border-[#1c1408]/30 pt-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (ready) onSubmit(name);
      }}
    >
      <label
        htmlFor="own-character-name"
        className="font-sign text-[13px] font-semibold uppercase tracking-[0.1em] text-slate-300"
      >
        {SELECT.ownNameLabel}
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-[#1c1408]/40 bg-slate-800">
          {name ? (
            <CreatureAvatar name={name} className="h-full w-full" />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-sign text-lg font-bold text-slate-400">
              ?
            </span>
          )}
        </div>
        <input
          id="own-character-name"
          value={draft}
          maxLength={CHARACTER_NAME_MAX_LENGTH + 4}
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={SELECT.ownNamePlaceholder}
          aria-invalid={problem !== null}
          aria-describedby="own-character-name-note"
          className="min-h-11 min-w-0 flex-1 border-b-2 border-[#1c1408] bg-transparent px-1 font-serif text-base font-semibold text-slate-100 placeholder:font-normal placeholder:text-slate-500 focus:border-[#b91c1c] focus:outline-none"
        />
        <CareerButton type="submit" tone="danger" disabled={!ready} className="min-h-11">
          {SELECT.ownNameSubmit}
        </CareerButton>
      </div>
      <p
        id="own-character-name-note"
        aria-live="polite"
        className={`font-serif text-[13px] ${problem ? 'font-semibold text-red-300' : 'text-slate-400'}`}
      >
        {fmt(problem ? SELECT.nameProblems[problem] : SELECT.ownNameHint, LIMITS)}
      </p>
    </form>
  );
}
