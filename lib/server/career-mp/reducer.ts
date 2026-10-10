import {
  OUTSIDER_DONATION_STEPS,
  PARTY_SEAT_ORDER,
} from '@/data/games/careerElections';
import {
  COACH_COLOR_ORDER,
  COACH_NAME_MAX,
  COACH_NAME_MIN,
  MAX_COACHES,
  MIN_COACHES,
  type CoachColor,
} from '@/lib/constants/careerMp';
import {
  APPETITE_REGROWTH,
  MEDIA_AMBITION_GAIN,
  MEDIA_EGO_GAIN,
  MEDIA_SCANDAL_EGO_GAIN,
  MEDIA_SCANDAL_FAME_SCALE,
  MEDIA_SCANDAL_STRESS,
  MEDIA_STRESS,
  OFFSEASON_SLOTS,
  PLOTTING_EGO_GAIN,
  SCANDAL_BACKFIRE_CHANCE,
  SPONSOR_FAME_BONUS,
  type MediaAppearanceKind,
} from '@/data/games/careerEconomy';
import type { InvestmentId } from '@/data/games/careerInvestments';
import {
  fameStressTaxScale,
  mediaUsesFor,
  TRAINING_DEFS,
  trainingCost,
  type TrainingId,
} from '@/data/games/careerTraining';
import { ActionError } from '@/lib/server/career-mp/errors';
import { withLedger } from '@/lib/server/career-mp/ledger';
import { careerFor, mergeBack } from '@/lib/server/career-mp/lens';
import { ROSTER_SLUGS } from '@/lib/server/career-mp/roster';
import {
  bookFavor,
  passBet,
  placeBet,
  removeBet,
  setBetStake,
  voteReopen,
  voteSkipClip,
  voteSkipCup,
  voteSkipRound,
  withdraw,
} from '@/lib/server/career-mp/cup';
import { attachQuotes, cueQuotes } from '@/lib/server/career-mp/quotes';
import { startGame } from '@/lib/server/career-mp/resolve';
import { logEvent, normalizeSettings } from '@/lib/server/career-mp/roomOps';
import type { Room } from '@/lib/server/career-mp/room';
import type {
  LedgerCategory,
  Receipt,
  RoomAction,
} from '@/lib/types/careerMp';
import {
  campaignLetterOpen,
  ostrvoWeekendEveryWindow,
  partyStatusOf,
  recordDonation,
  sabotageTaxScale,
  strankaLeadMedia,
  strankaLeadTrainingScale,
  strankaMediaMultiplier,
  outsiderOfferChance,
  recordOutsiderDonation,
} from '@/lib/utils/careerElections';
import {
  buyInvestment,
  investmentLevel,
  investmentNews,
  nextInvestmentCost,
} from '@/lib/utils/careerInvestments';
import { rivalTauntLetter, stipendCutLetter, investmentsLetter,
  sponsorOfferLetter,
  campaignDeclinedLetter,
} from '@/lib/utils/careerMail';
import {
  applyFast,
  applyGuardHire,
  applyRest,
  applyTraining,
  clampMeter,
  mediaPay,
  rollMediaFame,
  STAT_KEY_BY_TRAINING,
} from '@/lib/utils/careerMeters';
import { rivalChosenNews } from '@/lib/utils/careerRivals';
import {
  guardChance,
  guardCost,
  guardPriceScale,
  playerPlotsBooked,
  sabotageChance,
  sabotageRepeatScale,
  sabotageTotalCost,
} from '@/lib/utils/careerSabotage';
import type {
  CharacterCareerState,
  SabotageTier,
  SavedCareer,
  SponsorId,
} from '@/lib/utils/careerSave';
import { seasonPriceScale } from '@/lib/utils/careerSeasonPrices';
import { newContract, ostrvoSabotageScale } from '@/lib/utils/careerSponsors';
import { message } from '@/lib/utils/message';

