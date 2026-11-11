export default function TownSceneryAutumnBits({ variant }: { variant: number }) {
  if (variant === 1) {
    return (
      <>
        <rect x="-9" y="-10" width="4" height="10" rx="1.5" className="fill-[#e8d9b8]" />
        <path d="M-15 -9a8 6 0 0 1 16 0z" className="fill-[#c0392b]" />
        <circle cx="-10" cy="-12" r="1.2" className="fill-amber-50" />
        <rect x="4" y="-6" width="3" height="6" rx="1" className="fill-[#e8d9b8]" />
        <path d="M0 -5a6 4.5 0 0 1 11 0z" className="fill-[#a8471c]" />
      </>
    );
  }
  if (variant === 2) {
    return (
      <>
        <ellipse cx="0" cy="-3" rx="18" ry="5" className="fill-[#8f2431]" />
        <ellipse cx="-4" cy="-6" rx="10" ry="4" className="fill-[#c2531f]" />
        <ellipse cx="7" cy="-5" rx="7" ry="3" className="fill-[#e0802f]" />
        <path d="M-14 -3q3-4 6 0q-3 2-6 0zM10 -8q3-4 6 0q-3 2-6 0z" className="fill-[#f0a03c]" />
      </>
    );
  }
  return (
    <>
      <ellipse cx="0" cy="-9" rx="12" ry="9" className="fill-[#d9622b]" />
      <ellipse cx="-6" cy="-9" rx="6" ry="8.5" className="fill-[#e8782f]" />
      <ellipse cx="6" cy="-9" rx="6" ry="8.5" className="fill-[#c4521f]" />
      <path d="M0 -17q1-5 4-6" className="fill-none stroke-[#3f5a24]" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M2 -19q6-3 8 1q-5 1-8-1z" className="fill-[#4f7a2a]" />
    </>
  );
}
