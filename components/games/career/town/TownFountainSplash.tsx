import { useEffect, useRef } from 'react';

const DROPS = 12;

export default function TownFountainSplash({ id, onDone }: { id: number; onDone: (id: number) => void }) {
  const ref = useRef<SVGGElement | null>(null);

  useEffect(() => {
    const drops = Array.from(ref.current?.children ?? []);
    const animations = drops.map((drop, i) => {
      const angle = -Math.PI * (0.08 + (0.84 * i) / (DROPS - 1));
      const reach = 22 + ((i * 7) % 5) * 5;
      const dx = Math.cos(angle) * reach;
      const dy = Math.sin(angle) * reach;
      return drop.animate(
        [
          { transform: 'translate(0px, 0px) scale(0.6)', opacity: 0 },
          { transform: `translate(${dx * 0.55}px, ${dy * 0.9}px) scale(1.1)`, opacity: 1, offset: 0.35 },
          { transform: `translate(${dx}px, ${dy * 0.4 + 30}px) scale(0.8)`, opacity: 0 },
        ],
        { duration: 760 + (i % 3) * 90, easing: 'cubic-bezier(0.2, 0.7, 0.4, 1)', fill: 'forwards' },
      );
    });
    const timer = setTimeout(() => onDone(id), 1000);
    return () => {
      clearTimeout(timer);
      animations.forEach((animation) => animation.cancel());
    };
  }, [id, onDone]);

  return (
    <g ref={ref}>
      {Array.from({ length: DROPS }, (_, i) => (
        <circle
          key={i}
          cx="55"
          cy="34"
          r={i % 3 === 0 ? 2.4 : 1.7}
          className={`origin-center opacity-0 [transform-box:fill-box] ${i % 2 ? 'fill-sky-200' : 'fill-cyan-100'}`}
        />
      ))}
    </g>
  );
}
