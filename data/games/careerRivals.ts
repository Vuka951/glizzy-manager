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

// Year one grudges come from the name: each character holds old feuds with
// this many others of his league, picked by hash, and opens the comeback
// with one of them
export const LORE_RIVAL_COUNTS: readonly number[] = [2, 3, 3, 3];
