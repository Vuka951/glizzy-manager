import type { TownLayoutKey } from '@/lib/constants/townLayout';

export const TOWN_EDITION_COUNT = 4;

// Calendar order: Frozen, Eggplant, Summer, Bloody
export const townEditionIndex = (season: number) =>
  ((season % TOWN_EDITION_COUNT) + TOWN_EDITION_COUNT) % TOWN_EDITION_COUNT;

export type TownForestShape = 'pine' | 'blossom' | 'mixed' | 'autumn';

// One edition's palette for the shared night scene: sky, far layers and ground
export type TownEditionPalette = {
  sky: string[];
  glow: string;
  far: string;
  near: string;
  forest: string;
  forestBack: string;
  forestShape: TownForestShape;
  // Blossom, leaf or rim-light specks on the far tree line
  forestSpeck: string;
  cloud: string;
  bird: string;
  groundTop: string;
  groundBottom: string;
  road: string;
  roadStroke: string;
  walk: string;
  walkStroke: string;
  line: string;
  lineStroke: string;
  square: string;
  water: string;
  waterGlint: string;
  edge: string;
  shade: string;
};

export const townEditions: TownEditionPalette[] = [
  {
    sky: ['#081230', '#14305e', '#3d6496'],
    glow: '#bae6fd',
    far: 'fill-[#2b4170]',
    near: 'fill-[#4d6898]',
    forest: 'fill-[#10303a]',
    forestBack: 'fill-[#1b3b4b]',
    forestShape: 'pine',
    forestSpeck: 'fill-slate-100/80',
    cloud: 'fill-[#3a5180]/70',
    bird: 'stroke-slate-200/70',
    groundTop: '#9db3d6',
    groundBottom: '#435a89',
    road: 'fill-[#3a435d]',
    roadStroke: 'stroke-[#3a435d]',
    walk: 'fill-[#b4c4dd]',
    walkStroke: 'stroke-[#b4c4dd]',
    line: 'fill-[#e2e8f0]',
    lineStroke: 'stroke-[#e2e8f0]',
    square: 'fill-[#8195b9]',
    water: 'fill-[#a9c8e6]',
    waterGlint: 'stroke-white/70',
    edge: 'stroke-[#e8f0fb]',
    shade: 'fill-[#2a3a63]',
  },
  {
    sky: ['#140d36', '#3a2768', '#83508f'],
    glow: '#f9a8d4',
    far: 'fill-[#3b2b6a]',
    near: 'fill-[#4c3174]',
    forest: 'fill-[#8a4590]',
    forestBack: 'fill-[#5f3580]',
    forestShape: 'blossom',
    forestSpeck: 'fill-[#ffd3ec]/80',
    cloud: 'fill-[#b07cc0]/45',
    bird: 'stroke-slate-200',
    groundTop: '#2f6b58',
    groundBottom: '#1a3242',
    road: 'fill-[#2e2a40]',
    roadStroke: 'stroke-[#2e2a40]',
    walk: 'fill-[#6e6688]',
    walkStroke: 'stroke-[#6e6688]',
    line: 'fill-[#f3e8ff]',
    lineStroke: 'stroke-[#f3e8ff]',
    square: 'fill-[#665d82]',
    water: 'fill-[#4b3f8a]',
    waterGlint: 'stroke-pink-200/45',
    edge: 'stroke-[#6fbf90]',
    shade: 'fill-[#1a283a]',
  },
  {
    sky: ['#0a1738', '#3a3b68', '#c0694a', '#f2b862'],
    glow: '#f4b74a',
    far: 'fill-[#584272]',
    near: 'fill-[#3c4a3e]',
    forest: 'fill-[#2c5a32]',
    forestBack: 'fill-[#22432b]',
    forestShape: 'mixed',
    forestSpeck: 'fill-[#f2c46a]/50',
    cloud: 'fill-[#d99a91]/40',
    bird: 'stroke-stone-900',
    groundTop: '#4f8237',
    groundBottom: '#1f3f22',
    road: 'fill-[#35322d]',
    roadStroke: 'stroke-[#35322d]',
    walk: 'fill-[#a58f66]',
    walkStroke: 'stroke-[#a58f66]',
    line: 'fill-[#f1e7d0]',
    lineStroke: 'stroke-[#f1e7d0]',
    square: 'fill-[#9a8664]',
    water: 'fill-[#2f6f86]',
    waterGlint: 'stroke-amber-200/55',
    edge: 'stroke-[#e8c15a]',
    shade: 'fill-[#1a3320]',
  },
  {
    sky: ['#0f1229', '#33223d', '#93402c'],
    glow: '#ef4444',
    far: 'fill-[#2c1f3a]',
    near: 'fill-[#3d1d2b]',
    forest: 'fill-[#7a2a1f]',
    forestBack: 'fill-[#521d26]',
    forestShape: 'autumn',
    forestSpeck: 'fill-[#e0802f]/80',
    cloud: 'fill-[#241a30]/90',
    bird: 'stroke-[#0b0908]',
    groundTop: '#5c2b1f',
    groundBottom: '#2a1219',
    road: 'fill-[#2b2427]',
    roadStroke: 'stroke-[#2b2427]',
    walk: 'fill-[#6b5048]',
    walkStroke: 'stroke-[#6b5048]',
    line: 'fill-[#e7dcc0]',
    lineStroke: 'stroke-[#e7dcc0]',
    square: 'fill-[#62504a]',
    water: 'fill-[#3b2034]',
    waterGlint: 'stroke-orange-200/35',
    edge: 'stroke-[#b4532a]',
    shade: 'fill-[#26121d]',
  },
];

