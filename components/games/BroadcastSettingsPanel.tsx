import { useSyncExternalStore } from 'react';
import Icon from '@/components/icons/Icon';
import ToggleSwitch from '@/components/games/ToggleSwitch';
import { GAMES_UI } from '@/data/games/locale';
import type { IconName } from '@/lib/constants/icons';
import {
  readGameSettings,
  readServerGameSettings,
  subscribeGameSettings,
  writeGameSettings,
  type GameSettings,
} from '@/lib/utils/gameSettings';

const A = GAMES_UI.shared.audio;
const B = GAMES_UI.shared.broadcast;

type BroadcastToggle = keyof GameSettings;

const TOGGLE_ICONS: Record<BroadcastToggle, IconName> = {
  commentator: 'microphone',
  cutscenes: 'movie',
};

// On/off rows for what the broadcast layers over a game, styled like the
// audio channel rows. `toggles` trims them to what a game actually shows
export default function BroadcastSettingsPanel({
  toggles,
}: {
  toggles: BroadcastToggle[];
}) {
  const settings = useSyncExternalStore(
    subscribeGameSettings,
    readGameSettings,
    readServerGameSettings,
  );

  return (
    <ul className="w-full divide-y divide-sky-200/10 overflow-hidden rounded-2xl border border-sky-200/10 bg-slate-800/40 text-left">
      {toggles.map((toggle) => {
        const on = settings[toggle];
        return (
          <li key={toggle} className="flex items-center gap-3 px-3 py-2.5">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition ${
                on
                  ? 'border-amber-400/40 bg-amber-500/15 text-amber-200'
                  : 'border-sky-200/10 bg-slate-900/60 text-slate-500'
              }`}
            >
              <Icon name={TOGGLE_ICONS[toggle]} className="h-4 w-4" />
            </span>
            <span
              className={`min-w-0 flex-1 text-xs font-semibold transition ${
                on ? 'text-slate-100' : 'text-slate-400'
              }`}
            >
              {B[toggle]}
            </span>
            <span
              className={`shrink-0 text-[9px] font-bold uppercase tracking-wider transition ${
                on ? 'text-amber-200' : 'text-slate-500'
              }`}
            >
              {on ? A.on : A.off}
            </span>
            <ToggleSwitch
              checked={on}
              label={B[toggle]}
              onChange={() => writeGameSettings({ [toggle]: !on })}
            />
          </li>
        );
      })}
    </ul>
  );
}
