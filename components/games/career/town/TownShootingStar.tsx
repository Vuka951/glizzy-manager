import { useEffect, useRef } from 'react';
import TownSkyStreak from '@/components/games/career/town/TownSkyStreak';

export default function TownShootingStar({
  id,
  x,
  y,
  scale,
  gradient,
  onDone,
}: {
  id: number;
  x: number;
  y: number;
  scale: number;
  gradient: string;
  onDone: (id: number) => void;
}) {
  const ref = useRef<SVGGElement | null>(null);

  useEffect(() => {
    const animation = ref.current?.animate(
      [
        { transform: 'translate(0px, 0px)', opacity: 0 },
        { opacity: 1, offset: 0.1 },
        { transform: 'translate(-220px, 100px)', opacity: 0 },
      ],
      { duration: 1100, easing: 'ease-out', fill: 'forwards' },
    );
    if (!animation) return;
    animation.onfinish = () => onDone(id);
    return () => animation.cancel();
  }, [id, onDone]);

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g ref={ref} className="opacity-0">
        <TownSkyStreak gradient={gradient} />
      </g>
    </g>
  );
}
