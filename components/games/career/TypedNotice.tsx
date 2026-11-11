import PaperSheet from '@/components/games/career/street/PaperSheet';

const TACK =
  'absolute top-1.5 h-2.5 w-2.5 rounded-full bg-gradient-to-br from-[#f2d48a] to-[#8a6424] shadow-[0_1px_1px_rgb(0_0_0/0.65)]';

// A typed sheet tacked to the board: how the town explains itself
export default function TypedNotice({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <PaperSheet className={`px-4 pb-4 pt-5 text-left ${className}`}>
      <span aria-hidden="true" className={`${TACK} left-1.5`} />
      <span aria-hidden="true" className={`${TACK} right-1.5`} />
      {children}
    </PaperSheet>
  );
}
