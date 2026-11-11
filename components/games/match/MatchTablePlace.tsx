import LivesRow from '@/components/games/LivesRow';
import { studioAccents } from '@/lib/constants/studioThemes';

// A seat's place setting at its end of the felt: the glizzies he has left on a
// plate, fork and knife either side, laid the right way round for whoever sits
// there
export default function MatchTablePlace({
  lives,
  cap,
  theme,
  side,
  hidden,
}: {
  lives: number;
  cap?: number;
  theme: number;
  side: 'top' | 'bottom';
  hidden: boolean;
}) {
  const accent = studioAccents(theme);
  const fork = (
    <svg
      viewBox="0 0 6 22"
      className={`h-5 w-1.5 shrink-0 ${side === 'top' ? 'rotate-180' : ''}`}
      aria-hidden="true"
    >
      <path
        d="M0.5 0v6a2.5 2.5 0 0 0 1.7 2.4V21a0.8 0.8 0 0 0 1.6 0V8.4A2.5 2.5 0 0 0 5.5 6V0h-0.9v5H3.4V0h-0.8v5H1.4V0z"
        className="fill-[#cbd5e1]"
      />
    </svg>
  );
  const knife = (
    <svg
      viewBox="0 0 6 22"
      className={`h-5 w-1.5 shrink-0 ${side === 'top' ? 'rotate-180' : ''}`}
      aria-hidden="true"
    >
      <path
        d="M2.2 0C4.6 1.5 5.3 5 4.6 10.5H3.8V21a0.8 0.8 0 0 1-1.6 0z"
        className="fill-[#cbd5e1]"
      />
    </svg>
  );
  return (
    <div
      className={`flex justify-center transition-opacity duration-500 ${
        hidden ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div
        className={`flex items-center gap-1.5 rounded-lg border border-dashed px-2 py-1 ${accent.tableMat}`}
      >
        {side === 'top' ? knife : fork}
        <div className="rounded-[50%] bg-[#f1f5f9] px-3 py-1 shadow-[inset_0_0_0_3px_#dbe3ec,0_2px_4px_rgba(0,0,0,0.5)]">
          <LivesRow lives={lives} cap={cap} />
        </div>
        {side === 'top' ? fork : knife}
      </div>
    </div>
  );
}
