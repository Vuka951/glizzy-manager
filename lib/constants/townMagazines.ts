// The kiosk's covers per edition, in calendar order: Frozen, Eggplant,
// Summer, Bloody
export type TownCupCoverTheme = {
  sky: string;
  masthead: string;
  dateline: string;
  scrim: string;
  strip: string;
};

export const townCupCovers: TownCupCoverTheme[] = [
  {
    sky: 'bg-gradient-to-b from-[#081230] via-[#1a3c70] to-[#6f97c9]',
    masthead: 'text-[#e0f2fe] [text-shadow:0_2px_0_#1e3a8a,0_0_10px_rgb(125_211_252/0.7)]',
    dateline: 'text-[#bae6fd]',
    scrim: 'from-[#06122b]/90',
    strip: 'bg-[#e0f2fe] text-[#0c1f45]',
  },
  {
    sky: 'bg-gradient-to-b from-[#1c0b2e] via-[#4c1d5e] to-[#c0508f]',
    masthead: 'text-[#fbcfe8] [text-shadow:0_2px_0_#581c87,0_0_10px_rgb(244_114_182/0.7)]',
    dateline: 'text-[#f9a8d4]',
    scrim: 'from-[#1c0b2e]/90',
    strip: 'bg-[#f472b6] text-[#2e0b3d]',
  },
  {
    sky: 'bg-gradient-to-b from-[#fde68a] via-[#fb923c] to-[#c2410c]',
    masthead: 'text-[#ffffff] [text-shadow:0_2px_0_#9a3412,0_0_8px_rgb(154_52_18/0.5)]',
    dateline: 'text-[#7c2d12]',
    scrim: 'from-[#083344]/90',
    strip: 'bg-[#fde047] text-[#7c2d12]',
  },
  {
    sky: 'bg-gradient-to-b from-[#07060a] via-[#2a0a10] to-[#5c0f14]',
    masthead: 'text-[#fecaca] [text-shadow:0_2px_0_#7f1d1d,0_0_10px_rgb(239_68_68/0.8)]',
    dateline: 'text-[#fca5a5]',
    scrim: 'from-[#0a0204]/95',
    strip: 'bg-[#b91c1c] text-[#fee2e2]',
  },
];

export type TownGazetteCoverTheme = {
  paper: string;
  ribbon: string;
  rule: string;
  kicker: string;
};

export const townGazetteCovers: TownGazetteCoverTheme[] = [
  {
    paper: 'bg-[#f3f6fa]',
    ribbon: 'bg-[#1e3a8a] text-[#e0f2fe]',
    rule: 'border-[#1e3a8a]',
    kicker: 'text-[#1d4ed8]',
  },
  {
    paper: 'bg-[#fbf1f6]',
    ribbon: 'bg-[#6b21a8] text-[#fce7f3]',
    rule: 'border-[#6b21a8]',
    kicker: 'text-[#be185d]',
  },
  {
    paper: 'bg-[#fbf3dc]',
    ribbon: 'bg-[#ea580c] text-[#fff7ed]',
    rule: 'border-[#9a3412]',
    kicker: 'text-[#c2410c]',
  },
  {
    paper: 'bg-[#efe4d2]',
    ribbon: 'bg-[#7f1d1d] text-[#fee2e2]',
    rule: 'border-[#450a0a]',
    kicker: 'text-[#991b1b]',
  },
];

// Headline sizes by fit tier (see headlineTier), widest word first
export const CUP_HEADLINE_SIZES = [
  'text-[15cqw]',
  'text-[12.5cqw]',
  'text-[10cqw]',
  'text-[8cqw]',
] as const;

export const GAZETTE_HEADLINE_SIZES = [
  'text-[12.5cqw]',
  'text-[10.5cqw]',
  'text-[8.5cqw]',
  'text-[7cqw]',
] as const;
