'use client';

import { useMemo, useState } from 'react';
import CampaignReport from '@/components/games/career/CampaignReport';
import ConstitutionCelebration from '@/components/games/career/ConstitutionCelebration';
import SeasonStage from '@/components/games/career/SeasonStage';
import FinalReport from '@/components/games/career-mp/FinalReport';
import { previewRoster } from '@/components/preview/previewRoster';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import type { CoachColor } from '@/lib/constants/careerMp';
import type {
  CampaignReportData,
  CoachReport,
  CoachTagMap,
  LedgerCategory,
} from '@/lib/types/careerMp';
import { careerPoints, rankBySeeding } from '@/lib/utils/careerPoints';
import type { SavedCareer, SponsorId } from '@/lib/utils/careerSave';

type Mode =
  | 'sp'
  | 'mp'
  | 'sp-constitution'
  | 'mp-constitution'
  | 'mp-constitution-lost'
  | 'celebration';

const PARTY: SponsorId = 'red';

// The same league ended on one-party rule instead of the crown: the Red Party
// governing alone, the player and two more coaches on its list
function constitutionCareer(career: SavedCareer): SavedCareer {
  const characters = { ...career.characters };
  const others = rankBySeeding(characters, career.playerSlug).filter(
    (slug) => slug !== career.playerSlug,
  );
  [career.playerSlug, ...others.slice(0, 4)].forEach((slug) => {
    characters[slug] = { ...characters[slug], sponsor: { sponsorId: PARTY } };
  });
  const winners = rankBySeeding(characters, career.playerSlug).filter(
    (slug) => characters[slug].sponsor?.sponsorId === PARTY,
  );
  const parliament = career.parliament;
  return {
    ...career,
    characters,
    overlordSlug: null,
    overlordWon: false,
    ...(parliament
      ? {
          parliament: {
            ...parliament,
            government: [PARTY],
            seats: { red: 57, yellow: 17, blue: 14, green: 12 },
            laws: [
              { id: 'holiday', year: 3, season: 0, government: [PARTY] },
              { id: 'training-subsidy', year: 5, season: 0, government: [PARTY] },
              { id: 'lottery', year: 7, season: 0, government: [PARTY] },
            ],
            constitution: {
              party: PARTY,
              year: career.year,
              season: 0,
              winners,
            },
          },
        }
      : {}),
  };
}

const SEEDS = previewRoster();

// Three coaches, each named after the character he plays
const COACHES: { name: string; color: CoachColor; slug: string }[] = (
  [
    [SEEDS[0], 'sky'],
    [SEEDS[3], 'violet'],
    [SEEDS[1], 'lime'],
  ] as const
).map(([character, color]) => ({
  name: character.name,
  color,
  slug: character.slug,
}));

const CATEGORIES: LedgerCategory[] = [
  'prize',
  'sponsor',
  'stipend',
  'media',
  'bets',
  'training',
  'guard',
  'plots',
  'fines',
  'donations',
  'glizzflation',
  'investments',
  'tax',
  'laws',
  'interest',
];

// Steady numbers, different per coach, so the preview reads the same every time
function money(seed: number): Record<LedgerCategory, number> {
  const signs: Record<LedgerCategory, number> = {
    prize: 1,
    sponsor: 1,
    stipend: 1,
    media: 1,
    bets: seed % 2 === 0 ? 1 : -1,
    training: -1,
    guard: -1,
    plots: -1,
    fines: -1,
    donations: -1,
    glizzflation: seed % 3 === 0 ? 1 : -1,
    investments: 1,
    tax: -1,
    laws: seed % 2 === 0 ? 1 : -1,
    interest: -1,
  };
  return Object.fromEntries(
    CATEGORIES.map((c, i) => [
      c,
      signs[c] * (((seed * 37 + i * 53) % 190) + 10),
    ]),
  ) as Record<LedgerCategory, number>;
}

// The shared-room report for the same finished league: three coaches on the
// sample characters, ledgers and counters made up, the league history real
function sampleCampaignReport(career: SavedCareer): CampaignReportData {
  const humans = COACHES.filter((c) => career.characters[c.slug]);
  const order = rankBySeeding(
    career.characters,
    new Set(humans.map((c) => c.slug)),
  );
  const seasons = career.standingsHistory.length;
  const coaches: CoachReport[] = humans.map((coach, i) => {
    const ch = career.characters[coach.slug];
    const cupPlaces = career.standingsHistory.map(
      (r) => (r.ranks ?? []).indexOf(coach.slug) + 1,
    );
    const placed = cupPlaces.filter((p) => p > 0);
    const ledger = money(i + 1);
    return {
      coachId: `preview-${coach.slug}`,
      name: coach.name,
      color: coach.color,
      slug: coach.slug,
      place: order.indexOf(coach.slug) + 1,
      points: careerPoints(ch),
      titles: ch.titles,
      seasons,
      money: ledger,
      plots: { booked: 6 - i, landed: 3 - i, blocked: 1, caught: 2 - (i % 2) },
      hitsTaken: 2 + i,
      guard: { windows: 3 + i, blocks: 1 + i },
      bets: { placed: 14 - 3 * i, won: 8 - 2 * i, net: ledger.bets },
      donations: -ledger.donations,
      favorsUsed: i === 0 ? 2 : 1,
      // A character signs once for the whole campaign, or never
      sponsors:
        (
          [
            [{ sponsorId: 'blue', year: 2 }],
            [{ sponsorId: 'yellow', year: 3 }],
            [],
          ] as { sponsorId: SponsorId; year: number }[][]
        )[i] ?? [],
      rivals: humans
        .filter((other) => other.slug !== coach.slug)
        .slice(0, 1)
        .map((other) => ({
          slug: other.slug,
          year: 2,
          wins: 3 - i,
          losses: 1 + i,
        })),
      bestCup: placed.length > 0 ? Math.min(...placed) : null,
      worstCup: placed.length > 0 ? Math.max(...placed) : null,
    };
  });
  coaches.sort((a, b) => a.place - b.place);
  const h2h: Record<string, Record<string, number>> = {};
  humans.forEach((row, i) => {
    h2h[row.slug] = {};
    humans.forEach((col, j) => {
      if (i !== j) h2h[row.slug][col.slug] = (i * 2 + j * 3) % 5;
    });
  });
  return {
    overlordSlug: career.overlordSlug ?? humans[0]?.slug ?? '',
    coaches,
    champions: career.standingsHistory.map((r) => ({
      year: r.year,
      season: r.season,
      champion: r.champion,
    })),
    governments: [
      { year: 2, government: ['red', 'blue'], primeMinister: SEEDS[2].slug },
      {
        year: 4,
        government: ['yellow', 'green'],
        primeMinister: SEEDS[5].slug,
      },
    ],
    priceIndex: career.gliziPriceHistory ?? [1],
    h2h,
  };
}

