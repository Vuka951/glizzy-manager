export const STARTING_CAREER_BALANCE = 0;
// The old coach's parting gift, attached to the welcome letter
export const COACH_INHERITANCE = 100;

// Payouts by final placement, 1st through 3rd
export const PRIZE_MONEY = [150, 90, 50];

export const LEAGUE_STIPEND = 40;
// What the bookie takes per match, smallest first; the pick is remembered
// between matches
export const CAREER_BET_STAKES = [5, 10, 25, 50];
export const CAREER_BET_STAKE = CAREER_BET_STAKES[0];
// Match betting was suspended after a match fixing scandal; the league
// reopens it once this many cups of the comeback have been played
export const CAREER_BET_UNLOCK_CUPS = 2;
// Odds tuning: the gap in table points plus the gap in table position sets
// each side's implied win chance elo-style, the margin is the bookie's cut,
// and the clamps keep every match worth at least a look while stopping the
// long shots from paying out a career in one night
export const BET_ODDS_MIN = 1.1;
export const BET_ODDS_MAX = 2.2;
export const BET_ODDS_MARGIN = 0.9;
export const BET_ODDS_RANK_WEIGHT = 2;
export const BET_ODDS_SOFTNESS = 50;
// A cup is a knockout lottery, so the title graphic spreads the same strength
// over a wider scale than a single match: a three-time champion in top shape
// tops out near 60%, a fresh league sits close to even
export const TITLE_CHANCE_SOFTNESS = 100;
// Old saves can carry bets placed before odds were stored on the bet
export const CAREER_BET_FALLBACK_ODDS = 2;

export type MediaAppearanceKind = 'interview' | 'scandal';

export const MEDIA_APPEARANCE_PAY = 35;
export const MEDIA_STRESS = 15;
// How big a story the press decides to make of it, rolled fresh every time;
// the fan skill lifts the whole range rather than the odds inside it
export const MEDIA_FAME_MIN = 4;
export const MEDIA_FAME_MAX = 10;
export const MEDIA_FAME_PER_FAN_LEVEL = 2;
// What an appearance feeds besides fame; the fan skill adds one more point
// per level to each
export const MEDIA_EGO_GAIN = 2;
export const MEDIA_AMBITION_GAIN = 2;
// The scandal pays and hypes double, but the ego and cholesterol follow
export const MEDIA_SCANDAL_PAY = 70;
export const MEDIA_SCANDAL_FAME_SCALE = 2;
export const MEDIA_SCANDAL_STRESS = 30;
export const MEDIA_SCANDAL_EGO_GAIN = 6;
// Stranka's state media: double pay and no once-per-season limit
export const STRANKA_MEDIA_MULTIPLIER = 2;

// A staged scandal sells either way, but sometimes it slips the leash:
// the pay lands while fame and ego take the fall and cholesterol doubles up
export const SCANDAL_BACKFIRE_CHANCE = 0.35;
// Security is priced by coverage: the base fee buys the base block chance,
// and every 5% of coverage up or down moves the price by 10% of the base fee,
// from a skeleton crew at 40% to a fully funded 100%
export const PROTECTION_COST = 60;
export const GUARD_STEP = 0.05;
export const GUARD_STEP_COST = 0.1;
export const GUARD_MIN_CHANCE = 0.3;
// Even a fully funded crew misses the odd visitor
export const GUARD_MAX_CHANCE = 0.85;
// The crew charges for the attention a client draws: every place inside the
// top of the table adds this much to the fee, so the leader pays the most
export const GUARD_TOP_POSITIONS = 5;
export const GUARD_TOP_SURCHARGE_STEP = 0.1;

