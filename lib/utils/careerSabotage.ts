import {
  AI_SABOTAGE_SAME_SPONSOR_SCALE,
  AI_SABOTAGE_TOP_WEIGHT,
  GUARD_BLOCK_CHANCE,
  GUARD_MAX_CHANCE,
  GUARD_MIN_CHANCE,
  GUARD_STEP,
  GUARD_STEP_COST,
  POLICE_INDICTMENT_CHANCE,
  GUARD_TOP_POSITIONS,
  GUARD_TOP_SURCHARGE_STEP,
  PROTECTION_COST,
  SABOTAGE_APPETITE_HIT,
  SABOTAGE_BOOST_STEP,
  SABOTAGE_BOOST_STEP_COST,
  SABOTAGE_COSTS,
  SABOTAGE_FINE_BASE,
  SABOTAGE_FINE_GROWTH,
  SABOTAGE_MAX_CHANCE,
  SABOTAGE_REPEAT_SCALE,
  SABOTAGE_SUCCESS,
  SABOTAGE_SWAY_MAX,
  SABOTAGE_SWAY_MIN,
  sabotageMeterEffects,
} from '@/data/games/careerEconomy';
import { PUNISHMENT_PARTY_PENALTY } from '@/data/games/careerElections';
import { partyConvictions } from '@/lib/utils/careerElections';
import { RIVAL_SABOTAGE_WEIGHT_SCALE } from '@/data/games/careerRivals';
import { personalityFor } from '@/data/games/careerPersonalities';
import { TRAININGS_PER_LEVEL } from '@/data/games/careerTraining';
import type {
  CharacterCareerState,
  TrainedStat,
  NewsItem,
  PendingSabotage,
  SabotageTier,
  SavedCareer,
} from '@/lib/utils/careerSave';
import { clampMeter } from '@/lib/utils/careerMeters';
import {
  guardTaxScale,
  shieldedFromIndictment,
  zidariBlockChance,
} from '@/lib/utils/careerElections';
import { standingSecurityChance } from '@/lib/utils/careerInvestments';
import { readAiSituation } from '@/lib/utils/careerAiSituation';
import { isHumanSlug, rankBySeeding, seedingKey } from '@/lib/utils/careerPoints';
import { seasonPriceScale } from '@/lib/utils/careerSeasonPrices';
import { isOstrvoClient } from '@/lib/utils/careerSponsors';
import type { MessageParams } from '@/lib/utils/message';
import { weightedPick } from '@/lib/utils/weightedPick';

// Each lore variant carries its own front-page picture
const FREEZEFRAME_BY_VARIANT: Record<string, string> = {
  'poison-glizimaker': 'poison-glizi',
  'poison-kafana': 'poison-kafana',
  'witch-curse': 'witch-curse',
  'nutrition-bribed': 'nutrition-bribed',
  'fans-rumor': 'rumor',
  'catfish-date': 'heartbreak',
  'catfish-zeka': 'zeka',
  'catfish-demons': 'demons',
  'police-tax': 'police-tax',
  'police-stash': 'police-stash',
  'police-island': 'police-island',
  'police-smuggling': 'police-smuggling',
};

// The coach picks the method; which lore flavor actually happens is a
// surprise that only the news reveals
const VARIANTS_BY_TIER: Record<number, string[]> = {
  1: ['poison-glizimaker', 'poison-kafana'],
  2: ['catfish-date', 'catfish-zeka', 'catfish-demons'],
  3: ['police-tax', 'police-stash', 'police-island', 'police-smuggling'],
};

function rollVariant(tier: SabotageTier): string {
  const variants = VARIANTS_BY_TIER[tier];
  return variants[Math.floor(Math.random() * variants.length)];
}

// How many cups a landed hit stays fresh in the target's mind
const HIT_RECENCY_CUPS = 2;
// How hard a visible door, a grudge and the name directly above pull a plot
const GUARDED_TARGET_SCALE = 0.8;
const GRUDGE_TARGET_SCALE = 3;
const ABOVE_TARGET_SCALE = 1;

