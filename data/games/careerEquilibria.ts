export type MeterEquilibrium = {
  stress: number;
  appetite: number;
  ambition: number;
  ego: number;
  fame: number;
};

export const DEFAULT_EQUILIBRIUM: MeterEquilibrium = {
  stress: 35,
  appetite: 50,
  ambition: 50,
  ego: 45,
  fame: 40,
};

// Lore-informed resting points the meters drift back to
export const CHARACTER_EQUILIBRIA: Record<string, MeterEquilibrium> = {
  vuka: { stress: 30, appetite: 50, ambition: 55, ego: 50, fame: 60 },
  dax: { stress: 35, appetite: 55, ambition: 50, ego: 60, fame: 55 },
  kosta: { stress: 60, appetite: 45, ambition: 40, ego: 35, fame: 45 },
  cone: { stress: 25, appetite: 40, ambition: 75, ego: 55, fame: 65 },
  dusan: { stress: 40, appetite: 50, ambition: 85, ego: 75, fame: 70 },
  nikola: { stress: 35, appetite: 35, ambition: 90, ego: 80, fame: 75 },
  'jovan': { stress: 30, appetite: 60, ambition: 55, ego: 85, fame: 80 },
  'bane': { stress: 35, appetite: 45, ambition: 65, ego: 60, fame: 55 },
  'tax-inspector': { stress: 55, appetite: 40, ambition: 60, ego: 45, fame: 30 },
  steva: { stress: 70, appetite: 60, ambition: 35, ego: 25, fame: 25 },
  'dzamila': { stress: 40, appetite: 55, ambition: 40, ego: 35, fame: 30 },
  'zeka': { stress: 30, appetite: 85, ambition: 35, ego: 30, fame: 40 },
  'halvard': { stress: 25, appetite: 45, ambition: 55, ego: 50, fame: 40 },
  'stojan': { stress: 35, appetite: 75, ambition: 50, ego: 45, fame: 35 },
  'tihomir': { stress: 20, appetite: 40, ambition: 30, ego: 20, fame: 35 },
  'miki': { stress: 45, appetite: 35, ambition: 70, ego: 60, fame: 50 },
};

export function equilibriumFor(slug: string): MeterEquilibrium {
  return CHARACTER_EQUILIBRIA[slug] ?? DEFAULT_EQUILIBRIUM;
}
