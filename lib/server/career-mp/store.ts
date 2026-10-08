import { Redis } from '@upstash/redis';
import {
  LOBBY_IDLE_MS,
  ROOM_CREATE_WINDOW_SECONDS,
  ROOM_TTL_SECONDS,
} from '@/lib/constants/careerMp';
import type { Room } from '@/lib/server/career-mp/room';

const KEY_PREFIX = 'career-mp:room:';
const CREATE_PREFIX = 'career-mp:create:';

export class VersionConflict extends Error {
  constructor() {
    super('version-conflict');
  }
}

type RoomStore = {
  get(code: string): Promise<Room | null>;
  // Writes only when the stored version still matches expectVersion
  put(room: Room, expectVersion: number | null): Promise<boolean>;
  // Every open room, most recently touched first
  list(limit: number): Promise<Room[]>;
  remove(code: string): Promise<void>;
  // How many rooms are open right now, expired lobbies included until swept
  openCount(now: number): Promise<number>;
  // Counts one creation for the client and returns its total in the window
  countCreate(client: string, now: number): Promise<number>;
};

const INDEX_KEY = 'career-mp:rooms';
const LOBBY_TTL_SECONDS = Math.ceil(LOBBY_IDLE_MS / 1000) + 60;
const CREATE_WINDOW_MS = ROOM_CREATE_WINDOW_SECONDS * 1000;

// Fixed windows: every creation inside the same hour shares one counter key
function createKey(client: string, now: number): string {
  return `${CREATE_PREFIX}${client}:${Math.floor(now / CREATE_WINDOW_MS)}`;
}

// The dev fallback: one Map per server process, so `next dev` runs without
// any credentials. It survives hot reloads through globalThis
const memoryRooms: Map<string, string> =
  ((globalThis as { __careerMpRooms?: Map<string, string> }).__careerMpRooms ??=
    new Map());
const memoryCreates: Map<string, number> =
  ((globalThis as { __careerMpCreates?: Map<string, number> }).__careerMpCreates ??=
    new Map());

const memoryStore: RoomStore = {
  async get(code) {
    const raw = memoryRooms.get(code);
    return raw ? (JSON.parse(raw) as Room) : null;
  },
  async put(room, expectVersion) {
    const raw = memoryRooms.get(room.code);
    const current = raw ? (JSON.parse(raw) as Room).version : null;
    if (current !== expectVersion) return false;
    memoryRooms.set(room.code, JSON.stringify(room));
    return true;
  },
  async remove(code) {
    memoryRooms.delete(code);
  },
  async list(limit) {
    return [...memoryRooms.values()]
      .map((raw) => JSON.parse(raw) as Room)
      .filter((room) => room.status !== 'closed')
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, limit);
  },
  async openCount() {
    let open = 0;
    for (const raw of memoryRooms.values()) {
      if ((JSON.parse(raw) as Room).status !== 'closed') open += 1;
    }
    return open;
  },
  async countCreate(client, now) {
    const key = createKey(client, now);
    const count = (memoryCreates.get(key) ?? 0) + 1;
    memoryCreates.set(key, count);
    // Older windows can never be read again, so they are dropped on the way
    const bucket = String(Math.floor(now / CREATE_WINDOW_MS));
    for (const stale of memoryCreates.keys()) {
      if (!stale.endsWith(`:${bucket}`)) memoryCreates.delete(stale);
    }
    return count;
  },
};

// Version lives next to the JSON so the compare-and-set never parses it
const CAS_SCRIPT = `
local current = redis.call('GET', KEYS[2])
if current == false then current = '' end
if current ~= ARGV[1] then return 0 end
redis.call('SET', KEYS[1], ARGV[2], 'EX', ARGV[4])
redis.call('SET', KEYS[2], ARGV[3], 'EX', ARGV[4])
return 1
`;

