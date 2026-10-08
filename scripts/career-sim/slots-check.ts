// Save slot checks for the single-player career, run through the sim loader:
//   ./scripts/career-sim/slots-check.sh
// Every scenario runs in its own process so the module's migration flag and
// cache start clean.
import { deepStrictEqual, strictEqual, ok } from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { CHARACTER_ROSTER } from '@/data/games/roster';
import { sampleCareer } from '@/components/preview/sampleCareer';
import { simulateOffseason } from '@/lib/utils/careerOffseason';
import type { SavedCareer } from '@/lib/utils/careerSave';

const LEGACY = 'glizzy-manager-active';
const key = (slot: number) => `glizzy-manager-slot-${slot}`;

class MemoryStorage {
  data = new Map<string, string>();
  throwing = false;
  getItem(k: string) {
    if (this.throwing) throw new Error('blocked');
    return this.data.has(k) ? (this.data.get(k) as string) : null;
  }
  setItem(k: string, v: string) {
    if (this.throwing) throw new Error('blocked');
    this.data.set(k, String(v));
  }
  removeItem(k: string) {
    if (this.throwing) throw new Error('blocked');
    this.data.delete(k);
  }
}

const storage = new MemoryStorage();
(globalThis as unknown as { window: unknown }).window = { localStorage: storage };

const slugs = CHARACTER_ROSTER.map((c) => c.slug);

// What a browser actually holds: JSON has no undefined fields
function sample(playerSlug: string, year: number): SavedCareer {
  return JSON.parse(JSON.stringify(sampleCareer({ slugs, playerSlug, year })));
}

function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function playOn(state: SavedCareer): SavedCareer {
  const original = Math.random;
  Math.random = seeded(42);
  try {
    return simulateOffseason(state);
  } finally {
    Math.random = original;
  }
}

async function load() {
  return (await import('@/lib/utils/careerSave')).careerSave;
}

const scenarios: Record<string, () => Promise<void>> = {
  async migrate() {
    const old = sample('vuka', 4);
    const raw = JSON.stringify(old);
    storage.data.set(LEGACY, raw);
    const careerSave = await load();
    const slots = careerSave.loadSlots();
    deepStrictEqual(slots[0], old, 'old save lands in slot 1 unchanged');
    strictEqual(slots[1], null);
    strictEqual(slots[2], null);
    strictEqual(storage.data.get(key(1)), raw, 'slot 1 holds the exact bytes');
    ok(!storage.data.has(LEGACY), 'old key is dropped after the copy');
    strictEqual(careerSave.loadSlots(), slots, 'snapshot is stable');

    const fromSlot = careerSave.load(1) as SavedCareer;
    const next: SavedCareer = JSON.parse(JSON.stringify(playOn(fromSlot)));
    deepStrictEqual(playOn(fromSlot), playOn(old), 'migrated save plays on identically');
    careerSave.save(1, next);
    deepStrictEqual(careerSave.load(1), next);
    ok(!storage.data.has(LEGACY), 'autosave never writes the old key');

    // Three independent careers
    const two = sample('dax', 2);
    const three = sample('steva', 7);
    careerSave.save(2, two);
    careerSave.save(3, three);
    const raw1 = storage.data.get(key(1));
    const raw3 = storage.data.get(key(3));
    const twoNext = { ...two, balance: two.balance + 999, year: 3 };
    careerSave.save(2, twoNext);
    strictEqual(storage.data.get(key(1)), raw1, 'slot 2 write leaves slot 1');
    strictEqual(storage.data.get(key(3)), raw3, 'slot 2 write leaves slot 3');
    deepStrictEqual(careerSave.load(2), twoNext);
    strictEqual(careerSave.load(1)?.playerSlug, 'vuka');
    strictEqual(careerSave.load(3)?.playerSlug, 'steva');

    // Delete one slot
    careerSave.clear(2);
    strictEqual(careerSave.load(2), null);
    deepStrictEqual(careerSave.load(1), next);
    deepStrictEqual(careerSave.load(3), three);

    // Corrupt slots do not take the others down
    storage.data.set(key(3), '{"version":1,"playerSlug":');
    strictEqual(careerSave.load(3), null);
    deepStrictEqual(careerSave.load(1), next);
    storage.data.set(key(2), JSON.stringify({ version: 2, playerSlug: 'x' }));
    strictEqual(careerSave.load(2), null);
    storage.data.set(key(2), 'null');
    strictEqual(careerSave.load(2), null);
    careerSave.save(3, three);
    deepStrictEqual(careerSave.load(3), three, 'a corrupt slot can be reused');
    deepStrictEqual(careerSave.load(1), next);

    careerSave.clearAll();
    deepStrictEqual([...careerSave.loadSlots()], [null, null, null]);
  },

  async migrateIntoFirstEmpty() {
    const taken = sample('dax', 2);
    const old = sample('vuka', 5);
    storage.data.set(key(1), JSON.stringify(taken));
    storage.data.set(LEGACY, JSON.stringify(old));
    const careerSave = await load();
    deepStrictEqual(careerSave.load(1), taken, 'slot 1 is not overwritten');
    deepStrictEqual(careerSave.load(2), old, 'old save takes the next slot');
    ok(!storage.data.has(LEGACY));
  },

  async allFullKeepsLegacy() {
    const old = sample('vuka', 5);
    [1, 2, 3].forEach((s) =>
      storage.data.set(key(s), JSON.stringify(sample('dax', s)))
    );
    storage.data.set(LEGACY, JSON.stringify(old));
    const careerSave = await load();
    careerSave.loadSlots();
    strictEqual(storage.data.get(LEGACY), JSON.stringify(old), 'kept, not lost');
  },

  async fresh() {
    const careerSave = await load();
    deepStrictEqual([...careerSave.loadSlots()], [null, null, null]);
    strictEqual(storage.data.size, 0, 'a fresh browser gets no writes');
  },

  async storageBlocked() {
    storage.data.set(LEGACY, JSON.stringify(sample('vuka', 2)));
    storage.throwing = true;
    const careerSave = await load();
    deepStrictEqual([...careerSave.loadSlots()], [null, null, null]);
    careerSave.save(1, sample('vuka', 2));
    careerSave.clear(1);
    careerSave.clearAll();
    storage.throwing = false;
    ok(storage.data.has(LEGACY), 'blocked storage loses nothing');
  },
};

const only = process.argv[2];
if (only) {
  await scenarios[only]();
  console.log(`ok ${only}`);
} else {
  let failed = 0;
  for (const name of Object.keys(scenarios)) {
    const run = spawnSync(process.execPath, [...process.execArgv, process.argv[1], name], {
      encoding: 'utf8',
    });
    process.stdout.write(run.stdout);
    if (run.status !== 0) {
      failed += 1;
      process.stdout.write(`FAIL ${name}\n${run.stderr}\n`);
    }
  }
  console.log(failed ? `${failed} failed` : 'all slot checks passed');
  process.exit(failed ? 1 : 0);
}
