import { useState } from 'react';
import CalendarSeasonRow from '@/components/games/career/CalendarSeasonRow';
import InfoButton from '@/components/games/career/InfoButton';
import SeasonPriceInfoPanel from '@/components/games/career/SeasonPriceInfoPanel';
import SponsorModal from '@/components/games/career/SponsorModal';
import { GAMES_UI } from '@/data/games/locale';
import type { SavedCareer } from '@/lib/utils/careerSave';
import { fmt } from '@/lib/utils/format';

const YC = GAMES_UI.career.offseason.yearCalendar;
const SP = GAMES_UI.career.offseason.seasonPrices;

// The career at a glance: every year browsable, four quarters of three months
// each, with the quarter's cup and its outcome
export default function YearCalendar({ career }: { career: SavedCareer }) {
  const [year, setYear] = useState(career.year);
  const [showPrices, setShowPrices] = useState(false);
  const sponsorId =
    career.characters[career.playerSlug]?.sponsor?.sponsorId ?? null;
  return (
    <div className="flex w-full flex-col gap-2.5">
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setYear((y) => Math.max(1, y - 1))}
          disabled={year <= 1}
          aria-label={YC.prevYear}
          className="rounded-lg border border-sky-200/20 bg-slate-800/60 px-3 py-1 text-xs font-bold text-slate-300 transition hover:border-sky-200/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          ‹
        </button>
        <p className="min-w-24 text-center text-sm font-bold uppercase tracking-[0.2em] text-slate-300">
          {fmt(GAMES_UI.career.hud.year, { year })}
        </p>
        <button
          onClick={() => setYear((y) => Math.min(career.year, y + 1))}
          disabled={year >= career.year}
          aria-label={YC.nextYear}
          className="rounded-lg border border-sky-200/20 bg-slate-800/60 px-3 py-1 text-xs font-bold text-slate-300 transition hover:border-sky-200/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          ›
        </button>
        <InfoButton
          label={SP.infoTitle}
          onClick={() => setShowPrices(true)}
          className="ml-1"
        />
      </div>
      {Array.from({ length: 4 }, (_, q) => (
        <CalendarSeasonRow key={q} career={career} year={year} quarter={q} />
      ))}
      {showPrices && (
        <SponsorModal
          sponsorId={sponsorId}
          title={SP.infoTitle}
          onClose={() => setShowPrices(false)}
        >
          <SeasonPriceInfoPanel career={career} />
        </SponsorModal>
      )}
    </div>
  );
}
