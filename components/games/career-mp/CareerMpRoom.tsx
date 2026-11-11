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
import CareerIconButton from '@/components/games/career/CareerIconButton';
import CareerChip from '@/components/games/career/CareerChip';
import CareerButton from '@/components/games/career/CareerButton';
import ActionIcon from '@/components/icons/ActionIcon';
import GameSettingsModal from '@/components/games/GameSettingsModal';
import useAmbientMotion from '@/components/games/useAmbientMotion';
import GearButton from '@/components/games/GearButton';
import PortraitHead from '@/components/games/PortraitHead';
import ActionCutscene, {
  type ActionCutsceneState,
} from '@/components/games/career/ActionCutscene';
import ActionReceipt, {
  type ActionReceiptToast,
} from '@/components/games/career/ActionReceipt';
import CareerTable from '@/components/games/career/CareerTable';
import CareerToast from '@/components/games/career/CareerToast';
import BrassPlate from '@/components/games/career/street/BrassPlate';
import PaperSheet from '@/components/games/career/street/PaperSheet';
import StreetBoard from '@/components/games/career/street/StreetBoard';
import CareerWalletChip from '@/components/games/career/CareerWalletChip';
import CharacterDossier from '@/components/games/career/CharacterDossier';
import ElectionNightCutscene from '@/components/games/career/ElectionNightCutscene';
import QuoteCutscene from '@/components/games/career/QuoteCutscene';
import MetersInfoPanel from '@/components/games/career/MetersInfoPanel';
import NewspaperSpread from '@/components/games/career/NewspaperSpread';
import SabotageHitReel from '@/components/games/career/SabotageHitReel';
import OffseasonScreen from '@/components/games/career/OffseasonScreen';
import SeasonStage from '@/components/games/career/SeasonStage';
import SponsorInfoPanel from '@/components/games/career/SponsorInfoPanel';
import SponsorModal from '@/components/games/career/SponsorModal';
import YearCalendar from '@/components/games/career/YearCalendar';
import { useSeasonMusic } from '@/components/games/career/useSeasonMusic';
import BoardClock from '@/components/games/career-mp/BoardClock';
import CareerMpLobby from '@/components/games/career-mp/CareerMpLobby';
import CoachBar from '@/components/games/career-mp/CoachBar';
import ExpansionIntro from '@/components/games/career-mp/ExpansionIntro';
import type { GlizzyBetTicket } from '@/components/games/career/GlizzflationBetDesk';
import FinalReport from '@/components/games/career-mp/FinalReport';
import PreMatchBets from '@/components/games/career-mp/PreMatchBets';
import ReopenVote from '@/components/games/career-mp/ReopenVote';
import RivalPickDialog from '@/components/games/career-mp/RivalPickDialog';
import LawBallotDialog from '@/components/games/career/LawBallotDialog';
import LawVoteCutscene from '@/components/games/career/LawVoteCutscene';
import RoomLobby from '@/components/games/career-mp/RoomLobby';
import RoomQuoteCues from '@/components/games/career-mp/RoomQuoteCues';
import RoundBoard from '@/components/games/career-mp/RoundBoard';
import SeasonEndFlow from '@/components/games/career-mp/SeasonEndFlow';
import SyncedMatchStage from '@/components/games/career-mp/SyncedMatchStage';
import { useCareerMpView } from '@/components/games/career-mp/useCareerMpView';
import CloseRoomButton from '@/components/games/rooms/CloseRoomButton';
import RejoinLinkCard from '@/components/games/rooms/RejoinLinkCard';
import { SeatColorsContext } from '@/components/games/rooms/seatColors';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import { TOKEN_STORAGE_PREFIX } from '@/lib/constants/careerMp';
import { ROOM_CLOSED_PARAM } from '@/lib/constants/rooms';
import { RIVALS_PATH, rivalsRoomPath } from '@/lib/constants/routes';
import {
  clearToken,
  readToken,
  storeToken,
  subscribeToken,
} from '@/lib/queries/careerMp';
import type { CoachTagMap, Receipt, RoomAction } from '@/lib/types/careerMp';
import type { QuotePlayback } from '@/lib/utils/quoteCutsceneTriggers';
import {
  isConstitutionCard,
  pickedCard,
  primeMinister,
} from '@/lib/utils/careerLaws';
import { leagueCharacters } from '@/lib/utils/duelCharacters';
import {
  careerPoints,
  overlordGoal,
  rankBySeeding,
} from '@/lib/utils/careerPoints';
import { receiptLines } from '@/lib/utils/careerReceipt';
import { achievementStore } from '@/lib/utils/achievements';
import { careerAchievementsUnlocked } from '@/lib/utils/careerAchievements';
import type { SavedCareer } from '@/lib/utils/careerSave';
import { scoutLevel, scoutReveal } from '@/lib/utils/careerScouting';
import {
  adoptGameFullscreen,
  queueGameFullscreen,
} from '@/lib/utils/fullscreen';
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

