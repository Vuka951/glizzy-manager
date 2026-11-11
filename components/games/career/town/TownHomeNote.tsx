import CareerButton from '@/components/games/career/CareerButton';

export type TownHomeNoteKind = 'sticky' | 'pad' | 'postcard';

const PAPER: Record<TownHomeNoteKind, string> = {
  sticky:
    '-rotate-1 rounded-[2px] bg-gradient-to-br from-[#fef3a0] to-[#fde68a]',
  pad: 'rotate-[0.6deg] rounded-[2px] bg-[#fbf6e6] bg-[repeating-linear-gradient(to_bottom,transparent_0_17px,rgb(28_25_23/0.08)_17px_18px)] pl-6',
  postcard: '-rotate-[0.5deg] rounded-[3px] bg-[#f5efe0]',
};

const MAGNET: Record<TownHomeNoteKind, string> = {
  sticky: 'bg-[radial-gradient(circle_at_35%_35%,#fca5a5,#b91c1c)]',
  pad: 'bg-[radial-gradient(circle_at_35%_35%,#93c5fd,#1d4ed8)]',
  postcard: 'bg-[radial-gradient(circle_at_35%_35%,#86efac,#15803d)]',
};

// One way to spend the month at home: a piece of paper under a magnet on the
// fridge door (a sticky note, a page off the shopping pad, the island's
// postcard with its sea for a picture)
export default function TownHomeNote({
  kind,
  icon,
  title,
  desc,
  action,
}: {
  kind: TownHomeNoteKind;
  icon: React.ReactNode;
  title: string;
  desc: string;
  action: { label: string; disabled?: boolean; onClick: () => void };
}) {
  return (
    <div
      className={`relative flex flex-col gap-3 p-3 pt-4 text-[#1c1917] shadow-[0_4px_0_rgb(40_50_42/0.45)] ${PAPER[kind]}`}
    >
      {kind === 'pad' && (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-4 w-px bg-[#dc2626]/50"
        />
      )}
      <span
        aria-hidden="true"
        className={`absolute -top-2 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full shadow-[0_2px_0_rgb(0_0_0/0.4)] ${MAGNET[kind]}`}
      />
      <div className="flex items-start gap-3">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center ${
            kind === 'postcard'
              ? 'overflow-hidden rounded-[2px] bg-[linear-gradient(to_bottom,#7dd3fc_0_55%,#0369a1_55%)] text-[#fef9c3] ring-2 ring-[#ffffff]'
              : ''
          }`}
        >
          {icon}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1 pt-0.5">
          <span className="font-serif text-[15px] font-bold leading-tight">
            {title}
          </span>
          <span className="text-[11px] leading-snug text-[#44403c]">{desc}</span>
        </span>
        {kind === 'postcard' && (
          <span
            aria-hidden="true"
            className="h-8 w-7 shrink-0 rounded-[2px] border-2 border-dashed border-[#b91c1c]/60 bg-[#fecaca]/50"
          />
        )}
      </div>
      <CareerButton
        tone="neutral"
        full
        disabled={action.disabled}
        className="min-h-11"
        onClick={action.onClick}
      >
        {action.label}
      </CareerButton>
    </div>
  );
}
