'use client';

import { useEffect, useMemo, useState } from 'react';
import GlizzyIcon from '@/components/icons/GlizzyIcon';
import CommentaryCaption from '@/components/games/CommentaryCaption';
import StakePicker from '@/components/games/StakePicker';
import MatchIntroOverlay from '@/components/games/match/MatchIntroOverlay';
import CareerToast from '@/components/games/career/CareerToast';
import CrowdToken from '@/components/games/career-mp/CrowdToken';
import SkipVotes from '@/components/games/career-mp/SkipVotes';
import {
  CAREER_BET_STAKE,
  CAREER_BET_STAKES,
} from '@/data/games/careerEconomy';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import type {
  CoachTagMap,
  CoachTokens,
  CrowdTokenData,
  RoomAction,
  RoomView,
} from '@/lib/types/careerMp';
import useMatchCommentary from '@/components/games/match/useMatchCommentary';
import { broadcastUnlocks } from '@/lib/utils/careerBroadcast';
import { isRivalMatch } from '@/lib/utils/careerRivals';
import { planCommentary } from '@/lib/utils/matchCommentary';
import {
  careerBettingUnlocked,
  formatOdds,
  matchOdds,
} from '@/lib/utils/careerOdds';
import type { SavedCareer } from '@/lib/utils/careerSave';
import { buildMatchTape } from '@/lib/utils/matchTape';
import { fmt } from '@/lib/utils/format';
import { cupRoundName } from '@/lib/utils/localeNames';
import { cupBetKey } from '@/lib/utils/tournamentSim';

const PM = GAMES_UI.careerMp.prematch;
const CB = GAMES_UI.careerMp.coachBar;
const CC = GAMES_UI.career.cup;

export function matchAtCursor(
  career: SavedCareer,
  phase: RoomView['phase'],
): { a: string; b: string } | null {
  if (phase.kind !== 'match-bets' && phase.kind !== 'match-clip') return null;
  const m = career.cup?.rounds[phase.stage.round]?.[phase.index];
  return m && m.a && m.b ? { a: m.a, b: m.b } : null;
}

export function tokensFor(
  view: RoomView,
  characterBySlug: Map<string, DuelCharacter>,
  settled = false,
): CoachTokens {
  const top: CrowdTokenData[] = [];
  const bottom: CrowdTokenData[] = [];
  let topPot = 0;
  let bottomPot = 0;
  const winner =
    settled && view.phase.kind === 'match-clip'
      ? view.phase.result.winner
      : null;
  view.publicBets.forEach((bet) => {
    const coach = view.coaches.find((c) => c.id === bet.coachId);
    const character = coach?.slug ? characterBySlug.get(coach.slug) : null;
    if (!coach || !character) return;
    const token: CrowdTokenData = {
      coachId: coach.id,
      name: coach.name,
      color: coach.color,
      stake: bet.stake,
      character,
      outcome: winner ? (bet.side === winner ? 'won' : 'lost') : null,
    };
    (bet.side === 'a' ? top : bottom).push(token);
    if (bet.side === 'a') topPot += bet.stake;
    else bottomPot += bet.stake;
  });
  return { top, bottom, topPot, bottomPot };
}

export function stageLabel(view: RoomView): string {
  const phase = view.phase;
  if (phase.kind !== 'match-bets' && phase.kind !== 'match-clip') return '';
  return fmt(PM.roundMatch, {
    round: cupRoundName(phase.stage.round),
    index: phase.index + 1,
    total: view.career?.cup?.rounds[phase.stage.round]?.length ?? 0,
  });
}