export default function CareerMpRoom({ code }: { code: string }) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  // Undefined until the browser has read its storage: the server cannot know
  // the seat, and the join form must not flash at a coach who already has one
  const token = useSyncExternalStore<string | null | undefined>(
    subscribeToken,
    () => readToken(code),
    () => undefined
  );
  useEffect(() => {
    const fromHash = tokenFromHash();
    if (!fromHash) return;
    storeToken(code, fromHash);
    window.history.replaceState(null, '', window.location.pathname);
  }, [code]);
  // Entering the room is the start: the game card only mounts once the
  // league runs, so the expanded view waits for it
  useEffect(() => {
    queueGameFullscreen({ fresh: true });
  }, [code]);
  useEffect(() => {
    adoptGameFullscreen(cardRef.current);
  });
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
  } = useCareerMpView(code, token ?? null);
  const [toast, setToast] = useState<ActionReceiptToast | null>(null);
  const [cutscene, setCutscene] = useState<ActionCutsceneState | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLink, setShowLink] = useState(false);
  // The issue that opened the league, read again from the kiosk
  const [expansionReread, setExpansionReread] = useState(false);
  const [dossierSlug, setDossierSlug] = useState<string | null>(null);
  const [dossierInfo, setDossierInfo] = useState<
    'sponsors' | 'meters' | null
  >(null);
  const [electionOpen, setElectionOpen] = useState(false);
  // The night's stories air once the count closes on this screen
  const [electionScenes, setElectionScenes] = useState<QuotePlayback[]>([]);
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
  const [introScenesSeen, setIntroScenesSeen] = useState<string | null>(null);
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

  // The room's league is generated, so its names are registered here, before
  // any screen below asks for one by slug
  const roster = view?.roster;
  const characters = useMemo(() => leagueCharacters(roster ?? []), [roster]);
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

  const ambientMotion = useAmbientMotion();
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
    router.replace(`${RIVALS_PATH}?${ROOM_CLOSED_PARAM}=1`);
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

  if (token === null) {
    return (
      <div className="flex w-full flex-col items-center gap-4">
        <CareerMpLobby code={code} onJoined={() => undefined} />
      </div>
    );
  }
  if (error && (!view || fatal)) {
    const key = roomErrorCode(error);
    return (
      <StreetBoard className="w-full">
        <div className="flex flex-col items-center gap-3 rounded-[4px] p-4 text-center">
          <PaperSheet className="w-full max-w-md rotate-[-0.4deg] px-4 py-3 font-serif text-[15px] font-semibold text-red-300">
            {roomErrorText(key)}
          </PaperSheet>
          {key === 'unauthorized' && (
            <CareerButton
              onClick={() => clearToken(code)}
              className="min-h-11"
            >
              {MP.lobby.join}
            </CareerButton>
          )}
          <Link
            href={RIVALS_PATH}
            className="inline-flex min-h-11 items-center font-sign text-[15px] font-semibold uppercase tracking-[0.06em] text-slate-300 underline-offset-4 hover:underline"
          >
            {MP.lobby.title}
          </Link>
        </div>
      </StreetBoard>
    );
  }
  if (token === undefined || !view || isLoading || view.status === 'closed') {
    return (
      <StreetBoard className="flex w-full items-center justify-center p-10">
        <BrassPlate className="motion-safe:animate-pulse">
          {MP.lobby.sending}
        </BrassPlate>
      </StreetBoard>
    );
  }

  if (view.status === 'lobby') {
    return (
      <SeatColorsContext.Provider value={coaches}>
        <RoomLobby
          view={view}
          characters={characters}
          busy={sending}
          send={actWithError}
        />
      </SeatColorsContext.Provider>
    );
  }

  const career = view.career;
  const me = view.coaches.find((c) => c.id === view.coachId);
  const playerCharacter = career
    ? characterBySlug.get(career.playerSlug)
    : null;
  if (!career || !playerCharacter || !me) return null;
  const otherGlizzyBets: GlizzyBetTicket[] = view.coaches
    .filter((c) => c.id !== me.id && c.slug)
    .map((c) => ({
      coachId: c.id,
      name: c.name,
      color: c.color,
      slug: c.slug as string,
      bet: c.glizzyBet ?? null,
      last: c.lastGlizzyBet ?? null,
    }));
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
  // The partner vote holds the room on the election night broadcast
  const coalitionPhase = view.phase.kind === 'coalition';
  // The window's opening scenes, once per window on this browser, after the
  // broadcast when the count is still on screen from the vote
  const intro =
    !expansionPending &&
    !electionOpen &&
    view.phase.kind === 'window' &&
    view.windowIntro &&
    acks.intro !== view.windowIntro.key &&
    (view.windowIntro.receipts.length > 0 ||
      (view.windowIntro.scenes?.length ?? 0) > 0)
      ? view.windowIntro
      : null;
  // The Yellow Party's car opens the window before any receipt
  const introScenes =
    intro && (intro.scenes?.length ?? 0) > 0 && introScenesSeen !== intro.key
      ? (intro.scenes ?? [])
      : null;
  const introReceipt =
    intro && !introScenes && intro.receipts.length > 0
      ? intro.receipts[Math.min(introStep, intro.receipts.length - 1)]
      : null;
  const finishIntroScenes = () => {
    if (!intro) return;
    setIntroScenesSeen(intro.key);
    if (intro.receipts.length === 0) ack('intro', intro.key);
  };
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
    (electionPending || coalitionPhase) && !expansionPending && intro === null
      ? (view.lastElection?.year ?? null)
      : null;
  if (electionAutoYear !== null && electionAutoYear !== electionAutoOpened) {
    setElectionAutoOpened(electionAutoYear);
    setElectionOpen(true);
  }
  const rivalPending = (career.rivalChoice?.length ?? 0) > 0;
  // The law vote holds the room on its ballot; once it closes, the verdict
  // shows once on this browser when the window opens, or over the report
  // when the vote was one-party rule
  const lawsPhase = view.phase.kind === 'laws';
  const lastLawVote = career.parliament?.lawVotes?.at(-1) ?? null;
  const lawVoteKey = lastLawVote
    ? `${lastLawVote.year}-${lastLawVote.season}`
    : '';
  const constitutionVote =
    lastLawVote?.outcome === 'passed' &&
    isConstitutionCard(pickedCard(lastLawVote));
  const lawBallotShown = lawsPhase
    ? (career.parliament?.lawBallot ?? null)
    : ((view.phase.kind === 'window' && !expansionPending) ||
          (view.phase.kind === 'finished' && constitutionVote)) &&
        lastLawVote?.year === career.year &&
        acks.laws !== lawVoteKey
      ? lastLawVote
      : null;

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
      <CareerChip
        onClick={() => setShowCalendar(true)}
        title={CAREER.actions.calendar}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 uppercase"
      >
        <ActionIcon kind="calendar" className="h-3.5 w-3.5" />
        {calendarLabel}
      </CareerChip>
      <CareerChip
        onClick={() => setDossierSlug(career.playerSlug)}
        title={CAREER.meters.title}
        className="inline-flex items-center gap-1.5 py-1 pl-1.5 pr-1.5 uppercase sm:pr-3"
      >
        <PortraitHead character={playerCharacter} className="h-4 w-4" />
        <span className="hidden sm:inline">
          {fmt(CAREER.hud.coach, { name: playerCharacter.name })}
        </span>
      </CareerChip>
      <CareerWalletChip balance={career.balance} />
      <CareerIconButton
        label={CAREER.table.title}
        onClick={() => setShowTable(true)}
      >
        <ActionIcon kind="table" className="h-3.5 w-3.5" />
      </CareerIconButton>
      <span className="ml-auto flex items-center gap-2">
        <CareerChip
          onClick={() => setShowLink(true)}
          title={MP.coachBar.link}
          className="px-2.5 py-1.5 tabular-nums"
        >
          {view.code}
        </CareerChip>
        <GearButton onClick={() => setShowSettings(true)} />
      </span>
    </div>
  );

  const coachBar = (
    <div className="pointer-events-none sticky bottom-0 z-40 h-0">
      <div className="absolute inset-x-2 bottom-2 flex justify-center">
        <div className="pointer-events-auto">
          <CoachBar
            view={view}
            serverOffset={serverOffset}
            busy={sending}
            onDone={(done) => actWithError({ type: 'setDone', done })}
          />
        </div>
      </div>
    </div>
  );

  const stage = (children: React.ReactNode) => (
    <div className="relative w-full">
      <SeasonStage season={career.season} topBar={topBar}>
        <div
          className={`flex w-full flex-col items-center gap-4 pt-2 sm:pt-0 ${
            view.phase.kind === 'match-clip' ? '' : 'pb-12'
          }`}
        >
          {children}
        </div>
      </SeasonStage>
      {coachBar}
    </div>
  );

  return (
    <SeatColorsContext.Provider value={coaches}>
      <div
        ref={cardRef}
        data-motion={ambientMotion ? 'full' : 'lite'}
        className="group relative w-full overflow-clip rounded-[9px] bg-[#0b1120] shadow-[0_0_0_1px_#160c05,0_26px_50px_-14px_rgb(0_0_0/0.9)] fullscreen:flex fullscreen:flex-col fullscreen:overflow-y-auto fullscreen:rounded-none fullscreen:border-0 fullscreen:bg-background fullscreen:fixed fullscreen:inset-0 fullscreen:z-[80] fullscreen:h-[calc(100dvh/var(--game-zoom,1))] fullscreen:overscroll-contain"
      >
        {/* Raised while an overlay is open, or the site's sticky header covers its sign */}
        <div className="relative z-10 flex flex-col items-center text-center has-[.fixed]:z-[60]">
          {showSettings && (
            <GameSettingsModal
              fullscreenTarget={cardRef}
              sponsorId={playerSponsorId}
              achievementGame="manager"
              broadcastToggles={['commentator', 'cutscenes']}
              townDisplay
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
                <RejoinLinkCard
                  roomPath={rivalsRoomPath(view.code)}
                  token={token}
                />
                {view.hostCoachId === view.coachId && (
                  <div className="flex justify-end">
                    <CloseRoomButton
                      confirm={MP.close.confirm}
                      hint={MP.close.hint}
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
                  <span className="truncate font-sign text-[12px] font-bold uppercase tracking-[0.06em] text-[#fcd34d]">
                    {plural(CAREER.table.goal, overlordGoal(career), {
                      points: overlordGoal(career),
                    })}
                  </span>
                  <span className="truncate font-sign text-[12px] font-semibold tabular-nums text-slate-300">
                    {plural(CAREER.table.goalProgress, overlordGoal(career), {
                      points: careerPoints(
                        career.characters[career.playerSlug]
                      ),
                      goal: overlordGoal(career),
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
                primeMinisterSlug={primeMinister(career)}
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
                  isPrimeMinister={dossierSlug === primeMinister(career)}
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
          {(expansionPending || expansionReread) && (
            <ExpansionIntro
              coaches={view.coaches}
              characterBySlug={characterBySlug}
              points={overlordGoal(career)}
              onDone={() =>
                expansionPending
                  ? ack('expansion', view.code)
                  : setExpansionReread(false)
              }
            />
          )}
          {introScenes && (
            <QuoteCutscene
              queue={introScenes}
              characterBySlug={characterBySlug}
              onDone={finishIntroScenes}
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
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#060912]/75 p-4">
                <div className="flex flex-col items-center gap-3">
                  <BrassPlate>{MP.window.introTitle}</BrassPlate>
                  <ActionReceipt
                    toast={receiptToToast(introReceipt)}
                    onDismiss={nextIntro}
                  />
                </div>
              </div>
            ))}

          {(electionOpen || coalitionPhase) && view.lastElection && (
            <ElectionNightCutscene
              result={view.lastElection.result}
              premier={view.lastElection.premier ?? null}
              playerSponsor={playerSponsorId}
              playerSlug={career.playerSlug}
              characterBySlug={characterBySlug}
              onVote={(key) => actWithError({ type: 'voteCoalition', key })}
              deadline={
                view.phase.kind === 'coalition' ? view.phase.deadline : null
              }
              serverOffset={serverOffset}
              onClose={() => {
                if (coalitionPhase) return;
                setElectionOpen(false);
                if (
                  view.lastElection &&
                  acks.election !== String(view.lastElection.year)
                ) {
                  setElectionScenes(view.lastElection.scenes ?? []);
                }
                ack('election', String(view.lastElection?.year ?? ''));
              }}
            />
          )}
          {lawBallotShown &&
            career.parliament &&
            (lawBallotShown.outcome === null ? (
              <LawBallotDialog
                ballot={lawBallotShown}
                playerSlug={career.playerSlug}
                characterBySlug={characterBySlug}
                laws={career.parliament.laws ?? []}
                deadline={
                  view.phase.kind === 'laws' ? view.phase.deadline : null
                }
                serverOffset={serverOffset}
                onPick={(index) => actWithError({ type: 'pickLaw', index })}
                onVote={(vote) => actWithError({ type: 'voteLaw', vote })}
              />
            ) : (
              <LawVoteCutscene
                key={lawVoteKey}
                ballot={lawBallotShown}
                seats={career.parliament.seats}
                characterBySlug={characterBySlug}
                viewerSlug={career.playerSlug}
                onClose={() => ack('laws', lawVoteKey)}
              />
            ))}
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
          {electionScenes.length > 0 && (
            <QuoteCutscene
              queue={electionScenes}
              characterBySlug={characterBySlug}
              onDone={() => setElectionScenes([])}
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
              electionScenes.length > 0 ||
              coalitionPhase ||
              lawBallotShown !== null ||
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
                onBorrow={(amount) => void act({ type: 'borrow', amount })}
                onRepay={(amount) => void act({ type: 'repay', amount })}
                onGlizzyBet={(call, stake) =>
                  void act({ type: 'glizzyBet', call, stake })
                }
                onCancelGlizzyBet={() => void act({ type: 'cancelGlizzyBet' })}
                otherGlizzyBets={otherGlizzyBets}
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
                extraPapers={
                  career.year === 1 && career.season === 0
                    ? [
                        {
                          key: 'expansion',
                          title: MP.expansion.masthead,
                          sub: MP.expansion.issue,
                          season: career.season,
                          headline: MP.expansion.headline,
                          unread: false,
                          onOpen: () => setExpansionReread(true),
                        },
                      ]
                    : []
                }
                coaches={coaches}
                room={{ coaches: view.coaches, coachId: view.coachId }}
                gate={
                  <CoachBar
                    view={view}
                    serverOffset={serverOffset}
                    busy={sending}
                    onDone={(done) => actWithError({ type: 'setDone', done })}
                  />
                }
              />
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

          {coalitionPhase && stage(null)}
          {lawsPhase && stage(null)}

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

          {'deadline' in view.phase &&
            !coalitionPhase &&
            !lawsPhase && (
              <BoardClock
                deadline={view.phase.deadline}
                serverOffset={serverOffset}
              />
            )}
          {errorText && (
            <div className="fixed bottom-20 left-4 z-50">
              <CareerToast tone="danger">{errorText}</CareerToast>
            </div>
          )}
          {view.phase.kind !== 'window' && toast && (
            <div className="fixed bottom-20 right-4 z-50">
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
    </SeatColorsContext.Provider>
  );
}
