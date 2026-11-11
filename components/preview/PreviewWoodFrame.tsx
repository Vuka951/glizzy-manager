import StreetBoard from '@/components/games/career/street/StreetBoard';
import { WOOD_PLANKS } from '@/lib/utils/careerFrameClasses';

const WIDTHS = {
  narrow: 'max-w-sm',
  phone: 'max-w-[358px]',
  wide: 'max-w-2xl',
} as const;

// A town panel on its own plank of the street board, at one of the widths the
// game gives it
export default function PreviewWoodFrame({
  size = 'narrow',
  pad = false,
  children,
}: {
  size?: keyof typeof WIDTHS;
  pad?: boolean;
  children: React.ReactNode;
}) {
  return (
    <StreetBoard className={`w-full ${WIDTHS[size]}`}>
      <div className={`${WOOD_PLANKS} ${pad ? 'p-3' : ''}`}>{children}</div>
    </StreetBoard>
  );
}
