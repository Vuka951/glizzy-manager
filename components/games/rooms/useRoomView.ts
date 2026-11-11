'use client';

import { useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DEADLINE_REFETCH_DELAY_MS } from '@/lib/constants/rooms';
import {
  RoomApiError,
  type RoomApi,
  type RoomApiTypes,
} from '@/lib/queries/rooms';

// A poll answer no retry can fix: the seat is gone, the room is gone or
// closed for good. Polling stops and the shell shows the reason
const FATAL_STATUSES = new Set([401, 404, 410]);
function isFatalRoomError(error: unknown): boolean {
  return error instanceof RoomApiError && FATAL_STATUSES.has(error.status);
}

export type RoomViewOptions<T extends RoomApiTypes> = {
  api: RoomApi<T>;
  code: string;
  token: string | null;
  // The polling cadence for the view on screen; false stops polling
  pollInterval: (view: T['view'] | undefined) => number | false;
  // The next server-side moment the phase can move on its own
  nextServerEvent: (view: T['view']) => number | null;
  // Keep polling while the tab is hidden, for a game that stands up seats
  // nobody has heard from
  pollInBackground?: boolean;
};

// The room as this seat sees it, polled on the phase's cadence. A poll that
// comes back unchanged keeps the cached view, so the full body only travels
// when something moved
export function useRoomView<T extends RoomApiTypes>({
  api,
  code,
  token,
  pollInterval,
  nextServerEvent,
  pollInBackground = false,
}: RoomViewOptions<T>) {
  const queryClient = useQueryClient();
  const key = api.keys.room(code);
  const query = useQuery({
    queryKey: key,
    enabled: token !== null,
    queryFn: async (): Promise<T['view']> => {
      const cached = queryClient.getQueryData<T['view']>(key);
      const res = await api.fetchRoom(code, token as string, cached?.version);
      if ('unchanged' in res) {
        if (!cached) throw new RoomApiError(500, 'generic');
        return { ...cached, now: res.now };
      }
      return res;
    },
    refetchInterval: (q) =>
      isFatalRoomError(q.state.error) ? false : pollInterval(q.state.data),
    refetchIntervalInBackground: pollInBackground,
    retry: (count, error) =>
      !(error instanceof RoomApiError && error.status < 500) && count < 2,
  });
  const view = query.data;
  const fatal = isFatalRoomError(query.error);
  const serverOffset = view ? view.now - query.dataUpdatedAt : 0;

  // The server only moves a phase when somebody asks: ask the moment a
  // known deadline, clip start or clip end passes, so every screen sees
  // the change together instead of on its own next tick
  const nextEventAt = view && !fatal ? nextServerEvent(view) : null;
  useEffect(() => {
    if (nextEventAt === null) return;
    const wait =
      nextEventAt - serverOffset - Date.now() + DEADLINE_REFETCH_DELAY_MS;
    const timer = setTimeout(
      () => void queryClient.invalidateQueries({ queryKey: key }),
      Math.max(0, wait),
    );
    return () => clearTimeout(timer);
    // key is stable for the room; serverOffset drifts a little per poll and
    // must not restart the timer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextEventAt, view?.version]);

  const mutation = useMutation({
    mutationFn: async (action: T['action']): Promise<T['actionResult']> => {
      const current = queryClient.getQueryData<T['view']>(key);
      try {
        return await api.sendAction(
          code,
          token as string,
          action,
          current?.version ?? 0,
        );
      } catch (error) {
        // A click that lost every write race on the server is sent once
        // more; a stale one is not, the phase it belongs to is gone
        if (!(error instanceof RoomApiError) || error.message !== 'conflict') {
          throw error;
        }
        const fresh = await api.fetchRoom(code, token as string);
        if ('unchanged' in fresh) throw error;
        queryClient.setQueryData(key, fresh);
        return api.sendAction(code, token as string, action, fresh.version);
      }
    },
    onSuccess: (res) => {
      queryClient.setQueryData(key, res.view);
    },
    onError: (error) => {
      if (error instanceof RoomApiError && error.view) {
        queryClient.setQueryData(key, error.view);
      } else {
        void queryClient.invalidateQueries({ queryKey: key });
      }
    },
  });

  const send = useCallback(
    (action: T['action']) => mutation.mutateAsync(action).catch(() => null),
    [mutation],
  );

  return {
    view,
    fatal,
    error: query.error,
    isLoading: query.isLoading,
    serverOffset,
    send,
    // Like send, but the refusal reaches the caller instead of resolving to null
    sendOrThrow: mutation.mutateAsync,
    sending: mutation.isPending,
    lastError: mutation.error,
  };
}
