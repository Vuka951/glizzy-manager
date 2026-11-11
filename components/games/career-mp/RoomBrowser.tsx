'use client';

import { useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import GameModal from '@/components/games/GameModal';
import CareerButton from '@/components/games/career/CareerButton';
import PaperSheet from '@/components/games/career/street/PaperSheet';
import CorkPanel from '@/components/games/career-mp/CorkPanel';
import NoticePin from '@/components/games/career-mp/NoticePin';
import SeatTag from '@/components/games/rooms/SeatTag';
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
import { queueGameFullscreen } from '@/lib/utils/fullscreen';

const B = GAMES_UI.careerMp.browser;
const SEASONS = GAMES_UI.shared.seasons;
const REFRESH_MS = 5000;
const TILTS = ['rotate-[-0.8deg]', 'rotate-[0.6deg]', 'rotate-[0.3deg]', 'rotate-[-0.5deg]'];

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

// The notice board, opened from the entry form: every open room is a notice
// pinned to the cork, the ones this browser already sits in first and on a red
// pin, so a coach can come back or hop in
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
    <GameModal title={B.title} wide flush onClose={onClose}>
      <CorkPanel className="min-h-full p-3 sm:p-4">
        {rooms.length === 0 ? (
          <PaperSheet className="mx-auto max-w-xs rotate-[-1deg] px-4 pb-4 pt-6 text-center font-serif text-[14px] text-slate-300">
            <NoticePin tone="brass" />
            {B.empty}
          </PaperSheet>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {rooms.map((room, i) => {
              const seated = mine.has(room.code);
              const open = room.status === 'lobby';
              const full = room.coaches.length >= MAX_COACHES;
              return (
                <li key={room.code}>
                  <PaperSheet
                    className={`flex h-full flex-col gap-1.5 px-3 pb-3 pt-5 ${TILTS[i % TILTS.length]}`}
                  >
                    <NoticePin tone={seated ? 'red' : 'brass'} />
                    <span className="border-b-[3px] border-double border-[#1c1408]/70 pb-0.5 font-sign text-2xl font-bold leading-tight tabular-nums tracking-[0.16em] text-slate-100">
                      {room.code}
                    </span>
                    <span className="font-serif text-[12px] leading-snug text-slate-400">
                      {where(room)}
                      {' · '}
                      {lastActive(room.updatedAt)}
                    </span>
                    <span className="flex flex-wrap items-center gap-1">
                      {room.coaches.map((coach) => (
                        <SeatTag
                          key={coach.id}
                          name={coach.name}
                          color={coach.color}
                          connected={coach.connected}
                        />
                      ))}
                    </span>
                    <span className="font-serif text-[12px] leading-snug text-slate-400">
                      {fmt(B.coaches, {
                        count: room.coaches.length,
                        max: MAX_COACHES,
                      })}
                      {room.hostName &&
                        `, ${fmt(B.host, { name: room.hostName })}`}
                    </span>
                    <span className="mt-auto flex justify-end pt-1">
                      {seated ? (
                        <Link
                          href={rivalsRoomPath(room.code)}
                          onClick={() =>
                            queueGameFullscreen({ fresh: true, gesture: true })
                          }
                          className="inline-flex min-h-11 items-center rounded-[4px] border-2 border-[#ffffff] bg-[#1e40af] px-4 text-[11px] font-black uppercase tracking-[0.2em] text-[#ffffff] shadow-[0_3px_0_rgba(2,6,23,0.65)] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e3a8a] active:translate-y-[2px] motion-reduce:transition-none"
                        >
                          {B.resume}
                        </Link>
                      ) : open && !full ? (
                        <CareerButton
                          onClick={() => onJoin(room.code)}
                          className="min-h-11"
                        >
                          {B.join}
                        </CareerButton>
                      ) : (
                        <span className="inline-flex min-h-11 items-center">
                          <span className="rotate-[-3deg] rounded-[3px] border-2 border-[#6b5b42] px-2 py-0.5 font-sign text-[13px] font-bold uppercase tracking-[0.1em] text-slate-500">
                            {open ? B.full : B.inProgress}
                          </span>
                        </span>
                      )}
                    </span>
                  </PaperSheet>
                </li>
              );
            })}
          </ul>
        )}
      </CorkPanel>
    </GameModal>
  );
}
