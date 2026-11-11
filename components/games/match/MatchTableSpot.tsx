import { useCareerFrames } from '@/components/games/career/careerFrames';
import GlizzyIcon from '@/components/icons/GlizzyIcon';
import SpotIcon from '@/components/icons/SpotIcon';
import SniffScent from '@/components/games/match/SniffScent';
import { studioAccents } from '@/lib/constants/studioThemes';
import type { HidingSpot } from '@/data/games/glizzyDuel';
import { hidingSpotLabel } from '@/lib/utils/localeNames';

// One hiding spot on the felt: a sunken well with a coaster the prop stands
// on, and a little engraved plate with its name
export default function MatchTableSpot({
  spot,
  variant,
  glizzyVariant,
  theme,
  reveal,
  sensedFrom,
  busy,
}: {
  spot: HidingSpot;
  variant: number;
  glizzyVariant: number;
  theme: number;
  // The spot the seeker just lifted, and whether the glizzy was under it
  reveal: 'hit' | 'miss' | null;
  // Where the nose says the glizzy is, while the hand is still deciding
  // somewhere else, and which seat smelled it
  sensedFrom: 'top' | 'bottom' | null;
  busy: boolean;
}) {
  const street = useCareerFrames() === 'street';
  const accent = studioAccents(theme);
  return (
    <div className="relative flex flex-col items-center gap-1.5">
      {sensedFrom && (
        <SniffScent
          direction={sensedFrom === 'top' ? 'up' : 'down'}
          className={`left-1/2 -translate-x-1/2 ${
            sensedFrom === 'top' ? '-top-4' : '-bottom-4'
          }`}
        />
      )}
      <div
        className={`relative flex aspect-square w-full items-center justify-center rounded-xl border-2 shadow-[inset_0_4px_10px_rgba(0,0,0,0.65)] transition-all duration-300 ${
          reveal === 'hit'
            ? 'border-red-500 bg-red-500/30 ring-2 ring-red-500/25'
            : reveal === 'miss'
              ? 'border-green-400 bg-green-400/15'
              : sensedFrom
                ? 'border-lime-400 bg-lime-400/10 ring-2 ring-lime-300/30'
                : accent.tableWell
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute inset-[18%] rounded-full shadow-[inset_0_-2px_0_rgba(0,0,0,0.35)] transition-opacity duration-300 ${accent.tableWellLit} ${
            reveal ? 'opacity-0' : ''
          }`}
        />
        <SpotIcon
          spot={spot.id}
          variant={variant}
          className={`relative h-8 w-8 transition-all duration-500 sm:h-9 sm:w-9 ${
            reveal ? '-translate-y-5 rotate-6 opacity-70' : ''
          } ${busy ? 'animate-pulse' : ''}`}
        />
        <span
          className={`absolute inset-x-0 bottom-1 flex justify-center transition-all delay-150 duration-500 ${
            reveal === 'hit'
              ? 'translate-y-0 scale-100 opacity-100'
              : 'translate-y-2 scale-50 opacity-0'
          }`}
        >
          <GlizzyIcon variant={glizzyVariant} className="h-5 w-8" />
        </span>
      </div>
      <span
        className={`rounded-[3px] border px-1.5 pb-px pt-[2px] font-bold uppercase leading-none tracking-widest shadow-[0_1px_0_rgba(0,0,0,0.55)] sm:text-[9px] ${street ? 'text-[9px]' : 'text-[8px]'} ${accent.tablePlaque}`}
      >
        {hidingSpotLabel(spot.id)}
      </span>
    </div>
  );
}
