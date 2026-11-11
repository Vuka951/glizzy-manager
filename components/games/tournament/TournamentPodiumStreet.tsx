import BrassPlate from '@/components/games/career/street/BrassPlate';
import PaperSheet from '@/components/games/career/street/PaperSheet';
import PortraitHead from '@/components/games/PortraitHead';
import Icon from '@/components/icons/Icon';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import { WOOD_PLANKS } from '@/lib/utils/careerFrameClasses';
import type { CupStanding } from '@/lib/utils/tournamentSim';

const PLACE_STYLE: Record<
  number,
  { ring: string; step: string; size: string; delay: string }
> = {
  1: {
    ring: 'ring-[3px] ring-[#fcd34d]',
    step: 'h-24',
    size: 'h-24 w-24',
    delay: '[animation-delay:900ms]',
  },
  2: {
    ring: 'ring-[3px] ring-[#cbd5e1]',
    step: 'h-16',
    size: 'h-20 w-20',
    delay: '[animation-delay:500ms]',
  },
  3: {
    ring: 'ring-[3px] ring-[#d97706]',
    step: 'h-12',
    size: 'h-16 w-16',
    delay: '[animation-delay:200ms]',
  },
};

// The podium the town's carpenter knocked together: three walnut steps with a
// brass number each, the coach's own man under an enamel name, and the rest of
// the field typed on a sheet underneath
export default function TournamentPodiumStreet({
  standings,
  characterBySlug,
  betSlug,
}: {
  standings: CupStanding[];
  characterBySlug: Map<string, DuelCharacter>;
  betSlug: string | null;
}) {
  const podium = standings.filter((s) => s.place <= 3);
  const arranged = [
    podium.find((s) => s.place === 2),
    podium.find((s) => s.place === 1),
    podium.find((s) => s.place === 3),
  ].filter((s): s is CupStanding => Boolean(s));
  const fallen = standings.filter((s) => s.place > 3);
  return (
    <div
      className="flex w-full flex-col items-center gap-6"
    >
      <div className="flex flex-col items-stretch">
        <div className="flex items-end justify-center gap-1 sm:gap-1.5">
          {arranged.map((standing) => {
            const style = PLACE_STYLE[standing.place];
            const character = characterBySlug.get(standing.slug);
            if (!character) return null;
            const isBet = standing.slug === betSlug;
            return (
              <div
                key={standing.slug}
                className="flex w-[6.5rem] flex-col items-center sm:w-32"
              >
                <div
                  className={`flex w-full animate-[podiumrise_0.6s_ease-out_both] flex-col items-center ${style.delay}`}
                >
                  <div className="relative mb-2">
                    {standing.place === 1 && (
                      <Icon
                        name="trophy"
                        className="absolute -top-8 left-1/2 z-10 h-6 w-6 -translate-x-1/2 text-[#fcd34d]"
                      />
                    )}
                    <PortraitHead
                      character={character}
                      className={`relative ${style.size} ${style.ring}`}
                    />
                  </div>
                  <span
                    className={`mb-1.5 max-w-full text-balance rounded-[3px] px-1.5 py-0.5 text-center font-sign text-[14px] font-bold uppercase leading-tight tracking-[0.04em] shadow-[0_2px_0_rgb(0_0_0/0.6)] ${
                      isBet
                        ? 'border-2 border-[#f1f5f9] bg-[#1e3a8a] text-[#ffffff]'
                        : 'bg-gradient-to-b from-[#e8c066] to-[#a8782a] text-[#2a1a0a]'
                    }`}
                  >
                    {character.name}
                  </span>
                </div>
                <div
                  className={`flex w-full justify-center rounded-t-[4px] pt-2 shadow-[inset_0_1px_0_rgb(255_255_255/0.16),0_0_0_1px_#160c05] ${WOOD_PLANKS} ${style.step}`}
                >
                  <BrassPlate className="h-fit text-[20px]">
                    {standing.place}
                  </BrassPlate>
                </div>
              </div>
            );
          })}
        </div>
        <div
          aria-hidden="true"
          className="h-2 rounded-b-[3px] bg-[#1f140b] shadow-[0_0_0_1px_#160c05,0_4px_0_rgb(0_0_0/0.5)]"
        />
      </div>

      {fallen.length > 0 && (
        <PaperSheet className="w-full max-w-lg px-3 pb-3 pt-2">
          <p className="mb-2 border-b-[3px] border-double border-[#1c1408]/70 pb-0.5 font-sign text-[14px] font-bold uppercase tracking-[0.08em] text-slate-300">
            {GAMES_UI.cup.podium.fallen}
          </p>
          <div className="flex flex-wrap items-start justify-center gap-3">
            {fallen.map((standing) => {
              const character = characterBySlug.get(standing.slug);
              if (!character) return null;
              return (
                <div
                  key={standing.slug}
                  className="flex w-16 flex-col items-center gap-1"
                >
                  <PortraitHead
                    character={character}
                    className={`h-9 w-9 grayscale ${
                      standing.slug === betSlug ? 'ring-2 ring-sky-300' : ''
                    }`}
                  />
                  <span className="w-full text-balance text-center font-serif text-[10px] leading-tight text-slate-300">
                    {standing.place}. {character.name}
                  </span>
                </div>
              );
            })}
          </div>
        </PaperSheet>
      )}
    </div>
  );
}
