'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

// A tap keeps the bubble up this long; on a phone there is no hover
export const HINT_VISIBLE_MS = 3500;
// The widest a bubble gets (max-w-56), so it can be kept inside the viewport
// before it is measured
const BUBBLE_HALF_WIDTH = 112;
const EDGE_MARGIN = 8;
const GAP = 6;

type Spot = { x: number; y: number };

// A small bubble over whatever it wraps: shows while the pointer is on it,
// and a tap or click holds it open for a while. The bubble is rendered on
// the body and placed off the trigger's box, so a modal's edge never clips
// it; in fullscreen it goes into the fullscreen element, since nothing
// outside that element is drawn
export default function HintTooltip({
  text,
  content,
  placement = 'up',
  className = '',
  children,
}: {
  // What a screen reader gets; the bubble shows `content` when given
  text: string;
  content?: ReactNode;
  placement?: 'up' | 'down';
  className?: string;
  children: ReactNode;
}) {
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [spot, setSpot] = useState<Spot | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const open = (pinned || hovered) && spot !== null;

  useEffect(() => {
    if (!pinned) return;
    const timer = setTimeout(() => setPinned(false), HINT_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [pinned]);

  const place = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const centre = rect.left + rect.width / 2;
    const x = Math.min(
      window.innerWidth - EDGE_MARGIN - BUBBLE_HALF_WIDTH,
      Math.max(EDGE_MARGIN + BUBBLE_HALF_WIDTH, centre),
    );
    setSpot({ x, y: placement === 'up' ? rect.top - GAP : rect.bottom + GAP });
  };

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={() => {
        place();
        setPinned((prev) => !prev);
      }}
      onMouseEnter={() => {
        place();
        setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}
      aria-label={text}
      className={`relative ${className}`}
    >
      {children}
      {open &&
        createPortal(
          <span
            role="tooltip"
            style={{ '--tip-x': `${spot.x}px`, '--tip-y': `${spot.y}px` } as React.CSSProperties}
            className={`pointer-events-none fixed left-[var(--tip-x)] top-[var(--tip-y)] z-[100] w-max min-w-40 max-w-56 -translate-x-1/2 rounded-lg border border-sky-200/25 bg-slate-950/95 px-2 py-1.5 text-center text-[9px] font-semibold leading-snug text-slate-200 shadow-xl backdrop-blur-sm animate-[bubblein_0.2s_ease-out] ${
              placement === 'up' ? '-translate-y-full' : ''
            }`}
          >
            {content ?? text}
          </span>,
          document.fullscreenElement ?? document.body,
        )}
    </button>
  );
}
