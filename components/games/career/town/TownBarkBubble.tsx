import { useEffect, useRef } from 'react';
import { GAMES_UI } from '@/data/games/locale';

export default function TownBarkBubble({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const animation = ref.current?.animate(
      [
        { transform: 'translateY(4px) scale(0.6)', opacity: 0 },
        { transform: 'translateY(-6px) scale(1)', opacity: 1, offset: 0.2 },
        { opacity: 1, offset: 0.8 },
        { transform: 'translateY(-16px) scale(1)', opacity: 0 },
      ],
      { duration: 1200, easing: 'ease-out', fill: 'forwards' },
    );
    const timer = setTimeout(onDone, 1200);
    return () => {
      clearTimeout(timer);
      animation?.cancel();
    };
  }, [onDone]);

  return (
    <span
      ref={ref}
      className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded-[3px] border-2 border-[#1c1408] bg-[#f1e8d3] px-2 py-0.5 font-sign text-[15px] font-bold leading-tight text-[#1c1408] shadow-[0_2px_0_rgb(2_6_23/0.55)]"
    >
      {GAMES_UI.career.town.bark}
    </span>
  );
}
