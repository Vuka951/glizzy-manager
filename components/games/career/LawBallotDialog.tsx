'use client';

import { useState } from 'react';
import BallotBoard from '@/components/games/career/BallotBoard';
import BallotMarkBox from '@/components/games/career/BallotMarkBox';
import BallotPaper from '@/components/games/career/BallotPaper';
import CareerButton from '@/components/games/career/CareerButton';
import CoalitionVoterChip from '@/components/games/career/CoalitionVoterChip';
import LawCardOption from '@/components/games/career/LawCardOption';
import LawQuorumRow from '@/components/games/career/LawQuorumRow';
import LawSeal from '@/components/games/career/LawSeal';
import BrassPlate from '@/components/games/career/street/BrassPlate';
import PaperSheet from '@/components/games/career/street/PaperSheet';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import PortraitHead from '@/components/games/PortraitHead';
import PhaseTimer from '@/components/games/rooms/PhaseTimer';
import { LAW_PARTNER_PASS_SHARE } from '@/data/games/careerLaws';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import {
  LAW_VOTES,
  lawBallotStage,
  lawPassShare,
  lawQuorums,
  pickedCard,
  type LawBallot,
  type LawInForce,
  type LawVote,
} from '@/lib/utils/careerLaws';
import { hasVoted } from '@/lib/utils/careerParliamentVote';
import type { SponsorId } from '@/lib/utils/careerSave';
import { fmt } from '@/lib/utils/format';

const BALLOT = GAMES_UI.career.laws.ballot;
const ISSUER = GAMES_UI.career.parliament.title;
const SHORT_NAMES = GAMES_UI.career.sponsors.shortNames as Record<
  SponsorId,
  string
>;

const threshold = (share: number) =>
  fmt(BALLOT.threshold, { share: Math.round(share * 100) });