function redisStore(redis: Redis): RoomStore {
  return {
    async get(code) {
      const raw = await redis.get<string | Room>(KEY_PREFIX + code);
      if (!raw) return null;
      return typeof raw === 'string' ? (JSON.parse(raw) as Room) : raw;
    },
    async put(room, expectVersion) {
      const ok = await redis.eval(
        CAS_SCRIPT,
        [KEY_PREFIX + room.code, KEY_PREFIX + room.code + ':v'],
        [
          expectVersion === null ? '' : String(expectVersion),
          JSON.stringify(room),
          String(room.version),
          // A lobby only needs to outlive its idle window; the lazy check clears it anyway
          String(room.status === 'lobby' ? LOBBY_TTL_SECONDS : ROOM_TTL_SECONDS),
        ],
      );
      if (ok === 1) {
        // The browser index: a sorted set by last touch, closed rooms dropped
        if (room.status === 'closed') await redis.zrem(INDEX_KEY, room.code);
        else await redis.zadd(INDEX_KEY, { score: room.updatedAt, member: room.code });
      }
      return ok === 1;
    },
    async remove(code) {
      await redis.del(KEY_PREFIX + code, KEY_PREFIX + code + ':v');
      await redis.zrem(INDEX_KEY, code);
    },
    async list(limit) {
      const cutoff = Date.now() - ROOM_TTL_SECONDS * 1000;
      await redis.zremrangebyscore(INDEX_KEY, 0, cutoff);
      const codes = await redis.zrange<string[]>(INDEX_KEY, 0, limit - 1, { rev: true });
      if (codes.length === 0) return [];
      const raws = await redis.mget<(string | Room | null)[]>(
        ...codes.map((code) => KEY_PREFIX + code),
      );
      const gone = codes.filter((_, i) => !raws[i]);
      if (gone.length > 0) await redis.zrem(INDEX_KEY, ...gone);
      return raws.flatMap((raw) => {
        if (!raw) return [];
        const room = typeof raw === 'string' ? (JSON.parse(raw) as Room) : raw;
        return room.status === 'closed' ? [] : [room];
      });
    },
    async openCount(now) {
      await redis.zremrangebyscore(INDEX_KEY, 0, now - ROOM_TTL_SECONDS * 1000);
      return redis.zcard(INDEX_KEY);
    },
    async countCreate(client, now) {
      const key = createKey(client, now);
      const count = await redis.incr(key);
      if (count === 1) await redis.expire(key, ROOM_CREATE_WINDOW_SECONDS);
      return count;
    },
  };
}

export function redisCredentials(): { url: string; token: string } | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

// Printed once per server instance from instrumentation.ts when a production
// build starts without credentials
export const MISSING_REDIS_WARNING =
  '[career-mp] UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are not set. ' +
  'Rivals rooms are kept in process memory, which does not survive restarts ' +
  'and is not shared between serverless instances. Set both variables in production.';

let store: RoomStore | null = null;

export function roomStore(): RoomStore {
  if (store) return store;
  const credentials = redisCredentials();
  store = credentials ? redisStore(new Redis(credentials)) : memoryStore;
  return store;
}

export async function countOpenRooms(now: number): Promise<number> {
  return roomStore().openCount(now);
}

export async function countRoomCreate(client: string, now: number): Promise<number> {
  return roomStore().countCreate(client, now);
}

export async function loadRoom(code: string): Promise<Room | null> {
  return roomStore().get(code);
}

export async function listRooms(limit = 50): Promise<Room[]> {
  return roomStore().list(limit);
}

export async function removeRoom(code: string): Promise<void> {
  return roomStore().remove(code);
}

// A lobby nobody has polled or acted in for the idle window
export function lobbyExpired(room: Room, now: number): boolean {
  return room.status === 'lobby' && now - room.updatedAt > LOBBY_IDLE_MS;
}

export async function createRoom(room: Room): Promise<void> {
  const ok = await roomStore().put({ ...room, version: 1 }, null);
  if (!ok) throw new VersionConflict();
}

// Save a room read at `room.version`, bumping it. Throws when somebody
// wrote in between; the handler reloads and re-applies once
export async function saveRoom(room: Room, now: number): Promise<Room> {
  const next: Room = { ...room, version: room.version + 1, updatedAt: now };
  const ok = await roomStore().put(next, room.version);
  if (!ok) throw new VersionConflict();
  return next;
}
