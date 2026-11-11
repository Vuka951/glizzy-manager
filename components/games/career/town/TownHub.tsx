import { useRef, useState } from 'react';
import ActionReceipt, {
  type ActionReceiptToast,
} from '@/components/games/career/ActionReceipt';
import BankBuilding from '@/components/games/career/town/BankBuilding';
import BillboardBuilding from '@/components/games/career/town/BillboardBuilding';
import CafeBuilding from '@/components/games/career/town/CafeBuilding';
import DockBuilding from '@/components/games/career/town/DockBuilding';
import HomeBuilding from '@/components/games/career/town/HomeBuilding';
import KioskBuilding from '@/components/games/career/town/KioskBuilding';
import ParliamentBuilding from '@/components/games/career/town/ParliamentBuilding';
import PollBuilding from '@/components/games/career/town/PollBuilding';
import PostOfficeBuilding from '@/components/games/career/town/PostOfficeBuilding';
import SecurityFirmBuilding from '@/components/games/career/town/SecurityFirmBuilding';
import TownAlarmChips from '@/components/games/career/town/TownAlarmChips';
import TownBuildingButton from '@/components/games/career/town/TownBuildingButton';
import TownCctvPole from '@/components/games/career/town/TownCctvPole';
import TownGuardBooth from '@/components/games/career/town/TownGuardBooth';
import TownPatrol from '@/components/games/career/town/TownPatrol';
import TownSpyVan from '@/components/games/career/town/TownSpyVan';
import TownTacticsBoard from '@/components/games/career/town/TownTacticsBoard';
import TownCupBus from '@/components/games/career/town/TownCupBus';
import TownCupBusStop from '@/components/games/career/town/TownCupBusStop';
import TownCalendarRow from '@/components/games/career/town/TownCalendarRow';
import TownFlagPole from '@/components/games/career/town/TownFlagPole';
import TownFolkCrowd from '@/components/games/career/town/TownFolkCrowd';
import TownFountain from '@/components/games/career/town/TownFountain';
import TownGate from '@/components/games/career/town/TownGate';
import TownGround from '@/components/games/career/town/TownGround';
import TownLeagueWalkers from '@/components/games/career/town/TownLeagueWalkers';
import TownMeterStrip from '@/components/games/career/town/TownMeterStrip';
import TownPlayerCard from '@/components/games/career/town/TownPlayerCard';
import TownSeasonToy from '@/components/games/career/town/TownSeasonToy';
import TownSignLayer, {
  type TownHoverSink,
  type TownSignSpec,
} from '@/components/games/career/town/TownSignLayer';
import TownSky from '@/components/games/career/town/TownSky';
import TownSponsorBanner from '@/components/games/career/town/TownSponsorBanner';
import TownSponsorChip from '@/components/games/career/town/TownSponsorChip';
import TownSpotlight from '@/components/games/career/town/TownSpotlight';
import TownStage from '@/components/games/career/town/TownStage';
import TownStrayCat from '@/components/games/career/town/TownStrayCat';
import TownStrayDog from '@/components/games/career/town/TownStrayDog';
import TownWalker from '@/components/games/career/town/TownWalker';
import TownWeather from '@/components/games/career/town/TownWeather';
import TrainingCenterBuilding from '@/components/games/career/town/TrainingCenterBuilding';
import TvStationBuilding from '@/components/games/career/town/TvStationBuilding';
import { useTownDisplay } from '@/components/games/career/town/useTownDisplay';
import { useTownReceiptLog } from '@/components/games/career/town/useTownReceiptLog';
import { OFFSEASON_SLOTS } from '@/data/games/careerEconomy';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import { SEAT_COLOR_ORDER } from '@/lib/constants/rooms';
import {
  TOWN_LAYOUTS,
  type TownBuildingId,
  type TownLayoutKey,
} from '@/lib/constants/townLayout';
import type { CoachPublic, CoachTagMap } from '@/lib/types/careerMp';
import type {
  TownBuildingMode,
  TownTrip,
  TownWindow,
} from '@/lib/types/town';
import { countVotes } from '@/lib/utils/careerElections';
import {
  ASSISTANT_TACTICS_LEVEL,
  SECURITY_CCTV_LEVEL,
  SECURITY_PATROL_LEVEL,
} from '@/data/games/careerInvestments';
import { investmentLevel } from '@/lib/utils/careerInvestments';
import type { SavedCareer } from '@/lib/utils/careerSave';

