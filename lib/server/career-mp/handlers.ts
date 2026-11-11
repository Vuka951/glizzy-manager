import {
  CAREER_MP_NOW_HEADER,
  CAREER_MP_ROOM_NAMESPACE,
  COACH_COLOR_ORDER,
  COACH_TOKEN_HEADER,
  MAX_COACHES,
  OPEN_ROOMS_CAP,
  ROOM_CREATE_PER_HOUR,
  ROOM_CREATE_WINDOW_SECONDS,
  type CoachColor,
} from '@/lib/constants/careerMp';
import { applyAction } from '@/lib/server/career-mp/reducer';
import {
  DEFAULT_SETTINGS,
  freeColor,
  type Coach,
  type Room,
} from '@/lib/server/career-mp/room';
import { currentRoom, normalizeSettings } from '@/lib/server/career-mp/roomOps';
import { step } from '@/lib/server/career-mp/timers';
import { summaryOf, viewFor } from '@/lib/server/career-mp/view';
import { ActionError } from '@/lib/server/rooms/errors';
import { createRoomHandlers } from '@/lib/server/rooms/handlers';
import { cleanSeatName } from '@/lib/server/rooms/identity';
import { createRoomStore } from '@/lib/server/rooms/store';
import type {
  CreateRoomRequest,
  JoinRoomRequest,
  PhaseState,
  Receipt,
  RoomAction,
  RoomSummary,
  RoomView,
} from '@/lib/types/careerMp';
import { generateLeague } from '@/lib/utils/leagueRoster';
import { randomSeed } from '@/lib/utils/seededRandom';

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
  if (typeof slug !== 'string') return null;
  if (!room.roster.some((e) => e.slug === slug)) return null;
  if (Object.values(room.coaches).some((c) => c.slug === slug)) return null;
  return slug;
}

const roomStore = createRoomStore<Room>({
  namespace: CAREER_MP_ROOM_NAMESPACE,
  memoryKey: '__careerMpRooms',
});

export const {
  handleCreate,
  handleList,
  handleJoin,
  handleGet,
  handleAction,
} = createRoomHandlers<Room, Coach, RoomAction, RoomView, RoomSummary, Receipt>({
  store: {
    ...roomStore,
    load: async (code) => currentRoom(await roomStore.load(code)),
    list: async (limit) =>
      (await roomStore.list(limit)).flatMap((saved) => currentRoom(saved) ?? []),
  },
  seats: {
    get: (room) => room.coaches,
    set: (room, coaches) => ({ ...room, coaches }),
  },
  maxSeats: MAX_COACHES,
  tokenHeader: COACH_TOKEN_HEADER,
  nowHeader: CAREER_MP_NOW_HEADER,
  seatIdField: 'coachId',
  createLimits: {
    perWindow: ROOM_CREATE_PER_HOUR,
    windowSeconds: ROOM_CREATE_WINDOW_SECONDS,
    openRoomsCap: OPEN_ROOMS_CAP,
    bypassEnv: 'CAREER_MP_UNLIMITED',
  },
  seatName: (body) => cleanSeatName((body as JoinRoomRequest).coachName),
  buildRoom: ({ body, hostSeatId, now }) => ({
    code: '',
    version: 0,
    phaseVersion: 0,
    createdAt: now,
    updatedAt: now,
    hostCoachId: hostSeatId,
    status: 'lobby',
    settings: normalizeSettings({
      ...DEFAULT_SETTINGS,
      ...((body as CreateRoomRequest).settings ?? {}),
    }),
    roster: generateLeague(randomSeed()),
    coaches: {},
    league: null,
    phase: { kind: 'window', deadline: null },
    log: [],
    report: null,
  }),
  buildSeat: ({ room, body, identity }) => ({
    ...identity,
    color: pickColor(room, (body as JoinRoomRequest).color),
    slug: legacySlug(room, body),
    ready: false,
  }),
  applyAction,
  step,
  phaseKey: (room) => phaseKey(room.phase),
  viewFor,
  summaryOf,
});
