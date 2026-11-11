import { INK } from '@/lib/constants/creatures/ink';
import type { CreatureSpeciesDef } from '@/lib/types/creature';
import { ovalPath } from '@/lib/utils/svgPaths';

const STONE_CRACKS = 'M 44 96 L 49 86 L 42 80 L 48 72 M 88 58 L 77 62 L 80 71 L 70 75 M 12 52 L 23 56 L 20 65 L 29 70 M 56 18 L 58 27 L 66 30';

// The ground itself: the tower nobody finished, the snow above the mines, a
// warm stone from those mines and the fog of the gorge
export const placeSpecies: readonly CreatureSpeciesDef[] = [
  {
    id: 'tower',
    group: 'place',
    noGear: true,
    excludeScene: ['tower'],
    tones: [
      { h: 38, s: 18, l: 62, accent: [28, 40, 40] },
      { h: 26, s: 16, l: 48, accent: [28, 40, 40] },
    ],
    behind: [
      { d: 'M 66 32 L 66 8 M 72 34 L 72 14 M 78 40 L 78 18', fill: 'none', stroke: INK.steelDark, width: 2 },
      { d: 'M 60 14 L 86 14', fill: 'none', stroke: 'accent', width: 3 },
    ],
    body: 'M 22 30 L 22 16 L 33 16 L 33 26 L 43 26 L 43 16 L 54 16 L 54 28 L 62 28 L 62 34 L 70 31 L 78 42 L 78 100 L 22 100 Z',
    marks: [
      { d: 'M 22 40 L 78 40 M 22 76 L 78 76 M 22 88 L 78 88 M 36 30 L 36 40 M 58 30 L 58 40 M 30 76 L 30 88 M 52 76 L 52 88 M 68 76 L 68 88 M 42 88 L 42 100 M 60 88 L 60 100', fill: 'none', stroke: 'dark', width: 1.5, opacity: 0.7 },
    ],
    face: { x: 50, eyeY: 52, eyeGap: 12, eyeR: 6, mouthY: 68, mouthW: 16 },
    seat: { x: 44, y: 18, w: 36 },
    neck: { y: 82, w: 34 },
  },
  {
    id: 'mountain',
    group: 'place',
    noGear: true,
    excludeScene: ['peaks'],
    tones: [
      { h: 214, s: 20, l: 42, accent: [146, 34, 26] },
      { h: 158, s: 22, l: 32, accent: [146, 34, 20] },
    ],
    body: 'M 50 8 L 64 32 L 70 26 L 98 84 L 98 104 L 2 104 L 2 84 L 32 36 L 39 42 Z',
    marks: [
      { d: 'M 50 8 L 64 32 L 70 26 L 78 42 L 70 40 L 63 46 L 56 38 L 49 46 L 42 38 L 33 46 L 27 42 L 39 42 Z', fill: INK.white, stroke: 'none' },
      { d: 'M 2 90 L 10 78 L 18 90 L 26 80 L 34 90 L 42 84 L 50 92 L 58 84 L 66 90 L 74 80 L 82 90 L 90 78 L 98 90 L 98 104 L 2 104 Z', fill: 'accent', stroke: 'none' },
    ],
    face: { x: 50, eyeY: 58, eyeGap: 13, eyeR: 6.2, mouthY: 74, mouthW: 18 },
    seat: { x: 50, y: 13, w: 22 },
    neck: { y: 88, w: 40 },
  },
  {
    id: 'stone',
    group: 'place',
    iris: INK.ember,
    tones: [
      { h: 24, s: 18, l: 30, accent: [28, 96, 56] },
      { h: 8, s: 14, l: 24, accent: [38, 96, 58] },
    ],
    body: 'M 28 30 L 56 18 L 80 32 L 88 58 L 75 86 L 44 96 L 18 82 L 12 52 Z',
    marks: [
      { d: 'M 28 30 L 42 40 L 56 18 M 42 40 L 12 52 M 80 32 L 66 40 L 56 18 M 66 40 L 88 58 M 18 82 L 28 66 L 12 52 M 75 86 L 72 68 L 88 58', fill: 'none', stroke: 'light', width: 1.6, opacity: 0.45 },
      { d: STONE_CRACKS, fill: 'none', stroke: 'accent', width: 3.6 },
      { d: STONE_CRACKS, fill: 'none', stroke: INK.ember, width: 1.3 },
    ],
    face: { x: 50, eyeY: 47, eyeGap: 12, eyeR: 6, mouthY: 62, mouthW: 15 },
    seat: { x: 52, y: 21, w: 34 },
    neck: { y: 80, w: 30 },
  },
  {
    id: 'fog',
    group: 'place',
    tones: [
      { h: 140, s: 26, l: 72, accent: [130, 36, 46] },
      { h: 190, s: 14, l: 80, accent: [130, 30, 46] },
    ],
    behind: [
      { d: 'M 30 78 C 34 88 48 84 52 92 M 56 80 C 60 90 74 86 70 96', fill: 'none', stroke: 'base', width: 5, opacity: 0.8 },
    ],
    body: 'M 28 58 C 14 56 10 40 22 34 C 22 20 38 16 44 24 C 50 12 72 14 72 30 C 86 28 92 46 80 54 C 92 62 84 78 72 74 C 68 86 52 88 46 78 C 38 86 22 82 24 70 C 18 68 20 60 28 58 Z',
    marks: [
      { d: 'M 22 40 C 30 34 34 42 28 46 M 70 32 C 62 30 60 38 66 40 M 74 62 C 66 60 64 68 70 70', fill: 'none', stroke: 'accent', width: 2.2, opacity: 0.6 },
      { d: ovalPath(34, 30, 8, 4), fill: INK.white, stroke: 'none', opacity: 0.5 },
    ],
    face: { x: 50, eyeY: 44, eyeGap: 11, eyeR: 5.6, mouthY: 60, mouthW: 14 },
    seat: { x: 50, y: 20, w: 30 },
    neck: { y: 70, w: 30 },
  },
];
