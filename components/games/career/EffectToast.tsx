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
        <span className="mt-1.5 flex flex-wrap justify-end gap-1">
          {lines.map((line) => (
            <span
              key={line.text}
              className={`rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold ${
                line.good
                  ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300'
                  : 'border-red-500/40 bg-red-500/10 text-red-300'
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
