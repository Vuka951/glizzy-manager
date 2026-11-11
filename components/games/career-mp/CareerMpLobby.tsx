'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CareerToggle from '@/components/games/career/CareerToggle';
import PaperSheet from '@/components/games/career/street/PaperSheet';
import CorkBoard from '@/components/games/career-mp/CorkBoard';
import NoticePin from '@/components/games/career-mp/NoticePin';
import OverlordPointsRow from '@/components/games/career-mp/OverlordPointsRow';
import PaperStamp from '@/components/games/career-mp/PaperStamp';
import RoomBrowser from '@/components/games/career-mp/RoomBrowser';
import ColorPicker from '@/components/games/rooms/ColorPicker';
import CountdownPicker from '@/components/games/rooms/CountdownPicker';
import { OVERLORD_POINTS } from '@/data/games/careerEconomy';
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
import { queueGameFullscreen } from '@/lib/utils/fullscreen';
import { playPaperSound } from '@/lib/utils/gameSounds';

const L = GAMES_UI.careerMp.lobby;

const DEFAULTS: RoomSettings = {
  windowSeconds: DEFAULT_WINDOW_SECONDS,
  paperSeconds: DEFAULT_PAPER_SECONDS,
  preRoundSeconds: DEFAULT_PRE_ROUND_SECONDS,
  matchBetSeconds: DEFAULT_MATCH_BET_SECONDS,
  seasonEndSeconds: DEFAULT_SEASON_END_SECONDS,
  matchLingerSeconds: DEFAULT_MATCH_LINGER_SECONDS,
  overlordPoints: OVERLORD_POINTS,
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

const LABEL =
  'font-sign text-[14px] font-semibold uppercase tracking-[0.04em] text-slate-300';
const FIELD =
  'min-h-11 w-full border-b-2 border-[#1c1408] bg-transparent px-1 text-slate-100 placeholder:text-slate-500 focus:border-[#b91c1c] focus:outline-none';

// The league's noticeboard, the entry form pinned to it: a line for the name,
// ink dots for the color, the house rules on a sheet beside it, the red stamp
// to send it in. The face is picked inside the room
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
    queueGameFullscreen({ fresh: true, gesture: true });
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
    <>
      <CorkBoard
        title={L.formTitle}
        rail={
          !presetCode && (
            <div className="ml-auto flex flex-wrap items-center gap-1.5">
              {(['create', 'join'] as const).map((m) => (
                <CareerToggle
                  key={m}
                  selected={mode === m}
                  onClick={() => setMode(m)}
                  className="min-h-11 font-sign uppercase tracking-[0.06em]"
                >
                  {m === 'create' ? L.create : L.join}
                </CareerToggle>
              ))}
              <CareerToggle
                selected={false}
                tone="amber"
                onClick={() => setBrowsing(true)}
                className="min-h-11 font-sign uppercase tracking-[0.06em]"
              >
                {GAMES_UI.careerMp.browser.title}
              </CareerToggle>
            </div>
          )
        }
      >
        <div
          className={`grid items-start gap-5 ${
            mode === 'create' ? 'lg:grid-cols-[1fr_1.15fr]' : ''
          }`}
        >
          <PaperSheet
            className={`flex rotate-[-0.4deg] flex-col gap-4 px-4 pb-4 pt-6 sm:px-6 ${
              mode === 'join' ? 'mx-auto w-full max-w-md' : ''
            }`}
          >
            <NoticePin />
            <p className="border-y-[3px] border-double border-[#1c1408]/70 py-1 text-center font-serif text-2xl font-black uppercase tracking-[0.06em] text-slate-100">
              {L.masthead}
            </p>
            {mode === 'join' && (
              <label className="flex flex-col gap-0.5">
                <span className={LABEL}>{L.roomNumber}</span>
                {presetCode ? (
                  <span className="px-1 font-sign text-3xl font-bold tabular-nums tracking-[0.2em] text-slate-100">
                    {presetCode}
                  </span>
                ) : (
                  <input
                    value={code}
                    maxLength={6}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder={L.codePlaceholder}
                    className={`${FIELD} font-sign text-xl uppercase tracking-[0.2em] placeholder:font-serif placeholder:text-base placeholder:normal-case placeholder:tracking-normal`}
                  />
                )}
              </label>
            )}
            <label className="flex flex-col gap-0.5">
              <span className={LABEL}>{L.nameLabel}</span>
              <input
                value={name}
                maxLength={COACH_NAME_MAX}
                onChange={(e) => setName(e.target.value)}
                placeholder={L.namePlaceholder}
                className={`${FIELD} font-serif text-base font-semibold placeholder:font-normal`}
              />
            </label>
            <div className="flex flex-col gap-0.5">
              <span className={LABEL}>{L.colorLabel}</span>
              <ColorPicker value={color} taken={new Set()} onPick={setColor} />
            </div>
            <div className="flex flex-col gap-1 border-t border-[#7d93a8]/35 pt-3">
              {error && (
                <p className="font-serif text-[13px] font-semibold text-red-300">
                  {error}
                </p>
              )}
              <div className="flex flex-wrap items-center justify-end gap-3">
                <PaperStamp
                  label={
                    busy ? L.sending : mode === 'create' ? L.createStamp : L.joinStamp
                  }
                  disabled={!ready}
                  onClick={submit}
                />
              </div>
            </div>
          </PaperSheet>

          {mode === 'create' && (
            <PaperSheet className="rotate-[0.5deg] px-4 pb-3 pt-6 sm:px-5">
              <NoticePin tone="brass" />
              <p className="border-b-[3px] border-double border-[#1c1408]/70 pb-1 font-serif text-[17px] font-bold text-slate-100">
                {L.rulesTitle}
              </p>
              <CountdownPicker
                label={L.countdown}
                value={settings.windowSeconds}
                disabled={false}
                onPick={(seconds) =>
                  setSettings((s) => withCountdown(s, seconds))
                }
              />
              <OverlordPointsRow
                value={settings.overlordPoints ?? OVERLORD_POINTS}
                disabled={false}
                onPick={(overlordPoints) =>
                  setSettings((s) => ({ ...s, overlordPoints }))
                }
              />
            </PaperSheet>
          )}
        </div>
      </CorkBoard>
      {browsing && (
        <RoomBrowser onJoin={pickRoom} onClose={() => setBrowsing(false)} />
      )}
    </>
  );
}
