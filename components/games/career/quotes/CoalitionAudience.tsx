const SEATS = Array.from({ length: 41 }, (_, index) => index);

// The front row of guests, backs to the camera, packed shoulder to shoulder
// across however wide the frame runs. Every head rides the scene's move
export default function CoalitionAudience({ anim }: { anim?: string }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[-8px] z-40 flex justify-center gap-[4px]">
      {SEATS.map((seat) => (
        <span
          key={seat}
          data-anim={anim}
          className="relative h-[38px] w-[32px] shrink-0"
        >
          <span className="absolute bottom-0 left-0 h-[16px] w-[32px] rounded-t-[12px] bg-slate-950" />
          <span className="absolute bottom-[12px] left-[5px] h-[22px] w-[22px] rounded-full bg-slate-950 ring-1 ring-slate-700" />
        </span>
      ))}
    </div>
  );
}
