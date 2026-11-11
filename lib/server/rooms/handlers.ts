import { NextResponse } from 'next/server';
import type { RoomErrorCode } from '@/lib/constants/careerMp';
import { ROOM_BOARD_WINDOW_MS } from '@/lib/constants/rooms';
import { ActionError } from '@/lib/server/rooms/errors';
import {
  hashToken,
  isRoomCode,
  newSeatId,
  newToken,
  randomRoomCode,
  seatByToken,
  seatNameTaken,
} from '@/lib/server/rooms/identity';
import {
  assertCreateAllowed,
  type RoomCreateLimits,
} from '@/lib/server/rooms/limits';
import { VersionConflict, type RoomStore } from '@/lib/server/rooms/store';
import { advanceExpired } from '@/lib/server/rooms/timers';
import type {
  RoomActionRequest,
  RoomCore,
  RoomSeat,
  SeatLens,
} from '@/lib/types/rooms';

// A poll refreshes presence; the write is skipped until it is this stale so
// idle rooms cost one command per poll, not two
const PRESENCE_WRITE_MS = 10_000;
// Every write is optimistic on the room version. Three seats polling and
// clicking at once lose races often enough that two tries dropped real
// clicks; the retries back off with jitter so the losers spread out
const WRITE_ATTEMPTS = 6;
const RETRY_BASE_MS = 15;
const RETRY_JITTER_MS = 30;
const CODE_ATTEMPTS = 5;
const JOIN_ATTEMPTS = 2;
const LIST_LIMIT = 50;

export type RoomHandlersOptions<
  R extends RoomCore,
  Seat extends RoomSeat,
  Action extends { type: string },
  View,
  Summary,
  Receipt,
> = {
  store: RoomStore<R>;
  seats: SeatLens<R, Seat>;
  maxSeats: number;
  // Request header that carries the seat's token
  tokenHeader: string;
  // Request header that overrides the clock, honoured outside production
  nowHeader: string;
  // Key of the new seat's id in the create and join answers
  seatIdField: string;
  boardWindowMs?: number;
  // Who may open a room how often; absent leaves creation unlimited
  createLimits?: RoomCreateLimits;
  // The cleaned seat name out of a create or join body; throws ActionError
  seatName(body: unknown): string;
  // A new lobby with no seats, no code and version 0
  buildRoom(input: { body: unknown; hostSeatId: string; now: number }): R;
  // The game's seat around the identity the plumbing made; throws ActionError
  buildSeat(input: { room: R; body: unknown; identity: RoomSeat }): Seat;
  applyAction(
    room: R,
    seatId: string,
    action: Action,
    now: number,
  ): { room: R; receipt?: Receipt };
  // One phase transition whose gate is open, or null when nothing is due
  step(room: R, now: number): R | null;
  // Identity of the phase a click belongs to; a change makes the click stale
  phaseKey(room: R): string;
  viewFor(room: R, seatId: string, now: number): View;
  // One line of the room board, nothing private
  summaryOf(room: R, now: number): Summary;
  // The stored code behind a raw path segment, or null for a bad one; the
  // default upper-cases a generated room code
  codeOf?(raw: string): string | null;
  // Whether a room still takes seats; the default is a lobby that has not
  // started
  joinable?(room: R): boolean;
  // A room that exists before anyone stored it: when a join finds nothing
  // under the code, this room is created and joined. Null keeps 'not-found'
  seedRoom?(code: string, now: number): R | null;
};

export type RoomHandlers = {
  handleCreate(req: Request): Promise<Response>;
  handleList(req: Request): Promise<Response>;
  handleJoin(req: Request, rawCode: string): Promise<Response>;
  handleGet(req: Request, rawCode: string): Promise<Response>;
  handleAction(req: Request, rawCode: string): Promise<Response>;
};

// The clock every handler reads. Outside production a request may carry its
// own so timers can be tested without waiting
function requestNow(req: Request, nowHeader: string): number {
  if (process.env.NODE_ENV !== 'production') {
    const fake = req.headers.get(nowHeader);
    if (fake && Number.isFinite(Number(fake))) return Number(fake);
  }
  return Date.now();
}

function retryDelay(attempt: number): Promise<void> {
  const ms = RETRY_BASE_MS * attempt + Math.random() * RETRY_JITTER_MS;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function jsonError(code: RoomErrorCode, status: number, extra?: object) {
  return NextResponse.json({ error: code, ...(extra ?? {}) }, { status });
}

async function readBody(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new ActionError('bad-body');
  }
}

