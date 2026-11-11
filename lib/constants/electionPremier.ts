import type { SponsorId } from '@/lib/utils/careerSave';

// The premier beat's clock, from the moment it cuts in after the government.
// Cues: flash-barrage on riseMs, cymbal-crash and the cheer on landMs (only
// when the premier is the viewer's man), mic-tap on nameMs, a recorded clip
// on quoteMs
export const PREMIER_BEATS = {
  riseMs: 200,
  landMs: 700,
  nameMs: 900,
  quoteMs: 1700,
  totalMs: 2400,
};

// How long the government holds before the premier steps up
export const PREMIER_AFTER_GOVERNMENT_MS = 2600;

export const premierSounds = {
  flash: 0.6,
  crash: 1.2,
  mic: 0.8,
};

// The premier's broadcast line is one of these recordings, shown word for
// word from career.premier.quotes.cutscene under the same id. A clip naming a
// colour plays whenever the blamed list wears it, and never otherwise
export type PremierClip = {
  id: string;
  color: SponsorId | null;
};

export const premierClipSrc = (id: string): string => `/games/audio/premier/${id}.mp3`;

export const PREMIER_CLIPS: PremierClip[] = [
  { id: 'blame-yellow-3', color: 'yellow' },
  { id: 'no-money', color: null },
  { id: 'worst-government', color: null },
  { id: 'laugh-at-me', color: null },
  { id: 'lazy-and-useless', color: null },
  { id: 'live-for-numbers', color: null },
  { id: 'dont-worry-im-here', color: null },
];
