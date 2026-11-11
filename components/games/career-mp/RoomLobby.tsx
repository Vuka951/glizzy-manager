'use client';

import { useEffect, useState } from 'react';
import CareerButton from '@/components/games/career/CareerButton';
import ClassifiedsSelect from '@/components/games/career/ClassifiedsSelect';
import PaperSheet from '@/components/games/career/street/PaperSheet';
import PortraitHead from '@/components/games/PortraitHead';
import { withCountdown } from '@/components/games/career-mp/CareerMpLobby';
import CorkBoard from '@/components/games/career-mp/CorkBoard';
import NoticePin from '@/components/games/career-mp/NoticePin';
import OverlordPointsRow from '@/components/games/career-mp/OverlordPointsRow';
import PaperStamp from '@/components/games/career-mp/PaperStamp';
import CloseRoomButton from '@/components/games/rooms/CloseRoomButton';
import ColorPicker from '@/components/games/rooms/ColorPicker';
import CountdownPicker from '@/components/games/rooms/CountdownPicker';
import SeatTag from '@/components/games/rooms/SeatTag';
import { OVERLORD_POINTS } from '@/data/games/careerEconomy';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import {
  COACH_COLOR_CLASSES,
  MAX_COACHES,
  MIN_COACHES,
  type CoachColor,
} from '@/lib/constants/careerMp';
import type { RoomAction, RoomView } from '@/lib/types/careerMp';
import { fmt, plural } from '@/lib/utils/format';
import { ownNameProblem, ownNameSlot } from '@/lib/utils/leagueRoster';
import { queueGameFullscreen } from '@/lib/utils/fullscreen';
import { playPaperSound } from '@/lib/utils/gameSounds';

const L = GAMES_UI.careerMp.lobby;

