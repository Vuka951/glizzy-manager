'use client';

import CareerIconButton from '@/components/games/career/CareerIconButton';
import CareerChip from '@/components/games/career/CareerChip';
import CareerButton from '@/components/games/career/CareerButton';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import GameSettingsModal from '@/components/games/GameSettingsModal';
import useAmbientMotion from '@/components/games/useAmbientMotion';
import ActionIcon, { type ActionIconKind } from '@/components/icons/ActionIcon';
import PortraitHead from '@/components/games/PortraitHead';
import TournamentPodium from '@/components/games/tournament/TournamentPodium';
import type { ActionReceiptToast } from '@/components/games/career/ActionReceipt';
import type { ActionCutsceneState } from '@/components/games/career/ActionCutscene';
import CareerCupPhase from '@/components/games/career/CareerCupPhase';
import GearButton from '@/components/games/GearButton';
import CareerIntroCutscene from '@/components/games/career/CareerIntroCutscene';
import CareerSlotDeleteModal from '@/components/games/career/CareerSlotDeleteModal';
import CareerSlotPicker from '@/components/games/career/CareerSlotPicker';
import SponsorModal from '@/components/games/career/SponsorModal';
import CareerTable from '@/components/games/career/CareerTable';
import BrassPlate from '@/components/games/career/street/BrassPlate';
import PaperSheet from '@/components/games/career/street/PaperSheet';
import CharacterDossier from '@/components/games/career/CharacterDossier';
import MetersInfoPanel from '@/components/games/career/MetersInfoPanel';
import SponsorInfoPanel from '@/components/games/career/SponsorInfoPanel';
import CareerWalletChip from '@/components/games/career/CareerWalletChip';
import ClassifiedsSelect from '@/components/games/career/ClassifiedsSelect';
import CrownPointsPicker from '@/components/games/career/CrownPointsPicker';
import ConstitutionCelebration from '@/components/games/career/ConstitutionCelebration';
import OverlordCelebration from '@/components/games/career/OverlordCelebration';
import CampaignReport from '@/components/games/career/CampaignReport';
import NewspaperSpread from '@/components/games/career/NewspaperSpread';
import SabotageHitReel from '@/components/games/career/SabotageHitReel';
import QuoteCutscene from '@/components/games/career/QuoteCutscene';
import GlizzyIcon from '@/components/icons/GlizzyIcon';
import OffseasonScreen from '@/components/games/career/OffseasonScreen';
import RivalChoiceDialog from '@/components/games/career/RivalChoiceDialog';
import SeasonBackdrop from '@/components/games/SeasonBackdrop';
import SeasonStage from '@/components/games/career/SeasonStage';
import YearCalendar from '@/components/games/career/YearCalendar';
import { useSeasonMusic } from '@/components/games/career/useSeasonMusic';
import {
  CAREER_BET_UNLOCK_CUPS,
  MEDIA_AMBITION_GAIN,
  MEDIA_EGO_GAIN,
  MEDIA_SCANDAL_EGO_GAIN,
  MEDIA_SCANDAL_FAME_SCALE,
  MEDIA_SCANDAL_STRESS,
  MEDIA_STRESS,
  type MediaAppearanceKind,
  APPETITE_REGROWTH,
  COMEBACK_START_FAME,
  OFFSEASON_SLOTS,
  OVERLORD_POINTS,
  type OverlordPoints,
  PLOTTING_EGO_GAIN,
  SCANDAL_BACKFIRE_CHANCE,
  SPONSOR_FAME_BONUS,
  STARTING_CAREER_BALANCE,
} from '@/data/games/careerEconomy';
import type { InvestmentId } from '@/data/games/careerInvestments';
import {
  fameStressTaxScale,
  mediaUsesFor,
  TRAINING_DEFS,
  trainingCost,
  type TrainingId,
} from '@/data/games/careerTraining';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import {
  CAREER_SAVE_VERSION,
  careerSave,
  type CareerSlot,
  type CharacterCareerState,
  type SavedCareer,
  type MailItem,
  type SabotageTier,
  type SponsorId,
} from '@/lib/utils/careerSave';
import {
  bettingUnlockedLetter,
  broadcastUnlockLetter,
  donationLetter,
  electionLetter,
  glizzyMarketLetter,
  favorLetter,
  investmentsLetter,
  leagueNews,
  overlordLetter,
  rivalTauntLetter,
  seasonPricesLetter,
  sponsorOfferLetter,
  stipendCutLetter,
  stipendLetter,
  taxLetter,
  taxRefundLetter,
  underworldLetter,
  welcomeLetter,
  campaignLetter,
  campaignDeclinedLetter,
} from '@/lib/utils/careerMail';
import { achievementStore } from '@/lib/utils/achievements';
import { careerAchievementsUnlocked } from '@/lib/utils/careerAchievements';
import {
  guardChance,
  guardMaxChance,
  guardCost,
  guardPriceScale,
  playerPlotsBooked,
  sabotageChance,
  sabotageRepeatScale,
  sabotageTotalCost,
} from '@/lib/utils/careerSabotage';
import {
  buildMatchResultEvent,
  glizacijaDropsBetween,
  matchRoundKind,
  quoteRollSeed,
  quoteScenesFor,
  sponsorSigningsBetween,
  withQuoteSceneFired,
  type QuoteEvent,
  type QuotePlayback,
} from '@/lib/utils/quoteCutsceneTriggers';
import {
  rollSeasonPricePct,
  withSeasonPriceRoll,
  seasonPriceScale,
} from '@/lib/utils/careerSeasonPrices';
import {
  BROADCAST_OPEN_UNLOCK_CUPS,
  MATCH_TAPE_UNLOCK_CUPS,
} from '@/lib/constants/careerCommentary';
import type {
  ActionSceneId,
  ActionSceneOutcome,
} from '@/lib/constants/careerScenes';
import { leagueCharacters } from '@/lib/utils/duelCharacters';
import {
  generateLeague,
  ownNameProblem,
  withOwnName,
  type LeagueEntry,
} from '@/lib/utils/leagueRoster';
import { randomSeed } from '@/lib/utils/seededRandom';
import { seededRounds } from '@/lib/utils/careerSeeding';
import {
  AMBITION_SLUMP_THRESHOLD,
  applyCupPlacement,
  applyFast,
  applyGuardHire,
  applyRest,
  applyTraining,
  clampMeter,
  mediaPay,
  EGO_HIJACK_THRESHOLD,
  newCharacterState,
  rollMediaFame,
  STAT_KEY_BY_TRAINING,
} from '@/lib/utils/careerMeters';
import { receiptLines } from '@/lib/utils/careerReceipt';
import {
  applyStandingInvestments,
  buyInvestment,
  investmentLevel,
  investmentNews,
  nextInvestmentCost,
} from '@/lib/utils/careerInvestments';
import {
  borrowLoan,
  debtLetters,
  openLeagueDebt,
  repayLoan,
} from '@/lib/utils/careerCredit';
import {
  cancelGlizzyBet,
  glizzyMarketOpen,
  placeGlizzyBet,
  settleGlizzyBet,
} from '@/lib/utils/careerGlizzflationBets';
import type { GlizzyCall } from '@/data/games/careerGlizzflationBets';
import { simulateOffseason } from '@/lib/utils/careerOffseason';
import ElectionNightCutscene from '@/components/games/career/ElectionNightCutscene';
import LawBallotDialog from '@/components/games/career/LawBallotDialog';
import LawVoteCutscene from '@/components/games/career/LawVoteCutscene';
import {
  applyLawBallot,
  applySeasonLaws,
  closeLawBallot,
  cupPrizeFor,
  constitutionWin,
  lawBallotReady,
  lawBillFor,
  lawMovesTotal,
  lawsInForce,
  lawVoteDue,
  openLawBallot,
  pickLawCard,
  trainingLawScale,
  voteLaw,
  type LawBallot,
  type LawVote,
  primeMinister,
  withPrimeMinister,
} from '@/lib/utils/careerLaws';
import {
  countElection,
  electionNews,
  settleElection,
  voteCoalition,
} from '@/lib/utils/careerCoalition';
import { electionPremier } from '@/lib/utils/careerPremier';
import {
  ELECTION_POLL_SEASON,
  ELECTION_SEASON,
  PARTY_SEAT_ORDER,
  OUTSIDER_DONATION_STEPS,
} from '@/data/games/careerElections';
import {
  applyElection,
  bookAiRemoval,
  campaignLetterOpen,
  closeCampaignLetters,
  emptyParliament,
  favorsLeft,
  isElectionYear,
  yellowTax,
  greenWeekendEveryWindow,
  partyStatusOf,
  pollSeats,
  recordDonation,
  sabotageTaxScale,
  seatParams,
  redLeadMedia,
  redLeadTrainingScale,
  redMediaMultiplier,
  outsiderOfferChance,
  recordOutsiderDonation,
} from '@/lib/utils/careerElections';
import { electionScenes } from '@/lib/utils/careerElectionScenes';
import {
  campaignFinished,
  campaignOverlord,
  careerPoints,
  crownedLeader,
  overlordGoal,
  rankBySeeding,
} from '@/lib/utils/careerPoints';
import { scoutLevel, scoutReveal } from '@/lib/utils/careerScouting';
import { cupRecapNews } from '@/lib/utils/careerRecap';
import {
  firstYearRival,
  rivalCandidates,
  rivalChosenNews,
} from '@/lib/utils/careerRivals';
import { SPONSOR_TOP_SEED_COUNT } from '@/data/games/careerSponsors';
import {
  newContract,
  greenSabotageScale,
  rollSponsorOffers,
  sponsorPayout,
} from '@/lib/utils/careerSponsors';
import {
  IN_FORM_STRESS_DROP,
  buffedSlugsForSeason,
  seasonThemeIndex,
} from '@/lib/utils/cupSeason';
import { fmt, ordinal, plural } from '@/lib/utils/format';
import { startGameFullscreen } from '@/lib/utils/fullscreen';
import { seasonName } from '@/lib/utils/localeNames';
import { playCheerSound, playBooSound } from '@/lib/utils/gameSounds';
import {
  crowdCheersChampion,
  crowdIntensity,
  FINAL_CROWD_BOOST,
  NEUTRAL_FAME,
} from '@/lib/utils/crowdMood';
import {
  cupMatchWinner,
  cupStandings,
  type CupMatchResult,
  type CupStanding,
} from '@/lib/utils/tournamentSim';

