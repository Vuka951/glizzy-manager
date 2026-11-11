import { CREATURE_SPECIES } from '@/lib/constants/creatures/creatureSpecies';
import { INK } from '@/lib/constants/creatures/ink';
import type {
  CreaturePaint,
  CreaturePattern,
  CreatureSignKey,
  CreatureSpeciesDef,
} from '@/lib/types/creature';
import { seededRandom, textHash } from '@/lib/utils/seededRandom';

export type { CreaturePattern };

export type CreatureEyes = 'round' | 'dot' | 'sleepy' | 'angry' | 'happy';
export type CreatureBrows = 'none' | 'thick' | 'unibrow';
export type CreatureMouth = 'grin' | 'smirk' | 'flat' | 'o' | 'tusks' | 'gap';
export type CreatureMustache = 'none' | 'brush' | 'handlebar' | 'walrus';
export type CreatureGear =
  | 'none'
  | 'hat'
  | 'sock'
  | 'box'
  | 'egg'
  | 'crown'
  | 'fieldCap'
  | 'furHat'
  | 'scarf'
  | 'beanie';
export type CreatureEyewear = 'none' | 'sunglasses' | 'specs';
export type CreatureMouthItem = 'none' | 'glizzy' | 'toothpick';
export type CreatureNeckwear = 'none' | 'chain' | 'garland' | 'medal' | 'wovenScarf';
export type CreatureSideProp = 'none' | 'eggplant' | 'fly';
export type CreatureBlush = 'none' | 'soft' | 'flush';
export type CreatureScene =
  | 'plain'
  | 'tower'
  | 'gorge'
  | 'bridge'
  | 'peaks'
  | 'sun'
  | 'woven'
  | 'tablecloth'
  | 'peppers'
  | 'grill'
  | 'night';
export type CreatureRareTrait = 'none' | 'freckle' | 'scar' | 'plaster' | 'goldTooth' | 'stubble';

export type CreatureColors = {
  base: string;
  light: string;
  dark: string;
  outline: string;
  accent: string;
  accentDark: string;
};

export type CreatureDot = { cx: number; cy: number; r: number };

export type CreatureSpec = {
  id: string;
  species: CreatureSpeciesDef;
  colors: CreatureColors;
  ink: string;
  signKey: CreatureSignKey | null;
  scene: CreatureScene;
  sceneTint: number;
  sceneDots: CreatureDot[];
  pattern: CreaturePattern;
  drips: { x: number; length: number }[];
  eyes: CreatureEyes;
  gaze: number;
  brows: CreatureBrows;
  browTilt: number;
  mouth: CreatureMouth | null;
  mustache: CreatureMustache;
  gear: CreatureGear;
  gearTilt: number;
  // Hats need headroom, so a hatted creature shrinks toward the bottom of the disc
  shrink: number;
  eyewear: CreatureEyewear;
  mouthItem: CreatureMouthItem;
  neckwear: CreatureNeckwear;
  sideProp: CreatureSideProp;
  blush: CreatureBlush;
  sheen: boolean;
  rare: CreatureRareTrait;
};

// A dark body on these would melt into the disc
const DARK_SCENES: readonly CreatureScene[] = ['plain', 'night', 'grill', 'tower'];

const GEAR_HEIGHT: Record<CreatureGear, number> = {
  none: 0,
  hat: 22,
  sock: 18,
  box: 22,
  egg: 18,
  crown: 16,
  fieldCap: 14,
  furHat: 20,
  scarf: 12,
  beanie: 22,
};

function pick<T>(roll: () => number, options: readonly T[]): T {
  return options[Math.floor(roll() * options.length)];
}

function weighted<T>(roll: () => number, entries: readonly (readonly [T, number])[]): T {
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let cursor = roll() * total;
  for (const [value, weight] of entries) {
    cursor -= weight;
    if (cursor < 0) return value;
  }
  return entries[entries.length - 1][0];
}

function between(roll: () => number, min: number, max: number): number {
  return min + roll() * (max - min);
}

