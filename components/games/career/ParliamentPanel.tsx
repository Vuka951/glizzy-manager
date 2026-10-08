'use client';

import { useState } from 'react';
import PortraitHead from '@/components/games/PortraitHead';
import ParliamentChamber from '@/components/games/career/ParliamentChamber';
import ParliamentPopularity from '@/components/games/career/ParliamentPopularity';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import {
  ELECTION_SEASON,
  PARLIAMENT_SEATS,
  PARTY_SEAT_ORDER,
  FAVOR_TIERS,
} from '@/data/games/careerElections';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import {
  favorsEarned,
  favorsLeft,
  governmentSeats,
  isElectionYear,
  nextElectionYear,
} from '@/lib/utils/careerElections';
import type { SavedCareer, SponsorId } from '@/lib/utils/careerSave';
import { seasonName } from '@/lib/utils/localeNames';
import { fmt } from '@/lib/utils/format';

const P = GAMES_UI.career.parliament;
const SPONSOR_NAMES = GAMES_UI.career.sponsors.names as Record<
  SponsorId,
  string
>;

// The city chamber as it stands: who sits where, who governs, whose players
// are whose, and what the player's own party and favor are worth this year.
// Before the first count the benches are empty and nobody governs; the poll
// and the projection live on the popularity tab
export type ParliamentTab = 'chamber' | 'popularity';

export default function ParliamentPanel({
  career,
  characterBySlug,
  initialTab = 'chamber',
}: {
  career: SavedCareer;
  characterBySlug: Map<string, DuelCharacter>;
  initialTab?: ParliamentTab;
}) {
  const [tab, setTab] = useState<ParliamentTab>(initialTab);
  const parliament = career.parliament;
  if (!parliament) return null;
  const governed = parliament.government.length > 0;
  const seats = parliament.seats;
  const playerParty =
    career.characters[career.playerSlug]?.sponsor?.sponsorId ?? null;
  const status = career.characters[career.playerSlug]?.partyStatus;
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
      className="grid grid-cols-2 gap-0.5 rounded-full border border-sky-200/10 bg-slate-900/60 p-0.5"
    >
      {(['chamber', 'popularity'] as const).map((id) => (
        <button
          key={id}
          role="tab"
          aria-selected={tab === id}
          onClick={() => setTab(id)}
          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] transition ${
            tab === id
              ? 'bg-sky-200/15 text-sky-100'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {P.tabs[id]}
        </button>
      ))}
    </div>
  );

  if (tab === 'popularity') {
    return (
      <div className="flex w-full flex-col gap-3">
        {tabs}
        <ParliamentPopularity
          career={career}
          characterBySlug={characterBySlug}
        />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3">
      {tabs}
      <ParliamentChamber
        seats={seats}
        government={parliament.government}
        dimOutside={governed}
        className="max-h-44"
      />
      <p className="text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
        {governed
          ? fmt(P.governmentLine, {
              seats: governmentSeats({
                seats,
                government: parliament.government,
              }),
              total: PARLIAMENT_SEATS,
            })
          : P.noGovernment}
      </p>
      <ul className="flex flex-col gap-1.5">
        {order.map((id) => {
          const inGovernment = parliament.government.includes(id);
          const leads = parliament.government[0] === id;
          const clients = Object.entries(career.characters)
            .filter(([, ch]) => ch.sponsor?.sponsorId === id)
            .map(([slug]) => characterBySlug.get(slug))
            .filter((c): c is DuelCharacter => Boolean(c));
          return (
            <li
              key={id}
              className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs ${
                inGovernment
                  ? 'border-emerald-400/30 bg-emerald-500/5 text-slate-100'
                  : governed
                    ? 'border-slate-800 text-slate-400'
                    : 'border-sky-200/10 text-slate-200'
              } ${id === playerParty ? 'ring-1 ring-amber-300/50' : ''}`}
            >
              <SponsorEmblem sponsorId={id} className="h-4 w-4" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">
                  {SPONSOR_NAMES[id]}
                </span>
                <span className="mt-0.5 flex items-center gap-0.5">
                  {clients.length === 0 ? (
                    <span className="text-[9px] text-slate-500">
                      {P.noClients}
                    </span>
                  ) : (
                    clients.map((c) => (
                      <PortraitHead
                        key={c.slug}
                        character={c}
                        className="h-4 w-4"
                      />
                    ))
                  )}
                </span>
              </span>
              {governed && (
                <span className="font-mono tabular-nums">{seats[id]}</span>
              )}
              {governed && (
                <span
                  className={`rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${
                    leads
                      ? 'border-emerald-400 text-emerald-300'
                      : inGovernment
                        ? 'border-emerald-400/50 text-emerald-300/80'
                        : 'border-red-400/50 text-red-300'
                  }`}
                >
                  {leads ? P.leads : inGovernment ? P.partner : P.opposition}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <div className="flex flex-col gap-1 rounded-xl border border-sky-200/10 bg-slate-900/40 px-3 py-2 text-[11px] text-slate-300">
        <span>
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
        {governed && playerParty && (
          <span
            className={favorsRemaining > 0 ? 'text-amber-200' : 'text-slate-500'}
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
        <span className="text-slate-500">
          {fmt(P.nextElection, {
            season: seasonName(ELECTION_SEASON),
            year: nextVote,
          })}
        </span>
      </div>
    </div>
  );
}
