// What the scene cost or paid, typed on the slip: each line prints in after
// the beat its delay class names
export default function CutsceneReceiptLines({
  lines,
  delays,
}: {
  lines: { text: string; good: boolean }[];
  delays: string[];
}) {
  if (lines.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-0.5 border-t border-dashed border-slate-500 pt-1.5">
      {lines.map((line, i) => (
        <span
          key={`${line.text}-${i}`}
          className={`font-sign text-[15px] font-bold leading-tight tabular-nums opacity-0 [animation-fill-mode:forwards] animate-[bubblein_0.35s_ease-out] ${
            line.good ? 'text-emerald-300' : 'text-red-300'
          } ${delays[Math.min(i, delays.length - 1)]}`}
        >
          {line.text}
        </span>
      ))}
    </div>
  );
}
