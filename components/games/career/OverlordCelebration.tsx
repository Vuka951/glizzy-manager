import PortraitHead from '@/components/games/PortraitHead';
import { OVERLORD_POINTS } from '@/data/games/careerEconomy';
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
  onContinue,
}: {
  character: DuelCharacter;
  player: DuelCharacter;
  playerPlace: number;
  onContinue: () => void;
}) {
  const won = character.slug === player.slug;
  return (
    <div
      className={`flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border p-6 text-center ${
        won
          ? 'border-amber-300/40 bg-amber-400/10'
          : 'border-slate-500/40 bg-slate-900/70'
      }`}
    >
      <span className="animate-[podiumrise_0.6s_ease-out_both] bg-gradient-to-r from-amber-200 via-white to-amber-200 bg-clip-text text-3xl font-black tracking-widest text-transparent">
        {OVERLORD.title}
      </span>
      <span className="animate-[podiumrise_0.6s_ease-out_both] [animation-delay:200ms]">
        <PortraitHead
          character={character}
          className="h-20 w-20 ring-4 ring-amber-300"
        />
      </span>
      <p
        className={`animate-[podiumrise_0.6s_ease-out_both] text-sm font-semibold leading-relaxed [animation-delay:400ms] ${
          won ? 'text-amber-100' : 'text-slate-200'
        }`}
      >
        {plural(OVERLORD.body, OVERLORD_POINTS, { name: character.name, points: OVERLORD_POINTS })}
      </p>
      <p
        className={`animate-[podiumrise_0.6s_ease-out_both] text-xs leading-relaxed [animation-delay:500ms] ${
          won ? 'text-amber-200/80' : 'text-slate-400'
        }`}
      >
        {won
          ? OVERLORD.won
          : fmt(OVERLORD.subLost, {
              player: player.name,
              place: ordinal(playerPlace),
            })}
      </p>
      <button
        onClick={onContinue}
        className="rounded-xl border border-amber-300/50 bg-amber-400/15 px-6 py-2.5 text-sm font-semibold text-amber-200 transition hover:border-amber-300/80 hover:bg-amber-400/25 hover:text-white"
      >
        {OVERLORD.viewReport}
      </button>
    </div>
  );
}
