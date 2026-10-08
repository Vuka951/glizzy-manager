'use client';

import { useEffect, useRef } from 'react';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import { PARTY_SEAT_ORDER } from '@/data/games/careerElections';
import { GAMES_UI } from '@/data/games/locale';
import { electionNightSounds } from '@/lib/constants/cutsceneSounds';
import { SPONSOR_THEMES } from '@/lib/constants/sponsorThemes';
import type { SponsorId } from '@/lib/utils/careerSave';
import { playCutsceneClip } from '@/lib/utils/cutsceneSounds';

const SPONSOR_NAMES = GAMES_UI.career.sponsors.names as Record<
  SponsorId,
  string
>;
const BAR_STAGGER_MS = 220;
const BAR_GROW_MS = 900;

// The vote share as a horizontal bar chart, biggest list first. Bars grow
// in from the left one after another; the winner, once named, stays lit
// while the others fade back
export default function ElectionPollBars({
  votes,
  winner = null,
  animate = true,
  sound = false,
}: {
  votes: Record<SponsorId, number>;
  winner?: SponsorId | null;
  animate?: boolean;
  // Each bar whooshes in as it grows, for the live broadcast only
  sound?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const order = [...PARTY_SEAT_ORDER].sort((a, b) => votes[b] - votes[a]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || !animate) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const animations = Array.from(
      el.querySelectorAll<SVGRectElement>('[data-bar]'),
    ).map((rect, index) =>
      rect.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], {
        duration: BAR_GROW_MS,
        delay: index * BAR_STAGGER_MS,
        easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)',
        fill: 'both',
      }),
    );
    const whooshes = sound
      ? animations.map((_, index) =>
          window.setTimeout(
            () =>
              playCutsceneClip('throw-whoosh', electionNightSounds.barWhoosh),
            index * BAR_STAGGER_MS,
          ),
        )
      : [];
    return () => {
      animations.forEach((animation) => animation.cancel());
      whooshes.forEach((id) => window.clearTimeout(id));
    };
  }, [animate, sound, votes]);

  return (
    <div ref={rootRef} className="flex w-full flex-col gap-2">
      {order.map((id, index) => {
        const faded = winner !== null && winner !== id;
        const lit = winner === id;
        return (
          <div
            key={id}
            className={`grid grid-cols-[1.75rem_minmax(0,1fr)_2.5rem] items-center gap-2.5 transition-opacity duration-500 ${faded ? 'opacity-35' : 'opacity-100'}`}
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/70 ring-2 transition ${lit ? 'ring-white' : 'ring-transparent'}`}
            >
              <SponsorEmblem sponsorId={id} className="h-5 w-5" />
            </span>
            <span className="flex min-w-0 flex-col gap-1">
              <span className="truncate text-[11px] font-bold uppercase tracking-[0.18em] text-slate-200">
                {SPONSOR_NAMES[id]}
              </span>
              <svg
                viewBox="0 0 100 8"
                preserveAspectRatio="none"
                className="h-3 w-full overflow-visible rounded-sm bg-slate-800/80"
                aria-hidden="true"
              >
                <rect
                  data-bar=""
                  x="0"
                  y="0"
                  width={votes[id]}
                  height="8"
                  rx="1"
                  className={`origin-left ${SPONSOR_THEMES[id].bar}`}
                />
              </svg>
            </span>
            <span
              className={`text-right font-mono text-lg font-black tabular-nums opacity-0 [animation-fill-mode:forwards] animate-[bubblein_0.4s_ease-out] ${lit ? 'text-white' : 'text-slate-100'} ${index === 0 ? '[animation-delay:700ms]' : index === 1 ? '[animation-delay:900ms]' : index === 2 ? '[animation-delay:1100ms]' : '[animation-delay:1300ms]'}`}
            >
              {votes[id]}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
