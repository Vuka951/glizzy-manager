import type { Dictionary } from '@/data/games/locale';

export type CreatureToken = 'base' | 'light' | 'dark' | 'outline' | 'accent' | 'accentDark' | 'none';
export type CreaturePaint = CreatureToken | `#${string}`;

export type CreatureShape = {
  d: string;
  fill?: CreaturePaint;
  stroke?: CreaturePaint;
  width?: number;
  opacity?: number;
};

export type CreatureSignKey = keyof Dictionary['creatures']['signs'];

export type CreatureTone = {
  h: number;
  s: number;
  l: number;
  accent: readonly [number, number, number];
  // Which sign the label prints when the tone is a different product of the
  // same shape, a key of creatures.signs in the locales
  sign?: CreatureSignKey;
};

export type CreaturePattern = 'none' | 'drips' | 'zigzag' | 'woven';

export type CreatureGroup = 'table' | 'animal' | 'place' | 'thing';

export type CreatureSpeciesDef = {
  // Also the key of the species name under creatures.species in the locales
  id: keyof Dictionary['creatures']['species'];
  group: CreatureGroup;
  weight?: number;
  tones: readonly CreatureTone[];
  body: string;
  behind?: readonly CreatureShape[];
  marks?: readonly CreatureShape[];
  front?: readonly CreatureShape[];
  face: {
    x: number;
    eyeY: number;
    eyeGap: number;
    eyeR: number;
    mouthY: number;
    mouthW: number;
    // What an eyelid is painted with, for faces drawn on a label or on glass
    lid?: CreaturePaint;
    // Mouths, brows and whiskers default to black, or cream on a dark tone
    ink?: CreaturePaint;
  };
  seat: { x: number; y: number; w: number };
  neck: { y: number; w: number };
  // Printed on the object, so a jar is a jar of something
  sign?: { x: number; y: number; size: number; fill: CreaturePaint; key?: CreatureSignKey };
  // Things that have no neck take no necklace
  wearsNeck?: boolean;
  patterns?: readonly CreaturePattern[];
  side?: { x: number; y: number };
  iris?: CreaturePaint;
  // The species draws its own mouth (a beak, a firebox) or its own eyes
  fixedMouth?: boolean;
  fixedEyes?: boolean;
  noGear?: boolean;
  noEyewear?: boolean;
  excludeGear?: readonly string[];
  excludeScene?: readonly string[];
};
