import { LOG_CAP } from '@/lib/constants/rooms';
import type { RoomEvent } from '@/lib/types/rooms';

export function logEvent<R extends { log: RoomEvent[] }>(
  room: R,
  now: number,
  kind: string,
  params: Record<string, string | number> = {},
  visibleTo?: string,
): R {
  const entry = visibleTo
    ? { at: now, kind, params, visibleTo }
    : { at: now, kind, params };
  const log = [...room.log, entry];
  return {
    ...room,
    log: log.length > LOG_CAP ? log.slice(log.length - LOG_CAP) : log,
  };
}

// The tail of the log one seat may read
export function visibleLog(
  log: RoomEvent[],
  seatId: string,
  limit: number,
): RoomEvent[] {
  return log.filter((e) => !e.visibleTo || e.visibleTo === seatId).slice(-limit);
}
