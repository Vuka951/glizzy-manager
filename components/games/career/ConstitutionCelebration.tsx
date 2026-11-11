import CareerButton from '@/components/games/career/CareerButton';
import ConstitutionWinners from '@/components/games/career/ConstitutionWinners';
import PaperSheet from '@/components/games/career/street/PaperSheet';
import StreetBoard from '@/components/games/career/street/StreetBoard';
import StreetSignPlate from '@/components/games/career/street/StreetSignPlate';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import type { SponsorId } from '@/lib/utils/careerSave';
import { fmt, ordinal } from '@/lib/utils/format';

const CONSTITUTION = GAMES_UI.career.constitution;
const OVERLORD = GAMES_UI.career.overlord;
const NAMES = GAMES_UI.career.sponsors.names as Record<SponsorId, string>;

// The last screen of a campaign that ended on one-party rule: the party's
// seal, every coach on its list, and whether the player's man is among them
export default function ConstitutionCelebration({
  party,
  winners,
  player,
  playerPlace,
  onContinue,
}: {
  party: SponsorId;
  winners: DuelCharacter[];
  player: DuelCharacter;
  playerPlace: number;
  onContinue: () => void;
}) {
  const won = winners.some((c) => c.slug === player.slug);
  return (
    <StreetBoard className="flex w-full max-w-md flex-col items-center gap-3">
      <span className="relative z-10 animate-[podiumrise_0.6s_ease-out_both]">
        <StreetSignPlate>{CONSTITUTION.title}</StreetSignPlate>
      </span>
      <PaperSheet className="flex w-full flex-col items-center gap-3 px-5 py-4 text-center">
        <span className="animate-[podiumrise_0.6s_ease-out_both] [animation-delay:200ms]">
          <ConstitutionWinners
            party={party}
            winners={winners}
            ownSlug={player.slug}
          />
        </span>
        <p
          className={`animate-[podiumrise_0.6s_ease-out_both] font-serif text-base font-bold leading-snug [animation-delay:400ms] ${
            won ? 'text-red-300' : 'text-slate-200'
          }`}
        >
          {fmt(CONSTITUTION.body, { party: NAMES[party] })}
        </p>
        <p className="animate-[podiumrise_0.6s_ease-out_both] border-t border-dashed border-slate-500 pt-2 text-xs leading-relaxed text-slate-400 [animation-delay:500ms]">
          {won
            ? CONSTITUTION.won
            : fmt(CONSTITUTION.subLost, {
                player: player.name,
                place: ordinal(playerPlace),
              })}
        </p>
      </PaperSheet>
      <CareerButton tone="danger" size="lg" className="min-h-11" onClick={onContinue}>
        {OVERLORD.viewReport}
      </CareerButton>
    </StreetBoard>
  );
}
