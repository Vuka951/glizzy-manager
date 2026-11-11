'use client';

import { useMemo, useState } from 'react';
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
import TownSign from '@/components/games/career/town/TownSign';
import TrainingCenterBuilding from '@/components/games/career/town/TrainingCenterBuilding';
import TvStationBuilding from '@/components/games/career/town/TvStationBuilding';
import { sampleCareer } from '@/components/preview/sampleCareer';
import { INVESTMENT_DEFS } from '@/data/games/careerInvestments';
import { SPONSOR_IDS } from '@/data/games/careerSponsors';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import { SEAT_COLOR_ORDER } from '@/lib/constants/rooms';
import type { TownBuildingMode, TownWindow } from '@/lib/types/town';
import { countVotes } from '@/lib/utils/careerElections';
import type { SavedCareer, SponsorId } from '@/lib/utils/careerSave';

const SAIL_MS = 3800;

const INVEST_LEVELS = [0, 1, 2, 3, 4];

const PARTY_LABELS = GAMES_UI.career.sponsors.names as Record<SponsorId, string>;

const CHIP =
  'rounded-lg border px-3 py-1.5 text-xs font-semibold transition';
const CHIP_IDLE =
  'border-sky-200/30 bg-slate-800/70 text-slate-200 hover:border-sky-200/60 hover:text-white';
const CHIP_ON = 'border-sky-200/70 bg-sky-400/20 text-white';

function governedBy(career: SavedCareer, party: SponsorId | null): SavedCareer {
  if (!career.parliament) return career;
  const partner = SPONSOR_IDS.find((id) => id !== party);
  return {
    ...career,
    parliament: {
      ...career.parliament,
      government: party && partner ? [party, partner] : [],
    },
  };
}

const MODES: { mode: TownBuildingMode; label: string }[] = [
  { mode: 'open', label: 'Open' },
  { mode: 'abandoned', label: 'Abandoned' },
  { mode: 'shut', label: 'Shut for the night' },
];

const WINDOWS: TownWindow[] = [
  { state: 'done', color: SEAT_COLOR_ORDER[0], name: 'Ana' },
  { state: 'choosing', color: SEAT_COLOR_ORDER[1], name: 'Bora' },
  { state: 'done', color: SEAT_COLOR_ORDER[2], name: 'Ceca' },
  { state: 'offline', color: SEAT_COLOR_ORDER[3], name: 'Dule' },
  { state: 'done', color: SEAT_COLOR_ORDER[4], name: 'Eva' },
];

type Row = {
  label: string;
  // Full static class strings so Tailwind picks them up
  box: string;
  art: (mode: TownBuildingMode) => React.ReactNode;
};

