'use client';

import { useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import CoachTag from '@/components/games/career-mp/CoachTag';
import { GAMES_UI } from '@/data/games/locale';
import { MAX_COACHES } from '@/lib/constants/careerMp';
import { rivalsRoomPath } from '@/lib/constants/routes';
import {
  careerMpKeys,
  fetchRooms,
  knownRoomCodes,
  subscribeToken,
} from '@/lib/queries/careerMp';
import type { RoomSummary } from '@/lib/types/careerMp';
import { fmt } from '@/lib/utils/format';

const B = GAMES_UI.careerMp.browser;
const SEASONS = GAMES_UI.shared.seasons;
const REFRESH_MS = 5000;

function mySeats() {
  return [...knownRoomCodes()].sort().join(',');
}

function lastActive(updatedAt: number) {
  const minutes = Math.floor((Date.now() - updatedAt) / 60000);
  return minutes < 1 ? B.lastActiveNow : fmt(B.lastActive, { minutes });
}

function where(room: RoomSummary) {
  if (room.status === 'lobby') return B.lobby;
  if (room.status === 'finished') return B.finished;
  if (room.year === null || room.season === null) return B.inProgress;
  return fmt(B.yearSeason, {
    year: room.year,
    season: SEASONS[room.season] ?? room.season,
  });
}

// The notice board, opened from the entry form: every open room, the ones
// this browser already sits in first, so a coach can come back or hop in
export default function RoomBrowser({
  onJoin,
  onClose,
}: {
  onJoin: (code: string) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const seats = useSyncExternalStore(subscribeToken, mySeats, () => '');
  const mine = new Set(seats.split(',').filter(Boolean));
  const { data } = useQuery({
    queryKey: careerMpKeys.rooms(),
    queryFn: fetchRooms,
    refetchInterval: REFRESH_MS,
  });
  const rooms = [...(data ?? [])].sort((a, b) => {
    const seat = Number(mine.has(b.code)) - Number(mine.has(a.code));
    return seat !== 0 ? seat : b.updatedAt - a.updatedAt;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-sm">
      <button
        aria-label={GAMES_UI.shared.close}
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />
      <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rotate-[0.3deg] rounded-sm bg-amber-50 p-5 text-left text-slate-900 shadow-2xl animate-[bubblein_0.3s_ease-out] sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-slate-900 pb-2">
          <p className="text-base font-black uppercase leading-none tracking-[0.15em]">
            {B.title}
          </p>
          <button
            onClick={onClose}
            className="text-[11px] font-bold text-slate-500 underline decoration-slate-900/30 underline-offset-4 transition hover:text-red-700"
          >
            {GAMES_UI.shared.close}
          </button>
        </div>
        {rooms.length === 0 ? (
          <p className="py-5 text-center text-xs italic text-slate-500">
            {B.empty}
          </p>
        ) : (
          <ul className="divide-y divide-slate-900/20">
            {rooms.map((room) => {
              const seated = mine.has(room.code);
              const open = room.status === 'lobby';
              const full = room.coaches.length >= MAX_COACHES;
              return (
                <li
                  key={room.code}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3"
                >
                  <div className="flex min-w-32 flex-col">
                    <span className="font-mono text-base font-black tracking-[0.2em]">
                      {room.code}
                    </span>
                    <span className="text-[10px] text-slate-600">
                      {where(room)}
                      {' · '}
                      {lastActive(room.updatedAt)}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-1">
                      {room.coaches.map((coach) => (
                        <CoachTag
                          key={coach.id}
                          name={coach.name}
                          color={coach.color}
                          connected={coach.connected}
                          onPaper
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-600">
                      {fmt(B.coaches, {
                        count: room.coaches.length,
                        max: MAX_COACHES,
                      })}
                      {room.hostName &&
                        `, ${fmt(B.host, { name: room.hostName })}`}
                    </span>
                  </div>
                  {seated ? (
                    <Link
                      href={rivalsRoomPath(room.code)}
                      className="rounded-sm bg-slate-900 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-amber-50 transition hover:bg-red-700"
                    >
                      {B.resume}
                    </Link>
                  ) : open && !full ? (
                    <button
                      onClick={() => onJoin(room.code)}
                      className="rounded-sm border-2 border-slate-900 px-3 py-0.5 text-[11px] font-black uppercase tracking-widest text-slate-900 transition hover:border-red-700 hover:text-red-700"
                    >
                      {B.join}
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      {open ? B.full : B.inProgress}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
