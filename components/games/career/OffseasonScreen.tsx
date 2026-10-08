import { useState } from 'react';
import ActionButton from '@/components/games/career/ActionButton';
import ActionCutscene, {
  type ActionCutsceneState,
} from '@/components/games/career/ActionCutscene';
import ActionReceipt, {
  type ActionReceiptToast,
} from '@/components/games/career/ActionReceipt';
import ActionIcon from '@/components/icons/ActionIcon';
import BoltIcon from '@/components/icons/BoltIcon';
import BowlIcon from '@/components/icons/BowlIcon';
import Icon from '@/components/icons/Icon';
import CalendarSeasonRow from '@/components/games/career/CalendarSeasonRow';
import CareerMailbox from '@/components/games/career/CareerMailbox';
import GlizacijaPanel from '@/components/games/career/GlizacijaPanel';
import GlizacijaPill from '@/components/games/career/GlizacijaPill';
import GuardDialog from '@/components/games/career/GuardDialog';
import GovernmentEffectsInfoPanel from '@/components/games/career/GovernmentEffectsInfoPanel';
import InfoButton from '@/components/games/career/InfoButton';
import MetersInfoPanel from '@/components/games/career/MetersInfoPanel';
import InvestmentCard from '@/components/games/career/InvestmentCard';
import MailboxButton from '@/components/games/career/MailboxButton';
import NewspaperSpread from '@/components/games/career/NewspaperSpread';
import ShopCard from '@/components/games/career/ShopCard';
import MetersSide from '@/components/games/career/MetersSide';
import SabotageDialog from '@/components/games/career/SabotageDialog';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import SponsorModal from '@/components/games/career/SponsorModal';
import ParliamentPanel from '@/components/games/career/ParliamentPanel';
import {
  campaignLetterOpen,
  ostrvoWeekendEveryWindow,
  parliamentOpen,
  sabotageTaxScale,
  strankaLeadMedia,
  strankaLeadTrainingScale,
  strankaMediaMultiplier,
} from '@/lib/utils/careerElections';
import TrainingCard from '@/components/games/career/TrainingCard';
import TrainingScene from '@/components/games/career/TrainingScene';
import { useMoodAmbience } from '@/components/games/career/useMoodAmbience';
import {
  APPETITE_REGROWTH,
  FASTING_AMBITION_GAIN,
  FASTING_APPETITE_GAIN,
  FASTING_STRESS,
  MEDIA_AMBITION_GAIN,
  MEDIA_EGO_GAIN,
  MEDIA_SCANDAL_EGO_GAIN,
  MEDIA_SCANDAL_FAME_SCALE,
  MEDIA_SCANDAL_STRESS,
  MEDIA_STRESS,
  REST_DRIFT,
  REST_EGO_TARGET,
  REST_FAME_DROP,
  REST_SIDE_DRIFT,
  REST_STRESS_DROP,
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
import { careerMoodActivityFor } from '@/lib/utils/careerMood';
import { rankBySeeding } from '@/lib/utils/careerPoints';
import {
  guardCost,
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
import { ostrvoSabotageScale } from '@/lib/utils/careerSponsors';
import { SPONSOR_THEMES } from '@/lib/constants/sponsorThemes';
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
import { fmt, plural, signedNumber } from '@/lib/utils/format';

const OS = GAMES_UI.career.offseason;
const T = GAMES_UI.career.trainings;
const SPONSORS = GAMES_UI.career.sponsors;
const SAB = GAMES_UI.career.sabotage;
const A = GAMES_UI.career.actions;
const M = GAMES_UI.career.meters;
const NP = GAMES_UI.career.newspaper;
const MAIL = GAMES_UI.career.mail;
const INV = GAMES_UI.career.investments;
const TABLE = GAMES_UI.career.table;
const PARL = GAMES_UI.career.parliament;

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
  | 'invest'
  | 'parliament'
  | 'glizacija'
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
}) {
  const [modal, setModal] = useState<ModalKind>(null);
  const [info, setInfo] = useState<'government' | 'meters' | null>(
    null,
  );
  const ch = career.characters[career.playerSlug];
  // He keeps making the noise his mood makes, but not while a panel is over him
  useMoodAmbience(
    careerMoodActivityFor(ch),
    modal === null && info === null && cutscene === null,
  );
  const busy = pendingElection || pendingRival;
  const slotsFull = career.slotsUsed >= OFFSEASON_SLOTS;
  // Nothing in the window moves while the city has business with the player
  const locked = slotsFull || busy;
  const plotsBooked = playerPlotsBooked(career);
  const contract = ch.sponsor;
  const unreadMail = career.mail.filter((m) => !m.read).length;
  const stateMedia = contract?.sponsorId === 'stranka';
  const builderGuard = contract?.sponsorId === 'zidari';
  const islandAvailable =
    contract?.sponsorId === 'ostrvo' &&
    (ostrvoWeekendEveryWindow(ch)
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
    ostrvoSabotageScale(ch) *
    sabotageRepeatScale(plotsBooked);
  const mediaMultiplier = stateMedia
    ? strankaMediaMultiplier(ch.partyStatus)
    : 1;
  const leadMedia = strankaLeadMedia(ch, career.parliament);
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

  return (
    <div className="w-full">
      {playerCharacter && (
        <TrainingScene
          character={playerCharacter}
          season={career.season}
          sponsorId={contract?.sponsorId ?? null}
          mood={ch}
          className="h-[calc(100dvh-10rem)] min-h-[34rem] group-[:fullscreen]:h-dvh"
        >
          {/* everything lives inside the scene */}
          <div className="absolute inset-x-2 top-2 z-40">{topBar}</div>

          {/* the running quarter as a timeline, only where the rails leave room */}
          <div className="pointer-events-none absolute left-1/2 top-14 z-20 hidden w-[34rem] max-w-[52%] -translate-x-1/2 rounded-2xl bg-slate-950/55 backdrop-blur-sm lg:block xl:w-[38rem]">
            <CalendarSeasonRow
              career={career}
              year={career.year}
              quarter={career.season}
            />
          </div>

          {/* the left column: sponsor, table and parliament in a row, the action rail below */}
          <div className="absolute left-2 top-14 z-30 flex flex-col items-start gap-2 sm:w-36 sm:items-stretch xl:w-56 xl:gap-2.5">
            <div className="flex items-center gap-1.5 self-stretch xl:gap-2">
              <button
                onClick={() => onOpenDossier()}
                title={SPONSORS.title}
                className={`flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-2xl border px-2 backdrop-blur-sm transition xl:justify-start ${
                  contract
                    ? SPONSOR_THEMES[contract.sponsorId].chrome
                    : 'border-sky-200/15 bg-slate-950/70 hover:border-sky-200/40'
                }`}
              >
                {contract ? (
                  <>
                    <SponsorEmblem
                      sponsorId={contract.sponsorId}
                      className="h-5 w-5 shrink-0"
                    />
                    <span className="hidden min-w-0 text-left text-[9px] font-bold uppercase leading-[1.15] tracking-wider text-slate-200 xl:line-clamp-2">
                      {
                        (SPONSORS.names as Record<string, string>)[
                          contract.sponsorId
                        ]
                      }
                    </span>
                  </>
                ) : (
                  <>
                    <span className="flex h-5 w-5 items-center justify-center text-[11px] font-bold text-slate-500">
                      ?
                    </span>
                    <span className="hidden min-w-0 text-left text-[9px] font-bold uppercase leading-[1.15] tracking-wider text-slate-500 xl:line-clamp-2">
                      {SPONSORS.none}
                    </span>
                  </>
                )}
              </button>
              <button
                onClick={onOpenTable}
                title={TABLE.title}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-sky-200/15 bg-slate-950/70 text-sky-300 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-sky-200/40 hover:text-white"
              >
                <ActionIcon kind="table" className="h-5 w-5" />
              </button>
              {parliamentOpen(career) && (
                <button
                  onClick={() => setModal('parliament')}
                  title={PARL.title}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-sky-200/15 bg-slate-950/70 text-sky-300 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-sky-200/40 hover:text-white"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 19a9 9 0 0 1 18 0"
                      className="fill-none stroke-current"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M7 19a5 5 0 0 1 10 0"
                      className="fill-none stroke-current"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="12" cy="19" r="1.6" className="fill-current" />
                  </svg>
                </button>
              )}
            </div>

            <GlizacijaPill
              career={career}
              onOpen={() => setModal('glizacija')}
            />
            <div
              aria-hidden="true"
              className="h-px w-full self-stretch bg-gradient-to-r from-sky-200/40 via-sky-200/15 to-transparent"
            />

            {/* the action rail */}
            <div className="flex flex-col items-start gap-1.5 self-stretch sm:items-stretch xl:gap-2">
              <ActionButton
                icon="training"
                label={A.training}
                compact
                disabled={locked}
                onClick={() => setModal('training')}
              />
              <ActionButton
                icon="rest"
                label={T.rest.name}
                tone="green"
                compact
                disabled={busy || (slotsFull && !islandAvailable)}
                onClick={() => setModal('rest')}
              />
              <ActionButton
                icon="media"
                label={A.media}
                sub={
                  mediaSpent
                    ? null
                    : `+${interviewPay}${mediaLeft > 1 ? ` ×${mediaLeft}` : ''}`
                }
                tone="gold"
                compact
                disabled={mediaSpent || locked}
                onClick={() => setModal('media')}
              />
              {contract && (
                <ActionButton
                  icon="invest"
                  label={A.invest}
                  tone="gold"
                  compact
                  onClick={() => setModal('invest')}
                />
              )}
              {mechanicsUnlocked && (
                <>
                  <ActionButton
                    icon="sabotage"
                    label={SAB.action}
                    sub={
                      plotsBooked > 0
                        ? fmt(SAB.booked, { n: plotsBooked })
                        : null
                    }
                    tone="danger"
                    compact
                    disabled={locked}
                    onClick={() => setModal('sabotage')}
                  />
                  <ActionButton
                    icon="guard"
                    label={career.guarded || builderGuard ? A.guarded : A.guard}
                    tone="gold"
                    compact
                    disabled={
                      locked ||
                      builderGuard ||
                      career.guarded === true ||
                      career.balance < guardFromCost
                    }
                    onClick={() => setModal('guard')}
                  />
                </>
              )}
            </div>
          </div>

          {/* the right column: mailbox, league news and the cup gate in a row, the meters below */}
          <div className="absolute right-2 top-24 z-30 flex flex-col items-end gap-2 sm:top-14 sm:w-36 xl:w-44 xl:gap-2.5">
            <div className="flex items-center justify-end gap-1.5 self-stretch xl:gap-2">
              <MailboxButton
                unread={unreadMail}
                onOpen={() => setModal('mail')}
              />
              {busy && (
                <button
                  onClick={pendingElection ? onOpenElection : onOpenRival}
                  className="flex h-10 min-w-0 flex-1 animate-pulse items-center justify-center gap-2 rounded-2xl border border-red-500/60 bg-red-950/80 px-3 text-[10px] font-bold uppercase tracking-widest text-red-200 backdrop-blur-sm transition hover:animate-none hover:border-red-400 hover:text-white"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-300" />
                  <span className="truncate">
                    {pendingElection ? OS.electionButton : OS.rivalButton}
                  </span>
                </button>
              )}
              {career.lastIssue && !career.newsSeen && !busy && (
                <button
                  onClick={() => setModal('paper')}
                  title={OS.lastPaper}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-sky-200/15 bg-slate-950/70 text-slate-400 opacity-70 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-sky-200/40 hover:text-white"
                >
                  <ActionIcon kind="news" className="h-5 w-5" />
                </button>
              )}
              {slotsFull && !busy && !hideCupGate && (
                <button
                  onClick={onOpenNews}
                  title={OS.newsButton}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border backdrop-blur-sm transition hover:-translate-y-0.5 ${
                    career.newsSeen
                      ? 'border-sky-200/15 bg-slate-950/70 text-sky-300 hover:border-sky-200/40 hover:text-white'
                      : 'animate-pulse border-red-500/60 bg-red-950/80 text-red-200 hover:animate-none hover:border-red-400 hover:text-white'
                  }`}
                >
                  <ActionIcon kind="news" className="h-5 w-5" />
                </button>
              )}
              {slotsFull && !busy && career.newsSeen && !hideCupGate && (
                <button
                  onClick={onToCup}
                  title={OS.cupButton}
                  className="flex h-10 w-10 shrink-0 animate-pulse items-center justify-center rounded-2xl border border-amber-400/60 bg-amber-950/80 text-amber-200 backdrop-blur-sm transition hover:-translate-y-0.5 hover:animate-none hover:border-amber-300 hover:text-white"
                >
                  <Icon name="trophy" className="h-5 w-5" />
                </button>
              )}
            </div>

            <div
              aria-hidden="true"
              className="h-px w-full self-stretch bg-gradient-to-l from-sky-200/40 via-sky-200/15 to-transparent"
            />

            <MetersSide ch={ch} onOpen={() => onOpenDossier()} />
          </div>

          {/* the action receipt, bottom right */}
          {toast && (
            <div className="absolute bottom-4 right-4 z-40 animate-[bubblein_0.3s_ease-out]">
              <ActionReceipt toast={toast} onDismiss={onDismissToast} />
            </div>
          )}
        </TrainingScene>
      )}

      {modal === 'glizacija' && (
        <SponsorModal
          sponsorId={contract?.sponsorId ?? null}
          title={OS.glizacija.title}
          onClose={() => setModal(null)}
        >
          <GlizacijaPanel career={career} sponsorId={contract?.sponsorId ?? null} />
        </SponsorModal>
      )}
      {modal === 'paper' && career.lastIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
          <NewspaperSpread
            news={career.lastIssue.news}
            season={career.lastIssue.season}
            year={career.lastIssue.year}
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
          titleExtra={
            <InfoButton
              label={PARL.effects.infoTitle}
              onClick={() => setInfo('government')}
            />
          }
          onClose={() => setModal(null)}
        >
          <ParliamentPanel career={career} characterBySlug={characterBySlug} />
        </SponsorModal>
      )}
      {modal === 'training' && (
        <SponsorModal
          sponsorId={contract?.sponsorId ?? null}
          title={OS.actionsTitle}
          titleExtra={
            <InfoButton label={M.infoTitle} onClick={() => setInfo('meters')} />
          }
          wide
          onClose={() => setModal(null)}
        >
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {TRAINING_ORDER.map((id) => {
              const def = TRAINING_DEFS[id];
              const levelKey = LEVEL_KEY[id as keyof typeof LEVEL_KEY];
              const stat = levelKey ? ch[levelKey] : null;
              const streak = ch.lastTraining === id ? ch.sameTrainingStreak : 0;
              const partyScale = strankaLeadTrainingScale(
                ch,
                career.parliament,
                id,
              );
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
                    onTrain(id);
                    setModal(null);
                  }}
                />
              );
            })}
          </div>
        </SponsorModal>
      )}
      {modal === 'rest' && (
        <SponsorModal
          sponsorId={contract?.sponsorId ?? null}
          title={A.restTitle}
          onClose={() => setModal(null)}
        >
          <div className="flex flex-col gap-2.5">
            <ShopCard
              icon={
                <ActionIcon kind="rest" className="h-8 w-8 text-emerald-300" />
              }
              title={T.rest.name}
              desc={fmt(A.restDesc, {
                stressMin: REST_STRESS_DROP - REST_DRIFT,
                stressMax: REST_STRESS_DROP + REST_DRIFT,
                appetiteMin: APPETITE_REGROWTH - REST_SIDE_DRIFT,
                appetiteMax: APPETITE_REGROWTH + REST_SIDE_DRIFT,
                drift: REST_SIDE_DRIFT,
                ego: REST_EGO_TARGET,
                fame: REST_FAME_DROP,
              })}
              action={{
                label: OS.spendMonth,
                tone: 'neutral',
                disabled: slotsFull,
                onClick: () => {
                  setModal(null);
                  onRest(false);
                },
              }}
            />
            <ShopCard
              icon={<BowlIcon className="h-8 w-8" />}
              title={A.fast}
              desc={fmt(A.fastDesc, {
                gain: FASTING_APPETITE_GAIN,
                amb: FASTING_AMBITION_GAIN,
                stress: FASTING_STRESS,
              })}
              action={{
                label: OS.spendMonth,
                tone: 'neutral',
                disabled: slotsFull,
                onClick: () => {
                  setModal(null);
                  onRest(true);
                },
              }}
            />
            {islandAvailable && (
              <ShopCard
                icon={
                  <ActionIcon kind="island" className="h-8 w-8 text-cyan-300" />
                }
                title={A.island}
                desc={
                  ostrvoWeekendEveryWindow(ch)
                    ? A.islandDescEveryWindow
                    : A.islandDesc
                }
                action={{
                  label: A.islandFree,
                  tone: 'neutral',
                  onClick: () => {
                    setModal(null);
                    onIsland();
                  },
                }}
              />
            )}
          </div>
        </SponsorModal>
      )}
      {modal === 'media' && (
        <SponsorModal
          sponsorId={contract?.sponsorId ?? null}
          title={A.mediaTitle}
          onClose={() => setModal(null)}
        >
          <div className="flex flex-col gap-2.5">
            <ShopCard
              icon={
                <ActionIcon kind="media" className="h-8 w-8 text-sky-300" />
              }
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
              earn={interviewPay}
              action={{
                label: OS.spendMonth,
                tone: 'neutral',
                onClick: () => {
                  setModal(null);
                  onMedia('interview');
                },
              }}
            />
            <ShopCard
              tone="red"
              icon={<BoltIcon className="h-8 w-8 text-red-300" />}
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
              earn={scandalPay}
              action={{
                label: OS.spendMonth,
                tone: 'danger',
                onClick: () => {
                  setModal(null);
                  onMedia('scandal');
                },
              }}
            />
          </div>
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
            onConfirm={(steps) => {
              setModal(null);
              onGuard(steps);
            }}
            onCancel={() => setModal(null)}
          />
        </SponsorModal>
      )}
      {modal === 'invest' && (
        <SponsorModal
          sponsorId={contract?.sponsorId ?? null}
          title={INV.title}
          wide
          onClose={() => setModal(null)}
        >
          <div className="flex flex-col gap-2.5">
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
          </div>
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
              onSabotage(targetSlug, tier, boostSteps);
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
      {cutscene && playerCharacter && (
        <ActionCutscene
          key={cutscene.key}
          scene={cutscene.scene}
          outcome={cutscene.outcome}
          toast={cutscene.toast}
          character={playerCharacter}
          season={career.season}
          onClose={onCloseCutscene}
        />
      )}
    </div>
  );
}