function isActionRequest<Action extends { type: string }>(
  body: unknown,
): body is RoomActionRequest<Action> {
  if (!body || typeof body !== 'object') return false;
  const action = (body as { action?: { type?: unknown } }).action;
  return Boolean(action) && typeof action?.type === 'string';
}

export function createRoomHandlers<
  R extends RoomCore,
  Seat extends RoomSeat,
  Action extends { type: string },
  View,
  Summary,
  Receipt,
>(
  options: RoomHandlersOptions<R, Seat, Action, View, Summary, Receipt>,
): RoomHandlers {
  const { store, seats, viewFor, phaseKey } = options;
  const boardWindowMs = options.boardWindowMs ?? ROOM_BOARD_WINDOW_MS;

  const clock = (req: Request): number => requestNow(req, options.nowHeader);
  const codeOf =
    options.codeOf ??
    ((raw: string) => {
      const code = raw.toUpperCase();
      return isRoomCode(code) ? code : null;
    });
  const joinable = options.joinable ?? ((room: R) => room.status === 'lobby');

  const advance = (room: R, now: number): R =>
    advanceExpired(room, now, options.step);

  // A seat the game stood up meanwhile is left alone rather than recreated
  const touch = (room: R, seatId: string, now: number): R => {
    const all = seats.get(room);
    if (!all[seatId]) return room;
    return seats.set(room, {
      ...all,
      [seatId]: { ...all[seatId], lastSeenAt: now },
    });
  };

  const stillSeated = (room: R, seatId: string): boolean =>
    Boolean(seats.get(room)[seatId]);

  const newIdentity = (name: string, token: string, now: number): RoomSeat => ({
    id: newSeatId(),
    name,
    tokenHash: hashToken(token),
    joinedAt: now,
    lastSeenAt: now,
  });

  const seated = (code: string, seatId: string, token: string, view: View) =>
    NextResponse.json({ code, [options.seatIdField]: seatId, token, view });

  async function handleCreate(req: Request) {
    const now = clock(req);
    try {
      const body = await readBody(req);
      const name = options.seatName(body);
      if (options.createLimits)
        await assertCreateAllowed(req, now, store, options.createLimits);
      const token = newToken();
      const identity = newIdentity(name, token, now);
      const empty = options.buildRoom({ body, hostSeatId: identity.id, now });
      const seat = options.buildSeat({ room: empty, body, identity });
      let room = seats.set(empty, { [identity.id]: seat });
      for (let attempt = 0; attempt < CODE_ATTEMPTS; attempt++) {
        room = { ...room, code: randomRoomCode() };
        try {
          await store.create(room);
          room = { ...room, version: 1 };
          return seated(room.code, identity.id, token, viewFor(room, identity.id, now));
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

  // The room board: every open room, newest touch first
  async function handleList(req: Request) {
    const now = clock(req);
    const listed = await store.list(LIST_LIMIT);
    const expired = listed.filter((room) => store.lobbyExpired(room, now));
    await Promise.all(expired.map((room) => store.remove(room.code)));
    const rooms = listed.filter(
      (room) =>
        !store.lobbyExpired(room, now) && now - room.updatedAt <= boardWindowMs,
    );
    return NextResponse.json({
      rooms: rooms.map((room) => options.summaryOf(room, now)),
    });
  }

  // A room nobody stored yet is seeded and created; a concurrent create
  // loses and reloads on the next attempt
  async function loadOrSeed(code: string, now: number): Promise<R | null> {
    const stored = await store.load(code);
    if (stored) return stored;
    const seeded = options.seedRoom?.(code, now);
    if (!seeded) return null;
    try {
      await store.create(seeded);
      return { ...seeded, version: 1 };
    } catch (e) {
      if (!(e instanceof VersionConflict)) throw e;
      return store.load(code);
    }
  }

  async function handleJoin(req: Request, rawCode: string) {
    const now = clock(req);
    const code = codeOf(rawCode);
    if (!code) return jsonError('not-found', 404);
    try {
      const body = await readBody(req);
      const name = options.seatName(body);
      for (let attempt = 0; attempt < JOIN_ATTEMPTS; attempt++) {
        const room = await loadOrSeed(code, now);
        if (!room) return jsonError('not-found', 404);
        if (store.lobbyExpired(room, now)) {
          await store.remove(code);
          return jsonError('expired', 410);
        }
        if (room.status === 'closed') return jsonError('closed', 410);
        if (!joinable(room)) return jsonError('already-started', 409);
        // Whatever is due settles before the seat is counted, so a room that
        // starts on its own does so in the join answer
        const current = advance(room, now);
        const taken = seats.get(current);
        if (Object.keys(taken).length >= options.maxSeats)
          return jsonError('room-full', 409);
        if (seatNameTaken(taken, name)) throw new ActionError('name-taken', 409);
        const token = newToken();
        const identity = newIdentity(name, token, now);
        const seat = options.buildSeat({ room: current, body, identity });
        try {
          const saved = await store.save(
            advance(seats.set(current, { ...taken, [identity.id]: seat }), now),
            now,
          );
          return seated(code, identity.id, token, viewFor(saved, identity.id, now));
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

  async function handleGet(req: Request, rawCode: string) {
    const now = clock(req);
    const code = codeOf(rawCode);
    if (!code) return jsonError('not-found', 404);
    const token = req.headers.get(options.tokenHeader);
    const since = new URL(req.url).searchParams.get('since');
    for (let attempt = 1; attempt <= WRITE_ATTEMPTS; attempt++) {
      const room = await store.load(code);
      if (!room) return jsonError('not-found', 404);
      if (store.lobbyExpired(room, now)) {
        await store.remove(code);
        return jsonError('expired', 410);
      }
      const seat = seatByToken(seats.get(room), token);
      if (!seat) return jsonError('unauthorized', 401);
      const advanced = advance(room, now);
      // The game stood this seat up while nobody was looking: the room is
      // saved as it stands and the caller learns it is out
      if (!stillSeated(advanced, seat.id)) {
        try {
          await store.save(advanced, now);
        } catch (e) {
          if (!(e instanceof VersionConflict)) throw e;
          continue;
        }
        return jsonError('expired', 410);
      }
      const stale = now - seat.lastSeenAt > PRESENCE_WRITE_MS;
      if (advanced === room && !stale) {
        if (since !== null && Number(since) === room.version) {
          return NextResponse.json({ unchanged: true, version: room.version, now });
        }
        return NextResponse.json(viewFor(room, seat.id, now));
      }
      try {
        const saved = await store.save(touch(advanced, seat.id, now), now);
        return NextResponse.json(viewFor(saved, seat.id, now));
      } catch (e) {
        if (!(e instanceof VersionConflict)) throw e;
        // A poll is read-only to the caller: when the presence write keeps
        // losing, serve what was read and let the next poll write it
        if (attempt === WRITE_ATTEMPTS) {
          return NextResponse.json(viewFor(advanced, seat.id, now));
        }
        await retryDelay(attempt);
      }
    }
    return jsonError('conflict', 409);
  }

  async function handleAction(req: Request, rawCode: string) {
    const now = clock(req);
    const code = codeOf(rawCode);
    if (!code) return jsonError('not-found', 404);
    const token = req.headers.get(options.tokenHeader);
    let body: unknown;
    try {
      body = await readBody(req);
    } catch {
      return jsonError('bad-body', 400);
    }
    if (!isActionRequest<Action>(body)) return jsonError('bad-body', 400);
    for (let attempt = 1; attempt <= WRITE_ATTEMPTS; attempt++) {
      if (attempt > 1) await retryDelay(attempt - 1);
      const room = await store.load(code);
      if (!room) return jsonError('not-found', 404);
      if (store.lobbyExpired(room, now)) {
        await store.remove(code);
        return jsonError('expired', 410);
      }
      const seat = seatByToken(seats.get(room), token);
      if (!seat) return jsonError('unauthorized', 401);
      const advanced = advance(touch(room, seat.id, now), now);
      // A click made on a phase that has since closed is refused with the
      // fresh view; presence bumps and other seats' clicks never are
      const expect = Number(body.expectVersion);
      if (
        Number.isFinite(expect) &&
        (phaseKey(advanced) !== phaseKey(room) || expect < room.phaseVersion)
      ) {
        let stale = advanced;
        try {
          stale = advanced === room ? room : await store.save(advanced, now);
        } catch (e) {
          if (!(e instanceof VersionConflict)) throw e;
          continue;
        }
        return jsonError('stale', 409, { view: viewFor(stale, seat.id, now) });
      }
      try {
        const applied = options.applyAction(advanced, seat.id, body.action, now);
        const settled = advance(applied.room, now);
        const phaseChanged = phaseKey(settled) !== phaseKey(room);
        const saved = await store.save(
          phaseChanged ? { ...settled, phaseVersion: room.version + 1 } : settled,
          now,
        );
        return NextResponse.json({
          view: viewFor(saved, seat.id, now),
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

  return { handleCreate, handleList, handleJoin, handleGet, handleAction };
}
