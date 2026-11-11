import CareerButton from '@/components/games/career/CareerButton';
import PaperSheet from '@/components/games/career/street/PaperSheet';
import StreetBoard from '@/components/games/career/street/StreetBoard';
import StreetSignPlate from '@/components/games/career/street/StreetSignPlate';
import PortraitHead from '@/components/games/PortraitHead';
import type { OverlordPoints } from '@/data/games/careerEconomy';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import { fmt, ordinal, plural } from '@/lib/utils/format';

const OVERLORD = GAMES_UI.career.overlord;

// The last screen of a campaign: whoever took the crown, and whether it was
// the player's character or somebody else's
export default function OverlordCelebration({
  character,
  player,
  playerPlace,
  points,
  onContinue,
}: {
  character: DuelCharacter;
  player: DuelCharacter;
  playerPlace: number;
  points: OverlordPoints;
  onContinue: () => void;
}) {
  const won = character.slug === player.slug;
  return (
    <StreetBoard className="flex w-full max-w-md flex-col items-center gap-3">
      <span className="relative z-10 animate-[podiumrise_0.6s_ease-out_both]">
        <StreetSignPlate>{OVERLORD.title}</StreetSignPlate>
      </span>
      <PaperSheet className="flex w-full flex-col items-center gap-3 px-5 py-4 text-center">
        <span className="animate-[podiumrise_0.6s_ease-out_both] [animation-delay:200ms]">
          <PortraitHead
            character={character}
            className="h-20 w-20 ring-4 ring-amber-300"
          />
        </span>
        <p
          className={`animate-[podiumrise_0.6s_ease-out_both] font-serif text-base font-bold leading-snug [animation-delay:400ms] ${
            won ? 'text-amber-300' : 'text-slate-200'
          }`}
        >
          {plural(OVERLORD.body, points, { name: character.name, points })}
        </p>
        <p className="animate-[podiumrise_0.6s_ease-out_both] border-t border-dashed border-slate-500 pt-2 text-xs leading-relaxed text-slate-400 [animation-delay:500ms]">
          {won
            ? OVERLORD.won
            : fmt(OVERLORD.subLost, {
                player: player.name,
                place: ordinal(playerPlace),
              })}
        </p>
      </PaperSheet>
      <CareerButton tone="buy" size="lg" className="min-h-11" onClick={onContinue}>
        {OVERLORD.viewReport}
      </CareerButton>
    </StreetBoard>
  );
}