// Sabotage tiers: skill hit, catfish beating, planted evidence. The skill
// hit is the dearest: a lost training level is the one thing money cannot
// buy back before the cup. The base cost buys the base chance; every extra
// 10% of the base cost buys +5% success, up to the funded ceiling. No job is
// ever a sure thing
export const SABOTAGE_COSTS = [180, 100, 160];
export const SABOTAGE_MAX_CHANCE = 0.95;
// The island's clients plot on house terms: every job is this much cheaper
// and a failed one costs neither the fine nor the table points. While the
// island sits in the government, planted evidence against them never reaches
// an indictment either
export const OSTRVO_SABOTAGE_DISCOUNT = 0.25;
export const SABOTAGE_SUCCESS = [0.5, 0.5, 0.5];
export const SABOTAGE_BOOST_STEP = 0.05;
export const SABOTAGE_BOOST_STEP_COST = 0.1;
// Plots are bought out of the wallet, not out of the month: any number can
// be booked in one window, but every job after the first in the same window
// costs this much more than the one before
export const SABOTAGE_REPEAT_SCALE = 1.5;
// The standard package stops 3 out of 5 landed attacks; AI hires and the
// Zidari house crew always run the standard package
export const GUARD_BLOCK_CHANCE = 0.6;
// Planted evidence opens an investigation; the judge is a separate coin toss
// that decides whether the mid-match arrest actually happens
export const POLICE_INDICTMENT_CHANCE = 0.75;
// A failed plot is fined a token sum the first time; every failure already
// on the coach's record grows the next fine by a quarter, floored
export const SABOTAGE_FINE_BASE = 10;
export const SABOTAGE_FINE_GROWTH = 1.25;
// Running the plot, or paying somebody to watch your back, is its own kind
// of swagger: taking the off-season into your own hands feeds the ego
export const PLOTTING_EGO_GAIN = 8;
export const SABOTAGE_APPETITE_HIT = 25;
// Plots aim upward: target weight decays exponentially down the table, the
// leader drawing this many times the tail-ender's attention. Sharing a
// sponsor cools the feud without ruling it out
export const AI_SABOTAGE_TOP_WEIGHT = 12;
export const AI_SABOTAGE_SAME_SPONSOR_SCALE = 0.5;

// Meter side effects layered on top of each sabotage story. Harmful direction
// per meter: cholesterol climbs (meltdown risk), appetite sinks (overfull forfeit
// once they start eating), fame, ego and ambition sink (table points,
// walkover and nerves). Values are the base sway; every landed hit rolls each
// meter independently between SABOTAGE_SWAY_MIN and SABOTAGE_SWAY_MAX of it
export const SABOTAGE_SWAY_MIN = 0.3;
export const SABOTAGE_SWAY_MAX = 1.5;
export const sabotageMeterEffects: Record<
  string,
  Partial<Record<'stress' | 'appetite' | 'ambition' | 'ego' | 'fame', number>>
> = {
  'poison-glizimaker': { stress: 10 },
  'poison-kafana': { appetite: -20 },
  'witch-curse': { stress: 15 },
  'nutrition-bribed': { appetite: -15 },
  'fans-rumor': { fame: -15, ego: -10, stress: 10 },
  'catfish-date': { stress: 30, fame: -15 },
  'catfish-zeka': { stress: 30, ego: -15 },
  'catfish-demons': { stress: 30, ambition: -15 },
  'police-tax': { fame: -10 },
  'police-stash': { fame: -10 },
  'police-island': { fame: -10 },
  'police-smuggling': { fame: -10 },
  'korp-vendetta': { fame: -10 },
};

// League table points: seeding into each cup is read straight off the table
export const POINTS_PER_TITLE = 20;
export const POINTS_PER_WIN = 3;
export const POINTS_PER_LOSS = -1;
export const POINTS_SPONSOR_BONUS = 10;
export const POINTS_FAME_DIVISOR = 5;
// Signing a sponsor is publicity in itself
export const SPONSOR_FAME_BONUS = 10;
// The campaign ends the first time anyone, the player's character or an AI,
// reaches this many table points: that character is the Glizi Overlord. When
// several get there in the same window the one with the most points takes it
export const OVERLORD_POINTS = 300;

// Coming back from obscurity: the player's character restarts with almost
// no fame, which also makes him the guaranteed last seed
export const COMEBACK_START_FAME = 10;
// AI characters open a career with fame drawn evenly from this range
export const AI_START_FAME_MIN = 20;
export const AI_START_FAME_MAX = 50;

export const REST_STRESS_DROP = 30;
export const REST_DRIFT = 12;
export const REST_SIDE_DRIFT = 6;
// A month off the scene levels the head out whatever the lore says the
// character rests at, and the papers move on to somebody else meanwhile
export const REST_EGO_TARGET = 25;
export const REST_FAME_DROP = 3;

// A month without competitive eating slowly brings the appetite back
export const APPETITE_REGROWTH = 4;
export const FASTING_APPETITE_GAIN = 30;
export const FASTING_AMBITION_GAIN = 5;
export const FASTING_STRESS = 5;

export const OFFSEASON_SLOTS = 3;
