'use client';

import { useSyncExternalStore } from 'react';
import MoonIcon from '@/components/icons/MoonIcon';
import SunIcon from '@/components/icons/SunIcon';
import { GAMES_UI } from '@/data/games/locale';
import { themeStore, type Theme } from '@/lib/utils/theme';

const T = GAMES_UI.shared.theme;

const OPTIONS: { theme: Theme; Glyph: typeof MoonIcon }[] = [
  { theme: 'dark', Glyph: MoonIcon },
  { theme: 'light', Glyph: SunIcon },
];

// Dark and light side by side, styled like the language switch so the two
// rows read as one family in the settings modal and the tour
export default function ThemeChips() {
  const current = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.load,
    themeStore.getServerSnapshot,
  );

  return (
    <div
      role="group"
      aria-label={T.title}
      className="flex w-full overflow-hidden rounded-lg border border-sky-200/15 bg-slate-900/60"
    >
      {OPTIONS.map(({ theme, Glyph }) => {
        const active = theme === current;
        return (
          <button
            key={theme}
            type="button"
            aria-pressed={active}
            data-theme={theme}
            onClick={() => themeStore.set(theme)}
            className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold transition ${
              active
                ? 'bg-amber-500/20 text-amber-200 light:text-amber-800'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            <Glyph className="h-3.5 w-3.5" />
            {T[theme]}
          </button>
        );
      })}
    </div>
  );
}
