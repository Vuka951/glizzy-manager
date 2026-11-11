import { useRef } from 'react';
import {
  TOWN_LAYOUTS,
  type TownBuildingId,
  type TownLayoutKey,
} from '@/lib/constants/townLayout';
import type { TownBuildingMode } from '@/lib/types/town';
import { playHoverSound } from '@/lib/utils/gameSounds';
import { prefersReducedMotion } from '@/lib/utils/motion';

const SHAKE: Keyframe[] = [
  { transform: 'translateX(0)' },
  { transform: 'translateX(-4px) rotate(-1deg)' },
  { transform: 'translateX(4px) rotate(1deg)' },
  { transform: 'translateX(-3px)' },
  { transform: 'translateX(3px)' },
  { transform: 'translateX(0)' },
];

// One building on the town canvas: the art as children (drawn in the same
// `mode`). Its hanging label lives on the town's sign layer, so the button
// reports hover and keyboard focus for it. Only an open, usable building
// lifts and brightens on hover; a refused click shakes it instead
export default function TownBuildingButton({
  id,
  layout,
  name,
  sub,
  mode,
  disabled,
  blocked,
  badge = 0,
  alert = false,
  onHover,
  onOpen,
  children,
}: {
  id: TownBuildingId;
  layout: TownLayoutKey;
  name: string;
  sub: string | null;
  mode: TownBuildingMode;
  disabled: boolean;
  // A walk is under way, so nothing new opens until he is back
  blocked: boolean;
  badge?: number;
  // Something there needs the player, marked without a count
  alert?: boolean;
  onHover: (on: boolean) => void;
  onOpen: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const refused = mode !== 'open' || disabled;

  const shake = () => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    el.animate(SHAKE, { duration: 380, easing: 'ease-in-out' });
  };

  return (
    <button
      ref={ref}
      type="button"
      aria-label={sub ? `${name}, ${sub}` : name}
      aria-disabled={refused || blocked}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') onHover(true);
      }}
      onPointerLeave={() => onHover(false)}
      onFocus={(event) => {
        if (event.currentTarget.matches(':focus-visible')) onHover(true);
      }}
      onBlur={() => onHover(false)}
      onClick={() => {
        playHoverSound(0.045);
        if (refused) {
          shake();
          return;
        }
        if (blocked) return;
        onOpen();
      }}
      className={`group/building absolute block rounded-sm outline-none transition-[translate,filter] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-[#fde68a] ${
        TOWN_LAYOUTS[layout].buildings[id].box
      } ${
        refused
          ? 'cursor-not-allowed'
          : 'cursor-pointer hover:-translate-y-1 hover:brightness-125 focus-visible:-translate-y-1 focus-visible:brightness-125'
      } ${disabled && mode === 'open' ? 'saturate-50' : ''}`}
    >
      {children}
      {alert && badge === 0 && (
        <span className="absolute right-[3%] top-[5%] z-30 h-3.5 w-3.5 rounded-full border-2 border-[#fdf0c8] bg-[#b91c1c] shadow-[0_0_0_1px_#450a0a,0_2px_0_rgb(2_6_23/0.6)]" />
      )}
      {badge > 0 && (
        <span className="absolute right-[2%] top-[4%] z-30 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#fdf0c8] bg-[#b91c1c] px-1 font-sign text-[12px] font-bold leading-none tabular-nums text-[#ffffff] shadow-[0_0_0_1px_#450a0a,0_2px_0_rgb(2_6_23/0.6)]">
          {badge}
        </span>
      )}
    </button>
  );
}
