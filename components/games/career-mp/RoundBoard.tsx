'use client';

import { useState } from 'react';
import CareerButton from '@/components/games/career/CareerButton';
import PaperSheet from '@/components/games/career/street/PaperSheet';
import TournamentBracket from '@/components/games/tournament/TournamentBracket';
import GameModal from '@/components/games/GameModal';
import BroadcastOpenPanel from '@/components/games/career/BroadcastOpenPanel';
import FavorPicker, {
  type FavorCandidate,
} from '@/components/games/career/FavorPicker';
import RoomPlank from '@/components/games/career-mp/RoomPlank';
import RoomSign from '@/components/games/career-mp/RoomSign';
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
import { buffedSlugsForSeason } from '@/lib/utils/cupSeason';
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

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <RoomSign>{cupRoundName(round)}</RoomSign>
      {confirmWithdraw && (
        <GameModal title={RB.withdraw} onClose={() => setConfirmWithdraw(false)}>
          <div className="flex flex-col items-center gap-3">
            <PaperSheet className="w-full px-4 py-3 text-center font-serif text-[15px] font-semibold text-slate-200">
              {RB.withdrawConfirm}
            </PaperSheet>
            <div className="flex flex-wrap justify-center gap-2">
              <CareerButton
                tone="danger"
                className="min-h-11"
                onClick={() => {
                  setConfirmWithdraw(false);
                  send({ type: 'withdraw' });
                }}
              >
                {RB.withdrawYes}
              </CareerButton>
              <CareerButton
                tone="quiet"
                className="min-h-11"
                onClick={() => setConfirmWithdraw(false)}
              >
                {RB.withdrawNo}
              </CareerButton>
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
        <RoomPlank className="flex flex-wrap items-center justify-center gap-2">
          {favorReady && (
            <CareerButton
              tone="buy"
              className="min-h-11"
              onClick={() => setFavorOpen(true)}
              disabled={busy}
            >
              {fmt(FAVOR.button, { left: favorsRemaining })}
            </CareerButton>
          )}
          {!eliminated && myMatch && (
            <CareerButton
              tone="danger"
              className="min-h-11"
              onClick={() => setConfirmWithdraw(true)}
              disabled={busy}
            >
              {RB.withdraw}
            </CareerButton>
          )}
        </RoomPlank>
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
          buffedSlugs={buffedSlugsForSeason(career.season, Object.keys(career.characters))}
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
