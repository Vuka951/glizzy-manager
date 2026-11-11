import HintTooltip from '@/components/games/HintTooltip';
import PortraitHead from '@/components/games/PortraitHead';
import PaperSheet from '@/components/games/career/street/PaperSheet';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import {
  FAVOR_TIERS,
  PARTY_SEAT_ORDER,
  VOTE_DONATION_DIVISOR,
  VOTE_FAME_DIVISOR,
  VOTE_PLACE_WEIGHT,
} from '@/data/games/careerElections';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import { SPONSOR_THEMES } from '@/lib/constants/sponsorThemes';
import {
  countVotes,
  favorsEarned,
  partyPlayerPoints,
  partyPlayersShare,
  partyRatings,
  type PartyPlayerPoints,
  votePlaceTop,
} from '@/lib/utils/careerElections';
import { ordinal, plural, signedPct } from '@/lib/utils/format';
import type { SavedCareer, SponsorId } from '@/lib/utils/careerSave';
import { fmt } from '@/lib/utils/format';
import { PARTY_PAINT } from '@/lib/utils/partyPaint';

const P = GAMES_UI.career.parliament.popularity;
const SPONSOR_NAMES = GAMES_UI.career.sponsors.names as Record<
  SponsorId,
  string
>;

function signed(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}

// How much of the vote a piece is worth, cold to warm, in printer's ink: a man
// who moves the needle by a point reads red, one who carries a tenth of the
// vote reads green
function shareInk(pct: number): string {
  if (pct >= 9) return 'text-[#166534]';
  if (pct >= 6) return 'text-[#3f6212]';
  if (pct >= 4) return 'text-[#854d0e]';
  if (pct >= 2) return 'text-[#b43a0c]';
  return 'text-[#b91c1c]';
}

function TipRow({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <span className="flex items-baseline justify-between gap-3">
      <span className="text-slate-400">{label}</span>
      <span className={`font-sign text-[12px] font-bold tabular-nums ${tone}`}>{value}</span>
    </span>
  );
}

function PlayerTip({ name, p }: { name: string; p: PartyPlayerPoints }) {
  const tone = shareInk(p.sharePts);
  return (
    <span className="flex flex-col gap-0.5 text-left">
      <span className="truncate font-bold text-slate-100">{name}</span>
      <TipRow label={fmt(P.tip.place, { place: ordinal(p.place) })} value={signed(p.placePts)} tone="text-slate-200" />
      <TipRow label={fmt(P.tip.fame, { fame: p.fame })} value={signed(p.famePts)} tone="text-slate-200" />
      <span className="my-0.5 border-t border-slate-500" />
      <TipRow label={P.tip.total} value={signed(p.placePts + p.famePts)} tone={tone} />
      <TipRow label={P.tip.share} value={signedPct(p.sharePts)} tone={tone} />
    </span>
  );
}

// What a gift bought the list and the giver: campaign points on the count,
// favors for the donor, and the next rung if there is one
function DonorTip({ name, amount }: { name: string; amount: number }) {
  const favors = favorsEarned(amount);
  const nextTier = FAVOR_TIERS.find((tier) => amount < tier);
  return (
    <span className="flex flex-col gap-0.5 text-left">
      <span className="truncate font-bold text-slate-100">{name}</span>
      <TipRow label={plural(P.tip.donated, amount, { amount })} value="" tone="" />
      <TipRow
        label={P.tip.campaignPts}
        value={signed(Math.round(amount / VOTE_DONATION_DIVISOR))}
        tone="text-emerald-300"
      />
      <TipRow
        label={P.tip.favors}
        value={String(favors)}
        tone={favors > 0 ? 'text-amber-300' : 'text-slate-500'}
      />
      {nextTier !== undefined && (
        <span className="text-[9px] text-slate-400">
          {fmt(P.tip.nextFavor, { amount: nextTier })}
        </span>
      )}
    </span>
  );
}

function toneClass(value: number): string {
  return value > 0
    ? 'text-emerald-300'
    : value < 0
      ? 'text-red-400'
      : 'text-slate-400';
}

// Who gave to a party's chest, biggest gift first. The donor's party is the
// one he is signed to, since the letters only ever come from his own list
function donorsOf(
  career: SavedCareer,
  donors: Record<string, number>,
  party: SponsorId,
): { slug: string; amount: number }[] {
  return Object.entries(donors)
    .filter(
      ([slug, amount]) =>
        amount > 0 && career.characters[slug]?.sponsor?.sponsorId === party,
    )
    .map(([slug, amount]) => ({ slug, amount }))
    .sort((a, b) => b.amount - a.amount);
}

