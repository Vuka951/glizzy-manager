# Career multiplayer test kit

Everything here plus `scripts/career-sim/` is the regression kit for the
career game. The loaders resolve `@/` from their own location, so the kit runs
from any checkout.

## Single-player regression (run before and after touching lib/utils/career*)

    ./scripts/career-sim/run.sh 5 200 > after.json
    # baseline from a clean checkout of HEAD:
    BASE=$(mktemp -d)
    git worktree add "$BASE" HEAD
    "$BASE/scripts/career-sim/run.sh" 5 200 > base.json
    git worktree remove --force "$BASE"

Compare `byYear.5.positions[*].median` between the two files. 50 runs is too
noisy (position 1 swings 30 points between identical runs); use 200.

## Multiplayer engine smoke (pure, no server)

Arguments: coaches, years. Coaches from 2 to 8 (`MIN_COACHES` /
`MAX_COACHES`); anything else exits with code 2.

    ./scripts/career-mp-sim/run.sh 8 20
    ./scripts/career-mp-sim/run.sh 2 20

The smoke asserts that the paper closes straight to the bracket, that the
round of 16 is seeded by the table as it stood at the paper and seats the
whole league, and that every cup places all 16. Every run also starts with
reducer-level roster checks: any number of coaches from 2 to 8 plays the whole
16-character roster, with every lobby pick in the league.

Coaches join by name only and pick a character in the lobby, so the smoke
seats every coach through the `pickCharacter` action before the start. It also
checks the lobby pick at reducer level: coaches join with no character, a taken
or unknown slug is refused (`character-taken`, `bad-slug`), a coach can change
the pick (which drops ready and frees the old face), `start` is refused with
`missing-slug` until everyone has picked, a pick after the start is refused
with `league-started`, a room saved with a slug from the old join still
starts, and every one of 8 lobby picks is in the league.

## Join and lobby pick (changed 2026-09-26)

Create and join take `{ coachName, color?, settings? }`. The character is the
`pickCharacter` lobby action. An old client that still sends `slug` with the
name is tolerated: a free, valid slug seats as the first pick and anything else
is dropped, so the join never fails over it. browser-shots, leave-test,
close-modal-check and prematch-shot still post `slug` on join and rely on that;
lobby-shots picks inside the room like the playtest.

## Room creation limits

The create endpoint allows `ROOM_CREATE_PER_HOUR` (10) rooms per client
address per hour and `OPEN_ROOMS_CAP` (500) open rooms in total, answering
`rate-limited` (429) and `rooms-full` (503). Requests with no forwarding
header share one local bucket, so a long session with the browser kit can
run out. Start the dev server with `CAREER_MP_UNLIMITED=1 npm run dev` to lift
both; production ignores the variable.

## API check with curl (dev server on :3000)

    ./scripts/career-mp-sim/curl-test.sh

Needs `jq`. Uses the `x-career-mp-now` header, honoured outside production.
The clock comes from `date`, not `node -e`, because `FORCE_COLOR` in the shell
colours node's output. It joins both coaches by name, then checks the lobby
pick over the API: start refused before anyone picked, a taken and an unknown
pick refused, a changed pick, an old client's taken slug dropped, and a pick
after the start refused. After the paper it passes the bracket draw
(`cup-pre`) with both Done before the first bets.

## Browser playtests (dev server on :3000, system Chrome)

    npm i --no-save puppeteer-core
    node scripts/career-mp-sim/playtest.mjs          # a full year in two browsers, ~3 min, lobby pick included
    node scripts/career-mp-sim/playtest.mjs --full   # plus election, Overlord, reopen, ~8 min
    node scripts/career-mp-sim/lobby-shots.mjs       # lobby screens at 1440 and 390
    node scripts/career-mp-sim/prematch-shot.mjs     # pre-match card with bets

Screenshots land in `scripts/career-mp-sim/output/` (gitignored) unless
`SHOTS_DIR` points elsewhere; `report.json` there lists every check.
`PUPPETEER_CORE` can point
at the entry file of a puppeteer-core installed outside the repo.

The playtest opens the room from a form with no character select, blocks the
host's stamp until every coach has picked, has B open the picker with Vuka
crossed out (`02-lobby-pick-b-taken`), pick Daniel and change to Jajoglavi, and seats
the third coach over the API with a refused taken pick first. From season 2 on
it can still stop on `no-funds` for B's plot and bet: B is broke by then in the
current economy, which has nothing to do with the lobby.

## Room board and host close (added 2026-09-06)

- `close-test.sh`: API check for a guest's lobby pick, the room list, the host-only `closeRoom` action (403 for others), the closed view, the board dropping the room, and 410 on join/actions afterwards.
- `browser-shots.mjs`: screenshots T12-* (room board modal opened from the Aktivne sobe tab, join form after picking a room, room modal with the close control, armed confirm, closed screen) and a final check that the closed room left the board. Uses DOM clicks because the intro backdrop swallows puppeteer handle clicks.
- `lobby-expire-test.sh`: idle lobby clearing via the `x-career-mp-now` header (alive at +9 min, gone at +20 min, list sweeps a second room).
- `leave-test.mjs`: leaving the lobby drops the token and lands on the entry page.

## Regression pass 2026-09-06

`playtest.mjs` was brought up to date with the current UI: the create stamp is "Otvori sobu", the expansion issue is dismissed with "Na prelazni rok" after the start, the undo toggle reads "Neje gotovo", the clip skip reads "Preskoči do rezultata" (renamed again after 2026-09-06) and is waited on with `waitEnabled` (it sits greyed in the fixed row through the bets and the 3 s pre-roll), cup 1 uses `passOrReady` (no bookie yet, only "Spreman"). `curl-test.sh` waits out the 5 s bets countdown and the clip pre-roll.
- `close-modal-check.mjs`: the close confirm opens as a modal (lobby and room), "Ipak ne" dismisses it; T13 screenshots.
- `report-preview-shots.mjs`: the two report buttons on /preview/animations, both overlays opened and scrolled; T14 screenshots.
- `report-pages.mjs`: pages through the single-player and Glizi Rivals reports screen by screen; T15 screenshots.

## Clear every room from Upstash Redis

    node --env-file=.env.local scripts/career-mp-sim/clear-rooms.mjs --dry-run
    node --env-file=.env.local scripts/career-mp-sim/clear-rooms.mjs

Scans `career-mp:room:*` (so orphaned `:v` keys go too) and drops the
`career-mp:rooms` index.

## Single-player save slots (added 2026-09-26)

- `../career-sim/slots-check.sh`: storage checks for the three career slots (old `glizzy-manager-active` save migrates into slot 1 and plays on identically, independent slots, delete, corrupt slot, blocked storage).
- `../career-sim/slots-browser.mjs`: browser run on :3000. Make the old-format save first with the sim loader: `node --no-warnings --import "data:text/javascript,import { register } from 'node:module'; register('file://$PWD/scripts/career-sim/loader.mjs');" scripts/career-sim/old-save-dump.ts > scripts/career-sim/output/sp-old-save.json` (after `mkdir -p scripts/career-sim/output`), then `node scripts/career-sim/slots-browser.mjs`. Shots land in `scripts/career-sim/output/`.
