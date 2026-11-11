import type { SeatColor } from '@/lib/constants/rooms';

export type RoomStatus = 'lobby' | 'playing' | 'finished' | 'closed';

// What the store and the request plumbing read on every stored room
export type RoomCore = {
  code: string;
  version: number;
  // The version at which the phase last changed; an action sent against an
  // older view is refused as stale
  phaseVersion: number;
  createdAt: number;
  updatedAt: number;
  status: RoomStatus;
};

// The part of a seat the plumbing owns: who it is and when it was last seen
export type RoomSeat = {
  id: string;
  name: string;
  tokenHash: string;
  joinedAt: number;
  lastSeenAt: number;
};

export type RoomEvent = {
  at: number;
  kind: string;
  params: Record<string, string | number>;
  // Only this seat sees the entry; absent means everyone
  visibleTo?: string;
};

// How the plumbing reaches the seats of a room, whatever the field is called
export type SeatLens<R, Seat extends RoomSeat> = {
  get(room: R): Record<string, Seat>;
  set(room: R, seats: Record<string, Seat>): R;
};

// A clip every screen in the room plays against the server's clock
export type Playback = {
  startedAt: number;
  durationMs: number;
  skipVotes: string[];
  // Set the moment a majority skipped the clip; the cursor lingers from here
  skippedAt?: number;
};

// The least a seat's view of the room carries for the polling client
export type RoomViewCore = {
  code: string;
  version: number;
  now: number;
  status: RoomStatus;
};

export type UnchangedView = { unchanged: true; version: number; now: number };

export type RoomApiErrorBody<View> = { error: string; view?: View };

export type RoomActionRequest<Action> = {
  action: Action;
  expectVersion: number;
};

// Name and color of the seat behind a portrait, by character slug
export type SeatTagMap = Record<
  string,
  { name: string; color: SeatColor; connected?: boolean }
>;
