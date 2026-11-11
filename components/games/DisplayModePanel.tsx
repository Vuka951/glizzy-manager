import { useSyncExternalStore, type RefObject } from 'react';
import ChoiceChip from '@/components/games/ChoiceChip';
import { useCareerFrames } from '@/components/games/career/careerFrames';
import { GAMES_UI } from '@/data/games/locale';
import { displayModes } from '@/lib/constants/displayMode';
import { readServerDisplayMode, subscribeDisplayMode } from '@/lib/utils/displayMode';
import { STREET_TRAY } from '@/lib/utils/careerFrameClasses';
import {
  applyDisplayMode,
  effectiveDisplayMode,
  realFullscreenAvailable,
} from '@/lib/utils/fullscreen';

export default function DisplayModePanel({
  targetRef,
}: {
  targetRef: RefObject<HTMLElement | null>;
}) {
  const street = useCareerFrames() === 'street';
  const mode = useSyncExternalStore(
    subscribeDisplayMode,
    effectiveDisplayMode,
    readServerDisplayMode,
  );
  const options = realFullscreenAvailable()
    ? displayModes
    : displayModes.filter((option) => option !== 'fullscreen');

  return (
    <div
      className={`grid gap-1.5 ${options.length === 3 ? 'grid-cols-3' : 'grid-cols-2'} ${
        street ? `w-full p-1.5 pb-2 ${STREET_TRAY}` : ''
      }`}
    >
      {options.map((option) => (
        <ChoiceChip
          key={option}
          active={mode === option}
          label={GAMES_UI.shared.display.modes[option]}
          onClick={() => applyDisplayMode(option, targetRef.current)}
          className="py-1.5"
        />
      ))}
    </div>
  );
}
