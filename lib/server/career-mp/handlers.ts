import { NextResponse } from 'next/server';
import {
  COACH_COLOR_ORDER,
  MAX_COACHES,
  ROOM_BOARD_WINDOW_MS,
  type CoachColor,
  type RoomErrorCode,
} from '@/lib/constants/careerMp';
import { ActionError } from '@/lib/server/career-mp/errors';
import { assertCreateAllowed } from '@/lib/server/career-mp/limits';
import { applyAction, cleanName } from '@/lib/server/career-mp/reducer';
import { ROSTER_SLUGS } from '@/lib/server/career-mp/roster';
import {
  coachByToken,
  DEFAULT_SETTINGS,
  freeColor,
  hashToken,
  isRoomCode,
  newCoachId,
  newToken,
  randomRoomCode,
  type Coach,
  type Room,
} from '@/lib/server/career-mp/room';
import { normalizeSettings } from '@/lib/server/career-mp/roomOps';
import {
  createRoom,
  listRooms,
  loadRoom,
  lobbyExpired,
  removeRoom,
  saveRoom,
  VersionConflict,
} from '@/lib/server/career-mp/store';
import { advanceExpired } from '@/lib/server/career-mp/timers';
import { summaryOf, viewFor } from '@/lib/server/career-mp/view';
import type {
  ActionRequest,
  CreateRoomRequest,
  JoinRoomRequest,
  PhaseState,
} from '@/lib/types/careerMp';

// A poll refreshes presence; the write is skipped until it is this stale so
// idle rooms cost one command per poll, not two
const PRESENCE_WRITE_MS = 10_000;
// Every write is optimistic on the room version. Three coaches polling and
// clicking at once lose races often enough that two tries dropped real
// clicks; the retries back off with jitter so the losers spread out
const WRITE_ATTEMPTS = 6;
const RETRY_BASE_MS = 15;
const RETRY_JITTER_MS = 30;

function retryDelay(attempt: number): Promise<void> {
  const ms = RETRY_BASE_MS * attempt + Math.random() * RETRY_JITTER_MS;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function jsonError(
  code: RoomErrorCode,
  status: number,
  extra?: object,
) {
  return NextResponse.json({ error: code, ...(extra ?? {}) }, { status });
}

// The clock every handler reads. Outside production a request may carry its
// own so timers can be tested without waiting
export function requestNow(req: Request): number {
  if (process.env.NODE_ENV !== 'production') {
    const fake = req.headers.get('x-career-mp-now');
    if (fake && Number.isFinite(Number(fake))) return Number(fake);
  }
  return Date.now();
}

function phaseKey(phase: PhaseState): string {
  switch (phase.kind) {
    case 'cup-pre':
      return `cup-pre:${phase.round}`;
    case 'match-bets':
    case 'match-clip':
      return `${phase.kind}:${JSON.stringify(phase.stage)}:${phase.index}`;
    default:
      return phase.kind;
  }
}

async function readBody<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new ActionError('bad-body');
  }
}

function pickColor(room: Room, wanted: unknown): CoachColor {
  const free = freeColor(room);
  if (!free) throw new ActionError('room-full', 409);
  if (
    typeof wanted === 'string' &&
    COACH_COLOR_ORDER.includes(wanted as CoachColor) &&
    !Object.values(room.coaches).some((c) => c.color === wanted)
  ) {
    return wanted as CoachColor;
  }
  return free;
}

// Characters are picked in the lobby. A client from before that change may
// still send one with the name; a free, valid slug seats as the first pick
// and anything else is dropped so the join never fails over it
function legacySlug(room: Room, body: unknown): string | null {
  const slug = (body as { slug?: unknown } | null)?.slug;
  if (typeof slug !== 'string' || !ROSTER_SLUGS.includes(slug)) return null;
  if (Object.values(room.coaches).some((c) => c.slug === slug)) return null;
  return slug;
}

function ensureNameFree(room: Room, name: string) {
  if (
    Object.values(room.coaches).some(
      (c) => c.name.toLowerCase() === name.toLowerCase(),
    )
  )
    throw new ActionError('name-taken', 409);
}

