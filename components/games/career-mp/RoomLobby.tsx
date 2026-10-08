'use client';

import { useEffect, useState } from 'react';
import ClassifiedsSelect from '@/components/games/career/ClassifiedsSelect';
import PortraitHead from '@/components/games/PortraitHead';
import CloseRoomButton from '@/components/games/career-mp/CloseRoomButton';
import ColorPicker from '@/components/games/career-mp/ColorPicker';
import { withCountdown } from '@/components/games/career-mp/CareerMpLobby';
import CountdownPicker from '@/components/games/career-mp/CountdownPicker';
import PaperStamp from '@/components/games/career-mp/PaperStamp';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import {
  COACH_COLOR_CLASSES,
  MAX_COACHES,
  MIN_COACHES,
  type CoachColor,
} from '@/lib/constants/careerMp';
import { rivalsRoomPath } from '@/lib/constants/routes';
import type { RoomAction, RoomView } from '@/lib/types/careerMp';
import { fmt, plural } from '@/lib/utils/format';
import { playPaperSound } from '@/lib/utils/gameSounds';

const L = GAMES_UI.careerMp.lobby;
const R = GAMES_UI.careerMp.rejoin;

// The team sheet before the league starts: every coach on a line in his
// ink, the empty lines still open, the house rules beside it, the host's
// stamp at the bottom
export default function RoomLobby({
  view,
  characters,
  token,
  busy,
  send,
}: {
  view: RoomView;
  characters: DuelCharacter[];
  token: string;
  busy: boolean;
  send: (action: RoomAction) => void;
}) {
  const [picking, setPicking] = useState(false);
  const [copied, setCopied] = useState(false);
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
  const takenColors = new Set(view.coaches.map((c) => c.color));
  const enoughCoaches = view.coaches.length >= MIN_COACHES;
  const everyonePicked = view.coaches.every((c) => c.slug);
  const canStart = isHost && enoughCoaches && everyonePicked;
  const link =
    typeof window === 'undefined'
      ? ''
      : `${window.location.origin}${rivalsRoomPath(view.code)}#token=${token}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // the field stays selectable
    }
  };

  if (picking) {
    return (
      <div className="flex w-full justify-center">
        <ClassifiedsSelect
          characters={characters}
          taken={takenSlugs}
          selected={me?.slug ?? null}
          onSelect={(slug) => {
            setPicking(false);
            send({ type: 'pickCharacter', slug });
          }}
        />
      </div>
    );
  }

  const emptyLines = Math.max(0, Math.min(3, MAX_COACHES - view.coaches.length));

  return (
    <div className="w-full rotate-[-0.4deg] rounded-sm bg-amber-50/80 p-5 text-left text-slate-900 shadow-2xl animate-[bubblein_0.4s_ease-out] sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3 border-y-2 border-slate-900 py-2">
        <div>
          <p className="text-lg font-black uppercase leading-none tracking-[0.15em]">
            {L.masthead}
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-600">
            {L.sheetTitle}
          </p>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] font-semibold text-slate-600">
            {L.roomNumber}
          </span>
          <span className="font-mono text-2xl font-black tracking-[0.3em]">
            {view.code}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-10">
        <div className="flex flex-col gap-4">
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
                  className="flex items-center gap-3 border-b border-dotted border-slate-900/40 py-2"
                >
                  <span className="w-5 font-mono text-xs text-slate-500">
                    {i + 1}.
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
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed text-slate-500 transition hover:bg-white/70 hover:text-red-700 ${classes.border}`}
                    >
                      ?
                    </button>
                  ) : (
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed text-slate-500 ${classes.border}`}
                    >
                      ?
                    </span>
                  )}
                  <span className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${classes.dot}`} />
                      <span className="truncate text-sm font-bold">
                        {coach.name}
                        {mine && (
                          <span className="ml-1.5 text-[10px] font-semibold text-slate-500">
                            ({L.you})
                          </span>
                        )}
                      </span>
                    </span>
                    <span className="truncate text-[11px] text-slate-600">
                      {character ? character.name : L.noCharacter}
                      {!coach.connected && ` · ${GAMES_UI.careerMp.coachBar.offline}`}
                    </span>
                  </span>
                  {coach.ready && (
                    <span className="text-[10px] font-bold text-emerald-700">
                      {L.ready}
                    </span>
                  )}
                  {coach.isHost && (
                    <span className="rotate-[-6deg] border-2 border-red-700 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.15em] text-red-700">
                      {L.host}
                    </span>
                  )}
                </li>
              );
            })}
            {Array.from({ length: emptyLines }, (_, i) => (
              <li
                key={`empty-${i}`}
                className="flex items-center gap-3 border-b border-dotted border-slate-900/40 py-2"
              >
                <span className="w-5 font-mono text-xs text-slate-600">
                  {view.coaches.length + i + 1}.
                </span>
                <span className="h-10 w-10 rounded-full border-2 border-dashed border-slate-900/15" />
                <span className="text-[11px] italic text-slate-500">{L.empty}</span>
              </li>
            ))}
          </ol>
          {me && (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
              <span className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-3">
                <ColorPicker
                  value={me.color}
                  taken={takenColors}
                  onPick={(color: CoachColor) => send({ type: 'pickColor', color })}
                />
                <button
                  onClick={() => setPicking(true)}
                  className={`text-[11px] font-bold underline underline-offset-4 transition hover:text-red-700 ${
                    me.slug
                      ? 'text-slate-800 decoration-slate-900/40'
                      : 'text-red-700 decoration-red-700/40'
                  }`}
                >
                  {me.slug ? L.changeCharacter : L.chooseCharacter}
                </button>
                <button
                  onClick={() => send({ type: 'ready', ready: !me.ready })}
                  className={`grid text-[11px] font-bold underline underline-offset-4 transition ${
                    me.ready
                      ? 'text-emerald-700 decoration-emerald-700/40'
                      : 'text-slate-800 decoration-slate-900/40 hover:text-red-700'
                  }`}
                >
                  <span className="col-start-1 row-start-1">
                    {me.ready ? L.notReady : L.ready}
                  </span>
                  <span
                    aria-hidden="true"
                    className="invisible col-start-1 row-start-1 no-underline"
                  >
                    {L.notReady}
                  </span>
                </button>
              </span>
              <span className="ml-auto flex items-center gap-4">
                {isHost && (
                  <CloseRoomButton
                    onPaper
                    busy={busy}
                    onClose={() => send({ type: 'closeRoom' })}
                  />
                )}
                <button
                  onClick={() => send({ type: 'leave' })}
                  className="text-[11px] font-bold text-slate-500 underline decoration-slate-900/30 underline-offset-4 transition hover:text-red-700"
                >
                  {L.leave}
                </button>
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <p className="border-b-2 border-slate-900 pb-1 text-xs font-black uppercase tracking-[0.12em]">
              {L.rulesTitle}
            </p>
            <p className="mt-1.5 text-[11px] italic text-slate-600">
              {isHost ? L.rulesHint : L.rulesLater}
            </p>
            <div className="mt-1">
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
            </div>
          </div>
          <div>
            <p className="border-b-2 border-slate-900 pb-1 text-xs font-black uppercase tracking-[0.12em]">
              {L.shareTitle}
            </p>
            <p className="mt-1.5 text-[11px] italic text-slate-600">{L.shareHint}</p>
            <div className="mt-2 flex items-center gap-2">
              <input
                readOnly
                value={link}
                onFocus={(e) => e.currentTarget.select()}
                className="min-w-0 flex-1 border-b border-slate-900/40 bg-transparent px-1 py-1 font-mono text-[10px] text-slate-700 focus:outline-none"
              />
              <button
                onClick={copy}
                className="shrink-0 text-[11px] font-bold text-slate-800 underline decoration-slate-900/40 underline-offset-4 transition hover:text-red-700"
              >
                {copied ? R.copied : R.copy}
              </button>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">{R.hint}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-900/30 pt-4">
        <p className="text-[11px] italic text-slate-600">
          {isHost
            ? canStart
              ? fmt(L.coaches, { count: view.coaches.length, max: MAX_COACHES })
              : enoughCoaches
                ? L.needCharacters
                : plural(L.needCoaches, MIN_COACHES, { min: MIN_COACHES })
            : everyonePicked
              ? L.waitingHost
              : L.needCharacters}
        </p>
        {isHost && (
          <PaperStamp
            label={busy ? L.starting : L.start}
            disabled={!canStart || busy}
            onClick={() => send({ type: 'start' })}
          />
        )}
      </div>
    </div>
  );
}