const MEDIA_FREEZEFRAMES: Record<string, string> = {
  'media-interview': 'interview',
  'media-scandal': 'scandal-flash',
};

export type Applied = {
  room: Room;
  receipt?: Receipt;
};

type LedgerMove = { category: LedgerCategory; amount: number };

type WindowResult = {
  career: SavedCareer;
  receipt?: Receipt;
  // Money moved by the action, for the coach's ledger
  ledger?: LedgerMove | LedgerMove[];
};

// The same maths the single-player component runs on a click, over the
// coach's own lens of the league. Every refusal is an error so the client
// never desyncs by assuming a click landed

function train(career: SavedCareer, id: TrainingId): WindowResult {
  if (career.slotsUsed >= OFFSEASON_SLOTS) throw new ActionError('no-slot');
  const def = TRAINING_DEFS[id];
  if (!def) throw new ActionError('bad-training');
  const ch = career.characters[career.playerSlug];
  const statKey = STAT_KEY_BY_TRAINING[id];
  const cost = trainingCost(
    def,
    statKey ? ch[statKey].level : 0,
    seasonPriceScale(career, 'training') *
      strankaLeadTrainingScale(ch, career.parliament, id),
  );
  if (career.balance < cost) throw new ActionError('no-funds');
  if (def.leveled && statKey && ch[statKey].level >= def.maxLevel)
    throw new ActionError('maxed');
  const { next, outcome } = applyTraining(ch, def);
  const titleKey =
    outcome === 'level-up'
      ? 'levelUp'
      : outcome === 'regression'
        ? 'regression'
        : 'progress';
  return {
    career: {
      ...career,
      balance: career.balance - cost,
      characters: { ...career.characters, [career.playerSlug]: next },
      slotsUsed: career.slotsUsed + 1,
      slotLog: [
        ...career.slotLog,
        { kind: 'training', trainingId: id, outcome },
      ],
    },
    receipt: {
      title: message(
        `career.toast.${titleKey}`,
        { training: id },
        { training: 'training' },
      ),
      before: ch,
      after: next,
      moneyDelta: -cost,
      icon: 'training',
      ok: outcome !== 'regression',
      scene: `training-${id}`,
      outcome:
        outcome === 'level-up'
          ? 'level-up'
          : outcome === 'regression'
            ? 'bad'
            : 'good',
    },
    ledger: { category: 'training', amount: -cost },
  };
}

function rest(career: SavedCareer, fasting: boolean): WindowResult {
  if (career.slotsUsed >= OFFSEASON_SLOTS) throw new ActionError('no-slot');
  const before = career.characters[career.playerSlug];
  const after = fasting
    ? applyFast(before)
    : applyRest(before, career.playerSlug);
  return {
    career: {
      ...career,
      characters: { ...career.characters, [career.playerSlug]: after },
      slotsUsed: career.slotsUsed + 1,
      slotLog: [...career.slotLog, { kind: fasting ? 'fast' : 'rest' }],
    },
    receipt: {
      title: message(fasting ? 'career.toast.fast' : 'career.toast.rest'),
      before,
      after,
      moneyDelta: 0,
      icon: 'rest',
      ok: true,
      scene: fasting ? 'fast' : 'rest',
    },
  };
}

