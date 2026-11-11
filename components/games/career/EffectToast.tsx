import CareerToast from '@/components/games/career/CareerToast';

export default function EffectToast({
  title,
  lines,
}: {
  title: string;
  lines: { text: string; good: boolean }[];
}) {
  return (
    <CareerToast tone="danger">
      <span className="block">{title}</span>
      {lines.length > 0 && (
        <span className="mt-1.5 flex flex-wrap justify-end gap-1.5 border-t border-dashed border-slate-600 pt-1.5">
          {lines.map((line) => (
            <span
              key={line.text}
              className={`rounded-[2px] border-[1.5px] border-current px-1 font-sign text-[12px] font-bold leading-[1.25] tabular-nums ${
                line.good ? 'text-emerald-300' : 'text-red-300'
              }`}
            >
              {line.text}
            </span>
          ))}
        </span>
      )}
    </CareerToast>
  );
}
