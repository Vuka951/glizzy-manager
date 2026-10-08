// Parity check for the two locale files: node scripts/locale-check.mjs
// Fails (exit 1) on a key present in one file only, a value of a different
// type, a different {placeholder} set for the same key, or a different
// length for an array the code indexes by position. Any other array length
// difference is printed as a warning.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const LOCALES_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'games', 'locales');
const BASE = 'en';
const OTHER = 'sr';

// Arrays read by index (season, cup round, month, favor count), where a
// missing entry is a missing string on screen. The rest are pools to draw from
const POSITIONAL_ARRAYS = [
  /^shared\.seasons$/,
  /^cup\.roundNames$/,
  /^cup\.studio\.themes$/,
  /^career\.broadcast\.weatherReports$/,
  /^career\.offseason\.months(\.\d+)?$/,
  /^career\.mail\.seasonPrices\.(bodies|reversedBodies)$/,
  /^career\.mail\.favor\.counts\.\w+$/,
];

const PLURAL_KEYS = ['few', 'one', 'other'];

const load = (locale) => JSON.parse(readFileSync(join(LOCALES_DIR, `${locale}.json`), 'utf8'));

const typeOf = (value) =>
  value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;

const placeholders = (text) => [...new Set(text.match(/\{\w+\}/g) ?? [])].sort();

// A counted phrase stores one template per plural form. A form may spell
// its count out ("one returnee"), so the forms are compared as a group
const isPluralForms = (value) =>
  typeOf(value) === 'object' &&
  Object.keys(value).sort().join() === PLURAL_KEYS.join() &&
  Object.values(value).every((form) => typeof form === 'string');

const errors = [];
const warnings = [];

function compare(base, other, path) {
  const baseType = typeOf(base);
  const otherType = typeOf(other);
  if (baseType !== otherType) {
    errors.push(`${path}: type differs (${BASE} ${baseType}, ${OTHER} ${otherType})`);
    return;
  }
  if (baseType === 'string') {
    const a = placeholders(base).join(' ');
    const b = placeholders(other).join(' ');
    if (a !== b) {
      errors.push(`${path}: placeholders differ (${BASE} [${a}], ${OTHER} [${b}])`);
    }
    return;
  }
  if (baseType === 'array') {
    if (base.length !== other.length) {
      const message = `${path}: array length differs (${BASE} ${base.length}, ${OTHER} ${other.length})`;
      if (POSITIONAL_ARRAYS.some((pattern) => pattern.test(path))) errors.push(message);
      else warnings.push(message);
    }
    for (let i = 0; i < Math.min(base.length, other.length); i += 1) {
      compare(base[i], other[i], `${path}.${i}`);
    }
    return;
  }
  if (baseType !== 'object') return;
  if (isPluralForms(base) && isPluralForms(other)) {
    const a = placeholders(Object.values(base).join(' ')).join(' ');
    const b = placeholders(Object.values(other).join(' ')).join(' ');
    if (a !== b) {
      errors.push(`${path}: placeholders differ across the plural forms (${BASE} [${a}], ${OTHER} [${b}])`);
    }
    return;
  }
  for (const key of Object.keys(base)) {
    const next = path ? `${path}.${key}` : key;
    if (!(key in other)) errors.push(`${next}: missing in ${OTHER}.json`);
    else compare(base[key], other[key], next);
  }
  for (const key of Object.keys(other)) {
    if (!(key in base)) errors.push(`${path ? `${path}.${key}` : key}: missing in ${BASE}.json`);
  }
}

compare(load(BASE), load(OTHER), '');

if (warnings.length > 0) {
  console.warn(`${warnings.length} warning(s):`);
  for (const warning of warnings) console.warn(`  ${warning}`);
}
if (errors.length > 0) {
  console.error(`Locale files are out of step, ${errors.length} problem(s):`);
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}
console.log(`Locale files match: ${BASE}.json and ${OTHER}.json share one key tree.`);
