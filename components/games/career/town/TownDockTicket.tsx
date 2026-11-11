'use client';

import { useRef } from 'react';
import { GAMES_UI } from '@/data/games/locale';
import { playCutsceneClip } from '@/lib/utils/cutsceneSounds';

const TICKET = GAMES_UI.career.town.dockTicket;
const TAKE_MS = 380;

// One boat ticket lying on the holiday map, the whole of it a key: the trip on
// the body, what it comes to on the stub. Taking it lifts it off the map, then
// the trip starts. A shut one is grey
export default function TownDockTicket({
  icon,
  title,
  desc,
  sub,
  disabled,
  onTake,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  sub: string;
  disabled: boolean;
  onTake: () => void;
}) {
  const paper = useRef<HTMLSpanElement | null>(null);
  const taking = useRef(false);

  const take = () => {
    const el = paper.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onTake();
      return;
    }
    if (taking.current) return;
    taking.current = true;
    playCutsceneClip('paper-flutter', 0.6);
    const lift = el.animate(
      [
        { transform: 'translateY(0) scale(1)', opacity: 1 },
        { transform: 'translateY(-22%) scale(1.05)', opacity: 1, offset: 0.55 },
        { transform: 'translateY(-90%) scale(1.02)', opacity: 0 },
      ],
      { duration: TAKE_MS, easing: 'cubic-bezier(0.3, 0.7, 0.3, 1)', fill: 'both' },
    );
    lift.onfinish = () => {
      taking.current = false;
      if (el.isConnected) onTake();
      lift.cancel();
    };
  };

  return (
    <button
      type="button"
      onClick={take}
      disabled={disabled}
      className={`group relative block w-full max-w-md text-left drop-shadow-[0_4px_0_rgb(0_0_0/0.35)] transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#fde047] enabled:hover:-translate-y-1 enabled:hover:rotate-0 disabled:cursor-not-allowed motion-reduce:transition-none motion-reduce:enabled:hover:translate-y-0 -rotate-1`}
    >
      <span
        ref={paper}
        className={`relative flex w-full rounded-[6px] [mask:radial-gradient(circle_at_70%_0,transparent_7px,#000_7.5px)_top/100%_51%_no-repeat,radial-gradient(circle_at_70%_100%,transparent_7px,#000_7.5px)_bottom/100%_51%_no-repeat] ${
          disabled ? 'grayscale' : ''
        }`}
      >
        <span
          className={`flex w-[70%] min-w-0 flex-col gap-1 rounded-l-[6px] bg-[#6ee7b7] px-3 py-2.5 text-[#052e22]`}
        >
          <span className="flex items-center gap-1.5 font-sign text-[11px] font-bold uppercase tracking-[0.12em] [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0">
            {icon}
            {TICKET.label}
          </span>
          <span className="font-sign text-[20px] font-extrabold uppercase leading-none tracking-[0.02em] [overflow-wrap:anywhere]">
            {title}
          </span>
          <span className="flex items-center gap-1.5 font-sign text-[12px] font-bold uppercase tracking-[0.06em]">
            {TICKET.from}
            <span
              aria-hidden="true"
              className="h-0 min-w-3 flex-1 max-w-10 border-t-2 border-dashed border-current"
            />
            {TICKET.to}
          </span>
          <span className="text-[11px] font-medium leading-snug">{desc}</span>
        </span>
        <span
          className={`flex w-[30%] min-w-0 flex-col items-center justify-center gap-1 rounded-r-[6px] border-l-2 border-dashed border-[#065f46] bg-[#fde047] px-1.5 py-2.5 text-center text-[#3a2a02]`}
        >
          <span className="font-sign text-[14px] font-bold leading-tight tabular-nums [overflow-wrap:anywhere]">
            {sub}
          </span>
        </span>
      </span>
    </button>
  );
}
