// A coach for the hub card scenes: cap, round head, jersey, arms down on the
// table or thrown up in the stands. Drawn around the bottom centre of the
// jersey so a scene can plant him on a seat or behind a table and scale him
export default function CardCoach({
  x,
  y,
  scale = 1,
  jersey,
  cap = 'fill-stone-700',
  armsUp = false,
  cheering = false,
}: {
  x: number;
  y: number;
  scale?: number;
  jersey: string;
  cap?: string;
  armsUp?: boolean;
  cheering?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {armsUp ? (
        <>
          <rect x="-20" y="-66" width="8" height="40" rx="4" className={jersey} transform="rotate(-24 -16 -26)" />
          <rect x="12" y="-66" width="8" height="40" rx="4" className={jersey} transform="rotate(24 16 -26)" />
          <circle cx="-32" cy="-60" r="5.5" className="fill-amber-200" />
          <circle cx="32" cy="-60" r="5.5" className="fill-amber-200" />
        </>
      ) : (
        <>
          <rect x="-22" y="-28" width="8" height="24" rx="4" className={jersey} />
          <rect x="14" y="-28" width="8" height="24" rx="4" className={jersey} />
        </>
      )}
      <path d="M-15 0v-22q0-9 9-9h12q9 0 9 9v22Z" className={jersey} />
      <path d="M-5-31h10l-5 8Z" className="fill-stone-100" />
      <circle cx="0" cy="-45" r="13" className="fill-amber-200" />
      <path d="M-13-47a13 13 0 0 1 26 0Z" className={cap} />
      <rect x="-15.5" y="-49" width="31" height="4" rx="2" className={cap} />
      <circle cx="-5" cy="-42" r="2" className="fill-stone-900" />
      <circle cx="5" cy="-42" r="2" className="fill-stone-900" />
      {cheering ? (
        <ellipse cx="0" cy="-35.5" rx="3.5" ry="3" className="fill-stone-900" />
      ) : (
        <path d="M-5-37q5 4 10 0" className="fill-none stroke-stone-900" strokeWidth="2" strokeLinecap="round" />
      )}
    </g>
  );
}
