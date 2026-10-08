// Deletes every career multiplayer room from Upstash Redis, plus the room
// index. Reads credentials from .env.local. Pass --dry-run to only list keys.
//
//   node --env-file=.env.local scripts/career-mp-sim/clear-rooms.mjs [--dry-run]
import { Redis } from '@upstash/redis';

const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
if (!url || !token) {
  console.error('Missing KV_REST_API_URL / KV_REST_API_TOKEN. Run with --env-file=.env.local');
  process.exit(1);
}

const dryRun = process.argv.includes('--dry-run');
const redis = new Redis({ url, token });

const keys = [];
let cursor = '0';
do {
  const [next, batch] = await redis.scan(cursor, { match: 'career-mp:room:*', count: 200 });
  keys.push(...batch);
  cursor = String(next);
} while (cursor !== '0');
keys.push('career-mp:rooms');

const codes = keys.filter((k) => k.startsWith('career-mp:room:') && !k.endsWith(':v'));
console.log(`${codes.length} room(s), ${keys.length} key(s) total`);
for (const key of keys) console.log(dryRun ? `  would delete ${key}` : `  ${key}`);

if (dryRun) process.exit(0);

let deleted = 0;
for (let i = 0; i < keys.length; i += 100) {
  deleted += await redis.del(...keys.slice(i, i + 100));
}
console.log(`deleted ${deleted} key(s)`);
