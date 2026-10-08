'use client';

import { useState } from 'react';
import { studioAccents } from '@/lib/constants/studioThemes';
import TournamentBracket from '@/components/games/tournament/TournamentBracket';
import GameModal from '@/components/games/GameModal';
import BroadcastOpenPanel from '@/components/games/career/BroadcastOpenPanel';
import FavorPicker, {
  type FavorCandidate,
} from '@/components/games/career/FavorPicker';
import SkipVotes from '@/components/games/career-mp/SkipVotes';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import type { CoachTagMap, RoomAction, RoomView } from '@/lib/types/careerMp';
import { broadcastUnlocks } from '@/lib/utils/careerBroadcast';
import {
  canRemove,
  favorPending,
  favorsLeft,
  roundParticipants,
} from '@/lib/utils/careerElections';
import { careerBettingUnlocked, matchOdds } from '@/lib/utils/careerOdds';
import { buffedSlugsForSeason, seasonThemeIndex } from '@/lib/utils/cupSeason';
import { fmt } from '@/lib/utils/format';
import { cupRoundName } from '@/lib/utils/localeNames';
import { cupMatchLoser } from '@/lib/utils/tournamentSim';

const RB = GAMES_UI.careerMp.roundBoard;
const FAVOR = GAMES_UI.career.favor;

// The bracket between rounds: a look at the draw, the party favor, the
// withdrawal, and the votes to skip ahead
export default function RoundBoard({
  view,
  characterBySlug,
  coaches,
  busy,
  send,
}: {
  view: RoomView;
  characterBySlug: Map<string, DuelCharacter>;
  coaches: CoachTagMap;
  busy: boolean;
  send: (action: RoomAction) => void;
}) {
  const [favorOpen, setFavorOpen] = useState(false);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const career = view.career;
  const phase = view.phase;
  if (!career?.cup || phase.kind !== 'cup-pre') return null;
  const cup = career.cup;
  const round = phase.round;
  const mySlug = career.playerSlug;
  const accent = studioAccents(seasonThemeIndex(career.season));
  const matches = cup.rounds[round] ?? [];
  const isFinalRound = round === cup.rounds.length - 1;
  const myMatch = matches.find(
    (m) => !m.result && m.a && m.b && (m.a === mySlug || m.b === mySlug),
  );
  const eliminated =
    cup.withdrawn ||
    !cup.rounds[0].some((m) => m.a === mySlug || m.b === mySlug) ||
    cup.rounds.some((r) => r.some((m) => m.result && cupMatchLoser(m) === mySlug));
  const party = career.characters[mySlug].sponsor?.sponsorId ?? null;
  const favorsRemaining = favorsLeft(career, mySlug);
  const favorReady =
    favorsRemaining > 0 && !favorPending(career, mySlug) && !isFinalRound;
  const candidates: FavorCandidate[] = roundParticipants(matches, cup.removals)
    .filter(
      (p, i, all) =>
        p.slug !== mySlug && all.findIndex((q) => q.slug === p.slug) === i,
    )
    .map((p) => {
      const ok = canRemove(career, mySlug, p.slug);
      const own = career.characters[p.slug]?.sponsor?.sponsorId === party;
      return {
        ...p,
        ok,
        ...(ok ? {} : { blocked: own ? ('own' as const) : ('protected' as const) }),
        opponent:
          myMatch?.index === p.index && (myMatch.a === p.slug || myMatch.b === p.slug),
      };
    });
  const bettingOpen = careerBettingUnlocked(career);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <span
        className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${accent.chip}`}
      >
        {cupRoundName(round)}
      </span>
      {confirmWithdraw && (
        <GameModal title={RB.withdraw} onClose={() => setConfirmWithdraw(false)}>
          <div className="flex flex-col items-center gap-3">
            <p className="text-center text-sm font-semibold text-red-200">
              {RB.withdrawConfirm}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => {
                  setConfirmWithdraw(false);
                  send({ type: 'withdraw' });
                }}
                className="rounded-lg border border-red-500/40 bg-red-500/15 px-4 py-1.5 text-xs font-semibold text-red-200 transition hover:border-red-500/60 hover:text-white"
              >
                {RB.withdrawYes}
              </button>
              <button
                onClick={() => setConfirmWithdraw(false)}
                className="rounded-lg border border-sky-200/20 bg-slate-800/60 px-4 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-sky-200/40 hover:text-white"
              >
                {RB.withdrawNo}
              </button>
            </div>
          </div>
        </GameModal>
      )}
      {favorOpen && party && (
        <FavorPicker
          party={party}
          candidates={candidates}
          characterBySlug={characterBySlug}
          onConfirm={(targetSlug, index) => {
            setFavorOpen(false);
            send({ type: 'favor', targetSlug, index });
          }}
          onClose={() => setFavorOpen(false)}
        />
      )}
      {(favorReady || (!eliminated && myMatch)) && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {favorReady && (
            <button
              onClick={() => setFavorOpen(true)}
              disabled={busy}
              className="rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-200 transition hover:border-amber-300 hover:text-white disabled:opacity-60"
            >
              {fmt(FAVOR.button, { left: favorsRemaining })}
            </button>
          )}
          {!eliminated && myMatch && (
            <button
              onClick={() => setConfirmWithdraw(true)}
              disabled={busy}
              className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-red-300/80 transition hover:border-red-500/60 hover:text-red-200 disabled:opacity-60"
            >
              {RB.withdraw}
            </button>
          )}
        </div>
      )}
      {broadcastUnlocks(career).open &&
        round === 0 &&
        !cup.rounds[0].some((m) => m.result) && (
          <BroadcastOpenPanel career={career} characterBySlug={characterBySlug} />
        )}
      <div className="flex w-full overflow-x-auto [justify-content:safe_center]">
        <TournamentBracket
          rounds={cup.rounds}
          characterBySlug={characterBySlug}
          betSlug={mySlug}
          currentRound={round}
          matchBets={cup.matchBets}
          buffedSlugs={buffedSlugsForSeason(career.season)}
          oddsFor={
            bettingOpen
              ? (match) =>
                  match.a && match.b
                    ? matchOdds(career.characters, match.a, match.b)
                    : null
              : undefined
          }
          coaches={coaches}
        />
      </div>
      <SkipVotes
        view={view}
        showClip={false}
        onVoteClip={() => undefined}
        onVoteRound={(on) => send({ type: 'voteSkipRound', on })}
        onVoteCup={(on) => send({ type: 'voteSkipCup', on })}
      />
    </div>
  );
}