function media(career: SavedCareer, kind: MediaAppearanceKind): WindowResult {
  if (career.slotsUsed >= OFFSEASON_SLOTS) throw new ActionError('no-slot');
  const ch = career.characters[career.playerSlug];
  const stateMedia = ch.sponsor?.sponsorId === 'stranka';
  const fanLevel = ch.fanSkill.level;
  const leadMedia = strankaLeadMedia(ch, career.parliament);
  if (
    !stateMedia &&
    (career.mediaUses ?? 0) >=
      Math.max(0, mediaUsesFor(fanLevel) + leadMedia.usesDelta)
  )
    throw new ActionError('media-spent');
  const tax = fameStressTaxScale(fanLevel);
  const pay = Math.round(
    mediaPay(
      kind,
      fanLevel,
      stateMedia ? strankaMediaMultiplier(ch.partyStatus) : 1,
      seasonPriceScale(career, 'media'),
    ) * leadMedia.payScale,
  );
  const backfired =
    kind === 'scandal' && Math.random() < SCANDAL_BACKFIRE_CHANCE;
  const fameSwing = rollMediaFame(
    fanLevel,
    kind === 'scandal' ? MEDIA_SCANDAL_FAME_SCALE : 1,
  );
  const after: CharacterCareerState =
    kind === 'scandal'
      ? {
          ...ch,
          stress: clampMeter(
            ch.stress + MEDIA_SCANDAL_STRESS * tax * (backfired ? 2 : 1),
          ),
          appetite: clampMeter(ch.appetite + APPETITE_REGROWTH),
          fame: clampMeter(
            ch.fame +
              (backfired ? -1 : 1) * fameSwing * leadMedia.fameScale +
              leadMedia.fameDelta,
          ),
          ego: clampMeter(
            ch.ego + (backfired ? -1 : 1) * (MEDIA_SCANDAL_EGO_GAIN + fanLevel),
          ),
          ambition: clampMeter(ch.ambition + MEDIA_AMBITION_GAIN + fanLevel),
        }
      : {
          ...ch,
          stress: clampMeter(ch.stress + MEDIA_STRESS * tax),
          appetite: clampMeter(ch.appetite + APPETITE_REGROWTH),
          fame: clampMeter(
            ch.fame + fameSwing * leadMedia.fameScale + leadMedia.fameDelta,
          ),
          ego: clampMeter(ch.ego + MEDIA_EGO_GAIN + fanLevel),
          ambition: clampMeter(ch.ambition + MEDIA_AMBITION_GAIN + fanLevel),
        };
  const templateKey = kind === 'scandal' ? 'media-scandal' : 'media-interview';
  return {
    career: {
      ...career,
      mediaUses: stateMedia ? career.mediaUses : (career.mediaUses ?? 0) + 1,
      slotsUsed: career.slotsUsed + 1,
      slotLog: [...career.slotLog, { kind: 'media' }],
      balance: career.balance + pay,
      characters: { ...career.characters, [career.playerSlug]: after },
      newsQueue: [
        ...career.newsQueue,
        {
          kind: 'media',
          templateKey,
          params: {},
          slugs: [career.playerSlug],
          freezeframe: MEDIA_FREEZEFRAMES[templateKey],
        },
      ],
    },
    receipt: {
      title: message(
        kind === 'scandal'
          ? backfired
            ? 'career.toast.mediaScandalBackfire'
            : 'career.toast.mediaScandal'
          : 'career.toast.media',
      ),
      before: ch,
      after,
      moneyDelta: pay,
      icon: 'media',
      ok: !backfired,
      scene: kind === 'scandal' ? 'media-scandal' : 'media-interview',
    },
    ledger: { category: 'media', amount: pay },
  };
}

function island(career: SavedCareer): WindowResult {
  const ch = career.characters[career.playerSlug];
  const everyWindow = ostrvoWeekendEveryWindow(ch);
  if (
    ch.sponsor?.sponsorId !== 'ostrvo' ||
    (everyWindow
      ? career.islandYear === career.year &&
        career.islandSeason === career.season
      : career.islandYear === career.year)
  )
    throw new ActionError('no-island');
  const after: CharacterCareerState = {
    ...ch,
    stress: 0,
    appetite: 100,
    ambition: 100,
  };
  return {
    career: {
      ...career,
      islandYear: career.year,
      islandSeason: career.season,
      slotLog: [...career.slotLog, { kind: 'island' }],
      characters: { ...career.characters, [career.playerSlug]: after },
    },
    receipt: {
      title: message('career.toast.island'),
      before: ch,
      after,
      moneyDelta: 0,
      icon: 'island',
      ok: true,
      scene: 'island',
    },
  };
}

