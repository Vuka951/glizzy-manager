'use client';

import { useState } from 'react';
import CrownIcon from '@/components/icons/CrownIcon';
import PortraitHead from '@/components/games/PortraitHead';
import { winRate } from '@/components/games/career/CampaignAwards';
import PaperSection from '@/components/games/career/PaperSection';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import CoachTag from '@/components/games/career-mp/CoachTag';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import type { CoachTagMap } from '@/lib/types/careerMp';
import { h2hFor } from '@/lib/utils/careerMatch';
import { careerPoints } from '@/lib/utils/careerPoints';
import type { CharacterCareerState, SavedCareer } from '@/lib/utils/careerSave';

const R = GAMES_UI.career.report;
const D = GAMES_UI.career.dossier;
const PERSONALITIES = D.personalities as Record<string, { name: string }>;

type SortKey =
  | 'points'
  | 'titles'
  | 'pct'
  | 'eaten'
  | 'exits'
  | 'punishments'
  | 'fame'
  | 'money'
  | 'betsHit'
  | 'betsNet';
type Sort = { key: SortKey; desc: boolean };
const DEFAULT_SORT: Sort = { key: 'points', desc: true };

function exits(ch: CharacterCareerState): number {
  return ch.meltdowns + ch.forfeits + ch.withdrawals;
}

function SortHeader({
  id,
  label,
  sort,
  onToggle,
}: {
  id: SortKey;
  label: string;
  sort: Sort;
  onToggle: (key: SortKey) => void;
}) {
  const active = sort.key === id;
  return (
    <th
      className="pb-1.5 pr-2 text-center"
      aria-sort={active ? (sort.desc ? 'descending' : 'ascending') : 'none'}
    >
      <button
        onClick={() => onToggle(id)}
        className={`inline-flex items-center gap-0.5 uppercase tracking-widest transition hover:text-red-800 ${
          active
            ? 'text-red-800 underline decoration-red-800/40 underline-offset-4'
            : ''
        }`}
      >
        {label}
        <span className="w-2 text-[8px]">
          {active ? (sort.desc ? '▼' : '▲') : ''}
        </span>
      </button>
    </th>
  );
}

