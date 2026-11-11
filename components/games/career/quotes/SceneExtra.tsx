// A nameless extra (medic, referee) built to the actors' scale: the same
// bust and head size as a SceneActor behind the table, so nobody on stage
// reads as a child. The torso runs a little below the box so a hop or a
// walking bob never lifts it off the table line
export default function SceneExtra({
  torso,
  hair,
  className = '',
  children,
}: {
  torso: string;
  hair: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <span className={`absolute bottom-0 block h-28 w-16 ${className}`}>
      <span
        className={`absolute -bottom-2 left-0 h-14 w-16 overflow-hidden rounded-t-2xl ring-1 ring-slate-950/40 ${torso}`}
      >
        {children}
      </span>
      <span className="absolute bottom-[40px] left-1 h-14 w-14 overflow-hidden rounded-full bg-orange-200 ring-2 ring-slate-950/50 sm:left-0 sm:h-16 sm:w-16">
        <span className={`absolute inset-x-0 top-0 h-[30%] ${hair}`} />
        <span className="absolute left-[28%] top-[48%] h-1.5 w-1.5 rounded-full bg-slate-900" />
        <span className="absolute right-[28%] top-[48%] h-1.5 w-1.5 rounded-full bg-slate-900" />
        <span className="absolute bottom-[22%] left-1/2 h-1 w-4 -translate-x-1/2 rounded-full bg-slate-700" />
      </span>
    </span>
  );
}
