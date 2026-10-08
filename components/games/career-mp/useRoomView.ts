'use client';

import { useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DEADLINE_REFETCH_DELAY_MS,
  POLL_DECISION_MS,
  POLL_PLAYBACK_MS,
  POLL_WAITING_MS,
} from '@/lib/constants/careerMp';
import {
  CareerMpApiError,
  careerMpKeys,
  fetchRoom,
  sendAction,
} from '@/lib/queries/careerMp';
import type {
  ActionResponse,
  RoomAction,
  RoomView,
} from '@/lib/types/careerMp';

// A poll answer no retry can fix: the seat is gone, the room is gone or
// closed for good. Polling stops and the shell shows the reason
const FATAL_STATUSES = new Set([401, 404, 410]);
export function isFatalRoomError(error: unknown): boolean {
  return error instanceof CareerMpApiError && FATAL_STATUSES.has(error.status);
}

function pollInterval(view: RoomView | undefined): number | false {
  if (!view) return POLL_DECISION_MS;
  const me = view.coaches.find((c) => c.id === view.coachId);
  switch (view.phase.kind) {
    case 'match-clip':
      return POLL_PLAYBACK_MS;
    case 'match-bets':
      return me?.passed ? POLL_WAITING_MS : POLL_DECISION_MS;
    case 'window':
    case 'paper':
    case 'cup-pre':
    case 'season-end':
      return me?.done ? POLL_WAITING_MS : POLL_DECISION_MS;
    default:
      if (view.status === 'closed') return false;
      return view.status === 'lobby' ? POLL_DECISION_MS : POLL_WAITING_MS;
  }
}

// The next server-side moment the phase can move on its own
function nextServerEvent(view: RoomView): number | null {
  const phase = view.phase;
  if (phase.kind === 'match-clip') {
    const resultAt =
      phase.playback.skippedAt ??
      phase.playback.startedAt + phase.playback.durationMs;
    return resultAt + view.settings.matchLingerSeconds * 1000;
  }
  if ('deadline' in phase && phase.deadline !== null) return phase.deadline;
  return null;
}

// The room as this coach sees it, polled on the phase's cadence. A poll that
// comes back unchanged keeps the cached view, so the full body only travels
// when something moved
export function useRoomView(code: string, token: string | null) {
  const queryClient = useQueryClient();
  const key = careerMpKeys.room(code);
  const query = useQuery({
    queryKey: key,
    enabled: token !== null,
    queryFn: async () => {
      const cached = queryClient.getQueryData<RoomView>(key);
      const res = await fetchRoom(code, token as string, cached?.version);
      if ('unchanged' in res) {
        if (!cached) throw new CareerMpApiError(500, 'generic');
        return { ...cached, now: res.now };
      }
      return res;
    },
    refetchInterval: (q) =>
      isFatalRoomError(q.state.error) ? false : pollInterval(q.state.data),
    retry: (count, error) =>
      !(error instanceof CareerMpApiError && error.status < 500) && count < 2,
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
    mutationFn: async (action: RoomAction): Promise<ActionResponse> => {
      const current = queryClient.getQueryData<RoomView>(key);
      try {
        return await sendAction(
          code,
          token as string,
          action,
          current?.version ?? 0,
        );
      } catch (error) {
        // A click that lost every write race on the server is sent once
        // more; a stale one is not, the phase it belongs to is gone
        if (
          !(error instanceof CareerMpApiError) ||
          error.message !== 'conflict'
        ) {
          throw error;
        }
        const fresh = await fetchRoom(code, token as string);
        if ('unchanged' in fresh) throw error;
        queryClient.setQueryData(key, fresh);
        return sendAction(code, token as string, action, fresh.version);
      }
    },
    onSuccess: (res) => {
      queryClient.setQueryData(key, res.view);
    },
    onError: (error) => {
      if (error instanceof CareerMpApiError && error.view) {
        queryClient.setQueryData(key, error.view);
      } else {
        void queryClient.invalidateQueries({ queryKey: key });
      }
    },
  });

  const send = useCallback(
    (action: RoomAction) => mutation.mutateAsync(action).catch(() => null),
    [mutation],
  );

  return {
    view,
    fatal,
    error: query.error,
    isLoading: query.isLoading,
    serverOffset,
    send,
    sending: mutation.isPending,
    lastError: mutation.error,
  };
}
