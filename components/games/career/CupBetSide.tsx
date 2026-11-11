import GlizzyIcon from '@/components/icons/GlizzyIcon';
import PortraitHead from '@/components/games/PortraitHead';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import { formatOdds } from '@/lib/utils/careerOdds';
import { fmt } from '@/lib/utils/format';
import type { CupMatchBet } from '@/lib/utils/tournamentSim';

// One printed side of a bookmaker's line: the face, the name and the price
// beside a tick box. While the match is open the whole line is the bet key,
// and a bet is a red pencil cross with the payout ringed; once it is played it
// only shows who went through, the loser ruled out
export default function CupBetSide({
  character,
  odds,
  wager,
  state,
  isPlayer,
  mirrored,
  seed,
  disabled,
  onBet,
}: {
  character: DuelCharacter;
  odds: number | null;
  wager: CupMatchBet | null;
  state: 'pending' | 'winner' | 'loser';
  isPlayer: boolean;
  mirrored: boolean;
  seed?: number;
  disabled: boolean;
  onBet?: () => void;
}) {
  const lockedOdds = wager?.odds ?? odds;
  const body = (
    <>
      {seed !== undefined && (
        <span className="shrink-0 font-sign text-[13px] font-semibold tabular-nums text-slate-500">
          {seed}.
        </span>
      )}
      <PortraitHead
        character={character}
        className={`h-8 w-8 shrink-0 ${isPlayer ? 'ring-2 ring-sky-300' : ''}`}
      />
      <span
        className={`flex min-w-0 flex-1 flex-col ${
          mirrored ? 'items-end text-right' : 'items-start text-left'
        }`}
      >
        <span
          className={`line-clamp-2 w-full font-serif text-[11px] font-bold leading-tight [overflow-wrap:anywhere] sm:text-[13px] ${
            state === 'winner'
              ? 'text-amber-300'
              : state === 'loser'
                ? 'line-through decoration-[#b91c1c]'
                : 'text-slate-100'
          }`}
        >
          {character.name}
        </span>
        {lockedOdds !== null && (
          <span
            className={`flex h-5 items-center gap-1 ${mirrored ? 'flex-row-reverse' : ''}`}
          >
            <span
              aria-hidden="true"
              className="flex h-3 w-3 shrink-0 items-center justify-center border border-[#1c1408]/60 bg-[#fffaf0]/50"
            >
              {wager && (
                <svg viewBox="0 0 8 8" className="h-2 w-2">
                  <path
                    d="M1 1 7 7M7 1 1 7"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="fill-none stroke-[#b91c1c]"
                  />
                </svg>
              )}
            </span>
            {wager ? (
              <span className="flex -rotate-2 items-center gap-0.5 whitespace-nowrap rounded-[50%] border-[1.5px] border-[#b91c1c]/80 px-1.5 font-sign text-[13px] font-bold leading-tight tabular-nums text-red-300">
                <GlizzyIcon variant={0} className="h-2 w-3 shrink-0" />
                {`+${Math.round(wager.stake * lockedOdds)}`}
              </span>
            ) : (
              <span className="font-sign text-[13px] font-semibold leading-tight tabular-nums text-slate-400">
                x{formatOdds(lockedOdds)}
              </span>
            )}
          </span>
        )}
      </span>
    </>
  );
  const layout = `flex min-h-11 w-full min-w-0 items-center gap-1.5 sm:gap-2 ${
    mirrored ? 'flex-row-reverse' : ''
  }`;

  if (!onBet) {
    return (
      <div
        className={`${layout} px-1 text-slate-300 ${
          state === 'loser' ? 'opacity-60 grayscale' : ''
        }`}
      >
        {body}
      </div>
    );
  }
  return (
    <button
      type="button"
      aria-pressed={wager !== null}
      disabled={disabled}
      onClick={onBet}
      title={
        odds !== null
          ? fmt(GAMES_UI.cup.bracket.betOddsTitle, { odds: formatOdds(odds) })
          : GAMES_UI.cup.bracket.betTitle
      }
      className={`${layout} rounded-[2px] px-1 transition enabled:hover:bg-[#1c1408]/[0.08] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1e3a8a] disabled:cursor-not-allowed disabled:opacity-45`}
    >
      {body}
    </button>
  );
}
