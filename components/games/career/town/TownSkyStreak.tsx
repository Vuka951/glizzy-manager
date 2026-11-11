export default function TownSkyStreak({ gradient }: { gradient: string }) {
  return (
    <>
      <line x1="0" y1="0" x2="72" y2="-33" stroke={`url(#${gradient})`} strokeWidth="2" strokeLinecap="round" />
      <circle cx="0" cy="0" r="1.6" className="fill-white" />
    </>
  );
}
