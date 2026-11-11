import { WOOD_PLANKS } from '@/lib/utils/careerFrameClasses';

// A short plank screwed up in the scene, holding a row of controls
export default function RoomPlank({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-[6px] px-2 py-1.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.14),inset_0_-2px_0_rgb(0_0_0/0.45),0_0_0_1px_#160c05,0_4px_0_rgb(0_0_0/0.45)] ${WOOD_PLANKS} ${className}`}
    >
      {children}
    </div>
  );
}
