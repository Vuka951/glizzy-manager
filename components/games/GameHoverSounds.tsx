'use client';

import { useRef, type PointerEvent, type ReactNode } from 'react';
import { playHoverSound } from '@/lib/utils/gameSounds';

const INTERACTIVE = [
  'button',
  'a[href]',
  'summary',
  'select',
  '[role="button"]',
  '[role="radio"]',
  '[role="tab"]',
  '[role="checkbox"]',
  '[role="switch"]',
  '[role="menuitem"]',
  '[role="option"]',
].join(',');
const MIN_GAP_MS = 60;

function hoverable(target: EventTarget | null): Element | null {
  if (!(target instanceof Element)) return null;
  const el = target.closest(INTERACTIVE);
  if (!el) return null;
  if (el.matches(':disabled, [aria-disabled="true"]')) return null;
  return el;
}

// Wraps one game: React's pointer events bubble through portals, so the
// game's own modals and fullscreen layer sound too while the page around
// it stays quiet. A sound plays on entering a control, not on moving
// between its children, and never for touch, where the tap is the feedback
export default function GameHoverSounds({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const current = useRef<Element | null>(null);
  const lastAt = useRef(0);
  const onOver = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return;
    const el = hoverable(event.target);
    if (el === current.current) return;
    current.current = el;
    if (!el) return;
    const now = performance.now();
    if (now - lastAt.current < MIN_GAP_MS) return;
    lastAt.current = now;
    playHoverSound();
  };
  return (
    <div className={className} onPointerOver={onOver}>
      {children}
    </div>
  );
}
