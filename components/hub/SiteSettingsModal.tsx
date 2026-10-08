'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import AudioSettingsPanel from '@/components/games/AudioSettingsPanel';
import GameModal from '@/components/games/GameModal';
import SettingsSection from '@/components/games/SettingsSection';
import Icon from '@/components/icons/Icon';
import LanguageSwitch from '@/components/shared/LanguageSwitch';
import ThemeChips from '@/components/shared/ThemeChips';
import { GAMES_UI } from '@/data/games/locale';
import { achievementStore } from '@/lib/utils/achievements';
import { careerSave } from '@/lib/utils/careerSave';
import { onboardingRequest } from '@/lib/utils/onboarding';

const S = GAMES_UI.shared;

// Site-wide settings behind the corner gear: the same panel the games open,
// minus the per-game rows, plus the tour and the full reset
export default function SiteSettingsModal({ onClose }: { onClose: () => void }) {
  const onHub = usePathname() === '/';
  const [confirmingReset, setConfirmingReset] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const showTutorial = () => {
    onClose();
    onboardingRequest.open();
  };

  // The games keep their state in memory and write it back on change, so
  // the wipe is followed by a reload instead of a store notification
  const resetEverything = () => {
    careerSave.clearAll();
    achievementStore.clear();
    window.location.reload();
  };

  return (
    <GameModal title={S.settings} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <SettingsSection label={S.language.title} first>
          <LanguageSwitch />
        </SettingsSection>

        <SettingsSection label={S.theme.title}>
          <ThemeChips />
        </SettingsSection>

        <SettingsSection label={S.audio.title}>
          <AudioSettingsPanel />
        </SettingsSection>

        <SettingsSection label={S.more}>
          <button
            type="button"
            onClick={showTutorial}
            className="w-full rounded-xl border border-sky-200/20 bg-slate-900/60 px-3 py-2 text-xs font-bold text-sky-200 transition hover:border-sky-200/50 hover:text-white"
          >
            {S.showTutorial}
          </button>
          {confirmingReset ? (
            <div className="flex flex-col gap-2 rounded-xl border border-red-400/40 bg-red-500/10 p-3">
              <p className="text-xs font-semibold text-red-200">{S.reset.confirm}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetEverything}
                  className="flex-1 rounded-lg border border-red-400/60 bg-red-500/30 px-3 py-1.5 text-xs font-bold text-red-100 transition hover:bg-red-500/50 hover:text-white"
                >
                  {S.reset.yes}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingReset(false)}
                  className="flex-1 rounded-lg border border-sky-200/20 bg-slate-900/60 px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:border-sky-200/50 hover:text-white"
                >
                  {S.reset.no}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingReset(true)}
              title={S.reset.title}
              className="w-full rounded-xl border border-red-400/30 bg-slate-900/60 px-3 py-2 text-xs font-bold text-red-300 transition hover:border-red-400/60 hover:text-red-200"
            >
              {S.reset.label}
            </button>
          )}
        </SettingsSection>

        {!onHub && (
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-1.5 border-t border-sky-200/10 pt-3 text-sm font-medium text-slate-400 transition hover:text-slate-200"
          >
            <Icon name="arrowLeft" className="h-4 w-4" />
            {S.backToHub}
          </Link>
        )}
      </div>
    </GameModal>
  );
}
