import type { DisplayMode } from '@/lib/constants/displayMode';
import { readDisplayMode, writeDisplayMode } from '@/lib/utils/displayMode';

type WebkitDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitFullscreenEnabled?: boolean;
  webkitExitFullscreen?: () => void;
};

type WebkitElement = HTMLElement & {
  webkitRequestFullscreen?: () => void;
};

type ExpandedMode = Exclude<DisplayMode, 'window'>;

// A borderless element wears this; the `fullscreen` variant in globals.css
// matches it next to the real :fullscreen, so both share one layout
const PSEUDO_ATTRIBUTE = 'data-pseudo-fullscreen';

// `layered` is a borderless game card over a page that is itself in real
// fullscreen: the click that asked for fullscreen came before the card
// was on the page
let pseudo: { el: HTMLElement; layered: boolean } | null = null;
// A start or join is waiting for its game card to mount
let pending = false;
// Set once the player leaves the expanded view, so later phases of the
// same game do not pull them back in
let optedOut = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function realElement(): Element | null {
  const doc = document as WebkitDocument;
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

function canRequestReal(el: HTMLElement): boolean {
  const doc = document as WebkitDocument;
  const target = el as WebkitElement;
  return (
    Boolean(doc.fullscreenEnabled || doc.webkitFullscreenEnabled) &&
    (typeof target.requestFullscreen === 'function' ||
      typeof target.webkitRequestFullscreen === 'function')
  );
}

function requestReal(el: HTMLElement, onRefused: () => void, onEntered?: () => void) {
  const target = el as WebkitElement;
  if (typeof target.requestFullscreen === 'function') {
    target.requestFullscreen({ navigationUI: 'hide' }).then(onEntered, onRefused);
  } else {
    target.webkitRequestFullscreen?.();
    onEntered?.();
  }
}

function exitReal() {
  const doc = document as WebkitDocument;
  if (typeof doc.exitFullscreen === 'function') {
    doc.exitFullscreen().catch(() => undefined);
  } else {
    doc.webkitExitFullscreen?.();
  }
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape' && pseudo && !pseudo.layered) {
    exitFullscreen();
  }
}

function setPseudo(el: HTMLElement | null, layered = false) {
  pseudo?.el.removeAttribute(PSEUDO_ATTRIBUTE);
  pseudo = el ? { el, layered } : null;
  if (el) {
    el.setAttribute(PSEUDO_ATTRIBUTE, '');
    document.addEventListener('keydown', onKeyDown);
  } else {
    document.removeEventListener('keydown', onKeyDown);
  }
  notify();
}

// A borderless element left standing when real fullscreen ends is a switch
// to Borderless; anything else is the player leaving
function onRealChange() {
  if (!realElement() && (!pseudo || pseudo.layered)) {
    optedOut = true;
    pending = false;
    if (pseudo) setPseudo(null);
  }
  notify();
}

if (typeof document !== 'undefined') {
  document.addEventListener('fullscreenchange', onRealChange);
  document.addEventListener('webkitfullscreenchange', onRealChange);
}

function enter(el: HTMLElement, mode: ExpandedMode) {
  optedOut = false;
  const real = realElement();
  if (mode === 'fullscreen' && canRequestReal(el)) {
    if (real === el || (real && pseudo?.el === el)) return;
    requestReal(
      el,
      () => setPseudo(el),
      () => {
        if (pseudo?.el === el) setPseudo(null);
      },
    );
    return;
  }
  setPseudo(el);
  if (real) exitReal();
}

export function subscribeFullscreen(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function currentFullscreenMode(): DisplayMode {
  if (realElement()) return 'fullscreen';
  return pseudo?.el.isConnected ? 'borderless' : 'window';
}

// iPhone Safari has no element fullscreen, an iframe may lack the permission
export function realFullscreenAvailable(): boolean {
  return typeof document !== 'undefined' && canRequestReal(document.documentElement);
}

// Where overlays portal to: nothing outside a fullscreen element is drawn,
// and a borderless element covers the body
export function fullscreenHost(): Element {
  if (pseudo?.el.isConnected) return pseudo.el;
  return realElement() ?? document.body;
}

function exitFullscreen() {
  optedOut = true;
  pending = false;
  if (pseudo) setPseudo(null);
  if (realElement()) exitReal();
}

// The stored game setting as this device can honor it
export function effectiveDisplayMode(): DisplayMode {
  const mode = readDisplayMode();
  return mode === 'fullscreen' && !realFullscreenAvailable() ? 'borderless' : mode;
}

// A pick in the game settings: stored for the next start and applied to
// the game right away, so picking the current mode again re-expands it
export function applyDisplayMode(mode: DisplayMode, el: HTMLElement | null) {
  writeDisplayMode(mode);
  if (!el) return;
  const wanted = effectiveDisplayMode();
  if (wanted === 'window') {
    if (currentFullscreenMode() !== 'window') exitFullscreen();
  } else {
    enter(el, wanted);
  }
}

// The click that starts a game whose card is already on the page
export function startGameFullscreen(el: HTMLElement | null) {
  optedOut = false;
  pending = false;
  const mode = effectiveDisplayMode();
  if (!el || mode === 'window' || currentFullscreenMode() !== 'window') return;
  enter(el, mode);
}

// A start or join whose card mounts later, through adoptGameFullscreen.
// `fresh` marks a new game and forgets an earlier exit; from a click
// (`gesture`), Fullscreen asks for the whole page while the gesture lasts
export function queueGameFullscreen({
  fresh,
  gesture = false,
}: {
  fresh: boolean;
  gesture?: boolean;
}) {
  if (fresh) optedOut = false;
  if (optedOut) return;
  const mode = effectiveDisplayMode();
  if (mode === 'window') return;
  pending = true;
  if (gesture && mode === 'fullscreen' && currentFullscreenMode() === 'window') {
    requestReal(document.documentElement, () => undefined);
  }
}

export function adoptGameFullscreen(el: HTMLElement | null) {
  if (!pending || !el) return;
  pending = false;
  if (optedOut || pseudo?.el === el || realElement() === el) return;
  setPseudo(el, realElement() !== null);
}
