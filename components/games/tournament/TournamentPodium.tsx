import { studioAccents } from '@/lib/constants/studioThemes';
import PortraitHead from '@/components/games/PortraitHead';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import type { CupStanding } from '@/lib/utils/tournamentSim';

const PLACE_STYLE: Record<
  number,
  {
    aura: string;
    ring: string;
    pedestal: string;
    size: string;
    medal: string;
    delay: string;
  }
> = {
  1: {
    aura: 'bg-amber-300/40',
    ring: 'ring-2 ring-amber-300 shadow-[0_0_36px_rgba(251,191,36,0.45)]',
    pedestal:
      'h-24 border-amber-300/50 bg-gradient-to-b from-amber-300/25 to-amber-500/5',
    size: 'h-24 w-24',
    medal: '👑',
    delay: '[animation-delay:900ms]',
  },
  2: {
    aura: 'bg-sky-300/30',
    ring: 'ring-2 ring-sky-300 shadow-[0_0_26px_rgba(125,211,252,0.4)]',
    pedestal:
      'h-16 border-sky-300/40 bg-gradient-to-b from-sky-300/20 to-sky-500/5',
    size: 'h-20 w-20',
    medal: '🥈',
    delay: '[animation-delay:500ms]',
  },
  3: {
    aura: 'bg-amber-500/25',
    ring: 'ring-2 ring-amber-500 shadow-[0_0_20px_rgba(217,119,6,0.35)]',
    pedestal:
      'h-12 border-amber-500/40 bg-gradient-to-b from-amber-500/20 to-amber-600/5',
    size: 'h-16 w-16',
    medal: '🥉',
    delay: '[animation-delay:200ms]',
  },
};

export default function TournamentPodium({
  standings,
  characterBySlug,
  betSlug,
  theme = 0,
}: {
  standings: CupStanding[];
  characterBySlug: Map<string, DuelCharacter>;
  betSlug: string | null;
  theme?: number;
}) {
  const accent = studioAccents(theme);
  const podium = standings.filter((s) => s.place <= 3);
  const arranged = [
    podium.find((s) => s.place === 2),
    podium.find((s) => s.place === 1),
    podium.find((s) => s.place === 3),
  ].filter((s): s is CupStanding => Boolean(s));
  const fallen = standings.filter((s) => s.place > 3);
  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div className="relative flex items-end justify-center gap-3 sm:gap-5">
        <div
          className={`pointer-events-none absolute inset-x-0 top-8 h-32 rounded-full blur-3xl ${accent.podiumGlow}`}
        />
        {arranged.map((standing) => {
          const style = PLACE_STYLE[standing.place];
          const character = characterBySlug.get(standing.slug);
          if (!character) return null;
          const isBet = standing.slug === betSlug;
          return (
            <div
              key={standing.slug}
              className="flex w-24 flex-col items-center sm:w-28"
            >
              <div
                className={`flex animate-[podiumrise_0.6s_ease-out_both] flex-col items-center ${style.delay}`}
              >
                <div className="relative mb-2">
                  <div
                    className={`absolute -inset-3 animate-pulse rounded-full blur-xl ${style.aura}`}
                  />
                  <div className="absolute -top-6 left-1/2 z-10 -translate-x-1/2 text-2xl">
                    {style.medal}
                  </div>
                  <PortraitHead
                    character={character}
                    className={`relative ${style.size} ${style.ring}`}
                  />
                </div>
                <span
                  className={`max-w-full truncate text-sm font-semibold ${
                    isBet ? 'text-sky-300' : 'text-white'
                  }`}
                >
                  {character.name}
                </span>
              </div>
              <div
                className={`mt-2 w-full rounded-t-lg border border-b-0 text-center text-2xl font-bold text-slate-200/80 ${style.pedestal}`}
              >
                {standing.place}
              </div>
            </div>
          );
        })}
      </div>

      {fallen.length > 0 && (
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-600">
            {GAMES_UI.cup.podium.fallen}
          </span>
          <div className="flex max-w-lg flex-wrap items-start justify-center gap-3">
            {fallen.map((standing) => {
              const character = characterBySlug.get(standing.slug);
              if (!character) return null;
              return (
                <div
                  key={standing.slug}
                  className="flex w-14 flex-col items-center gap-1"
                >
                  <PortraitHead
                    character={character}
                    className={`h-9 w-9 opacity-60 grayscale ${
                      standing.slug === betSlug ? 'ring-2 ring-sky-300' : ''
                    }`}
                  />
                  <span className="w-full truncate text-center text-[9px] text-slate-500">
                    {standing.place}. {character.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
