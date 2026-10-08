import { useEffect, useState } from 'react';

// A number that rolls from zero to its target, the way a studio graphic lands
export default function useCountUp(target: number, durationMs = 1000): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame = 0;
    const startedAt = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - startedAt) / durationMs);
      const eased = 1 - (1 - t) * (1 - t) * (1 - t);
      setValue(Math.round(target * eased));
      if (t < 1) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [target, durationMs]);
  return value;
}
