// The cup on the recap's cover, drawn in the cover's 150 by 200 frame with
// its foot on y 146, in the edition's metal
export default function TownCupTrophy({
  body,
  shine,
  handle,
  foot,
  plinth,
}: {
  body: string;
  shine: string;
  handle: string;
  foot: string;
  plinth: string;
}) {
  return (
    <g>
      <path
        d="M50 68C33 68 33 94 54 97M100 68C117 68 117 94 96 97"
        fill="none"
        strokeWidth="5"
        strokeLinecap="round"
        className={handle}
      />
      <path d="M50 62H100V76C100 98 89 110 75 112C61 110 50 98 50 76Z" className={body} />
      <rect x="47" y="58" width="56" height="6" rx="2" className={body} />
      <path d="M57 66H62V79C62 92 65 100 69 105C61 101 57 92 57 79Z" className={shine} />
      <path
        d="M75 74L77.6 80.2L84.2 80.6L79.1 84.8L80.8 91.2L75 87.6L69.2 91.2L70.9 84.8L65.8 80.6L72.4 80.2Z"
        className={shine}
      />
      <path d="M70 112H80L78 124H72Z" className={foot} />
      <rect x="65" y="123" width="20" height="4" rx="1.5" className={foot} />
      <path d="M60 127H90L94 140H56Z" className={foot} />
      <rect x="52" y="140" width="46" height="6" rx="1" className={plinth} />
    </g>
  );
}
