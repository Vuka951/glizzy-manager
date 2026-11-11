export default function TownScenerySnowDrift({ variant }: { variant: number }) {
  if (variant === 1) {
    return (
      <>
        <ellipse cx="-6" cy="-6" rx="13" ry="9" className="fill-[#1c4a3c]" />
        <ellipse cx="8" cy="-8" rx="12" ry="10" className="fill-[#225644]" />
        <ellipse cx="0" cy="-3" rx="17" ry="5" className="fill-[#163b30]" />
        <path d="M-17 -10q6-8 14-6q6-6 14-1q5 0 6 5q-8-2-14 1q-8-3-20 1z" className="fill-slate-50" />
        <circle cx="-6" cy="-6" r="1.6" className="fill-red-500" />
        <circle cx="6" cy="-4" r="1.6" className="fill-red-500" />
      </>
    );
  }
  if (variant === 2) {
    return (
      <>
        <path d="M-12 0q-2-10 6-14q8-4 14 2q6 6 4 12z" className="fill-[#55627a]" />
        <path d="M-10 -9q4-7 11-6q6 1 9 7q-10-3-20-1z" className="fill-slate-50" />
      </>
    );
  }
  return (
    <>
      <ellipse cx="0" cy="-2" rx="22" ry="6" className="fill-[#c8d6ea]" />
      <ellipse cx="-6" cy="-4" rx="12" ry="5" className="fill-slate-50" />
      <ellipse cx="9" cy="-3" rx="8" ry="3.5" className="fill-slate-50/90" />
    </>
  );
}