// x, base y, scale, variant: every tree or accent stands with its base on
// the grass at that point, in canvas pixels
export type TownSceneryItem = [number, number, number, number];

export type TownSceneryPlacement = {
  trees: TownSceneryItem[];
  accents: TownSceneryItem[];
};

// Trees on the town canvas only stand where every building that overlaps
// them stands further forward, so drawing them under the buildings is
// still the right depth
export const townScenery: Record<TownLayoutKey, TownSceneryPlacement> = {
  desk: {
    trees: [
      [-660, 384, 0.68, 0],
      [-575, 378, 0.56, 1],
      [-490, 386, 0.74, 2],
      [-400, 380, 0.62, 0],
      [-315, 384, 0.68, 1],
      [-230, 378, 0.56, 2],
      [-150, 386, 0.74, 0],
      [-70, 382, 0.62, 1],
      [204, 384, 0.62, 2],
      [300, 380, 0.71, 0],
      [636, 386, 0.56, 1],
      [792, 380, 0.68, 2],
      [935, 382, 0.62, 0],
      [1060, 384, 0.71, 1],
      [1145, 378, 0.59, 2],
      [1230, 386, 0.74, 0],
      [1320, 380, 0.62, 1],
      [1410, 384, 0.68, 2],
      [1500, 378, 0.56, 0],
      [1590, 386, 0.71, 1],
      [1680, 382, 0.62, 2],
      [-60, 640, 0.68, 2],
      [-180, 650, 0.75, 0],
      [-300, 642, 0.65, 1],
      [-430, 650, 0.71, 2],
      [-560, 642, 0.68, 0],
      [420, 654, 0.5, 1],
      [614, 648, 0.54, 0],
    ],
    accents: [
      [282, 658, 0.85, 0],
      [530, 656, 0.77, 1],
      [470, 604, 0.64, 2],
      [-120, 600, 0.85, 1],
      [-370, 612, 0.85, 0],
      [-250, 394, 0.77, 2],
      [1100, 394, 0.77, 1],
      [1290, 398, 0.85, 0],
    ],
  },
  phone: {
    trees: [
      [-620, 352, 0.6, 0],
      [-530, 348, 0.51, 1],
      [-440, 354, 0.63, 2],
      [-350, 350, 0.54, 0],
      [-260, 354, 0.6, 1],
      [-170, 348, 0.51, 2],
      [-90, 352, 0.57, 0],
      [-25, 350, 0.48, 1],
      [40, 350, 0.48, 2],
      [150, 348, 0.51, 0],
      [226, 352, 0.42, 1],
      [334, 354, 0.45, 2],
      [420, 354, 0.54, 0],
      [500, 350, 0.51, 1],
      [590, 354, 0.6, 2],
      [680, 350, 0.54, 0],
      [770, 354, 0.6, 1],
      [860, 350, 0.51, 2],
      [950, 354, 0.6, 0],
      [1040, 350, 0.54, 1],
      [24, 764, 0.49, 0],
      [118, 806, 0.6, 1],
      [300, 774, 0.54, 2],
      [374, 812, 0.6, 0],
      [-60, 784, 0.54, 1],
      [-150, 752, 0.49, 2],
      [452, 784, 0.54, 1],
      [540, 760, 0.49, 2],
    ],
    accents: [
      [206, 796, 0.85, 0],
      [250, 728, 0.68, 1],
      [130, 705, 0.68, 2],
      [28, 414, 0.47, 1],
      [372, 416, 0.47, 2],
    ],
  },
};

