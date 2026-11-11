import type { CareerMoodActivity } from '@/lib/utils/careerMood';

export type TownLayoutKey = 'desk' | 'phone';

export type TownBuildingId =
  | 'training'
  | 'home'
  | 'security'
  | 'cafe'
  | 'bank'
  | 'parliament'
  | 'media'
  | 'post'
  | 'kiosk'
  | 'billboard'
  | 'poll'
  | 'dock';

// Every building's art is drawn in its own viewBox of this size
export const TOWN_ART_SIZE: Record<TownBuildingId, { w: number; h: number }> = {
  training: { w: 200, h: 150 },
  home: { w: 220, h: 210 },
  security: { w: 180, h: 140 },
  cafe: { w: 180, h: 140 },
  bank: { w: 170, h: 175 },
  parliament: { w: 260, h: 205 },
  media: { w: 150, h: 290 },
  post: { w: 120, h: 115 },
  kiosk: { w: 124, h: 100 },
  billboard: { w: 240, h: 135 },
  poll: { w: 160, h: 135 },
  dock: { w: 200, h: 90 },
};

// Where the door sits along the building's width, as a fraction
export const TOWN_DOOR: Record<TownBuildingId, number> = {
  training: 0.86,
  home: 0.5,
  media: 0.4,
  cafe: 0.8,
  security: 0.5,
  bank: 0.47,
  parliament: 0.5,
  post: 0.52,
  kiosk: 0.3,
  billboard: 0.5,
  poll: 0.5,
  dock: 0.5,
};

// A spot in canvas pixels: x, feet y, and whether he stands behind the
// building in front of him there
export type TownSpot = { x: number; y: number; behind?: boolean };

// A point on the strollers' walk graph, in canvas pixels: a building's door
// he can go in at, an open spot he stops at, a point off the canvas where he
// arrives and leaves, or a bend on the way
export type TownWalkNode = {
  x: number;
  y: number;
  door?: TownBuildingId;
  rest?: boolean;
  edge?: boolean;
  // How far up he steps going in, more where there are stairs
  climb?: number;
};

// Nodes, the straight paths between them (all on open ground, never across
// a building) and the edge he leaves by toward the cup at closing
export type TownWalkGraph = {
  nodes: Record<string, TownWalkNode>;
  paths: [string, string][];
  cup: string;
};

// Where the black cat sits a while: a walk node to reach it by and the
// spot beside it, off the stops the walkers take
export type TownCatPerch = { node: string; x: number; y: number };

export type TownPlacement = {
  // Left edge, ground line and scale of the art, in canvas pixels
  x: number;
  ground: number;
  scale: number;
  // The same box as static Tailwind classes; z follows the ground line so
  // buildings further back sit behind
  box: string;
};

export type TownLayout = {
  w: number;
  h: number;
  // The canvas box as static classes
  canvas: string;
  road: number;
  buildings: Record<TownBuildingId, TownPlacement>;
  toy: TownPlacement;
  fountain: TownPlacement;
  flagPoles: { x: number; ground: number; box: string }[];
  spots: Record<CareerMoodActivity, TownSpot>;
  // The cup bus parked at the stop, the stop's pole on the front kerb, and
  // the road the townsfolk take to it once the town closes for the night
  cupBus: TownPlacement & { door: TownSpot };
  cupStop: { x: number; ground: number; box: string };
  folk: {
    lane: number;
    exit: number;
    gather: TownSpot[];
    from: TownBuildingId[];
  };
  // The standing contracts' pieces out in town, clear of doors, walks, the cup
  // bus's stop and the buttons along the bottom of the stage: the coach's
  // chalkboard, the guard booth,
  // the camera pole, the patrol's beat and the informant's truck with its cable
  // to the kiosk
  street: {
    tactics: string;
    booth: string;
    cctv: string;
    patrol: { x: number; y: number }[];
    spyVan: { x: number; box: string; wireLayer: string; wire: string };
  };
  // Where the league's other characters can walk
  walk: TownWalkGraph;
  // The cat's resting spots, the café step first: where it starts, waits out
  // closing time, and stays on the lite level or under reduced motion
  catPerches: TownCatPerch[];
};

