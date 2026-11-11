'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { useCareerFrames } from '@/components/games/career/careerFrames';
import { PAPER_PAINT } from '@/lib/utils/careerFrameClasses';
import { fullscreenHost } from '@/lib/utils/fullscreen';
import { effectiveZoom } from '@/lib/utils/zoom';

// A tap keeps the bubble up this long; on a phone there is no hover
export const HINT_VISIBLE_MS = 3500;
// The widest a bubble gets (max-w-56), so it can be kept inside the viewport
// before it is measured
const BUBBLE_HALF_WIDTH = 112;
const EDGE_MARGIN = 8;
const GAP = 6;
// The paper tag hangs on a string, which needs room to be seen
const TAG_GAP = 14;

type Spot = { x: number; y: number; zoom: number; string: number };

// A small bubble (a paper tag on a string in the career's street look) over
// whatever it wraps: shows while the pointer is on it,
// and a tap or click holds it open for a while. The bubble is rendered on
// the body and placed off the trigger's box, so a modal's edge never clips
// it; in fullscreen it goes into the fullscreen element, since nothing
// outside that element is drawn or the borderless cover hides it
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
  const street = useCareerFrames() === 'street';
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [spot, setSpot] = useState<Spot | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const open = (pinned || hovered) && spot !== null;

  // The spot lands on the bubble as custom properties its classes read, set
  // before paint so it never shows at the old place
  useLayoutEffect(() => {
    const bubble = bubbleRef.current;
    if (!open || !bubble || !spot) return;
    bubble.style.setProperty('--tip-x', `${spot.x}px`);
    bubble.style.setProperty('--tip-y', `${spot.y}px`);
    bubble.style.setProperty('--tip-zoom', `${spot.zoom}`);
    bubble.style.setProperty('--tip-string', `${spot.string}px`);
  }, [open, spot]);

  useEffect(() => {
    if (!pinned) return;
    const timer = setTimeout(() => setPinned(false), HINT_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [pinned]);

  const place = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    // The bubble is drawn at the trigger's zoom whatever zoom its host is
    // at, so the spot is worked out on screen and handed over in the
    // bubble's own pixels
    const zoom = effectiveZoom(trigger);
    const halfWidth = BUBBLE_HALF_WIDTH * zoom;
    const centre = rect.left + rect.width / 2;
    const x = Math.min(
      window.innerWidth - EDGE_MARGIN - halfWidth,
      Math.max(EDGE_MARGIN + halfWidth, centre),
    );
    const gap = (street ? TAG_GAP : GAP) * zoom;
    const y = placement === 'up' ? rect.top - gap : rect.bottom + gap;
    setSpot({
      x: x / zoom,
      y: y / zoom,
      zoom: zoom / effectiveZoom(fullscreenHost()),
      string: (centre - x) / zoom,
    });
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
      className={`relative ${street ? "after:absolute after:left-1/2 after:top-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']" : ''} ${className}`}
    >
      {children}
      {open &&
        createPortal(
          <span
            ref={bubbleRef}
            role="tooltip"
            className={`pointer-events-none fixed left-[var(--tip-x)] [zoom:var(--tip-zoom)] top-[var(--tip-y)] z-[100] w-max min-w-40 max-w-56 -translate-x-1/2 ${
              placement === 'up' ? '-translate-y-full' : ''
            } ${
              street
                ? `rounded-[3px] bg-[#ecdcb4] px-2.5 py-2 text-center text-[11px] font-semibold leading-snug text-slate-200 shadow-[inset_0_0_0_1px_rgb(120_90_40/0.35),0_3px_0_rgb(0_0_0/0.45)] transition-opacity duration-150 starting:opacity-0 motion-reduce:transition-none ${PAPER_PAINT}`
                : 'rounded-lg border border-sky-200/25 bg-slate-950/95 px-2 py-1.5 text-center text-[9px] font-semibold leading-snug text-slate-200 shadow-xl backdrop-blur-sm animate-[bubblein_0.2s_ease-out]'
            }`}
          >
            {street && (
              <>
                <span
                  aria-hidden="true"
                  className={`absolute left-[clamp(10px,calc(50%_+_var(--tip-string)),calc(100%_-_10px))] w-[1.5px] -translate-x-1/2 bg-[#b08440] ${
                    placement === 'up'
                      ? '-bottom-3.5 h-[18px]'
                      : '-top-3.5 h-[18px]'
                  }`}
                />
                <span
                  aria-hidden="true"
                  className={`absolute left-[clamp(10px,calc(50%_+_var(--tip-string)),calc(100%_-_10px))] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#2a1a0a] shadow-[0_0_0_1.5px_#b8862f] ${
                    placement === 'up' ? 'bottom-0.5' : 'top-0.5'
                  }`}
                />
              </>
            )}
            {content ?? text}
          </span>,
          fullscreenHost(),
        )}
    </button>
  );
}
