import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import SponsorFlag from '@/components/games/career/SponsorFlag';
import type { SponsorId } from '@/lib/utils/careerSave';

// Who is wearing it: the player on the offseason scene, either fighter at the
// match table, or a fan in the stands. The fan only ever gets the hat or
// the flag
export type SponsorGearVariant = 'actor' | 'seat' | 'fan';

const HAT: Record<SponsorGearVariant, string> = {
  actor: '-top-4 left-1/2 h-7 w-12 -translate-x-1/2 sm:-top-5 sm:h-8 sm:w-14',
  seat: '-top-2.5 left-1/2 h-5 w-8 -translate-x-1/2',
  fan: 'bottom-6.5 left-2 h-2.5 w-4',
};

// What the contract puts on him: a blue peaked cap and shield, a green
// sun hat, a black-and-yellow lanyard, the red flag in hand. Sits on top of
// the portrait and follows every pose it takes
export default function SponsorActorGear({
  sponsorId,
  variant = 'actor',
}: {
  sponsorId: SponsorId;
  variant?: SponsorGearVariant;
}) {
  if (sponsorId === 'blue') {
    return (
      <>
        <svg
          data-sponsor-gear="blue"
          viewBox="0 0 40 24"
          className={`pointer-events-none absolute z-10 rotate-[8deg] ${HAT[variant]}`}
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M6 15.5C5 8 11 3 20 3s15 5 14 12.5Z"
            className="fill-blue-700 stroke-blue-950"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <path d="M6.2 12.8h27.6v3H6.2Z" className="fill-blue-50" />
          <path
            d="M20 5.6 21 8.2h2.6l-2.1 1.6.8 2.5-2.3-1.5-2.3 1.5.8-2.5-2.1-1.6H19Z"
            className="fill-blue-50"
          />
          <path
            d="M3 16.5h34q-2 6-17 6T3 16.5Z"
            className="fill-blue-950 stroke-blue-950"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
        {variant !== 'fan' && (
          <svg
            data-sponsor-gear="blue"
            viewBox="0 0 24 28"
            className={`pointer-events-none absolute z-10 -rotate-[14deg] ${
              variant === 'seat'
                ? '-left-2 bottom-0 h-6 w-5'
                : '-left-3 bottom-1 h-9 w-8 sm:-left-4 sm:bottom-2'
            }`}
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M12 1.5 21.5 5v8c0 6.3-4 10.6-9.5 13.5C6.5 23.6 2.5 19.3 2.5 13V5Z"
              className="fill-blue-700 stroke-blue-950"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <path d="M12 3.5v21M4.5 11h15" className="fill-none stroke-blue-50" strokeWidth="2.4" />
          </svg>
        )}
      </>
    );
  }
  if (sponsorId === 'red') {
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
  if (sponsorId === 'green') {
    return (
      <span
        data-sponsor-gear="green"
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
      data-sponsor-gear="yellow"
      aria-hidden="true"
      className={`pointer-events-none absolute z-10 -rotate-6 ${
        variant === 'seat'
          ? '-left-2 bottom-0 h-6 w-5'
          : '-left-3 bottom-1 h-9 w-8 sm:-left-4 sm:bottom-2'
      }`}
    >
      <span
        className={`absolute left-1/2 top-0 -translate-x-1/2 rounded-sm bg-yellow-300 ${
          variant === 'seat' ? 'h-1.5 w-1.5' : 'h-2.5 w-2'
        }`}
      />
      <span
        className={`absolute inset-x-0 bottom-0 flex items-center justify-center rounded-sm border border-yellow-300 bg-zinc-900 shadow-md ${
          variant === 'seat' ? 'h-4' : 'h-6'
        }`}
      >
        <span
          className={`absolute inset-x-0 top-0 bg-yellow-300 ${variant === 'seat' ? 'h-0.5' : 'h-1'}`}
        />
        <SponsorEmblem
          sponsorId="yellow"
          className={variant === 'seat' ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'}
        />
      </span>
    </span>
  );
}
