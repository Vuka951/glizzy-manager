import BrassToggle from '@/components/games/career/switchboard/BrassToggle';
import SwitchboardFader from '@/components/games/career/switchboard/SwitchboardFader';
import SwitchboardLamp from '@/components/games/career/switchboard/SwitchboardLamp';

// One channel of the desk, top to bottom: the masking-tape label a sound man
// writes on, the level, the fader, then the lamp and the switch
export default function SwitchboardStrip({
  name,
  glyph,
  level,
  levelLabel,
  on,
  switchLabel,
  dimmed = false,
  onLevel,
  onSwitch,
}: {
  name: string;
  glyph: React.ReactNode;
  level: number;
  levelLabel: string;
  on: boolean;
  switchLabel: string;
  dimmed?: boolean;
  onLevel: (level: number) => void;
  onSwitch: () => void;
}) {
  return (
    <li
      className={`flex min-w-0 flex-1 flex-col items-center gap-1 transition-opacity motion-reduce:transition-none ${
        dimmed ? 'opacity-50' : ''
      }`}
    >
      <span className="flex min-h-[34px] w-full items-center justify-center rounded-[1px] bg-[#e9dfc6] px-0.5 text-center font-sign text-[12px] font-bold uppercase leading-[1.05] tracking-[0.02em] text-[#2a2012] [overflow-wrap:anywhere] shadow-[0_1px_0_rgb(0_0_0/0.6)]">
        {name}
      </span>
      <span
        className={`flex items-center gap-1 font-sign text-[14px] font-semibold tabular-nums leading-none ${
          on ? 'text-[#f0dca8]' : 'text-[#a3967e]'
        }`}
      >
        <span aria-hidden="true">{glyph}</span>
        {level}%
      </span>
      <SwitchboardFader value={level} label={levelLabel} onChange={onLevel} />
      <SwitchboardLamp on={on} />
      <BrassToggle checked={on} label={switchLabel} onChange={onSwitch} />
    </li>
  );
}
