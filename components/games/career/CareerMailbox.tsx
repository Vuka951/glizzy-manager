import { useState } from 'react';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import {
  DONATION_SCALE,
  FAVOR_TIERS,
  OUTSIDER_DONATION_STEPS,
  PARTY_SEAT_ORDER,
} from '@/data/games/careerElections';
import { outsiderOfferChance } from '@/lib/utils/careerElections';
import type { MailItem, SponsorId } from '@/lib/utils/careerSave';
import { GAMES_UI } from '@/data/games/locale';
import { seasonName, sponsorName } from '@/lib/utils/localeNames';
import { fillMessage } from '@/lib/utils/messageText';
import { fmt, plural } from '@/lib/utils/format';
import { playLetterSound } from '@/lib/utils/gameSounds';

const MAIL = GAMES_UI.career.mail;
const SPONSORS = GAMES_UI.career.sponsors;
const SPONSOR_PITCHES = SPONSORS.pitches as Record<string, string>;
const SPONSOR_WILDCARD_PITCHES = SPONSORS.wildcardPitches as Record<
  string,
  string
>;

function mailStrings(item: MailItem): { subject: string; body: string } {
  if (item.templateKey === 'welcome') {
    return {
      subject: MAIL.welcome.subject,
      body: fillMessage(MAIL.welcome.body, item.params, item.refs),
    };
  }
  if (item.templateKey === 'overlord') {
    return {
      subject: MAIL.overlord.subject,
      body: fillMessage(MAIL.overlord.body, item.params, item.refs),
    };
  }
  if (item.kind === 'stipend') {
    return {
      subject: MAIL.stipend.subject,
      body: fillMessage(MAIL.stipend.body, item.params, item.refs),
    };
  }
  if (item.templateKey === 'stipend-cut') {
    return { subject: MAIL.stipendCut.subject, body: MAIL.stipendCut.body };
  }
  if (item.templateKey === 'investments-unlocked') {
    return {
      subject: MAIL.investmentsUnlocked.subject,
      body: MAIL.investmentsUnlocked.body,
    };
  }
  if (item.templateKey === 'underworld-unlocked') {
    return {
      subject: MAIL.underworldUnlocked.subject,
      body: MAIL.underworldUnlocked.body,
    };
  }
  if (item.templateKey === 'season-prices') {
    return {
      subject: fmt(MAIL.seasonPrices.subject, {
        season: seasonName(item.season),
      }),
      body: fillMessage(
        (item.params.against
          ? MAIL.seasonPrices.reversedBodies
          : MAIL.seasonPrices.bodies)[item.season] ?? '',
        item.params,
        item.refs,
      ),
    };
  }
  if (item.templateKey === 'betting-unlocked') {
    return {
      subject: MAIL.bettingUnlocked.subject,
      body: MAIL.bettingUnlocked.body,
    };
  }
  if (item.templateKey === 'tape-unlocked') {
    return {
      subject: MAIL.tapeUnlocked.subject,
      body: MAIL.tapeUnlocked.body,
    };
  }
  if (item.templateKey === 'studio-unlocked') {
    return {
      subject: MAIL.studioUnlocked.subject,
      body: MAIL.studioUnlocked.body,
    };
  }
  if (item.kind === 'campaign') {
    return { subject: MAIL.campaign.subject, body: MAIL.campaign.body };
  }
  if (item.templateKey === 'campaign-declined' && item.sponsorId) {
    return {
      subject: fmt(MAIL.campaignDeclined.subject, {
        sponsor: sponsorName(item.sponsorId),
      }),
      body: MAIL.campaignDeclined.body,
    };
  }
  if (item.kind === 'donation' && item.sponsorId) {
    return {
      subject: fmt(MAIL.donation.subject, {
        sponsor: sponsorName(item.sponsorId),
      }),
      body:
        (MAIL.donation.bodies as Record<string, string>)[item.sponsorId] ?? '',
    };
  }
  if (item.kind === 'election') {
    return {
      subject: MAIL.election.subject,
      body:
        (MAIL.election.bodies as Record<string, string>)[
          String(item.params.status)
        ] ?? '',
    };
  }
  if (item.kind === 'favor' && item.sponsorId) {
    const counts =
      (MAIL.favor.counts as Record<string, string[]>)[item.sponsorId] ?? [];
    const count = Math.max(1, Number(item.params.count ?? 1));
    return {
      subject: fmt(MAIL.favor.subject, {
        sponsor: sponsorName(item.sponsorId),
      }),
      body: fmt(
        (MAIL.favor.bodies as Record<string, string>)[item.sponsorId] ?? '',
        { favors: counts[Math.min(count, counts.length) - 1] ?? '' },
      ),
    };
  }
  if (item.kind === 'tax') {
    return { subject: MAIL.tax.subject, body: fillMessage(MAIL.tax.body, item.params, item.refs) };
  }
  if (item.kind === 'tax-refund') {
    return {
      subject: MAIL.taxRefund.subject,
      body: fillMessage(MAIL.taxRefund.body, item.params, item.refs),
    };
  }
  if (item.kind === 'rival' && item.templateKey === 'derby-win') {
    return {
      subject: MAIL.derbyWin.subject,
      body: fillMessage(MAIL.derbyWin.body, item.params, item.refs),
    };
  }
  if (item.kind === 'rival') {
    return {
      subject: MAIL.rivalTaunt.subject,
      body: fillMessage(MAIL.rivalTaunt.body, item.params, item.refs),
    };
  }
  if (item.kind === 'sponsor-offer' && item.sponsorId) {
    const sponsor = sponsorName(item.sponsorId);
    // The fluke offer letter admits the call has nothing to do with results
    if (item.templateKey === 'sponsor-offer-wildcard') {
      return {
        subject: fmt(SPONSORS.offerWildcardSubject, { sponsor }),
        body: SPONSOR_WILDCARD_PITCHES[item.sponsorId] ?? '',
      };
    }
    return {
      subject: fmt(SPONSORS.offerSubject, { sponsor }),
      body: SPONSOR_PITCHES[item.sponsorId] ?? '',
    };
  }
  return { subject: item.templateKey, body: '' };
}

