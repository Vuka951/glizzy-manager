'use client';

import { useEffect, useMemo, useState } from 'react';
import ActionIcon from '@/components/icons/ActionIcon';
import MatchIntroOverlay from '@/components/games/match/MatchIntroOverlay';
import MatchViewer from '@/components/games/match/MatchViewer';
import SkipVotes from '@/components/games/career-mp/SkipVotes';
import {
  matchAtCursor,
  stageLabel,
  tokensFor,
} from '@/components/games/career-mp/PreMatchBets';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import { CLIP_INTRO_ALLOWANCE_MS } from '@/lib/constants/careerMp';
import type { CoachTagMap, RoomAction, RoomView } from '@/lib/types/careerMp';
import { broadcastUnlocks } from '@/lib/utils/careerBroadcast';
import { isRivalMatch } from '@/lib/utils/careerRivals';
import { scoutReveal } from '@/lib/utils/careerScouting';
import { NEUTRAL_FAME, pickCrowdFavourite } from '@/lib/utils/crowdMood';
import { seasonThemeIndex } from '@/lib/utils/cupSeason';
import { planCommentary } from '@/lib/utils/matchCommentary';
import { buildMatchTape } from '@/lib/utils/matchTape';
import { fmt } from '@/lib/utils/format';
import { playCoinSound } from '@/lib/utils/gameSounds';
import { cupBetKey } from '@/lib/utils/tournamentSim';

const CL = GAMES_UI.careerMp.clip;

