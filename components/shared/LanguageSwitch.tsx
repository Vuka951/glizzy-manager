'use client';

import { ACTIVE_LOCALE, GAMES_UI, LOCALES, type Locale } from '@/data/games/locale';
import { switchLocale } from '@/lib/utils/localeSwitch';

const L = GAMES_UI.shared.language;

// One button per language, names spelled out. `onSwitch` replaces the plain
// reload for a caller that has state to park first
export default function LanguageSwitch({
  onSwitch = switchLocale,
}: {
  onSwitch?: (locale: Locale) => void;
}) {
  return (
    <div
      role="group"
      aria-label={L.title}
      className="flex w-full shrink-0 overflow-hidden rounded-lg border border-sky-200/15 bg-slate-900/60"
    >
      {LOCALES.map((locale) => {
        const active = locale === ACTIVE_LOCALE;
        return (
          <button
            key={locale}
            type="button"
            lang={locale}
            aria-pressed={active}
            aria-label={L[locale]}
            title={L[locale]}
            data-locale={locale}
            onClick={() => {
              if (!active) onSwitch(locale);
            }}
            className={`flex-1 px-3 py-2 text-xs font-bold transition ${
              active
                ? 'bg-amber-500/20 text-amber-200 light:text-amber-800'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            {L[locale]}
          </button>
        );
      })}
    </div>
  );
}