const TOWN = GAMES_UI.career.town;

// What a building does right now, decided by the window's own rules
export type TownBuildingState = {
  mode: TownBuildingMode;
  disabled: boolean;
  sub: string | null;
  // Replaces the building's usual label, e.g. the guarded sign
  label?: string;
  shortLabel?: string;
  // Marks the building without a count, e.g. a debt at the bank
  alert?: boolean;
  onOpen: () => void;
};

export type TownRoom = { coaches: CoachPublic[]; coachId: string };

const LABEL_KEY: Record<TownBuildingId, keyof typeof TOWN.short> = {
  training: 'training',
  home: 'rest',
  media: 'media',
  bank: 'bank',
  cafe: 'cafe',
  security: 'guard',
  parliament: 'parliament',
  post: 'post',
  kiosk: 'paper',
  billboard: 'table',
  poll: 'poll',
  dock: 'dock',
};

// Tall or back-row buildings carry their label on top so nothing in front
// of them hides it
const SIGN_ABOVE: TownBuildingId[] = [
  'media',
  'billboard',
  'poll',
  'dock',
];

const BUILDING_ORDER: TownBuildingId[] = [
  'parliament',
  'media',
  'training',
  'home',
  'security',
  'bank',
  'cafe',
  'post',
  'billboard',
  'poll',
  'kiosk',
  'dock',
];

// One window per seat, the viewer's first. A room lights them from the
// coaches' Gotovo; single player lights only the viewer's
function homeWindows(
  room: TownRoom | undefined,
  playerName: string | null,
): TownWindow[] {
  if (!room) {
    return SEAT_COLOR_ORDER.map((color, i) => ({
      color,
      state: i === 0 ? 'done' : 'empty',
      name: i === 0 ? playerName : null,
    }));
  }
  const me = room.coaches.find((c) => c.id === room.coachId);
  const order = me
    ? [me.color, ...SEAT_COLOR_ORDER.filter((c) => c !== me.color)]
    : SEAT_COLOR_ORDER;
  return order.map((color) => {
    const coach = room.coaches.find((c) => c.color === color);
    if (!coach) return { color, state: 'empty', name: null };
    return {
      color,
      name: coach.name,
      state: coach.done
        ? 'done'
        : coach.connected && !coach.withdrawn
          ? 'choosing'
          : 'offline',
    };
  });
}