export const TOWN_LAYOUTS: Record<TownLayoutKey, TownLayout> = {
  desk: {
    w: 1000,
    h: 660,
    canvas: 'w-[1000px] h-[660px]',
    road: 524,
    buildings: {
      parliament: {
        x: 383,
        ground: 380,
        scale: 0.9,
        box: 'left-[383px] top-[196px] w-[234px] h-[184px] z-[380]',
      },
      media: {
        x: 664,
        ground: 374,
        scale: 0.78,
        box: 'left-[664px] top-[148px] w-[117px] h-[226px] z-[374]',
      },
      training: {
        x: 4,
        ground: 492,
        scale: 0.92,
        box: 'left-[4px] top-[354px] w-[184px] h-[138px] z-[492]',
      },
      home: {
        x: 192,
        ground: 494,
        scale: 0.68,
        box: 'left-[192px] top-[351px] w-[150px] h-[143px] z-[494]',
      },
      security: {
        x: 336,
        ground: 496,
        scale: 0.63,
        box: 'left-[336px] top-[408px] w-[113px] h-[88px] z-[496]',
      },
      bank: {
        x: 692,
        ground: 492,
        scale: 0.86,
        box: 'left-[692px] top-[342px] w-[146px] h-[151px] z-[492]',
      },
      cafe: {
        x: 838,
        ground: 494,
        scale: 0.88,
        box: 'left-[838px] top-[371px] w-[158px] h-[123px] z-[494]',
      },
      post: {
        x: 4,
        ground: 628,
        scale: 0.86,
        box: 'left-[4px] top-[529px] w-[103px] h-[99px] z-[628]',
      },
      billboard: {
        x: 111,
        ground: 650,
        scale: 0.65,
        box: 'left-[111px] top-[562px] w-[156px] h-[88px] z-[650]',
      },
      poll: {
        x: 296,
        ground: 650,
        scale: 0.65,
        box: 'left-[296px] top-[562px] w-[104px] h-[88px] z-[650]',
      },
      kiosk: {
        x: 642,
        ground: 638,
        scale: 0.86,
        box: 'left-[642px] top-[552px] w-[107px] h-[86px] z-[638]',
      },
      dock: {
        x: 868,
        ground: 652,
        scale: 0.64,
        box: 'left-[868px] top-[594px] w-[128px] h-[58px] z-[652]',
      },
    },
    toy: {
      x: 576,
      ground: 470,
      scale: 0.7,
      box: 'left-[576px] top-[470px] z-[470]',
    },
    fountain: {
      x: 500,
      ground: 474,
      scale: 0.95,
      box: 'left-[448px] top-[383px] w-[105px] h-[91px] z-[474]',
    },
    flagPoles: [
      {
        x: 316,
        ground: 496,
        box: 'left-[314px] top-[400px] h-[96px] w-[40px] z-[496]',
      },
      {
        x: 684,
        ground: 496,
        box: 'left-[682px] top-[400px] h-[96px] w-[40px] z-[496]',
      },
    ],
    spots: {
      idle: { x: 500, y: 528 },
      celebrating: { x: 470, y: 530 },
      energized: { x: 110, y: 528 },
      proud: { x: 552, y: 452 },
      relaxed: { x: 268, y: 502 },
      hungry: { x: 500, y: 488 },
      anxious: { x: 662, y: 530 },
      frantic: { x: 500, y: 528 },
      sick: { x: 900, y: 512 },
      shy: { x: 425, y: 486, behind: true },
      defeated: { x: 470, y: 542 },
    },
    cupBus: {
      x: 746,
      ground: 556,
      scale: 0.8,
      box: 'left-[746px] top-[511px] w-[128px] h-[45px] z-[556]',
      door: { x: 848, y: 562 },
    },
    cupStop: {
      x: 902,
      ground: 566,
      box: 'left-[894px] top-[516px] w-[16px] h-[50px] z-[566]',
    },
    folk: {
      lane: 558,
      exit: 1070,
      gather: [
        { x: 918, y: 566 },
        { x: 934, y: 570 },
        { x: 950, y: 565 },
        { x: 966, y: 571 },
        { x: 982, y: 567 },
      ],
      from: ['training', 'home', 'security', 'bank', 'cafe', 'post', 'kiosk'],
    },
    street: {
      tactics: 'left-[808px] top-[316px] h-[52px] w-[104px] z-[368]',
      booth: 'left-[640px] top-[442px] h-[50px] w-[34px] z-[492]',
      cctv: 'left-[88px] top-[478px] h-[84px] w-[34px] z-[562]',
      patrol: [
        { x: 30, y: 500 },
        { x: 975, y: 500 },
        { x: 540, y: 500 },
        { x: 540, y: 560 },
        { x: 30, y: 560 },
        { x: 540, y: 560 },
        { x: 540, y: 500 },
      ],
      spyVan: {
        x: 642,
        box: 'left-[642px] top-[506px] h-[52px] w-[80px] z-[558]',
        wireLayer: 'z-[559]',
        wire: 'M708 554C748 562 758 600 748 626',
      },
    },
    walk: {
      nodes: {
        west: { x: -60, y: 499, edge: true },
        east: { x: 1060, y: 499, edge: true },
        southWest: { x: -60, y: 557, edge: true },
        lowWest: { x: -60, y: 640, edge: true },
        training: { x: 162, y: 494, door: 'training' },
        home: { x: 267, y: 496, door: 'home' },
        security: { x: 392, y: 498, door: 'security' },
        squareWest: { x: 458, y: 499 },
        crossNorth: { x: 540, y: 500 },
        squareEast: { x: 600, y: 499 },
        bank: { x: 761, y: 494, door: 'bank' },
        cafe: { x: 965, y: 496, door: 'cafe' },
        fountainFront: { x: 548, y: 488, rest: true },
        fountainEast: { x: 618, y: 468, rest: true },
        squareRise: { x: 624, y: 432 },
        squareNorthEast: { x: 590, y: 396, rest: true },
        parliament: { x: 500, y: 384, door: 'parliament', climb: 16 },
        squareNorthWest: { x: 420, y: 398, rest: true },
        crossSouth: { x: 540, y: 557 },
        frontWest: { x: 96, y: 558, rest: true },
        frontMid: { x: 250, y: 558, rest: true },
        lawnGate: { x: 430, y: 558 },
        lawnWest: { x: 436, y: 596, rest: true },
        lawnEast: { x: 572, y: 600, rest: true },
        frontEast: { x: 628, y: 558, rest: true },
        shoreRise: { x: 762, y: 566 },
        shoreBend: { x: 796, y: 604 },
        shore: { x: 846, y: 624, rest: true },
        post: { x: 58, y: 632, door: 'post' },
      },
      paths: [
        ['west', 'training'],
        ['training', 'home'],
        ['home', 'security'],
        ['security', 'squareWest'],
        ['squareWest', 'crossNorth'],
        ['crossNorth', 'squareEast'],
        ['squareEast', 'bank'],
        ['bank', 'cafe'],
        ['cafe', 'east'],
        ['crossNorth', 'fountainFront'],
        ['squareEast', 'fountainFront'],
        ['squareEast', 'fountainEast'],
        ['fountainEast', 'squareRise'],
        ['squareRise', 'squareNorthEast'],
        ['squareNorthEast', 'parliament'],
        ['parliament', 'squareNorthWest'],
        ['crossNorth', 'crossSouth'],
        ['southWest', 'frontWest'],
        ['frontWest', 'frontMid'],
        ['frontMid', 'lawnGate'],
        ['lawnGate', 'crossSouth'],
        ['crossSouth', 'frontEast'],
        ['frontEast', 'shoreRise'],
        ['shoreRise', 'shoreBend'],
        ['shoreBend', 'shore'],
        ['lawnGate', 'lawnWest'],
        ['lawnWest', 'lawnEast'],
        ['lowWest', 'post'],
      ],
      cup: 'east',
    },
    catPerches: [
      { node: 'cafe', x: 940, y: 495 },
      { node: 'squareWest', x: 470, y: 476 },
      { node: 'parliament', x: 466, y: 386 },
      { node: 'frontMid', x: 266, y: 556 },
      { node: 'shoreBend', x: 762, y: 634 },
      { node: 'shore', x: 826, y: 632 },
    ],
  },
  phone: {
    w: 390,
    h: 820,
    canvas: 'w-[390px] h-[820px]',
    road: 532,
    buildings: {
      parliament: {
        x: 86,
        ground: 368,
        scale: 0.52,
        box: 'left-[86px] top-[261px] w-[135px] h-[107px] z-[368]',
      },
      media: {
        x: 232,
        ground: 362,
        scale: 0.48,
        box: 'left-[232px] top-[223px] w-[72px] h-[139px] z-[362]',
      },
      dock: {
        x: 296,
        ground: 388,
        scale: 0.45,
        box: 'left-[296px] top-[348px] w-[90px] h-[41px] z-[388]',
      },
      training: {
        x: 0,
        ground: 500,
        scale: 0.52,
        box: 'left-[0px] top-[422px] w-[104px] h-[78px] z-[500]',
      },
      home: {
        x: 104,
        ground: 502,
        scale: 0.39,
        box: 'left-[104px] top-[420px] w-[86px] h-[82px] z-[502]',
      },
      security: {
        x: 192,
        ground: 502,
        scale: 0.42,
        box: 'left-[192px] top-[443px] w-[76px] h-[59px] z-[502]',
      },
      bank: {
        x: 274,
        ground: 502,
        scale: 0.46,
        box: 'left-[274px] top-[422px] w-[78px] h-[81px] z-[502]',
      },
      post: {
        x: 0,
        ground: 656,
        scale: 0.5,
        box: 'left-[0px] top-[599px] w-[60px] h-[58px] z-[656]',
      },
      billboard: {
        x: 64,
        ground: 658,
        scale: 0.42,
        box: 'left-[64px] top-[601px] w-[101px] h-[57px] z-[658]',
      },
      kiosk: {
        x: 170,
        ground: 656,
        scale: 0.5,
        box: 'left-[170px] top-[606px] w-[62px] h-[50px] z-[656]',
      },
      poll: {
        x: 150,
        ground: 740,
        scale: 0.48,
        box: 'left-[150px] top-[675px] w-[77px] h-[65px] z-[740]',
      },
      cafe: {
        x: 236,
        ground: 660,
        scale: 0.58,
        box: 'left-[236px] top-[579px] w-[104px] h-[81px] z-[660]',
      },
    },
    toy: {
      x: 262,
      ground: 412,
      scale: 0.4,
      box: 'left-[262px] top-[412px] z-[412]',
    },
    fountain: {
      x: 204,
      ground: 410,
      scale: 0.5,
      box: 'left-[177px] top-[362px] w-[55px] h-[48px] z-[410]',
    },
    flagPoles: [
      {
        x: 72,
        ground: 508,
        box: 'left-[70px] top-[448px] h-[60px] w-[25px] z-[508]',
      },
      {
        x: 262,
        ground: 508,
        box: 'left-[260px] top-[448px] h-[60px] w-[25px] z-[508]',
      },
    ],
    spots: {
      idle: { x: 196, y: 536 },
      celebrating: { x: 170, y: 538 },
      energized: { x: 52, y: 532 },
      proud: { x: 222, y: 398 },
      relaxed: { x: 148, y: 512 },
      hungry: { x: 204, y: 424 },
      anxious: { x: 300, y: 548 },
      frantic: { x: 196, y: 536 },
      sick: { x: 300, y: 674 },
      shy: { x: 270, y: 492, behind: true },
      defeated: { x: 190, y: 546 },
    },
    cupBus: {
      x: 248,
      ground: 556,
      scale: 0.5,
      box: 'left-[248px] top-[528px] w-[80px] h-[28px] z-[556]',
      door: { x: 312, y: 562 },
    },
    cupStop: {
      x: 342,
      ground: 562,
      box: 'left-[338px] top-[534px] w-[9px] h-[28px] z-[562]',
    },
    folk: {
      lane: 557,
      exit: 440,
      gather: [
        { x: 353, y: 562 },
        { x: 365, y: 567 },
        { x: 378, y: 561 },
      ],
      from: ['training', 'home', 'security', 'bank', 'kiosk'],
    },
    street: {
      tactics: 'left-[16px] top-[692px] h-[44px] w-[88px] z-[736]',
      booth: 'left-[296px] top-[392px] h-[30px] w-[20px] z-[422]',
      cctv: 'left-[78px] top-[510px] h-[50px] w-[20px] z-[560]',
      patrol: [
        { x: 16, y: 508 },
        { x: 372, y: 508 },
        { x: 230, y: 508 },
        { x: 230, y: 558 },
        { x: 16, y: 558 },
        { x: 230, y: 558 },
        { x: 230, y: 508 },
      ],
      spyVan: {
        x: 108,
        box: 'left-[108px] top-[526px] h-[32px] w-[50px] z-[558]',
        wireLayer: 'z-[559]',
        wire: 'M150 555C176 590 240 606 233 648',
      },
    },
    walk: {
      nodes: {
        west: { x: -24, y: 508, edge: true },
        east: { x: 414, y: 508, edge: true },
        southWest: { x: -24, y: 556, edge: true },
        northWest: { x: -24, y: 414, edge: true },
        northEast: { x: 414, y: 404, edge: true },
        lowWest: { x: -24, y: 680, edge: true },
        lowEast: { x: 414, y: 694, edge: true },
        training: { x: 89, y: 503, door: 'training' },
        home: { x: 147, y: 504, door: 'home' },
        security: { x: 230, y: 504, door: 'security' },
        bank: { x: 311, y: 504, door: 'bank' },
        gap: { x: 370, y: 508 },
        crossSouth: { x: 230, y: 556 },
        frontWest: { x: 110, y: 557, rest: true },
        shore: { x: 374, y: 406, rest: true },
        bankBack: { x: 300, y: 414 },
        riverWay: { x: 240, y: 420 },
        riverTip: { x: 238, y: 382, rest: true },
        parliament: { x: 154, y: 374, door: 'parliament', climb: 8 },
        squareWest: { x: 112, y: 404, rest: true },
        westWay: { x: 48, y: 414 },
        post: { x: 31, y: 660, door: 'post' },
        lawnWest: { x: 88, y: 694, rest: true },
        cafe: { x: 320, y: 664, door: 'cafe' },
        lawnEast: { x: 368, y: 700, rest: true },
      },
      paths: [
        ['west', 'training'],
        ['training', 'home'],
        ['home', 'security'],
        ['security', 'bank'],
        ['bank', 'gap'],
        ['gap', 'east'],
        ['security', 'crossSouth'],
        ['southWest', 'frontWest'],
        ['frontWest', 'crossSouth'],
        ['gap', 'shore'],
        ['shore', 'northEast'],
        ['shore', 'bankBack'],
        ['bankBack', 'riverWay'],
        ['riverWay', 'riverTip'],
        ['riverTip', 'parliament'],
        ['parliament', 'squareWest'],
        ['squareWest', 'westWay'],
        ['westWay', 'northWest'],
        ['lowWest', 'post'],
        ['post', 'lawnWest'],
        ['lawnEast', 'cafe'],
        ['lawnEast', 'lowEast'],
      ],
      cup: 'east',
    },
    catPerches: [
      { node: 'cafe', x: 303, y: 662 },
      { node: 'lawnEast', x: 354, y: 706 },
      { node: 'shore', x: 358, y: 412 },
      { node: 'squareWest', x: 126, y: 410 },
      { node: 'frontWest', x: 94, y: 562 },
      { node: 'lawnWest', x: 104, y: 700 },
    ],
  },
};

// Below this stage width the town switches to the three-row phone layout
export const TOWN_PHONE_BREAKPOINT = 640;