export async function handleCreate(req: Request) {
  const now = requestNow(req);
  try {
    const body = await readBody<CreateRoomRequest>(req);
    const name = cleanName(body.coachName);
    await assertCreateAllowed(req, now);
    const token = newToken();
    const coachId = newCoachId();
    const empty: Room = {
      code: '',
      version: 0,
      phaseVersion: 0,
      createdAt: now,
      updatedAt: now,
      hostCoachId: coachId,
      status: 'lobby',
      settings: normalizeSettings({ ...DEFAULT_SETTINGS, ...(body.settings ?? {}) }),
      coaches: {},
      league: null,
      phase: { kind: 'window', deadline: null },
      log: [],
      report: null,
    };
    const coach: Coach = {
      id: coachId,
      name,
      color: pickColor(empty, body.color),
      slug: legacySlug(empty, body),
      tokenHash: hashToken(token),
      joinedAt: now,
      lastSeenAt: now,
      ready: false,
    };
    let room: Room = { ...empty, coaches: { [coachId]: coach } };
    for (let attempt = 0; attempt < 5; attempt++) {
      room = { ...room, code: randomRoomCode() };
      try {
        await createRoom(room);
        room = { ...room, version: 1 };
        return NextResponse.json({
          code: room.code,
          coachId,
          token,
          view: viewFor(room, coachId, now),
        });
      } catch (e) {
        if (!(e instanceof VersionConflict)) throw e;
      }
    }
    return jsonError('no-code', 500);
  } catch (e) {
    if (e instanceof ActionError) return jsonError(e.code, e.status);
    throw e;
  }
}

// The room browser: every open room, newest touch first, nothing private
export async function handleList(req: Request) {
  const now = requestNow(req);
  const listed = await listRooms(50);
  const expired = listed.filter((room) => lobbyExpired(room, now));
  await Promise.all(expired.map((room) => removeRoom(room.code)));
  const rooms = listed.filter(
    (room) =>
      !lobbyExpired(room, now) && now - room.updatedAt <= ROOM_BOARD_WINDOW_MS,
  );
  return NextResponse.json({ rooms: rooms.map((room) => summaryOf(room, now)) });
}

export async function handleJoin(req: Request, rawCode: string) {
  const now = requestNow(req);
  const code = rawCode.toUpperCase();
  if (!isRoomCode(code)) return jsonError('not-found', 404);
  try {
    const body = await readBody<JoinRoomRequest>(req);
    const name = cleanName(body.coachName);
    for (let attempt = 0; attempt < 2; attempt++) {
      const room = await loadRoom(code);
      if (!room) return jsonError('not-found', 404);
      if (lobbyExpired(room, now)) {
        await removeRoom(code);
        return jsonError('expired', 410);
      }
      if (room.status === 'closed') return jsonError('closed', 410);
      if (room.status !== 'lobby') return jsonError('already-started', 409);
      if (Object.keys(room.coaches).length >= MAX_COACHES)
        return jsonError('room-full', 409);
      ensureNameFree(room, name);
      const token = newToken();
      const coachId = newCoachId();
      const coach: Coach = {
        id: coachId,
        name,
        color: pickColor(room, body.color),
        slug: legacySlug(room, body),
        tokenHash: hashToken(token),
        joinedAt: now,
        lastSeenAt: now,
        ready: false,
      };
      try {
        const saved = await saveRoom(
          { ...room, coaches: { ...room.coaches, [coachId]: coach } },
          now,
        );
        return NextResponse.json({
          code,
          coachId,
          token,
          view: viewFor(saved, coachId, now),
        });
      } catch (e) {
        if (!(e instanceof VersionConflict)) throw e;
      }
    }
    return jsonError('conflict', 409);
  } catch (e) {
    if (e instanceof ActionError) return jsonError(e.code, e.status);
    throw e;
  }
}

function touch(room: Room, coachId: string, now: number): Room {
  const coach = room.coaches[coachId];
  return {
    ...room,
    coaches: { ...room.coaches, [coachId]: { ...coach, lastSeenAt: now } },
  };
}