function guard(career: SavedCareer, steps: number): WindowResult {
  if (career.slotsUsed >= OFFSEASON_SLOTS) throw new ActionError('no-slot');
  if (career.guarded) throw new ActionError('guarded');
  if (career.standingsHistory.length === 0) throw new ActionError('locked');
  const cost = guardCost(steps, guardPriceScale(career, career.playerSlug));
  if (career.balance < cost) throw new ActionError('no-funds');
  const chance = guardChance(steps);
  const ch = career.characters[career.playerSlug];
  const after = applyGuardHire(ch);
  // Hired muscle is booked like a plot: it costs money, not the month
  return {
    career: {
      ...career,
      guarded: true,
      guardChance: chance,
      balance: career.balance - cost,
      characters: { ...career.characters, [career.playerSlug]: after },
    },
    receipt: {
      title: message('career.toast.guard', { pct: Math.round(chance * 100) }),
      before: ch,
      after,
      moneyDelta: -cost,
      icon: 'guard',
      ok: true,
      scene: 'guard',
    },
    ledger: { category: 'guard', amount: -cost },
  };
}

function invest(career: SavedCareer, id: InvestmentId): WindowResult {
  const ch = career.characters[career.playerSlug];
  if (!ch.sponsor) throw new ActionError('no-sponsor');
  const cost = nextInvestmentCost(ch, id, seasonPriceScale(career, 'investment'));
  if (cost === null) throw new ActionError('maxed');
  if (career.balance < cost) throw new ActionError('no-funds');
  const after = buyInvestment(ch, id);
  return {
    career: {
      ...career,
      balance: career.balance - cost,
      characters: { ...career.characters, [career.playerSlug]: after },
      newsQueue: [
        ...career.newsQueue,
        investmentNews(career.playerSlug, id, investmentLevel(after, id)),
      ],
    },
    receipt: {
      title: message(
        'career.toast.invest',
        { name: id },
        { name: 'investment' },
      ),
      before: ch,
      after,
      moneyDelta: -cost,
      icon: 'invest',
      ok: true,
      scene: `invest-${id}`,
    },
    ledger: { category: 'investments', amount: -cost },
  };
}

function sabotage(
  career: SavedCareer,
  targetSlug: string,
  tier: SabotageTier,
  boostSteps: number,
): WindowResult {
  if (career.slotsUsed >= OFFSEASON_SLOTS) throw new ActionError('no-slot');
  if (career.standingsHistory.length === 0) throw new ActionError('locked');
  if (!career.characters[targetSlug] || targetSlug === career.playerSlug)
    throw new ActionError('bad-target');
  if (![1, 2, 3].includes(tier)) throw new ActionError('bad-tier');
  const steps = Math.max(0, Math.floor(boostSteps));
  const ch = career.characters[career.playerSlug];
  const cost = sabotageTotalCost(
    tier,
    steps,
    seasonPriceScale(career, 'sabotage') *
      sabotageTaxScale(ch, career.parliament) *
      ostrvoSabotageScale(ch) *
      sabotageRepeatScale(playerPlotsBooked(career)),
  );
  if (career.balance < cost) throw new ActionError('no-funds');
  const after = { ...ch, ego: clampMeter(ch.ego + PLOTTING_EGO_GAIN) };
  return {
    career: {
      ...career,
      balance: career.balance - cost,
      characters: { ...career.characters, [career.playerSlug]: after },
      pendingSabotages: [
        ...career.pendingSabotages,
        {
          bySlug: career.playerSlug,
          targetSlug,
          tier,
          chance: sabotageChance(tier, steps),
          cost,
        },
      ],
    },
    receipt: {
      title: message('career.toast.sabotage'),
      before: ch,
      after,
      moneyDelta: -cost,
      icon: 'sabotage',
      ok: true,
      scene: `sabotage-${tier}`,
    },
    ledger: { category: 'plots', amount: -cost },
  };
}

