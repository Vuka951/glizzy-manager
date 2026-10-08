'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ActionIcon from '@/components/icons/ActionIcon';
import { CLOSED_PARAM } from '@/components/games/career-mp/RoomClosedNotice';
import FullscreenButton from '@/components/games/FullscreenButton';
import GameSettingsModal from '@/components/games/GameSettingsModal';
import GearButton from '@/components/games/GearButton';
import PortraitHead from '@/components/games/PortraitHead';
import ActionCutscene, {
  type ActionCutsceneState,
} from '@/components/games/career/ActionCutscene';
import ActionReceipt, {
  type ActionReceiptToast,
} from '@/components/games/career/ActionReceipt';
import CareerTable from '@/components/games/career/CareerTable';
import CareerWalletChip from '@/components/games/career/CareerWalletChip';
import CharacterDossier from '@/components/games/career/CharacterDossier';
import ElectionNightCutscene from '@/components/games/career/ElectionNightCutscene';
import MetersInfoPanel from '@/components/games/career/MetersInfoPanel';
import NewspaperSpread from '@/components/games/career/NewspaperSpread';
import SabotageHitReel from '@/components/games/career/SabotageHitReel';
import OffseasonScreen from '@/components/games/career/OffseasonScreen';
import SeasonStage from '@/components/games/career/SeasonStage';
import SponsorInfoPanel from '@/components/games/career/SponsorInfoPanel';
import SponsorModal from '@/components/games/career/SponsorModal';
import YearCalendar from '@/components/games/career/YearCalendar';
import { useSeasonMusic } from '@/components/games/career/useSeasonMusic';
import CareerMpLobby from '@/components/games/career-mp/CareerMpLobby';
import CoachBar from '@/components/games/career-mp/CoachBar';
import { CoachColorsContext } from '@/components/games/career-mp/coachColors';
import ExpansionIntro from '@/components/games/career-mp/ExpansionIntro';
import FinalReport from '@/components/games/career-mp/FinalReport';
import PreMatchBets from '@/components/games/career-mp/PreMatchBets';
import CloseRoomButton from '@/components/games/career-mp/CloseRoomButton';
import RejoinLinkCard from '@/components/games/career-mp/RejoinLinkCard';
import ReopenVote from '@/components/games/career-mp/ReopenVote';
import RivalPickDialog from '@/components/games/career-mp/RivalPickDialog';
import RoomLobby from '@/components/games/career-mp/RoomLobby';
import RoomQuoteCues from '@/components/games/career-mp/RoomQuoteCues';
import RoundBoard from '@/components/games/career-mp/RoundBoard';
import SeasonEndFlow from '@/components/games/career-mp/SeasonEndFlow';
import SyncedMatchStage from '@/components/games/career-mp/SyncedMatchStage';
import { useRoomView } from '@/components/games/career-mp/useRoomView';
import { OVERLORD_POINTS } from '@/data/games/careerEconomy';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import { TOKEN_STORAGE_PREFIX } from '@/lib/constants/careerMp';
import { RIVALS_PATH } from '@/lib/constants/routes';
import {
  clearToken,
  noToken,
  readToken,
  storeToken,
  subscribeToken,
} from '@/lib/queries/careerMp';
import type { CoachTagMap, Receipt, RoomAction } from '@/lib/types/careerMp';
import { careerPoints, rankBySeeding } from '@/lib/utils/careerPoints';
import { receiptLines } from '@/lib/utils/careerReceipt';
import { achievementStore } from '@/lib/utils/achievements';
import { careerAchievementsUnlocked } from '@/lib/utils/careerAchievements';
import type { SavedCareer } from '@/lib/utils/careerSave';
import { scoutLevel, scoutReveal } from '@/lib/utils/careerScouting';
import { seasonName } from '@/lib/utils/localeNames';
import { renderMessage } from '@/lib/utils/messageText';
import { roomErrorCode, roomErrorText } from '@/lib/utils/roomErrorText';
import { fmt, ordinal, plural } from '@/lib/utils/format';

const CAREER = GAMES_UI.career;
const MP = GAMES_UI.careerMp;
const TOAST_LINGER_MS = 20000;

