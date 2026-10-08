import PortraitHead from '@/components/games/PortraitHead';
import ResultPips from '@/components/games/career/ResultPips';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import type { CharacterCareerState } from '@/lib/utils/careerSave';

const B = GAMES_UI.career.broadcast;

export type StreakRow = { slug: string; kind: 'w' | 'l'; length: number };

function StreakCard({
  row,
  delayClass,
  characters,
  characterBySlug,
}: {
  row: StreakRow;
  delayClass: string;
  characters: Record<string, CharacterCareerState>;
  characterBySlug: Map<string, DuelCharacter>;
}) {
  const character = characterBySlug.get(row.slug);
  if (!character) return null;
  const hot = row.kind === 'w';
  return (
    <div
      className={`flex items-center gap-4 rounded-xl border p-4 opacity-0 animate-[introslide_0.45s_ease-out_forwards] ${
        hot ? 'border-green-400/30 bg-green-400/5' : 'border-red-400/30 bg-red-400/5'
      } ${delayClass}`}
    >
      <span className="relative shrink-0">
        <span
          className={`block rounded-full ring-2 ${hot ? 'ring-green-400/60' : 'ring-red-400/60'}`}
        >
          <PortraitHead character={character} className="h-16 w-16" />
        </span>
        <span className="absolute -bottom-1 -right-1 text-xl">{hot ? '🔥' : '🥶'}</span>
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <span
          className={`text-[9px] font-bold uppercase tracking-widest ${hot ? 'text-green-300' : 'text-red-300'}`}
        >
          {hot ? B.streakHot : B.streakCold}
        </span>
        <span
          className={`text-4xl font-black leading-none ${hot ? 'text-green-300' : 'text-red-300'}`}
        >
          {row.kind.toUpperCase()}
          {row.length}
        </span>
        <span className="truncate text-sm font-semibold text-slate-100">{character.name}</span>
        <ResultPips results={characters[row.slug]?.recentResults} size="md" />
      </div>
    </div>
  );
}

// The hottest and the coldest man in the league, one card each
export default function BroadcastStreakSlide({
  rows,
  characters,
  characterBySlug,
}: {
  rows: StreakRow[];
  characters: Record<string, CharacterCareerState>;
  characterBySlug: Map<string, DuelCharacter>;
}) {
  return (
    <div
      className={`grid min-h-56 content-center gap-3 rounded-xl border border-red-300/20 bg-red-300/5 p-4 ${
        rows.length > 1 ? 'sm:grid-cols-2' : ''
      }`}
    >
      <p className="text-center text-[9px] font-bold uppercase tracking-widest text-red-300 sm:col-span-full">
        <span className="mr-1">🔥</span>
        {B.streaks}
      </p>
      {rows.map((row, i) => (
        <StreakCard
          key={row.slug}
          row={row}
          delayClass={i === 0 ? '[animation-delay:100ms]' : '[animation-delay:350ms]'}
          characters={characters}
          characterBySlug={characterBySlug}
        />
      ))}
    </div>
  );
}
