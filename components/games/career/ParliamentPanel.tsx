'use client';

import { useState } from 'react';
import PortraitHead from '@/components/games/PortraitHead';
import InfoButton from '@/components/games/career/InfoButton';
import LawsInfoPanel from '@/components/games/career/LawsInfoPanel';
import LawsInForceList from '@/components/games/career/LawsInForceList';
import ParliamentGallery from '@/components/games/career/ParliamentGallery';
import ParliamentMemo from '@/components/games/career/ParliamentMemo';
import ParliamentPartyPlate from '@/components/games/career/ParliamentPartyPlate';
import ParliamentPmPlate from '@/components/games/career/ParliamentPmPlate';
import ParliamentPopularity from '@/components/games/career/ParliamentPopularity';
import ParliamentTabPlaque from '@/components/games/career/ParliamentTabPlaque';
import SponsorModal from '@/components/games/career/SponsorModal';
import {
  ELECTION_SEASON,
  PARLIAMENT_SEATS,
  PARTY_SEAT_ORDER,
  FAVOR_TIERS,
} from '@/data/games/careerElections';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { COACH_COLOR_CLASSES } from '@/lib/constants/careerMp';
import type { CoachTagMap } from '@/lib/types/careerMp';
import { GAMES_UI } from '@/data/games/locale';
import {
  favorsEarned,
  favorsLeft,
  governmentSeats,
  isElectionYear,
  nextElectionYear,
} from '@/lib/utils/careerElections';
import { lawsInForce, primeMinister } from '@/lib/utils/careerLaws';
import type { SavedCareer } from '@/lib/utils/careerSave';
import { STREET_TRAY } from '@/lib/utils/careerFrameClasses';
import { seasonName } from '@/lib/utils/localeNames';
import { fmt } from '@/lib/utils/format';
import { leaderEffectLines } from '@/lib/utils/governmentEffects';

const P = GAMES_UI.career.parliament;
const LAWS_INFO = GAMES_UI.career.laws.info;

// The city chamber as it stands: who sits where, who governs, whose players
// are whose, and what the player's own party and favor are worth this year.
// Before the first count the benches are empty and nobody governs; the poll
// and the projection live on the popularity tab, the books on the laws tab.
// Each tab sits straight on the board: the gallery view with the benches and
// the party's note, the printed poll, the gazette
export type ParliamentTab = 'chamber' | 'popularity' | 'laws';

