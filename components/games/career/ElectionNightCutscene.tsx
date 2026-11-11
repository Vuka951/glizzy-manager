'use client';

import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
} from 'react';
import CareerButton from '@/components/games/career/CareerButton';
import CoalitionBallotDialog from '@/components/games/career/CoalitionBallotDialog';
import CoalitionCountScene from '@/components/games/career/CoalitionCountScene';
import CoalitionEmblems from '@/components/games/career/CoalitionEmblems';
import CoalitionVoteBoard from '@/components/games/career/CoalitionVoteBoard';
import ElectionPollBars from '@/components/games/career/ElectionPollBars';
import ElectionPremierBeat from '@/components/games/career/ElectionPremierBeat';
import ParliamentChamber from '@/components/games/career/ParliamentChamber';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import TelevisionSet from '@/components/games/career/TelevisionSet';
import PhaseTimer from '@/components/games/rooms/PhaseTimer';
import {
  PARLIAMENT_SEATS,
  type ElectionResult,
} from '@/data/games/careerElections';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import { electionNightSounds } from '@/lib/constants/cutsceneSounds';
import {
  PREMIER_AFTER_GOVERNMENT_MS,
  PREMIER_BEATS,
} from '@/lib/constants/electionPremier';
import { SPONSOR_THEMES } from '@/lib/constants/sponsorThemes';
import { coalitionPartners } from '@/lib/utils/careerCoalition';
import { governmentSeats } from '@/lib/utils/careerElections';
import { hasVoted } from '@/lib/utils/careerParliamentVote';
import type { PremierSpeech } from '@/lib/utils/careerPremier';
import type { SponsorId } from '@/lib/utils/careerSave';
import { playCutsceneClip } from '@/lib/utils/cutsceneSounds';
import { fmt } from '@/lib/utils/format';
import { playCheerSound } from '@/lib/utils/gameSounds';
import { sponsorCoalitionName } from '@/lib/utils/localeNames';
import {
  readGameSettings,
  readServerGameSettings,
  subscribeGameSettings,
} from '@/lib/utils/gameSettings';

const ELECTION = GAMES_UI.career.election;
const COALITION = ELECTION.coalition;
const SKIP = GAMES_UI.career.quoteCutscene.skip;
const SPONSOR_NAMES = GAMES_UI.career.sponsors.names as Record<
  SponsorId,
  string
>;
const SHORT_NAMES = GAMES_UI.career.sponsors.shortNames as Record<
  SponsorId,
  string
>;
const NO_CHARACTERS = new Map<string, DuelCharacter>();

type Phase = 'poll' | 'winner' | 'seats' | 'vote' | 'government' | 'premier';

// The broadcast clock, in ms from the moment the feed cuts in
const WINNER_AT = 2800;
const SEATS_AT = 5600;
const SEAT_EVERY_MS = 24;
const GOVERNMENT_AFTER_COUNT_MS = 700;
// The chamber follows a beat after the partner vote's winner is stamped
const VOTE_GOVERNMENT_MS = 1900;

function yourPartyLine(
  result: ElectionResult,
  playerSponsor: SponsorId | null
): string {
  if (!playerSponsor) return ELECTION.yourParty.none;
  if (result.government[0] === playerSponsor) return ELECTION.yourParty.leader;
  if (result.government.includes(playerSponsor))
    return ELECTION.yourParty.partner;
  return ELECTION.yourParty.opposition;
}

