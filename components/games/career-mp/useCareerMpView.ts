'use client';

import { useRoomView } from '@/components/games/rooms/useRoomView';
import {
  POLL_DECISION_MS,
  POLL_PLAYBACK_MS,
  POLL_WAITING_MS,
} from '@/lib/constants/rooms';
import { careerMpApi } from '@/lib/queries/careerMp';
import type { RoomView } from '@/lib/types/careerMp';

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
    case 'coalition':
    case 'laws':
      return POLL_DECISION_MS;
    default:
      if (view.status === 'closed') return false;
      return view.status === 'lobby' ? POLL_DECISION_MS : POLL_WAITING_MS;
  }
}

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

// The room as this coach sees it, polled on the phase's cadence
export function useCareerMpView(code: string, token: string | null) {
  return useRoomView({
    api: careerMpApi,
    code,
    token,
    pollInterval,
    nextServerEvent,
  });
}
