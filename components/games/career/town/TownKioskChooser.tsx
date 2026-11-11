'use client';

import { useState } from 'react';
import CareerButton from '@/components/games/career/CareerButton';
import TownCupCover from '@/components/games/career/town/TownCupCover';
import TownGazetteCover from '@/components/games/career/town/TownGazetteCover';
import TownKioskRack from '@/components/games/career/town/TownKioskRack';
import TownMagazine from '@/components/games/career/town/TownMagazine';
import TownStatsCover, {
  type TownStatsLeader,
} from '@/components/games/career/town/TownStatsCover';
import { GAMES_UI } from '@/data/games/locale';
import { townEditionIndex } from '@/lib/constants/townEditions';

const S = GAMES_UI.career.town.stats;
const COVERS = GAMES_UI.career.town.covers;

export type TownKioskPaper = {
  key: string;
  title: string;
  sub: string;
  unread: boolean;
  // A cup recap: printed as the sports magazine
  cup?: boolean;
  // The season the issue came out in, which picks the edition's cover
  season: number;
  // The issue's lead headline, then the other stories for the cover lines
  headline?: string | null;
  lines?: string[];
  onOpen: () => void;
};

export type TownKioskStats = {
  sub: string;
  leaders: TownStatsLeader[];
  sheet: React.ReactNode;
};

const FLAP = {
  cup: 'bg-[linear-gradient(to_top_left,transparent_50%,#cbd5e1_50%,#f8fafc)]',
  gazette: 'bg-[linear-gradient(to_top_left,transparent_50%,#d6ccb4_50%,#f5efe0)]',
  stats: 'bg-[linear-gradient(to_top_left,transparent_50%,#e2b5a2_50%,#fbe7dc)]',
};

const TILTS = {
  1: ['none'],
  2: ['left', 'right'],
  3: ['left', 'none', 'right'],
} as const;

// The kiosk's counter: each paper as a single magazine, newest first, the
// cup recaps as sports magazines and the league's issues as the Gazette,
// each in its edition's cover. The paper the town waits on glows, or else
// the newest. The league's stats insert lies folded in front and opens in
// place. They lie on the old wooden counter, which fills the board, and while
// there are few of them the kiosk's own rack hangs behind the counter. A panel
// that owns the open sheet (`reading`) shows it alone and folds it on close;
// left alone, the counter keeps a back button above the sheet
export default function TownKioskChooser({
  papers,
  stats = null,
  reading: heldReading,
  onReadingChange,
}: {
  papers: TownKioskPaper[];
  stats?: TownKioskStats | null;
  reading?: boolean;
  onReadingChange?: (reading: boolean) => void;
}) {
  const [ownReading, setOwnReading] = useState(false);
  const reading = heldReading ?? ownReading;
  const setReading = onReadingChange ?? setOwnReading;
  if (reading && stats) {
    if (onReadingChange) return <div className="p-2 sm:p-3">{stats.sheet}</div>;
    return (
      <div className="flex flex-col gap-3 p-2 sm:p-3">
        <CareerButton
          tone="quiet"
          size="sm"
          className="self-start"
          onClick={() => setReading(false)}
        >
          {S.back}
        </CareerButton>
        {stats.sheet}
      </div>
    );
  }
  const shown = papers.slice(0, 3);
  const waiting = shown.findIndex((paper) => paper.unread);
  const glowing = waiting >= 0 ? waiting : 0;
  const tilts = shown.length > 0 ? TILTS[shown.length as 1 | 2 | 3] : [];
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#5b3a1e] to-[#3f2814] shadow-[inset_0_3px_8px_rgb(0_0_0/0.55)]">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0_22px,rgb(0_0_0/0.1)_22px_24px)]"
      />
      {shown.length < 2 && <TownKioskRack />}
      {shown.length > 0 && (
        <div
          className={`relative grid items-end pb-3 pt-7 ${
            shown.length === 3
              ? 'grid-cols-3 gap-[4%] px-[4%]'
              : shown.length === 2
                ? 'grid-cols-2 gap-[8%] px-[12%]'
                : 'grid-cols-1 px-[30%]'
          }`}
        >
          {shown.map((paper, i) => {
            const edition = townEditionIndex(paper.season);
            // An issue that is not out yet has no stories, so the cover
            // falls back to the edition's stock front page
            const stock = paper.cup ? COVERS.cup : COVERS.gazette;
            const cover = {
              title: paper.title,
              sub: paper.sub,
              headline: paper.headline || stock.headlines[edition],
              lines: [...(paper.lines ?? []), ...stock.lines].slice(0, 2),
              edition,
            };
            return (
              <TownMagazine
                key={paper.key}
                label={`${paper.title}, ${paper.sub}`}
                tilt={tilts[i]}
                glow={i === glowing ? (waiting >= 0 ? 'pulse' : 'soft') : null}
                clip={paper.unread}
                flap={paper.cup ? FLAP.cup : FLAP.gazette}
                onOpen={paper.onOpen}
              >
                {paper.cup ? (
                  <TownCupCover {...cover} />
                ) : (
                  <TownGazetteCover {...cover} />
                )}
              </TownMagazine>
            );
          })}
        </div>
      )}
      <span
        aria-hidden="true"
        className="relative block h-2.5 border-t-4 border-[#2b1d14] bg-[#3a2a1f]"
      />
      {stats && (
        <div className="relative mx-auto w-full max-w-xl px-[5%] pb-6 pt-5">
          <TownMagazine
            label={S.title}
            flap={FLAP.stats}
            shape="rounded-[2px]"
            onOpen={() => setReading(true)}
          >
            <TownStatsCover title={S.title} sub={stats.sub} leaders={stats.leaders} />
          </TownMagazine>
        </div>
      )}
    </div>
  );
}
