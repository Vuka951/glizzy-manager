'use client';

import { useCareerFrames } from '@/components/games/career/careerFrames';
import StreetBoard from '@/components/games/career/street/StreetBoard';
import { studioAccents } from '@/lib/constants/studioThemes';

// Where each bulb hangs on the two strings that sag from the hall's corners to
// a hook above the round sign
const BULBS = [
  'left-[5.8%] top-[9px]',
  'left-[13.5%] top-[14px]',
  'left-[21.3%] top-[17px]',
  'left-[29.2%] top-[17px]',
  'left-[70.8%] top-[17px]',
  'left-[78.7%] top-[17px]',
  'left-[86.5%] top-[14px]',
  'left-[94.2%] top-[9px]',
];

// The hall the table stands in: festoon lights strung to the round sign, the
// stage the table and its overlays share, and the control underneath
export default function MatchTableFrame({
  theme,
  label,
  footer,
  children,
}: {
  theme: number;
  label: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  const street = useCareerFrames() === 'street';
  const accent = studioAccents(theme);
  const festoon = (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-6"
    >
      <svg
        viewBox="0 0 100 24"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <path
          d="M1 5Q25 30 50 3Q75 30 99 5"
          className="fill-none stroke-[#94a3b8]/45"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {BULBS.map((spot, i) => (
        <span
          key={spot}
          className={`absolute h-2 w-1.5 -translate-x-1/2 rounded-b-full ${spot} ${
            i % 2 === 0
              ? accent.tableBulb
              : 'bg-[#fef3c7] shadow-[0_0_7px_1px_rgba(254,243,199,0.6)]'
          }`}
        />
      ))}
    </div>
  );
  if (street) {
    return (
      <StreetBoard className="mx-auto w-full max-w-xl">
        <div className="relative isolate flex w-full flex-col items-center gap-3 rounded-[5px] bg-[#17100c] bg-[repeating-linear-gradient(90deg,transparent_0_54px,rgb(255_255_255/0.018)_54px_56px)] p-4 shadow-[inset_0_3px_10px_rgb(0_0_0/0.8)] sm:p-5">
          {festoon}
          <span className="relative min-h-[1.625rem] min-w-[7rem] rounded-[3px] border-2 border-[#f1f5f9] bg-[#1e3a8a] px-3 py-0.5 text-center font-sign text-[14px] font-bold uppercase leading-tight tracking-[0.06em] text-[#ffffff] shadow-[0_0_0_1px_#0c1a44,0_3px_0_rgb(0_0_0/0.5)]">
            {label}
          </span>
          <div className="relative flex w-full justify-center">{children}</div>
          {footer}
        </div>
      </StreetBoard>
    );
  }
  return (
    <div
      className={`relative isolate flex w-full flex-col items-center gap-3 rounded-2xl border ${accent.panelBorder} p-4 sm:p-5 group-fullscreen:mx-auto group-fullscreen:max-w-xl`}
    >
      {/* The blur sits on its own layer: a backdrop filter on the frame itself
          would trap the fixed full-screen match overlays inside it */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-slate-950/45 backdrop-blur-[3px]"
      />
      {festoon}
      <span
        className={`relative min-h-[1.25rem] rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest ${accent.chip}`}
      >
        {label}
      </span>
      <div className="relative flex w-full justify-center">{children}</div>
      {footer}
    </div>
  );
}
