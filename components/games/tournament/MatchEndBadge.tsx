'use client';

import { useCareerFrames } from '@/components/games/career/careerFrames';
import HeartbreakIcon from '@/components/icons/HeartbreakIcon';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import PukeGlyph from '@/components/games/tournament/PukeGlyph';
import SirenGlyph from '@/components/games/tournament/SirenGlyph';
import StopwatchGlyph from '@/components/games/tournament/StopwatchGlyph';
import WhiteFlagGlyph from '@/components/games/tournament/WhiteFlagGlyph';
import { DARK_PAINT } from '@/lib/utils/careerFrameClasses';
import type { SponsorId } from '@/lib/utils/careerSave';
import type { MatchForfeitReason } from '@/lib/utils/tournamentSim';

export type MatchEnding = MatchForfeitReason | 'tiebreak';

const CHIP_TONE: Record<MatchEnding, string> = {
  police: 'border-blue-400/80 bg-slate-950 ring-1 ring-red-500/70',
  meltdown: 'border-red-400/70 bg-red-950',
  'overfull-forfeit': 'border-lime-400/70 bg-lime-950',
  withdrawn: 'border-slate-300/60 bg-slate-800',
  removed: 'border-amber-300/60 bg-slate-950',
  tiebreak: 'border-red-500/50 bg-slate-950',
};

// Enamel pins, white rimmed, so the glyph keeps its colours on the paper chart
const STREET_PIN: Record<MatchEnding, string> = {
  police: 'bg-[#1e293b]',
  meltdown: 'bg-[#7f1d1d]',
  'overfull-forfeit': 'bg-[#365314]',
  withdrawn: 'bg-[#475569]',
  removed: 'bg-[#0f172a]',
  tiebreak: 'bg-[#450a0a]',
};

// How the loser went out, pinned to his row in the bracket
export default function MatchEndBadge({
  ending,
  label,
  removedBy,
  dense,
}: {
  ending: MatchEnding;
  label: string;
  removedBy?: SponsorId;
  dense: boolean;
}) {
  const street = useCareerFrames() === 'street';
  const glyph = dense ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5';

  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={`flex flex-shrink-0 items-center justify-center rounded-full border ${
        dense ? 'h-4 w-4' : 'h-5 w-5'
      } ${
        street
          ? `border-[#f1f5f9] shadow-[0_1px_0_rgb(0_0_0/0.55)] ${STREET_PIN[ending]} ${DARK_PAINT}`
          : CHIP_TONE[ending]
      }`}
    >
      {ending === 'police' && <SirenGlyph className={glyph} />}
      {ending === 'meltdown' && <HeartbreakIcon className={glyph} />}
      {ending === 'overfull-forfeit' && <PukeGlyph className={glyph} />}
      {ending === 'withdrawn' && <WhiteFlagGlyph className={glyph} />}
      {ending === 'removed' &&
        (removedBy ? (
          <SponsorEmblem sponsorId={removedBy} className={glyph} />
        ) : (
          <SirenGlyph className={glyph} />
        ))}
      {ending === 'tiebreak' && <StopwatchGlyph className={glyph} />}
    </span>
  );
}
