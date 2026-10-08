'use client';

import { useMemo, useState } from 'react';
import CampaignReport from '@/components/games/career/CampaignReport';
import SeasonStage from '@/components/games/career/SeasonStage';
import FinalReport from '@/components/games/career-mp/FinalReport';
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

type Mode = 'sp' | 'mp';

const COACHES: { name: string; color: CoachColor; slug: string }[] = [
  { name: 'Vuka', color: 'sky', slug: 'vuka' },
  { name: 'Cone', color: 'violet', slug: 'cone' },
  { name: 'Dax', color: 'lime', slug: 'dax' },
];

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
  'investments',
  'tax',
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
    investments: 1,
    tax: -1,
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
            [{ sponsorId: 'zidari', year: 2 }],
            [{ sponsorId: 'korporacija', year: 3 }],
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
      { year: 2, government: ['stranka', 'zidari'] },
      { year: 4, government: ['korporacija', 'ostrvo'] },
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
        {mode === 'sp' ? 'Karijera' : GAMES_UI.careerMp.catalog.title}
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
          Otvori izveštaj (jedan igrač)
        </button>
        <button onClick={() => setMode('mp')} className={button}>
          Otvori izveštaj (Glizi Rivals)
        </button>
      </div>
      {mode && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950">
          <div className="mx-auto w-full max-w-5xl">
            <SeasonStage season={career.season} topBar={topBar}>
              <div className="flex w-full flex-col items-center gap-4 pb-12">
                {mode === 'sp' ? (
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
