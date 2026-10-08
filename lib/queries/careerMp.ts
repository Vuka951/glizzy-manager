import {
  TOKEN_STORAGE_PREFIX,
  type RoomErrorCode,
} from '@/lib/constants/careerMp';
import type {
  ActionResponse,
  ApiError,
  CreateRoomRequest,
  JoinRoomRequest,
  JoinRoomResponse,
  RoomAction,
  RoomSummary,
  RoomView,
  UnchangedView,
} from '@/lib/types/careerMp';

export const careerMpKeys = {
  room: (code: string) => ['career-mp', 'room', code] as const,
  rooms: () => ['career-mp', 'rooms'] as const,
};

// Every room this browser holds a seat in, by code
export function knownRoomCodes(): Set<string> {
  const codes = new Set<string>();
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i) ?? '';
      if (key.startsWith(TOKEN_STORAGE_PREFIX) && !key.includes(':', TOKEN_STORAGE_PREFIX.length)) {
        codes.add(key.slice(TOKEN_STORAGE_PREFIX.length));
      }
    }
  } catch {
    // no storage, no seats
  }
  return codes;
}

export async function fetchRooms(): Promise<RoomSummary[]> {
  const res = await fetch('/api/career-mp/rooms', { cache: 'no-store' });
  return (await parse<{ rooms: RoomSummary[] }>(res)).rooms;
}

export class CareerMpApiError extends Error {
  code: RoomErrorCode;
  status: number;
  view: RoomView | undefined;
  constructor(status: number, code: RoomErrorCode, view?: RoomView) {
    super(code);
    this.code = code;
    this.status = status;
    this.view = view;
  }
}

// The coach's token is browser state: read through an external store so the
// server-rendered page and the first client render agree on having none
const tokenListeners = new Set<() => void>();

function notifyToken() {
  tokenListeners.forEach((listener) => listener());
}

export function subscribeToken(listener: () => void): () => void {
  tokenListeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    tokenListeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

export function readToken(code: string): string | null {
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_PREFIX + code);
  } catch {
    return null;
  }
}

export function noToken(): string | null {
  return null;
}

export function storeToken(code: string, token: string): void {
  try {
    window.localStorage.setItem(TOKEN_STORAGE_PREFIX + code, token);
  } catch {
    // best-effort
  }
  notifyToken();
}

export function clearToken(code: string): void {
  try {
    window.localStorage.removeItem(TOKEN_STORAGE_PREFIX + code);
  } catch {
    // best-effort
  }
  notifyToken();
}

async function parse<T>(res: Response): Promise<T> {
  const body = (await res.json().catch(() => ({}))) as T | ApiError;
  if (!res.ok) {
    const err = body as ApiError;
    throw new CareerMpApiError(res.status, err.error ?? 'generic', err.view);
  }
  return body as T;
}

export async function createRoom(
  body: CreateRoomRequest,
): Promise<JoinRoomResponse> {
  const res = await fetch('/api/career-mp/rooms', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parse<JoinRoomResponse>(res);
}

export async function joinRoom(
  code: string,
  body: JoinRoomRequest,
): Promise<JoinRoomResponse> {
  const res = await fetch(`/api/career-mp/rooms/${code}/join`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parse<JoinRoomResponse>(res);
}

export async function fetchRoom(
  code: string,
  token: string,
  since?: number,
): Promise<RoomView | UnchangedView> {
  const query = since !== undefined ? `?since=${since}` : '';
  const res = await fetch(`/api/career-mp/rooms/${code}${query}`, {
    headers: { 'x-coach-token': token },
    cache: 'no-store',
  });
  return parse<RoomView | UnchangedView>(res);
}

export async function sendAction(
  code: string,
  token: string,
  action: RoomAction,
  expectVersion: number,
): Promise<ActionResponse> {
  const res = await fetch(`/api/career-mp/rooms/${code}/actions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-coach-token': token,
    },
    body: JSON.stringify({ action, expectVersion }),
  });
  return parse<ActionResponse>(res);
}
