import { useEffect, useRef } from 'react';
import useAmbientMotion from '@/components/games/useAmbientMotion';
import type { TownBuildingMode } from '@/lib/types/town';
import { prefersReducedMotion } from '@/lib/utils/motion';

// The man on the bench beside the kiosk who every few seconds lowers his
// paper to peek over it. From the second level he is in a belted trench coat
// with a coffee beside him and two eye holes cut in the paper; at the top
// level a laptop on the bench glows, its cable running off to the truck parked
// on the kerb above the kiosk
export default function TownInformant({
  level,
  mode,
}: {
  level: number;
  mode: TownBuildingMode;
}) {
  const paperRef = useRef<SVGGElement>(null);
  const ambient = useAmbientMotion();
  const disguised = level >= 2;
  const wired = level >= 3;

  useEffect(() => {
    const paper = paperRef.current;
    if (!paper || mode !== 'open' || !ambient) return;
    if (prefersReducedMotion()) return;
    const peek = paper.animate(
      [
        { transform: 'translateY(0)', offset: 0 },
        { transform: 'translateY(0)', offset: 0.62 },
        { transform: 'translateY(3.5px)', offset: 0.68 },
        { transform: 'translateY(3.5px)', offset: 0.84 },
        { transform: 'translateY(0)', offset: 0.9 },
        { transform: 'translateY(0)', offset: 1 },
      ],
      { duration: 5200, iterations: Infinity, easing: 'ease-in-out' },
    );
    return () => peek.cancel();
  }, [mode, ambient]);

  return (
    <g>
      <rect x="88" y="84" width="34" height="4" className="fill-[#78350f]" />
      <path d="M92 88v8M118 88v8" className="stroke-[#57534e]" strokeWidth="2" />
      {wired && (
        <>
          <path
            d="M118 85q3 2 6.600 .6"
            className="fill-none stroke-[#111827]"
            strokeWidth="1.8"
          />
          {mode === 'open' && (
            <ellipse cx="116.6" cy="80" rx="7" ry="5" className="fill-cyan-300 opacity-25" />
          )}
          <path d="M112.4 84l1-6.6h7.4l-1 6.6z" className="fill-[#334155]" />
          <path
            d="M113.4 83.2l.8-5h5.6l-.8 5z"
            className={mode === 'abandoned' ? 'fill-[#1e293b]' : mode === 'shut' ? 'fill-[#475569]' : 'fill-cyan-200'}
          />
          <rect x="111" y="83.4" width="10.6" height="1.2" rx="0.4" className="fill-[#475569]" />
        </>
      )}
      {disguised && (
        <g>
          <rect x="89.4" y="80.6" width="3.2" height="3.4" rx="0.6" className="fill-[#f5f5f4]" />
          <rect x="89.4" y="81.6" width="3.2" height="0.9" className="fill-[#b45309]" />
          <path d="M90.2 80q.6-1.4 0-2.6M91.8 80q.6-1.4 0-2.6" className="fill-none stroke-[#e7e5e4] opacity-60" strokeWidth="0.5" />
        </g>
      )}
      <path
        d="M97 87l1.5-17h11l1.5 17z"
        className={disguised ? 'fill-[#a1784b]' : 'fill-[#57534e]'}
      />
      {disguised && (
        <>
          <path d="M97.6 80.4h12.8" className="stroke-[#6b4f2e]" strokeWidth="1.4" />
          <rect x="102.6" y="79.4" width="2.8" height="2" rx="0.4" className="fill-none stroke-[#d6b08c]" strokeWidth="0.6" />
        </>
      )}
      <path d="M100 87v8M108 87v8" className="stroke-[#27272a]" strokeWidth="2.6" />
      <circle cx="104" cy="66" r="4.5" className="fill-[#d6b08c]" />
      {disguised ? (
        <path d="M100.6 64.8h7.2v1.6h-7.2z" className="fill-[#0b0f19]" />
      ) : (
        <>
          <circle cx="102.2" cy="65.6" r="0.75" className="fill-[#0b0f19]" />
          <circle cx="105.2" cy="65.6" r="0.75" className="fill-[#0b0f19]" />
        </>
      )}
      <path d="M98 63.5h12l-2-4.5h-8z" className="fill-[#3f3f46]" />
      <rect x="97" y="62.8" width="14" height="1.6" className="fill-[#27272a]" />
      <g ref={paperRef} className="[transform-box:fill-box]">
        <rect x="95" y="64.5" width="18" height="13" className="fill-[#e7e5e4]" />
        <path d="M104 64.5v13" className="stroke-[#a8a29e]" strokeWidth="0.6" />
        <rect x="96.5" y="66" width="6" height="2.4" className="fill-[#1c1917]" />
        <path d="M96.5 70.5h6M96.5 73h6M105.5 67h6M105.5 69.5h6M105.5 72h6" className="stroke-[#78716c]" strokeWidth="0.8" />
        {disguised && (
          <g>
            <circle cx="102.4" cy="66.8" r="1.25" className="fill-[#0b0f19]" />
            <circle cx="105.6" cy="66.8" r="1.25" className="fill-[#0b0f19]" />
            <circle cx="102.7" cy="66.8" r="0.5" className="fill-[#f8fafc]" />
            <circle cx="105.9" cy="66.8" r="0.5" className="fill-[#f8fafc]" />
          </g>
        )}
      </g>
    </g>
  );
}