function readMail(career: SavedCareer, id: string): WindowResult {
  const item = career.mail.find((m) => m.id === id);
  if (!item) throw new ActionError('no-mail');
  const declinedKorp =
    item.kind === 'sponsor-offer' &&
    item.sponsorId === 'korporacija' &&
    !item.read &&
    !career.characters[career.playerSlug].sponsor;
  const claimed = !item.read ? (item.amount ?? 0) : 0;
  return {
    career: {
      ...career,
      balance: career.balance + claimed,
      korpVendetta: career.korpVendetta || declinedKorp,
      mail: career.mail.map((m) => (m.id === id ? { ...m, read: true } : m)),
    },
    ledger:
      claimed > 0
        ? {
            category:
              item.kind === 'tax-refund'
                ? 'tax'
                : item.kind === 'rival'
                  ? 'prize'
                  : 'stipend',
            amount: claimed,
          }
        : undefined,
  };
}

function acceptSponsor(
  career: SavedCareer,
  mailId: string,
  sponsorId: SponsorId,
): WindowResult {
  const ch = career.characters[career.playerSlug];
  if (ch.sponsor) throw new ActionError('signed');
  const offer = career.mail.find(
    (m) => m.id === mailId && m.kind === 'sponsor-offer' && m.sponsorId === sponsorId,
  );
  if (!offer) throw new ActionError('no-offer');
  const spurnedKorp =
    sponsorId !== 'korporacija' &&
    career.mail.some(
      (m) =>
        m.kind === 'sponsor-offer' && m.sponsorId === 'korporacija' && !m.read,
    );
  const status = partyStatusOf(career.parliament?.government ?? [], sponsorId);
  return {
    career: {
      ...career,
      korpVendetta:
        sponsorId === 'korporacija' ? false : career.korpVendetta || spurnedKorp,
      characters: {
        ...career.characters,
        [career.playerSlug]: {
          ...ch,
          sponsor: newContract(sponsorId),
          fame: clampMeter(ch.fame + SPONSOR_FAME_BONUS),
          ...(status ? { partyStatus: status } : {}),
        },
      },
      mail: [
        ...career.mail.map((m) =>
          m.id === mailId || m.kind === 'sponsor-offer'
            ? { ...m, read: true }
            : m,
        ),
        stipendCutLetter(career.year, career.season),
        investmentsLetter(career.year, career.season),
      ],
      newsQueue: [
        ...career.newsQueue,
        {
          kind: 'signing',
          templateKey: 'signing',
          params: { sponsor: sponsorId },
          refs: { sponsor: 'sponsor' },
          slugs: [career.playerSlug],
          freezeframe: `signing-${sponsorId}`,
        },
      ],
    },
  };
}

