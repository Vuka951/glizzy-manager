'use client';

import { useEffect, useState } from 'react';
import ElectionPollBars from '@/components/games/career/ElectionPollBars';
import ParliamentChamber from '@/components/games/career/ParliamentChamber';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import {
  PARLIAMENT_SEATS,
  type ElectionResult,
} from '@/data/games/careerElections';
import { GAMES_UI } from '@/data/games/locale';
import { electionNightSounds } from '@/lib/constants/cutsceneSounds';
import { SPONSOR_THEMES } from '@/lib/constants/sponsorThemes';
import { governmentSeats } from '@/lib/utils/careerElections';
import type { SponsorId } from '@/lib/utils/careerSave';
import { playCutsceneClip } from '@/lib/utils/cutsceneSounds';
import { fmt } from '@/lib/utils/format';
import { playCheerSound } from '@/lib/utils/gameSounds';
import { sponsorCoalitionName } from '@/lib/utils/localeNames';

const ELECTION = GAMES_UI.career.election;
const SPONSOR_NAMES = GAMES_UI.career.sponsors.names as Record<
  SponsorId,
  string
>;

type Phase = 'poll' | 'winner' | 'seats' | 'government';

// The broadcast clock, in ms from the moment the feed cuts in
const WINNER_AT = 2800;
const SEATS_AT = 5600;
const SEAT_EVERY_MS = 24;
const GOVERNMENT_AFTER_COUNT_MS = 700;

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
// seat and the government lights up together. Holds until tapped through
export default function ElectionNightCutscene({
  result,
  playerSponsor,
  onClose,
}: {
  result: ElectionResult;
  playerSponsor: SponsorId | null;
  // The city's first vote under its divided-city status gets its own line
  first?: boolean;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('poll');
  const [revealed, setRevealed] = useState(0);
  const winner = result.government[0];
  const leaderTheme = SPONSOR_THEMES[winner];

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
        setPhase('government');
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
        setPhase('government');
        playCutsceneClip('fanfare', electionNightSounds.fanfare);
        playCheerSound(1);
      },
      PARLIAMENT_SEATS * SEAT_EVERY_MS + GOVERNMENT_AFTER_COUNT_MS
    );
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(done);
    };
  }, [phase]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Enter' && phase === 'government') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, phase]);

  const commentary =
    phase === 'poll'
      ? ELECTION.commentary.poll
      : phase === 'winner'
        ? fmt(ELECTION.commentary.winner, { party: SPONSOR_NAMES[winner] })
        : phase === 'seats'
          ? ELECTION.commentary.seats
          : result.government.length === 1
            ? fmt(ELECTION.commentary.alone, { party: SPONSOR_NAMES[winner] })
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
          : ELECTION.kickers.government;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <button
        aria-label={ELECTION.continue}
        onClick={phase === 'government' ? onClose : undefined}
        className="absolute inset-0 cursor-default bg-slate-950/85 backdrop-blur-sm"
      />
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-frost-border/40 bg-slate-950 shadow-2xl animate-[bubblein_0.25s_ease-out]">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-red-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            {ELECTION.live}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
            {ELECTION.title} · {ELECTION.subtitle}
          </span>
        </div>

        <div
          className={`relative flex h-72 items-center justify-center px-5 py-4 sm:h-80 ${leaderTheme.wash}`}
        >
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
                    <span className="font-mono text-3xl font-black text-white">
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
                    className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-all duration-500 ${
                      phase === 'government'
                        ? `${SPONSOR_THEMES[id].chrome} text-slate-100 opacity-100`
                        : 'border-transparent text-transparent opacity-0'
                    } ${index === 1 ? '[transition-delay:200ms]' : index === 2 ? '[transition-delay:400ms]' : ''}`}
                  >
                    <SponsorEmblem sponsorId={id} className="h-4 w-4" />
                    <span className="font-mono tabular-nums">
                      {result.seats[id]}
                    </span>
                  </span>
                ))}
                <span
                  className={`ml-1 font-mono text-sm font-black tabular-nums transition-opacity duration-500 [transition-delay:600ms] ${phase === 'government' ? 'text-white opacity-100' : 'opacity-0'}`}
                >
                  {governmentSeats(result)} / {PARLIAMENT_SEATS}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2.5 p-4 sm:p-5">
          <span className="text-[9px] font-bold uppercase tracking-[0.35em] text-sky-400">
            {kicker}
          </span>
          <span
            key={phase}
            className="text-sm font-black leading-tight text-slate-100 animate-[bubblein_0.3s_ease-out]"
          >
            {commentary}
          </span>
          {phase === 'government' && (
            <span className="rounded-full border border-sky-200/20 bg-slate-900/70 px-3 py-1 text-center text-[11px] font-bold text-sky-200 animate-[bubblein_0.35s_ease-out]">
              {yourPartyLine(result, playerSponsor)}
            </span>
          )}
          <button
            onClick={onClose}
            disabled={phase !== 'government'}
            className="mt-1 w-full rounded-xl border border-sky-200/25 bg-slate-800/70 py-2 text-[11px] font-black uppercase tracking-[0.3em] text-sky-200 transition hover:border-sky-200/50 hover:bg-slate-800 hover:text-white disabled:cursor-default disabled:opacity-30 disabled:hover:border-sky-200/25 disabled:hover:bg-slate-800/70 disabled:hover:text-sky-200"
          >
            {ELECTION.continue}
          </button>
        </div>
      </div>
    </div>
  );
}
