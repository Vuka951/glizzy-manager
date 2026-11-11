// A roller shutter over a shop front, or a blind over a window, pulled down
// for the night. It rolls down from its top edge when the building shuts
export default function TownFacadeShutter({
  x,
  y,
  w,
  h,
  at = 0,
  kind = 'roller',
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  at?: number;
  kind?: 'roller' | 'blind';
}) {
  const roller = kind === 'roller';
  const step = roller ? 3 : 2.4;
  const ribs = Array.from(
    { length: Math.max(0, Math.floor(h / step) - 1) },
    (_, i) => `M${x} ${y + (i + 1) * step}h${w}`,
  ).join('');
  return (
    <g>
      <g
        data-facade-down=""
        data-at={at}
        className="origin-top [transform-box:fill-box]"
      >
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          className={roller ? 'fill-[#646e80]' : 'fill-[#4a5874]'}
        />
        <path
          d={ribs}
          className={roller ? 'stroke-[#454d5c]' : 'stroke-[#36425a]'}
          strokeWidth={roller ? 0.9 : 0.6}
        />
        {roller ? (
          <>
            <rect x={x} y={y + h - 2.2} width={w} height="2.2" className="fill-[#2f3542]" />
            <rect x={x + w / 2 - 2} y={y + h - 3.4} width="4" height="1.6" rx="0.6" className="fill-[#9ca3af]" />
          </>
        ) : (
          <rect x={x} y={y + h - 1.2} width={w} height="1.2" className="fill-[#6b7a96]" />
        )}
      </g>
      {roller && (
        <rect x={x - 1} y={y - 2.6} width={w + 2} height="3" rx="0.8" className="fill-[#2b313d]" />
      )}
    </g>
  );
}
