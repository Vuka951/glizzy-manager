export type SceneAnimationSpec = {
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
};

export const TALK_BEAT_MS = 550;

// Shared moves every cutscene can reach for by name through data-anim.
// Scenes layer their own one-off choreography on top of these
export const SCENE_ANIMATIONS: Record<string, SceneAnimationSpec> = {
  bob: {
    keyframes: [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-6px)' },
      { transform: 'translateY(0)' },
    ],
    options: { duration: 1400, iterations: Infinity, easing: 'ease-in-out' },
  },
  sway: {
    keyframes: [
      { transform: 'rotate(-6deg)' },
      { transform: 'rotate(6deg)' },
      { transform: 'rotate(-6deg)' },
    ],
    options: { duration: 2200, iterations: Infinity, easing: 'ease-in-out' },
  },
  shake: {
    keyframes: [
      { transform: 'translate(0, 0)' },
      { transform: 'translate(-2px, 1px)' },
      { transform: 'translate(2px, -1px)' },
      { transform: 'translate(-2px, -1px)' },
      { transform: 'translate(2px, 1px)' },
      { transform: 'translate(0, 0)' },
    ],
    options: { duration: 320, iterations: Infinity, easing: 'linear' },
  },
  nod: {
    keyframes: [
      { transform: 'rotate(0deg) translateY(0)' },
      { transform: 'rotate(4deg) translateY(2px)', offset: 0.3 },
      { transform: 'rotate(-2deg) translateY(0)', offset: 0.6 },
      { transform: 'rotate(0deg) translateY(0)' },
    ],
    options: { duration: 1800, iterations: Infinity, easing: 'ease-in-out' },
  },
  'pop-in': {
    keyframes: [
      { transform: 'scale(0)', opacity: 0 },
      { transform: 'scale(1.18)', opacity: 1, offset: 0.65 },
      { transform: 'scale(1)', opacity: 1 },
    ],
    options: {
      duration: 420,
      easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)',
      fill: 'both',
    },
  },
  'slide-in-left': {
    keyframes: [
      { transform: 'translateX(-140%)', opacity: 0 },
      { transform: 'translateX(0)', opacity: 1 },
    ],
    options: {
      duration: 700,
      easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)',
      fill: 'both',
    },
  },
  'slide-in-right': {
    keyframes: [
      { transform: 'translateX(140%)', opacity: 0 },
      { transform: 'translateX(0)', opacity: 1 },
    ],
    options: {
      duration: 700,
      easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)',
      fill: 'both',
    },
  },
  'rise-in': {
    keyframes: [
      { transform: 'translateY(40px)', opacity: 0 },
      { transform: 'translateY(0)', opacity: 1 },
    ],
    options: {
      duration: 600,
      easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)',
      fill: 'both',
    },
  },
  'float-up': {
    keyframes: [
      { transform: 'translateY(6px) scale(0.6)', opacity: 0 },
      { transform: 'translateY(-10px) scale(1)', opacity: 1, offset: 0.3 },
      { transform: 'translateY(-44px) scale(0.8)', opacity: 0 },
    ],
    options: { duration: 1800, iterations: Infinity, easing: 'ease-out' },
  },
  drift: {
    keyframes: [
      { transform: 'translate(0, 4px)', opacity: 0 },
      { transform: 'translate(-6px, -6px)', opacity: 0.9, offset: 0.2 },
      { transform: 'translate(-22px, -30px)', opacity: 0.8, offset: 0.7 },
      { transform: 'translate(-34px, -50px)', opacity: 0 },
    ],
    options: { duration: 3400, iterations: Infinity, easing: 'ease-out' },
  },
  flash: {
    keyframes: [
      { opacity: 0 },
      { opacity: 1, offset: 0.06 },
      { opacity: 0, offset: 0.3 },
      { opacity: 0 },
    ],
    options: { duration: 2400, iterations: Infinity, easing: 'ease-out' },
  },
  blink: {
    keyframes: [{ opacity: 1 }, { opacity: 0.15 }, { opacity: 1 }],
    options: { duration: 1000, iterations: Infinity, easing: 'ease-in-out' },
  },
  spin: {
    keyframes: [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
    options: { duration: 2600, iterations: Infinity, easing: 'linear' },
  },
  breathe: {
    keyframes: [
      { transform: 'scale(1)' },
      { transform: 'scale(1.06)' },
      { transform: 'scale(1)' },
    ],
    options: { duration: 3200, iterations: Infinity, easing: 'ease-in-out' },
  },
  'glow-pulse': {
    keyframes: [
      { opacity: 0.35, transform: 'scale(0.92)' },
      { opacity: 0.8, transform: 'scale(1.08)' },
      { opacity: 0.35, transform: 'scale(0.92)' },
    ],
    options: { duration: 1600, iterations: Infinity, easing: 'ease-in-out' },
  },
  wobble: {
    keyframes: [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(-10deg)', offset: 0.25 },
      { transform: 'rotate(8deg)', offset: 0.6 },
      { transform: 'rotate(0deg)' },
    ],
    options: { duration: 1100, iterations: Infinity, easing: 'ease-in-out' },
  },
  drip: {
    keyframes: [
      { transform: 'translateY(0) scale(0.6)', opacity: 0 },
      { transform: 'translateY(8px) scale(1)', opacity: 1, offset: 0.25 },
      { transform: 'translateY(46px) scale(0.8)', opacity: 0 },
    ],
    options: { duration: 1400, iterations: Infinity, easing: 'ease-in' },
  },
  chant: {
    keyframes: [
      { transform: 'scale(0.4) translateY(4px)', opacity: 0 },
      { transform: 'scale(1.1) translateY(0)', opacity: 1, offset: 0.15 },
      { transform: 'scale(1) translateY(-6px)', opacity: 1, offset: 0.6 },
      { transform: 'scale(0.9) translateY(-14px)', opacity: 0 },
    ],
    options: { duration: 2100, iterations: Infinity, easing: 'ease-out' },
  },
  'ring-out': {
    keyframes: [
      { transform: 'scale(0.6)', opacity: 0 },
      { transform: 'scale(1)', opacity: 1, offset: 0.2 },
      { transform: 'scale(2.2)', opacity: 0 },
    ],
    options: { duration: 1100, easing: 'ease-out', fill: 'both' },
  },
  'spark-out': {
    keyframes: [
      {
        transform: 'translate(-50%, -50%) translateY(0) scale(0.4)',
        opacity: 0,
      },
      {
        transform: 'translate(-50%, -50%) translateY(-22px) scale(1.2)',
        opacity: 1,
        offset: 0.2,
      },
      {
        transform: 'translate(-50%, -50%) translateY(-70px) scale(0.3)',
        opacity: 0,
      },
    ],
    options: { duration: 1000, easing: 'ease-out', fill: 'both' },
  },
  'fade-in': {
    keyframes: [{ opacity: 0 }, { opacity: 1 }],
    options: { duration: 600, easing: 'ease-out', fill: 'both' },
  },
  'gray-out': {
    keyframes: [
      { filter: 'saturate(1) brightness(1)', transform: 'scale(1)' },
      { filter: 'saturate(0.2) brightness(0.7)', transform: 'scale(0.9)' },
    ],
    options: { duration: 900, easing: 'ease-out', fill: 'both' },
  },
  talk: {
    keyframes: [
      { transform: 'translateY(0) rotate(0deg)' },
      { transform: 'translateY(-3px) rotate(2deg)', offset: 0.5 },
      { transform: 'translateY(0) rotate(0deg)' },
    ],
    options: { duration: TALK_BEAT_MS, easing: 'ease-in-out' },
  },
  spotlight: {
    keyframes: [
      { opacity: 0 },
      { opacity: 0.75, offset: 0.08 },
      { opacity: 0.75, offset: 0.92 },
      { opacity: 0 },
    ],
    options: { duration: 2000, easing: 'ease-in-out', fill: 'both' },
  },
  scribble: {
    keyframes: [
      { transform: 'rotate(-8deg) translateY(0)' },
      { transform: 'rotate(6deg) translateY(-1px)' },
      { transform: 'rotate(-8deg) translateY(0)' },
    ],
    options: { duration: 260, iterations: Infinity, easing: 'ease-in-out' },
  },
  candle: {
    keyframes: [
      { transform: 'scaleY(1) scaleX(1)', opacity: 0.9 },
      { transform: 'scaleY(1.2) scaleX(0.9)', opacity: 1, offset: 0.3 },
      { transform: 'scaleY(0.9) scaleX(1.1)', opacity: 0.8, offset: 0.6 },
      { transform: 'scaleY(1) scaleX(1)', opacity: 0.9 },
    ],
    options: { duration: 900, iterations: Infinity, easing: 'ease-in-out' },
  },
};
