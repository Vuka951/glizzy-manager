import { useEffect, useLayoutEffect, useRef } from 'react';
import {
  TOWN_LAYOUTS,
  TOWN_PHONE_BREAKPOINT,
  type TownLayoutKey,
} from '@/lib/constants/townLayout';

// The phone canvas is taller than most phone stages; it fits the width and
// lets the top of the sky crop rather than shrinking the town
const PHONE_FIT_HEIGHT = 700;
const PARALLAX_QUERY = '(pointer: fine) and (prefers-reduced-motion: no-preference)';

// The stage box that clips the town, and the fixed design canvas inside it,
// scaled to fit and anchored at the bottom centre. `world` is drawn in canvas
// pixels; `children` are the unscaled HUD overlays on the stage
export default function TownStage({
  layout,
  onLayout,
  world,
  children,
}: {
  layout: TownLayoutKey;
  onLayout: (layout: TownLayoutKey) => void;
  world: React.ReactNode;
  children?: React.ReactNode;
}) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const onLayoutRef = useRef(onLayout);

  useEffect(() => {
    onLayoutRef.current = onLayout;
  }, [onLayout]);

  // Measured before paint, so the first frame is already scaled to fit
  useLayoutEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    // offsetWidth is in the element's own CSS pixels, so the app's
    // --game-zoom does not leak into the scale
    const measure = () => {
      const w = stage.offsetWidth;
      const h = stage.offsetHeight;
      if (w === 0 || h === 0) return;
      const desk = TOWN_LAYOUTS.desk;
      const deskScale = Math.min(w / desk.w, h / desk.h);
      const phoneScale = Math.min(w / TOWN_LAYOUTS.phone.w, h / PHONE_FIT_HEIGHT);
      // Tall stages such as a tablet held upright would shrink the square
      // into a strip under an empty sky, so they get the three rows too
      const key: TownLayoutKey =
        w < TOWN_PHONE_BREAKPOINT || phoneScale > deskScale * 1.3
          ? 'phone'
          : 'desk';
      const scale = key === 'phone' ? phoneScale : deskScale;
      canvas.style.setProperty('--town-scale', scale.toFixed(4));
      onLayoutRef.current(key);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || layout !== 'desk') return;
    if (!window.matchMedia(PARALLAX_QUERY).matches) return;
    let frame = 0;
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = stage.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
        stage.style.setProperty('--town-px', x.toFixed(3));
        stage.style.setProperty('--town-py', y.toFixed(3));
      });
    };
    const leave = () => {
      cancelAnimationFrame(frame);
      stage.style.setProperty('--town-px', '0');
      stage.style.setProperty('--town-py', '0');
    };
    stage.addEventListener('pointermove', move);
    stage.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(frame);
      stage.removeEventListener('pointermove', move);
      stage.removeEventListener('pointerleave', leave);
      leave();
    };
  }, [layout]);

  // A phone turned sideways keeps the square at full width and scrolls
  // rather than shrinking it to the short screen
  return (
    <div
      ref={stageRef}
      className="@container relative isolate h-[calc(100dvh/var(--game-zoom,1)_-_10rem)] min-h-[34rem] w-full overflow-hidden bg-[#020617] group-fullscreen:h-[calc(100dvh/var(--game-zoom,1))] phone-landscape:aspect-[1000/660] phone-landscape:h-auto phone-landscape:min-h-0 phone-landscape:group-fullscreen:h-auto"
    >
      <div
        ref={canvasRef}
        className={`absolute bottom-0 left-1/2 origin-bottom -translate-x-1/2 scale-(--town-scale) ${TOWN_LAYOUTS[layout].canvas}`}
      >
        {world}
      </div>
      {children}
    </div>
  );
}