function hsl(h: number, s: number, l: number): string {
  const clamp = (n: number) => Math.round(Math.min(100, Math.max(0, n)));
  return `hsl(${Math.round((h + 360) % 360)} ${clamp(s)}% ${clamp(l)}%)`;
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

export function creaturePaint(colors: CreatureColors, paint: CreaturePaint): string {
  if (paint === 'none' || paint.startsWith('#')) return paint;
  return colors[paint as keyof CreatureColors];
}

// Every avatar on a page asks for its spec on every render, so the few
// names in play are kept around instead of being rolled again
const SPEC_CACHE = new Map<string, CreatureSpec>();
const SPEC_CACHE_LIMIT = 512;

export function creatureSpec(name: string): CreatureSpec {
  const cached = SPEC_CACHE.get(name);
  if (cached) return cached;
  if (SPEC_CACHE.size >= SPEC_CACHE_LIMIT) SPEC_CACHE.clear();
  const spec = buildSpec(name);
  SPEC_CACHE.set(name, spec);
  return spec;
}

function buildSpec(name: string): CreatureSpec {
  const hash = textHash(name.trim().toLowerCase().normalize('NFC'));
  const roll = seededRandom(hash);

  const species = weighted(
    roll,
    CREATURE_SPECIES.map((entry) => [entry, entry.weight ?? 10] as const),
  );
  const tone = pick(roll, species.tones);
  const hue = tone.h + between(roll, -5, 5);
  const sat = tone.s + between(roll, -4, 4);
  const light = tone.l + between(roll, -3, 3);
  const [accentH, accentS, accentL] = tone.accent;
  const colors: CreatureColors = {
    base: hsl(hue, sat, light),
    light: hsl(hue, sat - 6, light + 14),
    dark: hsl(hue, sat + 2, light - 14),
    outline: hsl(hue, sat * 0.6, Math.max(9, Math.min(20, light - 30))),
    accent: hsl(accentH, accentS, accentL),
    accentDark: hsl(accentH, accentS - 8, Math.max(12, accentL - 26)),
  };
  const isDark = tone.l < 38;
  const ink = creaturePaint(colors, species.face.ink ?? (isDark ? INK.cream : INK.black));

  const scene = weighted<CreatureScene>(
    roll,
    (
      [
        ['plain', 18],
        ['tower', 10],
        ['gorge', 10],
        ['bridge', 8],
        ['peaks', 10],
        ['sun', 10],
        ['woven', 12],
        ['tablecloth', 12],
        ['peppers', 10],
        ['grill', 10],
        ['night', 10],
      ] as const
    ).filter(
      ([entry]) =>
        !species.excludeScene?.includes(entry) && !(tone.l < 34 && DARK_SCENES.includes(entry)),
    ),
  );
  const sceneTint = Math.floor(roll() * 5);
  const sceneDots: CreatureDot[] = [];
  const dotCount = 9 + Math.floor(roll() * 5);
  for (let i = 0; i < dotCount; i += 1) {
    sceneDots.push({
      cx: round(between(roll, 4, 96)),
      cy: round(between(roll, 4, 60)),
      r: round(between(roll, 0.7, 1.7)),
    });
  }

  const pattern: CreaturePattern =
    species.patterns && roll() < 0.5 ? pick(roll, species.patterns) : 'none';
  const { face, seat } = species;
  const drips: { x: number; length: number }[] = [];
  if (pattern === 'drips') {
    const count = 4 + Math.floor(roll() * 3);
    for (let i = 0; i < count; i += 1) {
      drips.push({
        x: round(face.x - 26 + (52 * (i + between(roll, 0.2, 0.8))) / count),
        length: round(between(roll, 5, 15)),
      });
    }
  }

  const rolledEyes = weighted<CreatureEyes>(roll, [
    ['round', 34],
    ['dot', 18],
    ['sleepy', 22],
    ['angry', 18],
    ['happy', 8],
  ]);
  const eyes: CreatureEyes = rolledEyes === 'dot' && ink !== INK.black ? 'round' : rolledEyes;
  const gaze = between(roll, -0.3, 0.3);
  const brows = weighted<CreatureBrows>(roll, [
    ['none', 52],
    ['thick', 36],
    ['unibrow', 12],
  ]);
  const browTilt = between(roll, -14, 14);

  const mouth = species.fixedMouth
    ? null
    : weighted<CreatureMouth>(roll, [
        ['grin', 28],
        ['smirk', 24],
        ['flat', 20],
        ['o', 10],
        ['tusks', species.group === 'animal' ? 12 : 0],
        ['gap', 14],
      ]);
  const mustache = species.fixedMouth
    ? 'none'
    : weighted<CreatureMustache>(roll, [
        ['none', 72],
        ['brush', 10],
        ['handlebar', 10],
        ['walrus', 8],
      ]);

  const rolledGear = weighted<CreatureGear>(roll, [
    ['none', 30],
    ['hat', 9],
    ['sock', 8],
    ['box', 6],
    ['egg', 3],
    ['crown', 2],
    ['fieldCap', 12],
    ['furHat', 8],
    ['scarf', 8],
    ['beanie', 8],
  ]);
  const gear: CreatureGear =
    species.noGear || species.excludeGear?.includes(rolledGear) ? 'none' : rolledGear;
  const gearTilt = round(between(roll, -9, 9));
  const gearScale = Math.max(0.6, Math.min(1.15, seat.w / 36));
  const gearTop = seat.y - GEAR_HEIGHT[gear] * gearScale;
  const shrink = gear !== 'none' && gearTop < 5 ? round((95 / (100 - gearTop)) * 100) / 100 : 1;

  // One extra next to the head gear, so what the creature is stays the first
  // thing the eye reads
  let extras = 0;
  const spend = <T extends string>(value: T): T | 'none' => {
    if (value === 'none') return 'none';
    if (extras >= 1) return 'none';
    extras += 1;
    return value;
  };
  const eyewear = species.noEyewear
    ? 'none'
    : spend(
        weighted<CreatureEyewear>(roll, [
          ['none', 80],
          ['sunglasses', 12],
          ['specs', 8],
        ]),
      );
  const mouthItem = species.fixedMouth
    ? 'none'
    : spend(
        weighted<CreatureMouthItem>(roll, [
          ['none', 70],
          ['glizzy', 12],
          ['toothpick', 10],
        ]),
      );
  const rolledNeckwear = weighted<CreatureNeckwear>(roll, [
    ['none', 70],
    ['chain', 10],
    ['garland', 8],
    ['medal', 3],
    ['wovenScarf', 9],
  ]);
  const neckwear = species.wearsNeck ? spend(rolledNeckwear) : 'none';
  const sideProp = spend(
    weighted<CreatureSideProp>(roll, [
      ['none', 76],
      ['eggplant', 8],
      ['fly', 8],
    ]),
  );
  const blush = weighted<CreatureBlush>(roll, [
    ['none', 60],
    ['soft', 22],
    ['flush', 18],
  ]);
  const sheen = roll() < 0.18;
  const rare = weighted<CreatureRareTrait>(roll, [
    ['none', 80],
    ['freckle', 4],
    ['scar', 4],
    ['plaster', 3],
    ['goldTooth', species.fixedMouth ? 0 : 6],
    ['stubble', species.fixedMouth ? 0 : 7],
  ]);

  return {
    id: `cr${hash.toString(36)}`,
    species,
    colors,
    ink,
    signKey: tone.sign ?? species.sign?.key ?? null,
    scene,
    sceneTint,
    sceneDots,
    pattern,
    drips,
    eyes,
    gaze: round(gaze * 10) / 10,
    brows,
    browTilt: round(browTilt),
    mouth,
    mustache,
    gear,
    gearTilt,
    shrink,
    eyewear,
    mouthItem,
    neckwear,
    sideProp,
    blush,
    sheen,
    rare,
  };
}

// One deterministic syllable walk, done once on first use, records the first
// name that lands on each species, so a preview can show every species
// without hand-picking names
const WALK_SYLLABLES = ['ba', 'ce', 'či', 'do', 'đu', 'ga', 'ja', 'ko', 'lu', 'mi', 'ne', 'pa', 'ra', 'so', 'šu', 'ta', 'vi', 'za', 'žo', 'ki'];
const WALK_LIMIT = 8000;

let namesBySpecies: Map<string, string> | null = null;

function walkSpeciesNames(): Map<string, string> {
  const found = new Map<string, string>();
  for (let i = 0; i < WALK_LIMIT && found.size < CREATURE_SPECIES.length; i += 1) {
    const first = WALK_SYLLABLES[i % 20];
    const second = WALK_SYLLABLES[Math.floor(i / 20) % 20];
    const third = WALK_SYLLABLES[Math.floor(i / 400) % 20];
    const candidate = `${first.charAt(0).toUpperCase()}${first.slice(1)}${second}${third}`;
    const id = buildSpec(candidate).species.id;
    if (!found.has(id)) found.set(id, candidate);
  }
  return found;
}

export function creatureNameForSpecies(speciesId: string): string | null {
  namesBySpecies ??= walkSpeciesNames();
  return namesBySpecies.get(speciesId) ?? null;
}
