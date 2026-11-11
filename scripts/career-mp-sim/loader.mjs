import { existsSync, readFileSync, statSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const EXTS = ['.ts', '.tsx', '.js', '.mjs', '.json'];

function tryFile(base) {
  if (existsSync(base) && statSync(base).isFile()) return base;
  for (const ext of EXTS) {
    if (existsSync(base + ext) && statSync(base + ext).isFile()) return base + ext;
  }
  for (const ext of EXTS) {
    const idx = path.join(base, 'index' + ext);
    if (existsSync(idx)) return idx;
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  let target = null;
  if (specifier.startsWith('@/')) {
    target = path.join(ROOT, specifier.slice(2));
  } else if (specifier.startsWith('.') || specifier.startsWith('/')) {
    const parentPath = context.parentURL
      ? fileURLToPath(context.parentURL)
      : process.cwd() + '/x';
    target = specifier.startsWith('/')
      ? specifier
      : path.resolve(path.dirname(parentPath), specifier);
  }
  if (target) {
    const file = tryFile(target);
    if (file) return { url: pathToFileURL(file).href, shortCircuit: true };
  }
  try {
    return await nextResolve(specifier, context);
  } catch (e) {
    // Packages without an exports map (next/server) need the file extension
    // under ESM resolution, which the bundler adds on its own
    if (e?.code !== 'ERR_MODULE_NOT_FOUND' || path.extname(specifier)) throw e;
    return nextResolve(`${specifier}.js`, context);
  }
}

export async function load(url, context, nextLoad) {
  if (url.endsWith('.json')) {
    const source = readFileSync(fileURLToPath(url), 'utf8');
    return {
      format: 'module',
      source: `export default ${source};`,
      shortCircuit: true,
    };
  }
  return nextLoad(url, context);
}
