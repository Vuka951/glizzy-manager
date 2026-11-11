import PaperSheet from '@/components/games/career/street/PaperSheet';

// The party's typed note to the coach, clipped to the board: where his list
// sits, what the government charges outsiders, his favors and the next vote
export default function ParliamentMemo({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <PaperSheet
      className={`flex flex-col bg-[repeating-linear-gradient(to_bottom,transparent_0_19px,rgb(28_25_23/0.1)_19px_20px)] bg-[position:0_8px] px-3 pb-2.5 pt-3 text-left font-serif text-[12px] leading-[20px] ${className}`}
    >
      <span
        aria-hidden="true"
        className="absolute -top-2 right-6 h-7 w-2.5 rounded-full border-2 border-[#8a8f98] shadow-[0_1px_0_rgb(0_0_0/0.4)]"
      />
      {children}
    </PaperSheet>
  );
}
