import type { SeatColor } from '@/lib/constants/rooms';

// A seat's color as fixed paint, for tags that sit on wood and on paper alike
// and must read the same on both: paper remaps the palette, these hexes stay
export const SEAT_PAINT: Record<SeatColor, string> = {
  sky: 'bg-[#38bdf8]',
  violet: 'bg-[#a78bfa]',
  fuchsia: 'bg-[#e879f9]',
  orange: 'bg-[#fb923c]',
  lime: 'bg-[#a3e635]',
  teal: 'bg-[#2dd4bf]',
  rose: 'bg-[#fb7185]',
  amber: 'bg-[#fbbf24]',
};