function donate(
  career: SavedCareer,
  mailId: string,
  amount: number,
  sponsorId?: SponsorId,
): WindowResult {
  if (!career.parliament) throw new ActionError('no-parliament');
  if (!Number.isFinite(amount) || amount <= 0) throw new ActionError('bad-amount');
  if (career.balance < amount) throw new ActionError('no-funds');
  const item = career.mail.find((m) => m.id === mailId);
  if (
    !item ||
    item.read ||
    (item.kind !== 'campaign' && item.kind !== 'donation')
  )
    throw new ActionError('no-mail');
  if (!campaignLetterOpen(item, career))
    throw new ActionError('letter-expired');
  const ch = career.characters[career.playerSlug];
  if (item.kind === 'campaign') {
    if (ch.sponsor) throw new ActionError('has-sponsor');
    if (!sponsorId || !PARTY_SEAT_ORDER.includes(sponsorId))
      throw new ActionError('bad-party');
    if (!OUTSIDER_DONATION_STEPS.includes(amount))
      throw new ActionError('bad-amount');
    const offered = Math.random() < outsiderOfferChance(amount);
    return {
      career: {
        ...career,
        balance: career.balance - amount,
        parliament: recordOutsiderDonation(
          career.parliament,
          career.playerSlug,
          sponsorId,
          amount,
        ),
        mail: [
          ...career.mail.map((m) => (m.id === mailId ? { ...m, read: true } : m)),
          offered
            ? sponsorOfferLetter(career.year, career.season, sponsorId, false)
            : campaignDeclinedLetter(career.year, career.season, sponsorId),
        ],
      },
      ledger: { category: 'donations', amount: -amount },
    };
  }
  const party = ch.sponsor?.sponsorId;
  if (!party) throw new ActionError('no-sponsor');
  return {
    career: {
      ...career,
      balance: career.balance - amount,
      parliament: recordDonation(
        career.parliament,
        career.playerSlug,
        party,
        amount,
      ),
      mail: career.mail.map((m) => (m.id === mailId ? { ...m, read: true } : m)),
    },
    ledger: { category: 'donations', amount: -amount },
  };
}

function chooseRival(career: SavedCareer, slug: string): WindowResult {
  if (!career.rivalChoice?.some((c) => c.slug === slug))
    throw new ActionError('bad-rival');
  return {
    career: {
      ...career,
      rivalSlug: slug,
      rivalChoice: null,
      mail: [
        ...career.mail,
        rivalTauntLetter(career.year, career.season, slug),
      ],
      newsQueue: [
        ...career.newsQueue,
        rivalChosenNews(career.playerSlug, slug),
      ],
    },
  };
}

// Every unread letter gets its default answer: money taken, offers declined
function readAllMail(career: SavedCareer): WindowResult {
  return career.mail
    .filter((m) => !m.read)
    .reduce<{ career: SavedCareer; ledger: LedgerMove[] }>(
      (acc, item) => {
        const result = readMail(acc.career, item.id);
        return {
          career: result.career,
          ledger: result.ledger
            ? [...acc.ledger, ...[result.ledger].flat()]
            : acc.ledger,
        };
      },
      { career, ledger: [] },
    );
}

function windowAction(career: SavedCareer, action: RoomAction): WindowResult {
  switch (action.type) {
    case 'train':
      return train(career, action.trainingId);
    case 'rest':
      return rest(career, Boolean(action.fasting));
    case 'media':
      return media(career, action.kind === 'scandal' ? 'scandal' : 'interview');
    case 'island':
      return island(career);
    case 'guard':
      return guard(career, Math.round(Number(action.steps) || 0));
    case 'invest':
      return invest(career, action.investmentId);
    case 'sabotage':
      return sabotage(
        career,
        action.targetSlug,
        action.tier,
        Number(action.boostSteps) || 0,
      );
    case 'readMail':
      return readMail(career, action.mailId);
    case 'readAllMail':
      return readAllMail(career);
    case 'acceptSponsor':
      return acceptSponsor(career, action.mailId, action.sponsorId);
    case 'donate':
      return donate(
        career,
        action.mailId,
        Math.round(Number(action.amount)),
        action.sponsorId,
      );
    case 'chooseRival':
      return chooseRival(career, action.slug);
    default:
      throw new ActionError('bad-phase');
  }
}

