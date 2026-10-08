import { useEffect, useState } from 'react';
import { studioAccents } from '@/lib/constants/studioThemes';
import MatchViewer from '@/components/games/match/MatchViewer';
import TournamentBracket from '@/components/games/tournament/TournamentBracket';
import ActionIcon from '@/components/icons/ActionIcon';
import SeasonBackdrop from '@/components/games/SeasonBackdrop';
import StakePicker from '@/components/games/StakePicker';
import {
  CAREER_BET_FALLBACK_ODDS,
  CAREER_BET_STAKE,
  CAREER_BET_STAKES,
} from '@/data/games/careerEconomy';
import { livesForLevel } from '@/data/games/careerTraining';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import GameModal from '@/components/games/GameModal';
import FavorPicker, {
  type FavorCandidate,
} from '@/components/games/career/FavorPicker';
import {
  FAVOR_VOTE_COST,
  FAVOR_TARGET_EGO,
  FAVOR_TARGET_STRESS,
} from '@/data/games/careerElections';
import {
  bookAiRemoval,
  bookRemoval,
  canRemove,
  favorPending,
  favorsLeft,
  removalFor,
  roundParticipants,
} from '@/lib/utils/careerElections';
import BroadcastOpenPanel from '@/components/games/career/BroadcastOpenPanel';
import CareerToast from '@/components/games/career/CareerToast';
import EffectToast from '@/components/games/career/EffectToast';
import { derbyWinLetter } from '@/lib/utils/careerMail';
import type { CareerSlot, SavedCareer } from '@/lib/utils/careerSave';
import { planCommentary, type PlannedLine } from '@/lib/utils/matchCommentary';
import { broadcastUnlocks } from '@/lib/utils/careerBroadcast';
import {
  applyH2h,
  applyMatchToCharacters,
  participantFor,
} from '@/lib/utils/careerMatch';
import { buildMatchTape, type MatchTape } from '@/lib/utils/matchTape';
import { applyDerbyMeters, isRivalMatch } from '@/lib/utils/careerRivals';
import { NEUTRAL_FAME, pickCrowdFavourite } from '@/lib/utils/crowdMood';
import { clampMeter } from '@/lib/utils/careerMeters';
import { meterDeltaLines } from '@/lib/utils/careerReceipt';
import { scoutReveal } from '@/lib/utils/careerScouting';
import { careerBettingUnlocked, matchOdds } from '@/lib/utils/careerOdds';
import { buffedSlugsForSeason, seasonThemeIndex } from '@/lib/utils/cupSeason';
import { fmt } from '@/lib/utils/format';
import { playCoinSound } from '@/lib/utils/gameSounds';
import { cupRoundName } from '@/lib/utils/localeNames';
import {
  cupBetKey,
  cupMatchLoser,
  resolveCupMatch,
  simulateMatch,
  type CupMatch,
  type CupMatchResult,
} from '@/lib/utils/tournamentSim';

const CC = GAMES_UI.career.cup;
const FAVOR = GAMES_UI.career.favor;

type WatchingMatch = {
  round: number;
  index: number;
  a: string;
  b: string;
  result: CupMatchResult;
  supported: string;
  commentary: PlannedLine[] | null;
  tape: MatchTape | null;
};

