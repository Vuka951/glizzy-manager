import PortraitHead from '@/components/games/PortraitHead';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import { INTRO_STAGGER, WEATHER_EMOJI } from '@/lib/constants/broadcastWeather';
import type { CharacterCareerState } from '@/lib/utils/careerSave';
import { IN_FORM_GAIN_SCALE, IN_FORM_STRESS_DROP } from '@/lib/utils/cupSeason';
import { fmt } from '@/lib/utils/format';

const B = GAMES_UI.career.broadcast;

// The men whose weather this is: what the edition has given them so far,
// their title chance, and what the weather does for them at the table
export default function BroadcastSeasonSlide({
  slugs,
  season,
  themeIndex,
  chances,
  characters,
  characterBySlug,
}: {
  slugs: string[];
  season: number;
  themeIndex: number;
  chances: Record<string, number>;
  characters: Record<string, CharacterCareerState>;
  characterBySlug: Map<string, DuelCharacter>;
}) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center gap-4 bg-[#0d2a1e] p-5">
      <p className="text-center font-sign text-[15px] font-bold uppercase leading-tight tracking-[0.1em] text-green-300">
        <span className="mr-1">{WEATHER_EMOJI[themeIndex]}</span>
        {B.inForm}
      </p>
      <div className="flex flex-wrap justify-center gap-5">
        {slugs.map((slug, i) => {
          const character = characterBySlug.get(slug);
          const state = characters[slug];
          if (!character || !state) return null;
          const record = state.editionRecord?.[season] ?? null;
          const pct = Math.max(1, Math.round((chances[slug] ?? 0) * 100));
          return (
            <div
              key={slug}
              className={`flex w-28 flex-col items-center gap-1.5 opacity-0 animate-[podiumrise_0.45s_ease-out_forwards] ${INTRO_STAGGER[Math.min(i, INTRO_STAGGER.length - 1)]}`}
            >
              <span className="relative">
                <span className="block rounded-full ring-2 ring-green-400/50">
                  <PortraitHead character={character} className="h-14 w-14" />
                </span>
                <span className="absolute -right-1.5 -top-1.5 text-lg animate-[fanbob_1.2s_ease-in-out_infinite]">
                  {WEATHER_EMOJI[themeIndex]}
                </span>
              </span>
              <span className="max-w-full truncate text-xs font-bold text-slate-100">
                {character.name}
              </span>
              <span className="flex flex-col items-center gap-0.5 text-[9px] leading-tight">
                <span className="font-sign text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                  {B.editionRecord}
                </span>
                <span className="font-sign text-[17px] font-bold tabular-nums text-green-200">
                  {record ? `${record[0]}-${record[1]}` : B.editionNone}
                </span>
                <span className="font-sign text-[14px] font-bold tabular-nums text-amber-300">🏆 {pct}%</span>
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap justify-center gap-1.5 opacity-0 animate-[bubblein_0.35s_ease-out_forwards] [animation-delay:700ms]">
        <span className="rounded-[3px] bg-[#071a12] px-2 py-0.5 font-sign text-[13px] font-semibold tabular-nums text-green-200">
          {fmt(B.buffStress, { drop: -IN_FORM_STRESS_DROP })}
        </span>
        <span className="rounded-[3px] bg-[#071a12] px-2 py-0.5 font-sign text-[13px] font-semibold tabular-nums text-green-200">
          {fmt(B.buffGain, { scale: IN_FORM_GAIN_SCALE })}
        </span>
      </div>
    </div>
  );
}
