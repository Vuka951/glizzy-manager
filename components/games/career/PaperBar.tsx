// A flat bar on the paper report, value against max, in the caller's colour
export default function PaperBar({
  value,
  max,
  className,
}: {
  value: number;
  max: number;
  className: string;
}) {
  const width = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <svg
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      className="h-3 w-full"
      aria-hidden="true"
    >
      <rect x={0} y={0} width={100} height={10} className="fill-slate-900/10" />
      <rect x={0} y={0} width={width} height={10} className={className} />
    </svg>
  );
}
