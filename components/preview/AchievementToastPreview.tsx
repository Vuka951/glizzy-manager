"use client";

import AchievementToast from "@/components/games/AchievementToast";
import { achievements } from "@/data/games/achievements";
import { achievementStore } from "@/lib/utils/achievements";

export default function AchievementToastPreview() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-wrap justify-center gap-2">
        {achievements.map((achievement) => (
          <button
            key={achievement.id}
            onClick={() => achievementStore.preview(achievement.id)}
            className="rounded-full border border-sky-200/15 bg-slate-900/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-sky-300 transition hover:border-sky-200/40 hover:text-white"
          >
            {achievement.title}
          </button>
        ))}
      </div>
      <AchievementToast />
    </div>
  );
}
