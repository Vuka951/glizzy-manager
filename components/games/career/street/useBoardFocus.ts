import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE =
  'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

function layer(board: HTMLElement): number {
  const host = board.closest<HTMLElement>('.fixed');
  return host ? Number(getComputedStyle(host).zIndex) || 0 : 0;
}

// Only the board on top answers the keyboard: a panel opened from another
// panel closes first, and the page's own Escape (leaving borderless) stays out.
// Layer before document order, because a vote can open under a board that was
// already up and still sits below it
function isTop(board: HTMLElement): boolean {
  const boards = [...document.querySelectorAll<HTMLElement>('[data-street-dialog]')];
  const highest = Math.max(...boards.map(layer));
  return boards.filter((b) => layer(b) === highest).at(-1) === board;
}

// A modal board keeps the keyboard while it is open: focus moves in, Tab stays
// inside, Escape closes it, and focus goes back to whatever opened it
export default function useBoardFocus(
  board: RefObject<HTMLElement | null>,
  onClose: (() => void) | undefined,
) {
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const el = board.current;
    if (!el) return;
    const opener = document.activeElement as HTMLElement | null;
    el.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isTop(el)) return;
      if (event.key === 'Escape') {
        event.stopPropagation();
        close.current?.();
        return;
      }
      if (event.key !== 'Tab') return;
      const keys = [...el.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (key) => key.getClientRects().length > 0 && !key.closest('[inert]'),
      );
      if (keys.length === 0) {
        event.preventDefault();
        return;
      }
      const first = keys[0];
      const last = keys[keys.length - 1];
      const at = document.activeElement;
      if (!el.contains(at) || (event.shiftKey ? at === first || at === el : at === last)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      opener?.focus?.({ preventScroll: true });
    };
  }, [board]);
}
