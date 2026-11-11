export type TownFolkLook = {
  coat: string;
  sleeve: string;
  skin: string;
  hair: string;
  // A beanie in this fill instead of bare hair
  hat?: string;
  // A supporter's scarf in this fill
  scarf?: string;
};

// One small townsperson in the flat night style: legs and arms tagged so the
// crowd can swing them while he walks
export default function TownFolk({ look }: { look: TownFolkLook }) {
  return (
    <svg
      viewBox="0 0 14 30"
      className="h-full w-full overflow-visible"
      aria-hidden="true"
    >
      <ellipse cx="7" cy="29.4" rx="5" ry="1.1" className="fill-black/40" />
      {['M5.6 19.5v8.6', 'M8.4 19.5v8.6'].map((d) => (
        <path
          key={d}
          data-leg
          d={d}
          className="origin-top fill-none stroke-slate-900 [transform-box:fill-box]"
          strokeWidth="2.3"
          strokeLinecap="round"
        />
      ))}
      {['M3.6 11.2l-0.8 6.6', 'M10.4 11.2l0.8 6.6'].map((d) => (
        <path
          key={d}
          data-arm
          d={d}
          className={`origin-top fill-none [transform-box:fill-box] ${look.sleeve}`}
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}
      <path
        d="M3.4 11.4Q3.4 9 5.8 9h2.4q2.4 0 2.4 2.4l0.6 9.2H2.8z"
        className={look.coat}
      />
      {look.scarf && (
        <path d="M4.4 8.6h5.2v1.8H4.4zM8 10.4h1.6v3.4H8z" className={look.scarf} />
      )}
      <circle cx="7" cy="5.6" r="3.2" className={look.skin} />
      {look.hat ? (
        <>
          <path d="M3.7 5.2a3.3 3.3 0 0 1 6.6 0z" className={look.hat} />
          <circle cx="7" cy="1.6" r="1" className={look.hat} />
        </>
      ) : (
        <path
          d="M3.8 5.6a3.2 3.2 0 0 1 6.4-0.4q-1.6-1.4-3.6-1-1.8 0.3-2.8 1.4z"
          className={look.hair}
        />
      )}
    </svg>
  );
}
