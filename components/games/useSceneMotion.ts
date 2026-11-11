import { type RefObject, useEffect } from 'react';
import useAmbientMotion from '@/components/games/useAmbientMotion';
import { playChompSound } from '@/lib/utils/gameSounds';
import { prefersReducedMotion } from '@/lib/utils/motion';

// Living-scene driver shared by SeasonBackdrop and the town. Mark SVG or HTML
// elements with a data attribute and the hook animates them with WAAPI; the
// value, where one is read, is a number. Elements that scale or rotate need
// `origin-* [transform-box:fill-box]` classes. Everything pauses while the tab
// is hidden, and only pokes stay alive under reduced motion or `paused`.
// Town callers pass `followsMotionLevel` so the lite animation level stills
// them too; backdrops behind cutscenes and matches never follow it.
//   data-star            twinkle: fades and scales in a slow loop
//   data-cloud           drifts a few px sideways, back and forth
//   data-aurora          aurora band breathes and sways
//   data-glow            halo breathes in opacity and scale
//   data-shimmer         water glint slides and fades
//   data-sway            tree or plant rocks a degree either way
//   data-float           bobs gently (moons, floating houses)
//   data-fog             fog bank rolls slowly sideways
//   data-boat            crosses 580px left to right over 70s, then wraps
//   data-frond           palm frond rocks
//   data-firefly         wanders a little while glowing on and off
//   data-gull            glides back and forth over ~94px
//   data-particle        HTML weather particle falls the root's height
//   data-poke            clickable toy: chomp sound and a wobble
//   data-pulse           blood-moon halo pulses strongly in opacity and scale
//   data-flock="px"      crosses px to the right with a dip, fading at both ends
//   data-flap            wing beat (scaleY), for bird, bat and crow wings
//   data-bat             flutters erratically around its spot
//   data-glide="px"      circles slowly around its spot with radius px (crows)
//   data-swoop="px"      swallow dives and climbs while crossing px, back and forth
//   data-sail="px"       sails px to the right, turns around, sails back
//   data-shooting-star   streaks down-left once every ~11s, invisible otherwise
//   data-wag             quick tail wag (rotate)
//   data-hop             perched bird hops in place now and then
//   data-jet             water jet: scrolls stroke-dashoffset, needs a dasharray
//   data-flutter         paper or flag edge flutters quickly
//   data-buzz            neon sign flickers now and then
//   data-flick           lit window dims twice per loop
//   data-blink="ms"      light switches on and off every ms (default 1300), data-delay offsets it
//   data-smoke="px"      steam or smoke puff rises px while growing and fading
//   data-ticker          scrolls left by half its own width, for a doubled ticker text
// `signature` re-reads the art when the set of animated parts changes
export default function useSceneMotion(
  rootRef: RefObject<Element | null>,
  season: number,
  paused = false,
  signature = '',
  followsMotionLevel = false,
) {
  const ambient = useAmbientMotion();
  const still = paused || (followsMotionLevel && !ambient);
  useEffect(() => {
    const container = rootRef.current;
    if (!container) return;
    const height = container.clientHeight || 300;
    const animations: Animation[] = [];
    const reducedMotion = prefersReducedMotion();
    const numberData = (el: Element, name: string, fallback: number) => {
      const value = Number(el.getAttribute(name));
      return Number.isFinite(value) && value !== 0 ? value : fallback;
    };
    const drift = (
      el: Element,
      dx: number,
      dy: number,
      duration: number,
      delay = 0,
    ) => {
      animations.push(
        (el as SVGElement).animate(
          [
            { transform: 'translate(0px, 0px)' },
            { transform: `translate(${dx}px, ${dy}px)` },
          ],
          { duration, delay, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' },
        ),
      );
    };
    if (!reducedMotion && !still) {
      container.querySelectorAll<SVGElement>('[data-star]').forEach((el, i) => {
        animations.push(
          el.animate(
            [
              { opacity: 0.25, transform: 'scale(0.72)' },
              { opacity: i % 4 === 0 ? 1 : 0.75, transform: 'scale(1.15)', offset: 0.5 },
              { opacity: 0.25, transform: 'scale(0.72)' },
            ],
            {
              duration: 3200 + (i % 5) * 900,
              delay: -i * 470,
              iterations: Infinity,
              easing: 'ease-in-out',
            },
          ),
        );
      });
      container.querySelectorAll('[data-cloud]').forEach((el, i) => {
        drift(el, 12 + i * 5, i % 2 ? -2 : 2, 26000 + i * 7000, -i * 2100);
      });
      container.querySelectorAll<SVGElement>('[data-aurora]').forEach((el, i) => {
        animations.push(
          el.animate(
            [
              { opacity: 0.4, transform: 'translate(-6px, 1px) scaleY(0.96)' },
              { opacity: 0.82, transform: `translate(${10 + i * 7}px, -2px) scaleY(1.05)` },
            ],
            { duration: 10000 + i * 3500, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' },
          ),
        );
      });
      container.querySelectorAll<SVGElement>('[data-glow]').forEach((el, i) => {
        animations.push(
          el.animate(
            [
              { opacity: 0.55, transform: 'scale(0.94)' },
              { opacity: 1, transform: 'scale(1.08)' },
            ],
            { duration: 5800 + i * 900, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' },
          ),
        );
      });
      container.querySelectorAll<SVGElement>('[data-shimmer]').forEach((el, i) => {
        animations.push(
          el.animate(
            [
              { opacity: 0.35, transform: 'translateX(-4px)' },
              { opacity: 0.9, transform: 'translateX(5px)', offset: 0.5 },
              { opacity: 0.35, transform: 'translateX(-4px)' },
            ],
            { duration: 4200 + i * 1100, delay: -i * 800, iterations: Infinity, easing: 'ease-in-out' },
          ),
        );
      });
      container.querySelectorAll<SVGElement>('[data-sway]').forEach((el, i) => {
        animations.push(
          el.animate(
            [{ transform: 'rotate(-0.8deg)' }, { transform: 'rotate(1.2deg)' }],
            { duration: 5200 + i * 1000, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' },
          ),
        );
      });
      container.querySelectorAll<SVGElement>('[data-float]').forEach((el, i) => {
        drift(el, i % 2 ? 1.5 : -1.5, -2.5, 6500 + i * 900, -i * 700);
      });
      container.querySelectorAll('[data-fog]').forEach((el, i) => {
        drift(el, 24 + i * 12, i % 2 ? 1 : -1, 30000 + i * 9000, -i * 5000);
      });
      container.querySelectorAll<SVGElement>('[data-boat]').forEach((el) => {
        animations.push(
          el.animate(
            [
              { transform: 'translate(0px, 0px) rotate(0deg)', opacity: 0 },
              { transform: 'translate(60px, -1px) rotate(0.3deg)', opacity: 1, offset: 0.05 },
              { transform: 'translate(520px, 1px) rotate(-0.4deg)', opacity: 1, offset: 0.95 },
              { transform: 'translate(580px, 0px) rotate(0deg)', opacity: 0 },
            ],
            { duration: 70000, iterations: Infinity, easing: 'linear' },
          ),
        );
      });
      container.querySelectorAll<SVGElement>('[data-frond]').forEach((el) => {
        animations.push(
          el.animate([{ transform: 'rotate(-0.5deg)' }, { transform: 'rotate(2.5deg)' }], {
            duration: 5200,
            direction: 'alternate',
            iterations: Infinity,
            easing: 'ease-in-out',
          }),
        );
      });
      container.querySelectorAll<SVGElement>('[data-firefly]').forEach((el, i) => {
        animations.push(
          el.animate(
            [
              { transform: 'translate(0px, 0px) scale(0.7)', opacity: 0.15 },
              { transform: `translate(${8 + i * 2}px, -7px) scale(1.2)`, opacity: 1, offset: 0.33 },
              { transform: `translate(${-6 - i}px, 5px) scale(0.8)`, opacity: 0.25, offset: 0.68 },
              { transform: 'translate(0px, 0px) scale(0.7)', opacity: 0.15 },
            ],
            { duration: 6200 + i * 1200, delay: -i * 900, iterations: Infinity, easing: 'ease-in-out' },
          ),
        );
      });
      container.querySelectorAll<SVGElement>('[data-gull]').forEach((el, i) => {
        animations.push(
          el.animate(
            [
              { transform: 'translate(0px, 0px)' },
              { transform: 'translate(30px, -8px)' },
              { transform: 'translate(62px, 2px)' },
              { transform: 'translate(94px, -6px)' },
            ],
            {
              duration: 12000 + i * 3000,
              delay: -i * 2600,
              iterations: Infinity,
              direction: 'alternate',
              easing: 'ease-in-out',
            },
          ),
        );
      });
      container.querySelectorAll<HTMLElement>('[data-particle]').forEach((el, i) => {
        const dx = ((i * 37 + season * 19) % 86) - 43;
        const duration = 7200 + ((i * 977 + season * 613) % 5200);
        const rotation = season === 3 ? 420 : season === 1 ? 260 : 140;
        animations.push(
          el.animate(
            [
              { transform: 'translate(0, -18px) rotate(0deg) scale(0.75)', opacity: 0 },
              { opacity: 0.9, offset: 0.12 },
              { transform: `translate(${dx * 0.45}px, ${height * 0.52}px) rotate(${rotation * 0.45}deg) scale(1)`, opacity: 0.85, offset: 0.55 },
              { transform: `translate(${dx * 0.9}px, ${height * 0.9}px) rotate(${rotation * 0.9}deg) scale(0.86)`, opacity: 0.45, offset: 0.9 },
              { transform: `translate(${dx}px, ${height + 20}px) rotate(${rotation}deg) scale(0.82)`, opacity: 0 },
            ],
            {
              duration,
              delay: -((i * 811) % duration),
              iterations: Infinity,
              easing: season === 0 ? 'linear' : 'cubic-bezier(0.37, 0, 0.63, 1)',
            },
          ),
        );
      });
      container.querySelectorAll<SVGElement>('[data-pulse]').forEach((el, i) => {
        animations.push(
          el.animate(
            [
              { opacity: 0.12, transform: 'scale(0.9)' },
              { opacity: 0.4, transform: 'scale(1.14)' },
            ],
            { duration: 2600, delay: i * 400, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' },
          ),
        );
      });
      container.querySelectorAll<SVGElement>('[data-flock]').forEach((el, i) => {
        const distance = numberData(el, 'data-flock', 1140);
        animations.push(
          el.animate(
            [
              { transform: 'translate(0px, 30px)', opacity: 0 },
              { opacity: 1, offset: 0.04 },
              { transform: `translate(${distance * 0.5}px, -20px)`, offset: 0.5 },
              { opacity: 1, offset: 0.96 },
              { transform: `translate(${distance}px, 20px)`, opacity: 0 },
            ],
            {
              duration: distance * 36,
              delay: -i * 9000,
              iterations: Infinity,
              easing: 'linear',
            },
          ),
        );
      });
      container.querySelectorAll<SVGElement>('[data-flap]').forEach((el, i) => {
        animations.push(
          el.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(0.4)' }], {
            duration: 340 + (i % 3) * 70,
            delay: -i * 130,
            direction: 'alternate',
            iterations: Infinity,
            easing: 'ease-in-out',
          }),
        );
      });
      container.querySelectorAll<SVGElement>('[data-bat]').forEach((el, i) => {
        animations.push(
          el.animate(
            [
              { transform: 'translate(0px, 0px) scaleY(1)' },
              { transform: `translate(${-30 - i * 10}px, -14px) scaleY(0.4)`, offset: 0.25 },
              { transform: `translate(${-60 - i * 10}px, 6px) scaleY(1)`, offset: 0.5 },
              { transform: 'translate(-20px, -8px) scaleY(0.4)', offset: 0.75 },
              { transform: 'translate(0px, 0px) scaleY(1)' },
            ],
            { duration: 3400 + i * 700, iterations: Infinity, easing: 'ease-in-out' },
          ),
        );
      });
      container.querySelectorAll<SVGElement>('[data-glide]').forEach((el, i) => {
        const radius = numberData(el, 'data-glide', 40);
        animations.push(
          el.animate(
            [
              { transform: `translate(${radius}px, 0px)` },
              { transform: `translate(0px, ${-radius * 0.4}px)` },
              { transform: `translate(${-radius}px, 0px)` },
              { transform: `translate(0px, ${radius * 0.4}px)` },
              { transform: `translate(${radius}px, 0px)` },
            ],
            { duration: 14000 + i * 3000, delay: -i * 2500, iterations: Infinity, easing: 'linear' },
          ),
        );
      });
      container.querySelectorAll<SVGElement>('[data-swoop]').forEach((el, i) => {
        const distance = numberData(el, 'data-swoop', 120);
        animations.push(
          el.animate(
            [
              { transform: 'translate(0px, 0px) rotate(0deg)' },
              { transform: `translate(${distance * 0.25}px, 18px) rotate(14deg)` },
              { transform: `translate(${distance * 0.5}px, -6px) rotate(-10deg)` },
              { transform: `translate(${distance * 0.75}px, 22px) rotate(12deg)` },
              { transform: `translate(${distance}px, 0px) rotate(0deg)` },
            ],
            {
              duration: 5000 + i * 900,
              delay: -i * 1300,
              direction: 'alternate',
              iterations: Infinity,
              easing: 'ease-in-out',
            },
          ),
        );
      });
      container.querySelectorAll<SVGElement>('[data-sail]').forEach((el, i) => {
        const distance = numberData(el, 'data-sail', 120);
        animations.push(
          el.animate(
            [
              { transform: 'translate(0px, 0px) scaleX(1)' },
              { transform: `translate(${distance * 0.5}px, -0.8px) scaleX(1)`, offset: 0.24 },
              { transform: `translate(${distance}px, 0px) scaleX(1)`, offset: 0.48 },
              { transform: `translate(${distance}px, 0px) scaleX(-1)`, offset: 0.52 },
              { transform: `translate(${distance * 0.5}px, -0.8px) scaleX(-1)`, offset: 0.76 },
              { transform: 'translate(0px, 0px) scaleX(-1)', offset: 0.98 },
              { transform: 'translate(0px, 0px) scaleX(1)' },
            ],
            { duration: distance * 300, delay: -i * 7000, iterations: Infinity, easing: 'linear' },
          ),
        );
      });
      container.querySelectorAll<SVGElement>('[data-shooting-star]').forEach((el, i) => {
        animations.push(
          el.animate(
            [
              { transform: 'translate(0px, 0px)', opacity: 0 },
              { transform: 'translate(0px, 0px)', opacity: 0, offset: 0.9 },
              { opacity: 1, offset: 0.91 },
              { transform: 'translate(-220px, 100px)', opacity: 0 },
            ],
            { duration: 11000 + i * 4000, delay: -i * 3700, iterations: Infinity, easing: 'ease-out' },
          ),
        );
      });
      container.querySelectorAll<SVGElement>('[data-wag]').forEach((el, i) => {
        animations.push(
          el.animate([{ transform: 'rotate(-14deg)' }, { transform: 'rotate(14deg)' }], {
            duration: 240 + i * 40,
            direction: 'alternate',
            iterations: Infinity,
            easing: 'ease-in-out',
          }),
        );
      });
      container.querySelectorAll<SVGElement>('[data-hop]').forEach((el, i) => {
        animations.push(
          el.animate(
            [
              { transform: 'translateY(0px) scaleY(1)' },
              { transform: 'translateY(0px) scaleY(1)', offset: 0.86 },
              { transform: 'translateY(0px) scaleY(0.86)', offset: 0.88 },
              { transform: 'translateY(-3px) scaleY(1.04)', offset: 0.92 },
              { transform: 'translateY(0px) scaleY(0.92)', offset: 0.96 },
              { transform: 'translateY(0px) scaleY(1)' },
            ],
            { duration: 5200 + (i % 4) * 1300, delay: -i * 1900, iterations: Infinity, easing: 'ease-out' },
          ),
        );
      });
      container.querySelectorAll<SVGElement>('[data-jet]').forEach((el, i) => {
        animations.push(
          el.animate([{ strokeDashoffset: 0 }, { strokeDashoffset: -11 }], {
            duration: 700 + i * 90,
            iterations: Infinity,
            easing: 'linear',
          }),
        );
      });
      container.querySelectorAll<SVGElement>('[data-flutter]').forEach((el, i) => {
        animations.push(
          el.animate(
            [
              { transform: 'rotate(-3deg) skewY(0deg)' },
              { transform: 'rotate(2deg) skewY(-4deg)', offset: 0.5 },
              { transform: 'rotate(4deg) skewY(2deg)' },
            ],
            {
              duration: 420 + i * 60,
              direction: 'alternate',
              iterations: Infinity,
              easing: 'ease-in-out',
            },
          ),
        );
      });
      container.querySelectorAll<SVGElement>('[data-buzz]').forEach((el, i) => {
        animations.push(
          el.animate(
            [
              { opacity: 1 },
              { opacity: 1, offset: 0.6 },
              { opacity: 0.35, offset: 0.61 },
              { opacity: 1, offset: 0.62 },
              { opacity: 0.5, offset: 0.64 },
              { opacity: 1, offset: 0.65 },
              { opacity: 1 },
            ],
            { duration: 6000 + i * 1300, delay: -i * 1700, iterations: Infinity },
          ),
        );
      });
      container.querySelectorAll<SVGElement>('[data-flick]').forEach((el, i) => {
        animations.push(
          el.animate(
            [
              { opacity: 1 },
              { opacity: 1, offset: 0.42 },
              { opacity: 0.55, offset: 0.42 },
              { opacity: 0.55, offset: 0.44 },
              { opacity: 1, offset: 0.44 },
              { opacity: 1, offset: 0.71 },
              { opacity: 0.7, offset: 0.71 },
              { opacity: 0.7, offset: 0.72 },
              { opacity: 1, offset: 0.72 },
              { opacity: 1 },
            ],
            { duration: 4000 + i * 700, delay: -i * 900, iterations: Infinity },
          ),
        );
      });
      container.querySelectorAll<SVGElement>('[data-blink]').forEach((el) => {
        animations.push(
          el.animate(
            [
              { opacity: 1 },
              { opacity: 1, offset: 0.5 },
              { opacity: 0.15, offset: 0.5 },
              { opacity: 0.15 },
            ],
            {
              duration: numberData(el, 'data-blink', 1300),
              delay: -(Number(el.getAttribute('data-delay')) || 0),
              iterations: Infinity,
            },
          ),
        );
      });
      container.querySelectorAll<SVGElement>('[data-smoke]').forEach((el, i) => {
        const rise = numberData(el, 'data-smoke', 46);
        animations.push(
          el.animate(
            [
              { transform: 'translate(0px, 0px) scale(0.5)', opacity: 0 },
              { opacity: 0.55, offset: 0.15 },
              { transform: `translate(${rise * 0.3}px, ${-rise}px) scale(2.2)`, opacity: 0 },
            ],
            { duration: 4200, delay: -(i % 3) * 1400, iterations: Infinity, easing: 'ease-out' },
          ),
        );
      });
      container.querySelectorAll<SVGGraphicsElement>('[data-ticker]').forEach((el) => {
        const half = el.getBBox().width / 2;
        animations.push(
          el.animate(
            [{ transform: 'translateX(0px)' }, { transform: `translateX(${-half}px)` }],
            { duration: Math.max(6000, half * 70), iterations: Infinity },
          ),
        );
      });
    }
    // The season's own toy: one scenery piece per backdrop wobbles when poked
    const listeners: (() => void)[] = [];
    // Wobbles run once, so they stay out of the looping list the tab
    // visibility resumes, and leave this set when they finish
    const pokes = new Set<Animation>();
    container.querySelectorAll<SVGElement>('[data-poke]').forEach((el) => {
      el.style.pointerEvents = 'auto';
      el.style.cursor = 'pointer';
      el.style.transformBox = 'fill-box';
      el.style.transformOrigin = 'center bottom';
      // A toy drawn inside a building keeps its click from opening the building
      const inButton = el.closest('button') !== null;
      const poke = (event: Event) => {
        if (inButton) event.stopPropagation();
        playChompSound();
        if (reducedMotion) return;
        const wobble = el.animate(
          [
            { transform: 'rotate(0deg) scale(1)' },
            { transform: 'rotate(-6deg) scale(1.08)' },
            { transform: 'rotate(5deg) scale(0.94)' },
            { transform: 'rotate(-2deg) scale(1.04)' },
            { transform: 'rotate(0deg) scale(1)' },
          ],
          { duration: 650, easing: 'ease-in-out' },
        );
        pokes.add(wobble);
        wobble.onfinish = () => pokes.delete(wobble);
      };
      el.addEventListener('click', poke);
      listeners.push(() => el.removeEventListener('click', poke));
    });
    const syncPlayback = () => {
      animations.forEach((animation) => {
        if (document.hidden) animation.pause();
        else animation.play();
      });
    };
    document.addEventListener('visibilitychange', syncPlayback);
    return () => {
      animations.forEach((animation) => animation.cancel());
      pokes.forEach((animation) => animation.cancel());
      listeners.forEach((remove) => remove());
      document.removeEventListener('visibilitychange', syncPlayback);
    };
  }, [rootRef, season, still, signature]);
}
