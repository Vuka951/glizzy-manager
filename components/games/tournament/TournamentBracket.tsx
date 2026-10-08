import GlizzyIcon from '@/components/icons/GlizzyIcon';
import Icon from '@/components/icons/Icon';
import PortraitHead from '@/components/games/PortraitHead';
import CoachTag from '@/components/games/career-mp/CoachTag';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { COACH_COLOR_CLASSES } from '@/lib/constants/careerMp';
import type { CoachTagMap } from '@/lib/types/careerMp';
import { GAMES_UI } from '@/data/games/locale';
import { formatOdds, type MatchOdds } from '@/lib/utils/careerOdds';
import { fmt } from '@/lib/utils/format';
import { cupRoundName } from '@/lib/utils/localeNames';
import {
  cupBetKey,
  type CupMatch,
  type CupMatchBet,
} from '@/lib/utils/tournamentSim';

const LINE = 'border-slate-600';

const PILL_POS = 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2';

function BracketSide({
  character,
  lives,
  state,
  isBet,
  dense,
  trophy,
  inForm,
  coach,
}: {
  character: DuelCharacter | null;
  lives: number | null;
  state: 'winner' | 'loser' | 'pending';
  isBet: boolean;
  dense: boolean;
  trophy?: boolean;
  inForm?: boolean;
  coach?: CoachTagMap[string];
}) {
  return (
    <div
      className={`flex min-w-0 flex-1 items-center ${
        dense ? 'gap-1' : 'gap-1.5'
      } ${state === 'loser' ? 'opacity-45 grayscale' : ''}`}
    >
      {character ? (
        <PortraitHead
          character={character}
          className={`flex-shrink-0 ${dense ? 'h-4 w-4' : 'h-5 w-5'} ${
            coach
              ? `ring-2 ${COACH_COLOR_CLASSES[coach.color].ring}`
              : isBet
                ? 'ring-2 ring-sky-300'
                : ''
          }`}
        />
      ) : (
        <span
          className={`flex-shrink-0 rounded-full border border-dashed border-slate-600 ${
            dense ? 'h-4 w-4' : 'h-5 w-5'
          }`}
        />
      )}
      <span
        className={`flex-1 truncate text-left font-semibold ${
          dense ? 'text-[8px]' : 'text-[10px]'
        } ${state === 'winner' ? 'text-amber-200' : 'text-slate-300'}`}
      >
        {character?.name ?? '...'}
      </span>
      {coach && <CoachTag name={coach.name} color={coach.color} dense connected={coach.connected} />}
      {inForm && (
        <span title={GAMES_UI.cup.bracket.inForm}>
          <Icon
            name="bolt"
            className={`shrink-0 text-green-300 ${dense ? 'h-2 w-2' : 'h-2.5 w-2.5'}`}
          />
        </span>
      )}
      {trophy && state === 'winner' && (
        <Icon name="trophy" className="h-3 w-3 shrink-0 text-amber-300" />
      )}
      {lives !== null && (
        <span
          className={`font-mono font-bold ${dense ? 'text-[8px]' : 'text-[10px]'} ${
            state === 'winner' ? 'text-amber-300' : 'text-slate-500'
          }`}
        >
          {lives}
        </span>
      )}
    </div>
  );
}

