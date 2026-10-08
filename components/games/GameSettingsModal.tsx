import { useState, useSyncExternalStore } from 'react';
import AchievementsBoard from '@/components/games/AchievementsBoard';
import Icon from '@/components/icons/Icon';
import AudioSettingsPanel from '@/components/games/AudioSettingsPanel';
import BroadcastSettingsPanel from '@/components/games/BroadcastSettingsPanel';
import SettingsSection from '@/components/games/SettingsSection';
import SponsorModal from '@/components/games/career/SponsorModal';
import LanguageSwitch from '@/components/shared/LanguageSwitch';
import { achievementsForGame, type AchievementGame } from '@/data/games/achievements';
import { GAMES_UI } from '@/data/games/locale';
import { achievementStore, unlockedCount } from '@/lib/utils/achievements';
import type { SponsorId } from '@/lib/utils/careerSave';
import type { AudioChannel } from '@/lib/utils/gameAudio';
import type { GameSettings } from '@/lib/utils/gameSettings';

const A = GAMES_UI.achievements;

// The settings panel both games open from the gear: sound levels are shared,
// `broadcastToggles` lists the broadcast layers (commentator, cutscenes) the
// game has, and `children` carries whatever else it wants to expose (restart)
export default function GameSettingsModal({
  channels,
  broadcastToggles = [],
  sponsorId = null,
  achievementGame,
  onClose,
  children,
}: {
  channels?: AudioChannel[];
  broadcastToggles?: (keyof GameSettings)[];
  sponsorId?: SponsorId | null;
  // The game whose trophies the panel counts and opens
  achievementGame?: AchievementGame;
  onClose: () => void;
  children?: React.ReactNode;
}) {
  const unlocked = useSyncExternalStore(
    achievementStore.subscribe,
    achievementStore.load,
    achievementStore.getServerSnapshot,
  );
  const [trophiesOpen, setTrophiesOpen] = useState(false);
  const trophies = achievementGame ? achievementsForGame(achievementGame) : [];
  const trophiesDone = unlockedCount(
    unlocked,
    trophies.map((a) => a.id),
  );
  const trophiesComplete = trophies.length > 0 && trophiesDone === trophies.length;

  return (
    <SponsorModal
      sponsorId={sponsorId}
      title={GAMES_UI.shared.settings}
      onClose={onClose}
    >
      <div className="flex flex-col gap-4">
        <SettingsSection label={GAMES_UI.shared.audio.title} first>
          <AudioSettingsPanel channels={channels} />
        </SettingsSection>

        {broadcastToggles.length > 0 && (
          <SettingsSection label={GAMES_UI.shared.broadcast.title}>
            <BroadcastSettingsPanel toggles={broadcastToggles} />
          </SettingsSection>
        )}

        <SettingsSection label={GAMES_UI.shared.language.title}>
          <LanguageSwitch />
        </SettingsSection>

        {achievementGame && (
          <SettingsSection label={A.page.title}>
            <button
              type="button"
              onClick={() => setTrophiesOpen(true)}
              aria-label={A.page.open}
              title={A.page.open}
              className={`flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 transition hover:border-yellow-300 hover:text-white ${
                trophiesComplete
                  ? 'border-yellow-300/60 bg-yellow-400/15 text-yellow-200'
                  : 'border-yellow-300/35 bg-slate-900/60 text-yellow-300'
              }`}
            >
              <Icon
                name="trophy"
                className={`h-4 w-4 ${trophiesComplete ? '' : 'fill-none stroke-current stroke-[1.5]'}`}
              />
              <span className="font-mono text-sm font-black tabular-nums">
                {trophiesDone}/{trophies.length}
              </span>
            </button>
          </SettingsSection>
        )}

        {children}
      </div>
      {trophiesOpen && achievementGame && (
        <SponsorModal
          sponsorId={sponsorId}
          title={A.page.title}
          wide
          onClose={() => setTrophiesOpen(false)}
        >
          <AchievementsBoard game={achievementGame} />
        </SponsorModal>
      )}
    </SponsorModal>
  );
}