// Tier 1 hits a random trained skill; the floor is level 0, which for the
// stomach means a ruined two-glizzy capacity. How deep the hit goes is a coin
// toss between a couple of wasted sessions and the whole level
const TIER_ONE_PROGRESS_HIT = 2;
const TIER_ONE_LEVEL_HIT_CHANCE = 0.5;
const SKILL_KEYS = ['livesCap', 'njuh', 'nutrition', 'fanSkill'] as const;
const SKILL_VARIANTS: Record<(typeof SKILL_KEYS)[number], string[]> = {
  livesCap: ['poison-glizimaker', 'poison-kafana'],
  njuh: ['witch-curse'],
  nutrition: ['nutrition-bribed'],
  fanSkill: ['fans-rumor'],
};

// A hit never lands the same twice: each meter rolls its own sway between
// a graze and a haymaker around the base value
function rollSway(base?: number): number {
  if (!base) return 0;
  const magnitude = Math.abs(base);
  const min = Math.max(1, Math.round(magnitude * SABOTAGE_SWAY_MIN));
  const max = Math.round(magnitude * SABOTAGE_SWAY_MAX);
  return Math.sign(base) * (min + Math.floor(Math.random() * (max - min + 1)));
}

function applyMeterEffects(
  ch: CharacterCareerState,
  templateKey: string,
): CharacterCareerState {
  const effects = sabotageMeterEffects[templateKey];
  if (!effects) return ch;
  return {
    ...ch,
    stress: clampMeter(ch.stress + rollSway(effects.stress)),
    appetite: clampMeter(ch.appetite + rollSway(effects.appetite)),
    ambition: clampMeter(ch.ambition + rollSway(effects.ambition)),
    ego: clampMeter(ch.ego + rollSway(effects.ego)),
    fame: clampMeter(ch.fame + rollSway(effects.fame)),
  };
}

function damagedStat(stat: TrainedStat): TrainedStat {
  if (Math.random() < TIER_ONE_LEVEL_HIT_CHANCE) {
    return { level: Math.max(0, stat.level - 1), progress: 0 };
  }
  const sessions = Math.max(
    0,
    stat.level * TRAININGS_PER_LEVEL + stat.progress - TIER_ONE_PROGRESS_HIT,
  );
  return {
    level: Math.floor(sessions / TRAININGS_PER_LEVEL),
    progress: sessions % TRAININGS_PER_LEVEL,
  };
}

function applyTierOne(
  target: CharacterCareerState,
): { next: CharacterCareerState; variant: string } | null {
  const hittable = SKILL_KEYS.filter(
    (key) => target[key].level > 0 || target[key].progress > 0,
  );
  if (hittable.length === 0) return null;
  const key = hittable[Math.floor(Math.random() * hittable.length)];
  const variants = SKILL_VARIANTS[key];
  return {
    next: {
      ...target,
      [key]: damagedStat(target[key]),
    },
    variant: variants[Math.floor(Math.random() * variants.length)],
  };
}

export function sabotageCost(tier: SabotageTier, priceScale = 1): number {
  return Math.round(SABOTAGE_COSTS[tier - 1] * priceScale);
}

// The AI underworld works at a discount
export function sabotageBoostStepCost(
  tier: SabotageTier,
  priceScale = 1,
): number {
  return Math.round(sabotageCost(tier, priceScale) * SABOTAGE_BOOST_STEP_COST);
}

export function sabotageMaxBoostSteps(tier: SabotageTier): number {
  return Math.ceil(
    (SABOTAGE_MAX_CHANCE - SABOTAGE_SUCCESS[tier - 1]) / SABOTAGE_BOOST_STEP,
  );
}

export function sabotageChance(tier: SabotageTier, boostSteps = 0): number {
  return Math.min(
    SABOTAGE_MAX_CHANCE,
    SABOTAGE_SUCCESS[tier - 1] + boostSteps * SABOTAGE_BOOST_STEP,
  );
}

