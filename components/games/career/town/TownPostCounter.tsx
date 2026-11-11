import TownPostBoxes from '@/components/games/career/town/TownPostBoxes';
import TownPostHorn from '@/components/games/career/town/TownPostHorn';

// The post office, filling the board: the wall of boxes in the dark at the
// back, the horn on its enamel plate, and the worn counter the letters are
// laid out on
export default function TownPostCounter({
  waiting,
  toolbar,
  children,
}: {
  waiting: boolean;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full">
      <div className="bg-[#2a1a0e] bg-[repeating-linear-gradient(100deg,transparent_0_14px,rgb(0_0_0/0.14)_14px_16px)] px-2.5 pb-4 pt-2.5 shadow-[inset_0_3px_8px_rgb(0_0_0/0.65)]">
        <TownPostBoxes waiting={waiting} />
      </div>
      <div
        className="relative flex flex-col gap-3 border-t-4 border-[#b8862f] bg-[#5a3d26] bg-[repeating-linear-gradient(90deg,transparent_0_38px,rgb(0_0_0/0.09)_38px_40px)] p-3 pt-6"
      >
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-0 flex h-9 w-9 -translate-x-1/2 -translate-y-[60%] items-center justify-center rounded-full bg-[#1e3a8a] shadow-[0_2px_0_rgb(0_0_0/0.5)] ring-2 ring-[#facc15]"
        >
          <TownPostHorn className="h-5 w-5 text-[#facc15]" />
        </span>
        {toolbar && <div className="-mt-2 flex justify-end">{toolbar}</div>}
        {children}
      </div>
    </div>
  );
}