// The backdrop keeps its middle calm for the screen on top: trees stand at
// the sides and props in the foreground strip. x is a fraction of the shown
// width, the rest is as in TownSceneryItem
export type TownBackdropPlacement = {
  trees: TownSceneryItem[];
  accents: TownSceneryItem[];
  toy: [number, number, number];
};

export const townBackdropScenery: Record<TownLayoutKey, TownBackdropPlacement> = {
  desk: {
    trees: [
      [0.02, 384, 0.6, 1],
      [0.09, 380, 0.5, 2],
      [0.17, 386, 0.5, 0],
      [0.83, 386, 0.5, 1],
      [0.91, 380, 0.5, 0],
      [0.98, 384, 0.6, 2],
      [0.03, 500, 0.9, 0],
      [0.1, 480, 0.7, 1],
      [0.17, 494, 0.62, 2],
      [0.83, 494, 0.62, 0],
      [0.9, 480, 0.7, 2],
      [0.97, 500, 0.9, 1],
    ],
    accents: [
      [0.1, 594, 0.85, 0],
      [0.38, 596, 0.7, 1],
      [0.63, 594, 0.7, 2],
      [0.9, 592, 0.85, 0],
    ],
    toy: [0.22, 500, 0.6],
  },
  phone: {
    trees: [
      [0.01, 352, 0.45, 1],
      [0.13, 350, 0.38, 2],
      [0.87, 350, 0.38, 0],
      [0.99, 352, 0.45, 2],
      [0.03, 498, 0.6, 0],
      [0.97, 498, 0.6, 1],
      [0.1, 466, 0.42, 2],
      [0.9, 466, 0.42, 0],
    ],
    accents: [
      [0.22, 592, 0.6, 1],
      [0.78, 592, 0.6, 0],
    ],
    toy: [0.17, 500, 0.42],
  },
};

// How the backdrop frames the scene: the horizon and the lowest line it
// shows, the centre it keeps in view, and how far the art reaches sideways
export const townSceneryFrame: Record<
  TownLayoutKey,
  { horizon: number; bottom: number; centre: number; left: number; right: number; top: number; minWidth: number }
> = {
  desk: { horizon: 366, bottom: 600, centre: 500, left: -700, right: 1700, top: -700, minWidth: 520 },
  phone: { horizon: 334, bottom: 600, centre: 195, left: -700, right: 1090, top: -700, minWidth: 260 },
};

export type TownSkyGeometry = {
  w: number;
  horizon: number;
  // Feature scale: the phone draws hills, trees and moons smaller
  s: number;
  frame: string;
  viewBox: string;
  bottom: number;
  moon: [number, number, number];
  sun: [number, number, number];
  lake: [number, number];
  sail: [number, number];
  lights: number[];
  forest: [number, number][];
  clouds: [number, number, number][];
  meteors: [number, number][];
  crows: [number, number][];
  swallows: [number, number][];
};

// Drawn in canvas pixels and reaching 700px past every edge but the ground,
// so a stage wider or taller than the canvas never shows where the sky ends
export const townSkyGeometry: Record<TownLayoutKey, TownSkyGeometry> = {
  desk: {
    w: 1000,
    horizon: 366,
    s: 1,
    frame: 'left-[-700px] top-[-700px] h-[1130px] w-[2400px]',
    viewBox: '-700 -700 2400 1130',
    bottom: 430,
    moon: [170, 140, 36],
    sun: [190, 262, 46],
    lake: [790, 1700],
    sail: [846, 130],
    lights: [-430, 566, 716, 1240],
    forest: [
      [-700, 300],
      [850, 1700],
    ],
    clouds: [
      [140, 70, 1],
      [470, 110, 0.8],
      [780, 70, 1.1],
      [930, 170, 0.7],
      [-380, 120, 0.9],
      [1300, 90, 1],
      [1560, 180, 0.8],
      [300, -160, 1.2],
      [820, -300, 1],
      [-200, -420, 1.1],
      [1200, -520, 0.9],
    ],
    meteors: [
      [660, 60],
      [330, -60],
    ],
    crows: [
      [60, 196],
      [300, 178],
      [880, 214],
    ],
    swallows: [
      [520, 170],
      [600, 210],
      [820, 160],
    ],
  },
  phone: {
    w: 390,
    horizon: 334,
    s: 0.8,
    frame: 'left-[-700px] top-[-700px] h-[1100px] w-[1790px]',
    viewBox: '-700 -700 1790 1100',
    bottom: 400,
    moon: [150, 118, 30],
    sun: [110, 250, 36],
    lake: [300, 1090],
    sail: [314, 46],
    lights: [-380, 250, 330, 760],
    forest: [
      [-700, 96],
      [300, 1090],
    ],
    clouds: [
      [60, 60, 0.7],
      [250, 108, 0.6],
      [360, 40, 0.8],
      [-260, 90, 0.7],
      [620, 130, 0.7],
      [160, -180, 0.9],
      [-140, -400, 0.8],
      [520, -350, 0.9],
    ],
    meteors: [
      [300, 50],
      [150, -60],
    ],
    crows: [
      [40, 190],
      [250, 176],
      [330, 214],
    ],
    swallows: [
      [180, 170],
      [250, 200],
      [60, 160],
    ],
  },
};

