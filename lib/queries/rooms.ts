import type {
  RoomApiErrorBody,
  RoomViewCore,
  UnchangedView,
} from '@/lib/types/rooms';

export class RoomApiError<View = unknown> extends Error {
  status: number;
  view: View | undefined;
  constructor(status: number, code: string, view?: View) {
    super(code);
    this.status = status;
    this.view = view;
  }
}

// The wire shapes of one game's room API
export type RoomApiTypes = {
  view: RoomViewCore;
  action: unknown;
  summary: unknown;
  createBody: unknown;
  joinBody: unknown;
  // The create and join answer: code, seat id, token and the first view
  seated: unknown;
  // The action answer: the fresh view plus whatever the game adds
  actionResult: { view: RoomViewCore };
};

export type RoomApiOptions = {
  // Collection route of the game's rooms, e.g. `/api/career-mp/rooms`
  basePath: string;
  // Request header that carries the seat's token
  tokenHeader: string;
  // localStorage key prefix; the token of room CODE lives at `<prefix>CODE`
  storagePrefix: string;
  // First segment of the game's query keys
  queryScope: string;
};

export type RoomApi<T extends RoomApiTypes> = {
  keys: {
    room: (code: string) => readonly [string, 'room', string];
    rooms: () => readonly [string, 'rooms'];
  };
  knownRoomCodes(): Set<string>;
  subscribeToken(listener: () => void): () => void;
  readToken(code: string): string | null;
  noToken(): string | null;
  storeToken(code: string, token: string): void;
  clearToken(code: string): void;
  fetchRooms(): Promise<T['summary'][]>;
  createRoom(body: T['createBody']): Promise<T['seated']>;
  joinRoom(code: string, body: T['joinBody']): Promise<T['seated']>;
  fetchRoom(
    code: string,
    token: string,
    since?: number,
  ): Promise<T['view'] | UnchangedView>;
  sendAction(
    code: string,
    token: string,
    action: T['action'],
    expectVersion: number,
  ): Promise<T['actionResult']>;
};

export function createRoomApi<T extends RoomApiTypes>(
  options: RoomApiOptions,
): RoomApi<T> {
  const { basePath, tokenHeader, storagePrefix, queryScope } = options;

  async function parse<Body>(res: Response): Promise<Body> {
    const body = (await res.json().catch(() => ({}))) as
      | Body
      | RoomApiErrorBody<T['view']>;
    if (!res.ok) {
      const err = body as RoomApiErrorBody<T['view']>;
      throw new RoomApiError(res.status, err.error ?? 'generic', err.view);
    }
    return body as Body;
  }

  // The seat's token is browser state: read through an external store so the
  // server-rendered page and the first client render agree on having none.
  // A browser that refuses storage keeps it in memory for the life of the page
  const tokenListeners = new Set<() => void>();
  const memoryTokens = new Map<string, string>();
  const notifyToken = () => tokenListeners.forEach((listener) => listener());

  return {
    keys: {
      room: (code) => [queryScope, 'room', code] as const,
      rooms: () => [queryScope, 'rooms'] as const,
    },

    // Every room this browser holds a seat in, by code
    knownRoomCodes() {
      const codes = new Set<string>();
      try {
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i) ?? '';
          if (key.startsWith(storagePrefix) && !key.includes(':', storagePrefix.length)) {
            codes.add(key.slice(storagePrefix.length));
          }
        }
      } catch {
        // no storage, no seats
      }
      return codes;
    },

    subscribeToken(listener) {
      tokenListeners.add(listener);
      window.addEventListener('storage', listener);
      return () => {
        tokenListeners.delete(listener);
        window.removeEventListener('storage', listener);
      };
    },

    readToken(code) {
      try {
        return window.localStorage.getItem(storagePrefix + code) ?? memoryTokens.get(code) ?? null;
      } catch {
        return memoryTokens.get(code) ?? null;
      }
    },

    noToken() {
      return null;
    },

    storeToken(code, token) {
      memoryTokens.set(code, token);
      try {
        window.localStorage.setItem(storagePrefix + code, token);
      } catch {
        // the memory copy carries the seat
      }
      notifyToken();
    },

    clearToken(code) {
      memoryTokens.delete(code);
      try {
        window.localStorage.removeItem(storagePrefix + code);
      } catch {
        // best-effort
      }
      notifyToken();
    },

    async fetchRooms() {
      const res = await fetch(basePath, { cache: 'no-store' });
      return (await parse<{ rooms: T['summary'][] }>(res)).rooms;
    },

    async createRoom(body) {
      const res = await fetch(basePath, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      return parse<T['seated']>(res);
    },

    async joinRoom(code, body) {
      const res = await fetch(`${basePath}/${code}/join`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      return parse<T['seated']>(res);
    },

    async fetchRoom(code, token, since) {
      const query = since !== undefined ? `?since=${since}` : '';
      const res = await fetch(`${basePath}/${code}${query}`, {
        headers: { [tokenHeader]: token },
        cache: 'no-store',
      });
      return parse<T['view'] | UnchangedView>(res);
    },

    async sendAction(code, token, action, expectVersion) {
      const res = await fetch(`${basePath}/${code}/actions`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          [tokenHeader]: token,
        },
        body: JSON.stringify({ action, expectVersion }),
      });
      return parse<T['actionResult']>(res);
    },
  };
}