// What this browser has already watched: the window intro and the election
// night, so a poll never replays them
function readAcks(code: string): Record<string, string> {
  try {
    return JSON.parse(
      window.localStorage.getItem(`${TOKEN_STORAGE_PREFIX}${code}:acks`) ?? '{}'
    ) as Record<string, string>;
  } catch {
    return {};
  }
}

function writeAcks(code: string, acks: Record<string, string>) {
  try {
    window.localStorage.setItem(
      `${TOKEN_STORAGE_PREFIX}${code}:acks`,
      JSON.stringify(acks)
    );
  } catch {
    // best-effort
  }
}

// A token in the hash fragment is a rejoin link from another device
function tokenFromHash(): string | null {
  const match = window.location.hash.match(/token=([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

function receiptToToast(receipt: Receipt): ActionReceiptToast {
  return {
    title: renderMessage(receipt.title),
    lines: receiptLines(receipt.before, receipt.after, receipt.moneyDelta),
    icon: receipt.icon,
    ok: receipt.ok,
  };
}

export default function CareerMpRoom({
  code,
  characters,
}: {
  code: string;
  characters: DuelCharacter[];
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const token = useSyncExternalStore(
    subscribeToken,
    () => readToken(code),
    noToken
  );
  useEffect(() => {
    const fromHash = tokenFromHash();
    if (!fromHash) return;
    storeToken(code, fromHash);
    window.history.replaceState(null, '', window.location.pathname);
  }, [code]);
  const router = useRouter();
  const {
    view,
    fatal,
    error,
    isLoading,
    serverOffset,
    send,
    sending,
    lastError,
  } = useRoomView(code, token);
  const [toast, setToast] = useState<ActionReceiptToast | null>(null);
  const [cutscene, setCutscene] = useState<ActionCutsceneState | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [dossierSlug, setDossierSlug] = useState<string | null>(null);
  const [dossierInfo, setDossierInfo] = useState<
    'sponsors' | 'meters' | null
  >(null);
  const [electionOpen, setElectionOpen] = useState(false);
  // The count this browser has already opened by itself, so it opens once
  // and not on every poll
  const [electionAutoOpened, setElectionAutoOpened] = useState<number | null>(
    null
  );
  const [rivalOpen, setRivalOpen] = useState(false);
  const [acks, setAcks] = useState<Record<string, string>>(() =>
    typeof window === 'undefined' ? {} : readAcks(code)
  );
  const [introStep, setIntroStep] = useState(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The same trophies as single player, read off the coach's own view of
  // the league between two polls
  const previousCareer = useRef<SavedCareer | null>(null);
  useEffect(() => {
    const prev = previousCareer.current;
    const next = view?.career ?? null;
    previousCareer.current = next;
    if (!next || !prev) return;
    careerAchievementsUnlocked(prev, next).forEach((id) =>
      achievementStore.unlock(id)
    );
  }, [view?.career]);

  const characterBySlug = useMemo(
    () => new Map(characters.map((c) => [c.slug, c])),
    [characters]
  );
  const coaches: CoachTagMap = useMemo(() => {
    const out: CoachTagMap = {};
    view?.coaches.forEach((c) => {
      if (c.slug)
        out[c.slug] = { name: c.name, color: c.color, connected: c.connected };
    });
    return out;
  }, [view?.coaches]);

  const musicActive = Boolean(view && view.status !== 'lobby');
  useSeasonMusic(view?.career?.season ?? 0, musicActive);

  const flash = useCallback((receipt: Receipt) => {
    const next = receiptToToast(receipt);
    setToast(next);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), TOAST_LINGER_MS);
    if (receipt.scene) {
      setCutscene((prev) => ({
        scene: receipt.scene as NonNullable<Receipt['scene']>,
        outcome: receipt.outcome ?? (receipt.ok ? 'good' : 'bad'),
        toast: next,
        key: (prev?.key ?? 0) + 1,
      }));
    }
  }, []);

  const act = useCallback(
    async (action: RoomAction) => {
      const res = await send(action);
      if (res?.receipt) flash(res.receipt);
      return res;
    },
    [send, flash]
  );
  const actWithError = useCallback(
    (action: RoomAction) => {
      void send(action).then((res) => {
        if (res?.receipt) flash(res.receipt);
        if (action.type === 'leave' && res) {
          clearToken(code);
          router.push(RIVALS_PATH);
        }
      });
    },
    [send, flash, code, router]
  );

  // A closed room sends the coach back to the lobby, where the notice shows
  const closed = view?.status === 'closed';
  useEffect(() => {
    if (!closed) return;
    clearToken(code);
    router.replace(`${RIVALS_PATH}?${CLOSED_PARAM}=1`);
  }, [closed, code, router]);

  const ack = useCallback(
    (key: string, value: string) => {
      setAcks((prev) => {
        const next = { ...prev, [key]: value };
        writeAcks(code, next);
        return next;
      });
    },
    [code]
  );
  const ackQuotes = useCallback(
    (seq: number) => ack('quotes', String(seq)),
    [ack]
  );

  if (!token) {
    return (
      <div className="flex w-full flex-col items-center gap-4">
        <CareerMpLobby code={code} onJoined={() => undefined} />
      </div>
    );
  }
  if (error && (!view || fatal)) {
    const key = roomErrorCode(error);
    return (
      <div className="flex w-full flex-col items-center gap-4 rounded-3xl border border-red-500/30 bg-slate-950/70 p-6 text-center">
        <p className="text-sm font-semibold text-red-200">
          {roomErrorText(key)}
        </p>
        {key === 'unauthorized' && (
          <button
            onClick={() => clearToken(code)}
            className="rounded-xl border border-sky-200/20 bg-slate-800/60 px-5 py-2 text-xs font-semibold text-slate-200 transition hover:border-sky-200/45 hover:text-white"
          >
            {MP.lobby.join}
          </button>
        )}
        <Link
          href={RIVALS_PATH}
          className="text-xs text-slate-400 underline-offset-2 hover:underline"
        >
          {MP.lobby.title}
        </Link>
      </div>
    );
  }
  if (!view || isLoading) {
    return (
      <div className="flex w-full items-center justify-center rounded-3xl border border-frost-border/40 bg-slate-950/70 p-10">
        <span className="animate-pulse text-[10px] font-bold uppercase tracking-[0.35em] text-sky-300">
          {MP.lobby.sending}
        </span>
      </div>
    );
  }

  if (view.status === 'closed') {
    return (
      <div className="flex w-full items-center justify-center rounded-3xl border border-frost-border/40 bg-slate-950/70 p-10">
        <span className="animate-pulse text-[10px] font-bold uppercase tracking-[0.35em] text-sky-300">
          {MP.lobby.sending}
        </span>
      </div>
    );
  }

  if (view.status === 'lobby') {
    return (
      <CoachColorsContext.Provider value={coaches}>
        <RoomLobby
          view={view}
          characters={characters}
          token={token}
          busy={sending}
          send={actWithError}
        />
      </CoachColorsContext.Provider>
    );
  }

  const career = view.career;
  const me = view.coaches.find((c) => c.id === view.coachId);
  const playerCharacter = career
    ? characterBySlug.get(career.playerSlug)
    : null;
  if (!career || !playerCharacter || !me) return null;
  const playerSponsorId =
    career.characters[career.playerSlug]?.sponsor?.sponsorId ?? null;
  // One issue, one reel: the paper's own year and season name it
  const issueKey = career.lastIssue
    ? `${career.lastIssue.year}-${career.lastIssue.season}`
    : '';
  const humanSet = new Set(Object.keys(coaches));
  const tableRanks =
    career.phase === 'cup'
      ? (career.cupStartRanks ?? career.lastCupRanks)
      : career.lastCupRanks;
  const placeOf = (slug: string) =>
    rankBySeeding(career.characters, humanSet).indexOf(slug) + 1;

  // The special issue that opens the league, once per browser
  const expansionPending =
    view.phase.kind === 'window' &&
    career.year === 1 &&
    career.season === 0 &&
    acks.expansion !== view.code;
  // The window's opening scenes, once per window on this browser
  const intro =
    !expansionPending &&
    view.phase.kind === 'window' &&
    view.windowIntro &&
    acks.intro !== view.windowIntro.key &&
    view.windowIntro.receipts.length > 0
      ? view.windowIntro
      : null;
  const introReceipt = intro
    ? intro.receipts[Math.min(introStep, intro.receipts.length - 1)]
    : null;
  const nextIntro = () => {
    if (!intro) return;
    if (introStep + 1 >= intro.receipts.length) {
      ack('intro', intro.key);
      setIntroStep(0);
    } else {
      setIntroStep(introStep + 1);
    }
  };
  const electionPending =
    view.phase.kind === 'window' &&
    view.lastElection !== null &&
    view.lastElection.year === career.year - 1 &&
    career.season === 0 &&
    acks.election !== String(view.lastElection.year);
  // The count opens by itself once the window's own scenes are through,
  // exactly as the button would open it
  const electionAutoYear =
    electionPending && !expansionPending && intro === null
      ? (view.lastElection?.year ?? null)
      : null;
  if (electionAutoYear !== null && electionAutoYear !== electionAutoOpened) {
    setElectionAutoOpened(electionAutoYear);
    setElectionOpen(true);
  }
  const rivalPending = (career.rivalChoice?.length ?? 0) > 0;

  const errorCode = lastError ? roomErrorCode(lastError) : null;
  const errorText =
    errorCode && errorCode !== 'stale' ? roomErrorText(errorCode) : null;

  const calendarLabel = `${
    view.phase.kind === 'window'
      ? (CAREER.offseason.months[career.season]?.[
          Math.min(career.slotsUsed, 2)
        ] ?? seasonName(career.season))
      : seasonName(career.season)
  } · ${fmt(CAREER.hud.year, { year: career.year })}`;

  const topBar = (
    <div className="flex w-full flex-wrap items-center gap-2">
      <button
        onClick={() => setShowCalendar(true)}
        title={CAREER.actions.calendar}
        className="inline-flex items-center gap-1.5 rounded-full border border-sky-200/15 bg-slate-950/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-200 backdrop-blur-sm transition hover:border-sky-200/40"
      >
        <ActionIcon kind="calendar" className="h-3.5 w-3.5 text-sky-300" />
        {calendarLabel}
      </button>
      <button
        onClick={() => setDossierSlug(career.playerSlug)}
        title={CAREER.meters.title}
        className="inline-flex items-center gap-1.5 rounded-full border border-sky-200/15 bg-slate-950/70 py-1 pl-1.5 pr-1.5 text-[10px] font-bold uppercase tracking-widest text-sky-300 backdrop-blur-sm transition hover:border-sky-200/40 hover:text-white sm:pr-3"
      >
        <PortraitHead character={playerCharacter} className="h-4 w-4" />
        <span className="hidden sm:inline">
          {fmt(CAREER.hud.coach, { name: playerCharacter.name })}
        </span>
      </button>
      <CareerWalletChip balance={career.balance} />
      <button
        onClick={() => setShowTable(true)}
        title={CAREER.table.title}
        className="rounded-full border border-sky-200/15 bg-slate-950/70 p-2 text-sky-300 backdrop-blur-sm transition hover:border-sky-200/40 hover:text-white"
      >
        <ActionIcon kind="table" className="h-3.5 w-3.5" />
      </button>
      <span className="ml-auto flex items-center gap-2">
        <button
          onClick={() => setShowLink(true)}
          title={MP.coachBar.link}
          className="rounded-full border border-sky-200/15 bg-slate-900/70 px-2.5 py-1.5 font-mono text-[10px] font-bold tracking-[0.2em] text-slate-300 backdrop-blur-sm transition hover:border-sky-200/40 hover:text-white"
        >
          {view.code}
        </button>
        <FullscreenButton targetRef={cardRef} />
        <GearButton onClick={() => setShowSettings(true)} />
      </span>
    </div>
  );

  const coachBar = (
    <div className="pointer-events-none absolute inset-x-2 bottom-2 z-40 flex justify-center">
      <div className="pointer-events-auto">
        <CoachBar
          view={view}
          serverOffset={serverOffset}
          busy={sending}
          onDone={(done) => actWithError({ type: 'setDone', done })}
        />
      </div>
    </div>
  );

  const stage = (children: React.ReactNode) => (
    <div className="relative w-full">
      <SeasonStage season={career.season} topBar={topBar}>
        <div className="flex w-full flex-col items-center gap-4 pb-12">
          {children}
        </div>
      </SeasonStage>
      {coachBar}
    </div>
  );

  return (
    <CoachColorsContext.Provider value={coaches}>
      <div
        ref={cardRef}
        className="group relative w-full overflow-hidden rounded-3xl border border-frost-border/40 bg-gradient-to-br from-card-strong/60 via-card-deep/80 to-card-strong/60 shadow-2xl [&:fullscreen]:flex [&:fullscreen]:flex-col [&:fullscreen]:overflow-y-auto [&:fullscreen]:rounded-none [&:fullscreen]:border-0 [&:fullscreen]:bg-background"
      >
        <div className="relative z-10 flex flex-col items-center text-center">
          {showSettings && (
            <GameSettingsModal
              sponsorId={playerSponsorId}
              achievementGame="manager"
              broadcastToggles={['commentator', 'cutscenes']}
              onClose={() => setShowSettings(false)}
            />
          )}
          {showLink && (
            <SponsorModal
              sponsorId={playerSponsorId}
              title={fmt(MP.room.title, { code: view.code })}
              onClose={() => setShowLink(false)}
            >
              <div className="flex w-full flex-col gap-4">
                <p className="text-[11px] text-slate-400">{MP.room.hint}</p>
                <RejoinLinkCard code={view.code} token={token} />
                {view.hostCoachId === view.coachId && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-400/15 bg-slate-950/70 p-3">
                    <span className="text-[11px] text-slate-400">
                      {MP.close.hint}
                    </span>
                    <CloseRoomButton
                      busy={sending}
                      onClose={() => {
                        setShowLink(false);
                        actWithError({ type: 'closeRoom' });
                      }}
                    />
                  </div>
                )}
              </div>
            </SponsorModal>
          )}
          {showCalendar && (
            <SponsorModal
              sponsorId={playerSponsorId}
              title={CAREER.actions.calendar}
              wide
              onClose={() => setShowCalendar(false)}
            >
              <YearCalendar career={career} />
            </SponsorModal>
          )}
          {showTable && (
            <SponsorModal
              sponsorId={playerSponsorId}
              title={CAREER.table.title}
              wide
              headerExtra={
                <span className="flex flex-col items-end text-right">
                  <span className="truncate text-[9px] font-bold uppercase tracking-widest text-amber-300">
                    {plural(CAREER.table.goal, OVERLORD_POINTS, { points: OVERLORD_POINTS })}
                  </span>
                  <span className="truncate text-[9px] font-semibold text-slate-400">
                    {plural(CAREER.table.goalProgress, OVERLORD_POINTS, {
                      points: careerPoints(
                        career.characters[career.playerSlug]
                      ),
                      goal: OVERLORD_POINTS,
                      place: ordinal(placeOf(career.playerSlug)),
                    })}
                  </span>
                </span>
              }
              onClose={() => setShowTable(false)}
            >
              <CareerTable
                characters={career.characters}
                characterBySlug={characterBySlug}
                playerSlug={career.playerSlug}
                lastCupRanks={tableRanks}
                rivalSlug={career.rivalSlug}
                onSelect={setDossierSlug}
                coaches={coaches}
              />
            </SponsorModal>
          )}
          {dossierSlug &&
            career.characters[dossierSlug] &&
            characterBySlug.get(dossierSlug) && (
              <SponsorModal
                sponsorId={playerSponsorId}
                title={
                  dossierSlug === career.playerSlug
                    ? CAREER.meters.title
                    : CAREER.dossier.title
                }
                onClose={() => setDossierSlug(null)}
              >
                <CharacterDossier
                  character={characterBySlug.get(dossierSlug) as DuelCharacter}
                  state={career.characters[dossierSlug]}
                  place={placeOf(dossierSlug)}
                  reveal={scoutReveal(
                    career.characters[career.playerSlug],
                    dossierSlug === career.playerSlug
                  )}
                  scoutLevel={scoutLevel(career.characters[career.playerSlug])}
                  isPlayer={dossierSlug === career.playerSlug}
                  isRival={dossierSlug === career.rivalSlug}
                  year={career.year}
                  onSponsorInfo={
                    dossierSlug === career.playerSlug
                      ? () => setDossierInfo('sponsors')
                      : undefined
                  }
                  onMetersInfo={
                    dossierSlug === career.playerSlug
                      ? () => setDossierInfo('meters')
                      : undefined
                  }
                  coach={coaches[dossierSlug]}
                />
              </SponsorModal>
            )}
          {dossierInfo === 'sponsors' && (
            <SponsorModal
              sponsorId={playerSponsorId}
              title={CAREER.sponsors.infoTitle}
              onClose={() => setDossierInfo(null)}
            >
              <SponsorInfoPanel />
            </SponsorModal>
          )}
          {dossierInfo === 'meters' && (
            <SponsorModal
              sponsorId={playerSponsorId}
              title={CAREER.meters.infoTitle}
              onClose={() => setDossierInfo(null)}
            >
              <MetersInfoPanel />
            </SponsorModal>
          )}
          {expansionPending && (
            <ExpansionIntro
              coaches={view.coaches}
              characterBySlug={characterBySlug}
              onDone={() => ack('expansion', view.code)}
            />
          )}
          {introReceipt &&
            (introReceipt.scene ? (
              <ActionCutscene
                key={`intro-${intro?.key}-${introStep}`}
                scene={introReceipt.scene}
                outcome={
                  introReceipt.outcome ?? (introReceipt.ok ? 'good' : 'bad')
                }
                toast={receiptToToast(introReceipt)}
                character={playerCharacter}
                season={career.season}
                onClose={nextIntro}
              />
            ) : (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3">
                  <span className="text-[9px] font-bold uppercase tracking-[0.35em] text-sky-300">
                    {MP.window.introTitle}
                  </span>
                  <ActionReceipt
                    toast={receiptToToast(introReceipt)}
                    onDismiss={nextIntro}
                  />
                </div>
              </div>
            ))}

          {electionOpen && view.lastElection && (
            <ElectionNightCutscene
              result={view.lastElection.result}
              playerSponsor={playerSponsorId}
              onClose={() => {
                setElectionOpen(false);
                ack('election', String(view.lastElection?.year ?? ''));
              }}
            />
          )}
          {rivalOpen && rivalPending && (
            <RivalPickDialog
              candidates={career.rivalChoice ?? []}
              characterBySlug={characterBySlug}
              playerSlug={career.playerSlug}
              onChoose={(slug) => {
                setRivalOpen(false);
                actWithError({ type: 'chooseRival', slug });
              }}
            />
          )}
          <RoomQuoteCues
            view={view}
            serverOffset={serverOffset}
            characterBySlug={characterBySlug}
            waiting={
              expansionPending ||
              intro !== null ||
              electionOpen ||
              (view.phase.kind === 'paper' && acks.hitReel !== issueKey)
            }
            ackedSeq={Number(acks.quotes ?? 0)}
            onAck={ackQuotes}
          />

          {view.phase.kind === 'window' && (
            <div className="relative w-full">
              <OffseasonScreen
                career={career}
                characters={characters}
                topBar={topBar}
                toast={toast}
                cutscene={cutscene}
                onCloseCutscene={() => setCutscene(null)}
                onOpenTable={() => setShowTable(true)}
                onOpenDossier={() => setDossierSlug(career.playerSlug)}
                pendingElection={electionPending}
                pendingRival={!electionPending && rivalPending}
                onOpenElection={() => setElectionOpen(true)}
                onOpenRival={() => setRivalOpen(true)}
                onTrain={(id) => void act({ type: 'train', trainingId: id })}
                onRest={(fasting) => void act({ type: 'rest', fasting })}
                onMedia={(kind) => void act({ type: 'media', kind })}
                onIsland={() => void act({ type: 'island' })}
                onGuard={(steps) => void act({ type: 'guard', steps })}
                onInvest={(id) =>
                  void act({ type: 'invest', investmentId: id })
                }
                onSabotage={(targetSlug, tier, boostSteps) =>
                  void act({ type: 'sabotage', targetSlug, tier, boostSteps })
                }
                onOpenNews={() => undefined}
                onToCup={() => undefined}
                onDismissToast={() => setToast(null)}
                onMarkMailRead={(id) =>
                  void act({ type: 'readMail', mailId: id })
                }
                onMarkAllMailRead={() => void act({ type: 'readAllMail' })}
                onAcceptSponsor={(mailId, sponsorId) =>
                  void act({ type: 'acceptSponsor', mailId, sponsorId })
                }
                onDonate={(mailId, amount, sponsorId) =>
                  void act({ type: 'donate', mailId, amount, sponsorId })
                }
                hideCupGate
                coaches={coaches}
              />
              {coachBar}
            </div>
          )}

          {view.phase.kind === 'paper' &&
            career.lastIssue &&
            stage(
              <>
                <NewspaperSpread
                  news={career.lastIssue.news}
                  season={career.lastIssue.season}
                  year={career.lastIssue.year}
                  characterBySlug={characterBySlug}
                  cta={me.done ? MP.coachBar.undoDone : MP.coachBar.doneToggle}
                  onDone={() =>
                    actWithError({ type: 'setDone', done: !me.done })
                  }
                  coaches={coaches}
                />
                {acks.hitReel !== issueKey && (
                  <SabotageHitReel
                    news={career.lastIssue.news}
                    slug={career.playerSlug}
                    character={playerCharacter}
                    season={career.season}
                    onDone={() => ack('hitReel', issueKey)}
                  />
                )}
              </>
            )}

          {view.phase.kind === 'cup-pre' &&
            stage(
              <RoundBoard
                view={view}
                characterBySlug={characterBySlug}
                coaches={coaches}
                busy={sending}
                send={actWithError}
              />
            )}

          {view.phase.kind === 'match-bets' &&
            stage(
              <PreMatchBets
                view={view}
                characterBySlug={characterBySlug}
                coaches={coaches}
                busy={sending}
                serverOffset={serverOffset}
                send={actWithError}
              />
            )}

          {view.phase.kind === 'match-clip' &&
            stage(
              <SyncedMatchStage
                view={view}
                characterBySlug={characterBySlug}
                coaches={coaches}
                serverOffset={serverOffset}
                send={actWithError}
              />
            )}

          {view.phase.kind === 'season-end' &&
            stage(
              <SeasonEndFlow
                view={view}
                characterBySlug={characterBySlug}
                coaches={coaches}
                onOpenDossier={setDossierSlug}
                onDone={() => actWithError({ type: 'setDone', done: true })}
              />
            )}

          {view.phase.kind === 'finished' &&
            view.report &&
            stage(
              <FinalReport
                report={view.report}
                characterBySlug={characterBySlug}
                career={career}
                coaches={coaches}
              >
                <ReopenVote
                  view={view}
                  onVote={(on) => actWithError({ type: 'voteReopen', on })}
                />
              </FinalReport>
            )}

          {errorText && (
            <div className="fixed bottom-4 left-4 z-50 rounded-xl border border-red-500/50 bg-red-950/90 px-3.5 py-2.5 text-xs font-semibold text-red-200">
              {errorText}
            </div>
          )}
          {view.phase.kind !== 'window' && toast && (
            <div className="fixed bottom-4 right-4 z-50">
              <ActionReceipt toast={toast} onDismiss={() => setToast(null)} />
            </div>
          )}
          {view.phase.kind !== 'window' && cutscene && (
            <ActionCutscene
              key={cutscene.key}
              scene={cutscene.scene}
              outcome={cutscene.outcome}
              toast={cutscene.toast}
              character={playerCharacter}
              season={career.season}
              onClose={() => setCutscene(null)}
            />
          )}
        </div>
      </div>
    </CoachColorsContext.Provider>
  );
}
