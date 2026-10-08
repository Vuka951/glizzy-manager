// Derby stakes land on top of the normal match aftermath: beating the rival
// pays extra fame and ego, losing to him costs extra; the rival takes the
// mirrored swing at half strength
export const RIVAL_WIN_FAME = 10;
export const RIVAL_WIN_EGO = 10;
export const RIVAL_LOSS_STRESS = 40;
export const RIVAL_LOSS_EGO = 20;
// The league pays the derby winner by letter
export const RIVAL_WIN_MONEY = 50;

// The league's rival letter quotes the same stakes the picker shows
export const rivalLetterStakes = {
  fame: RIVAL_WIN_FAME,
  ego: RIVAL_WIN_EGO,
  stress: RIVAL_LOSS_STRESS,
  egoLoss: RIVAL_LOSS_EGO,
  money: RIVAL_WIN_MONEY,
};

// A rival's plots look for the player first
export const RIVAL_SABOTAGE_WEIGHT_SCALE = 4;

// A rival has to be worth the feud: close in strength, in either direction.
// Only names within this many table places of the player make the new-year
// shortlist
export const RIVAL_MAX_PLACE_GAP = 5;

// Year one grudges are preset: each playable character opens the comeback with
// one of three old feuds, rolled at career start
export const LORE_RIVALS: Record<string, string[]> = {
  vuka: ['tax-inspector', 'dusan', 'tihomir'],
  dax: ['kosta', 'jovan'],
  kosta: ['dax', 'zeka', 'tihomir'],
  cone: ['dusan', 'bane'],
  dusan: ['nikola', 'cone', 'miki'],
  nikola: ['dzamila', 'dusan'],
  jovan: ['bane', 'cone', 'tax-inspector'],
  bane: ['jovan', 'cone', 'nikola'],
  'tax-inspector': ['vuka', 'cone', 'jovan'],
  steva: ['dusan', 'bane', 'jovan'],
  dzamila: ['nikola', 'dusan', 'bane'],
  zeka: ['kosta', 'stojan', 'steva'],
  halvard: ['dusan', 'bane', 'tax-inspector'],
  stojan: ['cone', 'tax-inspector', 'miki'],
  tihomir: ['dax', 'kosta', 'vuka'],
  miki: ['tihomir', 'dusan', 'steva'],
};
