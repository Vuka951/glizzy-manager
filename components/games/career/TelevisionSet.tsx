import BrassPlate from '@/components/games/career/street/BrassPlate';
import StreetBoard from '@/components/games/career/street/StreetBoard';

const KNOB_TICKS = ['-rotate-[38deg]', 'rotate-[64deg]'];

// The town's old television in its walnut cabinet: the broadcast plays on the
// tube behind a black bezel, the plate, knobs, speaker and keys sit on the
// wood. The deck runs under the tube; `side` moves it to the right of the tube
// on a phone held sideways, where the small set has no height to spare. Width
// and placement come from the caller
export default function TelevisionSet({
  channel,
  live,
  side = false,
  channelKeys,
  controls,
  className = '',
  children,
}: {
  channel: React.ReactNode;
  live?: string;
  side?: boolean;
  channelKeys?: React.ReactNode;
  controls?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <StreetBoard
      className={`flex flex-col gap-1.5 sm:gap-2 ${side ? 'phone-landscape:flex-row' : ''} ${className}`}
    >
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col rounded-[9px] bg-[#0b0a09] p-[3px] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.09),inset_0_2px_5px_rgb(0_0_0/0.9),0_1px_0_rgb(255_255_255/0.1)] sm:p-1">
        <div className="relative isolate flex min-h-0 flex-1 flex-col overflow-hidden rounded-[7px] bg-[#070b14]">
          {children}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[65] bg-[repeating-linear-gradient(0deg,rgb(0_0_0/0.11)_0_1px,transparent_1px_3px)] shadow-[inset_0_0_34px_rgb(0_0_0/0.55)]"
          />
        </div>
      </div>
      {channelKeys && (
        <div className="flex shrink-0 gap-1 px-0.5 sm:gap-1.5">{channelKeys}</div>
      )}
      <div
        className={`flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1.5 px-0.5 pb-0.5 sm:flex-nowrap sm:pb-0 ${
          `sm:px-1 ${side ? 'phone-landscape:w-[5.5rem] phone-landscape:flex-col phone-landscape:flex-nowrap phone-landscape:gap-y-2 phone-landscape:px-0 phone-landscape:py-1.5' : ''}`
        }`}
      >
        <span aria-hidden="true" className="flex shrink-0 gap-1">
          {KNOB_TICKS.map((tick) => (
            <span
              key={tick}
              className={`relative h-8 w-8 rounded-full bg-[repeating-conic-gradient(#2e2a26_0deg_12deg,#14110e_12deg_24deg)] shadow-[0_0_0_1px_#0b0705,0_2px_0_rgb(0_0_0/0.6)] ${tick}`}
            >
              <span className="absolute inset-[5px] rounded-full bg-[radial-gradient(circle_at_35%_30%,#f5d98e,#a8782a_72%)] shadow-[0_1px_0_rgb(0_0_0/0.7)]" />
              <span className="absolute left-1/2 top-[6px] h-2 w-0.5 -translate-x-1/2 rounded-[1px] bg-[#2a1a0a]" />
            </span>
          ))}
        </span>
        {live && (
          <span className="flex shrink-0 items-center gap-1.5 font-sign text-[13px] font-bold uppercase leading-none tracking-[0.08em] text-[#fca5a5]">
            <span
              aria-hidden="true"
              className="h-2 w-2 animate-pulse rounded-full bg-[#ef4444] shadow-[0_0_0_1px_#3b0d0d] motion-reduce:animate-none"
            />
            {live}
          </span>
        )}
        <BrassPlate
          className={`min-w-0 [overflow-wrap:anywhere] ${side ? 'phone-landscape:w-full phone-landscape:justify-center phone-landscape:text-center' : ''}`}
        >
          {channel}
        </BrassPlate>
        <span
          aria-hidden="true"
          className={`hidden h-8 min-w-4 flex-1 rounded-[3px] bg-[repeating-linear-gradient(90deg,#160e08_0_2px,#4a3120_2px_5px)] shadow-[inset_0_1px_3px_rgb(0_0_0/0.8),0_1px_0_rgb(255_255_255/0.07)] sm:block ${
            side
              ? 'phone-landscape:h-auto phone-landscape:w-full phone-landscape:bg-[repeating-linear-gradient(0deg,#160e08_0_2px,#4a3120_2px_5px)]'
              : ''
          }`}
        />
        {controls && (
          <div
            className={
              side
                ? 'ml-auto flex shrink-0 gap-1.5 phone-landscape:ml-0 phone-landscape:w-full phone-landscape:flex-col'
                : 'flex w-full gap-2 sm:w-auto sm:min-w-48 sm:shrink-0'
            }
          >
            {controls}
          </div>
        )}
      </div>
    </StreetBoard>
  );
}
