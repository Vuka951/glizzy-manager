export type InvestmentId = 'security' | 'spa' | 'assistant' | 'scout';

export type InvestmentDef = {
  id: InvestmentId;
  // Price of each level, indexed by the level being bought out of
  costs: [number, number, number];
  maxLevel: number;
  // Contracts that only change what the coach can see. The league never buys
  // one, because nothing in the simulation reads it
  playerOnly?: boolean;
};

// The four standing contracts. Every one of them is priced well past a
// single season's income: this is where a good year's prize money goes when
// the coach decides to buy something that never has to be bought again
export const INVESTMENT_DEFS: Record<InvestmentId, InvestmentDef> = {
  security: { id: 'security', costs: [280, 560, 1000], maxLevel: 3 },
  spa: { id: 'spa', costs: [240, 480, 860], maxLevel: 3 },
  assistant: { id: 'assistant', costs: [320, 640, 1150], maxLevel: 3 },
  scout: { id: 'scout', costs: [300, 620, 1120], maxLevel: 3, playerOnly: true },
};

export const INVESTMENT_ORDER: InvestmentId[] = [
  'security',
  'spa',
  'assistant',
  'scout',
];

// What the league itself ever signs, so an AI never burns a contract on
// information it does not use
export const AI_INVESTMENT_ORDER: InvestmentId[] = INVESTMENT_ORDER.filter(
  (id) => !INVESTMENT_DEFS[id].playerOnly,
);

// Standing block chance the retainer buys, by level
export const SECURITY_CHANCE = [0.15, 0.25, 0.35];
// Cholesterol the spa card washes off at the start of every window
export const SPA_STRESS_DROP = [10, 15, 30];
// Sessions the assistant coach runs on his own each window
export const ASSISTANT_SESSIONS = [1, 2, 3];

// What each level of the informant opens up on somebody else's card. The
// ladder goes from what they can do, through what shape they are in, to how
// they actually spend an off-season
export const SCOUT_SKILLS_LEVEL = 1;
export const SCOUT_METERS_LEVEL = 2;
export const SCOUT_DETAIL_LEVEL = 3;

export function investmentCost(id: InvestmentId, level: number): number | null {
  const def = INVESTMENT_DEFS[id];
  if (level >= def.maxLevel) return null;
  return def.costs[level];
}
