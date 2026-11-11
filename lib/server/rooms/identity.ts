import { createHash, randomBytes } from 'node:crypto';
import {
  ROOM_CODE_ALPHABET,
  ROOM_CODE_LENGTH,
  SEAT_NAME_MAX,
  SEAT_NAME_MIN,
} from '@/lib/constants/rooms';
import { ActionError } from '@/lib/server/rooms/errors';
import type { RoomSeat } from '@/lib/types/rooms';

export function randomRoomCode(): string {
  const bytes = randomBytes(ROOM_CODE_LENGTH);
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_ALPHABET[bytes[i] % ROOM_CODE_ALPHABET.length];
  }
  return code;
}

export function isRoomCode(code: string): boolean {
  return (
    code.length === ROOM_CODE_LENGTH &&
    [...code].every((c) => ROOM_CODE_ALPHABET.includes(c))
  );
}

export function newToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function newSeatId(): string {
  return randomBytes(6).toString('hex');
}

export function seatByToken<Seat extends RoomSeat>(
  seats: Record<string, Seat>,
  token: string | null,
): Seat | null {
  if (!token) return null;
  const hash = hashToken(token);
  return Object.values(seats).find((s) => s.tokenHash === hash) ?? null;
}

export function cleanSeatName(raw: unknown): string {
  const name = String(raw ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, SEAT_NAME_MAX);
  if (name.length < SEAT_NAME_MIN) throw new ActionError('bad-name');
  return name;
}

export function seatNameTaken<Seat extends RoomSeat>(
  seats: Record<string, Seat>,
  name: string,
  exceptSeatId?: string,
): boolean {
  return Object.values(seats).some(
    (s) => s.id !== exceptSeatId && s.name.toLowerCase() === name.toLowerCase(),
  );
}
