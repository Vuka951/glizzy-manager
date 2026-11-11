import { useState } from 'react';
import CareerIconButton from '@/components/games/career/CareerIconButton';
import CalendarInfoPanel from '@/components/games/career/CalendarInfoPanel';
import CalendarSeasonRow from '@/components/games/career/CalendarSeasonRow';
import InfoButton from '@/components/games/career/InfoButton';
import SponsorModal from '@/components/games/career/SponsorModal';
import PaperSheet from '@/components/games/career/street/PaperSheet';
import { GAMES_UI } from '@/data/games/locale';
import type { SavedCareer } from '@/lib/utils/careerSave';
import { fmt } from '@/lib/utils/format';

const YC = GAMES_UI.career.offseason.yearCalendar;

const WIRE_LOOPS = 18;

// The career at a glance, as the wall calendar a provincial printer sends out
// at New Year: a wire-bound pad, the year on a red band, every quarter a ruled
// row of three months and the cup that closes it. Older years stay in the pad
export default function YearCalendar({ career }: { career: SavedCareer }) {
  const [year, setYear] = useState(career.year);
  const [showInfo, setShowInfo] = useState(false);
  const sponsorId =
    career.characters[career.playerSlug]?.sponsor?.sponsorId ?? null;
  return (
    <div className="relative mb-2 mt-1 w-full">
      <span
        aria-hidden="true"
        className="absolute inset-x-2 -bottom-2 h-10 rounded-b-[2px] bg-[#bdaf8c] shadow-[0_2px_0_rgb(0_0_0/0.5)]"
      />
      <span
        aria-hidden="true"
        className="absolute inset-x-1 -bottom-1 h-10 rounded-b-[2px] bg-[#d9cdb0]"
      />
      <PaperSheet className="w-full">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 -top-1.5 z-10 flex justify-between"
        >
          {Array.from({ length: WIRE_LOOPS }, (_, i) => (
            <span
              key={i}
              className="h-3.5 w-1 rounded-full bg-gradient-to-b from-[#f1f5f9] to-[#64748b] shadow-[0_1px_0_rgb(0_0_0/0.6)]"
            />
          ))}
        </span>
        <div className="flex items-center justify-center gap-3 rounded-t-[2px] bg-[#a11919] px-2 pb-1.5 pt-3">
          <CareerIconButton
            label={YC.prevYear}
            onClick={() => setYear((y) => Math.max(1, y - 1))}
            disabled={year <= 1}
          >
            ‹
          </CareerIconButton>
          <p className="min-w-28 text-center font-sign text-[26px] font-extrabold uppercase leading-none tracking-[0.08em] text-[#fdf6e3]">
            {fmt(GAMES_UI.career.hud.year, { year })}
          </p>
          <CareerIconButton
            label={YC.nextYear}
            onClick={() => setYear((y) => Math.min(career.year, y + 1))}
            disabled={year >= career.year}
          >
            ›
          </CareerIconButton>
          <InfoButton
            label={YC.infoTitle}
            onClick={() => setShowInfo(true)}
            className="ml-1"
          />
        </div>
        {Array.from({ length: 4 }, (_, q) => (
          <CalendarSeasonRow key={q} career={career} year={year} quarter={q} />
        ))}
      </PaperSheet>
      {showInfo && (
        <SponsorModal
          sponsorId={sponsorId}
          title={YC.infoTitle}
          onClose={() => setShowInfo(false)}
        >
          <CalendarInfoPanel career={career} />
        </SponsorModal>
      )}
    </div>
  );
}
