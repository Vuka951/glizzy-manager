'use client';

import { useState, useSyncExternalStore } from 'react';
import GearIcon from '@/components/icons/GearIcon';
import SiteSettingsModal from '@/components/hub/SiteSettingsModal';
import { GAMES_UI } from '@/data/games/locale';

const SCROLL_HIDE_AT = 96;

const subscribeScroll = (onChange: () => void) => {
  window.addEventListener('scroll', onChange, { passive: true });
  return () => window.removeEventListener('scroll', onChange);
};

// The one site control, a gear in the top-right corner. On a phone the game
// card's own fullscreen and gear buttons sit in that same corner once the
// page is scrolled, so it slides away there and comes back at the top
export default function SettingsButton() {
  const [open, setOpen] = useState(false);
  const scrolled = useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > SCROLL_HIDE_AT,
    () => false,
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={GAMES_UI.shared.settings}
        title={GAMES_UI.shared.settings}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`fixed right-3 top-3 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-frost-border/30 bg-slate-950/70 text-slate-300 opacity-80 shadow-lg backdrop-blur transition duration-300 hover:text-white hover:opacity-100 focus-visible:opacity-100 sm:right-4 sm:top-4 ${
          scrolled
            ? 'max-sm:pointer-events-none max-sm:-translate-y-16 max-sm:opacity-0'
            : ''
        }`}
      >
        <GearIcon className="h-5 w-5" />
      </button>
      {open && <SiteSettingsModal onClose={() => setOpen(false)} />}
    </>
  );
}
