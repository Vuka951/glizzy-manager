import type { TownSceneryCrown } from '@/components/games/career/town/TownSceneryRoundCrown';

export default function TownSceneryPoplar({ crown }: { crown: TownSceneryCrown }) {
  return (
    <>
      <path d="M0 0V-26" className="fill-none stroke-[#4a3324]" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="2" cy="-62" rx="16" ry="42" className={crown.dark} />
      <ellipse cx="-1" cy="-66" rx="14" ry="40" className={crown.base} />
      <ellipse cx="-6" cy="-76" rx="6" ry="24" className={crown.light} />
      <circle cx="-8" cy="-50" r="1.8" className={crown.speck} />
      <circle cx="4" cy="-88" r="1.8" className={crown.speck} />
    </>
  );
}
