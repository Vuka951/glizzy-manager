export type MeterEquilibrium = {
  stress: number;
  appetite: number;
  ambition: number;
  ego: number;
  fame: number;
};

// Lore fame is where an AI coach starts, between these two. A human coach
// starts at COMEBACK_START_FAME whatever the character
export const STARTING_FAME_MIN = 10;
export const STARTING_FAME_MAX = 50;
// How far an AI coach's opening roll strays from the lore fame either way
export const AI_STARTING_FAME_SPREAD = 4;

export type MeterRoll = {
  // Resting point of a character with an average drive
  center: number;
  // How far the drive moves it at either end, and the spread on top of that
  drive: number;
  spread: number;
  min: number;
  max: number;
  step: number;
};

// Every character's resting points are rolled from his name. One drive roll
// lifts ambition, ego and fame together and leans a little against stress
// and appetite, so a hungry climber and a calm nobody both turn up, about as
// often as they did when the league was written by hand
export const EQUILIBRIUM_ROLLS: Record<keyof MeterEquilibrium, MeterRoll> = {
  stress: { center: 38, drive: -6, spread: 18, min: 20, max: 70, step: 5 },
  appetite: { center: 51, drive: -8, spread: 20, min: 35, max: 85, step: 5 },
  ambition: { center: 57, drive: 28, spread: 6, min: 30, max: 90, step: 5 },
  ego: { center: 50, drive: 30, spread: 8, min: 20, max: 85, step: 5 },
  fame: { center: 28, drive: 18, spread: 5, min: 10, max: 50, step: 1 },
};
