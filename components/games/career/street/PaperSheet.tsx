import { PAPER_PAINT } from '@/lib/utils/careerFrameClasses';

// A sheet of the town's paper. Everything inside takes ink colours from the
// paint remap, so dark-first markup prints correctly on it
export default function PaperSheet({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative rounded-[2px] bg-[#f1e8d3] bg-[radial-gradient(ellipse_at_top,rgb(255_255_255/0.45),transparent_70%)] text-slate-200 shadow-[0_1px_0_rgb(255_255_255/0.5)_inset,0_8px_14px_-6px_rgb(0_0_0/0.75)] ${PAPER_PAINT} ${className}`}
    >
      {children}
    </div>
  );
}
