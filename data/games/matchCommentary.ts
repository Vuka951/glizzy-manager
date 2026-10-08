import { GAMES_UI } from '@/data/games/locale';
import type { SponsorId } from '@/lib/utils/careerSave';

export type CommentaryRegister = 'calm' | 'hype';

export type CommentaryLineId = keyof typeof GAMES_UI.commentary.lines;

// The pools below hold ids and delivery only. The wording lives in the locale
// files under commentary.lines.<id>
export type CommentaryLine = {
  id: CommentaryLineId;
  register: CommentaryRegister;
};

export type CommentaryCopy = {
  /** Display caption. Placeholders: {name}, {epithet} for single-subject lines, {a} and {b} for pairing lines. */
  text: string;
  /** Text-to-speech script when it differs from text (audio tags, caps, stretched vowels). */
  tts?: string;
};

export type NameForm = {
  /** Spoken and displayed instead of the full name on even-numbered line variants. */
  short?: string;
  /** TTS-only expansion of the full name (abbreviations read out loud). */
  ttsFull?: string;
};

export function commentaryCopy(id: CommentaryLineId): CommentaryCopy {
  return GAMES_UI.commentary.lines[id];
}

// Per-language name variants from commentary.nameForms: a language with no
// short form for a character repeats the roster name there
export function commentaryNameForm(slug: string): NameForm {
  return (GAMES_UI.commentary.nameForms as Record<string, NameForm>)[slug] ?? {};
}

export type IntroAngle =
  | 'rivalry'
  | 'tableLeader'
  | 'lossStreak'
  | 'titleStreak'
  | 'meltdownHistory'
  | 'spotHabitHat'
  | 'spotHabitSock'
  | 'spotHabitBox'
  | 'epithet';

export const introAngleLines: Record<IntroAngle, CommentaryLine[]> = {
  rivalry: [
    { id: 'intro-rivalry-1', register: 'calm' },
    { id: 'intro-rivalry-2', register: 'calm' },
  ],
  tableLeader: [
    { id: 'intro-leader-1', register: 'calm' },
    { id: 'intro-leader-2', register: 'calm' },
    { id: 'intro-leader-3', register: 'calm' },
  ],
  lossStreak: [
    { id: 'intro-lossstreak-1', register: 'calm' },
    { id: 'intro-lossstreak-2', register: 'calm' },
    { id: 'intro-lossstreak-3', register: 'calm' },
  ],
  titleStreak: [
    { id: 'intro-title-1', register: 'calm' },
    { id: 'intro-title-2', register: 'calm' },
    { id: 'intro-title-3', register: 'calm' },
  ],
  meltdownHistory: [
    { id: 'intro-meltdown-1', register: 'calm' },
    { id: 'intro-meltdown-2', register: 'calm' },
    { id: 'intro-meltdown-3', register: 'calm' },
  ],
  spotHabitHat: [
    { id: 'intro-hat-1', register: 'calm' },
    { id: 'intro-hat-2', register: 'calm' },
  ],
  spotHabitSock: [
    { id: 'intro-sock-1', register: 'calm' },
    { id: 'intro-sock-2', register: 'calm' },
  ],
  spotHabitBox: [
    { id: 'intro-box-1', register: 'calm' },
    { id: 'intro-box-2', register: 'calm' },
  ],
  epithet: [
    { id: 'intro-epithet-1', register: 'calm' },
    { id: 'intro-epithet-2', register: 'calm' },
    { id: 'intro-epithet-3', register: 'calm' },
  ],
};

export type MatchCue =
  | 'tournamentOpen'
  | 'quickNext'
  | 'matchStart'
  | 'dodge'
  | 'dodgeStreak'
  | 'grab'
  | 'bingeGrab'
  | 'randomPick'
  | 'sniffDodge'
  | 'meltdown'
  | 'police'
  | 'overfullForfeit'
  | 'withdrawn'
  | 'tiebreak'
  | 'quickFinish'
  | 'longMatch'
  | 'winner'
  | 'comedown';