function lobbyAction(room: Room, coachId: string, action: RoomAction, now: number): Room {
  const coach = room.coaches[coachId];
  const isHost = room.hostCoachId === coachId;
  switch (action.type) {
    case 'setSettings': {
      if (!isHost) throw new ActionError('not-host', 403);
      return {
        ...room,
        settings: normalizeSettings({ ...room.settings, ...action.settings }),
      };
    }
    case 'pickCharacter': {
      if (!ROSTER_SLUGS.includes(action.slug)) throw new ActionError('bad-slug');
      const taken = Object.values(room.coaches).some(
        (c) => c.id !== coachId && c.slug === action.slug,
      );
      if (taken) throw new ActionError('character-taken', 409);
      return {
        ...room,
        coaches: {
          ...room.coaches,
          [coachId]: { ...coach, slug: action.slug, ready: false },
        },
      };
    }
    case 'pickColor': {
      if (!COACH_COLOR_ORDER.includes(action.color as CoachColor))
        throw new ActionError('bad-color');
      const taken = Object.values(room.coaches).some(
        (c) => c.id !== coachId && c.color === action.color,
      );
      if (taken) throw new ActionError('color-taken', 409);
      return {
        ...room,
        coaches: {
          ...room.coaches,
          [coachId]: { ...coach, color: action.color },
        },
      };
    }
    case 'rename': {
      const name = cleanName(action.name);
      const taken = Object.values(room.coaches).some(
        (c) => c.id !== coachId && c.name.toLowerCase() === name.toLowerCase(),
      );
      if (taken) throw new ActionError('name-taken', 409);
      return {
        ...room,
        coaches: { ...room.coaches, [coachId]: { ...coach, name } },
      };
    }
    case 'ready':
      return {
        ...room,
        coaches: {
          ...room.coaches,
          [coachId]: { ...coach, ready: Boolean(action.ready) },
        },
      };
    case 'start': {
      if (!isHost) throw new ActionError('not-host', 403);
      const coaches = Object.values(room.coaches);
      if (coaches.length < MIN_COACHES || coaches.length > MAX_COACHES)
        throw new ActionError('bad-room');
      if (coaches.some((c) => !c.slug)) throw new ActionError('missing-slug');
      // Pressing start is the host's ready
      if (coaches.some((c) => c.id !== room.hostCoachId && !c.ready))
        throw new ActionError('not-ready');
      return startGame(room, now);
    }
    case 'leave': {
      const rest = { ...room.coaches };
      delete rest[coachId];
      const remaining = Object.keys(rest);
      // An emptied lobby is closed, so the room board drops it
      if (remaining.length === 0) {
        return { ...room, coaches: rest, status: 'closed' };
      }
      return {
        ...room,
        coaches: rest,
        hostCoachId: isHost ? remaining[0] : room.hostCoachId,
      };
    }
    default:
      throw new ActionError('bad-phase');
  }
}

export function cleanName(raw: unknown): string {
  const name = String(raw ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, COACH_NAME_MAX);
  if (name.length < COACH_NAME_MIN) throw new ActionError('bad-name');
  return name;
}

