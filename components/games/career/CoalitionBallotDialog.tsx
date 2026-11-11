'use client';

import { useState } from 'react';
import BallotBoard from '@/components/games/career/BallotBoard';
import BallotPaper from '@/components/games/career/BallotPaper';
import CareerButton from '@/components/games/career/CareerButton';
import CoalitionOptionCard from '@/components/games/career/CoalitionOptionCard';
import LawSeal from '@/components/games/career/LawSeal';
import BrassPlate from '@/components/games/career/street/BrassPlate';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import PhaseTimer from '@/components/games/rooms/PhaseTimer';
import { GAMES_UI } from '@/data/games/locale';
import {
  coalitionPartners,
  coalitionSeats,
  type CoalitionBallot,
} from '@/lib/utils/careerCoalition';
import type { SponsorId } from '@/lib/utils/careerSave';
import { fmt } from '@/lib/utils/format';

const COALITION = GAMES_UI.career.election.coalition;
const ISSUER = GAMES_UI.career.parliament.title;
const SPONSOR_NAMES = GAMES_UI.career.sponsors.names as Record<
  SponsorId,
  string
>;

// The leader's coaches pick a partner on an official ballot under the list's
// wax: every way to a majority is a printed line with its square, the chamber
// drawn as it would sit, and the coach's own weight on the vote is on the
// board's rail
export default function CoalitionBallotDialog({
  ballot,
  seats,
  weight,
  deadline = null,
  serverOffset = 0,
  onVote,
}: {
  ballot: CoalitionBallot;
  seats: Record<SponsorId, number>;
  weight: number;
  deadline?: number | null;
  serverOffset?: number;
  onVote: (key: string) => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const columns =
    ballot.options.length === 2 || ballot.options.length === 4
      ? 'sm:grid-cols-2'
      : 'sm:grid-cols-3';
  return (
    <BallotBoard
      title={COALITION.ballotTitle}
      badge={<SponsorEmblem sponsorId={ballot.leader} className="h-5 w-5" />}
      aside={
        <>
          <BrassPlate className="tabular-nums">
            {fmt(COALITION.weight, { weight })}
          </BrassPlate>
          <PhaseTimer deadline={deadline} serverOffset={serverOffset} />
        </>
      }
      footer={
        <CareerButton
          tone="danger"
          full
          disabled={!picked}
          onClick={() => picked && onVote(picked)}
          className="min-h-11"
        >
          {COALITION.cast}
        </CareerButton>
      }
    >
      <BallotPaper
        seal={<LawSeal party={ballot.leader} />}
        heading={fmt(COALITION.ballotLead, {
          party: SPONSOR_NAMES[ballot.leader],
          seats: seats[ballot.leader],
        })}
        stamp={ISSUER}
      >
        <div className={`grid grid-cols-1 gap-2 ${columns}`}>
          {ballot.options.map((key) => (
            <CoalitionOptionCard
              key={key}
              leader={ballot.leader}
              partners={coalitionPartners(key)}
              seats={seats}
              total={coalitionSeats(seats, ballot.leader, key)}
              selected={picked === key}
              onSelect={() => setPicked(key)}
            />
          ))}
        </div>
      </BallotPaper>
    </BallotBoard>
  );
}
