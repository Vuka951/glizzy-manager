'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import AchievementIcon from '@/components/games/AchievementIcon';
import GamesScale from '@/components/games/GamesScale';
import CareerFramesProvider from '@/components/games/career/CareerFramesProvider';
import CareerIconButton from '@/components/games/career/CareerIconButton';
import { useCareerFrames } from '@/components/games/career/careerFrames';
import PaperSheet from '@/components/games/career/street/PaperSheet';
import Icon from '@/components/icons/Icon';
import { achievements, type AchievementId } from '@/data/games/achievements';
import { GAMES_UI } from '@/data/games/locale';
import { MANAGER_PATH, RIVALS_PATH } from '@/lib/constants/routes';
import { achievementStore } from '@/lib/utils/achievements';
import {
  fullscreenHost,
  subscribeFullscreen,
} from '@/lib/utils/fullscreen';
import { playTrophySound } from '@/lib/utils/gameSounds';
import { effectiveZoom } from '@/lib/utils/zoom';

const SHOW_MS = 3800;
const STREET_PATHS = [MANAGER_PATH, RIVALS_PATH];

// Sits above whatever game is open and shows one trophy at a time; the queue
// keeps a burst of unlocks from covering each other. While a game card is
// fullscreen or borderless the toast moves inside it, since nothing outside
// is drawn or the card covers it. It sits above the career's frames provider
// too, so the career's routes are told by their path; there the trophy arrives
// as a diploma with a wax seal
export default function AchievementToast() {
  const [queue, setQueue] = useState<AchievementId[]>([]);
  const host = useSyncExternalStore(
    subscribeFullscreen,
    fullscreenHost,
    () => null,
  );
  const frames = useCareerFrames();
  const pathname = usePathname();
  const street = frames === 'street' || STREET_PATHS.some((path) => pathname.startsWith(path));

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

  const dismiss = () => setQueue((q) => q.slice(1));

  const current = queue[0];
  const achievement = current
    ? achievements.find((a) => a.id === current)
    : undefined;
  if (!achievement || !host) return null;

  const toast = street ? (
    <CareerFramesProvider>
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center p-4"
      >
        <PaperSheet
          key={achievement.id}
          className="flex w-full max-w-xs flex-col items-center gap-1.5 px-6 pb-5 pt-5 text-center animate-[podiumrise_0.35s_ease-out_both]"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-1.5 border-[3px] border-double border-slate-300/60"
          />
          <CareerIconButton
            label={GAMES_UI.shared.close}
            size="sm"
            onClick={dismiss}
            className="pointer-events-auto absolute right-3 top-3"
          >
            <Icon name="close" className="h-3 w-3" />
          </CareerIconButton>
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#a11919] bg-[radial-gradient(circle_at_35%_30%,rgb(255_255_255/0.22),transparent_60%)] text-[#fde9d8] shadow-[inset_0_0_0_3px_rgb(0_0_0/0.18),0_0_0_2px_#7f1212,0_3px_0_2px_rgb(28_20_8/0.4)]">
            <AchievementIcon id={achievement.id} className="h-7 w-7" />
          </span>
          <span className="mt-1 -rotate-2 rounded-[2px] border-2 border-[#a11919] px-1.5 font-sign text-[13px] font-extrabold uppercase leading-[1.3] tracking-[0.12em] text-[#a11919]">
            {GAMES_UI.achievements.toast}
          </span>
          <span className="font-serif text-lg font-bold leading-tight text-slate-100">
            {achievement.title}
          </span>
          <span className="font-serif text-[13px] leading-snug text-slate-300">
            {achievement.description}
          </span>
        </PaperSheet>
      </div>
    </CareerFramesProvider>
  ) : (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center p-4"
    >
      <div
        key={achievement.id}
        className="relative flex w-full max-w-xs flex-col items-center gap-2 overflow-hidden rounded-3xl border border-amber-300/50 bg-gradient-to-b from-slate-900/95 to-slate-950/95 px-6 pb-5 pt-6 text-center shadow-2xl shadow-amber-400/20 backdrop-blur-md animate-[podiumrise_0.35s_ease-out_both]"
      >
        <span
          aria-hidden="true"
          className="absolute inset-x-8 top-0 h-[3px] rounded-b-full bg-gradient-to-r from-amber-600 via-amber-200 to-amber-600"
        />
        <button
          onClick={dismiss}
          aria-label={GAMES_UI.shared.close}
          className="pointer-events-auto absolute right-3 top-3 rounded-full border border-sky-200/15 bg-slate-800/60 p-1.5 text-slate-400 transition hover:border-sky-200/40 hover:text-white"
        >
          <Icon name="close" className="h-3.5 w-3.5" />
        </button>
        <span className="relative flex h-16 w-16 items-center justify-center">
          <span
            aria-hidden="true"
            className="absolute -inset-3 rounded-full bg-[repeating-conic-gradient(rgb(252_211_77/0.28)_0_10deg,transparent_10deg_30deg)] [mask-image:radial-gradient(circle,#000_30%,transparent_70%)] motion-safe:animate-[spin_12s_linear_infinite]"
          />
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-amber-300/70 bg-gradient-to-b from-amber-400/30 to-amber-600/20 text-amber-200 shadow-[inset_0_2px_0_rgb(255_255_255/0.2),0_0_24px_rgb(251_191_36/0.35)]">
            <AchievementIcon id={achievement.id} className="h-7 w-7 drop-shadow-[0_0_6px_rgb(252_211_77/0.6)]" />
          </span>
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
    </div>
  );

  // Out on the page the toast lands outside the scaled games page, so it
  // takes the same big-screen zoom; an expanded game card is zoomed already
  return createPortal(
    effectiveZoom(host) === 1 ? <GamesScale>{toast}</GamesScale> : toast,
    host,
  );
}
