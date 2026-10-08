import {
  APPETITE_REGROWTH,
  LEAGUE_STIPEND,
  CAREER_BET_UNLOCK_CUPS,
  FASTING_AMBITION_GAIN,
  FASTING_APPETITE_GAIN,
  FASTING_STRESS,
  GUARD_BLOCK_CHANCE,
  MEDIA_AMBITION_GAIN,
  MEDIA_EGO_GAIN,
  MEDIA_SCANDAL_EGO_GAIN,
  MEDIA_SCANDAL_FAME_SCALE,
  MEDIA_SCANDAL_STRESS,
  MEDIA_STRESS,
  PLOTTING_EGO_GAIN,
  SCANDAL_BACKFIRE_CHANCE,
  SPONSOR_FAME_BONUS,
  STARTING_CAREER_BALANCE,
} from '@/data/games/careerEconomy';
import { ELECTION_POLL_SEASON } from '@/data/games/careerElections';
import { SPONSOR_TOP_SEED_COUNT } from '@/data/games/careerSponsors';
import {
  aiDonationAmount,
  guardTaxScale,
  isElectionYear,
  korporacijaTax,
  ostrvoWeekendEveryWindow,
  partyStatusOf,
  nextGliziPriceIndex,
  rollGliziPriceEvent,
  sabotageTaxScale,
  strankaLeadMedia,
  strankaLeadTrainingScale,
  strankaMediaMultiplier,
} from '@/lib/utils/careerElections';
import { COMMENTARY_UNLOCK_CUPS } from '@/lib/constants/careerCommentary';
import {
  fameStressTaxScale,
  mediaUsesFor,
  TRAINING_DEFS,
  TRAINING_ORDER,
  trainingCost,
  type TrainingId,
} from '@/data/games/careerTraining';
import {
  jitteredWeight,
  LEARNED_OUT_PLOT_PULL,
  OFF_SCRIPT_CHANCE,
  OVERRIDE_OBEY_CHANCE,
  personalityFor,
  trainingSurplusPull,
  type CareerActionKind,
} from '@/data/games/careerPersonalities';
import {
  readAiSituation,
  reactionWeights,
  trainingChoiceWeight,
} from '@/lib/utils/careerAiSituation';
import type {
  NewsItem,
  PendingSabotage,
  SavedCareer,
  SponsorId,
} from '@/lib/utils/careerSave';

const EMPTY_CHEST: Record<SponsorId, number> = {
  zidari: 0,
  ostrvo: 0,
  korporacija: 0,
  stranka: 0,
};
import { weightedPick } from '@/lib/utils/weightedPick';
import {
  applyRest,
  applyTraining,
  clampMeter,
  mediaPay,
  rollMediaFame,
  STAT_KEY_BY_TRAINING,
} from '@/lib/utils/careerMeters';
import { seasonPriceScale } from '@/lib/utils/careerSeasonPrices';
import {
  affordableInvestment,
  buyInvestment,
  nextInvestmentGoal,
  investmentLevel,
  investmentNews,
} from '@/lib/utils/careerInvestments';
import { isHumanSlug, rankBySeeding, seedingKey } from '@/lib/utils/careerPoints';
import { rivalAnnouncedNews } from '@/lib/utils/careerRivals';
import {
  applyKorpVendetta,
  bookAiSabotage,
  guardBlockChance,
  guardCost,
  guardPositionScale,
  patientAiTier,
  resolveSabotages,
  sabotageCost,
} from '@/lib/utils/careerSabotage';
import {
  cupWinsForPlace,
  newContract,
  ostrvoSabotageScale,
  rollSponsorOffers,
  sponsorPayout,
} from '@/lib/utils/careerSponsors';

const AI_ACTIONS = 3;
const AI_STRESS_DRAMA_CHANCE = 0.15;
const MAX_TRAINING_HEADLINES = 5;
const MAX_STRESS_HEADLINES = 2;
const MAX_INVEST_HEADLINES = 3;

