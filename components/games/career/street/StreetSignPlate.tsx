// Past these lengths a name would wrap on the plate at full size, so it gets
// the smaller lettering a long street name would be painted in
const MEDIUM_NAME = 18;
const LONG_NAME = 30;

function lettering(children: React.ReactNode): string {
  const length = typeof children === 'string' ? children.length : 0;
  if (length > LONG_NAME) return 'text-[14px] sm:text-[17px]';
  if (length > MEDIUM_NAME) return 'text-[15px] sm:text-[19px]';
  return 'text-[17px] sm:text-[22px]';
}

// The screen's name on a white-rimmed enamel plate, the same paint as the
// street signs over the town. It sticks out over the top of the board, or sits
// `flat` where it stands on its own over a scene
export default function StreetSignPlate({
  badge,
  flat = false,
  children,
}: {
  badge?: React.ReactNode;
  flat?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`relative flex min-w-0 items-center gap-2 rounded-[5px] border-2 border-[#f1f5f9] bg-[#1e3a8a] px-2.5 py-1 shadow-[0_0_0_2px_#0c1a44,0_4px_0_rgb(0_0_0/0.45)] sm:px-3.5 sm:py-1.5 ${flat ? '' : '-mt-4 sm:-mt-5'}`}
    >
      {badge && (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center">
          {badge}
        </span>
      )}
      <span
        className={`min-w-0 text-balance text-left font-sign font-extrabold uppercase leading-[1.05] tracking-[0.05em] text-[#ffffff] [overflow-wrap:anywhere] ${lettering(children)}`}
      >
        {children}
      </span>
    </span>
  );
}