export function sabotageTotalCost(
  tier: SabotageTier,
  boostSteps = 0,
  priceScale = 1,
): number {
  return (
    sabotageCost(tier, priceScale) +
    boostSteps * sabotageBoostStepCost(tier, priceScale)
  );
}

export function playerPlotsBooked(state: SavedCareer): number {
  return state.pendingSabotages.filter((s) => s.bySlug === state.playerSlug)
    .length;
}

// What the next job costs on top of the street price once this many are
// already booked in the same window
export function sabotageRepeatScale(booked: number): number {
  return SABOTAGE_REPEAT_SCALE ** booked;
}

// Player security is bought by coverage: steps move the block chance away
// from the base package, and the price follows
export function guardBaseCost(priceScale = 1): number {
  return Math.round(PROTECTION_COST * priceScale);
}

export function guardStepCost(priceScale = 1): number {
  return Math.round(guardBaseCost(priceScale) * GUARD_STEP_COST);
}

export function guardMinSteps(): number {
  return -Math.round((GUARD_BLOCK_CHANCE - GUARD_MIN_CHANCE) / GUARD_STEP);
}

export function guardMaxSteps(): number {
  return Math.round((GUARD_MAX_CHANCE - GUARD_BLOCK_CHANCE) / GUARD_STEP);
}

export function guardChance(steps: number): number {
  return Math.min(GUARD_MAX_CHANCE, GUARD_BLOCK_CHANCE + steps * GUARD_STEP);
}

export function guardCost(steps: number, priceScale = 1): number {
  return guardBaseCost(priceScale) + steps * guardStepCost(priceScale);
}

// Rank is the zero-based place on the table
export function guardPositionScale(rank: number): number {
  const place = rank + 1;
  return place <= GUARD_TOP_POSITIONS
    ? 1 + GUARD_TOP_SURCHARGE_STEP * (GUARD_TOP_POSITIONS + 1 - place)
    : 1;
}

// Everything that moves one character's door price: the season's market,
// the leading party's tax and the attention his table place draws
export function guardPriceScale(state: SavedCareer, slug: string): number {
  const ch = state.characters[slug];
  const rank = rankBySeeding(state.characters, seedingKey(state)).indexOf(slug);
  return (
    seasonPriceScale(state, 'guard') *
    guardTaxScale(ch, state.parliament) *
    guardPositionScale(rank)
  );
}

// What a failed plot costs its author: a token sum the first time, a fifth
// more for every failure already on his record, floored at each step
export function sabotageFine(by: { sabotageFails?: number }): number {
  let fine = SABOTAGE_FINE_BASE;
  for (let i = 0; i < (by.sabotageFails ?? 0); i++) {
    fine = Math.floor(fine * SABOTAGE_FINE_GROWTH);
  }
  return fine;
}

// How sure the judge is once planted evidence lands: the base odds at the
// street price, climbing to a certainty for a fully funded job
export function indictmentChance(tier: SabotageTier, chance: number): number {
  const base = SABOTAGE_SUCCESS[tier - 1];
  const funded = Math.min(
    1,
    Math.max(0, (chance - base) / (SABOTAGE_MAX_CHANCE - base)),
  );
  return POLICE_INDICTMENT_CHANCE + (1 - POLICE_INDICTMENT_CHANCE) * funded;
}

// The chance a queued attack on this character gets stopped at the door:
// the standing retainer, this window's bought coverage, the AI's standard
// package, or the Zidari house crew, whichever watches that door
// What the coach can see of a target's door before he plots. The Zidari crew
// is public knowledge, the standing retainer only shows with an informant at
// detail level, and a crew hired this window never shows in advance
export type VisibleGuard = {
  sponsor: number;
  standing: number | null;
  known: number;
  unknown: boolean;
};

