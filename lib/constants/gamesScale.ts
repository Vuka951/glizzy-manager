// Big monitors zoom the games pages as one piece: the page, and on those
// routes the nav and footer with it, so the 73px nav offset the page shells
// subtract stays true inside the zoom
export const GAMES_ZOOM_CLASS =
  '[--game-zoom:1] [zoom:var(--game-zoom)] [@media(min-width:1920px)_and_(min-height:900px)]:[--game-zoom:1.25] [@media(min-width:2560px)_and_(min-height:1200px)]:[--game-zoom:1.5] [@media(min-width:3200px)_and_(min-height:1600px)]:[--game-zoom:2] [@media(min-width:3840px)_and_(min-height:1900px)]:[--game-zoom:2.25]';
