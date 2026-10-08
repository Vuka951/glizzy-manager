import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DoubleChevronRightIcon from '@/components/icons/DoubleChevronRightIcon';
import { studioAccents } from '@/lib/constants/studioThemes';
import MatchEventOverlay from '@/components/games/match/MatchEventOverlay';
import MatchExitScene from '@/components/games/match/MatchExitScene';
import CommentaryCaption from '@/components/games/CommentaryCaption';
import IntroHoldControls from '@/components/games/IntroHoldControls';
import MatchIntroOverlay from '@/components/games/match/MatchIntroOverlay';
import MatchMeterDelta from '@/components/games/match/MatchMeterDelta';
import MatchStatsStrip from '@/components/games/match/MatchStatsStrip';
import SpectateTable, {
  type SpectatePhase,
} from '@/components/games/match/SpectateTable';
import type { ScoutReveal } from '@/lib/utils/careerScouting';
import type { CharacterCareerState, SponsorId } from '@/lib/utils/careerSave';
import {
  HIDING_SPOTS,
  SPOT_VARIANT_COUNT,
  GLIZZY_VARIANT_COUNT,
  STARTING_LIVES,
  type DuelCharacter,
  type HidingSpotId,
} from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import {
  playBooSound,
  playCheerSound,
  playChompSound,
  playCricketSound,
  playLiftSound,
  playMeltdownSound,
  playPoliceSound,
  playPukeSound,
  playWithdrawSound,
} from '@/lib/utils/gameSounds';
import {
  crowdGoesQuiet,
  crowdIntensity,
  FINAL_CROWD_BOOST,
  NEUTRAL_FAME,
} from '@/lib/utils/crowdMood';
import { fmt } from '@/lib/utils/format';
import useMatchCommentary from '@/components/games/match/useMatchCommentary';
import type { PlannedLine } from '@/lib/utils/matchCommentary';
import type { MatchTape } from '@/lib/utils/matchTape';
import { liveMatchMeters, matchMeterDelta } from '@/lib/utils/matchMeters';
import {
  buildMatchFrames,
  revealedTurnCount,
  type MatchFrame,
} from '@/lib/utils/matchFrames';
import {
  tiebreakStartTurn,
  type CupMatchResult,
  type MatchEventKind,
} from '@/lib/utils/tournamentSim';
import type { CoachTagMap, CoachTokens } from '@/lib/types/careerMp';

// The frame a clip that started this long ago has reached, and how far
// into that frame it already is
function frameAtOffset(
  frames: MatchFrame[],
  offsetMs: number,
): { index: number; elapsed: number } {
  let elapsed = 0;
  for (let i = 0; i < frames.length; i++) {
    if (offsetMs < elapsed + frames[i].ms) {
      return { index: i, elapsed: offsetMs - elapsed };
    }
    elapsed += frames[i].ms;
  }
  return { index: frames.length, elapsed: 0 };
}

function rollVariants(): Record<HidingSpotId, number> {
  return Object.fromEntries(
    HIDING_SPOTS.map((spot) => [
      spot.id,
      Math.floor(Math.random() * SPOT_VARIANT_COUNT),
    ]),
  ) as Record<HidingSpotId, number>;
}

function playEventSound(kind: MatchEventKind): void {
  if (kind === 'overfull-forfeit') playPukeSound();
  else if (kind === 'meltdown') playMeltdownSound();
  else if (kind === 'police' || kind === 'removed') playPoliceSound();
  else if (kind === 'tiebreak') playCheerSound(0.7);
}

