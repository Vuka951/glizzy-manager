// Shortlists ElevenLabs voices for the English commentary booth: the shared
// voice library (English, most used first) and the voices already in the
// account, with their id, labels, usage and preview link, so the owner can
// listen and pick XI_VOICE_ID. A shared voice must be added to the account
// before text-to-speech accepts it, which --add does.
// Usage: XI_API_KEY=... node scripts/career-commentary/voices.mjs
//          [--query <text>] [--use-case <value>] [--accent <value>]
//          [--sort usage_character_count_1y|trending|cloned_by_count|created_date]
//          [--limit <n>]
//        XI_API_KEY=... node scripts/career-commentary/voices.mjs --add <public_user_id> <voice_id> [name]
const API = 'https://api.elevenlabs.io';
const DEFAULT_LIMIT = 15;
const DEFAULT_QUERY = 'commentator';

const apiKey = process.env.XI_API_KEY;
if (!apiKey) {
  console.error('XI_API_KEY is required (the ElevenLabs key)');
  process.exit(1);
}

const args = process.argv.slice(2);
function option(name, fallback) {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] !== undefined ? args[index + 1] : fallback;
}

async function call(path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', ...init.headers },
  });
  if (!res.ok) throw new Error(`${init.method ?? 'GET'} ${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

const addIndex = args.indexOf('--add');
if (addIndex >= 0) {
  const [publicUserId, voiceId, name] = args.slice(addIndex + 1);
  if (!publicUserId || !voiceId) {
    console.error('--add needs <public_user_id> <voice_id> [name]');
    process.exit(1);
  }
  const added = await call(`/v1/voices/add/${publicUserId}/${voiceId}`, {
    method: 'POST',
    body: JSON.stringify({ new_name: name ?? `Commentary ${voiceId}` }),
  });
  console.log(`Added to the account library as voice ${added.voice_id ?? voiceId}. Set XI_VOICE_ID=${added.voice_id ?? voiceId}`);
  process.exit(0);
}

const limit = Number(option('--limit', DEFAULT_LIMIT));
const query = option('--query', DEFAULT_QUERY);
const useCase = option('--use-case');
const accent = option('--accent');
const sort = option('--sort', 'usage_character_count_1y');

const COLUMNS = ['voice id', 'name', 'category', 'accent', 'gender', 'age', 'tags', 'usage 1y', 'preview'];

const list = (value) => (Array.isArray(value) ? value.join('/') : value ?? '');

function table(rows) {
  if (rows.length === 0) {
    console.log('  (none)');
    return;
  }
  const cells = rows.map((row) => COLUMNS.map((column) => String(row[column] ?? '')));
  // The preview link is last and long, so every other column is padded to
  // its widest value and the link runs free
  const widths = COLUMNS.slice(0, -1).map((_, i) =>
    Math.max(COLUMNS[i].length, ...cells.map((row) => row[i].length)),
  );
  const line = (row) =>
    row.map((cell, i) => (i < widths.length ? cell.padEnd(widths[i]) : cell)).join('  ');
  console.log(`  ${line(COLUMNS)}`);
  for (const row of cells) console.log(`  ${line(row)}`);
}

const sharedParams = new URLSearchParams({ language: 'en', sort, page_size: String(limit) });
if (query) sharedParams.set('search', query);
if (useCase) sharedParams.set('use_cases', useCase);
if (accent) sharedParams.set('accent', accent);
const shared = await call(`/v1/shared-voices?${sharedParams}`);
console.log(`Shared library, English, sorted by ${sort}${query ? `, search "${query}"` : ''}${useCase ? `, use case ${useCase}` : ''}${accent ? `, accent ${accent}` : ''}:`);
table(
  (shared.voices ?? []).map((voice) => ({
    'voice id': `${voice.public_owner_id ?? '?'} ${voice.voice_id}`,
    name: voice.name,
    category: voice.category,
    accent: voice.accent,
    gender: voice.gender,
    age: voice.age,
    tags: [list(voice.descriptive), list(voice.use_case)].filter(Boolean).join(' '),
    'usage 1y': voice.usage_character_count_1y,
    preview: voice.preview_url,
  })),
);
console.log('  (voice id column: <public_user_id> <voice_id>, the two arguments --add takes)\n');

const own = await call('/v2/voices?page_size=100');
console.log('Account library (XI_VOICE_ID takes any of these as is):');
table(
  (own.voices ?? []).map((voice) => ({
    'voice id': voice.voice_id,
    name: voice.name,
    category: voice.category,
    accent: voice.labels?.accent,
    gender: voice.labels?.gender,
    age: voice.labels?.age,
    tags: [voice.labels?.descriptive ?? voice.labels?.description, voice.labels?.use_case].filter(Boolean).join(' '),
    'usage 1y': voice.sharing?.usage_character_count_1y ?? voice.usage_character_count_1y,
    preview: voice.preview_url,
  })),
);
