# Glizzy Manager

[![Watch the trailer](docs/screenshots/00-trailer.png)](public/trailer/glizzy-manager-trailer.mp4)

**[Watch the 73-second trailer](public/trailer/glizzy-manager-trailer.mp4)** (vertical, English narration, [captions](public/trailer/glizzy-manager-trailer.vtt)).

This is a public port of a game that was made for a group of friends. The
original is full of inside jokes, real people and private references; this
edition removes all of that, swaps the private characters for fictional ones,
replaces the private material with generic content, and translates everything
to English, with Serbian kept as a second language. It is here to show how
the game was built, not to be the original.

The game itself: a management sim about a professional hot-dog eating league,
narrated like a deadpan sports broadcast. You coach one of a roster of eaters
through season after season: train them, chase cup runs, sign sponsors who
double as political parties, read the morning paper, sabotage a rival now and
then, and collect achievements along the way. Two modes share one engine:
**Glizzy Manager** is the single-player career at `/manager`, and **Glizzy
Rivals** is the same league played live in a room of up to eight coaches at
`/rivals`.

## Contents

- [Features](#features)
- [Trailer and screenshots](#trailer-and-screenshots)
- [How Rivals stays in sync](#how-rivals-stays-in-sync)
- [Quick start](#quick-start)
- [Environment](#environment)
- [Scripts](#scripts)
- [Checks and simulations](#checks-and-simulations)
- [Languages](#languages)
- [Project layout](#project-layout)
- [Design notes](#design-notes)
- [Audio and art](#audio-and-art)
- [Deployment](#deployment)
- [What was changed for the public edition](#what-was-changed-for-the-public-edition)
- [License](#license) and [Credits](#credits)

## Features

### Glizzy Manager (single player)

**The career**
- Three save slots in the browser, with continue, new career and delete.
- An intro cutscene, then you answer a "Coach wanted" ad in the classifieds
  and pick one of 16 characters. Your eater starts as a comeback with no
  fame, seeded last.
- The first character to reach 300 table points is crowned **Glizzy
  Overlord** and the campaign ends. An AI coach can get there first.
- Fifteen AI coaches with eight personalities (the Grinder, the Showman,
  the Schemer and others) play the same off-season you do.

**The year**
- Four seasons a year. Each one is an off-season of three monthly
  activities, then the morning paper, then a cup.
- A calendar to browse past years: cup results, elections and seasonal
  prices.
- Each season moves one price category up or down, announced by letter, and
  some characters are simply in form in their season.

**The off-season**
- **Training**: Stomach Capacity, Super Sniffer, Nutritionist and Media
  Training, three levels each, plus sparring. Train the same thing without a
  break and you risk overtraining and losing a level.
- **Rest, fast, media** (an interview, or a scandal that may backfire), a
  weekend on the Island for its clients, and a security crew against
  sabotage.
- **Meters**: Cholesterol, Appetite, Ambition, Ego and Fame. Each character
  drifts back toward their own resting values. Too much ego and your eater
  books their own training; too little ambition and they hire guards or
  fast on their own.
- **Mood**: a mood bubble over your character and ambient mood sounds.
- **Permanent investments**: bodyguards, a spa membership, an assistant coach
  and a league informant, who fills in the opponent files bit by bit.
- Every activity plays its own animated scene.

**Sponsors and politics**
- Four sponsors, each with its own perk, make offers by letter. Sponsors are
  also parties in the **Assembly of Leskovac**, 100 seats.
- Elections every two years: a poll, campaign donations, coalitions and an
  election-night cutscene. The ruling party rewards its clients and taxes
  everyone else.
- A big enough donation to a governing party buys a **favor**: an opponent
  removed from the bracket before a cup match.
- **Glizzflation**: a glizzy price index that moves most off-seasons and
  scales what training, guards, sabotage and investments cost. Price hikes
  hurt the government's rating.

**Rivals and sabotage**
- A rival each year (preset from old grudges in year one, then picked at a
  press conference). Beating them in a cup pays.
- Three sabotage methods (diversion, nightmare, planted evidence), with the
  option to pay extra for better odds and a fine if it fails. Planted evidence can
  get the target arrested mid-match. Hits on your own eater play back as an
  overnight reel.

**The cup**
- A 16-eater knockout bracket seeded from the league table, with prize money
  for the podium.
- Matches are simulated and watched, not played. Each round a glizzy hides in
  a hat, a sock or a box. Stomach capacity is your eater's lives, and ties go
  to sudden-death overtime. A match can also end in a meltdown, an
  overeating, an arrest or a political removal.
- Bets on any match (stakes of 5 to 50, odds 1.1x to 2.2x). Betting
  against your own eater can leak to them.
- A tale of the tape before each match, a studio cup preview with title odds,
  weather and streaks, and a crowd in the stands.
- Watch any match, skip ahead, or withdraw from the cup.
- Features unlock as you go: sabotage, security and the commentator after the
  first cup, betting after the second, the studio preview after the third.

**Presentation**
- **The paper**: a newspaper after every off-season with headlines, stamps
  and charts. A **mailbox** for prize money, offers, donation calls and
  unlock letters.
- **Commentary**: voiced in both languages (505 clips each), always
  captioned.
- **Breaking-news quote cutscenes** fired by situations (a champion, the
  wooden spoon, a price crash), with skip and skip all.
- **19 achievements** with unlock toasts and a board on the hub.
- **Campaign report** at the end: a timeline chart, "Who Was What" awards,
  the final table, champions by cup, governments and the Glizzflation
  history, downloadable as a PNG or a PDF.
- A looping music track per season that crossfades on the change.
- Settings for master, effects, music and voice volume, the commentator,
  cutscenes, language and fullscreen.

### Glizzy Rivals (up to eight coaches)

The same league, played live. Every coach runs one character; the rest of
the 16 are AI.

- **Rooms**: create one and share the six-character code (no lookalike
  glyphs, so it can be read off a phone), or pick a room from the **room
  board**, which lists open rooms with their coaches, status and who is
  online. Rooms you already sit in come first with a Resume button.
- **Lobby**: unique coach names, eight ink colors, one character per coach,
  invite and rejoin links. The host picks one time limit for every decision
  phase (none, 1, 3 or 5 minutes) and starts the league once 2 to 8 coaches
  have picked a character and everyone else has marked themselves ready.
- **Phases**: the off-season window, the paper, the bracket draw, bets for
  each match, the match clip and the season end. A phase closes when its
  timer runs out or every coach is done.
- **Shared matches**: every screen plays the same clip at the same moment. A
  majority can skip to the result; everyone has to agree to skip a round or
  the whole cup.
- **Betting in the stands**: each coach's bet shows as a token in the crowd
  with its stake. Odds lock when the bet is placed and settle when the clip
  ends.
- **Favors, sabotage and withdrawals** work as in single player, against
  human and AI characters alike.
- **Private information stays private**: each coach gets their own view.
  Mail, ledger, months spent and planned sabotage are only sent to their
  owner.
- **The final edition**: when someone becomes Overlord, a special-edition
  report compares the coaches: standings, money by category, plots, guards,
  bets, favors, sponsors, rivals, best and worst cups, and a head-to-head
  grid. A majority can vote to keep playing.
- **Reconnect anywhere**: your seat is a token in local storage, and the
  rejoin link carries it to another device. Coaches who stop polling show as
  away.
- **Host controls**: close the room at any time. Coaches can leave while the
  room is still in the lobby, and the host role passes on.

### Around both modes

- **English and Serbian**, switchable at any time. Saves and rooms store
  message keys, not sentences, so the same save reads in either language and
  coaches in one room can each play in their own.
- **Dark and light themes**, applied before the first paint so the page
  never flashes.
- A first-visit tour (about, language, look and sound, modes) that can be
  replayed from the settings gear.
- A trailer with captions, playable from the hub.
- All art is hand-written SVG, one style per character. No raster images
  ship under `public/`.
- An Open Graph card drawn in JSX, a sitemap, and `robots.txt`.
- A dev-only scene gallery at `/preview` (404 in production) for checking
  cutscenes and graphics without playing to them.

## Trailer and screenshots

The trailer at the top is regenerated with `npm run trailer:build` (see
Scripts); the game also plays it from the hub and the first onboarding step.

| | |
| --- | --- |
| ![The hub](docs/screenshots/01-hub.png) | ![Character select](docs/screenshots/02-character-select.png) |
| ![The off-season](docs/screenshots/03-offseason.png) | ![The newspaper](docs/screenshots/04-newspaper.png) |
| ![A match](docs/screenshots/05-match.png) | ![A quote cutscene](docs/screenshots/06-quote-cutscene.png) |
| ![The Assembly](docs/screenshots/07-parliament.png) | ![A Rivals lobby](docs/screenshots/08-rivals.png) |

## How Rivals stays in sync

Rivals is multiplayer with no WebSockets, no server-sent events and no
long-running server. Clients poll a small JSON API, each room is one
document in Redis, and the server moves the game forward whenever someone
asks. This section explains why.

### Why not sockets

The app is built to run on Vercel, where every API route is a serverless
function. That rules out the usual realtime setup:

- **No process holds a connection.** A WebSocket is a long-lived connection
  to one server. A serverless function is started for a request, answers,
  and may be frozen or thrown away right after. There is nowhere to keep a
  socket open between turns.
- **No shared memory.** Two coaches in one room can hit two different
  instances, and the next request can land on a fresh one after a cold
  start. A room kept in a variable on one instance does not exist on the
  others.
- **Server-sent events have the same problem.** A stream is still a request
  that has to stay open, and functions have a duration limit. Keeping one
  open per coach for an hour-long league would fight the platform.
- **The workarounds cost more than they buy.** A separate always-on socket
  server or a hosted realtime service means another deployment, another
  bill and another thing to keep alive, for a game that does not need
  millisecond updates.

And the game does not need them. Rivals is turn-based: coaches make
decisions in windows that last seconds to minutes, then everyone watches
the result. A two-second delay before you see another coach's bet is fine.
The one moment that has to be in lockstep, the match clip, is solved with a
shared start time instead of a live stream (see below).

### The model

```
browser (every 2 to 3 s)          serverless route               Upstash Redis
  GET  /rooms/ABC123?since=41  ->   load room                ->   GET room
                                    apply passed deadlines
                               <-   { unchanged: true }  or the coach's view
  POST /rooms/ABC123/actions   ->   load, apply, compare-and-set version  ->  EVAL
```

- **One document per room.** The whole room (coaches, league, phase, log)
  is a JSON value in Redis with a version number next to it.
- **Polling on the phase's cadence.** A coach who still has to decide polls
  every 2 seconds, one who is waiting every 3. A poll sends `?since=<version>`
  and gets back `{ "unchanged": true }` when nothing moved, so the full room
  only travels when something changed. The client is TanStack Query with a
  `refetchInterval` (`components/games/career-mp/useRoomView.ts`).
- **Optimistic writes.** Every write is a compare-and-set in a short Lua
  script: it only lands if the stored version is still the one that was
  read. A loser reloads and tries again, up to six times with jittered
  backoff, so clicks from eight coaches at once all get in. A click made on
  a phase that has since closed is refused as `stale`, with the fresh view
  attached so the screen catches up (`lib/server/career-mp/store.ts`,
  `handlers.ts`).
- **Timers without a timer.** Nothing runs in the background, so no request
  is waiting to fire a deadline. Instead every request first applies
  whatever has expired: a closed window, a finished clip, a betting
  countdown (`lib/server/career-mp/timers.ts`). A room nobody polls simply
  waits. To make sure everyone sees a deadline pass together, each client
  knows the next deadline from the view and asks again 150 ms after it,
  corrected for the gap between its clock and the server's.
- **Synced clips.** When a match is decided, the server simulates it right
  away and schedules the clip to start 3 seconds later, at an absolute
  server time. Every screen has the whole result before the first frame and
  starts playing at that time, so everyone sees the same overeating at the
  same moment without a single message streamed during the match
  (`lib/server/career-mp/playback.ts`).
- **Cheap presence.** A poll marks the coach as seen, but only writes it
  when the last mark is over 10 seconds old. A coach counts as online while
  their polls arrive within 30 seconds. An idle room costs one Redis read per
  poll.
- **Per-coach views.** The server never sends the raw room. Each response is
  built for the coach who asked (`lib/server/career-mp/view.ts`), so other
  coaches' mail, ledgers and sabotage plans never reach the browser.

### Why Upstash

- **It speaks HTTP.** Upstash Redis is called over a REST API, so a
  function needs no TCP connection pool that would be rebuilt on every cold
  start and could run out under load.
- **Pay per request, scale to zero.** A game played a few evenings a month
  costs close to nothing when nobody is playing.
- **Redis does the bookkeeping.** Key expiry clears old rooms (30 days, or
  shortly after an abandoned lobby), a sorted set by last activity backs the
  room board, `EVAL` gives the atomic compare-and-set, and `INCR` with an
  expiry counts room creations for the rate limit.
- **It is the store Vercel offers.** The code also reads the
  `KV_REST_API_URL` and `KV_REST_API_TOKEN` names that Vercel's Upstash
  integration sets, so connecting it in the dashboard is enough.

### Why the in-memory fallback

Without Redis credentials the same store interface is backed by a `Map` on
`globalThis`, with the same compare-and-set rule. That keeps `npm run dev`
working with no account and no setup: the dev server is one long-lived
process, so a map is a correct store there, and it survives hot reloads.
The test kit runs against it too. In production the map would be wrong,
since every instance would have its own rooms, so a production server
started without the variables prints a warning once
(`instrumentation.ts`).

### Trade-offs

- Another coach's move shows up after up to one poll, 2 to 3 seconds.
  Your own actions come back with the new view right away.
- Polling costs requests even when nothing happens. With `?since` and the
  presence throttle, a waiting coach costs one small request and one Redis
  read every 3 seconds.
- Rooms are open to anyone, so creation is capped at 10 rooms per client
  address per hour and 500 open rooms overall. The address is hashed before
  it is used as a counter key, and seat tokens are stored only as hashes.

## Quick start

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`. Rivals rooms work locally without any
credentials (see Environment). To try Rivals alone, open a room in one
browser and join it from a private window.

## Environment

Copy `.env.example` to `.env.local`.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public origin, used for metadata, canonical links, `robots.txt` and the sitemap. |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint for Rivals rooms. `KV_REST_API_URL` is read as a fallback. |
| `UPSTASH_REDIS_REST_TOKEN` | Its token. `KV_REST_API_TOKEN` is read as a fallback. |
| `CAREER_MP_UNLIMITED` | Set to `1` to lift the room creation limits during local testing. Ignored in production. |
| `XI_API_KEY` | ElevenLabs key, only for the audio generators under `scripts/`. |
| `XI_VOICE_ID` | ElevenLabs voice id for the commentary generator. |

Without the Redis variables the room store falls back to an in-memory map,
which is fine for `next dev` and wrong for serverless: a production server
started without them prints one warning and rooms vanish between instances.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server. |
| `npm run build` | Production build. |
| `npm run start` | Serves the production build. |
| `npm run lint` | ESLint. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run check:locale` | `en.json` and `sr.json` share one key tree, placeholders and plural shapes. |
| `npm run check:audio` | Every clip the code can play exists under `public/games/audio`, and nothing is orphaned. |
| `npm run commentary:voices` | Shortlists ElevenLabs voices for the English commentary booth; `-- --add <public_user_id> <voice_id>` adds a shared one to the account. Needs `XI_API_KEY`. |
| `npm run commentary:render` | Renders the English commentary bank (`-- --dry-run` shows the plan and the character count). Needs `XI_API_KEY` and `XI_VOICE_ID`. |
| `npm run trailer:build` | Rebuilds the trailer under `public/trailer/` from the running dev server: renders the narration once (`XI_API_KEY`), films the game, composes and encodes. `-- --screenshots` also retakes `docs/screenshots/`. See `scripts/trailer/build.mjs`. |
| `npm run sim` | Headless Manager league simulation, 5 years x 200 runs. |
| `npm run sim:rivals` | Rivals engine smoke test, must report `"failures":0`. |

## Checks and simulations

There is no unit test suite. The game is checked by these:

- `npm run lint`, `npm run typecheck`, `npm run check:locale` and
  `npm run check:audio` keep the code, the two languages and the sound bank
  consistent.
- `npm run sim` plays 200 five-year single-player leagues headlessly and
  prints points by final position, by AI personality and by character. It is
  the balance check: run it before and after touching the career rules and
  compare the medians.
- `npm run sim:rivals` drives the Rivals reducer directly with eight coaches
  for twenty years, no server: lobby picks, every phase, bets, favors,
  withdrawals, skip votes and the Overlord finish. Any broken invariant is
  counted as a failure.
- `scripts/career-mp-sim/` holds the browser and curl kit for a running dev
  server (create and join, stale clicks, timer expiry with a faked clock,
  lobby expiry, closing a room), with its own README. Outside production the
  API accepts an `x-career-mp-now` header so deadlines can be tested
  without waiting.

## Languages

English is the default, Serbian is the second. Every player-facing string
lives in `data/games/locales/en.json` and `data/games/locales/sr.json` under
the same key, never in a component. Add new strings to both files and run
`npm run check:locale`. The language is a `locale` cookie: server components
read it per request, and client code reads the matching dictionary.

## Project layout

```
app/                    # Next.js App Router routes
  layout.tsx
  page.tsx              # hub
  manager/              # Glizzy Manager (internal name: career)
  rivals/               # Glizzy Rivals (internal name: career-mp)
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

The single-player rules live in `lib/utils/career*.ts`. The Rivals engine in
`lib/server/career-mp/` reuses them per coach and adds the room around them:
`reducer.ts` applies actions, `resolve.ts` and `cup.ts` close phases,
`timers.ts` advances deadlines, `view.ts` builds each coach's view and
`store.ts` holds rooms.

## Design notes

- Tailwind only, no custom CSS, no inline style objects. `app/globals.css`
  holds the directives, theme tokens and shared keyframes.
- Dark-first classes on the existing tokens (frost borders, slate-950/900
  backgrounds, red-300, sky-200 and cyan-200 accents, `rounded-3xl` cards);
  light mode is a palette remap in `globals.css`.
- One component per file, `PascalCase.tsx`, default export.
- Client data goes through TanStack Query; server components read the request
  locale directly.
- No em-dashes anywhere, not in UI text, Markdown or comments.

## Audio and art

All artwork is hand-written SVG, one style per character, with no raster
files under `public/`. The cutscene sound bank comes from
`scripts/career-cutscenes/generate.mjs` and the season music from the Python
scripts under `scripts/career-music/`; those mp3s are committed, so nothing
is rendered during a build. The match commentary banks for English and
Serbian under `public/games/audio/commentary/career/` are committed too,
rendered by `scripts/career-commentary/generate.mjs` (one voice per language,
model `eleven_v4`); a language without a bank shows the commentator's lines
as captions. Both `generate.mjs` scripts call ElevenLabs and need
`XI_API_KEY`, and the commentary one also `XI_VOICE_ID`. The scripts read
both from the shell, so put them in `.env.local` (gitignored) and load it with
`set -a; source .env.local; set +a`, or prefix the command with the variables.

To re-voice the English booth: `npm run commentary:voices` lists candidate
voices with preview links (a shared voice is added to the account with
`npm run commentary:voices -- --add <public_user_id> <voice_id>`), then set
`XI_VOICE_ID`, check the plan and cost with `npm run commentary:render -- --dry-run`,
render with `npm run commentary:render` (the generator skips clips that
already exist, so delete a clip to re-roll it), keep the locale in
`COMMENTARY_VOICE_LOCALES` in `lib/constants/careerCommentaryVoice.ts`, and run
`npm run check:audio`. The Serbian bank renders the same way with
`--locale sr`. The vocal takes under `scripts/career-music/vocals/` are not
included, so `scripts/career-music/vocal.py` is reference only.

## Deployment

The app is shaped for Vercel: build command `next build`, output served by
`next start` or the platform's serverless runtime.

- Set `NEXT_PUBLIC_SITE_URL` to the public origin.
- Connect Upstash Redis (or set `UPSTASH_REDIS_REST_URL` and
  `UPSTASH_REDIS_REST_TOKEN`); Redis is required for Rivals in production
  (see [How Rivals stays in sync](#how-rivals-stays-in-sync)).
- Room creation is limited to 10 rooms per client address per hour and 500
  open rooms in total (`lib/constants/careerMp.ts`).
- `/preview`, `/api` and the room pages under `/rivals/` are noindexed and
  excluded in `robots.txt`; the sitemap lists `/`, `/manager` and `/rivals`.

## What was changed for the public edition

- Every character and name is fictional.
- All text was rewritten in both languages.
- Cutscenes were made generic.
- Recordings of real people were removed; the commentator is a generated
  voice in each language, with captions.
- Art was redrawn as SVG, one style per character.
- Saves and rooms carry message keys, so both languages work on the same
  save or room.

## License

Code is MIT (keep the copyright notice in copies, which is the credit). The
characters, artwork, audio, music and text are all rights reserved. See
[LICENSE](LICENSE) for both parts.

## Credits

A few CC0 Freesound recordings are used on election night; they are credited
next to their cues in `lib/constants/cutsceneSounds.ts`.