// Cup and end-phase actions live in the cup module; the window and the lobby
// are handled here
export function applyAction(
  room: Room,
  coachId: string,
  action: RoomAction,
  now: number,
): Applied {
  if (!room.coaches[coachId]) throw new ActionError('unauthorized', 401);
  if (action.type === 'closeRoom') {
    if (room.hostCoachId !== coachId) throw new ActionError('not-host', 403);
    return { room: logEvent({ ...room, status: 'closed' }, now, 'closed') };
  }
  if (room.status === 'closed') throw new ActionError('closed', 410);
  if (action.type === 'pickCharacter' && room.status !== 'lobby')
    throw new ActionError('league-started', 409);
  if (room.status === 'lobby') {
    return { room: lobbyAction(room, coachId, action, now) };
  }
  if (!room.league) throw new ActionError('bad-room');
  if (room.phase.kind === 'window') {
    if (action.type === 'setDone') {
      return { room: setDone(room, coachId, Boolean(action.done), now) };
    }
    const league = room.league;
    const career = careerFor(league, coachId, 'offseason');
    const result = windowAction(career, action);
    let nextLeague = mergeBack(league, coachId, result.career);
    const cs = nextLeague.coachStates[coachId];
    let nextCs = { ...cs, done: false };
    for (const move of [result.ledger ?? []].flat()) {
      nextCs = withLedger(
        nextCs,
        league.year,
        league.season,
        move.category,
        move.amount,
      );
    }
    if (action.type === 'sabotage') nextCs = { ...nextCs, plotsBooked: nextCs.plotsBooked + 1 };
    if (action.type === 'guard') nextCs = { ...nextCs, guardWindows: nextCs.guardWindows + 1 };
    if (action.type === 'acceptSponsor') {
      nextCs = {
        ...nextCs,
        sponsorHistory: [
          ...nextCs.sponsorHistory,
          { sponsorId: action.sponsorId, year: league.year },
        ],
      };
    }
    if (action.type === 'chooseRival') {
      nextCs = {
        ...nextCs,
        rivalHistory: [
          ...nextCs.rivalHistory,
          { slug: action.slug, year: league.year, wins: 0, losses: 0 },
        ],
      };
    }
    nextLeague = {
      ...nextLeague,
      coachStates: { ...nextLeague.coachStates, [coachId]: nextCs },
    };
    let nextRoom: Room = { ...room, league: nextLeague };
    if (action.type === 'acceptSponsor') {
      nextRoom = attachQuotes(
        cueQuotes(nextRoom, [
          {
            kind: 'sponsor-accepted',
            slug: cs.slug,
            sponsorId: action.sponsorId,
          },
        ]),
      );
    }
    nextRoom = logEvent(nextRoom, now, action.type, { coach: coachId });
    return { room: nextRoom, receipt: result.receipt };
  }
  return { room: cupAction(room, coachId, action, now) };
}

function cupAction(
  room: Room,
  coachId: string,
  action: RoomAction,
  now: number,
): Room {
  switch (action.type) {
    case 'setDone':
      return setDone(room, coachId, Boolean(action.done), now);
    case 'setBetStake':
      return setBetStake(room, coachId, Number(action.stake));
    case 'bet':
      if (action.side !== 'a' && action.side !== 'b')
        throw new ActionError('bad-side');
      return placeBet(room, coachId, action.side, now);
    case 'removeBet':
      return removeBet(room, coachId);
    case 'pass':
      return passBet(room, coachId);
    case 'favor':
      return bookFavor(
        room,
        coachId,
        String(action.targetSlug),
        Number(action.index),
        now,
      );
    case 'withdraw':
      return withdraw(room, coachId, now);
    case 'voteSkip':
      return voteSkipClip(room, coachId, now);
    case 'voteSkipRound':
      return voteSkipRound(room, coachId, Boolean(action.on), now);
    case 'voteSkipCup':
      return voteSkipCup(room, coachId, Boolean(action.on), now);
    case 'voteReopen':
      return voteReopen(room, coachId, Boolean(action.on), now);
    default:
      throw new ActionError('bad-phase');
  }
}

// The Done toggle: on means finished with the phase, off means more to do.
// The timers module closes the phase the moment everyone is on
export function setDone(
  room: Room,
  coachId: string,
  done: boolean,
  now: number,
): Room {
  const league = room.league;
  if (!league) throw new ActionError('bad-room');
  const gated =
    room.phase.kind === 'window' ||
    room.phase.kind === 'paper' ||
    room.phase.kind === 'cup-pre' ||
    room.phase.kind === 'season-end';
  if (!gated) throw new ActionError('bad-phase');
  const cs = league.coachStates[coachId];
  return logEvent(
    {
      ...room,
      league: {
        ...league,
        coachStates: { ...league.coachStates, [coachId]: { ...cs, done } },
      },
    },
    now,
    done ? 'done' : 'undone',
    { coach: coachId },
  );
}

export function everyoneDone(room: Room): boolean {
  const league = room.league;
  if (!league) return false;
  return Object.keys(room.coaches).every(
    (id) => league.coachStates[id]?.done ?? true,
  );
}
