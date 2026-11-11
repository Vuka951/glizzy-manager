import { useState, useSyncExternalStore, type RefObject } from 'react';
import AchievementsBoard from '@/components/games/AchievementsBoard';
import Icon from '@/components/icons/Icon';
import AudioSettingsPanel from '@/components/games/AudioSettingsPanel';
import BroadcastSettingsPanel from '@/components/games/BroadcastSettingsPanel';
import ChoiceChip from '@/components/games/ChoiceChip';
import DisplayModePanel from '@/components/games/DisplayModePanel';
import SettingsSection from '@/components/games/SettingsSection';
import SponsorModal from '@/components/games/career/SponsorModal';
import BrassPlate from '@/components/games/career/street/BrassPlate';
import { useCareerFrames } from '@/components/games/career/careerFrames';
import LanguageSwitch from '@/components/shared/LanguageSwitch';
import { achievementsForGame, type AchievementGame } from '@/data/games/achievements';
import { GAMES_UI } from '@/data/games/locale';
import { achievementStore, unlockedCount } from '@/lib/utils/achievements';
import { STREET_TRAY } from '@/lib/utils/careerFrameClasses';
import type { SponsorId } from '@/lib/utils/careerSave';
import type { AudioChannel } from '@/lib/utils/gameAudio';
import {
  readGameSettings,
  readServerGameSettings,
  subscribeGameSettings,
  writeGameSettings,
  type GameSettings,
} from '@/lib/utils/gameSettings';

const A = GAMES_UI.achievements;
const TOWN = GAMES_UI.career.town;

// The settings panel both games open from the gear: sound levels are shared,
// `broadcastToggles` lists the broadcast layers (commentator, cutscenes) the
// game has, and `children` carries whatever else it wants to expose (restart).
// `townDisplay` adds the career town's label and animation level choices to
// the display section. The career's street look lays the same sections out as
// a two-column switchboard
export default function GameSettingsModal({
  fullscreenTarget,
  channels,
  broadcastToggles = [],
  sponsorId = null,
  achievementGame,
  townDisplay = false,
  onClose,
  children,
}: {
  // The game card the display mode applies to
  fullscreenTarget: RefObject<HTMLElement | null>;
  channels?: AudioChannel[];
  broadcastToggles?: (keyof GameSettings)[];
  sponsorId?: SponsorId | null;
  // The game whose trophies the panel counts and opens
  achievementGame?: AchievementGame;
  townDisplay?: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}) {
  const display = useSyncExternalStore(
    subscribeGameSettings,
    readGameSettings,
    readServerGameSettings,
  );
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
  const street = useCareerFrames() === 'street';
  const keyBank = street ? `w-full p-1.5 pb-2 ${STREET_TRAY}` : '';

  const audioSection = (
    <SettingsSection label={GAMES_UI.shared.audio.title} first>
      <AudioSettingsPanel channels={channels} />
    </SettingsSection>
  );
  const broadcastSection = broadcastToggles.length > 0 && (
    <SettingsSection label={GAMES_UI.shared.broadcast.title}>
      <BroadcastSettingsPanel toggles={broadcastToggles} />
    </SettingsSection>
  );
  const displaySection = (
    <SettingsSection label={GAMES_UI.shared.display.title}>
      <DisplayModePanel targetRef={fullscreenTarget} />
      {townDisplay && (
        <div className="flex w-full flex-col gap-1.5 text-left">
          <BrassPlate className="self-start">{TOWN.labelsMode.title}</BrassPlate>
          <div className={`grid grid-cols-2 gap-1.5 ${keyBank}`}>
            <ChoiceChip
              active={display.townLabels === 'always'}
              label={TOWN.labelsMode.always}
              onClick={() => writeGameSettings({ townLabels: 'always' })}
            />
            <ChoiceChip
              active={display.townLabels === 'hover'}
              label={TOWN.labelsMode.hover}
              onClick={() => writeGameSettings({ townLabels: 'hover' })}
            />
          </div>
          <BrassPlate className="mt-1.5 self-start">{TOWN.motion.title}</BrassPlate>
          <div className={`grid grid-cols-2 gap-1.5 ${keyBank}`}>
            <ChoiceChip
              active={display.townMotion === 'full'}
              label={TOWN.motion.full}
              onClick={() => writeGameSettings({ townMotion: 'full' })}
            />
            <ChoiceChip
              active={display.townMotion === 'lite'}
              label={TOWN.motion.lite}
              onClick={() => writeGameSettings({ townMotion: 'lite' })}
            />
          </div>
        </div>
      )}
    </SettingsSection>
  );
  const languageSection = (
    <SettingsSection label={GAMES_UI.shared.language.title}>
      <LanguageSwitch />
    </SettingsSection>
  );
  const trophiesSection = achievementGame && (
    <SettingsSection label={A.page.title}>
      <button
        type="button"
        onClick={() => setTrophiesOpen(true)}
        aria-label={A.page.open}
        title={A.page.open}
        className={
          street
            ? 'flex min-h-11 w-full items-center justify-center gap-2 rounded-[3px] bg-gradient-to-b from-[#e8c066] to-[#a8782a] px-3 text-[#2a1a0a] shadow-[inset_0_1px_0_rgb(255_255_255/0.45),0_2px_0_rgb(0_0_0/0.65)] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0dca8] motion-reduce:transition-none'
            : `flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 transition hover:border-yellow-300 hover:text-white ${
                trophiesComplete
                  ? 'border-yellow-300/60 bg-yellow-400/15 text-yellow-200'
                  : 'border-yellow-300/35 bg-slate-900/60 text-yellow-300'
              }`
        }
      >
        <Icon
          name="trophy"
          className={`h-4 w-4 ${trophiesComplete ? '' : 'fill-none stroke-current stroke-[1.5]'}`}
        />
        <span
          className={
            street
              ? 'font-sign text-[18px] font-bold leading-none tabular-nums'
              : 'font-mono text-sm font-black tabular-nums'
          }
        >
          {trophiesDone}/{trophies.length}
        </span>
      </button>
    </SettingsSection>
  );

  return (
    <SponsorModal
      sponsorId={sponsorId}
      title={GAMES_UI.shared.settings}
      wide={street}
      onClose={onClose}
    >
      {street ? (
        <div className="flex flex-col gap-3">
          <div className="grid gap-3 sm:min-h-[32rem] sm:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-3">
              {audioSection}
              {languageSection}
            </div>
            <div className="flex min-w-0 flex-col gap-3">
              {broadcastSection}
              {displaySection}
              {trophiesSection}
            </div>
          </div>
          {children}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {audioSection}
          {broadcastSection}
          {displaySection}
          {languageSection}
          {trophiesSection}
          {children}
        </div>
      )}
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