const CAREER = GAMES_UI.career;

// The receipt hangs around until the next action, the player's tap, or this
const TOAST_LINGER_MS = 20000;

const MEDIA_FREEZEFRAMES: Record<string, string> = {
  'media-interview': 'interview',
  'media-scandal': 'scandal-flash',
};
const SEASON_COUNT = 4;
const LEVELED_TRAININGS: TrainingId[] = [
  'stomach',
  'sniffer',
  'nutrition',
  'fans',
];

type UiStage = 'start' | 'intro' | 'select' | 'career' | 'finale' | 'report';

// What the city does to a fresh off-season window: the tax office writes,
// and in an election year the paper, the pollster and the campaign chest
// each take their quarter
function openCityWindow(state: SavedCareer): SavedCareer {
  const playerCh = state.characters[state.playerSlug];
  let next = { ...state, mail: closeCampaignLetters(state) };
  const tax = yellowTax(playerCh, state.parliament);
  if (tax < 0) {
    next = {
      ...next,
      balance: next.balance + tax,
      mail: [...next.mail, taxLetter(next.year, next.season, -tax)],
    };
  } else if (tax > 0) {
    next = {
      ...next,
      mail: [...next.mail, taxRefundLetter(next.year, next.season, tax)],
    };
  }
  if (!isElectionYear(next.year)) return next;
  if (next.season === 0) {
    const parliament = next.parliament ?? emptyParliament();
    next = {
      ...next,
      parliament,
      newsQueue: [
        ...next.newsQueue,
        leagueNews(
          parliament.elections === 0 ? 'election-year' : 'election-year-again',
          next.playerSlug,
          { parties: PARTY_SEAT_ORDER.join(',') },
          'ballot',
          { parties: 'sponsorList' }
        ),
      ],
    };
  }
  if (next.season === ELECTION_POLL_SEASON) {
    const parliament = {
      ...(next.parliament ?? emptyParliament()),
      poll: pollSeats(next),
    };
    next = {
      ...next,
      parliament,
      mail: [
        ...next.mail,
        playerCh.sponsor
          ? donationLetter(next.year, next.season, playerCh.sponsor.sponsorId)
          : campaignLetter(next.year, next.season),
      ],
      newsQueue: [
        ...next.newsQueue,
        leagueNews(
          'election-poll',
          next.playerSlug,
          seatParams(parliament.poll),
          'poll'
        ),
      ],
    };
  }
  if (next.season === ELECTION_SEASON && next.parliament) {
    next = {
      ...next,
      mail: [
        ...next.mail,
        playerCh.sponsor
          ? donationLetter(next.year, next.season, playerCh.sponsor.sponsorId)
          : campaignLetter(next.year, next.season),
      ],
    };
  }
  return next;
}

