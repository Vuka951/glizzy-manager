'use client';

import { useEffect, useRef } from 'react';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import { PARTY_SEAT_ORDER } from '@/data/games/careerElections';
import { GAMES_UI } from '@/data/games/locale';
import { electionNightSounds } from '@/lib/constants/cutsceneSounds';
import { SPONSOR_THEMES } from '@/lib/constants/sponsorThemes';
import type { SponsorId } from '@/lib/utils/careerSave';
import { playCutsceneClip } from '@/lib/utils/cutsceneSounds';
import { PARTY_PAINT } from '@/lib/utils/partyPaint';

const SPONSOR_NAMES = GAMES_UI.career.sponsors.names as Record<
  SponsorId,
  string
>;
const BAR_STAGGER_MS = 220;
const BAR_GROW_MS = 900;

// The vote share as a printed bar chart, biggest list first, each bar in the
// party's seat colour. Bars grow in from the left one after another; the
// winner, once named, stays lit while the others fade back. Dark-first, so it
// prints on a sheet as well as it reads on the broadcast
export default function ElectionPollBars({
  votes,
  winner = null,
  sound = false,
}: {
  votes: Record<SponsorId, number>;
  winner?: SponsorId | null;
  // Each bar whooshes in as it grows, for the live broadcast only
  sound?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const order = [...PARTY_SEAT_ORDER].sort((a, b) => votes[b] - votes[a]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
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
  }, [sound, votes]);

  return (
    <div ref={rootRef} className="flex w-full flex-col gap-2">
      {order.map((id, index) => {
        const faded = winner !== null && winner !== id;
        const lit = winner === id;
        return (
          <div
            key={id}
            className={`grid grid-cols-[1.75rem_minmax(0,1fr)_2.75rem] items-center gap-2.5 transition-opacity duration-500 ${PARTY_PAINT} ${faded ? 'opacity-35' : 'opacity-100'}`}
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full bg-[#0f172a]/70 ring-2 transition ${lit ? 'ring-[#ffffff]' : 'ring-transparent'}`}
            >
              <SponsorEmblem sponsorId={id} className="h-5 w-5" />
            </span>
            <span className="flex min-w-0 flex-col gap-1">
              <span className="truncate font-sign text-[14px] font-bold uppercase leading-tight tracking-[0.06em] text-slate-200">
                {SPONSOR_NAMES[id]}
              </span>
              <svg
                viewBox="0 0 100 8"
                preserveAspectRatio="none"
                className="h-3 w-full overflow-visible rounded-[2px] bg-slate-800 shadow-[inset_0_1px_2px_rgb(0_0_0/0.6)]"
                aria-hidden="true"
              >
                <rect
                  data-bar=""
                  x="0"
                  y="0"
                  width={votes[id]}
                  height="8"
                  className={`origin-left ${SPONSOR_THEMES[id].bar}`}
                />
              </svg>
            </span>
            <span
              className={`text-right font-sign text-[22px] font-bold tabular-nums opacity-0 [animation-fill-mode:forwards] animate-[bubblein_0.4s_ease-out] ${lit ? 'text-amber-300' : 'text-slate-100'} ${index === 0 ? '[animation-delay:700ms]' : index === 1 ? '[animation-delay:900ms]' : index === 2 ? '[animation-delay:1100ms]' : '[animation-delay:1300ms]'}`}
            >
              {votes[id]}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
