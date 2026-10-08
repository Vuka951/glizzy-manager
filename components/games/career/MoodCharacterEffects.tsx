'use client';

import { useEffect, useRef } from 'react';
import type { CareerMoodActivity } from '@/lib/utils/careerMood';

export default function MoodCharacterEffects({
  activity,
  active = true,
}: {
  activity: CareerMoodActivity;
  active?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;
    const animations: Animation[] = [];

    root.querySelectorAll<HTMLElement>('[data-tear]').forEach((tear, index) => {
      animations.push(
        tear.animate(
          [
            { transform: 'translate(0, 0) scale(0.65)', opacity: 0 },
            { transform: `translate(${index % 2 ? 4 : -3}px, 8px) scale(1)`, opacity: 1, offset: 0.18 },
            { transform: `translate(${index % 2 ? 9 : -7}px, 52px) scale(0.75)`, opacity: 0 },
          ],
          {
            duration: 1350 + index * 210,
            delay: index * 360,
            iterations: Infinity,
            easing: 'cubic-bezier(0.3, 0, 0.7, 1)',
          },
        ),
      );
    });

    root.querySelectorAll<HTMLElement>('[data-float-effect]').forEach((effect, index) => {
      animations.push(
        effect.animate(
          [
            { transform: 'translate(0, 8px) scale(0.55)', opacity: 0 },
            { transform: `translate(${index % 2 ? 8 : -8}px, -8px) scale(1)`, opacity: 1, offset: 0.35 },
            { transform: `translate(${index % 2 ? 16 : -16}px, -34px) scale(0.35)`, opacity: 0 },
          ],
          {
            duration: 1500 + index * 240,
            delay: index * 280,
            iterations: Infinity,
            easing: 'ease-out',
          },
        ),
      );
    });

    root.querySelectorAll<HTMLElement>('[data-sleep-effect]').forEach((effect, index) => {
      animations.push(
        effect.animate(
          [
            { transform: 'translate(0, 6px) scale(0.72)', opacity: 0 },
            { transform: 'translate(-4px, 0) scale(0.9)', opacity: 0.95, offset: 0.14 },
            { transform: 'translate(-18px, -35px) scale(1.12)', opacity: 0.95, offset: 0.72 },
            { transform: 'translate(-30px, -58px) scale(1.25)', opacity: 0 },
          ],
          {
            duration: 3600 + index * 450,
            delay: index * 850,
            iterations: Infinity,
            easing: 'ease-out',
          },
        ),
      );
    });

    return () => animations.forEach((animation) => animation.cancel());
  }, [activity]);

  return (
    <div
      ref={rootRef}
      className={`pointer-events-none absolute inset-0 z-20 transition-opacity duration-700 ${active ? 'opacity-100' : 'opacity-0'}`}
      aria-hidden="true"
    >
      {activity === 'sick' && (
        <>
          <span className="absolute inset-0 rounded-full bg-emerald-400/35 mix-blend-color" />
          <span data-float-effect className="absolute left-0 top-1/3 h-2 w-2 rounded-full bg-lime-300/80 ring-1 ring-emerald-950/40" />
          <span data-float-effect className="absolute right-1 top-1/2 h-3 w-3 rounded-full bg-emerald-300/65 ring-1 ring-emerald-950/40" />
        </>
      )}

      {activity === 'frantic' && (
        <>
          <span className="absolute inset-0 rounded-full bg-red-400/15 mix-blend-color" />
          <span data-tear className="absolute -right-1 top-5 h-3 w-2 rounded-b-full rounded-t-[70%] bg-sky-200/90" />
          <span data-tear className="absolute left-1 top-7 h-2.5 w-1.5 rounded-b-full rounded-t-[70%] bg-sky-100/80" />
        </>
      )}

      {activity === 'anxious' && (
        <>
          <span data-tear className="absolute left-[28%] top-[58%] h-3.5 w-2 rounded-b-full rounded-t-[70%] bg-sky-200/95 shadow-[0_0_5px_rgba(186,230,253,0.8)]" />
          <span data-tear className="absolute right-[25%] top-[58%] h-3 w-2 rounded-b-full rounded-t-[70%] bg-sky-100/90 shadow-[0_0_5px_rgba(186,230,253,0.7)]" />
        </>
      )}

      {activity === 'defeated' && (
        <>
          <span data-tear className="absolute left-[29%] top-[52%] h-4 w-2.5 rounded-b-full rounded-t-[70%] bg-sky-200 shadow-[0_0_7px_rgba(125,211,252,0.9)]" />
          <span data-tear className="absolute right-[27%] top-[55%] h-4 w-2.5 rounded-b-full rounded-t-[70%] bg-sky-100 shadow-[0_0_7px_rgba(125,211,252,0.9)]" />
          <span data-tear className="absolute left-[46%] top-[64%] h-3 w-2 rounded-b-full rounded-t-[70%] bg-cyan-100/90" />
        </>
      )}

      {activity === 'proud' && (
        <>
          <span className="absolute -inset-3 -z-10 animate-pulse rounded-full bg-amber-300/15 blur-md" />
          <span className="absolute -right-2 top-0 h-2.5 w-2.5 rotate-45 animate-pulse bg-amber-100 shadow-[0_0_9px_rgba(253,230,138,0.9)]" />
          <span className="absolute -left-3 bottom-3 h-1.5 w-1.5 rotate-45 animate-pulse bg-yellow-200/90" />
        </>
      )}

      {activity === 'energized' && (
        <>
          <span data-float-effect className="absolute -left-2 top-1/2 h-2 w-2 rotate-45 bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
          <span data-float-effect className="absolute right-0 top-1/3 h-2.5 w-1.5 bg-orange-300 shadow-[0_0_8px_rgba(253,186,116,0.8)]" />
          <span data-float-effect className="absolute left-1/2 top-0 h-1.5 w-1.5 rotate-45 bg-yellow-100" />
        </>
      )}

      {activity === 'hungry' && (
        <span data-tear className="absolute bottom-1 right-[19%] h-4 w-2 rounded-b-full rounded-t-[70%] bg-sky-200/90" />
      )}

      {activity === 'relaxed' && (
        <>
          <span data-sleep-effect className="absolute -left-4 top-3 text-2xl font-black text-sky-50 drop-shadow-[0_0_5px_rgba(186,230,253,0.65)]">Z</span>
          <span data-sleep-effect className="absolute left-0 top-1 text-xl font-black text-sky-100/90">Z</span>
          <span data-sleep-effect className="absolute left-3 top-5 text-base font-black text-sky-200/85">z</span>
        </>
      )}

      {activity === 'celebrating' && (
        <>
          <span data-float-effect className="absolute -left-2 top-1 h-2 w-1.5 rotate-12 bg-red-300" />
          <span data-float-effect className="absolute left-1/3 -top-2 h-1.5 w-2 rotate-45 bg-cyan-200" />
          <span data-float-effect className="absolute -right-1 top-3 h-2 w-2 rounded-full bg-amber-300" />
        </>
      )}
    </div>
  );
}
