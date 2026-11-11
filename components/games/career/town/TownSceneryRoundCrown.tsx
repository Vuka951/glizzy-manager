export type TownSceneryCrown = { dark: string; base: string; light: string; speck: string };

// Round crown of overlapping blobs, lit from the upper left
export default function TownSceneryRoundCrown({ crown, wide }: { crown: TownSceneryCrown; wide: boolean }) {
  const k = wide ? 1.12 : 1;
  return (
    <>
      <circle cx={-18 * k} cy="-50" r="18" className={crown.dark} />
      <circle cx={20 * k} cy="-52" r="18" className={crown.dark} />
      <circle cx="0" cy="-46" r="20" className={crown.dark} />
      <circle cx={-20 * k} cy="-58" r="17" className={crown.base} />
      <circle cx={19 * k} cy="-62" r="18" className={crown.base} />
      <circle cx="0" cy="-74" r="22" className={crown.base} />
      <circle cx="-2" cy="-56" r="18" className={crown.base} />
      <circle cx={-10 * k} cy="-80" r="12" className={crown.light} />
      <circle cx={-24 * k} cy="-64" r="8" className={crown.light} />
      <circle cx="8" cy="-86" r="6" className={crown.light} />
      <circle cx={-14 * k} cy="-70" r="2" className={crown.speck} />
      <circle cx={12 * k} cy="-74" r="2.2" className={crown.speck} />
      <circle cx={24 * k} cy="-56" r="1.8" className={crown.speck} />
      <circle cx="-2" cy="-92" r="1.8" className={crown.speck} />
      <circle cx={-26 * k} cy="-52" r="1.6" className={crown.speck} />
    </>
  );
}
