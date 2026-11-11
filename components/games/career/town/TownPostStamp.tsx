import TownPostHorn from '@/components/games/career/town/TownPostHorn';

// A postage stamp: the post's yellow with the horn in navy, its perforated
// edge cut out of a dotted margin
export default function TownPostStamp({
  className = '',
}: {
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`block h-9 w-7 bg-[radial-gradient(circle,transparent_1.1px,#fffdf5_1.4px)] bg-[length:4px_4px] p-[3px] drop-shadow-[0_1px_1px_rgb(0_0_0/0.35)] ${className}`}
    >
      <span className="flex h-full w-full items-center justify-center bg-[#facc15] ring-1 ring-inset ring-[#1e3a8a]/40">
        <TownPostHorn className="h-4 w-4 text-[#1e3a8a]" />
      </span>
    </span>
  );
}
