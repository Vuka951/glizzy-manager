import { createHash } from 'node:crypto';
import { OPEN_ROOMS_CAP, ROOM_CREATE_PER_HOUR } from '@/lib/constants/careerMp';
import { ActionError } from '@/lib/server/career-mp/errors';
import { countOpenRooms, countRoomCreate } from '@/lib/server/career-mp/store';

// Requests with no forwarding header (next dev, a bare node server) share one
// bucket, so the local kit counts against a single hourly allowance
const LOCAL_CLIENT = 'local';

// The address is only ever a counter key, so a short hash is enough and the
// raw address never lands in the store
function clientKey(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0].trim();
  const address = forwarded || req.headers.get('x-real-ip')?.trim();
  if (!address) return LOCAL_CLIENT;
  return createHash('sha256').update(address).digest('hex').slice(0, 16);
}

// CAREER_MP_UNLIMITED=1 lifts both limits for the test kit; production ignores it
function unlimited(): boolean {
  return (
    process.env.NODE_ENV !== 'production' &&
    process.env.CAREER_MP_UNLIMITED === '1'
  );
}

// Refuses a room creation over the per-client hourly allowance or the global
// cap on open rooms. A refused attempt still counts toward the hour
export async function assertCreateAllowed(req: Request, now: number): Promise<void> {
  if (unlimited()) return;
  const created = await countRoomCreate(clientKey(req), now);
  if (created > ROOM_CREATE_PER_HOUR) throw new ActionError('rate-limited', 429);
  const open = await countOpenRooms(now);
  if (open >= OPEN_ROOMS_CAP) throw new ActionError('rooms-full', 503);
}