export default function ParliamentPanel({
  career,
  characterBySlug,
  initialTab = 'chamber',
  coaches,
}: {
  career: SavedCareer;
  characterBySlug: Map<string, DuelCharacter>;
  initialTab?: ParliamentTab;
  // A shared league: every human's character wears his coach's color
  coaches?: CoachTagMap;
}) {
  const [tab, setTab] = useState<ParliamentTab>(initialTab);
  const [lawsInfo, setLawsInfo] = useState(false);
  const parliament = career.parliament;
  if (!parliament) return null;
  const governed = parliament.government.length > 0;
  const pmSlug = primeMinister(career);
  const pm = pmSlug ? characterBySlug.get(pmSlug) : undefined;
  const pmCoach = pmSlug ? coaches?.[pmSlug] : undefined;
  const seats = parliament.seats;
  const playerParty =
    career.characters[career.playerSlug]?.sponsor?.sponsorId ?? null;
  const status = career.characters[career.playerSlug]?.partyStatus;
  // Everyone outside the government pays the leading party's toll, party or not
  const outsideToll =
    governed && (!playerParty || status === 'opposition')
      ? leaderEffectLines(parliament.government[0]).outside
      : null;
  const favorsRemaining = favorsLeft(career, career.playerSlug);
  const favorsTotal = favorsEarned(
    parliament.lastDonors[career.playerSlug] ?? 0,
  );
  // Listed the way the chamber above is seated, far left to far right
  const order = PARTY_SEAT_ORDER;
  const electionYear = isElectionYear(career.year);
  const nextVote =
    electionYear && career.season <= ELECTION_SEASON
      ? career.year
      : nextElectionYear(career.year + 1);

  const tabs = (
    <div
      role="tablist"
      className={`grid shrink-0 grid-cols-3 gap-1 p-1 @md:gap-1.5 @md:p-1.5 ${STREET_TRAY}`}
    >
      {(['chamber', 'popularity', 'laws'] as const).map((id) => (
        <ParliamentTabPlaque
          key={id}
          selected={tab === id}
          onClick={() => setTab(id)}
        >
          {P.tabs[id]}
        </ParliamentTabPlaque>
      ))}
    </div>
  );

  const chamber = (
    <div className="grid grid-cols-1 gap-2.5 @3xl:grid-cols-[5fr_6fr] @3xl:gap-3">
      <ParliamentGallery
        seats={seats}
        government={parliament.government}
        governed={governed}
        line={
          governed
            ? fmt(P.governmentLine, {
                seats: governmentSeats({
                  seats,
                  government: parliament.government,
                }),
                total: PARLIAMENT_SEATS,
              })
            : P.noGovernment
        }
      >
        {governed && pm && (
          <ParliamentPmPlate
            character={pm}
            party={parliament.government[0]}
            ring={
              pmCoach
                ? COACH_COLOR_CLASSES[pmCoach.color].ring
                : 'ring-[#78350f]'
            }
          />
        )}
      </ParliamentGallery>
      <ul className="flex flex-col gap-1.5 text-left @3xl:col-start-2 @3xl:row-span-2 @3xl:row-start-1 @3xl:grid @3xl:auto-rows-fr @3xl:gap-2">
        {order.map((id) => {
          const clients = Object.entries(career.characters)
            .filter(([, ch]) => ch.sponsor?.sponsorId === id)
            .map(([slug]) => characterBySlug.get(slug))
            .filter((c): c is DuelCharacter => Boolean(c));
          return (
            <ParliamentPartyPlate
              key={id}
              party={id}
              seats={governed ? seats[id] : null}
              standing={
                !governed
                  ? null
                  : parliament.government[0] === id
                    ? 'leads'
                    : parliament.government.includes(id)
                      ? 'partner'
                      : 'opposition'
              }
              mine={id === playerParty}
            >
              {clients.length === 0 ? (
                <span className="font-sign text-[12px] font-semibold text-slate-400">
                  {P.noClients}
                </span>
              ) : (
                clients.map((c) => {
                  const coach = coaches?.[c.slug];
                  const ring = coach
                    ? COACH_COLOR_CLASSES[coach.color].ring
                    : !coaches && c.slug === career.playerSlug
                      ? 'ring-[#b8862f]'
                      : null;
                  return (
                    <span
                      key={c.slug}
                      title={coach?.name}
                      className="inline-flex min-w-0 max-w-[9rem] items-center gap-1 rounded-[2px] bg-[#f1e8d3] py-px pl-px pr-1.5 text-[#1c1408] shadow-[0_1px_0_rgb(0_0_0/0.6)]"
                    >
                      <PortraitHead
                        character={c}
                        className={`h-4 w-4 shrink-0 @3xl:h-5 @3xl:w-5 ${
                          ring ? `ring-2 ${ring}` : ''
                        }`}
                      />
                      <span className="truncate font-serif text-[11px] font-bold @3xl:text-[12px]">
                        {c.name}
                      </span>
                    </span>
                  );
                })
              )}
            </ParliamentPartyPlate>
          );
        })}
      </ul>
      <ParliamentMemo className="@3xl:col-start-1">
        <span className="font-semibold">
          {!playerParty
            ? P.you.none
            : status === 'leader'
              ? P.you.leader
              : status === 'partner'
                ? P.you.partner
                : status === 'opposition'
                  ? P.you.opposition
                  : P.you.waiting}
        </span>
        {outsideToll && (
          <span className="text-red-400">
            <span className="font-bold">{P.effects.outside}: </span>
            {outsideToll}
          </span>
        )}
        {governed && playerParty && (
          <span
            className={
              favorsRemaining > 0 ? 'font-semibold text-amber-400' : 'text-slate-400'
            }
          >
            {favorsRemaining > 0
              ? fmt(P.favorAvailable, {
                  left: favorsRemaining,
                  total: favorsTotal,
                })
              : favorsTotal > 0
                ? fmt(P.favorUsed, { total: favorsTotal })
                : fmt(P.favorNoDonation, {
                    min: FAVOR_TIERS[0],
                    top: FAVOR_TIERS[FAVOR_TIERS.length - 1],
                  })}
          </span>
        )}
        <span className="text-slate-400">
          {fmt(P.nextElection, {
            season: seasonName(ELECTION_SEASON),
            year: nextVote,
          })}
        </span>
      </ParliamentMemo>
    </div>
  );

  // The tab bar stays put and the body scrolls under it, so the modal around
  // it keeps one size whichever tab is open
  return (
    <div className="@container flex h-full w-full flex-col gap-3 phone-landscape:overflow-y-auto">
      {tabs}
      <div className="@container -mr-3 min-h-0 flex-1 overflow-y-auto pr-3 [scrollbar-color:#b8862f_transparent] [scrollbar-gutter:stable] [scrollbar-width:thin] phone-landscape:mr-0 phone-landscape:flex-none phone-landscape:overflow-visible phone-landscape:pr-0">
        {tab === 'laws' ? (
          <LawsInForceList
            laws={lawsInForce(parliament)}
            slots
            extra={
              <InfoButton
                label={LAWS_INFO.title}
                onClick={() => setLawsInfo(true)}
              />
            }
          />
        ) : tab === 'popularity' ? (
          <ParliamentPopularity
            career={career}
            characterBySlug={characterBySlug}
          />
        ) : (
          chamber
        )}
      </div>
      {lawsInfo && (
        <SponsorModal
          sponsorId={playerParty}
          title={LAWS_INFO.title}
          onClose={() => setLawsInfo(false)}
        >
          <LawsInfoPanel />
        </SponsorModal>
      )}
    </div>
  );
}
