import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import TownSceneryBackdropScene from '@/components/games/career/town/TownSceneryBackdropScene';
import TownWeather from '@/components/games/career/town/TownWeather';
import useSceneMotion from '@/components/games/useSceneMotion';
import { townEditionIndex } from '@/lib/constants/townEditions';
import { type BackdropFraming, backdropFraming } from '@/lib/utils/backdropFraming';

// Remembered across screens so a season change can crossfade even when the
// backdrop remounts in a different wrapper
let lastShownSeason: number | null = null;

// The town's own night scenery without the town: same sky, hills, tree line,
// ground and edition trees, cropped to cover any container, with the
// edition's weather falling on top. The middle stays calm so the screen on
// top reads first. The scene waits for the first measure so a phone-shaped
// box never flashes the desk crop
export default function SeasonBackdrop({ season }: { season: number }) {
  const seasonIndex = townEditionIndex(season);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fadeRef = useRef<HTMLDivElement | null>(null);
  const prevSeasonRef = useRef(seasonIndex);
  const [framing, setFraming] = useState<BackdropFraming | null>(null);
  const [onScreen, setOnScreen] = useState(true);
  const [fadeFrom, setFadeFrom] = useState<number | null>(() =>
    lastShownSeason !== null && lastShownSeason !== seasonIndex ? lastShownSeason : null,
  );

  useEffect(() => {
    if (prevSeasonRef.current !== seasonIndex) {
      setFadeFrom(prevSeasonRef.current);
      prevSeasonRef.current = seasonIndex;
    }
    lastShownSeason = seasonIndex;
  }, [seasonIndex]);

  const measured = framing !== null;

  useEffect(() => {
    if (fadeFrom === null || !measured) return;
    const el = fadeRef.current;
    const animation = el?.animate(
      [
        { opacity: 1, transform: 'scale(1)' },
        { opacity: 0, transform: 'scale(1.015)' },
      ],
      {
        duration: 1800,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards',
      },
    );
    const timer = setTimeout(() => setFadeFrom(null), 1900);
    return () => {
      animation?.cancel();
      clearTimeout(timer);
    };
  }, [fadeFrom, measured]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (w === 0 || h === 0) return;
      const next = backdropFraming(w, h);
      setFraming((prev) => (prev?.viewBox === next.viewBox && prev.layout === next.layout ? prev : next));
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(el);
    const visibility = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    visibility.observe(el);
    return () => {
      resize.disconnect();
      visibility.disconnect();
    };
  }, []);

  useSceneMotion(containerRef, seasonIndex, !onScreen, framing?.layout ?? '');

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {framing && <TownSceneryBackdropScene season={seasonIndex} framing={framing} />}
      {framing && fadeFrom !== null && (
        <div ref={fadeRef} className="absolute inset-0">
          <TownSceneryBackdropScene season={fadeFrom} framing={framing} />
        </div>
      )}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_42%_38%_at_50%_52%,rgba(2,6,23,0.3)_0%,rgba(2,6,23,0.12)_60%,transparent_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,transparent_0%,rgba(2,6,23,0.06)_52%,rgba(2,6,23,0.42)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-slate-950/10" />
      <TownWeather season={seasonIndex} paused={!onScreen} followsMotionLevel={false} />
    </div>
  );
}
