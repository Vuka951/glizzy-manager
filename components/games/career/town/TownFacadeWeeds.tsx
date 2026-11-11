const HEIGHTS = [7, 11, 5, 9, 13, 6, 10, 4, 8, 12];
const TONES = ['fill-[#6f9a3a]', 'fill-[#86b04a]', 'fill-[#5b8230]'];

// Weeds grown up along the foot of an abandoned building, a tuft every few
// units from x to x + w on the ground line y
export default function TownFacadeWeeds({
  x,
  y,
  w,
  seed = 0,
  scale = 1.3,
}: {
  x: number;
  y: number;
  w: number;
  seed?: number;
  scale?: number;
}) {
  const gap = 9 * scale;
  const tufts = Array.from({ length: Math.max(1, Math.floor(w / gap)) }, (_, i) => {
    const k = i + seed;
    return {
      key: i,
      x: x + i * gap + ((k * 5) % 4) * scale,
      h: HEIGHTS[k % HEIGHTS.length] * scale,
      tone: TONES[k % TONES.length],
    };
  });
  return (
    <g>
      {tufts.map((t) => (
        <path
          key={t.key}
          d={`M${t.x - 2.4 * scale} ${y}L${t.x - 4 * scale} ${y - t.h * 0.7}L${t.x - 0.9 * scale} ${y}zM${t.x - scale} ${y}L${t.x + 0.2 * scale} ${y - t.h}L${t.x + 1.3 * scale} ${y}zM${t.x + 0.8 * scale} ${y}L${t.x + 3.8 * scale} ${y - t.h * 0.55}L${t.x + 2.6 * scale} ${y}z`}
          className={t.tone}
        />
      ))}
    </g>
  );
}