// Two buttons and a full-screen stage: the single-player campaign report and
// the shared-room final report for the same finished league, as in the game
export default function FinalReportPreview({
  career,
  characters,
}: {
  career: SavedCareer;
  characters: DuelCharacter[];
}) {
  const [mode, setMode] = useState<Mode | null>(null);
  const characterBySlug = useMemo(
    () => new Map(characters.map((c) => [c.slug, c])),
    [characters],
  );
  const report = useMemo(() => sampleCampaignReport(career), [career]);
  const ruled = useMemo(() => constitutionCareer(career), [career]);
  const ruledReport = useMemo(
    () => ({
      ...sampleCampaignReport(ruled),
      overlordSlug: '',
      constitution: ruled.parliament?.constitution ?? null,
    }),
    [ruled],
  );
  const ruledWinners = (ruled.parliament?.constitution?.winners ?? []).flatMap(
    (slug) => {
      const character = characterBySlug.get(slug);
      return character ? [character] : [];
    },
  );
  const player = characterBySlug.get(career.playerSlug);
  // The same room read by a coach outside the winning list
  const outsider = useMemo(() => {
    const winners = ruled.parliament?.constitution?.winners ?? [];
    const slug = COACHES.map((c) => c.slug).find(
      (s) => ruled.characters[s] && !winners.includes(s),
    ) ?? Object.keys(ruled.characters).find((s) => !winners.includes(s));
    return slug ? { ...ruled, playerSlug: slug } : ruled;
  }, [ruled]);
  const coachTags: CoachTagMap = useMemo(
    () =>
      Object.fromEntries(
        COACHES.filter((c) => career.characters[c.slug]).map((c) => [
          c.slug,
          { name: c.name, color: c.color, connected: true },
        ]),
      ),
    [career],
  );
  const button =
    'rounded-lg border border-sky-200/20 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-sky-200/45 hover:text-white';
  const topBar = (
    <div className="flex w-full items-center justify-between gap-2 px-3 pt-3">
      <span className="rounded-full border border-sky-200/15 bg-slate-950/70 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
        {mode === 'sp' || mode === 'sp-constitution' || mode === 'celebration'
          ? 'Glizzy Manager'
          : GAMES_UI.careerMp.catalog.title}
      </span>
      <button onClick={() => setMode(null)} className={button}>
        {GAMES_UI.shared.close}
      </button>
    </div>
  );
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setMode('sp')} className={button}>
          Open report (single player)
        </button>
        <button onClick={() => setMode('mp')} className={button}>
          Open report (Glizzy Rivals)
        </button>
        <button onClick={() => setMode('celebration')} className={button}>
          New constitution (ending)
        </button>
        <button onClick={() => setMode('sp-constitution')} className={button}>
          New constitution (single player)
        </button>
        <button onClick={() => setMode('mp-constitution')} className={button}>
          New constitution (Glizzy Rivals)
        </button>
        <button
          onClick={() => setMode('mp-constitution-lost')}
          className={button}
        >
          New constitution (Glizzy Rivals, off the list)
        </button>
      </div>
      {mode && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950">
          <div className="mx-auto w-full max-w-5xl">
            <SeasonStage season={career.season} topBar={topBar}>
              <div className="flex w-full flex-col items-center gap-4 pb-12">
                {mode === 'celebration' && player && ruled.parliament?.constitution ? (
                  <ConstitutionCelebration
                    party={PARTY}
                    winners={ruledWinners}
                    player={player}
                    playerPlace={
                      rankBySeeding(ruled.characters, ruled.playerSlug).indexOf(
                        ruled.playerSlug,
                      ) + 1
                    }
                    onContinue={() => setMode('sp-constitution')}
                  />
                ) : mode === 'sp-constitution' ? (
                  <CampaignReport
                    career={ruled}
                    characters={characters}
                    overlordSlug={null}
                    onNewCareer={() => setMode(null)}
                  />
                ) : mode === 'mp-constitution' ||
                  mode === 'mp-constitution-lost' ? (
                  <FinalReport
                    report={ruledReport}
                    characterBySlug={characterBySlug}
                    career={mode === 'mp-constitution' ? ruled : outsider}
                    coaches={coachTags}
                  />
                ) : mode === 'sp' ? (
                  <CampaignReport
                    career={career}
                    characters={characters}
                    overlordSlug={career.overlordSlug as string}
                    onNewCareer={() => setMode(null)}
                  />
                ) : (
                  <FinalReport
                    report={report}
                    characterBySlug={characterBySlug}
                    career={career}
                    coaches={coachTags}
                  />
                )}
              </div>
            </SeasonStage>
          </div>
        </div>
      )}
    </>
  );
}