export default function CareerCupPhase({
  career,
  characterBySlug,
  topBar,
  onOpenTable,
  onUpdate,
  onFinish,
  onMatchResult,
  slot,
}: {
  career: SavedCareer;
  characterBySlug: Map<string, DuelCharacter>;
  topBar: React.ReactNode;
  onOpenTable: () => void;
  onUpdate: (next: SavedCareer) => void;
  onFinish: (next: SavedCareer) => void;
  // Told after every resolved match with the state the match started from,
  // and after every round opens, once the update itself has gone out
  onMatchResult?: (
    prev: SavedCareer,
    round: number,
    index: number,
    result: CupMatchResult,
  ) => void;
  slot?: CareerSlot;
}) {
  const cup = career.cup;
  const [watching, setWatching] = useState<WatchingMatch | null>(null);
  const [tapeOpen, setTapeOpen] = useState(false);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const [favorOpen, setFavorOpen] = useState(false);
  const [againstWarning, setAgainstWarning] = useState(false);
  const [effectToast, setEffectToast] = useState<{
    title: string;
    lines: { text: string; good: boolean }[];
  } | null>(null);
  useEffect(() => {
    if (!againstWarning) return;
    const timer = setTimeout(() => setAgainstWarning(false), 4000);
    return () => clearTimeout(timer);
  }, [againstWarning]);
  useEffect(() => {
    if (!effectToast) return;
    const timer = setTimeout(() => setEffectToast(null), 6000);
    return () => clearTimeout(timer);
  }, [effectToast]);
  if (!cup) return null;

  const playerSlug = career.playerSlug;
  const bettingUnlocked = careerBettingUnlocked(career);
  const theme = seasonThemeIndex(career.season);
  const accent = studioAccents(theme);
  const buffedSlugs = buffedSlugsForSeason(career.season);
  const playerState = career.characters[playerSlug];

  const currentMatches = cup.rounds[cup.currentRound] ?? [];
  const roundDone =
    currentMatches.length > 0 && currentMatches.every((m) => m.result);
  const isFinalRound = cup.currentRound === cup.rounds.length - 1;
  const playerEliminated =
    cup.withdrawn ||
    cup.rounds.some((r) =>
      r.some((m) => m.result && cupMatchLoser(m) === playerSlug),
    );
  const playerCurrentMatch = currentMatches.find(
    (m) =>
      !m.result && m.a && m.b && (m.a === playerSlug || m.b === playerSlug),
  );

  const simFor = (state: SavedCareer, match: CupMatch): CupMatchResult => {
    const removal = removalFor(state, match.round, match.index);
    const optsFor = (slug: string) => {
      const opts: Parameters<typeof participantFor>[2] = {};
      if ((state.pendingPolice ?? []).includes(slug))
        opts.scriptedForfeit = 'police';
      // The party's people at the door: a walkover before the first glizzy
      if (removal?.targetSlug === slug) opts.scriptedForfeit = 'removed';
      return opts;
    };
    const result = simulateMatch(
      participantFor(state, match.a as string, optsFor(match.a as string)),
      participantFor(state, match.b as string, optsFor(match.b as string)),
    );
    return removal && result.reason === 'removed'
      ? { ...result, removedBy: removal.byParty }
      : result;
  };

  const settleBet = (
    state: SavedCareer,
    round: number,
    index: number,
    result: CupMatchResult,
  ): SavedCareer => {
    const stateCup = state.cup;
    if (!stateCup) return state;
    const key = cupBetKey(round, index);
    const bet = stateCup.matchBets[key];
    if (!bet || bet.won !== undefined) return state;
    const won = bet.side === result.winner;
    const payout = won
      ? Math.round(bet.stake * (bet.odds ?? CAREER_BET_FALLBACK_ODDS))
      : 0;
    let next: SavedCareer = {
      ...state,
      balance: state.balance + payout,
      cup: {
        ...stateCup,
        matchBets: { ...stateCup.matchBets, [key]: { ...bet, won, payout } },
      },
    };
    // Betting against your own character and cashing in can leak
    const match = stateCup.rounds[round][index];
    const mySide =
      match.a === state.playerSlug
        ? 'a'
        : match.b === state.playerSlug
          ? 'b'
          : null;
    if (won && mySide && bet.side !== mySide && Math.random() < 0.6) {
      const ch = next.characters[state.playerSlug];
      next = {
        ...next,
        characters: {
          ...next.characters,
          [state.playerSlug]: {
            ...ch,
            stress: clampMeter(ch.stress + 25),
            ego: clampMeter(ch.ego - 20),
          },
        },
        newsQueue: [
          ...next.newsQueue,
          {
            kind: 'scandal',
            templateKey: 'scandal',
            params: {},
            slugs: [state.playerSlug],
            freezeframe: 'crying',
          },
        ],
      };
    }
    return next;
  };

  const resolveMatch = (
    state: SavedCareer,
    round: number,
    index: number,
    result: CupMatchResult,
  ): SavedCareer => {
    const stateCup = state.cup;
    if (!stateCup) return state;
    const match = stateCup.rounds[round][index];
    let characters = applyMatchToCharacters(
      state.characters,
      match.a as string,
      match.b as string,
      result,
      state.season,
    );
    const h2h = applyH2h(
      state.h2h,
      match.a as string,
      match.b as string,
      (result.winner === 'a' ? match.a : match.b) as string,
    );
    let mail = state.mail;
    if (isRivalMatch(state, match.a, match.b)) {
      const winner = result.winner === 'a' ? match.a : match.b;
      characters = applyDerbyMeters(
        characters,
        state.playerSlug,
        state.rivalSlug as string,
        winner === state.playerSlug,
      );
      if (winner === state.playerSlug) {
        mail = [
          ...mail,
          derbyWinLetter(state.year, state.season, state.rivalSlug as string),
        ];
      }
    }
    const next: SavedCareer = {
      ...state,
      characters,
      mail,
      h2h,
      cup: {
        ...stateCup,
        rounds: resolveCupMatch(stateCup.rounds, round, index, result),
      },
      // The loser is out of the cup, warrant served or not. A warrant on the
      // winner, when both were indicted or the other side never showed,
      // follows him into the next round
      pendingPolice: (state.pendingPolice ?? []).filter(
        (slug) => slug !== (result.winner === 'a' ? match.b : match.a),
      ),
    };
    return settleBet(
      applyRemoval(next, round, index, result),
      round,
      index,
      result,
    );
  };

  // A removal that landed: the target takes the hit, the paper gets the
  // party's reason, and the party pays for it at the next count
  const applyRemoval = (
    state: SavedCareer,
    round: number,
    index: number,
    result: CupMatchResult,
  ): SavedCareer => {
    const removal = removalFor(state, round, index);
    const stateCup = state.cup;
    if (!removal || !stateCup || result.reason !== 'removed') return state;
    const target = state.characters[removal.targetSlug];
    const parliament = state.parliament;
    return {
      ...state,
      characters: {
        ...state.characters,
        [removal.targetSlug]: {
          ...target,
          stress: clampMeter(target.stress + FAVOR_TARGET_STRESS),
          ego: clampMeter(target.ego + FAVOR_TARGET_EGO),
        },
      },
      cup: {
        ...stateCup,
        removals: (stateCup.removals ?? []).filter((r) => r !== removal),
        removed: [...(stateCup.removed ?? []), removal.targetSlug],
      },
      parliament: parliament
        ? {
            ...parliament,
            penalties: {
              ...parliament.penalties,
              [removal.byParty]:
                parliament.penalties[removal.byParty] + FAVOR_VOTE_COST,
            },
          }
        : parliament,
    };
  };

  const playerParty = playerState.sponsor?.sponsorId ?? null;
  const favorCandidates: FavorCandidate[] = roundParticipants(
    currentMatches,
    cup.removals,
  )
    .filter(
      (p, i, all) =>
        p.slug !== playerSlug && all.findIndex((q) => q.slug === p.slug) === i,
    )
    .map((p) => {
      const ok = canRemove(career, playerSlug, p.slug);
      const own = career.characters[p.slug]?.sponsor?.sponsorId === playerParty;
      return {
        ...p,
        ok,
        ...(ok
          ? {}
          : { blocked: own ? ('own' as const) : ('protected' as const) }),
        opponent:
          playerCurrentMatch?.index === p.index &&
          (playerCurrentMatch.a === p.slug || playerCurrentMatch.b === p.slug),
      };
    });
  const favorsRemaining = favorsLeft(career, playerSlug);
  const favorReady =
    favorsRemaining > 0 &&
    !favorPending(career) &&
    !isFinalRound &&
    !roundDone;

  const spendFavor = (targetSlug: string, index: number) => {
    const party = playerState.sponsor?.sponsorId;
    if (!party || !canRemove(career, playerSlug, targetSlug)) return;
    setFavorOpen(false);
    setEffectToast({ title: FAVOR.toast, lines: [] });
    onUpdate(
      bookRemoval(career, {
        round: cup.currentRound,
        index,
        targetSlug,
        bySlug: playerSlug,
        byParty: party,
      }),
    );
  };

  const watchMatch = (index: number) => {
    const match = currentMatches[index];
    if (!match || !match.a || !match.b || match.result) return;
    const bet = cup.matchBets[cupBetKey(cup.currentRound, index)];
    const supported =
      match.a === playerSlug || match.b === playerSlug
        ? playerSlug
        : bet && bet.won === undefined
          ? ((bet.side === 'a' ? match.a : match.b) as string)
          : pickCrowdFavourite(
              match.a as string,
              career.characters[match.a as string]?.fame ?? NEUTRAL_FAME,
              match.b as string,
              career.characters[match.b as string]?.fame ?? NEUTRAL_FAME,
            );
    const result = simFor(career, match);
    const broadcast = broadcastUnlocks(career);
    setWatching({
      round: cup.currentRound,
      index,
      a: match.a,
      b: match.b,
      result,
      supported,
      commentary: broadcast.commentary
        ? planCommentary(
            result,
            characterBySlug.get(match.a) as DuelCharacter,
            characterBySlug.get(match.b) as DuelCharacter,
            {
              states: career.characters,
              leaderSlug: career.cupStartRanks?.[0] ?? null,
              rival: isRivalMatch(career, match.a, match.b),
              featured:
                match.a === playerSlug ||
                match.b === playerSlug ||
                isFinalRound,
              playerSlug,
            },
          )
        : null,
      tape: broadcast.tape ? buildMatchTape(career, match.a, match.b) : null,
    });
  };

  // The newspaper only reports the leak next season; the toast shows the
  // damage the moment it lands
  const scandalLeaked = (prev: SavedCareer, next: SavedCareer) =>
    next.newsQueue
      .slice(prev.newsQueue.length)
      .some((item) => item.kind === 'scandal');

  const flashScandal = (prev: SavedCareer, next: SavedCareer) => {
    if (!scandalLeaked(prev, next)) return;
    setEffectToast({
      title: CC.scandalToast,
      lines: meterDeltaLines(
        prev.characters[playerSlug],
        next.characters[playerSlug],
      ),
    });
  };

  const finishWatching = () => {
    if (!watching) return;
    const bet = cup.matchBets[cupBetKey(watching.round, watching.index)];
    if (bet && bet.won === undefined && bet.side === watching.result.winner) {
      playCoinSound(bet.stake);
    }
    const next = resolveMatch(
      career,
      watching.round,
      watching.index,
      watching.result,
    );
    flashScandal(career, next);
    onUpdate(next);
    onMatchResult?.(career, watching.round, watching.index, watching.result);
    setWatching(null);
    setTapeOpen(false);
  };

  const placeBet = (index: number, side: 'a' | 'b') => {
    const match = currentMatches[index];
    if (!match || !match.a || !match.b) return;
    const key = cupBetKey(cup.currentRound, index);
    const existing = cup.matchBets[key];
    let balance = career.balance;
    const bets = { ...cup.matchBets };
    if (existing && existing.won === undefined) {
      balance += existing.stake;
      if (existing.side === side) {
        delete bets[key];
        onUpdate({ ...career, balance, cup: { ...cup, matchBets: bets } });
        return;
      }
    }
    const stake = career.betStake ?? CAREER_BET_STAKE;
    if (balance < stake) return;
    balance -= stake;
    const odds = matchOdds(career.characters, match.a, match.b);
    bets[key] = {
      side,
      stake,
      odds: side === 'a' ? odds.a : odds.b,
    };
    onUpdate({ ...career, balance, cup: { ...cup, matchBets: bets } });
  };

  const toggleBet = (index: number, side: 'a' | 'b') => {
    if (!bettingUnlocked) return;
    const match = currentMatches[index];
    if (!match || match.result) return;
    const sideSlug = side === 'a' ? match.a : match.b;
    const involvesPlayer = match.a === playerSlug || match.b === playerSlug;
    const existing = cup.matchBets[cupBetKey(cup.currentRound, index)];
    if (involvesPlayer && sideSlug !== playerSlug && existing?.side !== side) {
      setAgainstWarning(true);
    }
    placeBet(index, side);
  };

  type Resolved = [SavedCareer, number, number, CupMatchResult];

  const skipPendingInRound = () => {
    let next = career;
    const resolved: Resolved[] = [];
    for (let i = 0; i < currentMatches.length; i++) {
      const match = next.cup?.rounds[cup.currentRound][i];
      if (match && !match.result && match.a && match.b) {
        const result = simFor(next, match);
        resolved.push([next, cup.currentRound, i, result]);
        next = resolveMatch(next, cup.currentRound, i, result);
      }
    }
    flashScandal(career, next);
    onUpdate(next);
    resolved.forEach((entry) => onMatchResult?.(...entry));
  };

  // Plays the rest of the cup out and lands on the finished final, so the
  // bracket can be read before the podium
  const skipToFinal = () => {
    let next = career;
    const resolved: Resolved[] = [];
    for (let r = cup.currentRound; r < cup.rounds.length; r++) {
      const size = cup.rounds[r].length;
      for (let i = 0; i < size; i++) {
        const match = next.cup?.rounds[r][i];
        if (match && !match.result && match.a && match.b) {
          const result = simFor(next, match);
          resolved.push([next, r, i, result]);
          next = resolveMatch(next, r, i, result);
        }
      }
    }
    if (!next.cup) return;
    flashScandal(career, next);
    onUpdate({
      ...next,
      cup: { ...next.cup, currentRound: cup.rounds.length - 1 },
    });
    resolved.forEach((entry) => onMatchResult?.(...entry));
  };

  const advance = () => {
    if (isFinalRound) {
      onFinish(career);
      return;
    }
    // The league's donors get their turn at the start of every round
    onUpdate(
      bookAiRemoval(
        { ...career, cup: { ...cup, currentRound: cup.currentRound + 1 } },
        cup.currentRound + 1,
      ),
    );
  };

  const withdraw = () => {
    setConfirmWithdraw(false);
    const match = playerCurrentMatch;
    if (!match) return;
    const playerSide = match.a === playerSlug ? 'a' : 'b';
    const opponentSlug = (playerSide === 'a' ? match.b : match.a) as string;
    const chA = career.characters[match.a as string];
    const chB = career.characters[match.b as string];
    const result: CupMatchResult = {
      turns: [],
      livesA: livesForLevel(chA?.livesCap.level ?? 0),
      livesB: livesForLevel(chB?.livesCap.level ?? 0),
      winner: playerSide === 'a' ? 'b' : 'a',
      reason: 'withdrawn',
      livesCapA: livesForLevel(chA?.livesCap.level ?? 0),
      livesCapB: livesForLevel(chB?.livesCap.level ?? 0),
    };
    const opponent = career.characters[opponentSlug];
    const fanTrained = playerState.fanSkill.level >= 2;
    const characters = {
      ...career.characters,
      [playerSlug]: {
        ...playerState,
        withdrawals: playerState.withdrawals + 1,
        fame: clampMeter(playerState.fame - (fanTrained ? 0 : 10)),
        ego: clampMeter(playerState.ego - 6),
        ambition: clampMeter(playerState.ambition - 4),
      },
      [opponentSlug]: { ...opponent, wins: opponent.wins + 1 },
    };
    let next: SavedCareer = {
      ...career,
      characters,
      cup: {
        ...cup,
        withdrawn: true,
        rounds: resolveCupMatch(
          cup.rounds,
          cup.currentRound,
          match.index,
          result,
        ),
      },
    };
    next = settleBet(next, cup.currentRound, match.index, result);
    setEffectToast({
      title: scandalLeaked(career, next) ? CC.scandalToast : CC.withdrawToast,
      lines: meterDeltaLines(playerState, next.characters[playerSlug]),
    });
    onUpdate(next);
    onMatchResult?.(career, cup.currentRound, match.index, result);
  };

  return (
    <div className="relative min-h-[calc(100dvh-10rem)] w-full overflow-hidden group-[:fullscreen]:min-h-screen">
      <SeasonBackdrop season={career.season} />
      <div className="absolute inset-0 bg-slate-950/55" />
      <div className="absolute inset-x-2 top-2 z-40">{topBar}</div>
      <div className="relative z-10 mx-auto flex w-full flex-col items-center gap-4 px-2 pb-4 pt-28 sm:px-4 sm:pt-16 lg:min-h-[calc(100dvh-10rem)] lg:justify-center lg:group-[:fullscreen]:min-h-[91vh] lg:group-[:fullscreen]:max-w-[1024px] lg:group-[:fullscreen]:[zoom:1.1] xl:group-[:fullscreen]:max-w-[1140px] xl:group-[:fullscreen]:[zoom:1.1] 2xl:group-[:fullscreen]:min-h-[80vh] 2xl:group-[:fullscreen]:max-w-[1400px] 2xl:group-[:fullscreen]:[zoom:1.25]">
        <div className="flex w-full flex-wrap items-center justify-center gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${accent.chip}`}
          >
            {cupRoundName(cup.currentRound)}
          </span>
          <button
            onClick={onOpenTable}
            title={GAMES_UI.career.table.title}
            className="rounded-full border border-sky-200/15 bg-slate-950/70 p-2 text-sky-300 backdrop-blur-sm transition hover:border-sky-200/40 hover:text-white"
          >
            <ActionIcon kind="table" className="h-3.5 w-3.5" />
          </button>
          {watching?.tape && (
            <button
              onClick={() => setTapeOpen((open) => !open)}
              title={GAMES_UI.career.broadcast.tape}
              className={`rounded-full border p-2 backdrop-blur-sm transition ${
                tapeOpen
                  ? 'border-sky-200/50 bg-sky-200/10 text-white'
                  : 'border-sky-200/15 bg-slate-950/70 text-sky-300 hover:border-sky-200/40 hover:text-white'
              }`}
            >
              <ActionIcon kind="stats" className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {watching ? (
          <MatchViewer
            a={characterBySlug.get(watching.a) as DuelCharacter}
            b={characterBySlug.get(watching.b) as DuelCharacter}
            result={watching.result}
            betSlug={playerSlug}
            supportedSlug={watching.supported}
            isFinal={watching.round === cup.rounds.length - 1}
            theme={theme}
            sponsorA={career.characters[watching.a]?.sponsor?.sponsorId ?? null}
            sponsorB={career.characters[watching.b]?.sponsor?.sponsorId ?? null}
            moodA={career.characters[watching.a] ?? null}
            moodB={career.characters[watching.b] ?? null}
            revealA={scoutReveal(playerState, watching.a === playerSlug)}
            revealB={scoutReveal(playerState, watching.b === playerSlug)}
            commentary={watching.commentary}
            tape={watching.tape}
            tapeForced={tapeOpen}
            onTapeClose={() => setTapeOpen(false)}
            onDone={finishWatching}
          />
        ) : (
          <>
            {confirmWithdraw && (
              <GameModal
                title={CC.withdraw}
                onClose={() => setConfirmWithdraw(false)}
              >
                <div className="flex flex-col items-center gap-3">
                  <p className="text-center text-sm font-semibold text-red-200">
                    {CC.withdrawConfirm}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      onClick={withdraw}
                      className="rounded-lg border border-red-500/40 bg-red-500/15 px-4 py-1.5 text-xs font-semibold text-red-200 transition hover:border-red-500/60 hover:text-white"
                    >
                      {CC.withdrawYes}
                    </button>
                    <button
                      onClick={() => setConfirmWithdraw(false)}
                      className="rounded-lg border border-sky-200/20 bg-slate-800/60 px-4 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-sky-200/40 hover:text-white"
                    >
                      {CC.withdrawNo}
                    </button>
                  </div>
                </div>
              </GameModal>
            )}

            {favorOpen && playerParty && (
              <FavorPicker
                party={playerParty}
                candidates={favorCandidates}
                characterBySlug={characterBySlug}
                onConfirm={spendFavor}
                onClose={() => setFavorOpen(false)}
              />
            )}

            {(favorReady || (!playerEliminated && playerCurrentMatch)) && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {favorReady && (
                  <button
                    onClick={() => setFavorOpen(true)}
                    className="rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-200 transition hover:border-amber-300 hover:text-white"
                  >
                    {fmt(FAVOR.button, { left: favorsRemaining })}
                  </button>
                )}
                {!playerEliminated && playerCurrentMatch && (
                  <button
                    onClick={() => setConfirmWithdraw(true)}
                    className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-red-300/80 transition hover:border-red-500/60 hover:text-red-200"
                  >
                    {CC.withdraw}
                  </button>
                )}
              </div>
            )}

            {bettingUnlocked && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {CC.stake}
                </span>
                <StakePicker
                  options={CAREER_BET_STAKES}
                  value={career.betStake ?? CAREER_BET_STAKE}
                  balance={career.balance}
                  onPick={(stake) => onUpdate({ ...career, betStake: stake })}
                />
              </div>
            )}

            {broadcastUnlocks(career).open &&
              cup.currentRound === 0 &&
              !cup.rounds[0].some((m) => m.result) && (
                <BroadcastOpenPanel
                  career={career}
                  characterBySlug={characterBySlug}
                  slot={slot}
                />
              )}

            <div className="flex w-full overflow-x-auto [justify-content:safe_center]">
              <TournamentBracket
                rounds={cup.rounds}
                characterBySlug={characterBySlug}
                betSlug={playerSlug}
                currentRound={cup.currentRound}
                matchBets={cup.matchBets}
                buffedSlugs={buffedSlugs}
                oddsFor={
                  bettingUnlocked
                    ? (match) =>
                        match.a && match.b
                          ? matchOdds(career.characters, match.a, match.b)
                          : null
                    : undefined
                }
                onWatch={watchMatch}
                onToggleBet={bettingUnlocked ? toggleBet : undefined}
              />
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {!roundDone && (
                <button
                  onClick={skipPendingInRound}
                  className="rounded-xl border border-sky-200/20 bg-slate-800/50 px-5 py-2 text-sm font-semibold text-slate-300 transition hover:border-sky-200/40 hover:text-white"
                >
                  {GAMES_UI.cup.controls.skipRemaining}
                </button>
              )}
              {roundDone && (
                <button
                  onClick={advance}
                  className={
                    isFinalRound
                      ? 'rounded-xl border border-red-500/40 bg-red-500/15 px-6 py-2 text-sm font-semibold text-red-200 transition hover:border-red-500/60 hover:bg-red-500/25 hover:text-white'
                      : 'rounded-xl border border-sky-200/20 bg-slate-800/50 px-6 py-2 text-sm font-semibold text-slate-300 transition hover:border-sky-200/40 hover:text-white'
                  }
                >
                  {isFinalRound
                    ? GAMES_UI.cup.controls.podium
                    : GAMES_UI.cup.controls.nextRound}
                </button>
              )}
              {playerEliminated && !(roundDone && isFinalRound) && (
                <button
                  onClick={skipToFinal}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2 text-sm font-semibold text-red-300 transition hover:border-red-500/60 hover:text-white"
                >
                  {GAMES_UI.cup.elimination.toFinal}
                </button>
              )}
            </div>
          </>
        )}
      </div>
      {(againstWarning || effectToast) && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
          {effectToast && (
            <EffectToast title={effectToast.title} lines={effectToast.lines} />
          )}
          {againstWarning && (
            <CareerToast tone="danger">{CC.betAgainstWarning}</CareerToast>
          )}
        </div>
      )}
    </div>
  );
}