export function visibleGuardBlock(
  state: SavedCareer,
  slug: string,
  revealDetail: boolean,
): VisibleGuard {
  const character = state.characters[slug];
  const sponsor =
    character?.sponsor?.sponsorId === 'zidari'
      ? zidariBlockChance(character, state.parliament)
      : 0;
  const standing =
    revealDetail && character ? standingSecurityChance(character) : null;
  return {
    sponsor,
    standing,
    known: Math.max(sponsor, standing ?? 0),
    unknown: standing === null,
  };
}

export function guardBlockChance(state: SavedCareer, slug: string): number {
  const character = state.characters[slug];
  const standingGuard = character ? standingSecurityChance(character) : 0;
  const sponsorGuard =
    character?.sponsor?.sponsorId === 'zidari'
      ? zidariBlockChance(character, state.parliament)
      : 0;
  const hiredGuard =
    slug === state.playerSlug
      ? state.guarded
        ? (state.guardChance ?? GUARD_BLOCK_CHANCE)
        : 0
      : (state.humanGuards?.[slug] ??
        ((state.aiGuarded ?? []).includes(slug) ? GUARD_BLOCK_CHANCE : 0));
  return Math.max(standingGuard, sponsorGuard, hiredGuard);
}

const METER_KEYS = ['stress', 'appetite', 'ambition', 'ego', 'fame'] as const;
const TRAINING_BY_SKILL: Record<(typeof SKILL_KEYS)[number], string> = {
  livesCap: 'stomach',
  njuh: 'sniffer',
  nutrition: 'nutrition',
  fanSkill: 'fans',
};

// What a landed hit did to the target, carried on the story so the victim's
// scene can print the receipt: every meter that moved and, for a diversion,
// the training that lost a level or a couple of sessions
function hitParams(
  before: CharacterCareerState,
  after: CharacterCareerState,
): MessageParams {
  const params: MessageParams = {};
  for (const key of METER_KEYS) {
    if (after[key] !== before[key]) params[key] = after[key] - before[key];
  }
  for (const key of SKILL_KEYS) {
    const levels = after[key].level - before[key].level;
    const sessions =
      after[key].level * TRAININGS_PER_LEVEL +
      after[key].progress -
      (before[key].level * TRAININGS_PER_LEVEL + before[key].progress);
    if (levels === 0 && sessions === 0) continue;
    params.training = TRAINING_BY_SKILL[key];
    if (levels < 0) params.levels = levels;
    else params.sessions = sessions;
  }
  return params;
}

// The stories the paper printed about hits on one man this window: the
// victim's reel plays one scene per story before the issue opens
export function sabotageHitsAgainst(news: NewsItem[], slug: string): NewsItem[] {
  return news.filter(
    (item) => item.kind === 'sabotage' && item.slugs[0] === slug,
  );
}

export type SabotageOutcome = 'landed' | 'blocked' | 'caught' | 'hushed';

export type SabotageResolution = {
  state: SavedCareer;
  // Fines owed by human coaches other than the player, by slug; the shared
  // league takes them out of each coach's own wallet
  fines: Record<string, number>;
  // Who plotted against every human target this window, by target slug
  saboteursByTarget: Record<string, string[]>;
  outcomes: { bySlug: string; targetSlug: string; outcome: SabotageOutcome }[];
};

// Resolve every queued sabotage: successes hit the target's meters (or queue a
// mid-match police pickup), failures cost a fine plus table points, doubled on
// a repeat offense. Security blocks the share of landed attacks its funding
// bought; Zidari clients have the builders on the door around the clock.
export function resolveSabotages(state: SavedCareer): SavedCareer {
  return resolveSabotagesDetailed(state).state;
}