// The whole league at the end, with the numbers the season table never had
// room for, sortable by any column; the champion's row in gold, the
// reader's in red, a shared room's coaches tagged
export default function CampaignTable({
  career,
  characterBySlug,
  order,
  overlordSlug,
  coaches,
  bets,
}: {
  career: SavedCareer;
  characterBySlug: Map<string, DuelCharacter>;
  order: string[];
  overlordSlug: string;
  coaches?: CoachTagMap;
  // A shared room: each coach's bets, shown as a column
  bets?: Record<string, { placed: number; won: number; net: number }>;
}) {
  const [sort, setSort] = useState<Sort>(DEFAULT_SORT);
  const playerSlug = career.playerSlug;
  const st = (slug: string) => career.characters[slug];
  const moneyOf = (slug: string) =>
    slug === playerSlug ? career.balance : (st(slug).money ?? 0);
  const vsPlayer = (slug: string) => h2hFor(career.h2h, playerSlug, slug);
  const sortValue: Record<SortKey, (slug: string) => number> = {
    points: (slug) => careerPoints(st(slug)),
    titles: (slug) => st(slug).titles,
    pct: (slug) => winRate(st(slug)),
    eaten: (slug) => st(slug).eaten ?? 0,
    exits: (slug) => exits(st(slug)),
    punishments: (slug) => st(slug).punishments ?? 0,
    fame: (slug) => st(slug).fame,
    money: moneyOf,
    // Coaches without a bet sort to the bottom either way
    betsHit: (slug) =>
      bets?.[slug] && bets[slug].placed > 0
        ? bets[slug].won / bets[slug].placed + bets[slug].won / 1000
        : -1,
    betsNet: (slug) =>
      bets?.[slug] ? bets[slug].net : Number.NEGATIVE_INFINITY,
  };
  // The table place stays with the character however the rows are sorted
  const placeOf = new Map(order.map((slug, i) => [slug, i + 1]));
  // A stable sort over the table order, so ties keep their table place
  const rows = [...order].sort((a, b) => {
    const diff = sortValue[sort.key](b) - sortValue[sort.key](a);
    return sort.desc ? diff : -diff;
  });
  // A new column sorts high to low; the same column again flips it
  const toggleSort = (key: SortKey) =>
    setSort((current) =>
      current.key === key ? { key, desc: !current.desc } : { key, desc: true },
    );
  return (
    <PaperSection title={R.tableTitle} action="stats">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[58rem] text-left text-[11px] text-slate-800">
          <thead>
            <tr className="border-b-2 border-slate-900 text-[9px] font-black uppercase tracking-widest text-slate-600">
              <th className="pb-1.5 pl-2 pr-2">#</th>
              <th className="pb-1.5 pr-2">{R.headers.character}</th>
              <th className="pb-1.5 pr-2 text-center">{R.headers.sponsor}</th>
              <SortHeader
                id="points"
                label={R.headers.points}
                sort={sort}
                onToggle={toggleSort}
              />
              <SortHeader
                id="titles"
                label={R.headers.titles}
                sort={sort}
                onToggle={toggleSort}
              />
              <th className="pb-1.5 pr-2 text-center">{R.headers.record}</th>
              <SortHeader
                id="pct"
                label={R.headers.pct}
                sort={sort}
                onToggle={toggleSort}
              />
              <SortHeader
                id="eaten"
                label={R.headers.eaten}
                sort={sort}
                onToggle={toggleSort}
              />
              <SortHeader
                id="exits"
                label={R.headers.exits}
                sort={sort}
                onToggle={toggleSort}
              />
              <SortHeader
                id="punishments"
                label={R.headers.punishments}
                sort={sort}
                onToggle={toggleSort}
              />
              <SortHeader
                id="fame"
                label={R.headers.fame}
                sort={sort}
                onToggle={toggleSort}
              />
              <SortHeader
                id="money"
                label={R.headers.money}
                sort={sort}
                onToggle={toggleSort}
              />
              <th className="pb-1.5 pr-2 text-center">{R.headers.vsYou}</th>
              {bets && (
                <>
                  <SortHeader
                    id="betsHit"
                    label={R.headers.betsHit}
                    sort={sort}
                    onToggle={toggleSort}
                  />
                  <SortHeader
                    id="betsNet"
                    label={R.headers.betsNet}
                    sort={sort}
                    onToggle={toggleSort}
                  />
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((slug) => {
              const ch = st(slug);
              const character = characterBySlug.get(slug);
              if (!character) return null;
              const isPlayer = slug === playerSlug;
              const isOverlord = slug === overlordSlug;
              const played = ch.wins + ch.losses;
              const record = isPlayer ? null : vsPlayer(slug);
              const coach = coaches?.[slug];
              return (
                <tr
                  key={slug}
                  className={`border-b border-dotted border-slate-900/30 ${
                    isOverlord
                      ? 'bg-amber-300/40 font-bold'
                      : isPlayer
                        ? 'bg-red-700/10 font-bold'
                        : ''
                  }`}
                >
                  <td className="py-1.5 pl-2 pr-2 font-mono text-slate-500">
                    {placeOf.get(slug)}
                  </td>
                  <td className="py-1.5 pr-2">
                    <span className="flex items-center gap-1.5">
                      <PortraitHead
                        character={character}
                        className={`h-5 w-5 ${isOverlord ? 'ring-2 ring-amber-500' : ''}`}
                      />
                      <span className="flex min-w-0 flex-col leading-tight">
                        <span className="truncate">{character.name}</span>
                        {ch.personality && (
                          <span className="truncate text-[9px] font-normal italic text-slate-500">
                            {PERSONALITIES[ch.personality]?.name}
                          </span>
                        )}
                      </span>
                      {isOverlord && (
                        <CrownIcon className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                      )}
                      {coach ? (
                        <CoachTag
                          name={coach.name}
                          color={coach.color}
                          onPaper
                        />
                      ) : (
                        isPlayer && (
                          <span className="shrink-0 rounded-sm bg-red-700 px-1 text-[8px] font-black uppercase tracking-widest text-amber-50">
                            {R.you}
                          </span>
                        )
                      )}
                    </span>
                  </td>
                  <td className="py-1.5 pr-2 text-center text-slate-500">
                    {ch.sponsor ? (
                      <span className="inline-flex justify-center">
                        <SponsorEmblem
                          sponsorId={ch.sponsor.sponsorId}
                          className="h-4 w-4"
                        />
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="py-1.5 pr-2 text-center font-mono font-black">
                    {careerPoints(ch)}
                  </td>
                  <td className="py-1.5 pr-2 text-center font-mono">
                    {ch.titles > 0 ? ch.titles : ''}
                    {ch.titleStreak >= 2 && (
                      <span className="ml-1 text-amber-700">
                        x{ch.titleStreak}
                      </span>
                    )}
                  </td>
                  <td className="py-1.5 pr-2 text-center font-mono">
                    {ch.wins}-{ch.losses}
                  </td>
                  <td className="py-1.5 pr-2 text-center font-mono text-slate-500">
                    {played > 0 ? Math.round(winRate(ch) * 100) : ''}
                  </td>
                  <td className="py-1.5 pr-2 text-center font-mono">
                    {ch.eaten ?? 0}
                  </td>
                  <td className="py-1.5 pr-2 text-center font-mono text-red-800">
                    {exits(ch) > 0 ? exits(ch) : ''}
                  </td>
                  <td className="py-1.5 pr-2 text-center font-mono text-red-800">
                    {(ch.punishments ?? 0) > 0 ? ch.punishments : ''}
                  </td>
                  <td className="py-1.5 pr-2 text-center font-mono">
                    {Math.round(ch.fame)}
                  </td>
                  <td className="py-1.5 pr-2 text-center font-mono">
                    {moneyOf(slug)}
                  </td>
                  <td className="py-1.5 pr-2 text-center font-mono">
                    {record ? `${record[1]}-${record[0]}` : ''}
                  </td>
                  {bets && (
                    <>
                      <td className="whitespace-nowrap py-1.5 pr-2 text-center font-mono">
                        {bets[slug]
                          ? `${bets[slug].won}/${bets[slug].placed}`
                          : ''}
                      </td>
                      <td
                        className={`py-1.5 pr-2 text-center font-mono ${
                          bets[slug] && bets[slug].net > 0
                            ? 'text-emerald-800'
                            : bets[slug] && bets[slug].net < 0
                              ? 'text-red-800'
                              : ''
                        }`}
                      >
                        {bets[slug]
                          ? `${bets[slug].net > 0 ? '+' : ''}${bets[slug].net}`
                          : ''}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-2 text-[9px] italic leading-relaxed text-slate-500">
          {R.tableHint}
        </p>
      </div>
    </PaperSection>
  );
}