// The law vote while it is open, posted on the chamber's board: the picker
// lays one of the bills on the wood, then the bill is set in an official
// ballot with the governing lists' seal, the bars it has to clear with only
// the viewer's own vote on them, the voters and the two squares to cross. The
// verdict belongs to the chamber cutscene
export default function LawBallotDialog({
  ballot,
  playerSlug,
  characterBySlug,
  laws = [],
  deadline = null,
  serverOffset = 0,
  onPick,
  onVote,
}: {
  ballot: LawBallot;
  playerSlug: string;
  characterBySlug: Map<string, DuelCharacter>;
  laws?: LawInForce[];
  deadline?: number | null;
  serverOffset?: number;
  onPick: (index: number) => void;
  onVote: (vote: LawVote) => void;
}) {
  const [chosen, setChosen] = useState<number | null>(null);
  const [sent, setSent] = useState(false);
  const stage = lawBallotStage(ballot);
  const card = pickedCard(ballot);
  const own = ballot.ballots.find((b) => b.slug === playerSlug && b.human);
  const picking = stage === 'pick' && ballot.picker === playerSlug;
  const picker = ballot.picker ? characterBySlug.get(ballot.picker) : undefined;
  const leader = ballot.government[0];
  const quorums = lawQuorums(ballot);
  const ownPartner = own !== undefined && (ballot.partners ?? []).includes(own.slug);
  const partnerParties = ballot.government.slice(1);
  const ownWeight = (side: LawVote, counts = true) =>
    counts && own?.choice === side ? own.weight : 0;
  const columns =
    ballot.cards.length === 3
      ? 'sm:grid-cols-3'
      : ballot.cards.length >= 2
        ? 'sm:grid-cols-2'
        : 'sm:mx-auto sm:max-w-xs';

  return (
    <BallotBoard
      title={BALLOT.title}
      badge={<SponsorEmblem sponsorId={leader} className="h-5 w-5" />}
      aside={
        <>
          {own && (
            <BrassPlate className="tabular-nums">
              {fmt(BALLOT.weight, { weight: own.weight })}
            </BrassPlate>
          )}
          <PhaseTimer deadline={deadline} serverOffset={serverOffset} />
        </>
      }
      footer={
        picking ? (
          <CareerButton
            tone="danger"
            full
            disabled={chosen === null || sent}
            onClick={() => {
              if (chosen === null) return;
              setSent(true);
              onPick(chosen);
            }}
            className="min-h-11"
          >
            {BALLOT.propose}
          </CareerButton>
        ) : undefined
      }
    >
      {stage === 'pick' && !picking && (
        <PaperSheet className="flex -rotate-[0.6deg] items-center gap-2 self-center px-2.5 py-1.5">
          {picker && <PortraitHead character={picker} className="h-7 w-7" />}
          <span className="font-serif text-[13px] font-semibold text-slate-200">
            {fmt(BALLOT.picking, {
              name: picker?.name ?? SHORT_NAMES[leader],
            })}
          </span>
        </PaperSheet>
      )}

      {stage === 'pick' && (
        <div className={`grid grid-cols-1 gap-3 p-1 sm:gap-4 ${columns}`}>
          {ballot.cards.map((option, i) => (
            <LawCardOption
              key={
                option.action === 'constitution'
                  ? option.action
                  : `${option.action}-${option.law}`
              }
              card={option}
              laws={laws}
              index={i}
              selected={picking && chosen === i}
              onSelect={picking && !sent ? () => setChosen(i) : undefined}
            />
          ))}
        </div>
      )}

      {stage !== 'pick' && card && (
        <BallotPaper
          seal={<LawSeal party={leader} />}
          heading={ballot.government.map((id) => SHORT_NAMES[id]).join(' + ')}
          stamp={ISSUER}
          className="mx-auto max-w-lg"
        >
          <LawCardOption card={card} laws={laws} printed />

          {ballot.ballots.length > 0 && (
            <div className="flex flex-col gap-1 border-t border-dashed border-slate-500 pt-2.5">
              <LawQuorumRow
                parties={ballot.government}
                label={BALLOT.government}
                yes={ownWeight('yes')}
                no={ownWeight('no')}
                total={quorums.chamber.total}
                needed={quorums.chamber.needed}
                threshold={threshold(lawPassShare(ballot))}
              />
              {quorums.partners && (
                <LawQuorumRow
                  parties={partnerParties}
                  label={partnerParties.map((id) => SHORT_NAMES[id]).join(' + ')}
                  yes={ownWeight('yes', ownPartner)}
                  no={ownWeight('no', ownPartner)}
                  total={quorums.partners.total}
                  needed={quorums.partners.needed}
                  threshold={threshold(LAW_PARTNER_PASS_SHARE)}
                  size="sm"
                />
              )}
            </div>
          )}

          {ballot.ballots.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2.5">
              {ballot.ballots.map((b) => (
                <CoalitionVoterChip
                  key={b.slug}
                  ballot={b}
                  character={characterBySlug.get(b.slug)}
                  own={b.slug === playerSlug}
                  state={hasVoted(b) ? 'voted' : 'waiting'}
                />
              ))}
            </div>
          )}

          {stage === 'vote' &&
            (own ? (
              <div
                role="group"
                aria-label={BALLOT.yourVote}
                className="grid grid-cols-2 gap-2 border-t-[3px] border-double border-slate-200 pt-3"
              >
                {LAW_VOTES.map((vote) => (
                  <BallotMarkBox
                    key={vote}
                    answer={vote}
                    label={vote === 'yes' ? BALLOT.yes : BALLOT.no}
                    selected={own.choice === vote}
                    weight={own.weight}
                    onClick={() => onVote(vote)}
                  />
                ))}
              </div>
            ) : (
              <p className="border-t-[3px] border-double border-slate-200 pt-2.5 text-center font-serif text-[13px] font-semibold text-slate-400">
                {BALLOT.waiting}
              </p>
            ))}
        </BallotPaper>
      )}
    </BallotBoard>
  );
}
