import type { MeterTone } from '@/components/games/career/MetersPanel';

const SEGMENTS = 10;

const TONE_FILL: Record<MeterTone, string> = {
  great: 'bg-emerald-400',
  ok: 'bg-slate-200',
  warn: 'bg-amber-400',
  danger: 'bg-red-500',
};

// A meter read as a row of printed cells: one cell per ten points, the last
// one filled only partly. The colours take ink on paper from the paint remap
export default function CareerMeterGauge({
  value,
  tone,
}: {
  value: number;
  tone: MeterTone;
}) {
  const lit = Math.max(0, Math.min(SEGMENTS, Math.round(value / 10)));
  return (
    <span
      className="grid h-[6px] grid-cols-10 gap-[2px]"
    >
      {Array.from({ length: SEGMENTS }, (_, i) => (
        <span
          key={i}
          className={`rounded-[1px] transition-colors duration-500 ${
            i < lit ? TONE_FILL[tone] : 'bg-slate-800/90'
          }`}
        />
      ))}
    </span>
  );
}
