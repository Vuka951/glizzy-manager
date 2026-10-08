import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import SponsorFlag from '@/components/games/career/SponsorFlag';
import type { SponsorId } from '@/lib/utils/careerSave';

// Who is wearing it: the player on the offseason scene, either fighter at the
// match table, or a fan in the stands. The fan only ever gets the paper hat or
// the flag
export type SponsorGearVariant = 'actor' | 'seat' | 'fan';

const PAPER_HAT: Record<SponsorGearVariant, string> = {
  actor: '-top-4 left-1/2 h-7 w-12 -translate-x-1/2 sm:-top-5 sm:h-8 sm:w-14',
  seat: '-top-2.5 left-1/2 h-5 w-8 -translate-x-1/2',
  fan: 'bottom-6.5 left-2 h-2.5 w-4',
};

// What the contract puts on him: a mason's paper hat and trowel, an island
// sun hat, the corporation's lanyard, the party flag in hand. Sits on top of
// the portrait and follows every pose it takes
export default function SponsorActorGear({
  sponsorId,
  variant = 'actor',
}: {
  sponsorId: SponsorId;
  variant?: SponsorGearVariant;
}) {
  if (sponsorId === 'zidari') {
    return (
      <>
        <svg
          data-sponsor-gear="zidari"
          viewBox="0 0 40 24"
          className={`pointer-events-none absolute z-10 rotate-[8deg] ${PAPER_HAT[variant]}`}
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M20 1.5 34 17H6Z"
            className="fill-stone-100 stroke-stone-500"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <path d="M20 2v15" className="fill-none stroke-stone-300" />
          <path
            d="M13.5 13h4M22.5 13h5M16 9.5h2M22 9.5h2.5"
            className="fill-none stroke-stone-400"
            strokeLinecap="round"
          />
          <path
            d="M2 16.5h36l-3 6H5Z"
            className="fill-stone-300 stroke-stone-500"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <path d="M5 18.6h30l-.9 1.8H5.9Z" className="fill-orange-700" />
        </svg>
        {variant !== 'fan' && (
          <svg
            data-sponsor-gear="zidari"
            viewBox="0 0 24 28"
            className={`pointer-events-none absolute z-10 -rotate-[14deg] ${
              variant === 'seat'
                ? '-left-2 bottom-0 h-6 w-5'
                : '-left-3 bottom-1 h-9 w-8 sm:-left-4 sm:bottom-2'
            }`}
            aria-hidden="true"
            focusable="false"
          >
            <rect
              x="9.5"
              y="18"
              width="5"
              height="9"
              rx="2"
              className="fill-orange-700"
            />
            <path
              d="M12 14.5V19"
              className="fill-none stroke-stone-600"
              strokeWidth="2"
            />
            <path
              d="M12 1.5 19.5 14q-7.5 3-15 0Z"
              className="fill-stone-300 stroke-stone-600"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </>
    );
  }
  if (sponsorId === 'stranka') {
    const size = variant === 'actor' ? 'full' : variant;
    return (
      <SponsorFlag
        size={size}
        className={
          variant === 'fan'
            ? 'absolute -left-2 bottom-3 z-10'
            : variant === 'seat'
              ? 'absolute -left-3 bottom-0 z-10'
              : 'absolute -left-4 bottom-0 z-10 sm:-left-5'
        }
      />
    );
  }
  if (variant === 'fan') return null;
  if (sponsorId === 'ostrvo') {
    return (
      <span
        data-sponsor-gear="ostrvo"
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 rotate-3 ${
          variant === 'seat'
            ? '-top-2.5 h-5 w-14'
            : '-top-4 h-8 w-20 sm:-top-5 sm:h-9 sm:w-24'
        }`}
      >
        <span
          className={`absolute top-0 rounded-t-[45%] bg-amber-200 shadow-md ${
            variant === 'seat' ? 'inset-x-4 bottom-1.5' : 'inset-x-5 bottom-2'
          }`}
        />
        <span
          className={`absolute bg-emerald-500 ${
            variant === 'seat'
              ? 'inset-x-4 bottom-1.5 h-1'
              : 'inset-x-5 bottom-2.5 h-1.5'
          }`}
        />
        <span
          className={`absolute inset-x-0 bottom-0 rounded-[100%] bg-amber-300 shadow ${
            variant === 'seat' ? 'h-1.5' : 'h-2.5'
          }`}
        />
      </span>
    );
  }
  return (
    <span
      data-sponsor-gear="korporacija"
      aria-hidden="true"
      className={`pointer-events-none absolute z-10 -rotate-6 ${
        variant === 'seat'
          ? '-left-2 bottom-0 h-6 w-5'
          : '-left-3 bottom-1 h-9 w-8 sm:-left-4 sm:bottom-2'
      }`}
    >
      <span
        className={`absolute left-1/2 top-0 -translate-x-1/2 rounded-sm bg-slate-400 ${
          variant === 'seat' ? 'h-1.5 w-1.5' : 'h-2.5 w-2'
        }`}
      />
      <span
        className={`absolute inset-x-0 bottom-0 flex items-center justify-center rounded-sm border border-yellow-300 bg-slate-100 shadow-md ${
          variant === 'seat' ? 'h-4' : 'h-6'
        }`}
      >
        <span
          className={`absolute inset-x-0 top-0 bg-yellow-300 ${variant === 'seat' ? 'h-0.5' : 'h-1'}`}
        />
        <SponsorEmblem
          sponsorId="korporacija"
          className={variant === 'seat' ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'}
        />
      </span>
    </span>
  );
}
