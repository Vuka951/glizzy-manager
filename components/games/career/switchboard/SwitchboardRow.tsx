import BrassToggle from '@/components/games/career/switchboard/BrassToggle';
import SwitchboardLamp from '@/components/games/career/switchboard/SwitchboardLamp';

// One circuit on a panel: lamp, its name, and the switch that throws it
export default function SwitchboardRow({
  label,
  glyph,
  on,
  onSwitch,
}: {
  label: string;
  glyph?: React.ReactNode;
  on: boolean;
  onSwitch: () => void;
}) {
  return (
    <div className="flex items-center gap-2.5 border-t border-black/70 py-1 pl-3.5 pr-2.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.06)] first:border-t-0 first:shadow-none">
      <SwitchboardLamp on={on} />
      {glyph && (
        <span aria-hidden="true" className={on ? 'text-[#f0dca8]' : 'text-[#a3967e]'}>
          {glyph}
        </span>
      )}
      <span
        className={`min-w-0 flex-1 font-sign text-[16px] font-semibold leading-tight tracking-[0.02em] ${
          on ? 'text-[#f4ecda]' : 'text-[#a3967e]'
        }`}
      >
        {label}
      </span>
      <BrassToggle checked={on} label={label} onChange={onSwitch} />
    </div>
  );
}
