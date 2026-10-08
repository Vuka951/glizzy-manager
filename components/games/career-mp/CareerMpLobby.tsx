'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ColorPicker from '@/components/games/career-mp/ColorPicker';
import CountdownPicker from '@/components/games/career-mp/CountdownPicker';
import PaperStamp from '@/components/games/career-mp/PaperStamp';
import RoomBrowser from '@/components/games/career-mp/RoomBrowser';
import { GAMES_UI } from '@/data/games/locale';
import { createRoom, joinRoom, storeToken } from '@/lib/queries/careerMp';
import { roomErrorCode, roomErrorText } from '@/lib/utils/roomErrorText';
import {
  COACH_NAME_MAX,
  DEFAULT_MATCH_BET_SECONDS,
  DEFAULT_MATCH_LINGER_SECONDS,
  DEFAULT_PAPER_SECONDS,
  DEFAULT_PRE_ROUND_SECONDS,
  DEFAULT_SEASON_END_SECONDS,
  DEFAULT_WINDOW_SECONDS,
  type CoachColor,
} from '@/lib/constants/careerMp';
import { rivalsRoomPath } from '@/lib/constants/routes';
import type { RoomSettings } from '@/lib/types/careerMp';
import { playPaperSound } from '@/lib/utils/gameSounds';

const L = GAMES_UI.careerMp.lobby;

const DEFAULTS: RoomSettings = {
  windowSeconds: DEFAULT_WINDOW_SECONDS,
  paperSeconds: DEFAULT_PAPER_SECONDS,
  preRoundSeconds: DEFAULT_PRE_ROUND_SECONDS,
  matchBetSeconds: DEFAULT_MATCH_BET_SECONDS,
  seasonEndSeconds: DEFAULT_SEASON_END_SECONDS,
  matchLingerSeconds: DEFAULT_MATCH_LINGER_SECONDS,
};

// One countdown for every decision phase
export function withCountdown(
  settings: RoomSettings,
  seconds: number | null,
): RoomSettings {
  return {
    ...settings,
    windowSeconds: seconds,
    paperSeconds: seconds,
    preRoundSeconds: seconds,
    matchBetSeconds: seconds,
    seasonEndSeconds: seconds,
  };
}

const FIELD =
  'w-full border-b-2 border-slate-900 bg-transparent px-1 py-1 text-base font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-500 focus:border-red-700 focus:outline-none';

// The league entry form, printed on the same paper the career opens with:
// a line for the name, ink dots for the color, the house rules on the
// right, the red stamp to send it in. The face is picked inside the room
export default function CareerMpLobby({
  code: presetCode = null,
  onJoined,
}: {
  code?: string | null;
  // The room page is already open: hand it the token instead of navigating
  onJoined?: (token: string) => void;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<'create' | 'join'>(
    presetCode ? 'join' : 'create',
  );
  const [name, setName] = useState('');
  const [code, setCode] = useState(presetCode ?? '');
  const [color, setColor] = useState<CoachColor | null>(null);
  const [settings, setSettings] = useState<RoomSettings>(DEFAULTS);
  const [busy, setBusy] = useState(false);
  const [browsing, setBrowsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    playPaperSound();
  }, []);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const res =
        mode === 'create'
          ? await createRoom({
              coachName: name,
              color: color ?? undefined,
              settings,
            })
          : await joinRoom(code.trim().toUpperCase(), {
              coachName: name,
              color: color ?? undefined,
            });
      storeToken(res.code, res.token);
      if (onJoined && presetCode === res.code) {
        onJoined(res.token);
        return;
      }
      router.push(rivalsRoomPath(res.code));
    } catch (e) {
      setError(roomErrorText(roomErrorCode(e)));
      setBusy(false);
    }
  };

  const ready =
    !busy &&
    name.trim().length >= 2 &&
    (mode === 'create' || code.trim().length === 6);

  const pickRoom = (picked: string) => {
    setBrowsing(false);
    setMode('join');
    setCode(picked);
    setError(null);
  };

  return (
    <div className="w-full rotate-[-0.4deg] rounded-sm bg-amber-50/80 p-5 text-left text-slate-900 shadow-2xl animate-[bubblein_0.4s_ease-out] sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3 border-y-2 border-slate-900 py-2">
        <div>
          <p className="text-lg font-black uppercase leading-none tracking-[0.15em]">
            {L.masthead}
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-600">
            {L.formTitle}
          </p>
        </div>
        {!presetCode && (
          <div className="flex gap-4 text-[11px] font-bold">
            {(['create', 'join'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`border-b-2 pb-0.5 transition ${
                  mode === m
                    ? 'border-red-700 text-red-700'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                {m === 'create' ? L.create : L.join}
              </button>
            ))}
            <button
              onClick={() => setBrowsing(true)}
              className="border-b-2 border-transparent pb-0.5 text-slate-500 transition hover:text-slate-900"
            >
              {GAMES_UI.careerMp.browser.title}
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
        <div className="flex flex-col gap-5">
          {mode === 'join' && (
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-slate-800">
                {L.roomNumber}
              </span>
              {presetCode ? (
                <span className="px-1 font-mono text-2xl font-black tracking-[0.3em]">
                  {presetCode}
                </span>
              ) : (
                <input
                  value={code}
                  maxLength={6}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder={L.codePlaceholder}
                  className={`${FIELD} font-mono uppercase tracking-[0.3em] placeholder:tracking-normal`}
                />
              )}
            </label>
          )}
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-slate-800">
              {L.nameLabel}
            </span>
            <input
              value={name}
              maxLength={COACH_NAME_MAX}
              onChange={(e) => setName(e.target.value)}
              placeholder={L.namePlaceholder}
              className={FIELD}
            />
          </label>
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold text-slate-800">
              {L.colorLabel}
            </span>
            <ColorPicker value={color} taken={new Set()} onPick={setColor} />
          </div>
        </div>

        <div className="flex flex-col">
          <p className="border-b-2 border-slate-900 pb-1 text-xs font-black uppercase tracking-[0.12em]">
            {L.rulesTitle}
          </p>
          <p className="mt-1.5 text-[11px] italic text-slate-600">
            {mode === 'create' ? L.rulesHint : L.rulesLater}
          </p>
          {mode === 'create' && (
            <div className="mt-1">
              <CountdownPicker
                label={L.countdown}
                value={settings.windowSeconds}
                disabled={false}
                onPick={(seconds) => setSettings((s) => withCountdown(s, seconds))}
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-900/30 pt-4">
        <p className="min-h-4 text-xs font-semibold text-red-700">{error}</p>
        <PaperStamp
          label={busy ? L.sending : mode === 'create' ? L.createStamp : L.joinStamp}
          disabled={!ready}
          onClick={submit}
        />
      </div>
      {browsing && <RoomBrowser onJoin={pickRoom} onClose={() => setBrowsing(false)} />}
    </div>
  );
}