// The pre-match screen: the tape where the broadcast has it, the odds, a
// side and a stake, and the two stands filling up live as coaches pick
export default function PreMatchBets({
  view,
  characterBySlug,
  coaches,
  busy,
  serverOffset,
  send,
}: {
  view: RoomView;
  characterBySlug: Map<string, DuelCharacter>;
  coaches: CoachTagMap;
  busy: boolean;
  serverOffset: number;
  send: (action: RoomAction) => void;
}) {
  const [warning, setWarning] = useState(false);
  const [tick, setTick] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setTick(Date.now()), 500);
    return () => clearInterval(timer);
  }, []);
  const career = view.career;
  const phase = view.phase;
  const match = career ? matchAtCursor(career, phase) : null;
  const a = match ? characterBySlug.get(match.a) : undefined;
  const b = match ? characterBySlug.get(match.b) : undefined;
  // The commentator reads the match in over this card; the clip that follows
  // starts straight at the first glizzy. The outcome is not known yet, so the
  // intro is planned off an empty result and only its opening line is kept
  const intro = useMemo(() => {
    if (!career || !match || !a || !b) return null;
    if (!broadcastUnlocks(career).commentary) return null;
    const featured =
      match.a === career.playerSlug ||
      match.b === career.playerSlug ||
      (phase.kind === 'match-bets' &&
        phase.stage.round === (career.cup?.rounds.length ?? 1) - 1);
    return planCommentary(
      { turns: [], livesA: 0, livesB: 0, winner: 'a' },
      a,
      b,
      {
        states: career.characters,
        leaderSlug: career.cupStartRanks?.[0] ?? null,
        rival: isRivalMatch(career, match.a, match.b),
        featured,
        playerSlug: career.playerSlug,
      },
    ).filter((line) => line.frameIndex === 0);
    // One plan per match; the state it reads does not move while bets are open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match?.a, match?.b]);
  const { caption } = useMatchCommentary(intro, 0, false);
  if (!career || phase.kind !== 'match-bets' || !match || !a || !b) return null;
  const me = view.coaches.find((c) => c.id === view.coachId);
  const everyoneDecided = view.coaches.every((c) => c.passed);
  const mySlug = career.playerSlug;
  const bettingOpen = careerBettingUnlocked(career);
  const odds = matchOdds(career.characters, match.a, match.b);
  const myBet = career.cup?.matchBets[cupBetKey(phase.stage.round, phase.index)];
  const stake = career.betStake ?? CAREER_BET_STAKE;
  const tokens = tokensFor(view, characterBySlug);
  // The tape is the pre-match screen itself, open from the first match
  const tape = buildMatchTape(career, match.a, match.b);
  const bet = (side: 'a' | 'b') => {
    const sideSlug = side === 'a' ? match.a : match.b;
    const involvesMe = match.a === mySlug || match.b === mySlug;
    if (involvesMe && sideSlug !== mySlug && myBet?.side !== side) {
      setWarning(true);
      setTimeout(() => setWarning(false), 4000);
    }
    send({ type: 'bet', side });
  };

  // Under each side of the tape: the odds button (or the coach's own stake)
  // and the stand filling up with everyone who backed that side
  const sideBets = (side: 'a' | 'b') => {
    const slug = side === 'a' ? match.a : match.b;
    const sideOdds = side === 'a' ? odds.a : odds.b;
    const mine = myBet?.side === side;
    const list = side === 'a' ? tokens.top : tokens.bottom;
    return (
      <div
        className={`flex min-w-0 flex-1 flex-col items-center gap-2 rounded-xl border p-2 ${
          mine
            ? 'border-amber-400/60 bg-amber-500/10'
            : slug === mySlug
              ? 'border-emerald-400/30 bg-emerald-950/40'
              : 'border-sky-200/10 bg-slate-900/40'
        }`}
      >
        {bettingOpen && (
          <button
            onClick={() => (mine ? send({ type: 'removeBet' }) : bet(side))}
            disabled={busy}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-bold transition disabled:opacity-60 ${
              mine
                ? 'border-amber-400/60 bg-amber-500/20 text-amber-200'
                : 'border-sky-200/20 bg-slate-800/60 text-slate-200 hover:border-amber-300/60 hover:text-white'
            }`}
          >
            <GlizzyIcon variant={0} className="h-3 w-5" />
            {mine
              ? `x${formatOdds(myBet?.odds ?? sideOdds)} (+${Math.round((myBet?.stake ?? stake) * (myBet?.odds ?? sideOdds))})`
              : `x${formatOdds(sideOdds)}`}
          </button>
        )}
        <div className="flex min-h-11 w-full flex-wrap items-end justify-center gap-1">
          {list.length === 0 ? (
            <span className="text-[9px] uppercase tracking-widest text-slate-600">
              {PM.nobody}
            </span>
          ) : (
            list.map((token) => (
              <CrowdToken key={token.coachId} token={token} still />
            ))
          )}
        </div>
      </div>
    );
  };

  // Before the bookie opens there is nothing to bet on: the card is only the
  // tape and a ready button
  const footer = (
    <div className="flex flex-col items-center gap-3 border-t border-frost-border/20 pt-3">
      {bettingOpen && (
        <>
          <div className="flex w-full items-stretch gap-3">
            {sideBets('a')}
            {sideBets('b')}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {CC.stake}
            </span>
            <StakePicker
              options={CAREER_BET_STAKES}
              value={stake}
              balance={career.balance}
              onPick={(next) => send({ type: 'setBetStake', stake: next })}
            />
          </div>
        </>
      )}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {me?.passed ? (
          <span className="rounded-xl border border-emerald-400/50 bg-emerald-500/15 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-200">
            {myBet ? CB.passed : bettingOpen ? PM.passed : CB.ready}
          </span>
        ) : (
          <button
            onClick={() => send({ type: 'pass' })}
            disabled={busy}
            className="rounded-xl border border-sky-200/20 bg-slate-800/60 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-200 transition hover:border-sky-200/45 hover:text-white disabled:opacity-60"
          >
            {bettingOpen ? PM.pass : CB.ready}
          </button>
        )}
      </div>
      <p className="text-[10px] text-slate-500">
        {everyoneDecided && phase.deadline !== null
          ? fmt(PM.startingIn, {
              seconds: Math.max(
                0,
                Math.ceil((phase.deadline - (tick + serverOffset)) / 1000),
              ),
            })
          : PM.waiting}
      </p>
    </div>
  );

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-4">
      <span className="rounded-full border border-sky-200/20 bg-slate-950/70 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-sky-200 backdrop-blur-sm">
        {PM.title} · {stageLabel(view)}
      </span>
      <MatchIntroOverlay
        a={a}
        b={b}
        moodA={career.characters[match.a] ?? null}
        moodB={career.characters[match.b] ?? null}
        tape={tape}
        inline
        coachA={coaches[match.a] ?? null}
        coachB={coaches[match.b] ?? null}
        footer={footer}
      />
      <SkipVotes
        view={view}
        showClip={false}
        onVoteClip={() => undefined}
        onVoteRound={(on) => send({ type: 'voteSkipRound', on })}
        onVoteCup={(on) => send({ type: 'voteSkipCup', on })}
      />
      <CommentaryCaption line={caption} viewport />
      {warning && (
        <div className="fixed bottom-4 right-4 z-50">
          <CareerToast tone="danger">{PM.ownWarning}</CareerToast>
        </div>
      )}
    </div>
  );
}