export async function handleGet(req: Request, rawCode: string) {
  const now = requestNow(req);
  const code = rawCode.toUpperCase();
  if (!isRoomCode(code)) return jsonError('not-found', 404);
  const token = req.headers.get('x-coach-token');
  const url = new URL(req.url);
  const since = url.searchParams.get('since');
  for (let attempt = 1; attempt <= WRITE_ATTEMPTS; attempt++) {
    const room = await loadRoom(code);
    if (!room) return jsonError('not-found', 404);
    if (lobbyExpired(room, now)) {
      await removeRoom(code);
      return jsonError('expired', 410);
    }
    const coach = coachByToken(room, token);
    if (!coach) return jsonError('unauthorized', 401);
    const advanced = advanceExpired(room, now);
    const stale = now - coach.lastSeenAt > PRESENCE_WRITE_MS;
    if (advanced === room && !stale) {
      if (since !== null && Number(since) === room.version) {
        return NextResponse.json({ unchanged: true, version: room.version, now });
      }
      return NextResponse.json(viewFor(room, coach.id, now));
    }
    try {
      const saved = await saveRoom(touch(advanced, coach.id, now), now);
      return NextResponse.json(viewFor(saved, coach.id, now));
    } catch (e) {
      if (!(e instanceof VersionConflict)) throw e;
      // A poll is read-only to the caller: when the presence write keeps
      // losing, serve what was read and let the next poll write it
      if (attempt === WRITE_ATTEMPTS) {
        return NextResponse.json(viewFor(advanced, coach.id, now));
      }
      await retryDelay(attempt);
    }
  }
  return jsonError('conflict', 409);
}

export async function handleAction(req: Request, rawCode: string) {
  const now = requestNow(req);
  const code = rawCode.toUpperCase();
  if (!isRoomCode(code)) return jsonError('not-found', 404);
  const token = req.headers.get('x-coach-token');
  let body: ActionRequest;
  try {
    body = await readBody<ActionRequest>(req);
  } catch {
    return jsonError('bad-body', 400);
  }
  if (!body || typeof body !== 'object' || !body.action || typeof body.action.type !== 'string')
    return jsonError('bad-body', 400);
  for (let attempt = 1; attempt <= WRITE_ATTEMPTS; attempt++) {
    if (attempt > 1) await retryDelay(attempt - 1);
    const room = await loadRoom(code);
    if (!room) return jsonError('not-found', 404);
    if (lobbyExpired(room, now)) {
      await removeRoom(code);
      return jsonError('expired', 410);
    }
    const coach = coachByToken(room, token);
    if (!coach) return jsonError('unauthorized', 401);
    const advanced = advanceExpired(touch(room, coach.id, now), now);
    // A click made on a phase that has since closed is refused with the
    // fresh view; presence bumps and other coaches' clicks never are
    const expect = Number(body.expectVersion);
    if (
      Number.isFinite(expect) &&
      (phaseKey(advanced.phase) !== phaseKey(room.phase) || expect < room.phaseVersion)
    ) {
      let stale = advanced;
      try {
        stale = advanced === room ? room : await saveRoom(advanced, now);
      } catch (e) {
        if (!(e instanceof VersionConflict)) throw e;
        continue;
      }
      return jsonError('stale', 409, { view: viewFor(stale, coach.id, now) });
    }
    try {
      const applied = applyAction(advanced, coach.id, body.action, now);
      const settled = advanceExpired(applied.room, now);
      const phaseChanged = phaseKey(settled.phase) !== phaseKey(room.phase);
      const saved = await saveRoom(
        phaseChanged ? { ...settled, phaseVersion: room.version + 1 } : settled,
        now,
      );
      return NextResponse.json({
        view: viewFor(saved, coach.id, now),
        ...(applied.receipt ? { receipt: applied.receipt } : {}),
      });
    } catch (e) {
      if (e instanceof VersionConflict) continue;
      if (e instanceof ActionError) return jsonError(e.code, e.status);
      throw e;
    }
  }
  return jsonError('conflict', 409);
}
