// The warm pool a lit doorway throws on the pavement in front of it
export default function TownFacadeDoorLight({
  cx,
  cy,
  rx,
  tone = 'fill-[#fde68a]',
}: {
  cx: number;
  cy: number;
  rx: number;
  tone?: string;
}) {
  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx={rx}
      ry={Math.max(2.4, rx * 0.16)}
      className={`${tone} opacity-25 transition-opacity duration-300 group-hover/building:opacity-45`}
    />
  );
}
