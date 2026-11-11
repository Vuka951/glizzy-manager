import type { TownBuildingMode } from '@/lib/types/town';
import type { TownLabels } from '@/lib/utils/gameSettings';

// The label hanging under (or over) a building, a white-rimmed enamel street
// sign with the action's name and its live sub-line. It goes dim once the
// building shuts for the night and dark and dusty while the place is still
// abandoned; `muted` greys it while the building is open but cannot be used
// right now. Labels shown only on hover follow the enclosing group/building,
// or `revealed` when the sign is drawn apart from it
export default function TownSign({
  name,
  sub,
  labels,
  mode,
  muted,
  placement,
  revealed = false,
}: {
  name: string;
  sub: string | null;
  labels: TownLabels;
  mode: TownBuildingMode;
  muted: boolean;
  placement: 'above' | 'mid' | 'roof' | 'below';
  revealed?: boolean;
}) {
  const plate =
    mode === 'abandoned'
      ? 'border-[#64748b]/60 bg-[#1e2a4a] text-[#94a3b8]/60'
      : mode === 'shut'
        ? 'border-[#cbd5e1]/70 bg-[#1e3a8a] text-[#e2e8f0]/70'
        : `border-[#ffffff] bg-[#1e3a8a] ${muted ? 'text-[#ffffff]/60 saturate-0' : 'text-[#ffffff]'}`;
  return (
    <span
      className={`pointer-events-none absolute z-10 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-[3px] border-2 px-2 py-[3px] font-sign text-[12px] font-bold uppercase leading-none tracking-[0.07em] shadow-[0_0_0_1px_#0c1a44,0_2px_0_rgba(2,6,23,0.6)] transition-[opacity,color,background-color] duration-700 ${
        placement === 'above'
          ? 'bottom-full left-1/2 mb-1'
          : placement === 'mid'
            ? 'left-1/2 top-[34%]'
            : placement === 'roof'
              ? 'bottom-[44%] left-[22%]'
              : 'left-1/2 top-full mt-1'
      } ${plate} ${
        labels !== 'hover' || revealed
          ? ''
          : 'opacity-0 group-hover/building:opacity-100 group-focus-visible/building:opacity-100'
      }`}
    >
      <span>{name}</span>
      {sub && (
        <span
          className={`text-[11px] font-extrabold tabular-nums tracking-normal ${
            mode !== 'open' || muted ? 'text-current' : 'text-[#fde68a]'
          }`}
        >
          {sub}
        </span>
      )}
    </span>
  );
}
