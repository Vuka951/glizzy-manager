import { useEffect, useRef, useState } from 'react';
import TownEscort from '@/components/games/career/town/TownEscort';
import useAmbientMotion from '@/components/games/useAmbientMotion';
import { TOWN_LAYOUTS, type TownLayoutKey } from '@/lib/constants/townLayout';
import { prefersReducedMotion } from '@/lib/utils/motion';
import { pauseWhileHidden } from '@/lib/utils/townFlow';

const SIZES: Record<TownLayoutKey, { guard: string; gap: string }> = {
  desk: { guard: 'h-[34px] w-[17px]', gap: 'gap-1' },
  phone: { guard: 'h-[22px] w-[11px]', gap: 'gap-0.5' },
};
const SPEED: Record<TownLayoutKey, number> = { desk: 26, phone: 13 };
// How far they walk before stopping, in canvas pixels, and how long they stay
const STRETCH: Record<TownLayoutKey, [number, number]> = {
  desk: [110, 300],
  phone: [50, 130],
};
const PAUSE_MS: [number, number] = [4000, 9000];
const HOP =
  'motion-safe:animate-[fanhop_0.5s_ease-in-out_infinite] motion-lite:animate-none!';

// The retainer's foot patrol: two guards walking their beat along both
// pavements in short stretches, crossing at the zebra, stopping every so often
// to look up and down the street. On the lite level or under reduced motion
// they stand at the start of it
export default function TownPatrol({ layout }: { layout: TownLayoutKey }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const ambient = useAmbientMotion();
  const [left, setLeft] = useState(false);
  const [walking, setWalking] = useState(false);
  const size = SIZES[layout];

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const route = TOWN_LAYOUTS[layout].street.patrol;
    const at = (p: { x: number; y: number }) => `translate(${p.x}px, ${p.y}px)`;
    el.style.transform = at(route[0]);
    el.style.zIndex = String(route[0].y + 1);
    if (!ambient || prefersReducedMotion()) return;
    const between = ([low, high]: [number, number]) =>
      low + Math.random() * (high - low);
    let leg = 0;
    let pos = route[0];
    let stopped = false;
    let walk: Animation | null = null;
    let timer = 0;
    let glance = 0;
    const rest = () => {
      if (stopped) return;
      setWalking(false);
      const pause = between(PAUSE_MS);
      glance = window.setTimeout(() => setLeft((was) => !was), pause / 2);
      timer = window.setTimeout(step, pause);
    };
    const step = () => {
      if (stopped) return;
      const next = (leg + 1) % route.length;
      const end = route[next];
      const remaining = Math.hypot(end.x - pos.x, end.y - pos.y);
      if (remaining < 1) {
        leg = next;
        step();
        return;
      }
      const stretch = between(STRETCH[layout]);
      const share = Math.min(1, stretch / remaining);
      const to = {
        x: pos.x + (end.x - pos.x) * share,
        y: pos.y + (end.y - pos.y) * share,
      };
      if (end.x !== pos.x) setLeft(end.x < pos.x);
      setWalking(true);
      el.style.zIndex = String(Math.round(Math.max(pos.y, to.y)) + 1);
      const previous = walk;
      walk = el.animate([{ transform: at(pos) }, { transform: at(to) }], {
        duration: (Math.hypot(to.x - pos.x, to.y - pos.y) / SPEED[layout]) * 1000,
        easing: 'linear',
        fill: 'forwards',
      });
      previous?.cancel();
      walk.onfinish = () => {
        pos = to;
        if (share === 1) leg = next;
        rest();
      };
    };
    timer = window.setTimeout(step, between(PAUSE_MS));
    const stopHold = pauseWhileHidden(el);
    return () => {
      stopped = true;
      stopHold();
      window.clearTimeout(timer);
      window.clearTimeout(glance);
      walk?.cancel();
    };
  }, [layout, ambient]);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute left-0 top-0"
    >
      <div
        className={`absolute bottom-0 left-0 flex -translate-x-1/2 items-end ${size.gap}`}
      >
        <span className={`block ${size.guard} ${walking ? HOP : ''}`}>
          <TownEscort side={left ? 'right' : 'left'} />
        </span>
        <span
          className={`block ${size.guard} ${walking ? `${HOP} [animation-delay:-0.25s]` : ''}`}
        >
          <TownEscort side={left ? 'right' : 'left'} />
        </span>
      </div>
    </div>
  );
}
