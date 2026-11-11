import { useState } from 'react';
import CareerButton from '@/components/games/career/CareerButton';
import LawLetterAttachment from '@/components/games/career/LawLetterAttachment';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import TownPostCounter from '@/components/games/career/town/TownPostCounter';
import TownPostEnvelope from '@/components/games/career/town/TownPostEnvelope';
import TownPostLetter from '@/components/games/career/town/TownPostLetter';
import {
  DONATION_SCALE,
  FAVOR_TIERS,
  OUTSIDER_DONATION_STEPS,
  PARTY_SEAT_ORDER,
} from '@/data/games/careerElections';
import { outsiderOfferChance } from '@/lib/utils/careerElections';
import { CONSTITUTION_FAIL_RATING_PENALTY } from '@/data/games/careerLaws';
import { isLawId, lawName } from '@/lib/utils/careerLaws';
import {
  glizzyBetMultiplier,
  isGlizzyCall,
} from '@/lib/utils/careerGlizzflationBets';
import { byMailImportance, mailSender } from '@/lib/utils/careerMail';
import { isSponsorId } from '@/lib/utils/careerSponsors';
import type { MailItem, SponsorId } from '@/lib/utils/careerSave';
import { GAMES_UI } from '@/data/games/locale';
import {
  characterName,
  seasonName,
  sponsorName,
} from '@/lib/utils/localeNames';
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
  if (item.templateKey === 'glizzy-market-unlocked') {
    return {
      subject: MAIL.glizzyMarketUnlocked.subject,
      body: MAIL.glizzyMarketUnlocked.body,
    };
  }
  if (item.templateKey === 'glizzy-bet') {
    const callId = isGlizzyCall(item.params.call) ? item.params.call : 'flat';
    const actualPct = Number(item.params.actualPct);
    const payout = Number(item.params.payout);
    const stake = Number(item.params.stake);
    const call =
      callId === 'up'
        ? MAIL.glizzyBet.callUp
        : callId === 'down'
          ? MAIL.glizzyBet.callDown
          : MAIL.glizzyBet.callFlat;
    const actual =
      actualPct === 0
        ? MAIL.glizzyBet.actualFlat
        : fmt(
            actualPct > 0 ? MAIL.glizzyBet.actualUp : MAIL.glizzyBet.actualDown,
            { pct: Math.abs(actualPct) },
          );
    return payout > 0
      ? {
          subject: MAIL.glizzyBet.subjectWon,
          body: fmt(MAIL.glizzyBet.bodyWon, {
            call,
            actual,
            stake,
            payout,
            multiplier:
              stake > 0
                ? Math.round((payout / stake) * 10) / 10
                : glizzyBetMultiplier(callId, actualPct),
          }),
        }
      : {
          subject: MAIL.glizzyBet.subjectLost,
          body: fmt(MAIL.glizzyBet.bodyLost, { call, actual, stake }),
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
  if (item.templateKey === 'law-bill') {
    return { subject: MAIL.law.billSubject, body: MAIL.law.billBody };
  }
  if (item.kind === 'law' && item.params.action === 'constitution') {
    const key = `constitution-${item.params.outcome}`;
    const params = {
      party: item.sponsorId ? sponsorName(item.sponsorId) : '',
      yes: item.params.yes ?? 0,
      no: item.params.no ?? 0,
      penalty: CONSTITUTION_FAIL_RATING_PENALTY,
    };
    return {
      subject: (MAIL.law.subjects as Record<string, string>)[key] ?? '',
      body: fmt((MAIL.law.bodies as Record<string, string>)[key] ?? '', params),
    };
  }
  if (item.kind === 'law' && isLawId(item.params.law)) {
    const law = item.params.law;
    const key = `${item.params.action}-${item.params.outcome}`;
    const params = {
      law: lawName(law),
      party: sponsorName(String(item.params.party ?? '')),
      yes: item.params.yes ?? 0,
      no: item.params.no ?? 0,
    };
    return {
      subject: fmt(
        (MAIL.law.subjects as Record<string, string>)[key] ?? '',
        params,
      ),
      body: fmt((MAIL.law.bodies as Record<string, string>)[key] ?? '', params),
    };
  }
  if (item.kind === 'election') {
    const body =
      (MAIL.election.bodies as Record<string, string>)[
        String(item.params.status)
      ] ?? '';
    const premier = item.params.premierYou
      ? MAIL.election.premierYou
      : item.params.premier
        ? fmt(MAIL.election.premier, {
            name: characterName(String(item.params.premier)),
          })
        : '';
    return {
      subject: MAIL.election.subject,
      body: premier ? `${body} ${premier}` : body,
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
  if (item.templateKey === 'yellow-interest') {
    return {
      subject: MAIL.yellowInterest.subject,
      body: fillMessage(MAIL.yellowInterest.body, item.params, item.refs),
    };
  }
  if (item.templateKey === 'yellow-warning') {
    return { subject: MAIL.yellowWarning.subject, body: MAIL.yellowWarning.body };
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

const GREEN_KEY =
  'min-h-11 rounded-[4px] bg-[#166534] px-3.5 font-sign text-[15px] font-bold uppercase tracking-[0.06em] tabular-nums text-[#f0fdf4] shadow-[0_2px_0_#052e16] transition enabled:hover:bg-[#15803d] enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-35';
const INK_KEY =
  'min-h-11 rounded-[4px] bg-[#1c1917] px-3.5 font-sign text-[15px] font-bold uppercase tracking-[0.06em] text-[#fbf6e6] shadow-[0_2px_0_#000000] transition hover:bg-[#44403c] active:translate-y-px';

// Letters arrive sealed on the post office counter; opening one plays the
// envelope animation and lays the contents out on paper
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
  const unread = byMailImportance(mail.filter((m) => !m.read));

  const openLetter = (id: string) => {
    if (openState[id]) return;
    playLetterSound();
    setOpenState((s) => ({ ...s, [id]: 'opening' }));
    setTimeout(() => setOpenState((s) => ({ ...s, [id]: 'open' })), 720);
  };

  return (
    <TownPostCounter
      waiting={unread.length > 0}
      toolbar={
        unread.length > 1 && (
          <CareerButton tone="quiet" className="min-h-11" onClick={onMarkAllRead}>
            {MAIL.clearAll}
          </CareerButton>
        )
      }
    >
      {unread.length === 0 && (
        <p className="mx-auto w-fit -rotate-1 rounded-[1px] bg-[#f1e8d3] px-4 py-2.5 text-center font-serif text-[13px] text-[#3a2f1e] shadow-[0_3px_0_rgb(0_0_0/0.35)]">
          {MAIL.empty}
        </p>
      )}
      {unread.map((item) => {
        const { subject, body } = mailStrings(item);
        const sender = mailSender(item);
        const isOffer = item.kind === 'sponsor-offer' && item.sponsorId;
        const isDonation = item.kind === 'donation' && item.sponsorId;
        const isCampaign = item.kind === 'campaign';
        const donationOpen = (isDonation || isCampaign) && canDonate(item);
        const pickedParty = campaignParty[item.id] ?? null;
        const showsEmblem =
          isOffer ||
          isDonation ||
          item.kind === 'favor' ||
          item.templateKey === 'campaign-declined' ||
          item.templateKey.startsWith('yellow-');
        const isLaw = item.kind === 'law';
        const lawParty = String(item.params.party ?? '');
        const emblem: SponsorId | null =
          showsEmblem && item.sponsorId
            ? (item.sponsorId as SponsorId)
            : item.kind === 'tax' || item.kind === 'tax-refund'
              ? 'yellow'
              : isLaw && isLawId(item.params.law) && isSponsorId(lawParty)
                ? lawParty
                : isLaw &&
                    item.params.action === 'constitution' &&
                    item.sponsorId
                  ? (item.sponsorId as SponsorId)
                  : null;
        const seal = emblem ? (
          <SponsorEmblem sponsorId={emblem} className="h-[78%] w-[78%]" />
        ) : null;
        const state = openState[item.id];
        if (state !== 'open') {
          return (
            <TownPostEnvelope
              key={item.id}
              subject={subject}
              sender={sender}
              seal={seal}
              season={item.season}
              year={item.year}
              label={GAMES_UI.career.actions.openLetter}
              opening={state === 'opening'}
              onOpen={() => openLetter(item.id)}
            />
          );
        }
        return (
          <TownPostLetter
            key={item.id}
            subject={subject}
            sender={sender}
            seal={seal}
            season={item.season}
            year={item.year}
            actions={
              <>
                {isCampaign &&
                  donationOpen &&
                  OUTSIDER_DONATION_STEPS.map((amount) => (
                    <button
                      key={amount}
                      disabled={amount > balance || !pickedParty}
                      onClick={() =>
                        pickedParty && onDonate(item.id, amount, pickedParty)
                      }
                      className={GREEN_KEY}
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
                      className={GREEN_KEY}
                    >
                      {fmt(MAIL.donation.give, { amount })}
                    </button>
                  ))}
                {isOffer && canAcceptSponsor && (
                  <button
                    onClick={() =>
                      onAcceptSponsor(item.id, item.sponsorId as SponsorId)
                    }
                    className={GREEN_KEY}
                  >
                    {SPONSORS.accept}
                  </button>
                )}
                <button
                  onClick={() => onMarkRead(item.id)}
                  className={!isOffer && item.amount ? GREEN_KEY : INK_KEY}
                >
                  {isOffer
                    ? SPONSORS.decline
                    : isDonation && donationOpen
                      ? MAIL.donation.later
                      : item.amount
                        ? plural(MAIL.take, item.amount, { amount: item.amount })
                        : MAIL.markRead}
                </button>
              </>
            }
          >
            <p className="mt-2.5 font-serif text-[13px] leading-relaxed text-[#292524]">
              {body}
            </p>
            {isLaw && <LawLetterAttachment item={item} />}
            {isDonation && donationOpen && (
              <p className="mt-2 text-[11px] font-semibold leading-relaxed text-[#44403c]">
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
                    className={`flex min-h-11 items-center gap-1.5 rounded-[4px] border-2 px-2.5 font-sign text-[14px] font-bold uppercase tracking-[0.05em] transition ${
                      pickedParty === id
                        ? 'border-[#166534] bg-[#166534] text-[#f0fdf4]'
                        : 'border-[#1c1917]/25 text-[#44403c] hover:border-[#1c1917]/60'
                    }`}
                  >
                    <SponsorEmblem sponsorId={id} className="h-4 w-4" />
                    {sponsorName(id)}
                  </button>
                ))}
              </div>
            )}
          </TownPostLetter>
        );
      })}
    </TownPostCounter>
  );
}
