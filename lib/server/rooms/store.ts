import { Redis } from '@upstash/redis';
import { LOBBY_IDLE_MS, ROOM_TTL_SECONDS } from '@/lib/constants/rooms';
import type { RoomCore } from '@/lib/types/rooms';

export class VersionConflict extends Error {
  constructor() {
    super('version-conflict');
  }
}

type Backend<R extends RoomCore> = {
  get(code: string): Promise<R | null>;
  // Writes only when the stored version still matches expectVersion
  put(room: R, expectVersion: number | null): Promise<boolean>;
  // Every open room, most recently touched first
  list(limit: number): Promise<R[]>;
  remove(code: string): Promise<void>;
  // How many rooms are open right now, expired lobbies included until swept
  openCount(now: number): Promise<number>;
  // Counts one creation under the key and returns its total in the window
  countCreate(key: string, windowSeconds: number): Promise<number>;
};

export type RoomStoreOptions<R extends RoomCore> = {
  // Prefix of every Redis key: `<namespace>:room:<CODE>`, its `:v` twin, the
  // `<namespace>:rooms` index and the `<namespace>:create:` counters
  namespace: string;
  // Name of the dev fallback's Map on globalThis
  memoryKey: string;
  lobbyIdleMs?: number;
  // How long a stored room lives without a write, in seconds
  ttlSecondsFor?: (room: R) => number;
};

export type RoomStore<R extends RoomCore> = {
  load(code: string): Promise<R | null>;
  list(limit?: number): Promise<R[]>;
  remove(code: string): Promise<void>;
  // Stores a new room at version 1; throws VersionConflict on a taken code
  create(room: R): Promise<void>;
  // Saves a room read at `room.version`, bumping it. Throws VersionConflict
  // when somebody wrote in between; the handler reloads and re-applies
  save(room: R, now: number): Promise<R>;
  // A lobby nobody has polled or acted in for the idle window
  lobbyExpired(room: R, now: number): boolean;
  openCount(now: number): Promise<number>;
  // Counts one creation for the client in the fixed window `now` falls in
  // and returns the client's total inside it
  countCreate(client: string, now: number, windowSeconds: number): Promise<number>;
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

// The dev fallback: one Map per server process, so `next dev` runs without
// any credentials. It survives hot reloads through globalThis
function memoryBackend<R extends RoomCore>(memoryKey: string): Backend<R> {
  const holder = globalThis as unknown as Record<
    string,
    Map<string, string> | Map<string, number> | undefined
  >;
  const rooms = (holder[memoryKey] ??= new Map<string, string>()) as Map<
    string,
    string
  >;
  const creates = (holder[`${memoryKey}Creates`] ??= new Map<
    string,
    number
  >()) as Map<string, number>;
  return {
    async get(code) {
      const raw = rooms.get(code);
      return raw ? (JSON.parse(raw) as R) : null;
    },
    async put(room, expectVersion) {
      const raw = rooms.get(room.code);
      const current = raw ? (JSON.parse(raw) as R).version : null;
      if (current !== expectVersion) return false;
      rooms.set(room.code, JSON.stringify(room));
      return true;
    },
    async remove(code) {
      rooms.delete(code);
    },
    async list(limit) {
      return [...rooms.values()]
        .map((raw) => JSON.parse(raw) as R)
        .filter((room) => room.status !== 'closed')
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, limit);
    },
    async openCount() {
      let open = 0;
      for (const raw of rooms.values()) {
        if ((JSON.parse(raw) as R).status !== 'closed') open += 1;
      }
      return open;
    },
    async countCreate(key) {
      const count = (creates.get(key) ?? 0) + 1;
      creates.set(key, count);
      // Older windows can never be read again, so they are dropped on the way
      const bucket = key.slice(key.lastIndexOf(':'));
      for (const stale of creates.keys()) {
        if (!stale.endsWith(bucket)) creates.delete(stale);
      }
      return count;
    },
  };
}

