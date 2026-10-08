'use client';

import { useSyncExternalStore } from 'react';
import AchievementIcon from '@/components/games/AchievementIcon';
import TrophyProgressBar from '@/components/games/TrophyProgressBar';
import {
  type Achievement,
  type AchievementGame,
  achievementsForGame,
} from '@/data/games/achievements';
import { GAMES_UI } from '@/data/games/locale';
import {
  achievementStore,
  unlockedCount,
  type UnlockedAchievements,
} from '@/lib/utils/achievements';
import { fmt } from '@/lib/utils/format';

const T = GAMES_UI.achievements.page;

const SECTIONS: { game: AchievementGame }[] = [
  { game: 'manager' },
];

function formatDate(t: number): string {
  const d = new Date(t);
  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}.`;
}

function AchievementCard({
  achievement,
  unlockedAt,
}: {
  achievement: Achievement;
  unlockedAt: number | undefined;
}) {
  const done = unlockedAt !== undefined;
  return (
    <li
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border px-4 py-3 ${
        done
          ? 'border-amber-400/30 bg-amber-500/10'
          : 'border-sky-200/5 bg-slate-900/40'
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
          done
            ? 'border-amber-300/50 bg-amber-400/15 text-amber-300'
            : 'border-slate-700/60 bg-slate-800/60 text-slate-600'
        }`}
      >
        <AchievementIcon id={achievement.id} className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-bold ${done ? 'text-white' : 'text-slate-400'}`}
        >
          {achievement.title}
        </p>
        <p className="text-xs leading-relaxed text-slate-500">
          {achievement.description}
        </p>
      </div>
      <span
        className={`basis-full pl-12 text-[10px] font-bold uppercase tracking-widest sm:basis-auto sm:pl-0 ${
          done ? 'text-amber-200/80' : 'text-slate-600'
        }`}
      >
        {done ? fmt(T.unlockedOn, { date: formatDate(unlockedAt) }) : T.locked}
      </span>
    </li>
  );
}

function GameSection({
  game,
  unlocked,
}: {
  game: AchievementGame;
  unlocked: UnlockedAchievements;
}) {
  const items = achievementsForGame(game);
  const done = unlockedCount(
    unlocked,
    items.map((a) => a.id),
  );
  return (
    <section className="flex w-full flex-col gap-4 rounded-2xl border border-sky-200/10 bg-slate-900/30 p-5 text-left">
      <TrophyProgressBar done={done} total={items.length} className="h-6 w-full" />
      <ul className="flex flex-col gap-2">
        {items.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            unlockedAt={unlocked[achievement.id]}
          />
        ))}
      </ul>
    </section>
  );
}

// Every game's trophies, or one game's when opened from inside that game
export default function AchievementsBoard({ game }: { game?: AchievementGame }) {
  const unlocked = useSyncExternalStore(
    achievementStore.subscribe,
    achievementStore.load,
    achievementStore.getServerSnapshot,
  );
  const sections = game ? SECTIONS.filter((s) => s.game === game) : SECTIONS;
  return (
    <div className="flex w-full flex-col gap-6">
      {sections.map((section) => (
        <GameSection key={section.game} unlocked={unlocked} {...section} />
      ))}
    </div>
  );
}