export default function MatchViewer({
  a,
  b,
  result,
  betSlug,
  supportedSlug = null,
  theme = 0,
  sponsorA = null,
  sponsorB = null,
  moodA = null,
  moodB = null,
  revealA = null,
  revealB = null,
  isFinal = false,
  commentary = null,
  tape = null,
  tapeForced = false,
  onTapeClose,
  onDone,
  startOffsetMs = null,
  forceFinished = false,
  coachA = null,
  coachB = null,
  coachTokens = null,
  resultNote = null,
}: {
  a: DuelCharacter;
  b: DuelCharacter;
  result: CupMatchResult;
  betSlug: string | null;
  supportedSlug?: string | null;
  theme?: number;
  sponsorA?: SponsorId | null;
  sponsorB?: SponsorId | null;
  moodA?: CharacterCareerState | null;
  moodB?: CharacterCareerState | null;
  // How much of each fighter's career card the coach has paid to see. The
  // standalone cup has no career behind it and passes neither
  revealA?: ScoutReveal | null;
  revealB?: ScoutReveal | null;
  isFinal?: boolean;
  commentary?: PlannedLine[] | null;
  tape?: MatchTape | null;
  // The header's tape button can pin the overlay open mid-match
  tapeForced?: boolean;
  onTapeClose?: () => void;
  onDone: () => void;
  // Synced viewing in a shared room: the clip starts this far in, never
  // holds for the tape or the commentator, and the room moves it on
  startOffsetMs?: number | null;
  // The room skipped the clip: jump to the scoreboard
  forceFinished?: boolean;
  coachA?: CoachTagMap[string] | null;
  coachB?: CoachTagMap[string] | null;
  coachTokens?: CoachTokens | null;
  // A line under the score once the match is over, for the room's cursor
  resultNote?: React.ReactNode;
}) {
  const synced = startOffsetMs !== null;
  const accent = studioAccents(theme);
  const winnerSlug = result.winner === 'a' ? a.slug : b.slug;
  const crowdBoost = isFinal ? FINAL_CROWD_BOOST : 1;
  // The crowd backs the viewer's pick, otherwise the bigger name, chosen
  // upstream. How loud it gets is fame: a star winning shakes the hall, a
  // beloved favourite losing brings the roof down the other way, and the
  // final gets its boost either way. A withdrawal has no event frame, so its
  // sound rides the finish.
  const playFinishSounds = useCallback(() => {
    if (result.reason === 'withdrawn') playWithdrawSound();
    // Some nights nobody in the hall can be bothered either way
    if (crowdGoesQuiet(isFinal)) {
      playCricketSound();
      return;
    }
    const fameOf = (slug: string) =>
      (slug === a.slug ? moodA?.fame : moodB?.fame) ?? NEUTRAL_FAME;
    const jilted = Boolean(supportedSlug && supportedSlug !== winnerSlug);
    const intensity = crowdIntensity(
      fameOf(jilted ? (supportedSlug as string) : winnerSlug),
      crowdBoost,
    );
    if (jilted) playBooSound(intensity);
    else playCheerSound(intensity);
  }, [
    result.reason,
    supportedSlug,
    winnerSlug,
    a.slug,
    moodA?.fame,
    moodB?.fame,
    crowdBoost,
    isFinal,
  ]);
  const initialFrames = useMemo(() => buildMatchFrames(result), [result]);
  const [start] = useState(() =>
    synced
      ? frameAtOffset(initialFrames, Math.max(0, startOffsetMs))
      : { index: 0, elapsed: 0 },
  );
  const [frameIndex, setFrameIndex] = useState(start.index);
  // When each frame ends, fixed the moment it is first scheduled: the
  // effect below re-runs whenever a prop changes identity (every poll in a
  // shared room) and must never restart a frame from the top
  const frameEndRef = useRef<{ index: number; at: number } | null>(null);
  // The tale of the tape stays up until the viewer moves on or the
  // countdown does it for them; a match without a tape has nothing to hold
  const [introHeld, setIntroHeld] = useState(Boolean(tape) && !synced);
  const [spotVariants, setSpotVariants] = useState(rollVariants);
  const [glizzyVariant] = useState(() =>
    Math.floor(Math.random() * GLIZZY_VARIANT_COUNT),
  );
  const turns = result.turns;
  const frames = initialFrames;
  const tiebreakAt = tiebreakStartTurn(result);
  const finished = forceFinished || frameIndex >= frames.length;
  const cutShort = forceFinished && frameIndex < frames.length;
  useEffect(() => {
    if (cutShort) playFinishSounds();
  }, [cutShort, playFinishSounds]);
  const {
    caption: commentaryCaption,
    introHolding,
    cutIntro,
  } = useMatchCommentary(
    commentary,
    Math.min(frameIndex, frames.length),
    finished,
  );

  useEffect(() => {
    if (finished) return;
    const frame = frames[frameIndex];
    // The broadcast waits for the tape hold and for the commentator to finish
    // setting the match up before the first glizzy is hidden
    if (frame.kind === 'intro' && !synced && (introHolding || introHeld)) return;
    const now = Date.now();
    if (frameEndRef.current?.index !== frameIndex) {
      const alreadyElapsed = frameIndex === start.index ? start.elapsed : 0;
      frameEndRef.current = { index: frameIndex, at: now + frame.ms - alreadyElapsed };
    }
    const timer = setTimeout(() => {
      const next = frameIndex + 1;
      if (next >= frames.length) {
        playFinishSounds();
      } else {
        const nextFrame = frames[next];
        if (nextFrame.kind === 'event') playEventSound(nextFrame.event.kind);
        if (nextFrame.kind === 'reveal') {
          playLiftSound(turns[nextFrame.turnIndex].picked);
          if (turns[nextFrame.turnIndex].hit) playChompSound();
        }
        if (
          nextFrame.kind === 'place' &&
          nextFrame.turnIndex > 0 &&
          turns[nextFrame.turnIndex].matchRound !==
            turns[nextFrame.turnIndex - 1].matchRound
        ) {
          setSpotVariants(rollVariants());
        }
      }
      setFrameIndex(next);
    }, Math.max(0, frameEndRef.current.at - now));
    return () => clearTimeout(timer);
  }, [
    frameIndex,
    finished,
    frames,
    turns,
    playFinishSounds,
    introHolding,
    introHeld,
    synced,
    start,
  ]);

  const revealedCount = revealedTurnCount(frames, frameIndex);
  const eaten = (side: 'a' | 'b') =>
    turns.slice(0, revealedCount).filter((t) => t.seeker === side && t.hit)
      .length;
  const capA = result.livesCapA ?? STARTING_LIVES;
  const capB = result.livesCapB ?? STARTING_LIVES;
  const livesA = Math.max(0, capA - eaten('a'));
  const livesB = Math.max(0, capB - eaten('b'));

  const frame = finished ? null : frames[frameIndex];
  // Cholesterol and appetite move with the turns already revealed; the rest of
  // the card stays as it was read before the match
  const liveMeters = liveMatchMeters(result, revealedCount);
  const liveA =
    moodA && liveMeters
      ? { ...moodA, stress: liveMeters.stressA, appetite: liveMeters.appetiteA }
      : moodA;
  const liveB =
    moodB && liveMeters
      ? { ...moodB, stress: liveMeters.stressB, appetite: liveMeters.appetiteB }
      : moodB;
  // The pop starts on the reveal and outlives the frame, so it stays mounted
  // until the next reveal replaces it; it hides itself when it is done
  const popTurn = (() => {
    if (!frame) return null;
    for (let i = frameIndex; i >= 0; i -= 1) {
      const f = frames[i];
      if (f.kind === 'reveal') return f.turnIndex;
    }
    return null;
  })();
  const meterDelta =
    popTurn === null ? null : matchMeterDelta(result, popTurn);
  // Every seat pops its meter move, scouted or not
  const deltaFor = (side: 'a' | 'b') =>
    meterDelta?.side === side ? (
      <MatchMeterDelta key={popTurn} delta={meterDelta} />
    ) : null;
  // After puking or waving the white flag the loser holds that pose at the
  // table and the winner celebrates; a loser taken away by medics, police or
  // party men leaves the stage, and nobody cheers over that
  const loserHoldsPose =
    result.reason === 'overfull-forfeit' || result.reason === 'withdrawn';
  const showExitScene = finished && !!result.reason;
  const loserSide = result.winner === 'a' ? ('bottom' as const) : ('top' as const);
  const exitSide = showExitScene ? loserSide : null;
  const sickSide =
    frame?.kind === 'event' && frame.event.kind === 'overfull-forfeit'
      ? frame.event.side === 'a'
        ? ('top' as const)
        : ('bottom' as const)
      : finished && result.reason === 'overfull-forfeit'
        ? loserSide
        : null;
  // The trained nose fires while the seeker is still deciding, so it plays
  // over the think frame of the turn it saved
  const sniffEvent =
    frame?.kind === 'think'
      ? ((result.events ?? []).find(
          (event) =>
            event.kind === 'sniff-dodge' && event.afterTurn === frame.turnIndex,
        ) ?? null)
      : null;
  const sniffSide = sniffEvent
    ? sniffEvent.side === 'a'
      ? ('top' as const)
      : ('bottom' as const)
    : null;
  // The nose gives away the spot it caught, which is the one the hand then
  // stays away from
  // In sudden death that is whichever loaded spot the hand did not end up in
  const sniffSpot = (() => {
    if (!sniffEvent || frame?.kind !== 'think') return null;
    const turn = turns[frame.turnIndex];
    return turn.secondHidden && turn.picked === turn.hidden
      ? turn.secondHidden
      : turn.hidden;
  })();
  const phase: SpectatePhase =
    !frame || frame.kind === 'intro' || frame.kind === 'event'
      ? { kind: 'idle' }
      : frame.kind === 'place'
        ? {
            kind: 'place',
            hider: turns[frame.turnIndex].seeker === 'a' ? 'bottom' : 'top',
            glizzies: turns[frame.turnIndex].secondHidden ? 2 : 1,
          }
        : frame.kind === 'think'
          ? {
              kind: 'think',
              seeker: turns[frame.turnIndex].seeker === 'a' ? 'top' : 'bottom',
            }
          : {
              kind: 'reveal',
              seeker: turns[frame.turnIndex].seeker === 'a' ? 'top' : 'bottom',
              spot: turns[frame.turnIndex].picked,
              hit: turns[frame.turnIndex].hit,
            };

  const currentRoundLabel = (() => {
    if (frame?.kind === 'event' && frame.event.kind === 'tiebreak') {
      return fmt(GAMES_UI.cup.viewer.overtimeRound, {
        round: turns[frame.event.afterTurn + 1].matchRound,
      });
    }
    if (
      !frame ||
      (frame.kind !== 'place' &&
        frame.kind !== 'think' &&
        frame.kind !== 'reveal')
    ) {
      return null;
    }
    const activeTurn = turns[frame.turnIndex];
    const overtime =
      tiebreakAt >= 0 && frame.turnIndex >= tiebreakAt;

    return fmt(
      overtime ? GAMES_UI.cup.viewer.overtimeRound : GAMES_UI.cup.viewer.round,
      { round: activeTurn.matchRound },
    );
  })();

  return (
    <div
      className={`flex w-full flex-col items-center gap-3 rounded-2xl border ${accent.panelBorder} bg-slate-900/40 p-4 sm:p-5 group-[:fullscreen]:mx-auto group-[:fullscreen]:max-w-xl`}
    >
      <span
        className={`min-h-[1.25rem] rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest ${accent.chip}`}
      >
        {finished
          ? GAMES_UI.cup.viewer.end
          : (currentRoundLabel ?? GAMES_UI.cup.viewer.start)}
      </span>

      <div className="relative flex w-full justify-center">
        <SpectateTable
          top={a}
          bottom={b}
          topLives={livesA}
          bottomLives={livesB}
          topCap={capA}
          bottomCap={capB}
          topSponsor={sponsorA}
          bottomSponsor={sponsorB}
          topMood={finished ? null : liveA}
          bottomMood={finished ? null : liveB}
          topStats={
            liveA && revealA ? (
              <MatchStatsStrip ch={liveA} reveal={revealA} seat="top" />
            ) : null
          }
          bottomStats={
            liveB && revealB ? (
              <MatchStatsStrip ch={liveB} reveal={revealB} seat="bottom" />
            ) : null
          }
          topDelta={deltaFor('a')}
          bottomDelta={deltaFor('b')}
          topFame={moodA?.fame}
          bottomFame={moodB?.fame}
          spotVariants={spotVariants}
          glizzyVariant={glizzyVariant}
          phase={phase}
          outcome={finished ? (result.winner === 'a' ? 'top' : 'bottom') : null}
          exit={exitSide}
          celebrate={!result.reason || loserHoldsPose}
          sick={sickSide}
          sniff={sniffSide}
          sniffSpot={sniffSpot}
          betSlug={betSlug}
          theme={theme}
          topCoach={coachA}
          bottomCoach={coachB}
          coachTokens={coachTokens}
        />
        {frame?.kind === 'event' && (
          <MatchEventOverlay
            kind={frame.event.kind}
            party={result.removedBy ?? null}
          />
        )}
        {tape &&
          (tapeForced ||
            (frame?.kind === 'intro' && (introHeld || introHolding))) && (
            <MatchIntroOverlay
              a={a}
              b={b}
              moodA={moodA}
              moodB={moodB}
              tape={tape}
              onClose={tapeForced ? onTapeClose : undefined}
              footer={
                !tapeForced ? (
                  <IntroHoldControls
                    onContinue={(auto) => {
                      setIntroHeld(false);
                      // The countdown lets the commentator finish; a click
                      // cuts him off
                      if (!auto) cutIntro();
                    }}
                  />
                ) : undefined
              }
            />
          )}
        {showExitScene && result.reason && (
          <MatchExitScene
            reason={result.reason}
            loser={result.winner === 'a' ? b : a}
            side={loserSide}
            party={result.removedBy ?? null}
            walkOff={!loserHoldsPose}
          />
        )}
        {finished && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            <div className="flex flex-col items-center gap-1 rounded-2xl border border-sky-200/20 bg-slate-950/90 px-7 py-4 shadow-2xl backdrop-blur-sm animate-[bubblein_0.35s_ease-out]">
              <p className="text-2xl font-bold">
                <span
                  className={
                    result.winner === 'a' ? 'text-green-400' : 'text-slate-400'
                  }
                >
                  {result.livesA}
                </span>
                <span className="mx-2 text-slate-600">:</span>
                <span
                  className={
                    result.winner === 'b' ? 'text-green-400' : 'text-slate-400'
                  }
                >
                  {result.livesB}
                </span>
              </p>
              <p className="text-xs font-semibold text-green-300">
                {fmt(GAMES_UI.cup.viewer.winner, {
                  name: result.winner === 'a' ? a.name : b.name,
                })}
              </p>
              {result.reason && (
                <p className="text-xs font-semibold text-red-300">
                  {(GAMES_UI.cup.viewer.reasons as Record<string, string>)[
                    result.reason
                  ] ?? ''}
                </p>
              )}
              {resultNote && (
                <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-widest text-amber-200">
                  {resultNote}
                </p>
              )}
            </div>
          </div>
        )}
        <CommentaryCaption line={commentaryCaption} viewport />
      </div>

      {synced ? null : finished ? (
        <button
          onClick={onDone}
          className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-500/15 px-4 py-1.5 text-xs font-semibold text-red-200 transition hover:border-red-500/60 hover:bg-red-500/25 hover:text-white"
        >
          {GAMES_UI.cup.viewer.continue}
        </button>
      ) : (
        <button
          onClick={() => {
            // A match that ends on a forfeit keeps its final interlude, so
            // the medics, the police or the puke still get their moment
            // before the exit scene; the timer then finishes the match
            const lastFrame = frames[frames.length - 1];
            if (lastFrame.kind === 'event' && frameIndex < frames.length - 1) {
              playEventSound(lastFrame.event.kind);
              setFrameIndex(frames.length - 1);
              return;
            }
            playFinishSounds();
            setFrameIndex(frames.length);
          }}
          className="group inline-flex items-center gap-1.5 rounded-xl border border-sky-200/20 bg-slate-800/60 px-4 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-sky-200/45 hover:bg-slate-800 hover:text-white"
        >
          {GAMES_UI.cup.viewer.skip}
          <DoubleChevronRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      )}
    </div>
  );
}
