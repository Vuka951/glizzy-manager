import PaperSheet from '@/components/games/career/street/PaperSheet';

// A bookmaker's slip: perforated down the side where it tore off the pad
export default function GlizzflationBetSlip({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <PaperSheet className={`py-2.5 pl-6 pr-3 ${className}`}>
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-4 border-r border-dashed border-[#1c1408]/35 bg-[radial-gradient(circle,#2b1a0e_2.5px,transparent_3px)] bg-[length:16px_14px] bg-repeat-y"
      />
      {children}
    </PaperSheet>
  );
}