export const matchCueLines: Record<MatchCue, CommentaryLine[]> = {
  tournamentOpen: [
    { id: 'open-1', register: 'calm' },
    { id: 'open-2', register: 'calm' },
    { id: 'open-3', register: 'calm' },
    { id: 'open-4', register: 'calm' },
  ],
  quickNext: [
    { id: 'next-1', register: 'calm' },
    { id: 'next-2', register: 'calm' },
    { id: 'next-3', register: 'calm' },
    { id: 'next-4', register: 'calm' },
  ],
  matchStart: [
    { id: 'start-1', register: 'calm' },
    { id: 'start-2', register: 'calm' },
    { id: 'start-3', register: 'calm' },
    { id: 'start-4', register: 'calm' },
  ],
  dodge: [
    { id: 'dodge-1', register: 'hype' },
    { id: 'dodge-2', register: 'hype' },
    { id: 'dodge-3', register: 'calm' },
    { id: 'dodge-4', register: 'calm' },
    { id: 'dodge-5', register: 'hype' },
    { id: 'dodge-6', register: 'hype' },
    { id: 'dodge-7', register: 'calm' },
  ],
  dodgeStreak: [
    { id: 'dodgestreak-1', register: 'hype' },
    { id: 'dodgestreak-2', register: 'hype' },
    { id: 'dodgestreak-3', register: 'hype' },
    { id: 'dodgestreak-4', register: 'hype' },
    { id: 'dodgestreak-5', register: 'hype' },
  ],
  grab: [
    { id: 'grab-1', register: 'hype' },
    { id: 'grab-2', register: 'hype' },
    { id: 'grab-3', register: 'hype' },
    { id: 'grab-4', register: 'hype' },
    { id: 'grab-5', register: 'hype' },
    { id: 'grab-6', register: 'hype' },
  ],
  bingeGrab: [
    { id: 'binge-1', register: 'hype' },
    { id: 'binge-2', register: 'hype' },
    { id: 'binge-3', register: 'hype' },
  ],
  randomPick: [
    { id: 'random-1', register: 'calm' },
    { id: 'random-2', register: 'calm' },
    { id: 'random-3', register: 'calm' },
    { id: 'random-4', register: 'calm' },
  ],
  sniffDodge: [
    { id: 'sniff-1', register: 'hype' },
    { id: 'sniff-2', register: 'hype' },
    { id: 'sniff-3', register: 'hype' },
    { id: 'sniff-4', register: 'hype' },
    { id: 'sniff-5', register: 'hype' },
    { id: 'sniff-6', register: 'hype' },
  ],
  meltdown: [
    { id: 'meltdown-1', register: 'hype' },
    { id: 'meltdown-2', register: 'calm' },
    { id: 'meltdown-3', register: 'hype' },
    { id: 'meltdown-4', register: 'hype' },
  ],
  police: [
    { id: 'police-1', register: 'hype' },
    { id: 'police-2', register: 'hype' },
    { id: 'police-3', register: 'hype' },
    { id: 'police-4', register: 'hype' },
  ],
  overfullForfeit: [
    { id: 'overfull-1', register: 'hype' },
    { id: 'overfull-2', register: 'calm' },
    { id: 'overfull-3', register: 'calm' },
    { id: 'overfull-4', register: 'calm' },
  ],
  withdrawn: [
    { id: 'withdrawn-1', register: 'calm' },
    { id: 'withdrawn-2', register: 'calm' },
    { id: 'withdrawn-3', register: 'calm' },
  ],
  tiebreak: [
    { id: 'tiebreak-1', register: 'calm' },
    { id: 'tiebreak-2', register: 'calm' },
    { id: 'tiebreak-3', register: 'calm' },
    { id: 'tiebreak-4', register: 'calm' },
  ],
  quickFinish: [
    { id: 'quick-1', register: 'hype' },
    { id: 'quick-2', register: 'hype' },
    { id: 'quick-3', register: 'calm' },
    { id: 'quick-4', register: 'hype' },
  ],
  longMatch: [
    { id: 'long-1', register: 'calm' },
    { id: 'long-2', register: 'calm' },
    { id: 'long-3', register: 'calm' },
    { id: 'long-4', register: 'calm' },
  ],
  winner: [
    { id: 'winner-1', register: 'hype' },
    { id: 'winner-2', register: 'hype' },
    { id: 'winner-3', register: 'calm' },
    { id: 'winner-4', register: 'hype' },
  ],
  comedown: [
    { id: 'comedown-1', register: 'calm' },
    { id: 'comedown-2', register: 'calm' },
    { id: 'comedown-3', register: 'calm' },
    { id: 'comedown-4', register: 'calm' },
    { id: 'comedown-5', register: 'calm' },
  ],
};

// One pool per studio theme, indexed like GAMES_UI.cup.studio.themes:
// Frozen, Bloody, Summer, Eggplant
export const tournamentWeatherLines: CommentaryLine[][] = [
  [
    { id: 'weather-ledeno-1', register: 'calm' },
    { id: 'weather-ledeno-2', register: 'calm' },
    { id: 'weather-ledeno-3', register: 'calm' },
    { id: 'weather-ledeno-4', register: 'calm' },
  ],
  [
    { id: 'weather-krvavo-1', register: 'calm' },
    { id: 'weather-krvavo-2', register: 'calm' },
    { id: 'weather-krvavo-3', register: 'calm' },
    { id: 'weather-krvavo-4', register: 'calm' },
  ],
  [
    { id: 'weather-letnje-1', register: 'calm' },
    { id: 'weather-letnje-2', register: 'calm' },
    { id: 'weather-letnje-3', register: 'calm' },
    { id: 'weather-letnje-4', register: 'calm' },
  ],
  [
    { id: 'weather-patlidzan-1', register: 'calm' },
    { id: 'weather-patlidzan-2', register: 'calm' },
    { id: 'weather-patlidzan-3', register: 'calm' },
    { id: 'weather-patlidzan-4', register: 'calm' },
  ],
];

// The morning after the count: the first cup of a new government opens with
// a word on who runs the city now, in the booth's usual tone
export const electionIntroLines: Record<SponsorId, CommentaryLine[]> = {
  stranka: [
    { id: 'election-stranka-1', register: 'calm' },
    { id: 'election-stranka-2', register: 'calm' },
    { id: 'election-stranka-3', register: 'calm' },
  ],
  zidari: [
    { id: 'election-zidari-1', register: 'calm' },
    { id: 'election-zidari-2', register: 'calm' },
    { id: 'election-zidari-3', register: 'calm' },
  ],
  korporacija: [
    { id: 'election-korporacija-1', register: 'calm' },
    { id: 'election-korporacija-2', register: 'calm' },
    { id: 'election-korporacija-3', register: 'calm' },
  ],
  ostrvo: [
    { id: 'election-ostrvo-1', register: 'calm' },
    { id: 'election-ostrvo-2', register: 'calm' },
    { id: 'election-ostrvo-3', register: 'calm' },
  ],
};
