# CLAUDE.md

This repository is a public port of a game that was made for a group of friends, with the inside jokes, real people and private references removed, fictional characters in their place, and everything translated to English with Serbian as the second language. The content rules below exist to keep it that way, so nothing private, real or identifying gets back in.

Guidance for Claude Code when working in this repo.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4.

## Rules

### Content rules

- No real people: every character, name, likeness and biography is fictional.
- No brands, and no real places other than Leskovac and Pčinja.
- No nationality, religion, sexual content or drugs.
- Crude slapstick is fine.
- Every string exists in both languages, under the same key.
- All art is hand-written SVG. No raster files (png, jpg, webp, gif) under `public/`.
- No em-dashes.

### Styling

- **Tailwind only.** Never write custom CSS. No `.css` modules, no `style={{ ... }}` objects, no `styled-components`. If a class doesn't exist, compose Tailwind utilities or extend the Tailwind config.
- `app/globals.css` is reserved for Tailwind directives, root variables and shared keyframes only. Do not add component styles there.
- Follow the existing design tokens (frost border `frost-border`, slate-950/900 backgrounds, red-300/sky-200/cyan-200 accents, `rounded-3xl` frost cards). Write classes dark-first; light mode is handled by the palette remap in `app/globals.css`.

### React component structure

- **One component per file.** Never colocate two exported components in the same file.
- File name matches the component name in `PascalCase.tsx` (e.g. `EventCard.tsx` exports `EventCard`).
- Components live under `components/<feature>/` (e.g. `components/games/career/`, `components/games/match/`, `components/hub/`). Shared primitives go in `components/shared/`.
- Route-specific page shells stay in `app/<route>/page.tsx`. Page files should compose components, not define them inline.
- Default-export the component from its file. Named-export anything else (types, helpers).
- Mark `"use client"` only on files that actually need it (hooks, event handlers, browser APIs). Keep server components the default.

### Utilities and constants

- **Utility functions** go in `lib/utils/`, grouped by concern (e.g. `formatters.ts` holds all formatter helpers, `dates.ts` holds date helpers). Named-exported. No `utils.ts` catch-all. If a file outgrows its concern, split it, don't widen its scope.
- **Constants** go in `lib/constants/` (or `data/games/` for content like the roster, sponsors, seasons), also grouped by concern: `careerMp.ts`, `gameMusic.ts`, etc. Use `UPPER_SNAKE_CASE` for primitive constants, `camelCase` for structured data exports.
- **Types** go next to the constants/utils that use them, or in `lib/types/` if shared across features.

### Data fetching

- **TanStack Query (`@tanstack/react-query`) for all client-side data fetching.** No raw `useEffect` + `fetch`, no SWR, no ad-hoc loading-state hooks.
- Define query keys and fetcher functions in `lib/queries/<feature>.ts` and consume via `useQuery` / `useMutation` in the component.
- Prefer server components and direct data access in RSCs when the data does not need to be client-interactive. TanStack Query is for the client boundary.

### Text and tone

- **Player-facing text lives only in the locale files**, `data/games/locales/en.json` and `data/games/locales/sr.json`. English is the default language, Serbian is the second. No player-facing string is hard-coded in a component, page, util or constant. **Everything else, including file paths, folder names, route segments, slugs, component/variable/function names, comments, and commit messages, is in English.** No Serbian in code or filesystem.
- **A new string goes into both locale files, under the same key.** `npm run check:locale` and `tsc` fail when the key trees, placeholders or positional arrays differ. A phrase with a count next to a noun is stored as `{ "one", "few", "other" }` and rendered with `plural()` from `lib/utils/format.ts` (English repeats its plural under `few`).
- **Client code reads `GAMES_UI`**, picked from the `locale` cookie when the page loads. **Server components never use `GAMES_UI`**: they take the request's dictionary from `requestDictionary()` in `lib/utils/requestLocale.ts`, and any client tree that reads `GAMES_UI` mounts behind `components/shared/ClientOnly.tsx`.
- **Never use an em-dash (U+2014)** anywhere: not in UI text, not in Markdown, not in comments. Use commas, periods, or restructure.

### Code hygiene

- No dead code, no commented-out blocks, no `TODO` without a concrete follow-up.
- Default to no comments. Only add a comment when the *why* is non-obvious.
- Prefer editing existing files over creating new ones, unless the new file is required by the one-component-per-file or one-util-per-file rules above.

## Commands

```bash
npm run dev         # local dev server
npm run build       # production build
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
npm run check:locale # en.json and sr.json share one key tree
npm run sim         # headless Manager league simulation, 5 years x 200 runs
npm run sim:rivals  # Rivals engine smoke test, must report 0 failures
```

## Project layout

```
app/                    # Next.js App Router routes
  layout.tsx
  page.tsx              # hub
  manager/              # Glizzy Manager (Serbian: Glizić Manager) (internal name: career)
  rivals/               # Glizzy Rivals (Serbian: Glizić Rivals) (internal name: career-mp)
  api/career-mp/        # Rivals room API
  preview/              # dev-only scene gallery, noindex
components/
  games/                # game UI, one component per file, PascalCase.tsx
  hub/                  # hub page and site header
  icons/
  preview/
  shared/               # cross-feature primitives
data/games/             # static content: roster, sponsors, seasons, commentary, locales
lib/
  constants/            # exported constants, one concern per file
  utils/                # pure helpers, grouped by concern
  queries/              # TanStack Query keys + fetchers
  server/career-mp/     # Rivals room engine
  types/                # shared TS types
public/                 # SVG portraits and marks, audio
scripts/                # simulators and generators used as checks
```

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