export default function GliziCareerGame() {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [career, setCareer] = useState<SavedCareer | null>(null);
  const [uiStage, setUiStage] = useState<UiStage>('start');
  const [crownPoints, setCrownPoints] =
    useState<OverlordPoints>(OVERLORD_POINTS);
  const [showTable, setShowTable] = useState(false);
  const [dossierSlug, setDossierSlug] = useState<string | null>(null);
  // The election night opens by itself once the count is in, the rival
  // shortlist waits behind the button on the window
  const [electionOpen, setElectionOpen] = useState(false);
  const [rivalOpen, setRivalOpen] = useState(false);
  const [dossierInfo, setDossierInfo] = useState<
    'sponsors' | 'meters' | null
  >(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState<ActionReceiptToast | null>(null);
  const [cutscene, setCutscene] = useState<ActionCutsceneState | null>(null);
  // The morning the paper first prints, every hit on your own man plays out
  // before the issue opens; reopening the same issue skips the reel
  const [hitReel, setHitReel] = useState(false);
  // League news cued by the last events, popping up over the game while it
  // carries on
  const [quoteQueue, setQuoteQueue] = useState<QuotePlayback[]>([]);
  const quoteAfterReel = useRef<QuotePlayback[]>([]);
  // Scenes cued since the last render, which the state handed to the next
  // event in the same batch does not carry yet, like the rest of a skipped
  // round
  const quotesCued = useRef<string[]>([]);
  const [confirmReset, setConfirmReset] = useState(false);
  // The save slot this career lives in; every autosave writes here and only
  // here. Whenever it changes, the career changes in the same update
  const [activeSlot, setActiveSlot] = useState<CareerSlot | null>(null);
  const [deletingSlot, setDeletingSlot] = useState<CareerSlot | null>(null);
  const slots = useSyncExternalStore(
    careerSave.subscribe,
    careerSave.loadSlots,
    careerSave.getServerSnapshot
  );
  const saved = activeSlot ? slots[activeSlot - 1] : null;

  useEffect(() => {
    if (career && activeSlot) careerSave.save(activeSlot, career);
    quotesCued.current = [];
  }, [career, activeSlot]);

  const previousCareer = useRef<{
    slot: CareerSlot | null;
    career: SavedCareer | null;
  }>({ slot: null, career: null });
  useEffect(() => {
    const prev = previousCareer.current;
    previousCareer.current = { slot: activeSlot, career };
    if (!career || !prev.career || prev.slot !== activeSlot) return;
    careerAchievementsUnlocked(prev.career, career).forEach((id) =>
      achievementStore.unlock(id)
    );
  }, [career, activeSlot]);

  // The applicants for a new career: a league from a fresh seed
  const [applicants, setApplicants] = useState<LeagueEntry[]>(() =>
    generateLeague(randomSeed())
  );
  const ownNameSlot = applicants[applicants.length - 1].slug;
  const careerLeague = career?.league;
  const characters = useMemo(
    () => leagueCharacters(careerLeague ?? applicants),
    [careerLeague, applicants]
  );
  const characterBySlug = useMemo(
    () => new Map(characters.map((c) => [c.slug, c])),
    [characters]
  );

  const ambientMotion = useAmbientMotion();
  const musicActive =
    uiStage === 'career' || uiStage === 'finale' || uiStage === 'report';
  useSeasonMusic(career?.season ?? saved?.season ?? 0, musicActive);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), TOAST_LINGER_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  const playQuotes = (plays: QuotePlayback[]) => {
    if (plays.length === 0) return;
    setQuoteQueue((prev) => [
      ...prev,
      ...plays.filter(
        (play) =>
          !prev.some((p) => p.id === play.id && p.speaker === play.speaker)
      ),
    ]);
  };

  const finishQuotes = () => setQuoteQueue([]);

  // The scenes a run of events cues, with the ids they used up folded into
  // the state. The player's own character is the human-coached one here
  const quotesFor = (
    events: QuoteEvent[],
    state: SavedCareer
  ): { state: SavedCareer; plays: QuotePlayback[] } => {
    const seed = quoteRollSeed(state);
    const plays: QuotePlayback[] = [];
    let next = state;
    events.forEach((event) => {
      const fired = [...(next.quoteScenesFired ?? []), ...quotesCued.current];
      quoteScenesFor(event, {
        fired,
        seed,
        coached: [state.playerSlug],
      }).forEach((play) => {
        quotesCued.current.push(play.id);
        plays.push(play);
        next = withQuoteSceneFired(next, play);
      });
    });
    return { state: next, plays };
  };

  // Scenes cued by an event the phase has already written into the state:
  // they are booked onto the current state and pop up at once
  const cueQuotes = (events: QuoteEvent[], prev: SavedCareer) => {
    const { plays } = quotesFor(events, prev);
    if (plays.length === 0) return;
    setCareer((current) =>
      current
        ? plays.reduce((acc, play) => withQuoteSceneFired(acc, play), current)
        : current
    );
    playQuotes(plays);
  };

  const onCupMatchResult = (
    prev: SavedCareer,
    round: number,
    index: number,
    result: CupMatchResult
  ) => {
    const match = prev.cup?.rounds[round]?.[index];
    if (!prev.cup || !match?.a || !match.b) return;
    cueQuotes(
      [
        buildMatchResultEvent(
          prev,
          match.a,
          match.b,
          result,
          matchRoundKind(round, prev.cup.rounds.length)
        ),
      ],
      prev
    );
  };

  // A small receipt for every off-season action: what moved, and by how much.
  // Rising CHOLESTEROL is bad news, so its chips color the other way around
  const flashToast = (
    title: string,
    before: CharacterCareerState | null,
    after: CharacterCareerState | null,
    moneyDelta = 0,
    opts: {
      icon?: ActionIconKind;
      ok?: boolean;
      scene?: ActionSceneId;
      outcome?: ActionSceneOutcome;
    } = {}
  ) => {
    const receipt: ActionReceiptToast = {
      title,
      lines: receiptLines(before, after, moneyDelta),
      icon: opts.icon ?? 'stats',
      ok: opts.ok ?? true,
    };
    setToast(receipt);
    // Actions with a scene of their own play it out before the receipt lands
    if (opts.scene) {
      setCutscene((prev) => ({
        scene: opts.scene as ActionSceneId,
        outcome: opts.outcome ?? (receipt.ok ? 'good' : 'bad'),
        toast: receipt,
        key: (prev?.key ?? 0) + 1,
      }));
    }
  };

  // Kick off a fresh off-season: the standing contracts pay out across the
  // whole league, sponsor offers land in the mail, the stipend arrives, and a
  // character past his limits spends the first month on his own: a big enough
  // ego picks a training, no will to compete buys the cheapest security or,
  // broke, fasts. Either way the scene plays right away so the player sees
  // why January is gone
  // While the season's matches are still being watched the table measures
  // against the order the cup was seeded with, so an arrow can only ever
  // describe a result already on screen. Outside that window it stays
  // season-over-season, which is what the recap and the final standings read
  const tableRanks =
    career?.phase === 'cup'
      ? (career.cupStartRanks ?? career.lastCupRanks)
      : career?.lastCupRanks;

  const beginOffseason = (start: SavedCareer): SavedCareer => {
    // The Yellow Party collects first: interest on every debt, and the
    // warning or the car for whoever has been below zero for years
    const debt = openLeagueDebt(start.characters, {
      [start.playerSlug]: start.balance,
    });
    if (debt.runOver.includes(start.playerSlug)) {
      playQuotes([
        {
          id: 'yellow-run-over',
          speaker: start.playerSlug,
          lineRoll: Math.random(),
        },
      ]);
    }
    const input: SavedCareer = {
      ...start,
      characters: debt.characters,
      balance: debt.wallets[start.playerSlug],
      newsQueue: [...start.newsQueue, ...debt.news],
      mail: [
        ...start.mail,
        ...debtLetters(debt, start.playerSlug, start.year, start.season),
      ],
    };
    // The laws on the books open the window: the holiday, the bills and
    // the payouts, the player's share in a letter
    const lawed = applySeasonLaws(input, {
      [input.playerSlug]: input.balance,
    });
    const lawMoves = lawed.moves[input.playerSlug];
    const lawBill = lawBillFor(lawMoves, input.year, input.season);
    const beforePayout = lawed.state.characters[input.playerSlug];
    const paid = Object.fromEntries(
      Object.entries(lawed.state.characters).map(([slug, character]) => [
        slug,
        applyStandingInvestments(character),
      ])
    );
    const base: SavedCareer = {
      ...lawed.state,
      characters: paid,
      balance: input.balance + lawMovesTotal(lawMoves),
      mail: lawBill ? [...lawed.state.mail, lawBill] : lawed.state.mail,
    };
    const playerCh = base.characters[base.playerSlug];
    if (playerCh !== beforePayout) {
      flashToast(CAREER.toast.investPayout, beforePayout, playerCh, 0, {
        icon: 'invest',
      });
    }
    // Sponsors only enter the story once the first cup has been played
    const offers =
      base.standingsHistory.length > 0
        ? rollSponsorOffers(base.playerSlug, playerCh, {
            year: base.year,
            place: playerCh.lastPlace ?? 0,
            topSeed:
              rankBySeeding(base.characters, base.playerSlug).indexOf(
                base.playerSlug
              ) < SPONSOR_TOP_SEED_COUNT,
          })
        : [];
    const offerMail: MailItem[] = offers.map(({ sponsorId, wildcard }) =>
      sponsorOfferLetter(base.year, base.season, sponsorId, wildcard)
    );
    const pricePct = rollSeasonPricePct(base.season, base.year);
    let next: SavedCareer = {
      ...base,
      phase: 'offseason',
      slotsUsed: 0,
      slotLog: [],
      cup: null,
      newsSeen: false,
      seasonPricePct: pricePct,
      seasonPriceByYear: withSeasonPriceRoll(
        base.seasonPriceByYear,
        base.year,
        base.season,
        pricePct
      ),
      mediaUses: 0,
      guarded: false,
      aiGuarded: [],
      quoteScenesFired: [],
      // The stipend rides along in the letter; it pays out when claimed,
      // and only the unsponsored qualify for the league's charity
      mail: [
        ...base.mail,
        ...(pricePct === 0
          ? []
          : [seasonPricesLetter(base.year, base.season, pricePct)]),
        ...(playerCh.sponsor ? [] : [stipendLetter(base.year, base.season)]),
        ...(base.standingsHistory.length === CAREER_BET_UNLOCK_CUPS
          ? [bettingUnlockedLetter(base.year, base.season)]
          : []),
        ...(base.standingsHistory.length === MATCH_TAPE_UNLOCK_CUPS
          ? [broadcastUnlockLetter('tape-unlocked', base.year, base.season)]
          : []),
        ...(base.standingsHistory.length === BROADCAST_OPEN_UNLOCK_CUPS
          ? [broadcastUnlockLetter('studio-unlocked', base.year, base.season)]
          : []),
        // The first cup is the initiation: plots and protection open up
        ...(base.standingsHistory.length === 1
          ? [underworldLetter(base.year, base.season)]
          : []),
        ...offerMail,
      ],
    };
    next = openCityWindow(next);
    const ch = next.characters[next.playerSlug];
    if (ch.ego > EGO_HIJACK_THRESHOLD) {
      const id =
        LEVELED_TRAININGS[Math.floor(Math.random() * LEVELED_TRAININGS.length)];
      const { next: updated, outcome } = applyTraining(ch, TRAINING_DEFS[id]);
      next = {
        ...next,
        characters: { ...next.characters, [next.playerSlug]: updated },
        slotsUsed: 1,
        slotLog: [{ kind: 'ego', trainingId: id, outcome }],
      };
      flashToast(
        fmt(CAREER.toast.egoHijack, {
          threshold: EGO_HIJACK_THRESHOLD,
          training: CAREER.trainings[id].name,
        }),
        ch,
        updated,
        0,
        {
          icon: 'training',
          ok: outcome !== 'regression',
          scene: `training-${id}`,
          outcome:
            outcome === 'level-up'
              ? 'level-up'
              : outcome === 'regression'
                ? 'bad'
                : 'good',
        }
      );
    } else if (ch.ambition < AMBITION_SLUMP_THRESHOLD) {
      // Security only exists once the first cup has opened the underworld
      const cost = guardCost(0, guardPriceScale(next, next.playerSlug));
      const canHire = next.standingsHistory.length > 0 && next.balance >= cost;
      if (canHire) {
        const chance = guardChance(0);
        const updated = applyGuardHire(ch);
        next = {
          ...next,
          guarded: true,
          guardChance: chance,
          balance: next.balance - cost,
          characters: { ...next.characters, [next.playerSlug]: updated },
          slotsUsed: 1,
          slotLog: [{ kind: 'slump', slumpAction: 'guard' }],
        };
        flashToast(
          fmt(CAREER.toast.slumpGuard, {
            threshold: AMBITION_SLUMP_THRESHOLD,
            pct: Math.round(chance * 100),
          }),
          ch,
          updated,
          -cost,
          { icon: 'guard', scene: 'guard' }
        );
      } else {
        const updated = applyFast(ch);
        next = {
          ...next,
          characters: { ...next.characters, [next.playerSlug]: updated },
          slotsUsed: 1,
          slotLog: [{ kind: 'slump', slumpAction: 'fast' }],
        };
        flashToast(
          fmt(CAREER.toast.slumpFast, { threshold: AMBITION_SLUMP_THRESHOLD }),
          ch,
          updated,
          0,
          { icon: 'rest', scene: 'fast' }
        );
      }
    }
    // The prime minister's office is written down as the window opens
    return withPrimeMinister(next);
  };

  const newCareer = (slug: string, league: LeagueEntry[] = applicants) => {
    const roster = league.map((entry) => entry.slug);
    // The comeback story: years away from the scene left the player's
    // character with rock-bottom fame, and with it the last seed
    const states = Object.fromEntries(
      roster.map((rosterSlug) => [
        rosterSlug,
        newCharacterState(rosterSlug, rosterSlug !== slug),
      ])
    );
    states[slug] = { ...states[slug], fame: COMEBACK_START_FAME };
    const rivalSlug = firstYearRival(slug, roster);
    const base: SavedCareer = {
      version: CAREER_SAVE_VERSION,
      league,
      playerSlug: slug,
      overlordPoints: crownPoints,
      year: 1,
      season: 0,
      phase: 'offseason',
      slotsUsed: 0,
      slotLog: [],
      seasonPricePct: 0,
      seasonPriceByYear: { 1: [0] },
      balance: STARTING_CAREER_BALANCE,
      characters: states,
      pendingSabotages: [],
      newsQueue: [],
      mail: [
        welcomeLetter(),
        overlordLetter(crownPoints),
        rivalTauntLetter(1, 0, rivalSlug),
      ],
      cup: null,
      standingsHistory: [],
      // The lore writes the first grudge; from year two the player picks
      rivalSlug,
    };
    setCareer(beginOffseason(base));
    setUiStage('career');
  };

  const resumeCareer = (slot: CareerSlot) => {
    const stored = slots[slot - 1];
    if (!stored) return;
    startGameFullscreen(cardRef.current);
    setActiveSlot(slot);
    setCareer(stored);
    setUiStage(campaignFinished(stored) ? 'finale' : 'career');
    if (stored.parliament?.pendingResult && !campaignFinished(stored))
      setElectionOpen(true);
  };

  const startInSlot = (slot: CareerSlot) => {
    startGameFullscreen(cardRef.current);
    setActiveSlot(slot);
    setCareer(null);
    setUiStage('intro');
  };

  const deleteSlot = () => {
    if (deletingSlot) careerSave.clear(deletingSlot);
    setDeletingSlot(null);
  };

  const chooseRival = (slug: string) => {
    if (!career) return;
    setRivalOpen(false);
    setCareer({
      ...career,
      rivalSlug: slug,
      rivalChoice: null,
      mail: [
        ...career.mail,
        rivalTauntLetter(career.year, career.season, slug),
      ],
      newsQueue: [
        ...career.newsQueue,
        rivalChosenNews(career.playerSlug, slug),
      ],
    });
  };

  const train = (id: TrainingId) => {
    if (!career || career.slotsUsed >= OFFSEASON_SLOTS) return;
    const def = TRAINING_DEFS[id];
    const ch = career.characters[career.playerSlug];
    const statKey = STAT_KEY_BY_TRAINING[id];
    const cost = trainingCost(
      def,
      statKey ? ch[statKey].level : 0,
      seasonPriceScale(career, 'training') *
        redLeadTrainingScale(ch, career.parliament, id) *
        trainingLawScale(career.parliament)
    );
    if (career.balance < cost) return;
    if (def.leveled && statKey && ch[statKey].level >= def.maxLevel) return;
    const { next, outcome } = applyTraining(ch, def);
    setCareer({
      ...career,
      balance: career.balance - cost,
      characters: { ...career.characters, [career.playerSlug]: next },
      slotsUsed: career.slotsUsed + 1,
      slotLog: [
        ...career.slotLog,
        { kind: 'training', trainingId: id, outcome },
      ],
    });
    const trainingName = (CAREER.trainings as Record<string, { name: string }>)[
      id
    ].name;
    const titleKey =
      outcome === 'level-up'
        ? 'levelUp'
        : outcome === 'regression'
          ? 'regression'
          : 'progress';
    flashToast(
      fmt(CAREER.toast[titleKey], { training: trainingName }),
      ch,
      next,
      -cost,
      {
        icon: 'training',
        ok: outcome !== 'regression',
        scene: `training-${id}`,
        outcome:
          outcome === 'level-up'
            ? 'level-up'
            : outcome === 'regression'
              ? 'bad'
              : 'good',
      }
    );
  };

  const rest = (fasting: boolean) => {
    if (!career || career.slotsUsed >= OFFSEASON_SLOTS) return;
    const before = career.characters[career.playerSlug];
    const after = fasting
      ? applyFast(before)
      : applyRest(before, career.playerSlug);
    setCareer({
      ...career,
      characters: { ...career.characters, [career.playerSlug]: after },
      slotsUsed: career.slotsUsed + 1,
      slotLog: [...career.slotLog, { kind: fasting ? 'fast' : 'rest' }],
    });
    flashToast(
      fasting ? CAREER.toast.fast : CAREER.toast.rest,
      before,
      after,
      0,
      { icon: 'rest', scene: fasting ? 'fast' : 'rest' }
    );
  };

  const markMailRead = (id: string) => {
    if (!career) return;
    const item = career.mail.find((m) => m.id === id);
    // Turning down the Yellow Party is the one refusal that has consequences
    const declinedYellow =
      item?.kind === 'sponsor-offer' &&
      item.sponsorId === 'yellow' &&
      !item.read &&
      !career.characters[career.playerSlug].sponsor;
    setCareer({
      ...career,
      balance: career.balance + (item && !item.read ? (item.amount ?? 0) : 0),
      yellowVendetta: career.yellowVendetta || declinedYellow,
      mail: career.mail.map((m) => (m.id === id ? { ...m, read: true } : m)),
    });
  };

  // Every unread letter gets its default answer: money taken, offers declined
  const markAllMailRead = () => {
    if (!career) return;
    const unread = career.mail.filter((m) => !m.read);
    const declinedYellow =
      !career.characters[career.playerSlug].sponsor &&
      unread.some(
        (m) => m.kind === 'sponsor-offer' && m.sponsorId === 'yellow'
      );
    setCareer({
      ...career,
      balance:
        career.balance + unread.reduce((sum, m) => sum + (m.amount ?? 0), 0),
      yellowVendetta: career.yellowVendetta || declinedYellow,
      mail: career.mail.map((m) => (m.read ? m : { ...m, read: true })),
    });
  };

  const donate = (mailId: string, amount: number, sponsorId?: SponsorId) => {
    if (!career?.parliament || career.balance < amount) return;
    const item = career.mail.find((m) => m.id === mailId);
    if (!item || item.read || !campaignLetterOpen(item, career)) return;
    const ch = career.characters[career.playerSlug];
    if (item.kind === 'campaign') {
      if (ch.sponsor || !sponsorId || !OUTSIDER_DONATION_STEPS.includes(amount))
        return;
      const offered = Math.random() < outsiderOfferChance(amount);
      setCareer({
        ...career,
        balance: career.balance - amount,
        parliament: recordOutsiderDonation(
          career.parliament,
          career.playerSlug,
          sponsorId,
          amount
        ),
        mail: [
          ...career.mail.map((m) =>
            m.id === mailId ? { ...m, read: true } : m
          ),
          offered
            ? sponsorOfferLetter(career.year, career.season, sponsorId, false)
            : campaignDeclinedLetter(career.year, career.season, sponsorId),
        ],
      });
      return;
    }
    const party = ch.sponsor?.sponsorId;
    if (!party) return;
    setCareer({
      ...career,
      balance: career.balance - amount,
      parliament: recordDonation(
        career.parliament,
        career.playerSlug,
        party,
        amount
      ),
      mail: career.mail.map((m) =>
        m.id === mailId ? { ...m, read: true } : m
      ),
    });
  };

  // The broadcast is over: the counted result becomes the chamber, the
  // player learns his seat, and donors in government get their favor letter
  const concludeElection = () => {
    const pending = career?.parliament?.pendingResult;
    if (!career || !pending) return;
    // A vote the player walked away from is cast for him by the AI
    const result = settleElection(career, pending);
    const premier = electionPremier(career, result);
    const next = applyElection(career, result);
    playQuotes(electionScenes(career, result));
    const playerCh = next.characters[next.playerSlug];
    const status = playerCh.partyStatus ?? 'none';
    setCareer({
      ...next,
      newsQueue: [
        ...next.newsQueue,
        electionNews(result, next.playerSlug, premier),
      ],
      mail: [
        ...next.mail,
        electionLetter(
          next.year,
          next.season,
          status,
          premier && {
            slug: premier.slug,
            you: premier.slug === next.playerSlug,
          }
        ),
        ...(next.parliament?.elections === 1
          ? [glizzyMarketLetter(next.year, next.season)]
          : []),
        ...(playerCh.sponsor && favorsLeft(next, next.playerSlug) > 0
          ? [
              favorLetter(
                next.year,
                next.season,
                playerCh.sponsor.sponsorId,
                favorsLeft(next, next.playerSlug)
              ),
            ]
          : []),
      ],
    });
  };

  // The player's partner vote: in, counted with the AI's, and the result
  // goes back to the broadcast
  const voteForCoalition = (key: string) => {
    const pending = career?.parliament?.pendingResult;
    if (!career || !career.parliament || !pending?.coalition) return;
    const voted = {
      ...pending,
      coalition: voteCoalition(pending.coalition, career.playerSlug, key),
    };
    setCareer({
      ...career,
      parliament: {
        ...career.parliament,
        pendingResult: settleElection(career, voted),
      },
    });
  };

  const acceptSponsor = (mailId: string, sponsorId: SponsorId) => {
    if (!career) return;
    const ch = career.characters[career.playerSlug];
    if (ch.sponsor) return;
    // Signing elsewhere while the Yellow Party's offer sits unread counts as
    // a refusal; signing with the Yellow Party itself buries the grudge
    const spurnedYellow =
      sponsorId !== 'yellow' &&
      career.mail.some(
        (m) =>
          m.kind === 'sponsor-offer' && m.sponsorId === 'yellow' && !m.read
      );
    const signed = quotesFor(
      [{ kind: 'sponsor-accepted', slug: career.playerSlug, sponsorId }],
      career
    );
    setCareer({
      ...signed.state,
      ...career,
      yellowVendetta:
        sponsorId === 'yellow'
          ? false
          : career.yellowVendetta || spurnedYellow,
      characters: {
        ...career.characters,
        [career.playerSlug]: {
          ...ch,
          sponsor: newContract(sponsorId),
          fame: clampMeter(ch.fame + SPONSOR_FAME_BONUS),
          ...(partyStatusOf(career.parliament?.government ?? [], sponsorId)
            ? {
                partyStatus: partyStatusOf(
                  career.parliament?.government ?? [],
                  sponsorId
                ),
              }
            : {}),
        },
      },
      mail: [
        ...career.mail.map((m) =>
          m.id === mailId || m.kind === 'sponsor-offer'
            ? { ...m, read: true }
            : m
        ),
        stipendCutLetter(career.year, career.season),
        investmentsLetter(career.year, career.season),
      ],
      newsQueue: [
        ...career.newsQueue,
        {
          kind: 'signing',
          templateKey: 'signing',
          params: { sponsor: sponsorId },
          refs: { sponsor: 'sponsor' },
          slugs: [career.playerSlug],
          freezeframe: `signing-${sponsorId}`,
        },
      ],
    });
    playQuotes(signed.plays);
  };

  const doMedia = (kind: MediaAppearanceKind) => {
    if (!career || career.slotsUsed >= OFFSEASON_SLOTS) return;
    const ch = career.characters[career.playerSlug];
    // State media never say no to a friend of the party: no per-season limit
    const stateMedia = ch.sponsor?.sponsorId === 'red';
    const fanLevel = ch.fanSkill.level;
    const leadMedia = redLeadMedia(ch, career.parliament);
    if (
      !stateMedia &&
      (career.mediaUses ?? 0) >=
        Math.max(0, mediaUsesFor(fanLevel) + leadMedia.usesDelta)
    )
      return;
    const tax = fameStressTaxScale(fanLevel);
    const pay = Math.round(
      mediaPay(
        kind,
        fanLevel,
        stateMedia ? redMediaMultiplier(ch.partyStatus) : 1,
        seasonPriceScale(career, 'media')
      ) * leadMedia.payScale
    );
    // Cameras feed fame, ego and hunger for more, all scaling with training;
    // a staged scandal can slip the leash and burn what it was meant to feed
    const backfired =
      kind === 'scandal' && Math.random() < SCANDAL_BACKFIRE_CHANCE;
    const fameSwing = rollMediaFame(
      fanLevel,
      kind === 'scandal' ? MEDIA_SCANDAL_FAME_SCALE : 1
    );
    const after: CharacterCareerState =
      kind === 'scandal'
        ? {
            ...ch,
            stress: clampMeter(
              ch.stress + MEDIA_SCANDAL_STRESS * tax * (backfired ? 2 : 1)
            ),
            appetite: clampMeter(ch.appetite + APPETITE_REGROWTH),
            fame: clampMeter(
              ch.fame +
                (backfired ? -1 : 1) * fameSwing * leadMedia.fameScale +
                leadMedia.fameDelta
            ),
            ego: clampMeter(
              ch.ego +
                (backfired ? -1 : 1) * (MEDIA_SCANDAL_EGO_GAIN + fanLevel)
            ),
            ambition: clampMeter(ch.ambition + MEDIA_AMBITION_GAIN + fanLevel),
          }
        : {
            ...ch,
            stress: clampMeter(ch.stress + MEDIA_STRESS * tax),
            appetite: clampMeter(ch.appetite + APPETITE_REGROWTH),
            fame: clampMeter(
              ch.fame + fameSwing * leadMedia.fameScale + leadMedia.fameDelta
            ),
            ego: clampMeter(ch.ego + MEDIA_EGO_GAIN + fanLevel),
            ambition: clampMeter(ch.ambition + MEDIA_AMBITION_GAIN + fanLevel),
          };
    // The paper prints the same scandal either way; only the meters know
    const templateKey =
      kind === 'scandal' ? 'media-scandal' : 'media-interview';
    // One interview and one scandal to an issue, however often he goes on air
    const alreadyPrinted = career.newsQueue.some(
      (item) => item.templateKey === templateKey,
    );
    setCareer({
      ...career,
      mediaUses: stateMedia ? career.mediaUses : (career.mediaUses ?? 0) + 1,
      slotsUsed: career.slotsUsed + 1,
      slotLog: [...career.slotLog, { kind: 'media' }],
      balance: career.balance + pay,
      characters: { ...career.characters, [career.playerSlug]: after },
      newsQueue: alreadyPrinted
        ? career.newsQueue
        : [
            ...career.newsQueue,
            {
              kind: 'media',
              templateKey,
              params: {},
              slugs: [career.playerSlug],
              freezeframe: MEDIA_FREEZEFRAMES[templateKey],
            },
          ],
    });
    flashToast(
      kind === 'scandal'
        ? backfired
          ? CAREER.toast.mediaScandalBackfire
          : CAREER.toast.mediaScandal
        : CAREER.toast.media,
      ch,
      after,
      pay,
      {
        icon: 'media',
        ok: !backfired,
        scene: kind === 'scandal' ? 'media-scandal' : 'media-interview',
      }
    );
  };

  // The weekend takes no month: the calendar marks it, the slots stay
  const doIsland = () => {
    if (!career) return;
    const ch = career.characters[career.playerSlug];
    const everyWindow = greenWeekendEveryWindow(ch);
    if (
      ch.sponsor?.sponsorId !== 'green' ||
      (everyWindow
        ? career.islandYear === career.year &&
          career.islandSeason === career.season
        : career.islandYear === career.year)
    )
      return;
    const after: CharacterCareerState = {
      ...ch,
      stress: 0,
      appetite: 100,
      ambition: 100,
    };
    setCareer({
      ...career,
      islandYear: career.year,
      islandSeason: career.season,
      slotLog: [...career.slotLog, { kind: 'island' }],
      characters: { ...career.characters, [career.playerSlug]: after },
    });
    flashToast(CAREER.toast.island, ch, after, 0, {
      icon: 'island',
      scene: 'island',
    });
  };

  const doGuard = (steps: number) => {
    if (!career || career.slotsUsed >= OFFSEASON_SLOTS || career.guarded)
      return;
    const cost = guardCost(steps, guardPriceScale(career, career.playerSlug));
    const guardCh = career.characters[career.playerSlug];
    if (career.balance < cost) return;
    const chance = guardChance(steps, guardMaxChance(guardCh));
    const afterGuard = applyGuardHire(guardCh);
    // Hired muscle is booked like a plot: it costs money, not the month
    setCareer({
      ...career,
      guarded: true,
      guardChance: chance,
      balance: career.balance - cost,
      characters: { ...career.characters, [career.playerSlug]: afterGuard },
    });
    flashToast(
      fmt(CAREER.toast.guard, { pct: Math.round(chance * 100) }),
      guardCh,
      afterGuard,
      -cost,
      { icon: 'guard', scene: 'guard' }
    );
  };

  const glizzyBet = (call: GlizzyCall, stake: number) => {
    if (!career || career.phase !== 'offseason' || !glizzyMarketOpen(career))
      return;
    const next = placeGlizzyBet(career, { call, stake });
    if (next) setCareer(next);
  };

  const dropGlizzyBet = () => {
    if (!career || career.phase !== 'offseason') return;
    setCareer(cancelGlizzyBet(career));
  };

  // The bank's counter moves the wallet and the loan together
  const moveLoan = (kind: 'borrow' | 'repay', amount: number) => {
    if (!career) return;
    const ch = career.characters[career.playerSlug];
    const move =
      kind === 'borrow'
        ? borrowLoan(ch, career.balance, amount, career.parliament)
        : repayLoan(ch, career.balance, amount);
    if (!move) return;
    setCareer({
      ...career,
      balance: move.wallet,
      characters: { ...career.characters, [career.playerSlug]: move.ch },
    });
  };

  // Standing contracts come out of the wallet, not out of the month: no slot
  // is spent, so the shop stays open all window
  const invest = (id: InvestmentId) => {
    if (!career) return;
    const ch = career.characters[career.playerSlug];
    const cost = nextInvestmentCost(
      ch,
      id,
      seasonPriceScale(career, 'investment')
    );
    if (cost === null || career.balance < cost) return;
    const after = buyInvestment(ch, id);
    setCareer({
      ...career,
      balance: career.balance - cost,
      characters: { ...career.characters, [career.playerSlug]: after },
      newsQueue: [
        ...career.newsQueue,
        investmentNews(career.playerSlug, id, investmentLevel(after, id)),
      ],
    });
    flashToast(
      fmt(CAREER.toast.invest, {
        name: (CAREER.investments.names as Record<string, string>)[id],
      }),
      ch,
      after,
      -cost,
      { icon: 'invest', scene: `invest-${id}` }
    );
  };

  const doSabotage = (
    targetSlug: string,
    tier: SabotageTier,
    boostSteps: number
  ) => {
    // Plots resolve at the paper, so nothing gets booked once the window is over
    if (!career || career.slotsUsed >= OFFSEASON_SLOTS) return;
    const cost = sabotageTotalCost(
      tier,
      boostSteps,
      seasonPriceScale(career, 'sabotage') *
        sabotageTaxScale(
          career.characters[career.playerSlug],
          career.parliament
        ) *
        greenSabotageScale(career.characters[career.playerSlug]) *
        sabotageRepeatScale(playerPlotsBooked(career))
    );
    const sabCh = career.characters[career.playerSlug];
    if (career.balance < cost) return;
    const afterSab = {
      ...sabCh,
      ego: clampMeter(sabCh.ego + PLOTTING_EGO_GAIN),
    };
    setCareer({
      ...career,
      balance: career.balance - cost,
      characters: { ...career.characters, [career.playerSlug]: afterSab },
      pendingSabotages: [
        ...career.pendingSabotages,
        {
          bySlug: career.playerSlug,
          targetSlug,
          tier,
          chance: sabotageChance(tier, boostSteps),
          cost,
        },
      ],
    });
    flashToast(CAREER.toast.sabotage, sabCh, afterSab, -cost, {
      icon: 'sabotage',
      scene: `sabotage-${tier}`,
    });
  };

  const toNews = () => {
    if (!career) return;
    // The paper prints once; reopening it later just reads the same issue
    if (career.newsSeen) {
      setCareer({ ...career, phase: 'news' });
      return;
    }
    const simulated = simulateOffseason(career);
    const next: SavedCareer = {
      ...settleGlizzyBet(
        simulated,
        simulated.year,
        simulated.season,
        simulated.gliziPricePct ?? 0
      ).state,
      phase: 'news',
      newsSeen: true,
    };
    // The window's signings and a glizacija drop make the news once the
    // reel has shown the player's own hits
    const cued = quotesFor(
      [
        ...sponsorSigningsBetween(career.characters, next.characters),
        ...glizacijaDropsBetween(career, next),
      ],
      next
    );
    quoteAfterReel.current = cued.plays;
    setCareer(cued.state);
    setHitReel(true);
  };

  const backToOffseason = () => {
    if (!career) return;
    setCareer({ ...career, phase: 'offseason', newsSeen: true });
  };

  // The paper is read: the in-form names walk in with the season's stress
  // drop and the table seeds the bracket
  const toCup = () => {
    if (!career) return;
    const buffed = buffedSlugsForSeason(career.season, Object.keys(career.characters));
    const withBuff = Object.fromEntries(
      Object.entries(career.characters).map(([slug, ch]) => [
        slug,
        buffed.has(slug)
          ? { ...ch, stress: Math.max(0, ch.stress - IN_FORM_STRESS_DROP) }
          : ch,
      ])
    );
    // The line the whole season's movement is measured from
    const seeds = rankBySeeding(withBuff, career.playerSlug);
    // The league's donors get first go at the opening round
    setCareer(
      bookAiRemoval(
        {
          ...career,
          characters: withBuff,
          phase: 'cup',
          lastIssue: {
            news: career.newsQueue,
            year: career.year,
            season: career.season,
          },
          newsQueue: [],
          cupStartRanks: seeds,
          cup: {
            rounds: seededRounds(seeds),
            currentRound: 0,
            matchBets: {},
            withdrawn: false,
          },
        },
        0
      )
    );
  };

  // The placings make the news as the podium comes up
  const finishCup = (state: SavedCareer) => {
    if (!state.cup) return;
    const standings = cupStandings(state.cup.rounds);
    const finished = quotesFor([{ kind: 'cup-finished', standings }], state);
    closeCup(finished.state, standings);
    playQuotes(finished.plays);
  };

  const closeCup = (state: SavedCareer, standings: CupStanding[]) => {
    const cup = state.cup;
    if (!cup) return;
    const champion = standings[0]?.slug ?? null;
    const playerPlace =
      standings.find((s) => s.slug === state.playerSlug)?.place ?? 0;
    const placeBySlug = new Map(standings.map((s) => [s.slug, s.place]));
    const playerContract = state.characters[state.playerSlug].sponsor;
    const playerWins = cup.rounds
      .flat()
      .filter((m) => m.result && cupMatchWinner(m) === state.playerSlug).length;
    const sponsorIncome = playerContract
      ? sponsorPayout(
          playerContract,
          playerWins,
          state.characters[state.playerSlug].partyStatus
        )
      : 0;
    const characters = Object.fromEntries(
      Object.entries(state.characters).map(([slug, chStart]) => {
        const place = placeBySlug.get(slug) ?? 0;
        const ch: CharacterCareerState = applyCupPlacement(
          {
            ...chStart,
            titles: slug === champion ? chStart.titles + 1 : chStart.titles,
            titleStreak: slug === champion ? chStart.titleStreak + 1 : 0,
            lastPlace: place,
            fineRecency: Math.max(0, (chStart.fineRecency ?? 0) - 1),
            hitRecency: Math.max(0, (chStart.hitRecency ?? 0) - 1),
          },
          place
        );
        return [slug, ch];
      })
    );
    // Every placed coach takes his prize
    placeBySlug.forEach((place, slug) => {
      const prize = cupPrizeFor(place);
      if (slug === state.playerSlug || prize <= 0) return;
      characters[slug] = {
        ...characters[slug],
        money: (characters[slug].money ?? 0) + prize,
      };
    });
    // The podium belongs to the hall, not the scoreboard: a big name gets
    // carried out, an unknown gets reminded the room wanted someone else
    const championFame = champion
      ? (characters[champion]?.fame ?? NEUTRAL_FAME)
      : NEUTRAL_FAME;
    const cheering = crowdCheersChampion(championFame);
    const podiumVolume = crowdIntensity(championFame, FINAL_CROWD_BOOST);
    if (cheering) playCheerSound(podiumVolume);
    else playBooSound(podiumVolume);
    setCareer({
      ...state,
      phase: 'podium',
      balance:
        state.balance + cupPrizeFor(playerPlace) + sponsorIncome,
      characters,
      cupRecap: cupRecapNews({ ...state, characters }, cup.rounds, standings),
      standingsHistory: [
        ...state.standingsHistory,
        {
          year: state.year,
          season: state.season,
          champion: champion ?? '',
          playerPlace,
          ranks: rankBySeeding(characters, state.playerSlug),
          points: Object.fromEntries(
            Object.entries(characters).map(([slug, ch]) => [
              slug,
              careerPoints(ch),
            ])
          ),
        },
      ],
    });
  };

  const podiumContinue = () => {
    if (!career) return;
    setCareer({
      ...career,
      phase: (career.cupRecap ?? []).length > 0 ? 'recap' : 'standings',
    });
  };

  // The standings close the season. After the Frozen cup of a year between
  // two counts the chamber votes on a law first, and the season turns once
  // the vote is in
  const advanceSeason = () => {
    if (!career) return;
    if (career.parliament?.lawBallot) return;
    const crowning = campaignFinished(career)
      ? null
      : crownedLeader(
          career.characters,
          career.playerSlug,
          overlordGoal(career)
        );
    if (!crowning && lawVoteDue(career) && career.parliament) {
      const ballot = openLawBallot(career);
      if (ballot) {
        setCareer(withLawBallot(career, ballot));
        return;
      }
    }
    advanceFrom(career);
  };

  const withLawBallot = (state: SavedCareer, ballot: LawBallot) =>
    state.parliament
      ? {
          ...state,
          parliament: {
            ...state.parliament,
            lawBallot: lawBallotReady(ballot)
              ? closeLawBallot(state, ballot)
              : ballot,
          },
        }
      : state;

  const pickLaw = (index: number) => {
    const ballot = career?.parliament?.lawBallot;
    if (!career || !ballot || ballot.picker !== career.playerSlug) return;
    setCareer(withLawBallot(career, pickLawCard(career, ballot, index)));
  };

  const castLawVote = (vote: LawVote) => {
    const ballot = career?.parliament?.lawBallot;
    if (!career || !ballot) return;
    setCareer(withLawBallot(career, voteLaw(ballot, career.playerSlug, vote)));
  };

  // The verdict is read: a vote the player walked away from is cast for him,
  // the books change, and the season turns
  const concludeLaws = () => {
    const ballot = career?.parliament?.lawBallot;
    if (!career || !ballot) return;
    advanceFrom(applyLawBallot(career, closeLawBallot(career, ballot)));
  };

  const advanceFrom = (from: SavedCareer) => {
    // The campaign ends the first time anyone tops the table with the
    // crown's points, the player's character or not, or on the law vote
    // that hands one party the city
    const crowned = campaignFinished(from)
      ? null
      : crownedLeader(from.characters, from.playerSlug, overlordGoal(from));
    const ended = crowned !== null || constitutionWin(from.parliament) !== null;
    const wrapped = from.season === SEASON_COUNT - 1;
    // The calendar archive keeps every quarter of every year browsable
    const logsByYear = { ...(from.logsByYear ?? {}) };
    const yearLogs = (logsByYear[from.year] ?? [[], [], [], []]).map((l) => [
      ...l,
    ]);
    yearLogs[from.season] = from.slotLog;
    logsByYear[from.year] = yearLogs;
    const electionDue = wrapped && isElectionYear(from.year);
    setCareer(
      beginOffseason({
        ...from,
        logsByYear,
        ...(electionDue
          ? {
              parliament: {
                ...(from.parliament ?? emptyParliament()),
                pendingResult: countElection(from),
              },
            }
          : {}),
        ...(crowned
          ? {
              overlordSlug: crowned,
              overlordWon: crowned === from.playerSlug,
            }
          : {}),
        lastIssue:
          (from.cupRecap ?? []).length > 0
            ? {
                news: from.cupRecap ?? [],
                year: from.year,
                season: from.season,
              }
            : from.lastIssue,
        prevIssue:
          (from.cupRecap ?? []).length > 0 ? from.lastIssue : undefined,
        cupRecap: [],
        lastCupRanks: rankBySeeding(from.characters, from.playerSlug),
        season: wrapped ? 0 : from.season + 1,
        year: wrapped ? from.year + 1 : from.year,
        // A new year opens with the rival shortlist and a clean suspect file
        ...(wrapped
          ? { rivalChoice: rivalCandidates(from), saboteursThisYear: [] }
          : {}),
      })
    );
    setUiStage(ended ? 'finale' : 'career');
    setShowTable(false);
    if (electionDue && !ended) setElectionOpen(true);
  };

  const confirmStartNew = () => {
    if (activeSlot) careerSave.clear(activeSlot);
    setCareer(null);
    setUiStage('intro');
  };

  const backToSlots = () => {
    setCareer(null);
    setActiveSlot(null);
    setUiStage('start');
    setConfirmReset(false);
    setShowSettings(false);
    setShowTable(false);
    setShowCalendar(false);
    setDossierSlug(null);
    setDossierInfo(null);
    setElectionOpen(false);
    setRivalOpen(false);
    setToast(null);
    setCutscene(null);
    setHitReel(false);
    setQuoteQueue([]);
    quoteAfterReel.current = [];
  };

  const resetFromSettings = () => {
    if (activeSlot) careerSave.clear(activeSlot);
    setCareer(null);
    setConfirmReset(false);
    setShowSettings(false);
    setShowTable(false);
    setShowCalendar(false);
    setUiStage('intro');
  };

  const playerCharacter = career
    ? (characterBySlug.get(career.playerSlug) ?? null)
    : null;
  const standings: CupStanding[] | null =
    career?.phase === 'podium' && career.cup
      ? cupStandings(career.cup.rounds)
      : null;

  const calendarLabel = career
    ? `${
        career.phase === 'offseason'
          ? (CAREER.offseason.months[career.season]?.[
              Math.min(career.slotsUsed, OFFSEASON_SLOTS - 1)
            ] ?? seasonName(career.season))
          : seasonName(career.season)
      } · ${fmt(CAREER.hud.year, { year: career.year })}`
    : '';

  const topBar =
    career && playerCharacter ? (
      <div className="flex w-full flex-wrap items-center gap-1.5 min-[400px]:gap-2">
        <CareerChip
          onClick={() => setShowCalendar(true)}
          title={CAREER.actions.calendar}
          className="inline-flex items-center gap-1.5 px-2 py-1 uppercase min-[400px]:px-3 xl:px-3.5 xl:py-1.5"
        >
          <ActionIcon
            kind="calendar"
            className="hidden h-3.5 w-3.5 text-[#fdf0c8] min-[380px]:block xl:h-4 xl:w-4"
          />
          {calendarLabel}
        </CareerChip>
        <CareerChip
          onClick={() => setDossierSlug(career.playerSlug)}
          title={CAREER.meters.title}
          className="inline-flex items-center gap-1.5 py-1 pl-1.5 pr-1.5 uppercase sm:pr-3 xl:py-1.5 xl:pl-2 xl:pr-3.5"
        >
          <PortraitHead
            character={playerCharacter}
            className="h-4 w-4 xl:h-5 xl:w-5"
          />
          <span className="hidden sm:inline">
            {fmt(CAREER.hud.coach, { name: playerCharacter.name })}
          </span>
        </CareerChip>
        <CareerWalletChip balance={career.balance} />
        {career.phase === 'offseason' && (
          <CareerIconButton
            label={CAREER.table.title}
            onClick={() => setShowTable(true)}
          >
            <ActionIcon kind="table" className="h-3.5 w-3.5" />
          </CareerIconButton>
        )}
        <span className="ml-auto flex items-center gap-2">
          <GearButton onClick={() => setShowSettings(true)} />
        </span>
      </div>
    ) : null;

  const overlordSlug = career ? campaignOverlord(career) : null;
  const constitution = constitutionWin(career?.parliament);
  const constitutionWinners = (constitution?.winners ?? []).flatMap((slug) => {
    const character = characterBySlug.get(slug);
    return character ? [character] : [];
  });
  const overlordCharacter = overlordSlug
    ? (characterBySlug.get(overlordSlug) ?? null)
    : null;
  const playerSponsorId =
    career?.characters[career.playerSlug]?.sponsor?.sponsorId ?? null;

  return (
    <div
      ref={cardRef}
      data-motion={ambientMotion ? 'full' : 'lite'}
      className="group relative w-full overflow-hidden rounded-[9px] bg-[#060912] shadow-[0_0_0_1px_#160c05,0_14px_0_-8px_rgb(0_0_0/0.5)] fullscreen:flex fullscreen:flex-col fullscreen:overflow-y-auto fullscreen:rounded-none fullscreen:shadow-none fullscreen:fixed fullscreen:inset-0 fullscreen:z-[80] fullscreen:h-[calc(100dvh/var(--game-zoom,1))] fullscreen:overscroll-contain"
    >
      {/* Raised while an overlay is open, or the site's sticky header covers its sign */}
      <div className="relative z-10 flex flex-col items-center text-center has-[.fixed]:z-[60]">
        {quoteQueue.length > 0 && !electionOpen && (
          <QuoteCutscene
            queue={quoteQueue}
            characterBySlug={characterBySlug}
            onDone={finishQuotes}
          />
        )}
        {showSettings && (
          <GameSettingsModal
            fullscreenTarget={cardRef}
            sponsorId={playerSponsorId}
            achievementGame="manager"
            broadcastToggles={['commentator', 'cutscenes']}
            townDisplay
            onClose={() => {
              setShowSettings(false);
              setConfirmReset(false);
            }}
          >
            {uiStage !== 'start' && (
              <div className="flex flex-col items-center gap-3 border-t border-[#b8862f]/40 pt-3">
                {confirmReset ? (
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm font-semibold text-red-200">
                      {CAREER.start.confirmNew}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <CareerButton
                        tone="danger"
                        onClick={resetFromSettings}
                      >
                        {CAREER.start.confirmYes}
                      </CareerButton>
                      <CareerButton
                        tone="quiet"
                        onClick={() => setConfirmReset(false)}
                      >
                        {CAREER.start.confirmNo}
                      </CareerButton>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap justify-center gap-2">
                    <CareerButton
                      tone="quiet"
                      onClick={backToSlots}
                    >
                      {CAREER.start.slots}
                    </CareerButton>
                    {(career || saved) && (
                      <CareerButton
                        tone="danger"
                        onClick={() => setConfirmReset(true)}
                      >
                        {CAREER.start.button}
                      </CareerButton>
                    )}
                  </div>
                )}
              </div>
            )}
          </GameSettingsModal>
        )}
        {deletingSlot && (
          <CareerSlotDeleteModal
            slot={deletingSlot}
            onConfirm={deleteSlot}
            onClose={() => setDeletingSlot(null)}
          />
        )}
        {uiStage === 'start' && (
          <div className="relative h-[calc(100dvh/var(--game-zoom,1)_-_10rem)] min-h-[34rem] w-full overflow-hidden group-fullscreen:h-[calc(100dvh/var(--game-zoom,1))]">
            <SeasonBackdrop season={slots.find(Boolean)?.season ?? 0} />
            <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/70 via-[#020617]/25 to-[#020617]/70" />
            <div className="absolute right-2 top-2 z-40 flex items-center gap-2">
              <GearButton onClick={() => setShowSettings(true)} />
            </div>
            <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 px-4 sm:gap-5">
              <BrassPlate>
                <GlizzyIcon variant={0} className="h-3 w-5" />
                {CAREER.start.league}
              </BrassPlate>
              <span
                className="rounded-[6px] border-[3px] border-[#f1f5f9] bg-[#1e3a8a] px-6 py-1.5 font-sign text-[44px] font-extrabold uppercase leading-none tracking-[0.08em] text-[#ffffff] shadow-[0_0_0_2px_#0c1a44,0_6px_0_rgb(0_0_0/0.45)] sm:text-[60px]"
              >
                {CAREER.start.screen}
              </span>
              <CareerSlotPicker
                slots={slots}
                onNew={startInSlot}
                onContinue={resumeCareer}
                onDelete={setDeletingSlot}
              />
            </div>
          </div>
        )}

        {(uiStage === 'intro' || uiStage === 'select') && (
          <div className="relative flex min-h-[calc(100dvh/var(--game-zoom,1)_-_10rem)] w-full flex-col items-center justify-center overflow-hidden px-3 py-6 group-fullscreen:min-h-[calc(100dvh/var(--game-zoom,1))] sm:px-6">
            <SeasonBackdrop season={0} />
            <div className="absolute inset-0 bg-[#020617]/55" />
            <div className="absolute right-2 top-2 z-40 flex items-center gap-2">
              <GearButton onClick={() => setShowSettings(true)} />
            </div>
            <div className="relative z-10 flex w-full justify-center">
              {uiStage === 'intro' ? (
                <CareerIntroCutscene onDone={() => setUiStage('select')} />
              ) : (
                <div className="flex w-full flex-col items-center gap-4 pt-8 sm:pt-0">
                  <CrownPointsPicker
                    value={crownPoints}
                    onChange={setCrownPoints}
                  />
                  <ClassifiedsSelect
                    characters={characters}
                    onSelect={(slug) => newCareer(slug)}
                    onReroll={() => setApplicants(generateLeague(randomSeed()))}
                    ownNameProblem={(name) =>
                      ownNameProblem(applicants, name, ownNameSlot)
                    }
                    onOwnName={(name) => {
                      const next = withOwnName(applicants, name, ownNameSlot);
                      const index = applicants.findIndex(
                        (entry) => entry.slug === ownNameSlot
                      );
                      setApplicants(next);
                      newCareer(next[index].slug, next);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {uiStage === 'finale' &&
          career &&
          playerCharacter &&
          constitution && (
            <SeasonStage season={career.season} topBar={topBar}>
              <ConstitutionCelebration
                party={constitution.party}
                winners={constitutionWinners}
                player={playerCharacter}
                playerPlace={
                  rankBySeeding(career.characters, career.playerSlug).indexOf(
                    career.playerSlug
                  ) + 1
                }
                onContinue={() => setUiStage('report')}
              />
            </SeasonStage>
          )}

        {uiStage === 'finale' &&
          career &&
          playerCharacter &&
          overlordCharacter && (
            <SeasonStage season={career.season} topBar={topBar}>
              <OverlordCelebration
                character={overlordCharacter}
                player={playerCharacter}
                playerPlace={
                  rankBySeeding(career.characters, career.playerSlug).indexOf(
                    career.playerSlug
                  ) + 1
                }
                points={overlordGoal(career)}
                onContinue={() => setUiStage('report')}
              />
            </SeasonStage>
          )}

        {uiStage === 'report' && career && (overlordSlug || constitution) && (
          <SeasonStage season={career.season} topBar={topBar}>
            <CampaignReport
              career={career}
              characters={characters}
              overlordSlug={overlordSlug}
              onNewCareer={confirmStartNew}
            />
          </SeasonStage>
        )}

        {uiStage === 'career' && career && playerCharacter && (
          <>
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
                  <span className="flex min-w-0 flex-col items-end text-right">
                    <span className="max-w-full truncate font-sign text-[12px] font-bold uppercase leading-tight tracking-[0.04em] text-[#f0c36a] sm:text-[13px]">
                      {plural(CAREER.table.goal, overlordGoal(career), {
                        points: overlordGoal(career),
                      })}
                    </span>
                    <span className="max-w-full truncate font-sign text-[12px] font-semibold leading-tight tabular-nums text-[#e2d7bd] sm:text-[13px]">
                      {plural(CAREER.table.goalProgress, overlordGoal(career), {
                        points: careerPoints(
                          career.characters[career.playerSlug]
                        ),
                        goal: overlordGoal(career),
                        place: ordinal(
                          rankBySeeding(
                            career.characters,
                            career.playerSlug
                          ).indexOf(career.playerSlug) + 1
                        ),
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
                    character={
                      characterBySlug.get(dossierSlug) as DuelCharacter
                    }
                    state={career.characters[dossierSlug]}
                    place={
                      rankBySeeding(
                        career.characters,
                        career.playerSlug
                      ).indexOf(dossierSlug) + 1
                    }
                    reveal={scoutReveal(
                      career.characters[career.playerSlug],
                      dossierSlug === career.playerSlug
                    )}
                    scoutLevel={scoutLevel(
                      career.characters[career.playerSlug]
                    )}
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
            {career.phase === 'offseason' &&
              electionOpen &&
              career.parliament?.pendingResult && (
                <ElectionNightCutscene
                  result={career.parliament.pendingResult}
                  premier={electionPremier(
                    career,
                    career.parliament.pendingResult
                  )}
                  playerSponsor={playerSponsorId}
                  playerSlug={career.playerSlug}
                  characterBySlug={characterBySlug}
                  onVote={voteForCoalition}
                  onClose={() => {
                    setElectionOpen(false);
                    concludeElection();
                  }}
                />
              )}

            {career.parliament?.lawBallot &&
              (career.parliament.lawBallot.outcome === null ? (
                <LawBallotDialog
                  ballot={career.parliament.lawBallot}
                  playerSlug={career.playerSlug}
                  characterBySlug={characterBySlug}
                  laws={lawsInForce(career.parliament)}
                  onPick={pickLaw}
                  onVote={castLawVote}
                />
              ) : (
                <LawVoteCutscene
                  ballot={career.parliament.lawBallot}
                  seats={career.parliament.seats}
                  characterBySlug={characterBySlug}
                  viewerSlug={career.playerSlug}
                  onClose={concludeLaws}
                />
              ))}

            {career.phase === 'offseason' && (
              <OffseasonScreen
                career={career}
                characters={characters}
                topBar={topBar}
                toast={toast}
                cutscene={cutscene}
                onCloseCutscene={() => setCutscene(null)}
                onOpenTable={() => setShowTable(true)}
                onOpenDossier={() => setDossierSlug(career.playerSlug)}
                pendingElection={Boolean(career.parliament?.pendingResult)}
                pendingRival={(career.rivalChoice?.length ?? 0) > 0}
                onOpenElection={() => setElectionOpen(true)}
                onOpenRival={() => setRivalOpen(true)}
                onTrain={train}
                onRest={rest}
                onMedia={doMedia}
                onIsland={doIsland}
                onGuard={doGuard}
                onInvest={invest}
                onBorrow={(amount) => moveLoan('borrow', amount)}
                onRepay={(amount) => moveLoan('repay', amount)}
                onGlizzyBet={glizzyBet}
                onCancelGlizzyBet={dropGlizzyBet}
                onSabotage={doSabotage}
                onOpenNews={toNews}
                onToCup={toCup}
                onDismissToast={() => setToast(null)}
                onMarkMailRead={markMailRead}
                onMarkAllMailRead={markAllMailRead}
                onAcceptSponsor={acceptSponsor}
                onDonate={donate}
              />
            )}

            {career.phase === 'offseason' &&
              rivalOpen &&
              (career.rivalChoice?.length ?? 0) > 0 && (
                <RivalChoiceDialog
                  candidates={career.rivalChoice ?? []}
                  characterBySlug={characterBySlug}
                  player={characterBySlug.get(career.playerSlug)}
                  onChoose={chooseRival}
                />
              )}

            {career.phase === 'news' && (
              <SeasonStage season={career.season} topBar={topBar}>
                <NewspaperSpread
                  news={career.newsQueue}
                  season={career.season}
                  year={career.year}
                  characterBySlug={characterBySlug}
                  onDone={backToOffseason}
                />
                {hitReel && playerCharacter && (
                  <SabotageHitReel
                    news={career.newsQueue}
                    slug={career.playerSlug}
                    character={playerCharacter}
                    season={career.season}
                    onDone={() => {
                      setHitReel(false);
                      const plays = quoteAfterReel.current;
                      quoteAfterReel.current = [];
                      playQuotes(plays);
                    }}
                  />
                )}
              </SeasonStage>
            )}

            {career.phase === 'recap' && (
              <SeasonStage season={career.season} topBar={topBar}>
                <NewspaperSpread
                  news={career.cupRecap ?? []}
                  season={career.season}
                  year={career.year}
                  characterBySlug={characterBySlug}
                  cta={CAREER.podium.toTable}
                  onDone={() => setCareer({ ...career, phase: 'standings' })}
                />
              </SeasonStage>
            )}

            {career.phase === 'standings' && (
              <SeasonStage season={career.season} topBar={topBar}>
                <div className="flex w-full max-w-2xl flex-wrap items-center justify-between gap-2">
                  <BrassPlate>{CAREER.table.finalTitle}</BrassPlate>
                  <CareerButton tone="danger" onClick={advanceSeason}>
                    {CAREER.podium.backToOffSeason}
                  </CareerButton>
                </div>
                <div className="w-full max-w-2xl">
                  <CareerTable
                    characters={career.characters}
                    characterBySlug={characterBySlug}
                    playerSlug={career.playerSlug}
                    lastCupRanks={career.lastCupRanks}
                    rivalSlug={career.rivalSlug}
                    primeMinisterSlug={primeMinister(career)}
                    onSelect={setDossierSlug}
                  />
                </div>
              </SeasonStage>
            )}

            {career.phase === 'cup' && (
              <CareerCupPhase
                career={career}
                characterBySlug={characterBySlug}
                topBar={topBar}
                onOpenTable={() => setShowTable(true)}
                onUpdate={setCareer}
                onFinish={finishCup}
                onMatchResult={onCupMatchResult}
                slot={activeSlot ?? undefined}
              />
            )}

            {career.phase === 'podium' && standings && (
              <SeasonStage season={career.season} topBar={topBar}>
                <PaperSheet className="px-4 py-1.5 font-serif text-lg font-bold">
                  {standings[0]?.slug === career.playerSlug ? (
                    <span className="text-green-400">
                      {fmt(CAREER.podium.champion, {
                        name: playerCharacter.name,
                      })}
                    </span>
                  ) : (
                    <span className="text-red-400">
                      {fmt(CAREER.podium.playerPlace, {
                        name: playerCharacter.name,
                        place: ordinal(
                          standings.find((s) => s.slug === career.playerSlug)
                            ?.place ?? 0
                        ),
                      })}
                    </span>
                  )}
                </PaperSheet>
                <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
                  {(() => {
                    const place =
                      standings.find((s) => s.slug === career.playerSlug)
                        ?.place ?? 0;
                    const prize = cupPrizeFor(place);
                    return prize > 0 ? (
                      <BrassPlate className="tabular-nums">
                        {plural(CAREER.podium.prize, prize, { amount: prize })}
                      </BrassPlate>
                    ) : null;
                  })()}
                  <BrassPlate className="tabular-nums">
                    {fmt(CAREER.podium.streak, {
                      streak: career.characters[career.playerSlug].titleStreak,
                    })}
                  </BrassPlate>
                </div>
                <TournamentPodium
                  standings={standings}
                  characterBySlug={characterBySlug}
                  betSlug={career.playerSlug}
                  theme={seasonThemeIndex(career.season)}
                />
                <CareerButton
                  tone="danger"
                  size="lg"
                  onClick={podiumContinue}
                >
                  {CAREER.podium.continue}
                </CareerButton>
              </SeasonStage>
            )}
          </>
        )}
      </div>
    </div>
  );
}