// The transfer window as a small town at night: every action a building,
// the HUD over the stage, and him walking between them by mood
export default function TownHub({
  career,
  characterBySlug,
  playerCharacter,
  coaches,
  room,
  topBar,
  gate,
  hideCupGate,
  toast,
  onDismissToast,
  buildings,
  trip,
  sailing,
  onArrive,
  onTripEnd,
  pendingElection,
  pendingRival,
  closing,
  paperFresh,
  onOpenElection,
  onOpenRival,
  onOpenDossier,
  onOpenNews,
  onToCup,
}: {
  career: SavedCareer;
  characterBySlug: Map<string, DuelCharacter>;
  playerCharacter: DuelCharacter | undefined;
  coaches?: CoachTagMap;
  room?: TownRoom;
  topBar: React.ReactNode;
  gate?: React.ReactNode;
  hideCupGate: boolean;
  toast: ActionReceiptToast | null;
  onDismissToast: () => void;
  buildings: Record<TownBuildingId, TownBuildingState>;
  trip: TownTrip | null;
  sailing: boolean;
  onArrive: (trip: TownTrip) => void;
  onTripEnd: (trip: TownTrip) => void;
  pendingElection: boolean;
  pendingRival: boolean;
  // The month is spent and nothing else takes a slot: the town closes for
  // the night and its people head for the bus stop
  closing: boolean;
  // A paper on the kiosk's counter is still unread
  paperFresh: boolean;
  onOpenElection: () => void;
  // Walks him to the TV station, which then opens the rival choice
  onOpenRival: () => void;
  onOpenDossier: () => void;
  // Walks him to the kiosk, which then opens the league paper
  onOpenNews: () => void;
  onToCup: () => void;
}) {
  const [layout, setLayout] = useState<TownLayoutKey>('desk');
  const [boarding, setBoarding] = useState(false);
  const [playerAboard, setPlayerAboard] = useState(false);
  const [crowdAboard, setCrowdAboard] = useState(false);
  const hoverSink = useRef<TownHoverSink['current']>(() => undefined);
  const { labels } = useTownDisplay();
  const receiptLog = useTownReceiptLog(
    toast,
    `${career.year}-${career.season}`,
  );
  const phone = layout === 'phone';
  const place = TOWN_LAYOUTS[layout];
  const ch = career.characters[career.playerSlug];
  const sponsorId = ch.sponsor?.sponsorId ?? null;
  const blueGuard = sponsorId === 'blue';
  // A party in government, leading or as partner, dresses its own building
  const governing = career.parliament?.government ?? [];
  const unread = career.mail.filter((m) => !m.read).length;
  const busy = pendingElection || pendingRival;
  const slotsFull = career.slotsUsed >= OFFSEASON_SLOTS;
  const cupGate = !gate && !hideCupGate;
  const newsReady = cupGate && slotsFull && !busy;
  // The bus pulls in once the league paper has been read
  const cupReady = newsReady && career.newsSeen === true;
  const [folkWaiting] = useState(cupReady);
  const walking = trip !== null || boarding;
  // The new rival is picked at the TV station once the election is watched
  const rivalReady = pendingRival && !pendingElection;
  const humanSlugs = room
    ? room.coaches
        .filter((c) => c.id !== room.coachId && c.slug)
        .map((c) => c.slug as string)
    : [];
  // The one stop the window still requires picks itself out: the new rival
  // at the TV station, the league paper at the kiosk, then the bus to the cup
  const spotlight = walking
    ? null
    : rivalReady
      ? 'media'
      : newsReady && career.newsSeen !== true
        ? 'kiosk'
        : cupReady
          ? 'bus'
          : null;
  // He and the townsfolk waiting at the stop all get on before it leaves
  const busLeaving = playerAboard && (crowdAboard || !closing);
  const boardBus = () => {
    if (walking) return;
    setBoarding(true);
    if (!playerCharacter) setPlayerAboard(true);
  };
  const signPlacement = (id: TownBuildingId): TownSignSpec['placement'] =>
    id === 'media'
      ? 'mid'
      : id === 'parliament'
        ? 'roof'
        : id === 'poll' && phone
          ? 'below'
          : SIGN_ABOVE.includes(id)
          ? 'above'
          : 'below';
  const nameOf = (id: TownBuildingId) => {
    const state = buildings[id];
    return phone
      ? (state.shortLabel ?? TOWN.short[LABEL_KEY[id]])
      : (state.label ?? TOWN.labels[LABEL_KEY[id]]);
  };
  const securityLevel = investmentLevel(ch, 'security');
  const escorted = career.guarded === true || blueGuard;

  const art: Record<TownBuildingId, React.ReactNode> = {
    training: (
      <TrainingCenterBuilding
        mode={buildings.training.mode}
        assistantLevel={investmentLevel(ch, 'assistant')}
      />
    ),
    home: (
      <HomeBuilding
        mode={buildings.home.mode}
        windows={homeWindows(room, playerCharacter?.name ?? null)}
        plates={!phone}
        spaLevel={investmentLevel(ch, 'spa')}
      />
    ),
    media: (
      <TvStationBuilding
        mode={buildings.media.mode}
        partyPoster={governing.includes('red')}
      />
    ),
    bank: (
      <BankBuilding
        mode={buildings.bank.mode}
        career={career}
        yellow={governing.includes('yellow')}
      />
    ),
    cafe: <CafeBuilding mode={buildings.cafe.mode} />,
    security: (
      <SecurityFirmBuilding
        mode={buildings.security.mode}
        wall={governing.includes('blue')}
        securityLevel={securityLevel}
      />
    ),
    parliament: (
      <ParliamentBuilding
        mode={buildings.parliament.mode}
        career={career}
        election={pendingElection}
      />
    ),
    post: <PostOfficeBuilding mode={buildings.post.mode} unread={unread} />,
    kiosk: (
      <KioskBuilding
        mode={buildings.kiosk.mode}
        fresh={paperFresh}
        scoutLevel={investmentLevel(ch, 'scout')}
      />
    ),
    billboard: (
      <BillboardBuilding
        mode={buildings.billboard.mode}
        career={career}
        characterBySlug={characterBySlug}
        coaches={coaches}
      />
    ),
    poll: (
      <PollBuilding
        mode={buildings.poll.mode}
        votes={buildings.poll.mode === 'abandoned' ? null : countVotes(career)}
      />
    ),
    dock: (
      <DockBuilding
        mode={buildings.dock.mode}
        sailing={sailing}
        partyDressed={governing.includes('green')}
      />
    ),
  };

  const world = (
    <>
      <div className="absolute inset-0 z-0 translate-x-[calc(var(--town-px,0)*-3px)] translate-y-[calc(var(--town-py,0)*-2px)] transition-[translate] duration-700 ease-out">
        <TownSky season={career.season} layout={layout} />
      </div>
      <div className="absolute inset-0 z-[1] translate-x-[calc(var(--town-px,0)*-7px)] translate-y-[calc(var(--town-py,0)*-3px)] transition-[translate] duration-700 ease-out">
        <TownGround season={career.season} layout={layout} />
      </div>
      {/* zero-sized so only the things drawn in it take clicks, not the sky */}
      <div className="absolute left-0 top-0 z-[2] size-0 translate-x-[calc(var(--town-px,0)*-7px)] translate-y-[calc(var(--town-py,0)*-3px)] transition-[translate] duration-700 ease-out">
        {BUILDING_ORDER.map((id) => {
          const state = buildings[id];
          return (
            <TownBuildingButton
              key={id}
              id={id}
              layout={layout}
              name={nameOf(id)}
              sub={state.sub}
              mode={state.mode}
              disabled={state.disabled}
              blocked={walking}
              badge={id === 'post' ? unread : 0}
              alert={state.alert}
              onHover={(on) => hoverSink.current(on ? id : null)}
              onOpen={state.onOpen}
            >
              {art[id]}
            </TownBuildingButton>
          );
        })}
        <div className={`absolute ${place.fountain.box}`}>
          <TownFountain />
        </div>
        <div className={`absolute ${place.toy.box}`}>
          <TownSeasonToy season={career.season} layout={layout} />
        </div>
        {sponsorId &&
          place.flagPoles.map((pole) => (
            <div key={pole.x} className={`absolute ${pole.box}`}>
              <TownFlagPole sponsorId={sponsorId} />
            </div>
          ))}
        {spotlight && <TownSpotlight layout={layout} target={spotlight} />}
        <TownLeagueWalkers
          key={`${career.year}-${career.season}-${layout}`}
          career={career}
          characterBySlug={characterBySlug}
          layout={layout}
          humanSlugs={humanSlugs}
          closing={closing}
          playerMood={ch}
          tripTo={trip?.building ?? null}
        />
        <div className={`absolute ${place.cupStop.box}`}>
          <TownCupBusStop />
        </div>
        {cupReady && (
          <TownCupBus
            layout={layout}
            leaving={busLeaving}
            blocked={walking}
            labels={labels}
            onBoard={boardBus}
            onGone={onToCup}
          />
        )}
        {closing && (
          <TownFolkCrowd
            layout={layout}
            toStop={cupGate}
            waiting={folkWaiting}
            boarding={boarding}
            onBoarded={() => setCrowdAboard(true)}
          />
        )}
        <TownStrayDog
          layout={layout}
          closing={closing && cupGate}
          chase={busLeaving}
        />
        <TownStrayCat layout={layout} closing={closing} />
        {investmentLevel(ch, 'assistant') >= ASSISTANT_TACTICS_LEVEL && (
          <div className={`pointer-events-none absolute ${place.street.tactics}`}>
            <TownTacticsBoard mode={buildings.training.mode} />
          </div>
        )}
        {securityLevel >= 1 && (
          <div className={`absolute ${place.street.booth}`}>
            <TownGuardBooth mode={buildings.security.mode} />
          </div>
        )}
        {securityLevel >= SECURITY_CCTV_LEVEL && (
          <div className={`absolute ${place.street.cctv}`}>
            <TownCctvPole mode={buildings.security.mode} />
          </div>
        )}
        {securityLevel >= SECURITY_PATROL_LEVEL && <TownPatrol layout={layout} />}
        <TownSpyVan
          level={investmentLevel(ch, 'scout')}
          layout={layout}
          mode={buildings.kiosk.mode}
          held={walking}
        />
        {playerCharacter && (
          <TownWalker
            character={playerCharacter}
            mood={ch}
            sponsorId={sponsorId}
            layout={layout}
            escorted={escorted}
            escortDog={securityLevel >= 1}
            trip={trip}
            boarding={boarding}
            onArrive={onArrive}
            onTripEnd={onTripEnd}
            onBoarded={() => setPlayerAboard(true)}
          />
        )}
        <TownSignLayer
          layout={layout}
          signs={BUILDING_ORDER.map((id) => ({
            id,
            name: nameOf(id),
            sub: buildings[id].sub,
            mode: buildings[id].mode,
            disabled: buildings[id].disabled,
            placement: signPlacement(id),
          }))}
          labels={labels}
          hoverRef={hoverSink}
        />
      </div>
    </>
  );

  // The receipt drops in under the calendar on desktop and rises above the
  // gate on phone, clear of the HUD either way
  const receipt = toast && (
    <div
      className={`pointer-events-auto transition-[opacity,translate] duration-300 ease-out motion-reduce:transition-none starting:opacity-0 ${
        phone ? 'w-full max-w-sm starting:translate-y-3' : 'w-72 starting:-translate-y-3 xl:w-80'
      }`}
    >
      <ActionReceipt toast={toast} onDismiss={onDismissToast} />
    </div>
  );
  const alarms = (
    <div className="pointer-events-auto empty:hidden">
      <TownAlarmChips
        pendingElection={pendingElection}
        onOpenElection={onOpenElection}
      />
    </div>
  );

  return (
    <TownStage layout={layout} onLayout={setLayout} world={world}>
      <div className="pointer-events-none absolute inset-0 z-[60]">
        <TownWeather season={career.season} />
      </div>

      {phone ? (
        <div className="pointer-events-none absolute inset-x-2 top-2 z-[70] flex flex-col gap-2">
          <div className="pointer-events-auto">{topBar}</div>
          <div className="pointer-events-auto w-full">
            <TownCalendarRow career={career} compact receipts={receiptLog} />
          </div>
          <div className="pointer-events-auto flex items-center gap-2">
            <TownSponsorChip sponsorId={sponsorId} onOpen={onOpenDossier} />
            <div className="min-w-0 flex-1">
              <TownMeterStrip ch={ch} onOpen={onOpenDossier} />
            </div>
          </div>
          <div className="flex justify-center">{alarms}</div>
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-x-2 top-2 z-[70] flex flex-col gap-2">
          <div className="pointer-events-auto">{topBar}</div>
          <div className="flex items-start gap-3">
            <div className="flex w-32 shrink-0 flex-col items-start gap-3 xl:w-40">
              <div className="pointer-events-auto">
                <TownSponsorBanner
                  sponsorId={sponsorId}
                  onOpen={onOpenDossier}
                />
              </div>
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="pointer-events-auto w-full max-w-[34rem] xl:max-w-[38rem]">
                <TownCalendarRow career={career} receipts={receiptLog} />
              </div>
              {alarms}
              {receipt}
            </div>
            <div className="pointer-events-auto w-40 shrink-0 xl:w-48 phone-landscape:w-52">
              <TownPlayerCard ch={ch} onOpen={onOpenDossier} />
            </div>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-2 bottom-3 z-[70] flex flex-col items-center gap-2">
        {phone && receipt}
        {(gate || !hideCupGate || rivalReady) && (
          <div className="pointer-events-auto empty:hidden">
            <TownGate
              gate={gate}
              slotsFull={slotsFull}
              busy={busy}
              newsSeen={career.newsSeen === true}
              rivalReady={rivalReady}
              blocked={walking}
              onOpenNews={onOpenNews}
              onToCup={boardBus}
              onOpenRival={onOpenRival}
            />
          </div>
        )}
      </div>
    </TownStage>
  );
}