// The clip every screen in the room watches at once: it starts wherever the
// server's clock says it is, the crowd holds the coaches' tokens, and the
// server moves everyone on after the linger
export default function SyncedMatchStage({
  view,
  characterBySlug,
  coaches,
  serverOffset,
  send,
}: {
  view: RoomView;
  characterBySlug: Map<string, DuelCharacter>;
  coaches: CoachTagMap;
  serverOffset: number;
  send: (action: RoomAction) => void;
}) {
  const career = view.career;
  const phase = view.phase;
  const [tapeOpen, setTapeOpen] = useState(false);
  const [tick, setTick] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setTick(Date.now()), 100);
    return () => clearInterval(timer);
  }, []);
  const match = career ? matchAtCursor(career, phase) : null;
  // The coach's own bet on this clip, for the payout sound when it lands
  const ownBet =
    career && phase.kind === 'match-clip'
      ? career.cup?.matchBets[cupBetKey(phase.stage.round, phase.index)]
      : undefined;
  const settledWin =
    phase.kind === 'match-clip' &&
    tick + serverOffset >=
      (phase.playback.skippedAt ??
        phase.playback.startedAt + phase.playback.durationMs) &&
    ownBet !== undefined &&
    ownBet.side === phase.result.winner
      ? ownBet.stake
      : 0;
  useEffect(() => {
    if (settledWin > 0) playCoinSound(settledWin);
  }, [settledWin]);
  // One result object per clip: a poll hands over a fresh copy each time,
  // and the viewer and the commentary plan must not see it as a new match
  const clipKey =
    phase.kind === 'match-clip'
      ? `${phase.playback.startedAt}-${phase.index}`
      : '';
  const result = useMemo(
    () => (phase.kind === 'match-clip' ? phase.result : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clipKey],
  );
  const playback = phase.kind === 'match-clip' ? phase.playback : null;
  const a = match ? characterBySlug.get(match.a) : undefined;
  const b = match ? characterBySlug.get(match.b) : undefined;
  const startedAt = playback?.startedAt ?? 0;
  // The clip is scheduled a moment ahead: until the server's clock reaches
  // startedAt every screen holds on the tape, then all start at once
  const started = tick + serverOffset >= startedAt;
  // The viewer reads the offset once, on mount, so the tick moving it later
  // is harmless
  const startOffset = started
    ? Math.max(0, tick + serverOffset - startedAt - CLIP_INTRO_ALLOWANCE_MS)
    : null;
  const commentary = useMemo(() => {
    if (!career || !match || !result || !a || !b) return null;
    if (!broadcastUnlocks(career).commentary) return null;
    const featured =
      match.a === career.playerSlug ||
      match.b === career.playerSlug ||
      (phase.kind === 'match-clip' &&
        phase.stage.round === (career.cup?.rounds.length ?? 1) - 1);
    // The intro already played over the pre-match card, the clip carries on
    return planCommentary(result, a, b, {
      states: career.characters,
      leaderSlug: career.cupStartRanks?.[0] ?? null,
      rival: isRivalMatch(career, match.a, match.b),
      featured,
      playerSlug: career.playerSlug,
    }).filter((line) => line.frameIndex > 0);
    // The plan is made once per clip; the state it reads does not move mid-clip
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);
  if (phase.kind !== 'match-clip' || !career || !match || !a || !b) return null;
  const clip = phase;
  const stage = clip.stage;
  const clipResult = result ?? clip.result;
  const clipPlayback = clip.playback;

  const mySlug = career.playerSlug;
  const myBet = career.cup?.matchBets[cupBetKey(stage.round, clip.index)];
  const supported =
    match.a === mySlug || match.b === mySlug
      ? mySlug
      : myBet
        ? myBet.side === 'a'
          ? match.a
          : match.b
        : pickCrowdFavourite(
            match.a,
            career.characters[match.a]?.fame ?? NEUTRAL_FAME,
            match.b,
            career.characters[match.b]?.fame ?? NEUTRAL_FAME,
          );
  const tape = buildMatchTape(career, match.a, match.b);
  const playerState = career.characters[mySlug];
  const resultAt =
    clipPlayback.skippedAt ?? clipPlayback.startedAt + clipPlayback.durationMs;
  const endsAt = resultAt + view.settings.matchLingerSeconds * 1000;
  const serverNow = tick + serverOffset;
  const lingering = serverNow >= resultAt;
  const startsIn = Math.max(0, Math.ceil((startedAt - serverNow) / 1000));
  const secondsLeft = Math.max(0, Math.ceil((endsAt - serverNow) / 1000));
  const isFinal = stage.round === (career.cup?.rounds.length ?? 1) - 1;
  const lastOfStage =
    clip.index === (career.cup?.rounds[stage.round]?.length ?? 1) - 1;
  const lingerLine = isFinal
    ? CL.toPodium
    : lastOfStage
      ? CL.toBracket
      : CL.nextIn;

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="rounded-full border border-sky-200/20 bg-slate-950/70 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-sky-200 backdrop-blur-sm">
          {stageLabel(view)}
        </span>
        {tape && (
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
      {startOffset === null ? (
        <div className="flex w-full flex-col items-center gap-3">
          <MatchIntroOverlay
            a={a}
            b={b}
            moodA={career.characters[match.a] ?? null}
            moodB={career.characters[match.b] ?? null}
            tape={tape}
            inline
            coachA={coaches[match.a] ?? null}
            coachB={coaches[match.b] ?? null}
          />
          <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-amber-200">
            {fmt(CL.startsIn, { seconds: startsIn })}
          </span>
        </div>
      ) : (
        <MatchViewer
          key={`${startedAt}-${clip.index}`}
          a={a}
          b={b}
          result={clipResult}
          betSlug={mySlug}
          supportedSlug={supported}
          isFinal={isFinal}
          theme={seasonThemeIndex(career.season)}
          sponsorA={career.characters[match.a]?.sponsor?.sponsorId ?? null}
          sponsorB={career.characters[match.b]?.sponsor?.sponsorId ?? null}
          moodA={career.characters[match.a] ?? null}
          moodB={career.characters[match.b] ?? null}
          revealA={scoutReveal(playerState, match.a === mySlug)}
          revealB={scoutReveal(playerState, match.b === mySlug)}
          commentary={commentary}
          tape={tape}
          tapeForced={tapeOpen}
          onTapeClose={() => setTapeOpen(false)}
          onDone={() => undefined}
          startOffsetMs={startOffset}
          forceFinished={lingering}
          coachA={coaches[match.a] ?? null}
          coachB={coaches[match.b] ?? null}
          coachTokens={tokensFor(view, characterBySlug, lingering)}
          resultNote={
            lingering ? fmt(lingerLine, { seconds: secondsLeft }) : null
          }
        />
      )}
      <SkipVotes
        view={view}
        showClip={!lingering}
        onVoteClip={() => send({ type: 'voteSkip' })}
        onVoteRound={(on) => send({ type: 'voteSkipRound', on })}
        onVoteCup={(on) => send({ type: 'voteSkipCup', on })}
      />
    </div>
  );
}
