// Trailer build: npm run trailer:build [-- --capture --screenshots --preview]
// Runs the pipeline in order: narrate.mjs (always; it only calls the voice
// for a paragraph whose text is not rendered in the work folder yet, so an
// unchanged script is never billed twice), capture.mjs (skipped once the
// clips are there; --capture refilms), compose.mjs (always: frames, the
// effects mix, the encode, the captions and the README poster; --preview
// renders a contact sheet instead) and, with --screenshots, the README shots.
// Needs the dev server up (BASE, default http://localhost:3218, started with
// CAREER_MP_UNLIMITED=1 so the Rivals rooms are not rate limited), Chrome,
// ffmpeg, puppeteer-core (PUPPETEER_CORE may name a node_modules folder that
// has it) and XI_API_KEY when a paragraph needs rendering. TRAILER_WORK picks
// the work folder; it defaults to the OS temp dir.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { SCRIPT_DIR, WORK_DIR } from './paths.mjs';

const flags = new Set(process.argv.slice(2));
const run = (script, args = []) => {
  console.log(`\n== ${script} ${args.join(' ')}`);
  const result = spawnSync(process.execPath, ['--no-warnings', join(SCRIPT_DIR, script), ...args], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
};

run('narrate.mjs');
if (flags.has('--capture') || !existsSync(join(WORK_DIR, 'clips', 'clips.json'))) run('capture.mjs');
else console.log(`footage already captured in ${WORK_DIR}`);
if (flags.has('--screenshots')) run('screenshots.mjs');
run('compose.mjs', flags.has('--preview') ? ['--preview'] : []);
