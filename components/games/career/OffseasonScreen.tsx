import { useRef, useState } from 'react';
import type { ActionReceiptToast } from '@/components/games/career/ActionReceipt';
import ActionCutscene, {
  type ActionCutsceneState,
} from '@/components/games/career/ActionCutscene';
import CareerMailbox from '@/components/games/career/CareerMailbox';
import GlizacijaPanel from '@/components/games/career/GlizacijaPanel';
import type { GlizzyBetTicket } from '@/components/games/career/GlizzflationBetDesk';
import type { GlizzyCall } from '@/data/games/careerGlizzflationBets';
import GuardDialog from '@/components/games/career/GuardDialog';
import GovernmentEffectsInfoPanel from '@/components/games/career/GovernmentEffectsInfoPanel';
import InfoButton from '@/components/games/career/InfoButton';
import MetersInfoPanel from '@/components/games/career/MetersInfoPanel';
import InvestmentCard from '@/components/games/career/InvestmentCard';
import NewspaperSpread, {
  headlineText,
} from '@/components/games/career/NewspaperSpread';
import SabotageDialog from '@/components/games/career/SabotageDialog';
import SponsorModal from '@/components/games/career/SponsorModal';
import ParliamentPanel, {
  type ParliamentTab,
} from '@/components/games/career/ParliamentPanel';
import {
  campaignLetterOpen,
  greenWeekendEveryWindow,
  parliamentOpen,
  sabotageTaxScale,
  redLeadMedia,
  redLeadTrainingScale,
  redMediaMultiplier,
} from '@/lib/utils/careerElections';
import TrainingCard from '@/components/games/career/TrainingCard';
import TownBankOffice from '@/components/games/career/town/TownBankOffice';
import TownBankPanel from '@/components/games/career/town/TownBankPanel';
import TownLeagueStats from '@/components/games/career/town/TownLeagueStats';
import TownMediaStudio from '@/components/games/career/town/TownMediaStudio';
import TownMediaTape from '@/components/games/career/town/TownMediaTape';
import TownKioskChooser, {
  type TownKioskPaper,
} from '@/components/games/career/town/TownKioskChooser';
import TownDockChooser from '@/components/games/career/town/TownDockChooser';
import TownHomeFridge from '@/components/games/career/town/TownHomeFridge';
import TownTrainingBoard from '@/components/games/career/town/TownTrainingBoard';
import TownHub, {
  type TownBuildingState,
  type TownRoom,
} from '@/components/games/career/town/TownHub';
import { useMoodAmbience } from '@/components/games/career/useMoodAmbience';
import {
  APPETITE_REGROWTH,
  MEDIA_AMBITION_GAIN,
  MEDIA_EGO_GAIN,
  MEDIA_SCANDAL_EGO_GAIN,
  MEDIA_SCANDAL_FAME_SCALE,
  MEDIA_SCANDAL_STRESS,
  MEDIA_STRESS,
  OFFSEASON_SLOTS,
  SCANDAL_BACKFIRE_CHANCE,
  type MediaAppearanceKind,
} from '@/data/games/careerEconomy';
import {
  INVESTMENT_ORDER,
  type InvestmentId,
} from '@/data/games/careerInvestments';
import {
  investmentLevel,
  standingSecurityChance,
} from '@/lib/utils/careerInvestments';
import { mediaFameRange, mediaPay } from '@/lib/utils/careerMeters';
import { debtOf } from '@/lib/utils/careerCredit';
import { careerMoodActivityFor } from '@/lib/utils/careerMood';
import {
  careerPoints,
  rankBySeeding,
  seedingKey,
} from '@/lib/utils/careerPoints';
import {
  guardCost,
  guardMaxChance,
  guardMinSteps,
  guardPositionScale,
  guardPriceScale,
  playerPlotsBooked,
  sabotageRepeatScale,
} from '@/lib/utils/careerSabotage';
import {
  gliziPricePct,
  seasonPricePctFor,
  seasonPriceScale,
} from '@/lib/utils/careerSeasonPrices';
import { greenSabotageScale } from '@/lib/utils/careerSponsors';
import {
  fameStressTaxScale,
  mediaUsesFor,
  overtrainChance,
  TRAINING_DEFS,
  TRAINING_ORDER,
  trainingCost,
  type TrainingId,
} from '@/data/games/careerTraining';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import type {
  SabotageTier,
  SavedCareer,
  SponsorId,
} from '@/lib/utils/careerSave';
import type { CoachTagMap } from '@/lib/types/careerMp';
import type { TownBuildingId } from '@/lib/constants/townLayout';
import type { TownBuildingMode, TownTrip } from '@/lib/types/town';
import { trainingLawScale } from '@/lib/utils/careerLaws';
import { fmt, plural, signedNumber, signedPct } from '@/lib/utils/format';
import { seasonName } from '@/lib/utils/localeNames';
import {
  paperHeadlines,
  townPapers,
  type TownIssue,
} from '@/lib/utils/townPapers';

