'use client';

import { useEffect, useMemo, useState } from 'react';
import CareerButton from '@/components/games/career/CareerButton';
import BrassPlate from '@/components/games/career/street/BrassPlate';
import CommentaryCaption from '@/components/games/CommentaryCaption';
import PaperSheet from '@/components/games/career/street/PaperSheet';
import GlizzyIcon from '@/components/icons/GlizzyIcon';
import StakePicker from '@/components/games/StakePicker';
import MatchIntroOverlay from '@/components/games/match/MatchIntroOverlay';
import CareerToast from '@/components/games/career/CareerToast';
import CrowdToken from '@/components/games/career-mp/CrowdToken';
import RoomPlank from '@/components/games/career-mp/RoomPlank';
import RoomSign from '@/components/games/career-mp/RoomSign';
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
  const myBet =
    career.cup?.matchBets[cupBetKey(phase.stage.round, phase.index)];
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

  // Under each side of the tape: the bookmaker's slip with the odds to tear
  // off (or the coach's own stake stamped on it) and everyone who backed that
  // side
  const sideBets = (side: 'a' | 'b') => {
    const slug = side === 'a' ? match.a : match.b;
    const fighter = side === 'a' ? a : b;
    const sideOdds = side === 'a' ? odds.a : odds.b;
    const mine = myBet?.side === side;
    const list = side === 'a' ? tokens.top : tokens.bottom;
    return (
      <PaperSheet
        className={`flex min-w-0 flex-1 flex-col items-center gap-1.5 bg-[#f9edb8]! px-2 pb-2.5 pt-3 ${
          side === 'a' ? 'rotate-[-0.6deg]' : 'rotate-[0.6deg]'
        }`}
      >
        <span
          aria-hidden="true"
          className="absolute inset-x-1 top-1 h-1 bg-[radial-gradient(circle,rgb(28_20_8/0.55)_1.5px,transparent_2px)] bg-[length:9px_4px]"
        />
        <span
          className={`max-w-full truncate px-1 font-serif text-[13px] font-semibold text-slate-100 ${
            slug === mySlug ? 'bg-[#fde047]/55' : ''
          }`}
        >
          {fighter.name}
        </span>
        <button
          type="button"
          aria-pressed={mine}
          onClick={() => (mine ? send({ type: 'removeBet' }) : bet(side))}
          disabled={busy}
          className={`flex min-h-11 w-full items-center justify-center gap-1.5 rounded-[3px] border-2 px-1 font-sign text-xl font-bold leading-none tabular-nums transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e3a8a] disabled:cursor-not-allowed motion-reduce:transition-none ${
            mine
              ? 'rotate-[-1.5deg] border-[#b91c1c] text-[#b91c1c]'
              : 'border-dashed border-[#1c1408]/45 text-slate-100 enabled:hover:border-solid enabled:hover:border-[#1c1408]'
          }`}
        >
          <GlizzyIcon variant={0} className="h-3 w-5 shrink-0" />
          {mine
            ? `x${formatOdds(myBet?.odds ?? sideOdds)} (+${Math.round((myBet?.stake ?? stake) * (myBet?.odds ?? sideOdds))})`
            : `x${formatOdds(sideOdds)}`}
        </button>
        <div className="flex min-h-11 w-full flex-wrap items-end justify-center gap-1">
          {list.length === 0 ? (
            <span className="font-sign text-[12px] font-semibold uppercase tracking-[0.06em] text-slate-500">
              {PM.nobody}
            </span>
          ) : (
            list.map((token) => (
              <CrowdToken key={token.coachId} token={token} still />
            ))
          )}
        </div>
      </PaperSheet>
    );
  };

  const decide = (
    <>
      {me?.passed ? (
        <span className="inline-flex min-h-11 items-center">
          <span className="rotate-[-2deg] rounded-[3px] border-2 border-emerald-300 px-3 py-1 font-sign text-[15px] font-bold uppercase tracking-[0.1em] text-emerald-300">
            {myBet ? CB.passed : bettingOpen ? PM.passed : CB.ready}
          </span>
        </span>
      ) : (
        <CareerButton
          tone="quiet"
          onClick={() => send({ type: 'pass' })}
          disabled={busy}
          className="min-h-11"
        >
          {bettingOpen ? PM.pass : CB.ready}
        </CareerButton>
      )}
      {everyoneDecided && phase.deadline !== null && (
        <p className="font-sign text-[14px] font-semibold tabular-nums tracking-[0.04em] text-slate-200">
          {fmt(PM.startingIn, {
            seconds: Math.max(
              0,
              Math.ceil((phase.deadline - (tick + serverOffset)) / 1000),
            ),
          })}
        </p>
      )}
    </>
  );

  return (
    <div className="flex w-full max-w-5xl flex-col items-center gap-4">
      <RoomSign>
        {PM.title} · {stageLabel(view)}
      </RoomSign>
      <div className="flex w-full flex-col items-center gap-3 lg:flex-row lg:items-start lg:justify-center">
        <MatchIntroOverlay
          a={a}
          b={b}
          moodA={career.characters[match.a] ?? null}
          moodB={career.characters[match.b] ?? null}
          tape={tape}
          inline
          coachA={coaches[match.a] ?? null}
          coachB={coaches[match.b] ?? null}
          footer={
            bettingOpen ? undefined : (
              <div className="flex flex-col items-center gap-3 border-t-[3px] border-[#b8862f] pt-3">
                {decide}
              </div>
            )
          }
        />
        {/* The window to bet is short, so the slips sit beside the tape, and
            above it on a phone, rather than under a tall sheet */}
        {bettingOpen && (
          <div className="flex w-full max-w-md shrink-0 flex-col items-center gap-3 max-lg:order-first sm:max-w-lg lg:w-96">
            <div className="flex w-full items-stretch gap-3">
              {sideBets('a')}
              {sideBets('b')}
            </div>
            <RoomPlank className="flex w-full flex-col items-center gap-2">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <BrassPlate>{CC.stake}</BrassPlate>
                <StakePicker
                  options={CAREER_BET_STAKES}
                  value={stake}
                  balance={career.balance}
                  onPick={(next) => send({ type: 'setBetStake', stake: next })}
                />
              </div>
              {decide}
            </RoomPlank>
          </div>
        )}
      </div>
      <SkipVotes
        view={view}
        showClip={false}
        onVoteClip={() => undefined}
        onVoteRound={(on) => send({ type: 'voteSkipRound', on })}
        onVoteCup={(on) => send({ type: 'voteSkipCup', on })}
      />
      <CommentaryCaption line={caption} viewport />
      {warning && (
        <div className="fixed bottom-20 right-4 z-50">
          <CareerToast tone="danger">{PM.ownWarning}</CareerToast>
        </div>
      )}
    </div>
  );
}
