import { useSyncExternalStore } from 'react';
import BoltIcon from '@/components/icons/BoltIcon';
import MusicNotesIcon from '@/components/icons/MusicNotesIcon';
import SpeakerOffIcon from '@/components/icons/SpeakerOffIcon';
import SpeakerOnIcon from '@/components/icons/SpeakerOnIcon';
import SpeechBubbleIcon from '@/components/icons/SpeechBubbleIcon';
import ToggleSwitch from '@/components/games/ToggleSwitch';
import { GAMES_UI } from '@/data/games/locale';
import { COMMENTARY_VOICED } from '@/lib/constants/careerCommentaryVoice';
import { gameAudio, type AudioChannel } from '@/lib/utils/gameAudio';

const A = GAMES_UI.shared.audio;

const CHANNEL_ICONS: Record<
  AudioChannel,
  (props: { className?: string }) => React.ReactElement
> = {
  sfx: BoltIcon,
  music: MusicNotesIcon,
  voice: SpeechBubbleIcon,
};

// Master volume on top, then one row per channel with its own switch and
// level. `channels` trims the rows to what a game actually plays; an empty
// list leaves the master row alone
export default function AudioSettingsPanel({
  channels = ['sfx', 'music', 'voice'],
}: {
  channels?: AudioChannel[];
}) {
  const settings = useSyncExternalStore(
    gameAudio.subscribe,
    gameAudio.load,
    gameAudio.getServerSnapshot,
  );
  // The voice row only exists where the commentator has a voice bank
  const shownChannels = channels.filter(
    (channel) => channel !== 'voice' || COMMENTARY_VOICED,
  );
  const silent = settings.muted || settings.volume === 0;
  const percent = settings.muted ? 0 : Math.round(settings.volume * 100);

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-sky-200/10 bg-slate-800/40 text-left">
      <div className="flex items-center gap-3 px-3 py-2.5">
        <button
          type="button"
          onClick={() => gameAudio.toggleMute()}
          aria-label={silent ? A.unmute : A.mute}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition ${
            silent
              ? 'border-red-400/40 bg-red-500/15 text-red-300 hover:text-red-200'
              : 'border-sky-200/15 bg-slate-900/60 text-slate-200 hover:text-white'
          }`}
        >
          {silent ? <SpeakerOffIcon /> : <SpeakerOnIcon />}
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs font-semibold text-slate-100">{A.master}</span>
            <span className="text-[11px] font-bold tabular-nums text-slate-400">
              {percent}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={percent}
            onChange={(e) => gameAudio.setVolume(Number(e.target.value) / 100)}
            aria-label={A.volume}
            className="h-1 w-full cursor-pointer accent-amber-400"
          />
        </div>
      </div>
      {shownChannels.length > 0 && (
        <ul className="divide-y divide-sky-200/10 border-t border-sky-200/10">
          {shownChannels.map((channel) => {
            const on = !settings[`${channel}Muted`];
            const level = Math.round(settings[`${channel}Volume`] * 100);
            const copy = A.channels[channel];
            const Glyph = CHANNEL_ICONS[channel];
            return (
              <li
                key={channel}
                className={`flex flex-col gap-1.5 px-3 py-2.5 transition ${
                  silent ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition ${
                      on
                        ? 'border-amber-400/40 bg-amber-500/15 text-amber-200'
                        : 'border-sky-200/10 bg-slate-900/60 text-slate-500'
                    }`}
                  >
                    <Glyph className="h-4 w-4" />
                  </span>
                  <span
                    className={`min-w-0 flex-1 text-xs font-semibold transition ${
                      on ? 'text-slate-100' : 'text-slate-400'
                    }`}
                  >
                    {copy.label}
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
                    label={copy.label}
                    onChange={() => gameAudio.toggleChannel(channel)}
                  />
                </div>
                <div
                  className={`flex items-center gap-2 pl-11 transition ${
                    on ? '' : 'opacity-40'
                  }`}
                >
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={level}
                    onChange={(e) =>
                      gameAudio.setChannelVolume(channel, Number(e.target.value) / 100)
                    }
                    aria-label={copy.volume}
                    className="h-1 min-w-0 flex-1 cursor-pointer accent-amber-400"
                  />
                  <span className="w-8 shrink-0 text-right text-[11px] font-bold tabular-nums text-slate-400">
                    {level}%
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