// Every building drawn open, abandoned and shut for the night on a strip of
// night pavement, plus a live column that closes up on demand so the closing
// animation can be watched
export default function TownBuildingStatesPreview({
  characters,
}: {
  characters: DuelCharacter[];
}) {
  const [liveShut, setLiveShut] = useState(false);
  const [party, setParty] = useState<SponsorId | null>('red');
  const [sailing, setSailing] = useState(false);
  const [investLevel, setInvestLevel] = useState(1);
  const level = (max: number) => Math.min(investLevel, max);
  const career = useMemo(
    () =>
      sampleCareer({
        slugs: characters.map((c) => c.slug),
        playerSlug: characters[0].slug,
        year: 4,
        season: 1,
      }),
    [characters],
  );
  const governed = useMemo(() => governedBy(career, party), [career, party]);
  const votes = useMemo(() => countVotes(career), [career]);
  const characterBySlug = useMemo(
    () => new Map(characters.map((c) => [c.slug, c])),
    [characters],
  );

  const rows: Row[] = [
    {
      label: 'Training center',
      box: 'h-[74%] aspect-[200/150]',
      art: (mode) => (
        <TrainingCenterBuilding
          mode={mode}
          assistantLevel={level(INVESTMENT_DEFS.assistant.maxLevel)}
        />
      ),
    },
    {
      label: 'Home',
      box: 'h-[84%] aspect-[220/210]',
      art: (mode) => (
        <HomeBuilding
          mode={mode}
          windows={WINDOWS}
          plates
          spaLevel={level(INVESTMENT_DEFS.spa.maxLevel)}
        />
      ),
    },
    {
      label: 'TV station',
      box: 'h-[90%] aspect-[150/290]',
      art: (mode) => <TvStationBuilding mode={mode} partyPoster={false} />,
    },
    {
      label: 'TV station, the Red Party in power',
      box: 'h-[90%] aspect-[150/290]',
      art: (mode) => <TvStationBuilding mode={mode} partyPoster />,
    },
    {
      label: 'Bank',
      box: 'h-[82%] aspect-[170/175]',
      art: (mode) => <BankBuilding mode={mode} career={career} />,
    },
    {
      label: 'Bank, the Yellow Party in power',
      box: 'h-[82%] aspect-[170/175]',
      art: (mode) => <BankBuilding mode={mode} career={career} yellow />,
    },
    {
      label: 'Cafe',
      box: 'h-[70%] aspect-[180/140]',
      art: (mode) => <CafeBuilding mode={mode} />,
    },
    {
      label: 'Security',
      box: 'h-[70%] aspect-[180/140]',
      art: (mode) => (
        <SecurityFirmBuilding
          mode={mode}
          wall={false}
          securityLevel={level(INVESTMENT_DEFS.security.maxLevel)}
        />
      ),
    },
    {
      label: 'Security, the Blue Party in power',
      box: 'h-[70%] aspect-[180/140]',
      art: (mode) => <SecurityFirmBuilding mode={mode} wall securityLevel={0} />,
    },
    {
      label: 'Assembly',
      box: 'h-[76%] aspect-[260/205]',
      art: (mode) => (
        <ParliamentBuilding mode={mode} career={career} election={false} />
      ),
    },
    {
      label: 'Assembly, government',
      box: 'h-[76%] aspect-[260/205]',
      art: (mode) => (
        <ParliamentBuilding mode={mode} career={governed} election={false} />
      ),
    },
    {
      label: 'Assembly, elections',
      box: 'h-[76%] aspect-[260/205]',
      art: (mode) => <ParliamentBuilding mode={mode} career={career} election />,
    },
    {
      label: 'Post office',
      box: 'h-[62%] aspect-[120/115]',
      art: (mode) => <PostOfficeBuilding mode={mode} unread={3} />,
    },
    {
      label: 'Kiosk, fresh paper',
      box: 'h-[58%] aspect-[124/100]',
      art: (mode) => (
        <KioskBuilding
          mode={mode}
          fresh
          scoutLevel={level(INVESTMENT_DEFS.scout.maxLevel)}
        />
      ),
    },
    {
      label: 'Kiosk, read',
      box: 'h-[58%] aspect-[124/100]',
      art: (mode) => <KioskBuilding mode={mode} fresh={false} scoutLevel={0} />,
    },
    {
      label: 'Table',
      box: 'w-[92%] aspect-[240/135]',
      art: (mode) => (
        <BillboardBuilding
          mode={mode}
          career={career}
          characterBySlug={characterBySlug}
        />
      ),
    },
    {
      label: 'Party poll',
      box: 'h-[66%] aspect-[160/135]',
      art: (mode) => (
        <PollBuilding mode={mode} votes={mode === 'abandoned' ? null : votes} />
      ),
    },
    {
      label: 'Island weekend',
      box: 'w-[88%] aspect-[200/90]',
      art: (mode) => (
        <DockBuilding
          mode={mode}
          sailing={sailing && mode === 'open'}
          partyDressed={false}
        />
      ),
    },
    {
      label: 'Island weekend, the Green Party in power',
      box: 'w-[88%] aspect-[200/90]',
      art: (mode) => (
        <DockBuilding
          mode={mode}
          sailing={sailing && mode === 'open'}
          partyDressed
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setLiveShut((v) => !v)}
          className="rounded-lg border border-sky-200/30 bg-slate-800/70 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-sky-200/60 hover:text-white"
        >
          {liveShut ? 'Open again' : 'Shut for the night'}
        </button>
        <button
          type="button"
          disabled={sailing}
          onClick={() => {
            setSailing(true);
            window.setTimeout(() => setSailing(false), SAIL_MS);
          }}
          className={`${CHIP} ${CHIP_IDLE} disabled:opacity-50`}
        >
          Set sail
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Investments
        </span>
        {INVEST_LEVELS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setInvestLevel(n)}
            className={`${CHIP} ${investLevel === n ? CHIP_ON : CHIP_IDLE}`}
          >
            {n === 0 ? 'None' : `Level ${n}`}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Government
        </span>
        {[null, ...SPONSOR_IDS].map((id) => (
          <button
            key={id ?? 'none'}
            type="button"
            onClick={() => setParty(id)}
            className={`${CHIP} ${party === id ? CHIP_ON : CHIP_IDLE}`}
          >
            {id ? PARTY_LABELS[id] : 'No government'}
          </button>
        ))}
      </div>
      <div className="hidden grid-cols-[9rem_repeat(4,minmax(0,1fr))] gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 lg:grid">
        <span />
        {MODES.map((m) => (
          <span key={m.mode}>{m.label}</span>
        ))}
        <span className="text-sky-200">Live</span>
      </div>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-[9rem_repeat(4,minmax(0,1fr))]">
        <span className="col-span-2 self-center text-xs font-bold uppercase tracking-widest text-slate-300 lg:col-span-1">
          Signs
        </span>
        {[...MODES.map((m) => m.mode), liveShut ? 'shut' : 'open'].map(
          (mode, i) => (
            <div
              key={i}
              className="flex h-20 flex-col justify-center gap-7 rounded-xl border border-white/5 bg-[#121d3d]"
            >
              <div className="group/building relative h-0">
                <TownSign
                  name="Bank"
                  sub="+150%"
                  labels="always"
                  mode={mode as TownBuildingMode}
                  muted={false}
                  placement="mid"
                />
              </div>
            </div>
          ),
        )}
      </div>
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-2 gap-2 lg:grid-cols-[9rem_repeat(4,minmax(0,1fr))]"
        >
          <span className="col-span-2 self-center text-xs font-bold uppercase tracking-widest text-slate-300 lg:col-span-1">
            {row.label}
          </span>
          {[...MODES.map((m) => m.mode), liveShut ? 'shut' : 'open'].map(
            (mode, i) => (
              <div
                key={i}
                className="relative h-48 overflow-hidden rounded-xl border border-white/5 bg-gradient-to-b from-[#0b1430] via-[#121d3d] to-[#1a2547]"
              >
                <div className="absolute inset-x-0 bottom-0 h-[16%] border-t-2 border-[#3b4458] bg-[#262d3d]" />
                <span className="absolute left-2 top-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-500 lg:hidden">
                  {i < MODES.length ? MODES[i].label : 'Live'}
                </span>
                <div
                  className={`group/building absolute bottom-[10%] left-1/2 -translate-x-1/2 ${row.box}`}
                >
                  {row.art(mode as TownBuildingMode)}
                </div>
              </div>
            ),
          )}
        </div>
      ))}
    </div>
  );
}
