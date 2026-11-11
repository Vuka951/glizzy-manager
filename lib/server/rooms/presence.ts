import { CONNECTED_WINDOW_MS } from '@/lib/constants/rooms';
import type { RoomSeat } from '@/lib/types/rooms';

export function isConnected(seat: RoomSeat, now: number): boolean {
  return now - seat.lastSeenAt <= CONNECTED_WINDOW_MS;
}

export function connectedSeatIds<Seat extends RoomSeat>(
  seats: Record<string, Seat>,
  now: number,
): string[] {
  return Object.values(seats)
    .filter((s) => isConnected(s, now))
    .map((s) => s.id);
}

// Strictly more than half of the connected seats, never fewer than one
export function majorityOf(count: number): number {
  return Math.floor(count / 2) + 1;
}

export function deadlineFor(seconds: number | null, now: number): number | null {
  return seconds === null ? null : now + seconds * 1000;
}