function Envelope({ opening }: { opening: boolean }) {
  return (
    <span className="relative block h-14 w-20 shrink-0 [perspective:220px]">
      <span
        className={`absolute inset-x-2 bottom-1 z-10 h-8 rounded-sm border border-slate-300 bg-white transition-transform duration-500 ease-out delay-[300ms] ${
          opening ? '-translate-y-5 rotate-2' : ''
        }`}
      >
        <span className="mx-1.5 mt-1.5 block h-0.5 bg-slate-300" />
        <span className="mx-1.5 mt-1 block h-0.5 bg-slate-300" />
        <span className="mx-1.5 mt-1 block h-0.5 w-2/3 bg-slate-300" />
      </span>
      <span className="absolute inset-x-0 bottom-0 z-20 h-10 rounded-md border border-amber-300/70 bg-amber-100" />
      <span
        className={`absolute inset-x-0 top-4 h-6 origin-top transition-transform duration-[400ms] ease-out ${
          opening ? 'z-0 [transform:rotateX(-172deg)]' : 'z-30'
        }`}
      >
        <svg
          viewBox="0 0 80 26"
          className="block h-6 w-full"
          aria-hidden="true"
        >
          <path
            d="M1 1 40 24 79 1z"
            className="fill-amber-200 stroke-amber-400"
            strokeWidth="1"
          />
        </svg>
      </span>
      <span
        className={`absolute top-8 left-1/2 z-40 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-red-700 transition-all duration-200 ease-in ${
          opening ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
      />
    </span>
  );
}

// Letters arrive sealed; opening one plays the envelope animation and lays
// the contents out on paper
export default function CareerMailbox({
  mail,
  canAcceptSponsor,
  canDonate,
  balance,
  onMarkRead,
  onMarkAllRead,
  onAcceptSponsor,
  onDonate,
}: {
  mail: MailItem[];
  canAcceptSponsor: boolean;
  canDonate: (item: MailItem) => boolean;
  balance: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onAcceptSponsor: (id: string, sponsorId: SponsorId) => void;
  onDonate: (id: string, amount: number, sponsorId?: SponsorId) => void;
}) {
  const [openState, setOpenState] = useState<
    Record<string, 'opening' | 'open'>
  >({});
  // Which chest the outsider's envelope goes to, per campaign letter
  const [campaignParty, setCampaignParty] = useState<
    Record<string, SponsorId>
  >({});
  const unread = mail.filter((m) => !m.read);

  const openLetter = (id: string) => {
    if (openState[id]) return;
    playLetterSound();
    setOpenState((s) => ({ ...s, [id]: 'opening' }));
    setTimeout(() => setOpenState((s) => ({ ...s, [id]: 'open' })), 720);
  };

  return (
    <div className="flex w-full flex-col gap-2.5">
      {unread.length === 0 && (
        <p className="text-center text-[11px] text-slate-500">{MAIL.empty}</p>
      )}
      {unread.length > 1 && (
        <button
          onClick={onMarkAllRead}
          className="self-end rounded-sm bg-slate-800 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-50 transition hover:bg-slate-700"
        >
          {MAIL.clearAll}
        </button>
      )}
      {unread.map((item) => {
        const { subject, body } = mailStrings(item);
        const isOffer = item.kind === 'sponsor-offer' && item.sponsorId;
        const isDonation = item.kind === 'donation' && item.sponsorId;
        const isCampaign = item.kind === 'campaign';
        const donationOpen = (isDonation || isCampaign) && canDonate(item);
        const pickedParty = campaignParty[item.id] ?? null;
        const showsEmblem =
          isOffer ||
          isDonation ||
          item.kind === 'favor' ||
          item.templateKey === 'campaign-declined';
        const state = openState[item.id];
        if (state !== 'open') {
          return (
            <button
              key={item.id}
              onClick={() => openLetter(item.id)}
              title={GAMES_UI.career.actions.openLetter}
              className="flex items-center gap-3 rounded-xl border border-amber-400/20 bg-slate-800/40 p-2.5 text-left transition hover:border-amber-400/50 hover:bg-slate-800/70"
            >
              <Envelope opening={state === 'opening'} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-amber-200">
                  {showsEmblem && item.sponsorId && (
                    <SponsorEmblem
                      sponsorId={item.sponsorId as SponsorId}
                      className="h-3.5 w-3.5"
                    />
                  )}
                  <span className="truncate">{subject}</span>
                </span>
                <span className="mt-0.5 block text-[10px] text-slate-500">
                  {GAMES_UI.career.actions.openLetter}
                </span>
              </span>
            </button>
          );
        }
        return (
          <div
            key={item.id}
            className="rotate-[-0.5deg] rounded-sm bg-amber-50 p-3.5 text-left text-slate-800 shadow-lg animate-[bubblein_0.35s_ease-out]"
          >
            <p className="flex items-center gap-1.5 border-b border-slate-900/15 pb-1.5 text-[11px] font-black uppercase tracking-wider">
              {showsEmblem && item.sponsorId && (
                <SponsorEmblem
                  sponsorId={item.sponsorId as SponsorId}
                  className="h-4 w-4"
                />
              )}
              {subject}
            </p>
            <p className="mt-2 text-[11px] italic leading-relaxed text-slate-600">
              {body}
            </p>
            {isDonation && donationOpen && (
              <p className="mt-2 text-[10px] font-semibold leading-relaxed text-slate-700">
                {fmt(MAIL.donation.favorTerms, {
                  min: FAVOR_TIERS[0],
                  top: FAVOR_TIERS[FAVOR_TIERS.length - 1],
                })}
              </p>
            )}
            {isCampaign && donationOpen && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {PARTY_SEAT_ORDER.map((id) => (
                  <button
                    key={id}
                    onClick={() =>
                      setCampaignParty((s) => ({ ...s, [item.id]: id }))
                    }
                    className={`flex items-center gap-1.5 rounded-sm border px-2 py-1 text-[9px] font-black uppercase tracking-widest transition ${
                      pickedParty === id
                        ? 'border-emerald-700 bg-emerald-700 text-emerald-50'
                        : 'border-slate-900/20 bg-transparent text-slate-700 hover:border-slate-900/50'
                    }`}
                  >
                    <SponsorEmblem sponsorId={id} className="h-3.5 w-3.5" />
                    {sponsorName(id)}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-2.5 flex flex-wrap justify-end gap-2">
              {isCampaign &&
                donationOpen &&
                OUTSIDER_DONATION_STEPS.map((amount) => (
                  <button
                    key={amount}
                    disabled={amount > balance || !pickedParty}
                    onClick={() =>
                      pickedParty && onDonate(item.id, amount, pickedParty)
                    }
                    className="rounded-sm bg-emerald-700 px-2.5 py-1 font-mono text-[10px] font-black text-emerald-50 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-emerald-700"
                  >
                    {fmt(MAIL.campaign.give, {
                      amount,
                      pct: Math.round(outsiderOfferChance(amount) * 100),
                    })}
                  </button>
                ))}
              {isDonation &&
                donationOpen &&
                DONATION_SCALE.map((amount) => (
                  <button
                    key={amount}
                    disabled={amount > balance}
                    onClick={() => onDonate(item.id, amount)}
                    className="rounded-sm bg-emerald-700 px-2.5 py-1 font-mono text-[10px] font-black text-emerald-50 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-emerald-700"
                  >
                    {fmt(MAIL.donation.give, { amount })}
                  </button>
                ))}
              {isOffer && canAcceptSponsor && (
                <button
                  onClick={() =>
                    onAcceptSponsor(item.id, item.sponsorId as SponsorId)
                  }
                  className="rounded-sm bg-emerald-700 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-50 transition hover:bg-emerald-600"
                >
                  {SPONSORS.accept}
                </button>
              )}
              <button
                onClick={() => onMarkRead(item.id)}
                className={`rounded-sm px-3 py-1 text-[10px] font-black uppercase tracking-widest transition ${
                  !isOffer && item.amount
                    ? 'bg-emerald-700 text-emerald-50 hover:bg-emerald-600'
                    : 'bg-slate-800 text-amber-50 hover:bg-slate-700'
                }`}
              >
                {isOffer
                  ? SPONSORS.decline
                  : isDonation && donationOpen
                    ? MAIL.donation.later
                    : item.amount
                      ? plural(MAIL.take, item.amount, { amount: item.amount })
                      : MAIL.markRead}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