export function resolveSabotagesDetailed(
  state: SavedCareer,
): SabotageResolution {
  const characters = { ...state.characters };
  const news: NewsItem[] = [];
  const pendingPolice = [...(state.pendingPolice ?? [])];
  const saboteurs = new Set(state.saboteursThisYear ?? []);
  const saboteursByTarget: Record<string, string[]> = {};
  const fines: Record<string, number> = {};
  const outcomes: SabotageResolution['outcomes'] = [];
  const convictions = state.parliament
    ? partyConvictions(state.parliament)
    : null;
  let balance = state.balance;

  for (const sabotage of state.pendingSabotages) {
    const target = characters[sabotage.targetSlug];
    const by = characters[sabotage.bySlug];
    if (!target || !by) continue;
    if (sabotage.targetSlug === state.playerSlug)
      saboteurs.add(sabotage.bySlug);
    if (isHumanSlug(state, sabotage.targetSlug)) {
      (saboteursByTarget[sabotage.targetSlug] ??= []).push(sabotage.bySlug);
    }
    const blockChance = guardBlockChance(state, sabotage.targetSlug);
    const lands =
      Math.random() < (sabotage.chance ?? sabotageChance(sabotage.tier));
    // Whoever came to the door is remembered, whether or not he got in
    if (lands) {
      characters[sabotage.targetSlug] = {
        ...characters[sabotage.targetSlug],
        grudgeSlug: sabotage.bySlug,
      };
    }
    if (lands && Math.random() < blockChance) {
      outcomes.push({
        bySlug: sabotage.bySlug,
        targetSlug: sabotage.targetSlug,
        outcome: 'blocked',
      });
      news.push({
        kind: 'sabotage',
        templateKey: 'sabotageBlocked',
        params: {},
        slugs: [sabotage.targetSlug],
        freezeframe: 'blocked',
      });
      continue;
    }
    outcomes.push({
      bySlug: sabotage.bySlug,
      targetSlug: sabotage.targetSlug,
      outcome: lands ? 'landed' : isOstrvoClient(by) ? 'hushed' : 'caught',
    });
    if (lands) {
      let templateKey = rollVariant(sabotage.tier);
      const before = characters[sabotage.targetSlug];
      characters[sabotage.targetSlug] = {
        ...characters[sabotage.targetSlug],
        hitRecency: HIT_RECENCY_CUPS,
      };
      if (sabotage.tier === 1) {
        const hit = applyTierOne(characters[sabotage.targetSlug]);
        if (hit) {
          characters[sabotage.targetSlug] = hit.next;
          templateKey = hit.variant;
        } else {
          // Nothing left to ruin; the feast leaves them stuffed instead
          characters[sabotage.targetSlug] = {
            ...target,
            appetite: clampMeter(
              target.appetite - rollSway(SABOTAGE_APPETITE_HIT),
            ),
          };
        }
      } else if (
        sabotage.tier === 3 &&
        !shieldedFromIndictment(target, state.parliament) &&
        Math.random() <
          indictmentChance(3, sabotage.chance ?? sabotageChance(3))
      ) {
        // The paper runs either way; only a judge's nod sends the police
        pendingPolice.push(sabotage.targetSlug);
      }
      characters[sabotage.targetSlug] = applyMeterEffects(
        characters[sabotage.targetSlug],
        templateKey,
      );
      news.push({
        kind: 'sabotage',
        templateKey,
        params: hitParams(before, characters[sabotage.targetSlug]),
        slugs: [sabotage.targetSlug],
        freezeframe: FREEZEFRAME_BY_VARIANT[templateKey],
      });
    } else if (isOstrvoClient(by)) {
      // The file goes to the island's archive: no fine, no points, no record
      news.push({
        kind: 'scandal',
        templateKey: 'sabotageHushed',
        params: {},
        slugs: [sabotage.bySlug],
        freezeframe: 'caught',
      });
    } else {
      const fine = sabotageFine(by);
      const humanPlotter =
        sabotage.bySlug !== state.playerSlug &&
        isHumanSlug(state, sabotage.bySlug);
      if (sabotage.bySlug === state.playerSlug) {
        balance = Math.max(0, balance - fine);
      } else if (humanPlotter) {
        fines[sabotage.bySlug] = (fines[sabotage.bySlug] ?? 0) + fine;
      }
      const escalate = (by.fineRecency ?? 0) > 0;
      // The voters read the paper too: his party carries the conviction on
      // its rating from here on
      if (convictions && by.sponsor) {
        convictions[by.sponsor.sponsorId] += PUNISHMENT_PARTY_PENALTY;
      }
      characters[sabotage.bySlug] = {
        ...by,
        fineRecency: 3,
        punishments: (by.punishments ?? 0) + 1,
        sabotageFails: (by.sabotageFails ?? 0) + 1,
        ...(sabotage.bySlug === state.playerSlug || humanPlotter
          ? {}
          : { money: Math.max(0, (by.money ?? 0) - fine) }),
      };
      news.push({
        kind: 'scandal',
        templateKey: escalate ? 'sabotageCaughtHard' : 'sabotageCaught',
        params: { fine },
        slugs: [sabotage.bySlug],
        freezeframe: 'caught',
      });
    }
  }

  return {
    state: {
      ...state,
      characters,
      balance,
      ...(state.parliament && convictions
        ? { parliament: { ...state.parliament, convictions } }
        : {}),
      pendingSabotages: [],
      pendingPolice,
      saboteursThisYear: [...saboteurs],
      newsQueue: [...state.newsQueue, ...news],
    },
    fines,
    saboteursByTarget,
    outcomes,
  };
}

