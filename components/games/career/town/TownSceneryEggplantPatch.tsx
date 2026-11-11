import TownSceneryEggplant from '@/components/games/career/town/TownSceneryEggplant';

export default function TownSceneryEggplantPatch({ variant }: { variant: number }) {
  if (variant === 1) {
    return (
      <>
        <path d="M-8 0q-2-9 0-16M0 0q0-11 3-18M8 0q2-8 0-14" className="fill-none stroke-[#2f7a4f]" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M-8 -12q-8-2-10-8q7 0 10 6zM3 -14q8-4 12-1q-6 4-12 3z" className="fill-[#3f8f5a]" />
        <circle cx="-8" cy="-17" r="3" className="fill-[#d77bb8]" />
        <circle cx="3" cy="-19" r="3.2" className="fill-[#f0a6cf]" />
        <circle cx="8" cy="-15" r="2.6" className="fill-[#b98ae0]" />
        <circle cx="3" cy="-19" r="1" className="fill-amber-200" />
      </>
    );
  }
  return (
    <>
      <path d="M-14 -2q2-8 8-9M12 -2q-1-9-7-11" className="fill-none stroke-[#2f7a4f]" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M-8 -10q-8-3-10-9q8 0 10 7zM6 -12q8-5 13-2q-6 5-13 4z" className="fill-[#3f8f5a]" />
      <TownSceneryEggplant x={-8} y={-6} r={-30} />
      <TownSceneryEggplant x={8} y={-6} r={20} flip />
      {variant === 2 && <TownSceneryEggplant x={0} y={-4} r={80} />}
    </>
  );
}