export default function TournamentBracket({
  rounds,
  characterBySlug,
  betSlug,
  currentRound = null,
  matchBets = {},
  buffedSlugs,
  oddsFor,
  onWatch,
  onToggleBet,
  coaches,
}: {
  rounds: CupMatch[][];
  characterBySlug: Map<string, DuelCharacter>;
  betSlug: string | null;
  currentRound?: number | null;
  matchBets?: Record<string, CupMatchBet>;
  buffedSlugs?: Set<string>;
  oddsFor?: (match: CupMatch) => MatchOdds | null;
  onWatch?: (index: number) => void;
  onToggleBet?: (index: number, side: 'a' | 'b') => void;
  // A shared league: every human's character carries his coach's tag
  coaches?: CoachTagMap;
}) {
  const finalMatch = rounds[3]?.[0] ?? null;
  const championSlug = finalMatch?.result
    ? finalMatch.result.winner === 'a'
      ? finalMatch.a
      : finalMatch.b
    : null;
  const champion = championSlug
    ? characterBySlug.get(championSlug) ?? null
    : null;

  const matchCard = (
    match: CupMatch,
    r: number,
    dense: boolean,
    showTrophy = false,
  ) => {
    const a = match.a ? characterBySlug.get(match.a) ?? null : null;
    const b = match.b ? characterBySlug.get(match.b) ?? null : null;
    const winner = match.result?.winner ?? null;
    const involvesBet =
      betSlug !== null && (match.a === betSlug || match.b === betSlug);
    const bet = matchBets[cupBetKey(r, match.index)];
    const actionable =
      r === currentRound && !match.result && a !== null && b !== null;
    const odds = actionable ? (oddsFor?.(match) ?? null) : null;

    return (
      <div
        className={`relative w-full rounded-lg border ${
          involvesBet
            ? 'border-sky-300/40 bg-slate-800/60'
            : 'border-sky-200/10 bg-slate-800/40'
        }`}
      >
        {(['a', 'b'] as const).map((side) => {
          const character = side === 'a' ? a : b;
          const lives = match.result
            ? side === 'a'
              ? match.result.livesA
              : match.result.livesB
            : null;
          const state =
            winner === null ? 'pending' : winner === side ? 'winner' : 'loser';
          const sideSlug = side === 'a' ? match.a : match.b;
          const wagered = bet?.side === side;
          const sideOdds = odds ? (side === 'a' ? odds.a : odds.b) : null;
          const lockedOdds = (wagered ? bet?.odds : undefined) ?? sideOdds;
          return (
            <div
              key={side}
              className={`flex items-center gap-1 ${
                dense ? 'h-6 px-1' : 'h-7 px-2'
              } ${side === 'b' ? 'border-t border-sky-200/5' : ''}`}
            >
              <BracketSide
                character={character}
                lives={lives}
                state={state}
                isBet={betSlug !== null && sideSlug === betSlug}
                dense={dense}
                trophy={showTrophy}
                inForm={sideSlug !== null && buffedSlugs?.has(sideSlug)}
                coach={sideSlug ? coaches?.[sideSlug] : undefined}
              />
              {actionable && onToggleBet && (
                <button
                  onClick={() => onToggleBet(match.index, side)}
                  title={
                    sideOdds !== null
                      ? fmt(GAMES_UI.cup.bracket.betOddsTitle, {
                          odds: formatOdds(sideOdds),
                        })
                      : GAMES_UI.cup.bracket.betTitle
                  }
                  className={`flex flex-shrink-0 items-center gap-0.5 rounded-md border px-1 py-0.5 transition ${
                    wagered
                      ? 'border-amber-400/60 bg-amber-500/20'
                      : 'border-sky-200/15 bg-slate-900/60 opacity-60 hover:opacity-100'
                  }`}
                >
                  <GlizzyIcon
                    variant={0}
                    className={dense ? 'h-2 w-3' : 'h-2.5 w-4'}
                  />
                  {wagered ? (
                    <span
                      className={`font-mono font-bold text-amber-300 ${
                        dense ? 'text-[8px]' : 'text-[9px]'
                      }`}
                    >
                      {lockedOdds !== null
                        ? `+${Math.round(bet.stake * lockedOdds)}`
                        : bet.stake}
                    </span>
                  ) : (
                    sideOdds !== null && (
                      <span
                        className={`font-mono font-bold text-slate-400 ${
                          dense ? 'text-[8px]' : 'text-[9px]'
                        }`}
                      >
                        x{formatOdds(sideOdds)}
                      </span>
                    )
                  )}
                </button>
              )}
            </div>
          );
        })}
        {actionable && onWatch ? (
          <button
            onClick={() => onWatch(match.index)}
            className={`absolute z-10 whitespace-nowrap rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide shadow-md transition ${
              PILL_POS
            } ${
              involvesBet
                ? 'border-red-500/50 bg-slate-950 text-red-200 hover:border-red-400 hover:text-white'
                : 'border-sky-200/30 bg-slate-950 text-sky-200 hover:border-sky-200/60 hover:text-white'
            }`}
          >
            {involvesBet
              ? GAMES_UI.cup.bracket.yourMatch
              : GAMES_UI.cup.bracket.watch}
          </button>
        ) : match.result && bet ? (
          <span
            className={`absolute z-10 whitespace-nowrap rounded-full border border-sky-200/15 bg-slate-950 px-2 py-0.5 font-mono text-[8px] font-bold shadow-md ${
              PILL_POS
            } ${bet.won ? 'text-green-300' : 'text-red-400'}`}
          >
            {bet.won
              ? fmt(GAMES_UI.cup.bracket.betWon, { payout: bet.payout ?? 0 })
              : fmt(GAMES_UI.cup.bracket.betLost, { stake: bet.stake })}
          </span>
        ) : null}
      </div>
    );
  };

  const roundLabel = (r: number) => (
    <div className="flex h-5 items-center justify-center whitespace-nowrap text-[8px] font-bold uppercase tracking-wider text-slate-500">
      {cupRoundName(r)}
    </div>
  );

  const labelChip = (r: number) => (
    <span className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-sky-200/10 bg-slate-900 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-slate-500">
      {cupRoundName(r)}
    </span>
  );

  const championBanner = (
    <div
      className={`flex flex-col items-center gap-1 rounded-xl border px-3 py-2 ${
        champion
          ? 'border-amber-300/40 bg-amber-400/10'
          : 'border-sky-200/10 bg-slate-900/40'
      }`}
    >
      <Icon
        name="trophy"
        className={`h-4 w-4 ${champion ? 'text-amber-300' : 'text-slate-600'}`}
      />
      {champion ? (
        <>
          <PortraitHead character={champion} className="h-8 w-8" />
          <span className="max-w-24 truncate text-[10px] font-bold text-amber-200">
            {champion.name}
          </span>
        </>
      ) : (
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
          {GAMES_UI.cup.podium.screenTitle}
        </span>
      )}
    </div>
  );

  const gridColumn = (matches: CupMatch[], r: number, rows: string) => (
    <div className="flex w-[6.75rem] grow flex-shrink-0 flex-col">
      {roundLabel(r)}
      <div className={`grid flex-1 grid-cols-1 ${rows} gap-y-1.5`}>
        {matches.map((match) => (
          <div key={match.index} className="flex items-center">
            {matchCard(match, r, false)}
          </div>
        ))}
      </div>
    </div>
  );

  // Classic bracket connector: stubs leave the feeder cards at their centers,
  // meet a vertical spine halfway across, and a single stub continues to the
  // target card's center line.
  const pairConnector = (mirrored: boolean, cells: number) => (
    <div className="flex w-6 flex-shrink-0 flex-col">
      <div className="h-5" />
      <div
        className={`grid flex-1 ${
          cells === 2 ? 'grid-rows-2 gap-y-1.5' : 'grid-rows-1'
        }`}
      >
        {Array.from({ length: cells }, (_, i) => (
          <div key={i} className="relative">
            <div
              className={`absolute bottom-[calc(25%-3px)] top-[calc(25%-3px)] border-y-[3px] ${LINE} ${
                mirrored
                  ? 'left-[calc(50%-1.5px)] right-0 border-l-[3px]'
                  : 'left-0 right-[calc(50%-1.5px)] border-r-[3px]'
              }`}
            />
            <div
              className={`absolute top-[calc(50%-1.5px)] border-t-[3px] ${LINE} ${
                mirrored
                  ? 'left-0 right-[calc(50%-1.5px)]'
                  : 'left-[calc(50%-1.5px)] right-0'
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const lineConnector = (
    <div className="flex w-6 flex-shrink-0 flex-col">
      <div className="h-5" />
      <div className="relative flex-1">
        <div
          className={`absolute top-[calc(50%-1.5px)] w-full border-t-[3px] ${LINE}`}
        />
      </div>
    </div>
  );

  // Rotated connector for the vertical phone bracket. 'up' means the feeders
  // sit below and the target above.
  const vConnector = (up: boolean, cells: number, chipRound: number | null) => (
    <div className="relative">
      <div
        className={`grid h-9 ${
          cells === 2 ? 'grid-cols-2 gap-x-1' : 'grid-cols-1'
        }`}
      >
        {Array.from({ length: cells }, (_, i) => (
          <div key={i} className="relative">
            <div
              className={`absolute left-[calc(25%-2.5px)] right-[calc(25%-2.5px)] border-x-[3px] ${LINE} ${
                up
                  ? 'bottom-0 top-[calc(50%-1.5px)] border-t-[3px]'
                  : 'bottom-[calc(50%-1.5px)] top-0 border-b-[3px]'
              }`}
            />
            <div
              className={`absolute left-[calc(50%-1.5px)] border-l-[3px] ${LINE} ${
                up ? 'bottom-[calc(50%-1.5px)] top-0' : 'bottom-0 top-[calc(50%-1.5px)]'
              }`}
            />
          </div>
        ))}
      </div>
      {chipRound !== null && labelChip(chipRound)}
    </div>
  );

  const vLine = <div className={`mx-auto h-4 w-0 border-l-[3px] ${LINE}`} />;

  const vLineChip = (r: number) => (
    <div className="relative h-9">
      <div className={`absolute bottom-0 left-[calc(50%-1.5px)] top-0 border-l-[3px] ${LINE}`} />
      {labelChip(r)}
    </div>
  );

  return (
    <div className="w-full">
      {/* Horizontal converging bracket */}
      <div className="hidden w-full overflow-x-auto pb-2 sm:block">
        <div className="flex w-max min-w-full items-stretch">
          {gridColumn(rounds[0].slice(0, 4), 0, 'grid-rows-4')}
          {pairConnector(false, 2)}
          {gridColumn(rounds[1].slice(0, 2), 1, 'grid-rows-2')}
          {pairConnector(false, 1)}
          {gridColumn([rounds[2][0]], 2, 'grid-rows-1')}
          {lineConnector}
          <div className="flex w-32 grow flex-shrink-0 flex-col">
            {roundLabel(3)}
            <div className="grid flex-1 grid-cols-1 grid-rows-[1fr_auto_1fr]">
              <div className="flex items-end justify-center pb-2">
                {championBanner}
              </div>
              <div className="flex items-center">
                {matchCard(rounds[3][0], 3, false)}
              </div>
              <div />
            </div>
          </div>
          {lineConnector}
          {gridColumn([rounds[2][1]], 2, 'grid-rows-1')}
          {pairConnector(true, 1)}
          {gridColumn(rounds[1].slice(2, 4), 1, 'grid-rows-2')}
          {pairConnector(true, 2)}
          {gridColumn(rounds[0].slice(4, 8), 0, 'grid-rows-4')}
        </div>
      </div>

      {/* Vertical converging bracket for phones */}
      <div className="flex w-full flex-col sm:hidden">
        {roundLabel(0)}
        <div className="grid grid-cols-4 gap-x-1">
          {rounds[0].slice(0, 4).map((match) => (
            <div key={match.index} className="flex items-center">
              {matchCard(match, 0, true)}
            </div>
          ))}
        </div>
        {vConnector(false, 2, 1)}
        <div className="grid grid-cols-2 gap-x-1">
          {rounds[1].slice(0, 2).map((match) => (
            <div key={match.index} className="flex items-center">
              {matchCard(match, 1, false)}
            </div>
          ))}
        </div>
        {vConnector(false, 1, 2)}
        <div className="mx-auto w-1/2">
          {matchCard(rounds[2][0], 2, false)}
        </div>
        {vLineChip(3)}
        <div className="mx-auto w-2/3">
          {matchCard(rounds[3][0], 3, false, true)}
        </div>
        {vLine}
        <div className="mx-auto w-1/2">
          {matchCard(rounds[2][1], 2, false)}
        </div>
        {vConnector(true, 1, 2)}
        <div className="grid grid-cols-2 gap-x-1">
          {rounds[1].slice(2, 4).map((match) => (
            <div key={match.index} className="flex items-center">
              {matchCard(match, 1, false)}
            </div>
          ))}
        </div>
        {vConnector(true, 2, 1)}
        <div className="grid grid-cols-4 gap-x-1">
          {rounds[0].slice(4, 8).map((match) => (
            <div key={match.index} className="flex items-center">
              {matchCard(match, 0, true)}
            </div>
          ))}
        </div>
        {roundLabel(0)}
      </div>
    </div>
  );
}
