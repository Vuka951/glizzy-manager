import { type RefObject, useEffect, useLayoutEffect, useRef } from 'react';
import useAmbientMotion from '@/components/games/useAmbientMotion';
import useSceneMotion from '@/components/games/useSceneMotion';
import type { TownBuildingMode } from '@/lib/types/town';
import { prefersReducedMotion } from '@/lib/utils/motion';

function numberData(el: Element, key: string, fallback: number): number {
  const value = Number((el as HTMLElement | SVGElement).dataset[key]);
  return Number.isFinite(value) && value !== 0 ? value : fallback;
}

const FLICKER_OFF: Keyframe[] = [
  { opacity: 1 },
  { opacity: 1, offset: 0.25 },
  { opacity: 0.2, offset: 0.3 },
  { opacity: 1, offset: 0.38 },
  { opacity: 0.1, offset: 0.5 },
  { opacity: 0.8, offset: 0.56 },
  { opacity: 0 },
];

const DYING: Keyframe[] = [
  { opacity: 0.35 },
  { opacity: 0.35, offset: 0.7 },
  { opacity: 1, offset: 0.71 },
  { opacity: 0.1, offset: 0.74 },
  { opacity: 0.9, offset: 0.76 },
  { opacity: 0.05, offset: 0.8 },
  { opacity: 0.35 },
];

// The building art's small moving parts, driven from data attributes so the
// art stays plain JSX. Neon buzz, window flicker, blinking lamps, rising smoke
// and the ticker come from the shared scene driver; bobbing and swinging
// figures, spinners and waving flags are the buildings' own. Everything runs
// only while the building is open, the tab is visible and the viewer allows
// motion and the full animation level. An abandoned building keeps just its dying bulb (`data-dying`).
// When an open building shuts while on screen it closes up for the night:
// `data-facade-down` parts roll down from their top edge, `data-facade-off`
// parts flicker out, `data-facade-on` parts fade in, each after `data-at` ms.
// `signature` re-reads the art when the set of animated parts changes
export default function useBuildingMotion(
  ref: RefObject<Element | null>,
  mode: TownBuildingMode,
  signature = '',
) {
  const active = mode === 'open';
  const ambient = useAmbientMotion();
  // Buildings carry no weather, so the season the scene driver keys its
  // particles on does not matter here
  useSceneMotion(ref, 0, !active, signature, true);
  useEffect(() => {
    const root = ref.current;
    if (!root || !active || !ambient || prefersReducedMotion()) return;
    const animations: Animation[] = [];
    const each = (
      selector: string,
      build: (el: HTMLElement | SVGElement, i: number) => Animation,
    ) => {
      root
        .querySelectorAll<HTMLElement | SVGElement>(selector)
        .forEach((el, i) => animations.push(build(el, i)));
    };

    each('[data-bob]', (el, i) =>
      el.animate(
        [
          { transform: 'translateY(0px)' },
          { transform: `translateY(${-numberData(el, 'bob', 2)}px)` },
        ],
        {
          duration: numberData(el, 'speed', 900 + i * 250),
          direction: 'alternate',
          iterations: Infinity,
          easing: 'ease-in-out',
        },
      ),
    );
    each('[data-swing]', (el, i) => {
      const angle = numberData(el, 'swing', 8);
      return el.animate(
        [
          { transform: `rotate(${-angle}deg)` },
          { transform: `rotate(${angle}deg)` },
        ],
        {
          duration: numberData(el, 'speed', 1400 + i * 300),
          direction: 'alternate',
          iterations: Infinity,
          easing: 'ease-in-out',
        },
      );
    });
    each('[data-spin]', (el) =>
      el.animate(
        [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
        { duration: numberData(el, 'spin', 6000), iterations: Infinity },
      ),
    );
    each('[data-wave]', (el, i) =>
      el.animate(
        [
          { transform: 'skewY(-4deg) scaleX(0.96)' },
          { transform: 'skewY(4deg) scaleX(1.02)' },
        ],
        {
          duration: 2200 + i * 400,
          direction: 'alternate',
          iterations: Infinity,
          easing: 'ease-in-out',
        },
      ),
    );

    const onVisibility = () => {
      animations.forEach((a) => (document.hidden ? a.pause() : a.play()));
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      animations.forEach((a) => a.cancel());
    };
  }, [ref, active, ambient, signature]);

  useEffect(() => {
    const root = ref.current;
    if (!root || mode !== 'abandoned' || !ambient || prefersReducedMotion()) return;
    const animations = Array.from(
      root.querySelectorAll<HTMLElement | SVGElement>('[data-dying]'),
      (el, i) =>
        el.animate(DYING, {
          duration: 3800 + i * 1700,
          delay: -i * 900,
          iterations: Infinity,
        }),
    );
    return () => animations.forEach((a) => a.cancel());
  }, [ref, mode, ambient]);

  const previous = useRef(mode);
  // A layout effect so the shut art never paints a frame before it animates
  useLayoutEffect(() => {
    const from = previous.current;
    previous.current = mode;
    const root = ref.current;
    if (!root || from !== 'open' || mode !== 'shut' || prefersReducedMotion()) return;
    const animations: Animation[] = [];
    const each = (
      selector: string,
      build: (el: HTMLElement | SVGElement, at: number) => Animation,
    ) => {
      root
        .querySelectorAll<HTMLElement | SVGElement>(selector)
        .forEach((el) => {
          const at = Number(el.dataset.at);
          animations.push(build(el, Number.isFinite(at) ? at : 0));
        });
    };
    each('[data-facade-down]', (el, at) =>
      el.animate(
        [
          { transform: 'scaleY(0)' },
          { transform: 'scaleY(1.04)', offset: 0.85 },
          { transform: 'scaleY(1)' },
        ],
        {
          duration: 750,
          delay: at,
          easing: 'cubic-bezier(0.5, 0, 0.75, 1)',
          fill: 'backwards',
        },
      ),
    );
    each('[data-facade-off]', (el, at) =>
      el.animate(FLICKER_OFF, { duration: 900, delay: at, fill: 'backwards' }),
    );
    each('[data-facade-on]', (el, at) =>
      el.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 600,
        delay: at,
        easing: 'ease-out',
        fill: 'backwards',
      }),
    );
    each('[data-facade-dim]', (el, at) =>
      el.animate([{ opacity: 1 }, { opacity: getComputedStyle(el).opacity }], {
        duration: 800,
        delay: at,
        easing: 'ease-in',
        fill: 'backwards',
      }),
    );
    return () => animations.forEach((a) => a.cancel());
  }, [ref, mode]);
}
