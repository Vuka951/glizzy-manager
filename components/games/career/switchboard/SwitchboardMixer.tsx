import SwitchboardPanel from '@/components/games/career/switchboard/SwitchboardPanel';
import SwitchboardStrip from '@/components/games/career/switchboard/SwitchboardStrip';
import BoltIcon from '@/components/icons/BoltIcon';
import MusicNotesIcon from '@/components/icons/MusicNotesIcon';
import SpeakerOffIcon from '@/components/icons/SpeakerOffIcon';
import SpeakerOnIcon from '@/components/icons/SpeakerOnIcon';
import SpeechBubbleIcon from '@/components/icons/SpeechBubbleIcon';
import { GAMES_UI } from '@/data/games/locale';
import { gameAudio, type AudioChannel, type GameAudioSettings } from '@/lib/utils/gameAudio';

const A = GAMES_UI.shared.audio;

const CHANNEL_ICONS: Record<
  AudioChannel,
  (props: { className?: string }) => React.ReactElement
> = {
  sfx: BoltIcon,
  music: MusicNotesIcon,
  voice: SpeechBubbleIcon,
};

// The sound section as a small mixing desk: the master strip, a brass bar,
// then a strip per channel
export default function SwitchboardMixer({
  settings,
  channels,
}: {
  settings: GameAudioSettings;
  channels: AudioChannel[];
}) {
  const silent = settings.muted || settings.volume === 0;
  const percent = settings.muted ? 0 : Math.round(settings.volume * 100);

  return (
    <SwitchboardPanel className="px-2 py-3">
      <ul className="flex gap-1.5">
        <SwitchboardStrip
          name={A.master}
          glyph={
            silent ? (
              <SpeakerOffIcon className="h-3 w-3" />
            ) : (
              <SpeakerOnIcon className="h-3 w-3" />
            )
          }
          level={percent}
          levelLabel={A.volume}
          on={!silent}
          switchLabel={silent ? A.unmute : A.mute}
          onLevel={(level) => gameAudio.setVolume(level / 100)}
          onSwitch={() => gameAudio.toggleMute()}
        />
        <li aria-hidden="true" className="w-px shrink-0 bg-[#9a6d24] shadow-[1px_0_0_rgb(0_0_0/0.7)]" />
        {channels.map((channel) => {
          const Glyph = CHANNEL_ICONS[channel];
          const copy = A.channels[channel];
          return (
            <SwitchboardStrip
              key={channel}
              name={copy.label}
              glyph={<Glyph className="h-3 w-3" />}
              level={Math.round(settings[`${channel}Volume`] * 100)}
              levelLabel={copy.volume}
              on={!settings[`${channel}Muted`]}
              switchLabel={copy.label}
              dimmed={silent}
              onLevel={(level) => gameAudio.setChannelVolume(channel, level / 100)}
              onSwitch={() => gameAudio.toggleChannel(channel)}
            />
          );
        })}
      </ul>
    </SwitchboardPanel>
  );
}