function redisBackend<R extends RoomCore>(
  redis: Redis,
  namespace: string,
  ttlSecondsFor: (room: R) => number,
): Backend<R> {
  const keyPrefix = `${namespace}:room:`;
  const indexKey = `${namespace}:rooms`;
  return {
    async get(code) {
      const raw = await redis.get<string | R>(keyPrefix + code);
      if (!raw) return null;
      return typeof raw === 'string' ? (JSON.parse(raw) as R) : raw;
    },
    async put(room, expectVersion) {
      const ok = await redis.eval(
        CAS_SCRIPT,
        [keyPrefix + room.code, keyPrefix + room.code + ':v'],
        [
          expectVersion === null ? '' : String(expectVersion),
          JSON.stringify(room),
          String(room.version),
          String(ttlSecondsFor(room)),
        ],
      );
      if (ok === 1) {
        // The browser index: a sorted set by last touch, closed rooms dropped
        if (room.status === 'closed') await redis.zrem(indexKey, room.code);
        else await redis.zadd(indexKey, { score: room.updatedAt, member: room.code });
      }
      return ok === 1;
    },
    async remove(code) {
      await redis.del(keyPrefix + code, keyPrefix + code + ':v');
      await redis.zrem(indexKey, code);
    },
    async list(limit) {
      const cutoff = Date.now() - ROOM_TTL_SECONDS * 1000;
      await redis.zremrangebyscore(indexKey, 0, cutoff);
      const codes = await redis.zrange<string[]>(indexKey, 0, limit - 1, { rev: true });
      if (codes.length === 0) return [];
      const raws = await redis.mget<(string | R | null)[]>(
        ...codes.map((code) => keyPrefix + code),
      );
      const gone = codes.filter((_, i) => !raws[i]);
      if (gone.length > 0) await redis.zrem(indexKey, ...gone);
      return raws.flatMap((raw) => {
        if (!raw) return [];
        const room = typeof raw === 'string' ? (JSON.parse(raw) as R) : raw;
        return room.status === 'closed' ? [] : [room];
      });
    },
    async openCount(now) {
      await redis.zremrangebyscore(indexKey, 0, now - ROOM_TTL_SECONDS * 1000);
      return redis.zcard(indexKey);
    },
    async countCreate(key, windowSeconds) {
      const count = await redis.incr(key);
      if (count === 1) await redis.expire(key, windowSeconds);
      return count;
    },
  };
}

let sharedRedis: Redis | null | undefined;

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
  '[rooms] UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are not set. ' +
  'Rivals rooms are kept in process memory, which does not survive restarts ' +
  'and is not shared between serverless instances. Set both variables in production.';

// One REST client for every game's store; null without credentials
function redisClient(): Redis | null {
  if (sharedRedis !== undefined) return sharedRedis;
  const credentials = redisCredentials();
  sharedRedis = credentials ? new Redis(credentials) : null;
  return sharedRedis;
}

export function createRoomStore<R extends RoomCore>(
  options: RoomStoreOptions<R>,
): RoomStore<R> {
  const lobbyIdleMs = options.lobbyIdleMs ?? LOBBY_IDLE_MS;
  // A lobby only needs to outlive its idle window; the lazy check clears it anyway
  const lobbyTtlSeconds = Math.ceil(lobbyIdleMs / 1000) + 60;
  const ttlSecondsFor =
    options.ttlSecondsFor ??
    ((room: R) => (room.status === 'lobby' ? lobbyTtlSeconds : ROOM_TTL_SECONDS));

  let backend: Backend<R> | null = null;
  const resolve = (): Backend<R> => {
    if (backend) return backend;
    const redis = redisClient();
    backend = redis
      ? redisBackend(redis, options.namespace, ttlSecondsFor)
      : memoryBackend(options.memoryKey);
    return backend;
  };

  return {
    load: (code) => resolve().get(code),
    list: (limit = 50) => resolve().list(limit),
    remove: (code) => resolve().remove(code),
    async create(room) {
      const ok = await resolve().put({ ...room, version: 1 }, null);
      if (!ok) throw new VersionConflict();
    },
    async save(room, now) {
      const next: R = { ...room, version: room.version + 1, updatedAt: now };
      const ok = await resolve().put(next, room.version);
      if (!ok) throw new VersionConflict();
      return next;
    },
    lobbyExpired: (room, now) =>
      room.status === 'lobby' && now - room.updatedAt > lobbyIdleMs,
    openCount: (now) => resolve().openCount(now),
    // Fixed windows: every creation inside the same window shares one key
    countCreate: (client, now, windowSeconds) =>
      resolve().countCreate(
        `${options.namespace}:create:${client}:${Math.floor(now / (windowSeconds * 1000))}`,
        windowSeconds,
      ),
  };
}