// The poll as the chamber prints it, one entry per list: the share the vote
// would give it today, drawn against the seats it holds, under it the
// party's rating with the reasons it moved written out in words with signed
// numbers, and the names behind its chest. Governing lists carry a green
// margin rule and the player's list a highlighter stroke
export default function ParliamentPopularity({
  career,
  characterBySlug,
}: {
  career: SavedCareer;
  characterBySlug: Map<string, DuelCharacter>;
}) {
  const parliament = career.parliament;
  if (!parliament) return null;
  const votes = countVotes(career);
  const ratings = partyRatings(career);
  const players = partyPlayerPoints(career);
  const governed = parliament.government.length > 0;
  const order = [...PARTY_SEAT_ORDER].sort((a, b) => votes[b] - votes[a]);
  const support = parliament.government.reduce((sum, id) => sum + votes[id], 0);
  const playerParty =
    career.characters[career.playerSlug]?.sponsor?.sponsorId ?? null;

  return (
    <PaperSheet className="flex w-full flex-col gap-2.5 px-3 pb-3 pt-2.5 text-left sm:px-4">
      <HintTooltip
        text={fmt(P.intro, {
          top: votePlaceTop(Object.keys(career.characters).length),
          divisor: VOTE_FAME_DIVISOR,
          weight: VOTE_PLACE_WEIGHT,
        })}
        className="block w-full border-y-[3px] border-double border-slate-200 py-1 text-center font-serif text-[13px] font-black uppercase tracking-[0.1em] text-slate-100 @md:tracking-[0.2em]"
      >
        {governed ? fmt(P.govSupport, { pct: support }) : P.title}
      </HintTooltip>
      <ul className="grid grid-cols-1 border-t border-slate-500 @3xl:grid-cols-2 @3xl:[&>li:nth-child(odd)]:border-r">
        {order.map((id) => {
          const rating = ratings[id];
          const seats = parliament.seats[id];
          const swing = governed ? votes[id] - seats : null;
          const factors = [
            {
              key: 'campaign',
              value: Math.round(rating.donations),
              label: P.factors.campaign,
            },
            { key: 'affairs', value: -rating.penalties, label: P.factors.affairs },
            {
              key: 'convictions',
              value: -rating.convictions,
              label: P.factors.convictions,
            },
            { key: 'glizi', value: rating.rating, label: P.factors.glizi },
            {
              key: 'constitution',
              value: -rating.constitution,
              label: P.factors.constitution,
            },
          ].filter((factor) => factor.value !== 0);
          const inGovernment = parliament.government.includes(id);
          const playerPoints = players[id].reduce(
            (sum, p) => sum + p.placePts + p.famePts,
            0,
          );
          const playersShare = partyPlayersShare(career, id);
          const current = donorsOf(career, parliament.donors, id);
          const donorList =
            current.length > 0
              ? { label: P.donors, list: current }
              : { label: P.lastDonors, list: donorsOf(career, parliament.lastDonors, id) };
          return (
            <li
              key={id}
              className={`flex flex-col gap-2 border-b border-slate-500 py-2.5 pr-1 @3xl:pr-3 ${
                inGovernment
                  ? 'pl-3 shadow-[inset_3px_0_0_#15803d]'
                  : 'pl-1 @3xl:pl-3'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0">
                  <SponsorEmblem sponsorId={id} className="h-5 w-5" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span
                    className={`font-serif text-sm font-black leading-tight text-slate-100 [overflow-wrap:anywhere] ${
                      id === playerParty
                        ? 'self-start bg-[linear-gradient(transparent_50%,rgb(253_224_71/0.75)_50%)] px-0.5'
                        : ''
                    }`}
                  >
                    {SPONSOR_NAMES[id]}
                  </span>
                  {governed && (
                    <span className="font-sign text-[13px] font-semibold tabular-nums text-slate-400">
                      {plural(P.seatsNow, seats, { seats })}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-end">
                  <HintTooltip
                    text={`${SPONSOR_NAMES[id]} ${votes[id]}%`}
                    content={
                      <span className="flex flex-col gap-0.5 text-left">
                        <TipRow
                          label={plural(P.tip.playersShare, playerPoints, { points: signed(playerPoints) })}
                          value={signedPct(playersShare)}
                          tone={shareInk(playersShare)}
                        />
                        <TipRow
                          label={plural(P.tip.partyShare, Math.round(rating.current), { points: Math.round(rating.current) })}
                          value={signedPct(votes[id] - playersShare)}
                          tone={shareInk(votes[id] - playersShare)}
                        />
                      </span>
                    }
                    className="font-sign text-[30px] font-bold leading-none tabular-nums text-slate-100 transition hover:text-red-300"
                  >
                    {votes[id]}%
                  </HintTooltip>
                  {swing !== null && (
                    <span
                      className={`mt-1 font-sign text-[13px] font-bold tabular-nums ${toneClass(swing)}`}
                    >
                      {swing > 0
                        ? `▲${swing}`
                        : swing < 0
                          ? `▼${-swing}`
                          : '±0'}{' '}
                      <span className="font-semibold text-slate-400">
                        {plural(P.seatsUnit, swing)}
                      </span>
                    </span>
                  )}
                </div>
              </div>
              <svg
                viewBox="0 0 100 8"
                preserveAspectRatio="none"
                className={`h-2.5 w-full overflow-visible rounded-[1px] bg-slate-800/60 ring-1 ring-inset ring-slate-500 ${PARTY_PAINT}`}
                aria-hidden="true"
              >
                <rect
                  x="0"
                  y="0"
                  width={votes[id]}
                  height="8"
                  className={SPONSOR_THEMES[id].bar}
                />
                {governed && (
                  <rect
                    x={seats - 0.4}
                    y="-2"
                    width="0.8"
                    height="12"
                    className="fill-[#1c1408]"
                  />
                )}
              </svg>
              {players[id].length > 0 && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px]">
                  <span className="font-sign text-[12px] font-bold uppercase tracking-[0.08em] text-slate-400">
                    {P.players}
                  </span>
                  {players[id].map((p) => {
                    const character = characterBySlug.get(p.slug);
                    return (
                      <HintTooltip
                        key={p.slug}
                        text={`${character?.name ?? p.slug}: ${signedPct(p.sharePts)}`}
                        content={<PlayerTip name={character?.name ?? p.slug} p={p} />}
                        className="inline-flex items-center gap-1 rounded-[2px] border border-slate-600 py-px pl-px pr-1.5 transition hover:border-slate-300"
                      >
                        {character && (
                          <PortraitHead character={character} className="h-4 w-4" />
                        )}
                        <span className={`font-sign text-[13px] font-bold tabular-nums ${shareInk(p.sharePts)}`}>
                          {signedPct(p.sharePts)}
                        </span>
                      </HintTooltip>
                    );
                  })}
                </div>
              )}
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 border-t border-dotted border-slate-500 pt-2 text-[11px]">
                <span className="font-sign text-[12px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  {P.party}
                </span>
                <HintTooltip
                  text={P.ratingHint}
                  className="font-serif text-[12px] font-bold text-slate-100 transition hover:text-red-300"
                >
                  {fmt(P.rating, { value: Math.round(rating.current) })}
                </HintTooltip>
                <span className="font-serif text-[11px] text-slate-400">
                  {fmt(P.ratingBase, { base: rating.base })}
                </span>
                {factors.length === 0 ? (
                  <span className="font-serif text-[11px] text-slate-400">
                    {P.noChange}
                  </span>
                ) : (
                  factors.map((factor) => (
                    <span
                      key={factor.key}
                      className="font-sign text-[13px] font-bold tabular-nums"
                    >
                      <span className={toneClass(factor.value)}>
                        {signed(factor.value)}
                      </span>{' '}
                      <span className="font-serif text-[11px] font-medium text-slate-300">
                        {factor.label}
                      </span>
                    </span>
                  ))
                )}
              </div>
              {donorList.list.length > 0 && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px]">
                  <span className="font-serif text-[11px] text-slate-400">{donorList.label}</span>
                  {donorList.list.map(({ slug, amount }) => {
                    const character = characterBySlug.get(slug);
                    return (
                      <HintTooltip
                        key={slug}
                        text={`${character?.name ?? slug}: ${amount}`}
                        content={<DonorTip name={character?.name ?? slug} amount={amount} />}
                        className="inline-flex items-center gap-1 rounded-[2px] border border-slate-600 py-px pl-px pr-1.5 transition hover:border-slate-300"
                      >
                        {character && (
                          <PortraitHead
                            character={character}
                            className="h-4 w-4"
                          />
                        )}
                        <span className="font-sign text-[13px] font-bold tabular-nums text-slate-100">
                          {amount}
                        </span>
                      </HintTooltip>
                    );
                  })}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </PaperSheet>
  );
}