// The team sheet before the league starts, pinned to the noticeboard: every
// coach on a ruled line under his name tag, the empty lines still open, the
// house rules beside it, the host's stamp at the bottom
export default function RoomLobby({
  view,
  characters,
  busy,
  send,
}: {
  view: RoomView;
  characters: DuelCharacter[];
  busy: boolean;
  send: (action: RoomAction) => void;
}) {
  const [picking, setPicking] = useState(false);
  useEffect(() => {
    playPaperSound();
  }, []);
  const me = view.coaches.find((c) => c.id === view.coachId);
  const isHost = view.hostCoachId === view.coachId;
  const characterBySlug = new Map(characters.map((c) => [c.slug, c]));
  const takenSlugs = new Set(
    view.coaches
      .filter((c) => c.slug && c.id !== view.coachId)
      .map((c) => c.slug as string),
  );
  // A written name goes over the coach's own pick, else over the last face
  // nobody plays, the same slot the server fills
  const ownNameReplaces =
    me?.slug ??
    ownNameSlot(
      view.roster,
      view.coaches.flatMap((c) => (c.slug ? [c.slug] : [])),
    );
  const takenColors = new Set(view.coaches.map((c) => c.color));
  const enoughCoaches = view.coaches.length >= MIN_COACHES;
  const everyonePicked = view.coaches.every((c) => c.slug);
  const everyoneReady = view.coaches.every((c) => c.isHost || c.ready);
  const canStart = isHost && enoughCoaches && everyonePicked && everyoneReady;

  if (picking) {
    return (
      <div className="flex w-full justify-center">
        <ClassifiedsSelect
          characters={characters}
          taken={takenSlugs}
          selected={me?.slug ?? null}
          busy={busy}
          onSelect={(slug) => {
            setPicking(false);
            send({ type: 'pickCharacter', slug });
          }}
          onReroll={() => send({ type: 'rerollLeague' })}
          ownNameProblem={(name) =>
            ownNameProblem(view.roster, name, ownNameReplaces)
          }
          onOwnName={(name) => {
            setPicking(false);
            send({ type: 'nameCharacter', name });
          }}
        />
      </div>
    );
  }

  const emptyLines = Math.max(0, Math.min(3, MAX_COACHES - view.coaches.length));

  return (
    <CorkBoard
      title={L.sheetTitle}
      rail={
        <span className="ml-auto flex items-center gap-2 rounded-[4px] bg-[#1f140b] px-2.5 py-1 shadow-[inset_0_1px_3px_rgb(0_0_0/0.8),0_1px_0_rgb(255_255_255/0.08)]">
          <span className="font-sign text-[13px] font-semibold uppercase tracking-[0.06em] text-slate-300">
            {L.roomNumber}
          </span>
          <span className="font-sign text-2xl font-bold leading-none tabular-nums tracking-[0.16em] text-[#fdf0c8]">
            {view.code}
          </span>
        </span>
      }
    >
      <div className="grid items-start gap-5 lg:grid-cols-[1.2fr_1fr]">
        <PaperSheet className="flex min-w-0 rotate-[-0.3deg] flex-col px-3 pb-4 pt-6 sm:px-5">
          <NoticePin />
          <p className="border-b-[3px] border-double border-[#1c1408]/70 pb-1 text-center font-serif text-xl font-black uppercase tracking-[0.06em] text-slate-100">
            {L.masthead}
          </p>
          <ol className="flex flex-col">
            {view.coaches.map((coach, i) => {
              const character = coach.slug
                ? characterBySlug.get(coach.slug)
                : null;
              const classes = COACH_COLOR_CLASSES[coach.color];
              const mine = coach.id === view.coachId;
              return (
                <li
                  key={coach.id}
                  className={`flex items-center gap-2 border-b border-[#7d93a8]/35 py-1 pr-1 sm:gap-3 ${
                    mine ? 'bg-[#fde047]/55' : ''
                  }`}
                >
                  <span className="flex w-7 shrink-0 self-stretch items-center justify-end border-r-2 border-r-[#b91c1c]/50 pr-1.5 font-sign text-[15px] font-semibold tabular-nums text-slate-300">
                    {i + 1}
                  </span>
                  {character ? (
                    <PortraitHead
                      character={character}
                      className={`h-10 w-10 ring-2 ${classes.ring}`}
                    />
                  ) : mine ? (
                    <button
                      onClick={() => setPicking(true)}
                      aria-label={L.chooseCharacter}
                      className={`flex h-11 w-11 items-center justify-center rounded-full border-2 border-dashed font-sign text-lg font-bold text-slate-400 transition hover:text-red-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e3a8a] motion-reduce:transition-none ${classes.border}`}
                    >
                      ?
                    </button>
                  ) : (
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed font-sign text-lg font-bold text-slate-400 ${classes.border}`}
                    >
                      ?
                    </span>
                  )}
                  <span className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <SeatTag
                        name={coach.name}
                        color={coach.color}
                        connected={coach.connected}
                      />
                      {mine && (
                        <span className="font-serif text-[12px] text-slate-400">
                          ({L.you})
                        </span>
                      )}
                    </span>
                    <span className="truncate pt-0.5 font-serif text-[14px] font-semibold text-slate-200">
                      {character ? character.name : L.noCharacter}
                    </span>
                  </span>
                  {coach.ready && !coach.isHost && (
                    <span className="shrink-0 rotate-[-3deg] rounded-[2px] border-2 border-[#15803d] px-1.5 py-0.5 font-sign text-[12px] font-bold uppercase leading-none tracking-[0.08em] text-[#15803d]">
                      {L.ready}
                    </span>
                  )}
                  {coach.isHost && (
                    <span className="shrink-0 rotate-[-6deg] rounded-[2px] border-2 border-[#b91c1c] px-1.5 py-0.5 font-sign text-[12px] font-bold uppercase leading-none tracking-[0.08em] text-[#b91c1c]">
                      {L.host}
                    </span>
                  )}
                </li>
              );
            })}
            {Array.from({ length: emptyLines }, (_, i) => (
              <li
                key={`empty-${i}`}
                className="flex items-center gap-2 border-b border-[#7d93a8]/35 py-1 sm:gap-3"
              >
                <span className="flex w-7 shrink-0 self-stretch items-center justify-end border-r-2 border-r-[#b91c1c]/50 pr-1.5 font-sign text-[15px] font-semibold tabular-nums text-slate-500">
                  {view.coaches.length + i + 1}
                </span>
                <span className="h-10 w-10 rounded-full border-2 border-dashed border-[#1c1408]/20" />
                <span className="font-serif text-[13px] text-slate-500">
                  {L.empty}
                </span>
              </li>
            ))}
          </ol>
          {me && (
            <div className="flex flex-col gap-2 pt-2">
              <ColorPicker
                value={me.color}
                taken={takenColors}
                onPick={(color: CoachColor) => send({ type: 'pickColor', color })}
              />
              <div className="flex flex-wrap gap-2">
                <CareerButton
                  onClick={() => setPicking(true)}
                  className="min-h-11"
                >
                  {me.slug ? L.changeCharacter : L.chooseCharacter}
                </CareerButton>
                {!isHost && (
                  <CareerButton
                    tone={me.ready ? 'good' : 'quiet'}
                    onClick={() => {
                      queueGameFullscreen({ fresh: false, gesture: true });
                      send({ type: 'ready', ready: !me.ready });
                    }}
                    className="grid min-h-11 place-items-center"
                  >
                    <span className="col-start-1 row-start-1">
                      {me.ready ? L.notReady : L.ready}
                    </span>
                    <span
                      aria-hidden="true"
                      className="invisible col-start-1 row-start-1"
                    >
                      {L.notReady}
                    </span>
                  </CareerButton>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {isHost && (
                  <CloseRoomButton
                    confirm={GAMES_UI.careerMp.close.confirm}
                    hint={GAMES_UI.careerMp.close.hint}
                    busy={busy}
                    onClose={() => send({ type: 'closeRoom' })}
                  />
                )}
                <CareerButton
                  tone="quiet"
                  onClick={() => send({ type: 'leave' })}
                  className="min-h-11"
                >
                  {L.leave}
                </CareerButton>
              </div>
            </div>
          )}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t-[3px] border-double border-[#1c1408]/70 pt-3">
            <p className="font-serif text-[13px] text-slate-400">
              {isHost
                ? canStart
                  ? fmt(L.coaches, { count: view.coaches.length, max: MAX_COACHES })
                  : !enoughCoaches
                    ? plural(L.needCoaches, MIN_COACHES, { min: MIN_COACHES })
                    : everyonePicked
                      ? L.needReady
                      : L.needCharacters
                : !everyonePicked
                  ? L.needCharacters
                  : everyoneReady
                    ? L.waitingHost
                    : L.needReady}
            </p>
            {isHost && (
              <PaperStamp
                label={busy ? L.starting : L.start}
                disabled={!canStart || busy}
                onClick={() => {
                  queueGameFullscreen({ fresh: false, gesture: true });
                  send({ type: 'start' });
                }}
              />
            )}
          </div>
        </PaperSheet>

        <div className="flex min-w-0 flex-col gap-5">
          <PaperSheet className="rotate-[0.4deg] px-3 pb-3 pt-6 sm:px-4">
            <NoticePin tone="brass" />
            <p className="border-b-[3px] border-double border-[#1c1408]/70 pb-1 font-serif text-[17px] font-bold text-slate-100">
              {L.rulesTitle}
            </p>
            <CountdownPicker
              label={L.countdown}
              value={view.settings.windowSeconds}
              disabled={!isHost || busy}
              onPick={(seconds) =>
                send({
                  type: 'setSettings',
                  settings: withCountdown(view.settings, seconds),
                })
              }
            />
            <OverlordPointsRow
              value={view.settings.overlordPoints ?? OVERLORD_POINTS}
              disabled={!isHost || busy}
              onPick={(overlordPoints) =>
                send({ type: 'setSettings', settings: { overlordPoints } })
              }
            />
          </PaperSheet>
        </div>
      </div>
    </CorkBoard>
  );
}