export type TownGroundShape = {
  frame: string;
  viewBox: string;
  bottom: number;
  horizon: string;
  square: string;
  plaza: [number, number, number, number];
  walk: [number, number];
  road: [number, number];
  centre: number;
  dash: string;
  zebra: [number, number, number, number, number];
  front: [number, number];
  shade: string;
  water: string;
  shore: string;
  shimmer: string[];
  tile: [number, number];
  // Small seasonal details on the grass: x, y, scale
  tufts: [number, number, number][];
};

// Canvas pixels, reaching 700px past both sides so a wide stage never shows
// where the town ends
export const townGroundShape: Record<TownLayoutKey, TownGroundShape> = {
  desk: {
    frame: 'left-[-700px] top-0 h-[700px] w-[2400px]',
    viewBox: '-700 0 2400 700',
    bottom: 700,
    horizon:
      'M-700 362C-480 352 -220 374 -10 368C150 350 300 374 470 362S820 348 1010 366C1200 382 1460 352 1700 362',
    square: 'M372 378H628L690 494H310Z',
    plaza: [500, 474, 74, 15],
    walk: [494, 506],
    road: [506, 552],
    centre: 529,
    dash: '22 18',
    zebra: [476, 508, 48, 42, 5],
    front: [552, 562],
    shade: 'M-700 640C-400 626 -100 646 200 634S420 646 640 636S900 628 1010 640C1200 652 1460 630 1700 640V700H-700Z',
    water:
      'M780 700C788 668 812 640 842 630S930 618 990 612C1200 596 1460 606 1700 598V700Z',
    shore: 'M780 700C788 668 812 640 842 630S930 618 990 612C1200 596 1460 606 1700 598',
    shimmer: [
      'M830 652q30-4 60 0M900 638q40-4 80 0M860 668q40-4 90 0',
      'M1010 628q40-4 80 0M960 684q50-4 100 0M1120 650q40-4 90 0',
    ],
    tile: [14, 8],
    tufts: [
      [60, 400, 1],
      [180, 384, 0.8],
      [270, 420, 1.1],
      [740, 404, 0.9],
      [880, 390, 1],
      [960, 430, 0.8],
      [-200, 410, 1],
      [1180, 420, 1],
      [330, 598, 1],
      [540, 610, 0.9],
      [790, 590, 1],
      [600, 652, 0.8],
    ],
  },
  phone: {
    frame: 'left-[-700px] top-0 h-[860px] w-[1790px]',
    viewBox: '-700 0 1790 860',
    bottom: 860,
    horizon:
      'M-700 330C-460 322 -200 344 -10 336C80 322 180 346 260 334S360 326 400 336C600 346 860 324 1090 334',
    square: 'M96 370H236L262 506H70Z',
    plaza: [204, 410, 40, 9],
    walk: [506, 514],
    road: [514, 552],
    centre: 533,
    dash: '16 12',
    zebra: [179, 516, 36, 34, 4],
    front: [552, 560],
    shade: 'M-700 720C-400 710 -100 730 120 716S260 728 400 714C600 704 860 724 1090 714V860H-700Z',
    water:
      'M262 372C320 362 370 368 400 364C600 356 860 368 1090 360V392C860 398 600 390 400 390C370 394 320 394 262 388Q250 380 262 372Z',
    shore:
      'M262 372C320 362 370 368 400 364C600 356 860 368 1090 360',
    shimmer: ['M284 380q20-3 40 0M340 376q24-3 48 0M300 386q24-3 50 0'],
    tile: [10, 6],
    tufts: [
      [30, 380, 0.7],
      [290, 420, 0.7],
      [360, 470, 0.6],
      [20, 600, 0.7],
      [200, 640, 0.6],
      [340, 700, 0.7],
      [120, 760, 0.7],
    ],
  },
};
