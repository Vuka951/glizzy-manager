import PartyMark from '@/components/games/career/sponsors/PartyMark';

export type SponsorFlagSize = 'full' | 'seat' | 'fan';

const POLE: Record<SponsorFlagSize, string> = {
  full: 'h-16 w-1 sm:h-20',
  seat: 'h-11 w-1 sm:h-12',
  fan: 'h-9 w-1',
};

const CLOTH: Record<SponsorFlagSize, string> = {
  full: 'h-8 w-12 sm:h-10 sm:w-14',
  seat: 'h-5 w-8',
  fan: 'h-4 w-7',
};

const FIST: Record<SponsorFlagSize, string> = {
  full: 'bottom-[38%] h-3.5 w-3.5',
  seat: 'bottom-[36%] h-2.5 w-2.5',
  fan: 'bottom-[12%] h-2 w-2',
};

const FOREARM: Record<SponsorFlagSize, string> = {
  full: 'bottom-[40%] h-2 w-7',
  seat: 'bottom-[38%] h-1.5 w-5',
  fan: 'bottom-[15%] h-1 w-3',
};

// The party flag flying off the left of its pole, gripped at the side by a
// fist whose forearm reaches right, into whoever is holding it. The full one
// goes in the player's hand on the offseason scene, the seat one at the match
// table, the fan one in the stands
export default function SponsorFlag({
  size = 'full',
  className = '',
}: {
  size?: SponsorFlagSize;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none block ${POLE[size]} ${className}`}
    >
      <span className="absolute inset-y-0 right-0 w-0.5 rounded-full bg-slate-300 shadow" />
      <span className="absolute right-0 top-0 h-1 w-1 rounded-full bg-amber-300" />
      <span
        className={`absolute right-0.5 top-0.5 flex origin-right items-center justify-center overflow-hidden rounded-l-sm bg-blue-800 shadow-md ${CLOTH[size]}`}
      >
        <PartyMark className="h-full w-auto" />
      </span>
      <span
        className={`absolute left-full origin-left rotate-[18deg] rounded-full bg-amber-200 ${FOREARM[size]}`}
      />
      <span
        className={`absolute right-px translate-x-1/2 rounded-full border border-slate-950/40 bg-amber-200 shadow ${FIST[size]}`}
      />
    </span>
  );
}
