'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import AchievementIcon from '@/components/games/AchievementIcon';
import { achievements, type AchievementId } from '@/data/games/achievements';
import { GAMES_UI } from '@/data/games/locale';
import { achievementStore } from '@/lib/utils/achievements';
import { playTrophySound } from '@/lib/utils/gameSounds';

const SHOW_MS = 3800;

// Sits above whatever game is open and shows one trophy at a time; the queue
// keeps a burst of unlocks from covering each other. While a game card is
// fullscreen the toast moves inside it, since nothing outside is drawn
export default function AchievementToast() {
  const [queue, setQueue] = useState<AchievementId[]>([]);
  const [host, setHost] = useState<Element | null>(null);

  useEffect(() => {
    const sync = () => setHost(document.fullscreenElement ?? document.body);
    sync();
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  useEffect(
    () => achievementStore.subscribeToasts((id) => setQueue((q) => [...q, id])),
    [],
  );

  useEffect(() => {
    if (queue.length === 0) return;
    playTrophySound();
    const timer = setTimeout(() => setQueue((q) => q.slice(1)), SHOW_MS);
    return () => clearTimeout(timer);
  }, [queue]);

  const current = queue[0];
  const achievement = current
    ? achievements.find((a) => a.id === current)
    : undefined;
  if (!achievement || !host) return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center p-4"
    >
      <div
        key={achievement.id}
        className="flex w-full max-w-xs flex-col items-center gap-2 rounded-3xl border border-amber-300/50 bg-slate-950/90 px-6 py-5 text-center shadow-2xl shadow-amber-400/20 backdrop-blur-md animate-[podiumrise_0.35s_ease-out_both]"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-300/50 bg-amber-400/15 text-amber-300">
          <AchievementIcon id={achievement.id} className="h-6 w-6" />
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-300">
          {GAMES_UI.achievements.toast}
        </span>
        <span className="text-lg font-black text-white">
          {achievement.title}
        </span>
        <span className="text-xs leading-relaxed text-slate-300">
          {achievement.description}
        </span>
      </div>
    </div>,
    host,
  );
}