// The corporation's revenge for a declined offer: a tier 3 planted-evidence
// hit on the player, resolved with the usual chance, guard and judge rules,
// and it always makes the papers, landed or not
export function applyKorpVendetta(
  state: SavedCareer,
  slug: string = state.playerSlug,
): SavedCareer {
  const player = state.characters[slug];
  const blockChance = guardBlockChance(state, slug);
  const pendingPolice = [...(state.pendingPolice ?? [])];
  const lands = Math.random() < sabotageChance(3);
  let templateKey = 'korp-vendetta-failed';
  let freezeframe = 'evidence-failed';
  if (lands && Math.random() < blockChance) {
    templateKey = 'sabotageBlocked';
    freezeframe = 'blocked';
  } else if (lands) {
    templateKey = 'korp-vendetta';
    freezeframe = 'police';
    if (
      !shieldedFromIndictment(player, state.parliament) &&
      Math.random() < POLICE_INDICTMENT_CHANCE
    ) {
      pendingPolice.push(slug);
    }
  }
  const hit = applyMeterEffects(player, templateKey);
  return {
    ...state,
    characters: {
      ...state.characters,
      [slug]: hit,
    },
    korpVendetta: false,
    pendingPolice,
    newsQueue: [
      ...state.newsQueue,
      {
        kind: 'sabotage',
        templateKey,
        params: hitParams(player, hit),
        slugs: [slug],
        freezeframe,
      },
    ],
  };
}

// AI characters plot too, unless they are still lying low after a fine.
// Envy points upward: the closer a target sits to the top of the table, the
// more likely the plot lands on them, and stablemates get some mercy
// Plots aim up the table, cool off between people sharing a sponsor, and the
// rival hunts the player before anybody else
export function sabotageTargetWeight(
  state: SavedCareer,
  bySlug: string,
  targetSlug: string,
  seeding: string[],
): number {
  const fromTail = seeding.length - 1 - seeding.indexOf(targetSlug);
  const weight = AI_SABOTAGE_TOP_WEIGHT ** (fromTail / (seeding.length - 1));
  const bySponsor = state.characters[bySlug].sponsor?.sponsorId;
  const sameSponsor =
    bySponsor !== undefined &&
    state.characters[targetSlug].sponsor?.sponsorId === bySponsor;
  const scaled = sameSponsor ? weight * AI_SABOTAGE_SAME_SPONSOR_SCALE : weight;
  // The feud overrides discretion: the rival hunts the player first
  const feud =
    (bySlug === state.rivalSlug && targetSlug === state.playerSlug) ||
    state.rivalOf?.[targetSlug] === bySlug
      ? scaled * RIVAL_SABOTAGE_WEIGHT_SCALE
      : scaled;
  return feud * targetReactionScale(state, bySlug, targetSlug, seeding);
}

