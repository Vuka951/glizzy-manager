import { createHash } from 'node:crypto';
import { ActionError } from '@/lib/server/rooms/errors';
import type { RoomStore } from '@/lib/server/rooms/store';
import type { RoomCore } from '@/lib/types/rooms';

// Room creation is open to anyone, so one client address gets a few rooms
// per fixed window and the whole store stops at a cap
export type RoomCreateLimits = {
  perWindow: number;
  windowSeconds: number;
  openRoomsCap: number;
  // Environment variable that lifts both limits outside production when set
  // to 1, for the test kit
  bypassEnv: string;
};

// Requests with no forwarding header (next dev, a bare node server) share one
// bucket, so the local kit counts against a single allowance
const LOCAL_CLIENT = 'local';

// The address is only ever a counter key, so a short hash is enough and the
// raw address never lands in the store
function clientKey(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0].trim();
  const address = forwarded || req.headers.get('x-real-ip')?.trim();
  if (!address) return LOCAL_CLIENT;
  return createHash('sha256').update(address).digest('hex').slice(0, 16);
}

function unlimited(limits: RoomCreateLimits): boolean {
  return (
    process.env.NODE_ENV !== 'production' &&
    process.env[limits.bypassEnv] === '1'
  );
}

// Refuses a room creation over the per-client allowance or the cap on open
// rooms. A refused attempt still counts toward the window
export async function assertCreateAllowed<R extends RoomCore>(
  req: Request,
  now: number,
  store: RoomStore<R>,
  limits: RoomCreateLimits,
): Promise<void> {
  if (unlimited(limits)) return;
  const created = await store.countCreate(clientKey(req), now, limits.windowSeconds);
  if (created > limits.perWindow) throw new ActionError('rate-limited', 429);
  const open = await store.openCount(now);
  if (open >= limits.openRoomsCap) throw new ActionError('rooms-full', 503);
}
