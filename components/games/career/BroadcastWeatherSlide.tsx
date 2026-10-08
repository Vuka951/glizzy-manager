import PortraitHead from '@/components/games/PortraitHead';
import useCountUp from '@/components/games/career/useCountUp';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import {
  PARTICLE_SLOTS,
  WEATHER_PARTICLES,
  WEATHER_TEXT,
  WEATHER_TINTS,
  WEATHER_TWINKLES,
} from '@/lib/constants/broadcastWeather';
import type { CupWeather } from '@/lib/utils/careerWeather';
import { seasonName } from '@/lib/utils/localeNames';
import { fmt } from '@/lib/utils/format';

const B = GAMES_UI.career.broadcast;

export type PastChampion = { slug: string; year: number };

// The forecast card: the temperature rolls in over the season's weather, the
// lower third names who lifted this edition before
export default function BroadcastWeatherSlide({
  season,
  themeIndex,
  weather,
  champions,
  characterBySlug,
}: {
  season: number;
  themeIndex: number;
  weather: CupWeather;
  champions: PastChampion[];
  characterBySlug: Map<string, DuelCharacter>;
}) {
  const reports = B.weatherReports[themeIndex] ?? B.weatherReports[0];
  const report = reports[weather.descIndex % reports.length];
  const degrees = useCountUp(weather.temp, 1100);
  const particles = WEATHER_PARTICLES[themeIndex] ?? WEATHER_PARTICLES[0];
  const twinkles = themeIndex === WEATHER_TWINKLES;
  return (
    <div
      className={`relative flex min-h-56 flex-col justify-center overflow-hidden rounded-xl border p-5 ${WEATHER_TINTS[themeIndex]}`}
    >
      {particles.map((particle, i) => (
        <span
          key={i}
          aria-hidden
          className={`pointer-events-none absolute select-none ${PARTICLE_SLOTS[i].place} ${
            twinkles ? PARTICLE_SLOTS[i].twinkle : PARTICLE_SLOTS[i].drift
          }`}
        >
          {particle}
        </span>
      ))}
      {twinkles && (
        <span aria-hidden className="pointer-events-none absolute right-4 top-3 text-3xl select-none">
          🌙
        </span>
      )}
      <div className="relative flex items-center gap-5">
        <span
          className={`shrink-0 text-6xl font-black leading-none [font-variant-numeric:tabular-nums] ${WEATHER_TEXT[themeIndex]}`}
        >
          {degrees}°
        </span>
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
            {B.weatherTitle}
          </p>
          <p className="text-lg font-black text-slate-100">{seasonName(season)}</p>
          <p className="text-xs leading-snug text-slate-300">{report}</p>
        </div>
      </div>
      {champions.length > 0 && (
        <div className="relative mt-4 flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/50 px-3 py-1.5 animate-[introslide_0.5s_ease-out_both] [animation-delay:700ms]">
          <span className="text-sm">🏆</span>
          <span className="text-[10px] font-semibold text-slate-300">{B.pastChampions}</span>
          <span className="ml-auto flex items-center gap-2">
            {champions.map((champion) => {
              const character = characterBySlug.get(champion.slug);
              return character ? (
                <span key={`${champion.slug}-${champion.year}`} className="flex items-center gap-1">
                  <PortraitHead character={character} className="h-6 w-6" />
                  <span className="font-mono text-[9px] text-slate-400">
                    {fmt(B.championYear, { year: champion.year })}
                  </span>
                </span>
              ) : null;
            })}
          </span>
        </div>
      )}
    </div>
  );
}
