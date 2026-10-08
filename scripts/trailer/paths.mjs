// Shared locations for the trailer scripts. Intermediate frames and the
// narration live in TRAILER_WORK (default: a folder in the OS temp dir), never
// in the repo; only the finished mp4, its captions and the README screenshots
// land under public/ and docs/.
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(SCRIPT_DIR, '..', '..');
export const WORK_DIR = process.env.TRAILER_WORK ?? join(tmpdir(), 'glizzy-trailer');
export const NARRATION_FILE = join(SCRIPT_DIR, 'narration.txt');
export const COMPOSITOR_FILE = join(SCRIPT_DIR, 'compositor.html');
export const OUTPUT_MP4 = join(ROOT, 'public', 'trailer', 'glizzy-manager-trailer.mp4');
export const OUTPUT_VTT = join(ROOT, 'public', 'trailer', 'glizzy-manager-trailer.vtt');
export const SCREENSHOT_DIR = join(ROOT, 'docs', 'screenshots');
export const BASE_URL = process.env.BASE ?? 'http://localhost:3218';
export const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
// The game is filmed at a phone's viewport, scaled up to the stage exactly
export const PHONE = { width: 432, height: 768, scale: 2.5 };
export const DESKTOP = { width: 1920, height: 1080, scale: 2 };

export function paragraphsOf(text) {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

// puppeteer-core is not a dependency of the game; it is resolved from
// PUPPETEER_CORE (a package name or a node_modules folder to resolve from)
export async function loadPuppeteer() {
  const spec = process.env.PUPPETEER_CORE ?? 'puppeteer-core';
  if (spec.includes('/')) {
    const { createRequire } = await import('node:module');
    return createRequire(spec.endsWith('/') ? spec : `${spec}/`)('puppeteer-core');
  }
  return (await import(spec)).default;
}