const TRAINING_BY_STAT: Record<string, string> = {
  livesCap: 'stomach',
  njuh: 'sniffer',
  nutrition: 'nutrition',
  fanSkill: 'fans',
};

const SCENE_BY_STAT: Record<string, string> = {
  livesCap: 'train-stomach',
  njuh: 'train-sniffer',
  nutrition: 'train-nutrition',
  fanSkill: 'train-fans',
};

// The whole league lives through the same off-season: AI characters spend
// their own money on two actions, always close with a rest, sign new deals,
// and the notable bits become transfer-window news
export function simulateOffseason(state: SavedCareer): SavedCareer {
  const resolved = resolveSabotages(simulateAiWindow(state));
  return resolved.korpVendetta ? applyKorpVendetta(resolved) : resolved;
}

// The AI half of the window on its own: every plot booked lands in the
// pending queue, nothing is resolved yet. A shared league resolves the queue
// itself so every human coach can be fined and remembered separately
export function simulateAiWindow(state: SavedCareer): SavedCareer {
  // The very first pre-season is a soft tutorial: no sabotage, no sponsors
  const mechanicsUnlocked = state.standingsHistory.length > 0;
  // League stories with no single hero print the reader's own man in single
  // player; a shared league leaves them to the lens
  const leagueSlugs = state.humanSlugs ? [] : [state.playerSlug];
  // The league shops at the same seasonal prices the player does
  const trainingScale = seasonPriceScale(state, 'training');
  const mediaScale = seasonPriceScale(state, 'media');
  const guardScale = seasonPriceScale(state, 'guard');
  const sabotageScale = seasonPriceScale(state, 'sabotage');
  const investScale = seasonPriceScale(state, 'investment');
  const guardPrice = guardCost(0, guardScale);
  // The campaign chest opens once, in the poll window of an election year
  const pollWindow =
    isElectionYear(state.year) &&
    state.season === ELECTION_POLL_SEASON &&
    state.parliament !== undefined;
  const donations = { ...(state.parliament?.donations ?? EMPTY_CHEST) };
  const donors = { ...(state.parliament?.donors ?? {}) };
  const characters = { ...state.characters };
  const aiGuarded: string[] = [];
  const trainingNews: NewsItem[] = [];
  const signingNews: NewsItem[] = [];
  const stressNews: NewsItem[] = [];
  const investNews: NewsItem[] = [];
  // The first front page belongs to the comeback story; the old grudge from
  // the chronicles runs right under it
  if (!mechanicsUnlocked) {
    signingNews.push({
      kind: 'comeback',
      templateKey: 'comeback',
      params: {},
      slugs: state.humanSlugs ?? [state.playerSlug],
      freezeframe: 'signing',
    });
    if (state.rivalSlug) {
      signingNews.push(rivalAnnouncedNews(state.playerSlug, state.rivalSlug));
    }
  }
  // The paper tracks the betting ban: a reminder while it lasts, and the
  // reopening notice in the issue for the first cup that takes bets again
  if (state.standingsHistory.length < CAREER_BET_UNLOCK_CUPS) {
    signingNews.push({
      kind: 'league',
      templateKey: 'betting-banned',
      params: {},
      slugs: leagueSlugs,
      freezeframe: 'stamp-banned',
    });
  } else if (state.standingsHistory.length === CAREER_BET_UNLOCK_CUPS) {
    signingNews.push({
      kind: 'league',
      templateKey: 'betting-unlocked',
      params: {},
      slugs: leagueSlugs,
      freezeframe: 'stamp-allowed',
    });
  }
  // The commentator's comeback makes the front page of the issue for the
  // first cup he calls
  if (state.standingsHistory.length === COMMENTARY_UNLOCK_CUPS) {
    signingNews.push({
      kind: 'league',
      templateKey: 'commentator-back',
      params: {},
      slugs: leagueSlugs,
      freezeframe: 'stamp-onair',
    });
  }

  const seeding = rankBySeeding(characters, seedingKey(state));
  const aiPlots: PendingSabotage[] = [];

  for (const slug of Object.keys(characters)) {
    if (isHumanSlug(state, slug)) continue;
    let ch = characters[slug];
    const mind = personalityFor(ch.personality);
    // Same books as the player: the stipend is the league's charity for
    // whoever could not find a sponsor, and it is the same forty either way
    const income =
      (ch.sponsor
        ? sponsorPayout(
            ch.sponsor,
            cupWinsForPlace(ch.lastPlace ?? 0),
            ch.partyStatus,
          )
        : LEAGUE_STIPEND) + korporacijaTax(ch, state.parliament);
    let money = (ch.money ?? STARTING_CAREER_BALANCE) + income;
    // Standing contracts are saved for, a sponsored competitor's privilege:
    // the window opens by signing the next one on the list once the money
    // is there, and a share of the income then stays untouched, out of
    // every budget below, until the one after it is bought too
    let setAside = 0;
    if (ch.sponsor) {
      const goal = nextInvestmentGoal(ch, mind.investPriority, investScale);
      if (goal && money - goal.cost >= Math.floor(mind.reserve / 4)) {
        money -= goal.cost;
        ch = buyInvestment(ch, goal.id);
        investNews.push(
          investmentNews(slug, goal.id, investmentLevel(ch, goal.id)),
        );
      }
      if (nextInvestmentGoal(ch, mind.investPriority, investScale)) {
        setAside = Math.min(money, Math.max(0, Math.floor(income * mind.saving)));
        money -= setAside;
      }
    }
    let mediaUses = 0;
    let plotted = false;
    // The read on the window: table place, body, last result, price list.
    // Hiring a crew is money down the drain when the door is already watched
    const situation = readAiSituation(
      { ...state, characters },
      slug,
      seeding,
    );
    const doorCovered = guardBlockChance(state, slug) >= GUARD_BLOCK_CHANCE;
    // The leading party's door and island rates for anyone outside the
    // government, and the crew's surcharge for a name near the top
    const myGuardPrice = Math.round(
      guardPrice *
        guardTaxScale(ch, state.parliament) *
        guardPositionScale(seeding.indexOf(slug)),
    );
    const mySabotageScale =
      sabotageScale *
      sabotageTaxScale(ch, state.parliament) *
      ostrvoSabotageScale(ch);
    if (pollWindow && ch.sponsor) {
      const gift = aiDonationAmount({ ...ch, money });
      if (gift > 0) {
        money -= gift;
        donations[ch.sponsor.sponsorId] += gift;
        donors[slug] = (donors[slug] ?? 0) + gift;
      }
    }

    // What a training session would cost right now, or null when it is
    // maxed out or priced past what this character is willing to spend down to
    const trainingBudget = (id: TrainingId): number | null => {
      const def = TRAINING_DEFS[id];
      const key = STAT_KEY_BY_TRAINING[id];
      if (def.leveled && key && ch[key].level >= def.maxLevel) return null;
      const cost = trainingCost(
        def,
        key ? ch[key].level : 0,
        trainingScale * strankaLeadTrainingScale(ch, state.parliament, id),
      );
      return money - cost >= mind.reserve ? cost : null;
    };

    const doTrain = () => {
      // A good coach never runs the same session twice in a row, so the
      // overtraining window never opens unless there is nothing else to run
      const affordable = TRAINING_ORDER.filter(
        (id) => trainingBudget(id) !== null,
      );
      const fresh = affordable.filter((id) => id !== ch.lastTraining);
      const pool = fresh.length > 0 ? fresh : affordable;
      const id = weightedPick(pool, (t) =>
        trainingChoiceWeight(mind, situation, t),
      );
      money -= trainingBudget(id) as number;
      const { next, outcome, statKey } = applyTraining(ch, TRAINING_DEFS[id]);
      ch = next;
      if (statKey && (outcome === 'level-up' || outcome === 'regression')) {
        const up = outcome === 'level-up';
        trainingNews.push({
          kind: 'training',
          templateKey: `${up ? 'trainUp' : 'trainDown'}-${TRAINING_BY_STAT[statKey]}`,
          params: {},
          slugs: [slug],
          freezeframe: up
            ? SCENE_BY_STAT[statKey]
            : `train-down-${TRAINING_BY_STAT[statKey]}`,
        });
      }
    };

    const doMedia = () => {
      const fanLevel = ch.fanSkill.level;
      const stranka = ch.sponsor?.sponsorId === 'stranka';
      const lead = strankaLeadMedia(ch, state.parliament);
      const scandal = Math.random() < mind.scandalChance;
      const backfired = scandal && Math.random() < SCANDAL_BACKFIRE_CHANCE;
      const tax = fameStressTaxScale(fanLevel);
      const swing = rollMediaFame(
        fanLevel,
        scandal ? MEDIA_SCANDAL_FAME_SCALE : 1,
      );
      money += Math.round(
        mediaPay(
          scandal ? 'scandal' : 'interview',
          fanLevel,
          stranka ? strankaMediaMultiplier(ch.partyStatus) : 1,
          mediaScale,
        ) * lead.payScale,
      );
      if (!stranka) mediaUses += 1;
      ch = {
        ...ch,
        stress: clampMeter(
          ch.stress +
            (scandal ? MEDIA_SCANDAL_STRESS : MEDIA_STRESS) *
              tax *
              (backfired ? 2 : 1),
        ),
        appetite: clampMeter(ch.appetite + APPETITE_REGROWTH),
        fame: clampMeter(
          ch.fame +
            (backfired ? -swing : swing) * lead.fameScale +
            lead.fameDelta,
        ),
        ego: clampMeter(
          ch.ego +
            (scandal
              ? (backfired ? -1 : 1) * (MEDIA_SCANDAL_EGO_GAIN + fanLevel)
              : MEDIA_EGO_GAIN + fanLevel),
        ),
        ambition: clampMeter(ch.ambition + MEDIA_AMBITION_GAIN + fanLevel),
      };
    };

    // A standing contract outlives the window it is signed in, so the money
    // for one is worth holding out for even when the gym is calling
    const doInvest = () => {
      const deal = affordableInvestment(
        ch,
        mind.investPriority,
        money - mind.reserve,
        investScale,
      );
      if (!deal) return;
      money -= deal.cost;
      ch = buyInvestment(ch, deal.id);
      investNews.push(
        investmentNews(slug, deal.id, investmentLevel(ch, deal.id)),
      );
    };

    const doGuard = () => {
      money -= myGuardPrice;
      aiGuarded.push(slug);
      ch = { ...ch, ego: clampMeter(ch.ego + PLOTTING_EGO_GAIN) };
    };

    const doSabotage = () => {
      const plot = bookAiSabotage(
        { ...state, characters },
        slug,
        seeding,
        mind.preferredTier,
        money - mind.reserve,
        mySabotageScale,
      );
      if (!plot) return;
      const plotCost = plot.cost ?? sabotageCost(plot.tier, mySabotageScale);
      aiPlots.push({ ...plot, cost: plotCost });
      money -= plotCost;
      plotted = true;
      // Revenge taken is a grudge closed, whatever comes of the job
      ch = {
        ...ch,
        ego: clampMeter(ch.ego + PLOTTING_EGO_GAIN),
        ...(plot.targetSlug === ch.grudgeSlug ? { grudgeSlug: null } : {}),
      };
    };

    for (let i = 0; i < AI_ACTIONS; i++) {
      // Two states jump the queue whatever the temperament: about to burst,
      // and too full to eat. Mostly obeyed, which is not the same as always
      const obeys = Math.random() < OVERRIDE_OBEY_CHANCE;
      if (obeys && ch.stress >= mind.restAt) {
        ch = applyRest(ch, slug);
        continue;
      }
      if (obeys && ch.appetite <= mind.fastAt) {
        ch = {
          ...ch,
          appetite: clampMeter(ch.appetite + FASTING_APPETITE_GAIN),
          ambition: clampMeter(ch.ambition + FASTING_AMBITION_GAIN),
          stress: clampMeter(ch.stress + FASTING_STRESS),
          lastTraining: null,
          sameTrainingStreak: 0,
        };
        continue;
      }

      const canTrain = TRAINING_ORDER.some((id) => trainingBudget(id) !== null);
      const learnedOut = TRAINING_ORDER.every((id) => {
        const def = TRAINING_DEFS[id];
        const key = STAT_KEY_BY_TRAINING[id];
        return !def.leveled || !key || ch[key].level >= def.maxLevel;
      });
      // Standing contracts are a sponsored competitor's privilege, same rule
      // the player plays by
      const canInvest =
        ch.sponsor !== null &&
        affordableInvestment(
          ch,
          mind.investPriority,
          money - mind.reserve,
          investScale,
        ) !== null;
      const canGuard =
        mechanicsUnlocked &&
        !aiGuarded.includes(slug) &&
        money - myGuardPrice >= mind.reserve;
      const canPlot =
        mechanicsUnlocked &&
        !plotted &&
        (ch.fineRecency ?? 0) === 0 &&
        patientAiTier(
          money - mind.reserve,
          mind.preferredTier,
          mind.reactions.plotPatience,
          mySabotageScale,
        ) !== null;
      const canMedia =
        ch.sponsor?.sponsorId === 'stranka' ||
        mediaUses <
          Math.max(
            0,
            mediaUsesFor(ch.fanSkill.level) +
              strankaLeadMedia(ch, state.parliament).usesDelta,
          );

      const react = reactionWeights(mind, situation, ch, { doorCovered });
      // Recovery gets more tempting the worse the body is, so nobody burns a
      // window resting at zero cholesterol
      const options: {
        kind: CareerActionKind;
        weight: number;
        run: () => void;
      }[] = [
        {
          kind: 'rest',
          weight: mind.weights.rest * (0.3 + ch.stress / 60) * react.rest,
          run: () => {
            ch = applyRest(ch, slug);
          },
        },
        {
          kind: 'fast',
          weight:
            mind.weights.fast * (0.3 + (100 - ch.appetite) / 60) * react.fast,
          run: () => {
            ch = {
              ...ch,
              appetite: clampMeter(ch.appetite + FASTING_APPETITE_GAIN),
              ambition: clampMeter(ch.ambition + FASTING_AMBITION_GAIN),
              stress: clampMeter(ch.stress + FASTING_STRESS),
              lastTraining: null,
              sameTrainingStreak: 0,
            };
          },
        },
      ];
      if (canTrain) {
        options.push({
          kind: 'train',
          weight:
            mind.weights.train *
            trainingSurplusPull(money - mind.reserve) *
            react.train,
          run: doTrain,
        });
      }
      if (canMedia)
        options.push({
          kind: 'media',
          weight: mind.weights.media * react.media,
          run: doMedia,
        });
      if (canInvest)
        options.push({
          kind: 'invest',
          weight: mind.weights.invest * react.invest,
          run: doInvest,
        });
      if (canGuard)
        options.push({
          kind: 'guard',
          weight: mind.weights.guard * react.guard,
          run: doGuard,
        });
      if (canPlot)
        options.push({
          kind: 'sabotage',
          weight:
            mind.weights.sabotage *
            react.sabotage *
            (learnedOut ? LEARNED_OUT_PLOT_PULL : 1),
          run: doSabotage,
        });

      const offScript = Math.random() < OFF_SCRIPT_CHANCE;
      weightedPick(options, (o) =>
        offScript ? 1 : jitteredWeight(o.weight),
      ).run();
    }
    // Ostrvo clients open the year with the island weekend, body reset to ideal
    if (
      ch.sponsor?.sponsorId === 'ostrvo' &&
      (state.season === 0 || ostrvoWeekendEveryWindow(ch))
    ) {
      ch = { ...ch, stress: 0, appetite: 100, ambition: 100 };
    }
    // Life happens anyway: sometimes the off-season brings its own drama
    if (Math.random() < AI_STRESS_DRAMA_CHANCE) {
      ch = {
        ...ch,
        stress: clampMeter(ch.stress + 15 + Math.floor(Math.random() * 20)),
      };
    }
    if (mechanicsUnlocked && !ch.sponsor) {
      // Same two doors the player gets, rolled on the same terms
      const offers = rollSponsorOffers(slug, ch, {
        year: state.year,
        place: ch.lastPlace ?? 0,
        topSeed: seeding.indexOf(slug) < SPONSOR_TOP_SEED_COUNT,
      });
      // An earned call is taken over a fluke when both land the same window
      const signed =
        (offers.find((o) => !o.wildcard) ?? offers[0])?.sponsorId ?? null;
      if (signed) {
        const status = partyStatusOf(
          state.parliament?.government ?? [],
          signed,
        );
        ch = {
          ...ch,
          sponsor: newContract(signed),
          ...(status ? { partyStatus: status } : {}),
          fame: clampMeter(ch.fame + SPONSOR_FAME_BONUS),
        };
        signingNews.push({
          kind: 'signing',
          templateKey: 'signing',
          params: { sponsor: signed },
          refs: { sponsor: 'sponsor' },
          slugs: [slug],
          freezeframe: `signing-${signed}`,
        });
      }
    }

    characters[slug] = { ...ch, money: money + setAside };
    if (ch.stress > 80 && stressNews.length < MAX_STRESS_HEADLINES) {
      stressNews.push({
        kind: 'drama',
        templateKey: 'stressWarning',
        params: {},
        slugs: [slug],
        freezeframe: 'stress',
      });
    }
  }

  const selectedTraining = trainingNews
    .sort(
      (x, y) =>
        (x.templateKey.startsWith('trainDown') ? 0 : 1) -
        (y.templateKey.startsWith('trainDown') ? 0 : 1),
    )
    .slice(0, MAX_TRAINING_HEADLINES);

  // A window where half the league went shopping is not three front pages, so
  // the desk runs the biggest contracts and drops the rest
  const selectedInvest = investNews
    .sort((x, y) => Number(y.params.level) - Number(x.params.level))
    .slice(0, MAX_INVEST_HEADLINES);

  // The glizi price: the one story that moves the gym's prices next window
  // and the government's standing with it
  const price = rollGliziPriceEvent(state.parliament);
  const priceNews: NewsItem[] = price
    ? [
        {
          kind: 'league',
          templateKey: price.up ? 'glizi-price-up' : 'glizi-price-down',
          params: { pct: Math.abs(price.pct) },
          slugs: leagueSlugs,
          freezeframe: price.up ? 'price-up' : 'price-down',
        },
      ]
    : [];
  const parliament = state.parliament
    ? {
        ...state.parliament,
        donations,
        donors,
        rating: state.parliament.rating + (price?.ratingDelta ?? 0),
      }
    : undefined;
  const gliziIndex = price
    ? nextGliziPriceIndex(state.gliziPriceIndex, price.pct)
    : (state.gliziPriceIndex ?? 1);

  return {
    ...state,
    characters,
    aiGuarded,
    ...(parliament ? { parliament } : {}),
    gliziPricePct: price?.pct,
    gliziPriceIndex: gliziIndex,
    gliziPriceHistory: [...(state.gliziPriceHistory ?? []), gliziIndex],
    newsQueue: [
      ...state.newsQueue,
      ...signingNews,
      ...selectedTraining,
      ...stressNews,
      ...selectedInvest,
      ...priceNews,
    ],
    pendingSabotages: [...state.pendingSabotages, ...aiPlots],
  };
}