// What the coach's temperament adds to the pick: the grudge, the name he
// needs to pass, and a healthy respect for a door everybody can see is watched
function targetReactionScale(
  state: SavedCareer,
  bySlug: string,
  targetSlug: string,
  seeding: string[],
): number {
  const by = state.characters[bySlug];
  const mind = personalityFor(by.personality);
  const situation = readAiSituation(state, bySlug, seeding);
  const door = visibleGuardBlock(state, targetSlug, false).known;
  let scale = 1 - GUARDED_TARGET_SCALE * door;
  if (situation.grudgeSlug === targetSlug)
    scale *= 1 + GRUDGE_TARGET_SCALE * mind.reactions.revenge;
  if (situation.above === targetSlug)
    scale *= 1 + ABOVE_TARGET_SCALE * mind.reactions.bubble;
  return scale;
}

export function pickSabotageTarget(
  state: SavedCareer,
  bySlug: string,
  seeding: string[],
): string {
  const targets = Object.keys(state.characters).filter((s) => s !== bySlug);
  return weightedPick(targets, (t) =>
    sabotageTargetWeight(state, bySlug, t, seeding),
  );
}

// The tier a temperament that escalates reaches for once the target is
// known: the full file against the leader or an open grudge, a beating for
// anybody else, provided the money covers it after the reserve
function escalatedTier(
  state: SavedCareer,
  bySlug: string,
  targetSlug: string,
  seeding: string[],
  wanted: SabotageTier,
): SabotageTier {
  const mind = personalityFor(state.characters[bySlug].personality);
  if (!mind.reactions.escalates) return wanted;
  const grudge = state.characters[bySlug].grudgeSlug === targetSlug;
  const leader = seeding[0] === targetSlug;
  return grudge || leader ? 3 : Math.max(wanted, 2) as SabotageTier;
}

// Whatever is left after the job buys certainty, a step at a time, the same
// funding ladder the player climbs
function fundedSteps(tier: SabotageTier, money: number, priceScale: number) {
  const stepCost = sabotageBoostStepCost(tier, priceScale);
  const spare = money - sabotageCost(tier, priceScale);
  return Math.min(
    sabotageMaxBoostSteps(tier),
    stepCost > 0 ? Math.floor(spare / stepCost) : 0,
  );
}

// The job they wanted if the money funds it to the odds this coach insists
// on, otherwise whichever other job does, cheapest first; null when no job
// clears that bar
export function patientAiTier(
  money: number,
  wanted: SabotageTier,
  patience: number,
  priceScale = 1,
): { tier: SabotageTier; boostSteps: number } | null {
  const fallbacks = ([1, 2, 3] as SabotageTier[])
    .filter((t) => t !== wanted)
    .sort((a, b) => sabotageCost(a, priceScale) - sabotageCost(b, priceScale));
  for (const tier of [wanted, ...fallbacks]) {
    if (money < sabotageCost(tier, priceScale)) continue;
    const boostSteps = fundedSteps(tier, money, priceScale);
    if (sabotageChance(tier, boostSteps) >= patience) return { tier, boostSteps };
  }
  return null;
}

export function bookAiSabotage(
  state: SavedCareer,
  bySlug: string,
  seeding: string[],
  wanted: SabotageTier,
  money: number,
  priceScale = 1,
): PendingSabotage | null {
  const mind = personalityFor(state.characters[bySlug].personality);
  const patience = mind.reactions.plotPatience;
  if (!patientAiTier(money, wanted, patience, priceScale)) return null;
  const targetSlug = pickSabotageTarget(state, bySlug, seeding);
  const job = patientAiTier(
    money,
    escalatedTier(state, bySlug, targetSlug, seeding, wanted),
    patience,
    priceScale,
  );
  if (!job) return null;
  return {
    bySlug,
    targetSlug,
    tier: job.tier,
    chance: sabotageChance(job.tier, job.boostSteps),
    cost: sabotageTotalCost(job.tier, job.boostSteps, priceScale),
  };
}