// Election night as a TV feed over the off-season screen: the vote share
// comes in as bars, the winner is called, then the chamber fills seat by
// seat. Without a majority the leader's coaches vote on a partner, walk
// their slips to the ballot box one by one, and the government lights up
// together. The new premier closes the night with his first words, unless
// cutscenes are off. Holds until tapped through
export default function ElectionNightCutscene({
  result,
  premier = null,
  playerSponsor,
  playerSlug,
  characterBySlug = NO_CHARACTERS,
  onVote,
  deadline = null,
  serverOffset = 0,
  onClose,
}: {
  result: ElectionResult;
  // Known once the government stands; without it the night ends on the chamber
  premier?: PremierSpeech | null;
  playerSponsor: SponsorId | null;
  // The viewer's own man, for his ballot and his face on the board
  playerSlug?: string;
  characterBySlug?: Map<string, DuelCharacter>;
  // Casts the viewer's partner vote; without it the board only watches
  onVote?: (key: string) => void;
  // A shared room's vote closes on the clock
  deadline?: number | null;
  serverOffset?: number;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('poll');
  const [revealed, setRevealed] = useState(0);
  const [settled, setSettled] = useState(false);
  // A shared room answers a vote on the next poll; the ballot closes on the
  // click so it cannot be sent twice
  const [sent, setSent] = useState(false);
  const coalition = result.coalition;
  const winner = coalition?.leader ?? result.government[0];
  const leaderTheme = SPONSOR_THEMES[winner];
  const voteClosed = coalition ? coalition.winner !== null : true;
  const ownBallot = coalition?.ballots.find(
    (b) => b.slug === playerSlug && b.human
  );
  const ballotOpen =
    phase === 'vote' &&
    !voteClosed &&
    Boolean(onVote) &&
    ownBallot !== undefined &&
    !hasVoted(ownBallot) &&
    !sent;
  const afterCount: Phase = coalition ? 'vote' : 'government';
  const onCountSettled = useCallback(() => setSettled(true), []);
  const cutscenes = useSyncExternalStore(
    subscribeGameSettings,
    () => readGameSettings().cutscenes,
    () => readServerGameSettings().cutscenes,
  );
  const premierOn = Boolean(premier) && cutscenes;
  const premierYou = premier?.slug === playerSlug;
  const [beatStill, setBeatStill] = useState(false);
  const [beatOver, setBeatOver] = useState(false);
  const canAdvance = phase === 'government' || phase === 'premier';
  const advance = useCallback(() => {
    if (phase === 'government' && premierOn) setPhase('premier');
    else onClose();
  }, [phase, premierOn, onClose]);

  useEffect(() => {
    let roll: HTMLAudioElement | null = null;
    const timers = [
      window.setTimeout(() => {
        roll = playCutsceneClip('drum-roll', electionNightSounds.roll);
      }, WINNER_AT - electionNightSounds.rollMs),
      window.setTimeout(() => {
        roll?.pause();
        setPhase('winner');
        playCutsceneClip('cymbal-crash', electionNightSounds.crash);
        playCheerSound(0.6);
      }, WINNER_AT),
      window.setTimeout(() => setPhase('seats'), SEATS_AT),
    ];
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      roll?.pause();
    };
  }, []);

  useEffect(() => {
    if (phase !== 'seats') return;
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (reduce) {
      const done = window.setTimeout(() => {
        setRevealed(PARLIAMENT_SEATS);
        setPhase(afterCount);
        if (afterCount === 'government')
          playCutsceneClip('fanfare', electionNightSounds.fanfare);
      }, GOVERNMENT_AFTER_COUNT_MS);
      return () => window.clearTimeout(done);
    }
    let count = 0;
    const tick = window.setInterval(() => {
      count += 1;
      setRevealed(count);
      if (count % electionNightSounds.seatsPerTick === 0)
        playCutsceneClip('seat-tick', electionNightSounds.seatTick);
      if (count >= PARLIAMENT_SEATS) window.clearInterval(tick);
    }, SEAT_EVERY_MS);
    const done = window.setTimeout(
      () => {
        setPhase(afterCount);
        if (afterCount !== 'government') return;
        playCutsceneClip('fanfare', electionNightSounds.fanfare);
        playCheerSound(1);
      },
      PARLIAMENT_SEATS * SEAT_EVERY_MS + GOVERNMENT_AFTER_COUNT_MS
    );
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(done);
    };
  }, [phase, afterCount]);

  // The count at the ballot box stamps the winner, then the chamber takes
  // over
  useEffect(() => {
    if (!settled) return;
    const timer = window.setTimeout(() => {
      setPhase('government');
      playCutsceneClip('fanfare', electionNightSounds.fanfare);
      playCheerSound(1);
    }, VOTE_GOVERNMENT_MS);
    return () => window.clearTimeout(timer);
  }, [settled]);

  useEffect(() => {
    if (phase !== 'government' || !premierOn) return;
    const timer = window.setTimeout(
      () => setPhase('premier'),
      PREMIER_AFTER_GOVERNMENT_MS,
    );
    return () => window.clearTimeout(timer);
  }, [phase, premierOn]);

  useEffect(() => {
    if (phase !== 'premier') return;
    const timer = window.setTimeout(
      () => setBeatOver(true),
      PREMIER_BEATS.totalMs,
    );
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && (phase !== 'vote' || voteClosed))
        onClose();
      if (event.key === 'Enter' && canAdvance) advance();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, phase, voteClosed, canAdvance, advance]);

  const premierCharacter = premier
    ? characterBySlug.get(premier.slug)
    : undefined;

  const formed = coalition?.winner
    ? fmt(COALITION.formed, {
        parties: [coalition.leader, ...coalitionPartners(coalition.winner)]
          .map((id) => SHORT_NAMES[id])
          .join(' + '),
      })
    : null;

  const commentary =
    phase === 'premier' && premier
      ? fmt(
          premierYou
            ? ELECTION.commentary.premierYou
            : ELECTION.commentary.premier,
          { name: premierCharacter?.name ?? premier.slug },
        )
      : phase === 'poll'
      ? ELECTION.commentary.poll
      : phase === 'winner'
        ? fmt(ELECTION.commentary.winner, { party: SPONSOR_NAMES[winner] })
        : phase === 'seats'
          ? ELECTION.commentary.seats
          : phase === 'vote'
            ? settled && formed
              ? formed
              : voteClosed
                ? COALITION.counting
                : ballotOpen
                  ? fmt(COALITION.vote, { party: SPONSOR_NAMES[winner] })
                  : COALITION.waiting
            : formed
              ? formed
              : result.government.length === 1
                ? fmt(ELECTION.commentary.alone, {
                    party: SPONSOR_NAMES[winner],
                  })
                : fmt(ELECTION.commentary.coalition, {
                    parties: sponsorCoalitionName(result.government),
                  });

  const kicker =
    phase === 'poll'
      ? ELECTION.kickers.poll
      : phase === 'winner'
        ? ELECTION.kickers.winner
        : phase === 'seats'
          ? ELECTION.kickers.seats
          : phase === 'vote'
            ? COALITION.kicker
            : phase === 'premier'
              ? premierYou
                ? ELECTION.kickers.premierYou
                : ELECTION.kickers.premier
              : ELECTION.kickers.government;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-3">
      <button
        aria-label={ELECTION.continue}
        onClick={canAdvance ? advance : undefined}
        className="absolute inset-0 cursor-default bg-[#060912]/75"
      />
      <TelevisionSet
        live={ELECTION.live}
        channel={`${ELECTION.title} · ${ELECTION.subtitle}`}
        className="z-10 w-full max-w-[37.375rem] animate-[bubblein_0.25s_ease-out] phone-landscape:max-w-[48rem]"
        controls={
          <>
            {phase === 'premier' && !beatStill && !beatOver && (
              <CareerButton
                className="min-h-11 shrink-0"
                onClick={() => setBeatStill(true)}
              >
                {SKIP}
              </CareerButton>
            )}
            <CareerButton
              full
              disabled={!canAdvance}
              className="min-h-11"
              onClick={advance}
            >
              {ELECTION.continue}
            </CareerButton>
          </>
        }
      >
        <div className="flex min-h-0 flex-1 flex-col phone-landscape:flex-row">
          <div
            className={`relative flex items-center justify-center px-3 py-4 sm:px-5 phone-landscape:h-[calc(100dvh/var(--game-zoom,1)_-_6.25rem)] phone-landscape:min-h-0 phone-landscape:min-w-0 phone-landscape:flex-1 ${
              phase === 'vote'
                ? 'min-h-72 sm:min-h-80 phone-landscape:items-start phone-landscape:overflow-y-auto'
                : 'h-72 sm:h-80'
            } ${leaderTheme.wash}`}
          >
            {phase === 'vote' && coalition && !voteClosed && (
              <div className="w-full animate-[bubblein_0.3s_ease-out]">
                <CoalitionVoteBoard
                  ballot={coalition}
                  seats={result.seats}
                  characterBySlug={characterBySlug}
                  viewerSlug={playerSlug}
                />
              </div>
            )}
            {phase === 'vote' && coalition && voteClosed && (
              <div className="w-full animate-[bubblein_0.3s_ease-out]">
                <CoalitionCountScene
                  ballot={coalition}
                  seats={result.seats}
                  characterBySlug={characterBySlug}
                  viewerSlug={playerSlug}
                  onSettled={onCountSettled}
                />
              </div>
            )}

            {phase === 'premier' && premier && (
              <ElectionPremierBeat
                premier={premier}
                character={premierCharacter}
                you={premierYou}
                still={beatStill}
              />
            )}
            {phase === 'government' && formed && coalition?.winner && (
              <span className="absolute right-2 top-2 z-10 flex rotate-[-5deg] items-center gap-1.5 rounded-[4px] border-2 border-amber-300 bg-slate-950 px-2 py-1 animate-[bubblein_0.35s_ease-out] sm:right-3 sm:top-3">
                <CoalitionEmblems
                  leader={null}
                  partners={[
                    coalition.leader,
                    ...coalitionPartners(coalition.winner),
                  ]}
                  size="h-3.5 w-3.5"
                />
                <span className="font-sign text-[13px] font-extrabold uppercase leading-none tracking-[0.1em] text-amber-200">
                  {COALITION.stamp}
                </span>
              </span>
            )}
            {(phase === 'poll' || phase === 'winner') && (
              <div className="flex w-full items-center gap-4">
                <div className="min-w-0 flex-1">
                  <ElectionPollBars
                    votes={result.votes}
                    winner={phase === 'winner' ? winner : null}
                    sound
                  />
                </div>
                <div className="flex w-24 shrink-0 flex-col items-center gap-2">
                  {phase === 'winner' && (
                    <div className="flex flex-col items-center gap-2 animate-[podiumrise_0.5s_ease-out_both]">
                      <span
                        className={`flex h-24 w-24 items-center justify-center rounded-full bg-slate-900/80 ring-4 ${leaderTheme.actorRing}`}
                      >
                        <SponsorEmblem sponsorId={winner} className="h-14 w-14" />
                      </span>
                      <span className="font-sign text-4xl font-extrabold tabular-nums text-white">
                        {result.votes[winner]}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(phase === 'seats' || phase === 'government') && (
              <div className="flex w-full flex-col items-center gap-2 animate-[bubblein_0.3s_ease-out]">
                <ParliamentChamber
                  seats={result.seats}
                  government={result.government}
                  revealed={revealed}
                  dimOutside={phase === 'government'}
                  className="max-h-48"
                />
                <div className="flex items-center gap-2">
                  {result.government.map((id, index) => (
                    <span
                      key={id}
                      className={`flex items-center gap-1.5 rounded-[3px] border px-2.5 py-1 text-[11px] font-bold transition-all duration-500 ${
                        phase === 'government'
                          ? 'border-[#64748b] bg-[#0f172a] text-slate-100 opacity-100'
                          : 'border-transparent text-transparent opacity-0'
                      } ${index === 1 ? '[transition-delay:200ms]' : index === 2 ? '[transition-delay:400ms]' : ''}`}
                    >
                      <SponsorEmblem sponsorId={id} className="h-4 w-4" />
                      <span className="font-sign text-[14px] tabular-nums">
                        {result.seats[id]}
                      </span>
                    </span>
                  ))}
                  <span
                    className={`ml-1 font-sign text-base font-extrabold tabular-nums transition-opacity duration-500 [transition-delay:600ms] ${phase === 'government' ? 'text-white opacity-100' : 'opacity-0'}`}
                  >
                    {governmentSeats(result)} / {PARLIAMENT_SEATS}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5 bg-[#0a0f1d] px-3 py-2.5 sm:px-4 phone-landscape:w-56 phone-landscape:shrink-0 phone-landscape:justify-center">
            <span
              className={`font-sign text-[13px] font-bold uppercase leading-tight tracking-[0.1em] ${
                phase === 'premier' && premierYou
                  ? 'text-amber-300'
                  : 'text-sky-400'
              }`}
            >
              {kicker}
            </span>
            <span className="flex items-start justify-between gap-2">
              <span
                key={commentary}
                className="text-sm font-black leading-tight text-slate-100 animate-[bubblein_0.3s_ease-out]"
              >
                {commentary}
              </span>
              {phase === 'vote' && !voteClosed && (
                <PhaseTimer deadline={deadline} serverOffset={serverOffset} />
              )}
            </span>
            {canAdvance && (
              <span className="rounded-[3px] bg-slate-900 px-3 py-1 text-center text-[11px] font-bold text-sky-200 animate-[bubblein_0.35s_ease-out]">
                {yourPartyLine(result, playerSponsor)}
              </span>
            )}
          </div>
        </div>
      </TelevisionSet>
      {ballotOpen && coalition && ownBallot && onVote && (
        <CoalitionBallotDialog
          ballot={coalition}
          seats={result.seats}
          weight={ownBallot.weight}
          deadline={deadline}
          serverOffset={serverOffset}
          onVote={(key) => {
            setSent(true);
            onVote(key);
          }}
        />
      )}
    </div>
  );
}