const OS = GAMES_UI.career.offseason;
const SAB = GAMES_UI.career.sabotage;
const A = GAMES_UI.career.actions;
const M = GAMES_UI.career.meters;
const NP = GAMES_UI.career.newspaper;
const MASTHEAD = GAMES_UI.career.select.masthead;
const MAIL = GAMES_UI.career.mail;
const PARL = GAMES_UI.career.parliament;
const TOWN = GAMES_UI.career.town;

const LEVEL_KEY = {
  stomach: 'livesCap',
  sniffer: 'njuh',
  nutrition: 'nutrition',
  fans: 'fanSkill',
} as const;

type ModalKind =
  | 'paper'
  | 'mail'
  | 'training'
  | 'rest'
  | 'media'
  | 'sabotage'
  | 'guard'
  | 'parliament'
  | 'bank'
  | 'dock'
  | 'kiosk'
  | null;

export default function OffseasonScreen({
  career,
  characters,
  topBar,
  toast,
  cutscene,
  onCloseCutscene,
  onOpenTable,
  onOpenDossier,
  pendingElection,
  pendingRival,
  onOpenElection,
  onOpenRival,
  onTrain,
  onRest,
  onMedia,
  onIsland,
  onGuard,
  onInvest,
  onBorrow,
  onRepay,
  onGlizzyBet,
  onCancelGlizzyBet,
  otherGlizzyBets = [],
  onSabotage,
  onOpenNews,
  onToCup,
  onDismissToast,
  onMarkMailRead,
  onMarkAllMailRead,
  onAcceptSponsor,
  onDonate,
  hideCupGate = false,
  coaches,
  room,
  gate,
  extraPapers = [],
}: {
  career: SavedCareer;
  characters: DuelCharacter[];
  topBar: React.ReactNode;
  toast: ActionReceiptToast | null;
  cutscene: ActionCutsceneState | null;
  onCloseCutscene: () => void;
  onOpenTable: () => void;
  onOpenDossier: () => void;
  // The city's business that has to be settled before the window opens:
  // the election night broadcast, then the new rival
  pendingElection: boolean;
  pendingRival: boolean;
  onOpenElection: () => void;
  onOpenRival: () => void;
  onTrain: (id: TrainingId) => void;
  onRest: (fasting: boolean) => void;
  onMedia: (kind: MediaAppearanceKind) => void;
  onIsland: () => void;
  onGuard: (steps: number) => void;
  onInvest: (id: InvestmentId) => void;
  // The bank's counter, for whoever the Yellow Party lends to
  onBorrow: (amount: number) => void;
  onRepay: (amount: number) => void;
  onGlizzyBet: (call: GlizzyCall, stake: number) => void;
  onCancelGlizzyBet: () => void;
  // The other coaches' tickets in a shared room, open for everyone to read
  otherGlizzyBets?: GlizzyBetTicket[];
  onSabotage: (
    targetSlug: string,
    tier: SabotageTier,
    boostSteps: number,
  ) => void;
  onOpenNews: () => void;
  onToCup: () => void;
  onDismissToast: () => void;
  onMarkMailRead: (id: string) => void;
  onMarkAllMailRead: () => void;
  onAcceptSponsor: (mailId: string, sponsorId: SponsorId) => void;
  onDonate: (mailId: string, amount: number, sponsorId?: SponsorId) => void;
  // A shared room closes the window from its coach bar, not from here
  hideCupGate?: boolean;
  coaches?: CoachTagMap;
  // A shared room: its coaches light the home's windows, and its own gate
  // takes the bottom of the town
  room?: TownRoom;
  gate?: React.ReactNode;
  // Special issues the room keeps on the kiosk's counter besides the league's
  // own papers, such as the issue that opened a shared league
  extraPapers?: TownKioskPaper[];
}) {
  const [modal, setModal] = useState<ModalKind>(null);
  // The kiosk's stats sheet is open; closing the panel folds it again
  const [kioskStats, setKioskStats] = useState(false);
  const [parliamentTab, setParliamentTab] = useState<ParliamentTab>('chamber');
  const [trip, setTrip] = useState<TownTrip | null>(null);
  const [sailing, setSailing] = useState(false);
  // The action runs on the click; the walk only stages it, so its receipt and
  // scene wait until he is at the door, or back from the island
  const [holding, setHolding] = useState(false);
  const tripKeyRef = useRef(0);
  // What runs once he reaches the door, for walks that open something there
  const atDoorRef = useRef<(() => void) | null>(null);
  const shownToast = holding ? null : toast;
  const shownCutscene = holding ? null : cutscene;
  const [reading, setReading] = useState<TownIssue | null>(null);
  const [info, setInfo] = useState<'government' | 'meters' | null>(
    null,
  );
  const ch = career.characters[career.playerSlug];
  // He keeps making the noise his mood makes, but not while a panel is over him
  useMoodAmbience(
    careerMoodActivityFor(ch),
    modal === null && info === null && shownCutscene === null,
  );
  const busy = pendingElection || pendingRival;
  const slotsFull = career.slotsUsed >= OFFSEASON_SLOTS;
  // Nothing in the window moves while the city has business with the player
  const locked = slotsFull || busy;
  const plotsBooked = playerPlotsBooked(career);
  const contract = ch.sponsor;
  const stateMedia = contract?.sponsorId === 'red';
  const blueGuard = contract?.sponsorId === 'blue';
  const islandAvailable =
    contract?.sponsorId === 'green' &&
    (greenWeekendEveryWindow(ch)
      ? career.islandYear !== career.year ||
        career.islandSeason !== career.season
      : career.islandYear !== career.year);
  const trainingScale = seasonPriceScale(career, 'training');
  const guardScale = guardPriceScale(career, career.playerSlug);
  const playerPlace =
    rankBySeeding(career.characters, career.playerSlug).indexOf(
      career.playerSlug,
    ) + 1;
  const guardPositionPct = Math.round(
    (guardPositionScale(playerPlace - 1) - 1) * 100,
  );
  const sabotageScale =
    seasonPriceScale(career, 'sabotage') *
    sabotageTaxScale(ch, career.parliament) *
    greenSabotageScale(ch) *
    sabotageRepeatScale(plotsBooked);
  const mediaMultiplier = stateMedia
    ? redMediaMultiplier(ch.partyStatus)
    : 1;
  const leadMedia = redLeadMedia(ch, career.parliament);
  const interviewPay = Math.round(
    mediaPay(
      'interview',
      ch.fanSkill.level,
      mediaMultiplier,
      seasonPriceScale(career, 'media'),
    ) * leadMedia.payScale,
  );
  const scandalPay = Math.round(
    mediaPay(
      'scandal',
      ch.fanSkill.level,
      mediaMultiplier,
      seasonPriceScale(career, 'media'),
    ) * leadMedia.payScale,
  );
  const mediaTax = fameStressTaxScale(ch.fanSkill.level);
  const leadFame = (fame: number) =>
    Math.round(fame * leadMedia.fameScale + leadMedia.fameDelta);
  const [interviewFameMin, interviewFameMax] = mediaFameRange(
    ch.fanSkill.level,
  );
  const [scandalFameMin, scandalFameMax] = mediaFameRange(
    ch.fanSkill.level,
    MEDIA_SCANDAL_FAME_SCALE,
  );
  const characterBySlug = new Map(characters.map((c) => [c.slug, c]));
  const guardFromCost = guardCost(guardMinSteps(), guardScale);
  const trainingPct = seasonPricePctFor(career, 'training');
  const guardPct = seasonPricePctFor(career, 'guard');
  const sabotagePct = seasonPricePctFor(career, 'sabotage');
  const mediaUses = career.mediaUses ?? 0;
  const mediaLeft =
    Math.max(0, mediaUsesFor(ch.fanSkill.level) + leadMedia.usesDelta) -
    mediaUses;
  const mediaSpent = !stateMedia && mediaLeft <= 0;
  const playerCharacter = characters.find((c) => c.slug === career.playerSlug);
  // Sabotage and protection unlock only after the first cup has been played
  const mechanicsUnlocked = career.standingsHistory.length > 0;
  // Standing contracts are bought out of the wallet, not out of the month, so
  // the shop stays open even when every slot is spent
  const standingGuardPct = Math.round(standingSecurityChance(ch) * 100);

  const travel = (
    building: TownBuildingId,
    run: () => void,
    island = false,
  ) => {
    run();
    if (!playerCharacter) return;
    tripKeyRef.current += 1;
    setHolding(true);
    setTrip({ key: tripKeyRef.current, building, island });
  };
  // He walks there first and the building opens once he is at the door
  const visit = (building: TownBuildingId, open: () => void) => {
    if (!playerCharacter) {
      open();
      return;
    }
    tripKeyRef.current += 1;
    atDoorRef.current = open;
    setTrip({ key: tripKeyRef.current, building });
  };
  const arrive = (t: TownTrip) => {
    if (t.key !== tripKeyRef.current) return;
    const atDoor = atDoorRef.current;
    atDoorRef.current = null;
    atDoor?.();
    if (t.island) setSailing(true);
    else setHolding(false);
  };
  const endTrip = (t: TownTrip) => {
    if (t.key !== tripKeyRef.current) return;
    setHolding(false);
    setSailing(false);
    setTrip(null);
  };
  const train = (id: TrainingId) => travel('training', () => onTrain(id));
  const rest = (fasting: boolean) => travel('home', () => onRest(fasting));
  const media = (kind: MediaAppearanceKind) =>
    travel('media', () => onMedia(kind));
  const guard = (steps: number) => travel('security', () => onGuard(steps));
  const sabotage = (
    targetSlug: string,
    tier: SabotageTier,
    boostSteps: number,
  ) => travel('cafe', () => onSabotage(targetSlug, tier, boostSteps));
  const island = () => travel('dock', onIsland, true);

  const guarded = career.guarded === true || blueGuard;
  // The pier stays as it was until the boat that already left is back
  const dockTrip = trip?.building === 'dock';
  const gliziPct = gliziPricePct(career);
  const glizzyHistory = career.gliziPriceHistory ?? [];
  const glizzyPrevious =
    glizzyHistory.length > 1 ? glizzyHistory[glizzyHistory.length - 2] : 1;
  const glizzyCurrent = career.gliziPriceIndex ?? 1;
  const glizzyTrend =
    glizzyCurrent > glizzyPrevious
      ? 'up'
      : glizzyCurrent < glizzyPrevious
        ? 'down'
        : 'flat';
  const bankDebt = debtOf(ch, career.balance);
  const glizzySub = `${
    glizzyTrend === 'up' ? '\u25B2' : glizzyTrend === 'down' ? '\u25BC' : ''
  }${signedPct(gliziPct)}`;
  const pctSub = (pct: number) => (pct !== 0 ? signedPct(pct) : null);
  // Single player reads the league paper at the kiosk once the month is spent
  const newsReady = !hideCupGate && slotsFull && !busy;
  const readNews = () => visit('kiosk', onOpenNews);
  // The new rival is picked at the TV station, once the election is watched
  const rivalReady = pendingRival && !pendingElection;
  const meetRival = () => visit('media', onOpenRival);
  // Every paper on the kiosk's counter; the league paper that is not out yet
  // still prints at the kiosk after the walk
  const papers: TownKioskPaper[] = [
    ...townPapers(career, newsReady).map((paper) => {
      const [headline = null, ...lines] = paperHeadlines(
        paper.issue.news,
        (item) => headlineText(item, characterBySlug),
      );
      return {
        key: paper.key,
        title: paper.recap ? NP.recapTitle : MASTHEAD,
        cup: paper.recap,
        season: paper.issue.season,
        headline,
        lines,
        sub: fmt(NP.issue, {
          theme: seasonName(paper.issue.season),
          year: paper.issue.year,
        }),
        unread: !paper.printed,
        onOpen: paper.printed
          ? () => {
              setReading(paper.issue);
              setModal('paper');
            }
          : () => {
              setModal(null);
              readNews();
            },
      };
    }),
    ...extraPapers.map((paper) => ({
      ...paper,
      onOpen: () => {
        setModal(null);
        paper.onOpen();
      },
    })),
  ];
  // What is spent, as the town shows it: an action is paid on the click, but
  // its building only shuts (and the town only closes) once he is back from
  // the walk, so he never heads for a door that just rolled its shutter down
  const spentNow = [slotsFull, islandAvailable, mediaSpent, guarded]
    .map(Number)
    .join('');
  const [spentShown, setSpentShown] = useState(spentNow);
  if (trip === null && spentShown !== spentNow) setSpentShown(spentNow);
  const [
    shownFull,
    shownIsland,
    shownMediaSpent,
    shownGuarded,
  ] = [...(trip === null ? spentNow : spentShown)].map((c) => c === '1');
  // Nothing left that takes a slot, so the town closes for the night
  const closing = shownFull && !busy && !shownIsland && !dockTrip;
  const slotMode = (spent: boolean): TownBuildingMode =>
    spent ? 'shut' : 'open';
  const sabotageSub = plotsBooked > 0 ? fmt(SAB.booked, { n: plotsBooked }) : null;

  // Every building with the same open and greyed rules the action rail had.
  // Abandoned is what the career has not opened yet, shut is what is spent
  // for this window
  const buildings: Record<TownBuildingId, TownBuildingState> = {
    training: {
      mode: slotMode(shownFull),
      disabled: locked,
      sub: pctSub(trainingPct),
      onOpen: () => setModal('training'),
    },
    home: {
      mode: slotMode(shownFull && !shownIsland),
      disabled: busy || (slotsFull && !islandAvailable),
      sub: null,
      onOpen: () => setModal('rest'),
    },
    // While a new rival waits, the TV station is where he is picked, in
    // place of the usual appearance
    media: rivalReady
      ? {
          mode: 'open',
          disabled: false,
          sub: null,
          label: TOWN.rivalAlarm,
          shortLabel: TOWN.rivalAlarm,
          onOpen: meetRival,
        }
      : {
          mode: slotMode(shownFull || shownMediaSpent),
          disabled: mediaSpent || locked,
          sub: mediaSpent
            ? null
            : `+${interviewPay}${mediaLeft > 1 ? ` ×${mediaLeft}` : ''}`,
          onOpen: () => setModal('media'),
        },
    bank: {
      mode: 'open',
      disabled: false,
      sub: glizzySub,
      alert: bankDebt > 0,
      onOpen: () => setModal('bank'),
    },
    cafe: {
      mode: !mechanicsUnlocked ? 'abandoned' : slotMode(shownFull),
      disabled: locked,
      sub:
        [sabotageSub, pctSub(sabotagePct)].filter(Boolean).join(' ') || null,
      onOpen: () => setModal('sabotage'),
    },
    security: {
      mode: !mechanicsUnlocked
        ? 'abandoned'
        : slotMode(shownFull || shownGuarded),
      disabled:
        locked ||
        guarded ||
        career.balance < guardFromCost,
      label: guarded ? TOWN.labels.guarded : undefined,
      shortLabel: guarded ? TOWN.short.guarded : undefined,
      sub: guarded ? null : pctSub(guardPct),
      onOpen: () => setModal('guard'),
    },
    parliament: {
      mode: parliamentOpen(career) ? 'open' : 'abandoned',
      disabled: false,
      sub: null,
      onOpen: () => {
        setParliamentTab('chamber');
        setModal('parliament');
      },
    },
    post: {
      mode: 'open',
      disabled: false,
      sub: null,
      onOpen: () => setModal('mail'),
    },
    kiosk: {
      mode: 'open',
      disabled: busy,
      sub: null,
      onOpen: () => setModal('kiosk'),
    },
    billboard: {
      mode: 'open',
      disabled: false,
      sub: null,
      onOpen: onOpenTable,
    },
    // The party poll goes up with the chamber, an info board that never shuts
    poll: {
      mode: parliamentOpen(career) ? 'open' : 'abandoned',
      disabled: false,
      sub: null,
      onOpen: () => {
        setParliamentTab('popularity');
        setModal('parliament');
      },
    },
    dock: {
      mode:
        dockTrip || shownIsland
          ? 'open'
          : contract?.sponsorId === 'green'
            ? 'shut'
            : 'abandoned',
      disabled: busy || (!dockTrip && !islandAvailable),
      sub: null,
      onOpen: () => setModal('dock'),
    },
  };

  return (
    <div className="w-full">
      <TownHub
        career={career}
        characterBySlug={characterBySlug}
        playerCharacter={playerCharacter}
        coaches={coaches}
        room={room}
        topBar={topBar}
        gate={gate}
        hideCupGate={hideCupGate}
        toast={shownToast}
        onDismissToast={onDismissToast}
        buildings={buildings}
        trip={trip}
        sailing={sailing}
        onArrive={arrive}
        onTripEnd={endTrip}
        pendingElection={pendingElection}
        pendingRival={pendingRival}
        closing={closing}
        paperFresh={papers.some((paper) => paper.unread)}
        onOpenElection={onOpenElection}
        onOpenRival={meetRival}
        onOpenDossier={onOpenDossier}
        onOpenNews={readNews}
        onToCup={onToCup}
      />

      {modal === 'dock' && islandAvailable && (
        <SponsorModal
          sponsorId={contract?.sponsorId ?? null}
          title={TOWN.labels.dock}
          flush
          onClose={() => setModal(null)}
        >
          <TownDockChooser
            islandDesc={
              greenWeekendEveryWindow(ch)
                ? A.islandDescEveryWindow
                : A.islandDesc
            }
            disabled={busy}
            onIsland={() => {
              setModal(null);
              island();
            }}
          />
        </SponsorModal>
      )}
      {modal === 'bank' && (
        <SponsorModal
          sponsorId={contract?.sponsorId ?? null}
          title={TOWN.bankTitle}
          flush
          wide
          onClose={() => setModal(null)}
        >
          <TownBankPanel
            trend={glizzyTrend}
            glizzflationSub={glizzySub}
            officeSub={
              bankDebt > 0 ? `${TOWN.account.debt} ${bankDebt}` : null
            }
            glizzflation={
              <GlizacijaPanel
                career={career}
                sponsorId={contract?.sponsorId ?? null}
                onBet={onGlizzyBet}
                onCancelBet={onCancelGlizzyBet}
                otherBets={otherGlizzyBets}
              />
            }
            invest={
              contract ? (
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {INVESTMENT_ORDER.map((id) => (
                    <InvestmentCard
                      key={id}
                      id={id}
                      level={investmentLevel(ch, id)}
                      balance={career.balance}
                      priceScale={seasonPriceScale(career, 'investment')}
                      gliziPct={gliziPricePct(career)}
                      onBuy={() => {
                        setModal(null);
                        onInvest(id);
                      }}
                    />
                  ))}
                </div>
              ) : null
            }
            office={
              <TownBankOffice
                career={career}
                onBorrow={onBorrow}
                onRepay={onRepay}
              />
            }
          />
        </SponsorModal>
      )}
      {modal === 'kiosk' && (
        <SponsorModal
          sponsorId={contract?.sponsorId ?? null}
          title={TOWN.signs.kiosk}
          flush
          wide
          onClose={() => {
            setKioskStats(false);
            setModal(null);
          }}
        >
          <TownKioskChooser
            papers={papers}
            reading={kioskStats}
            onReadingChange={setKioskStats}
            stats={{
              sub: fmt(GAMES_UI.career.hud.year, { year: career.year }),
              leaders: rankBySeeding(career.characters, seedingKey(career))
                .slice(0, 3)
                .flatMap((slug) => {
                  const character = characterBySlug.get(slug);
                  return character
                    ? [
                        {
                          slug,
                          name: character.name,
                          points: careerPoints(career.characters[slug]),
                        },
                      ]
                    : [];
                }),
              sheet: (
                <TownLeagueStats
                  career={career}
                  characterBySlug={characterBySlug}
                  coaches={coaches}
                  shared={room !== undefined}
                />
              ),
            }}
          />
        </SponsorModal>
      )}
      {modal === 'paper' && reading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
          <div className="absolute inset-0 bg-[#060912]/75" />
          <NewspaperSpread
            news={reading.news}
            season={reading.season}
            year={reading.year}
            characterBySlug={characterBySlug}
            cta={NP.close}
            onDone={() => setModal(null)}
            coaches={coaches}
          />
        </div>
      )}
      {modal === 'mail' && (
        <SponsorModal
          sponsorId={contract?.sponsorId ?? null}
          title={MAIL.title}
          flush
          onClose={() => setModal(null)}
        >
          <CareerMailbox
            mail={career.mail}
            canAcceptSponsor={!contract}
            canDonate={(item) => campaignLetterOpen(item, career)}
            balance={career.balance}
            onDonate={onDonate}
            onMarkRead={onMarkMailRead}
            onMarkAllRead={onMarkAllMailRead}
            onAcceptSponsor={(id, sponsorId) => {
              onAcceptSponsor(id, sponsorId);
              setModal(null);
            }}
          />
        </SponsorModal>
      )}
      {modal === 'parliament' && career.parliament && (
        <SponsorModal
          sponsorId={contract?.sponsorId ?? null}
          title={PARL.title}
          board="tall"
          titleExtra={
            <InfoButton
              label={PARL.effects.infoTitle}
              onClick={() => setInfo('government')}
            />
          }
          onClose={() => setModal(null)}
        >
          <ParliamentPanel
            career={career}
            characterBySlug={characterBySlug}
            coaches={coaches}
            initialTab={parliamentTab}
          />
        </SponsorModal>
      )}
      {modal === 'training' && (
        <SponsorModal
          sponsorId={contract?.sponsorId ?? null}
          title={OS.actionsTitle}
          flush
          titleExtra={
            <InfoButton label={M.infoTitle} onClick={() => setInfo('meters')} />
          }
          wide
          onClose={() => setModal(null)}
        >
          <TownTrainingBoard>
            {TRAINING_ORDER.map((id) => {
              const def = TRAINING_DEFS[id];
              const levelKey = LEVEL_KEY[id as keyof typeof LEVEL_KEY];
              const stat = levelKey ? ch[levelKey] : null;
              const streak = ch.lastTraining === id ? ch.sameTrainingStreak : 0;
              const partyScale =
                redLeadTrainingScale(ch, career.parliament, id) *
                trainingLawScale(career.parliament);
              return (
                <TrainingCard
                  key={id}
                  def={def}
                  stat={stat}
                  maxLevel={def.leveled ? def.maxLevel : null}
                  overtrainPct={Math.round(overtrainChance(streak) * 100)}
                  priceScale={trainingScale * partyScale}
                  seasonPct={trainingPct}
                  gliziPct={gliziPricePct(career)}
                  partyPct={Math.round((partyScale - 1) * 100)}
                  affordable={
                    career.balance >=
                    trainingCost(
                      def,
                      stat?.level ?? 0,
                      trainingScale * partyScale,
                    )
                  }
                  disabled={locked}
                  onTrain={() => {
                    setModal(null);
                    train(id);
                  }}
                />
              );
            })}
          </TownTrainingBoard>
        </SponsorModal>
      )}
      {modal === 'rest' && (
        <SponsorModal
          sponsorId={contract?.sponsorId ?? null}
          title={A.restTitle}
          flush
          onClose={() => setModal(null)}
        >
          <TownHomeFridge
            ch={ch}
            islandAvailable={islandAvailable}
            slotsFull={slotsFull}
            onRest={(fasting) => {
              setModal(null);
              rest(fasting);
            }}
            onIsland={() => {
              setModal(null);
              island();
            }}
          />
        </SponsorModal>
      )}
      {modal === 'media' && (
        <SponsorModal
          sponsorId={contract?.sponsorId ?? null}
          title={A.mediaTitle}
          flush
          onClose={() => setModal(null)}
        >
          <TownMediaStudio>
            <TownMediaTape
              kind="interview"
              title={A.mediaInterview}
              desc={plural(A.mediaInterviewDesc, interviewPay, {
                pay: interviewPay,
                fameMin: leadFame(interviewFameMin),
                fameMax: leadFame(interviewFameMax),
                ego: MEDIA_EGO_GAIN + ch.fanSkill.level,
                amb: MEDIA_AMBITION_GAIN + ch.fanSkill.level,
                appetite: APPETITE_REGROWTH,
                stress: Math.round(MEDIA_STRESS * mediaTax),
              })}
              pay={interviewPay}
              label={OS.spendMonth}
              onPlay={() => {
                setModal(null);
                media('interview');
              }}
            />
            <TownMediaTape
              kind="scandal"
              title={A.mediaScandal}
              desc={plural(A.mediaScandalDesc, scandalPay, {
                pay: scandalPay,
                fameMin: leadFame(scandalFameMin),
                fameMax: leadFame(scandalFameMax),
                ego: MEDIA_SCANDAL_EGO_GAIN + ch.fanSkill.level,
                amb: MEDIA_AMBITION_GAIN + ch.fanSkill.level,
                appetite: APPETITE_REGROWTH,
                stress: Math.round(MEDIA_SCANDAL_STRESS * mediaTax),
                backfire: Math.round(SCANDAL_BACKFIRE_CHANCE * 100),
                backfireFameMin: signedNumber(leadFame(-scandalFameMax)),
                backfireFameMax: signedNumber(leadFame(-scandalFameMin)),
                backfireStress: Math.round(MEDIA_SCANDAL_STRESS * mediaTax * 2),
              })}
              pay={scandalPay}
              label={OS.spendMonth}
              onPlay={() => {
                setModal(null);
                media('scandal');
              }}
            />
          </TownMediaStudio>
        </SponsorModal>
      )}
      {modal === 'guard' && (
        <SponsorModal
          sponsorId={contract?.sponsorId ?? null}
          title={A.guard}
          onClose={() => setModal(null)}
        >
          <GuardDialog
            balance={career.balance}
            standingPct={standingGuardPct}
            priceScale={guardScale}
            seasonPct={guardPct}
            gliziPct={gliziPricePct(career)}
            place={playerPlace}
            positionPct={guardPositionPct}
            maxChance={guardMaxChance(ch)}
            onConfirm={(steps) => {
              setModal(null);
              guard(steps);
            }}
            onCancel={() => setModal(null)}
          />
        </SponsorModal>
      )}
      {modal === 'sabotage' && (
        <SponsorModal
          sponsorId={contract?.sponsorId ?? null}
          title={SAB.action}
          wide
          onClose={() => setModal(null)}
        >
          <SabotageDialog
            career={career}
            characters={characters}
            priceScale={sabotageScale}
            seasonPct={sabotagePct}
            plotsBooked={plotsBooked}
            gliziPct={gliziPricePct(career)}
            onConfirm={(targetSlug, tier, boostSteps) => {
              setModal(null);
              sabotage(targetSlug, tier, boostSteps);
            }}
            onCancel={() => setModal(null)}
          />
        </SponsorModal>
      )}
      {info === 'meters' && (
        <SponsorModal
          sponsorId={contract?.sponsorId ?? null}
          title={M.infoTitle}
          onClose={() => setInfo(null)}
        >
          <MetersInfoPanel />
        </SponsorModal>
      )}
      {info === 'government' && (
        <SponsorModal
          sponsorId={contract?.sponsorId ?? null}
          title={PARL.effects.infoTitle}
          onClose={() => setInfo(null)}
        >
          <GovernmentEffectsInfoPanel
            leader={career.parliament?.government[0] ?? null}
          />
        </SponsorModal>
      )}
      {shownCutscene && playerCharacter && (
        <ActionCutscene
          key={shownCutscene.key}
          scene={shownCutscene.scene}
          outcome={shownCutscene.outcome}
          toast={shownCutscene.toast}
          character={playerCharacter}
          season={career.season}
          onClose={onCloseCutscene}
        />
      )}
    </div>
  );
}
